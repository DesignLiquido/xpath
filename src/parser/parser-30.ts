/**
 * XPath 3.0 Parser
 *
 * Extends XPath20Parser to add support for XPath 3.0 features:
 * - Let expressions: let $x := expr, $y := expr return expr
 * - Simple map operator: expr ! expr
 * - String concatenation operator: expr || expr
 * - Arrow operator: expr => func(args)
 * - Named function references: fn:name#arity
 * - Inline functions: function($x) { $x + 1 }
 * - EQNames with URI literals: Q{uri}local
 *
 * Reference: https://www.w3.org/TR/xpath-30/
 */

import {
    XPathExpression,
    XPathFunctionCall,
    XPathNumberLiteral,
    XPathVariableReference,
    CommaExpression,
} from "../expressions";
import { XPathLetExpression, XPathLetBinding } from "../expressions/let-expression";
import { XPathSimpleMapExpression } from "../expressions/simple-map-expression";
import { XPathStringConcatExpression } from "../expressions/string-concat-expression";
import { XPathArrowExpression } from "../expressions/arrow-expression";
import { XPathNamedFunctionRef } from "../expressions/named-function-ref-expression";
import { XPathInlineFunctionExpression, InlineFunctionParameter } from "../expressions/inline-function-expression";
import { XPathDynamicFunctionCall } from "../expressions/dynamic-function-call-expression";
import { XPathBaseParserOptions } from "../xslt-extensions";
import { XPath20Parser } from "./parser-20";
import { SequenceType, OccurrenceIndicator, createAtomicSequenceType, createItemSequenceType, ITEM_TYPE, getAtomicType, createEmptySequenceType } from "../types";
import { grammarViolation } from "../errors";

export class XPath30Parser extends XPath20Parser {
    constructor(options?: XPathBaseParserOptions) {
        // Default to XPath 3.0 if no version specified
        const opts = options ? { ...options } : {};
        if (!opts.version) {
            opts.version = '3.0';
        }
        super(opts);
        this.ensureVersionSupport(['3.0', '3.1'], '3.0');
    }

    /**
     * Override parseExpr to handle:
     * 1. Let expressions: let $x := expr return expr
     * 2. Sequence construction: expr, expr, expr (comma operator)
     */
    protected parseExpr(): XPathExpression {
        // Let expression: let $x := expr, $y := expr return expr
        if (this.checkReservedWordInternal('let')) {
            return this.parseLetExpr();
        }

        // Parse the first expression
        const first = this.parseExprSingle();

        // Check for comma (sequence construction)
        if (this.check('COMMA')) {
            const operands: XPathExpression[] = [first];
            while (this.match('COMMA')) {
                operands.push(this.parseExprSingle());
            }
            return new CommaExpression(operands);
        }

        return first;
    }

    /**
     * Parse a single expression (not comma-separated).
     */
    private parseExprSingle(): XPathExpression {
        return super.parseExpr();
    }

    /**
     * Override parseAdditiveExpr to insert string concatenation (||) parsing.
     * Precedence: || is between comparison and additive
     */
    protected parseAdditiveExpr(): XPathExpression {
        let left = this.parseStringConcatExpr();

        while (this.match('PLUS', 'MINUS')) {
            const operator = this.previous().lexeme as '+' | '-';
            const right = this.parseStringConcatExpr();
            left = new (require('../expressions').XPathArithmeticExpression)(left, right, operator);
        }

        return left;
    }

    /**
     * Parse string concatenation expression (||).
     * Syntax: expr || expr
     */
    private parseStringConcatExpr(): XPathExpression {
        let left = this.parseMultiplicativeExpr();

        while (this.match('CONCAT')) {
            const right = this.parseMultiplicativeExpr();
            left = new XPathStringConcatExpression(left, right);
        }

        return left;
    }

    /**
     * Override parseUnionExpr to insert simple map operator (!) parsing.
     * Precedence: ! is just above union (|)
     */
    protected parseUnionExpr(): XPathExpression {
        let left = this.parseSimpleMapExpr();

        while (this.match('PIPE')) {
            const right = this.parseSimpleMapExpr();
            left = new (require('../expressions').XPathUnionExpression)(left, right);
        }

        return left;
    }

    /**
     * Parse simple map expression (!).
     * Syntax: expr ! expr
     * Evaluates left expression, then for each item evaluates right with that item as context.
     */
    private parseSimpleMapExpr(): XPathExpression {
        // First parse what would normally be the instance-of level (from XPath 2.0)
        let left = this.parseInstanceOfExprInternal();

        while (this.match('SIMPLE_MAP')) {
            const right = this.parseInstanceOfExprInternal();
            left = new XPathSimpleMapExpression(left, right);
        }

        return left;
    }

    /**
     * Internal method to parse instance-of expression level.
     * This replaces the protected method from XPath20Parser for our precedence chain.
     */
    private parseInstanceOfExprInternal(): XPathExpression {
        let expr = this.parseTreatExprInternal();

        if (this.checkReservedWordInternal('instance')) {
            this.advance();
            this.consumeReservedWordInternal('of', "Expected 'of' after 'instance'");
            const sequenceType = this.parseSequenceTypeInternal();
            expr = new (require('../expressions').XPathInstanceOfExpression)(expr, sequenceType);
        }

        return expr;
    }

    /**
     * Internal method to parse treat expression level.
     */
    private parseTreatExprInternal(): XPathExpression {
        let expr = this.parseCastableExprInternal();

        if (this.checkReservedWordInternal('treat')) {
            this.advance();
            this.consumeReservedWordInternal('as', "Expected 'as' after 'treat'");
            const sequenceType = this.parseSequenceTypeInternal();
            expr = new (require('../expressions').XPathTreatExpression)(expr, sequenceType);
        }

        return expr;
    }

    /**
     * Internal method to parse castable expression level.
     */
    private parseCastableExprInternal(): XPathExpression {
        let expr = this.parseArrowExpr();

        if (this.checkReservedWordInternal('castable')) {
            this.advance();
            this.consumeReservedWordInternal('as', "Expected 'as' after 'castable'");
            const sequenceType = this.parseSequenceTypeInternal();
            expr = new (require('../expressions').XPathCastableExpression)(expr, sequenceType);
        }

        return expr;
    }

    /**
     * Parse arrow expression (=>).
     * Syntax: expr => func(args) => func2(args)
     * $x => f($y) is equivalent to f($x, $y)
     */
    private parseArrowExpr(): XPathExpression {
        let left = this.parsePathExpr();

        while (this.match('FAT_ARROW')) {
            // Parse function name or variable reference
            let funcExpr: XPathExpression;
            let args: XPathExpression[] = [];

            if (this.check('DOLLAR')) {
                // Variable reference to a function item: $f => ...
                this.advance();
                const varName = this.consume('IDENTIFIER', 'Expected variable name after $').lexeme;
                funcExpr = new XPathVariableReference(varName);

                // Arguments in parentheses (use parseExprSingle to avoid comma being treated as sequence)
                this.consume('OPEN_PAREN', "Expected '(' after function variable in arrow expression");
                if (!this.check('CLOSE_PAREN')) {
                    do {
                        args.push(this.parseExprSingle());
                    } while (this.match('COMMA'));
                }
                this.consume('CLOSE_PAREN', "Expected ')' after arrow expression arguments");

                // Dynamic function call with left as first argument
                left = new XPathDynamicFunctionCall(funcExpr, [left, ...args]);
            } else {
                // Named function call
                let name = this.advance().lexeme;

                // Check for QName (prefix:localname)
                if (this.match('COLON')) {
                    const local = this.advance();
                    name = `${name}:${local.lexeme}`;
                }

                // Arguments in parentheses (use parseExprSingle to avoid comma being treated as sequence)
                this.consume('OPEN_PAREN', "Expected '(' after function name in arrow expression");
                if (!this.check('CLOSE_PAREN')) {
                    do {
                        args.push(this.parseExprSingle());
                    } while (this.match('COMMA'));
                }
                this.consume('CLOSE_PAREN', "Expected ')' after arrow expression arguments");

                // Create function call with left expression as first argument
                left = new XPathArrowExpression(left, name, args);
            }
        }

        return left;
    }

    /**
     * Override parseFunctionCall to use parseExprSingle for arguments.
     * 
     * In XPath 3.0, function arguments are ExprSingle, not Expr.
     * This means commas in arguments don't create sequences at the function level.
     * For example: concat("Hello ", $name) should parse as two arguments,
     * not one argument that is a sequence of two items.
     */
    protected parseFunctionCall(): XPathExpression {
        let name = this.advance().lexeme;

        if (this.match('COLON')) {
            const local = this.advance();
            name = `${name}:${local.lexeme}`;
        }

        this.consume('OPEN_PAREN', "Expected '(' after function name");

        const args: XPathExpression[] = [];

        if (!this.check('CLOSE_PAREN')) {
            do {
                // Use parseExprSingle to avoid treating comma as sequence operator
                args.push(this.parseExprSingle());
            } while (this.match('COMMA'));
        }

        this.consume('CLOSE_PAREN', "Expected ')' after function arguments");

        return new XPathFunctionCall(name, args);
    }

    /**
     * Override parsePrimaryExpr to handle:
     * - Variable references with any name (including function names like 'name')
     * - Named function references (fn:name#arity)
     * - Inline functions (function($x) { expr })
     */
    protected parsePrimaryExpr(): XPathExpression {
        // Variable reference: $name (allow any name token, not just IDENTIFIER)
        if (this.match('DOLLAR')) {
            const nameToken = this.consumeNameTokenInternal('Expected variable name after $');
            return new XPathVariableReference(nameToken.lexeme);
        }

        // Inline function: function($x, $y) { expr }
        if (this.checkReservedWordInternal('function')) {
            return this.parseInlineFunction();
        }

        // Check for named function reference (name#arity)
        if (this.isFunctionRefStart()) {
            return this.parseNamedFunctionRef();
        }

        return super.parsePrimaryExpr();
    }

    /**
     * Override isStepStart to exclude function references.
     * In XPath 3.0, name#arity is a function reference, not a location step.
     */
    protected isStepStart(): boolean {
        // If it looks like a function reference, it's not a step
        if (this.isFunctionRefStart()) {
            return false;
        }
        
        return super.isStepStart();
    }

    /**
     * Override parseFilterExpr to handle dynamic function calls.
     * In XPath 3.0, any primary expression followed by '(' is a dynamic function call.
     * Syntax: $func(args), (inline-function)(args), etc.
     */
    protected parseFilterExpr(): XPathExpression {
        let expr = this.parsePrimaryExpr();

        // Check for dynamic function call: expr(args)
        // This handles cases like $func(args) where $func is a function item
        // Note: parsePrimaryExpr already handles normal function calls (name(...))
        // so if we see '(' here, it must be a dynamic call
        if (this.check('OPEN_PAREN')) {
            // It's a dynamic function call
            this.advance(); // consume '('
            
            const args: XPathExpression[] = [];
            if (!this.check('CLOSE_PAREN')) {
                do {
                    args.push(this.parseExprSingle());
                } while (this.match('COMMA'));
            }
            
            this.consume('CLOSE_PAREN', "Expected ')' after function arguments");
            expr = new XPathDynamicFunctionCall(expr, args);
        }

        // Collect all predicates
        const predicates: XPathExpression[] = [];
        while (this.check('OPEN_SQUARE_BRACKET')) {
            predicates.push(...this.parsePredicates());
        }

        // If there are predicates, wrap in filter expression
        if (predicates.length > 0) {
            const XPathFilterExpression = require('../expressions').XPathFilterExpression;
            return new XPathFilterExpression(expr, predicates);
        }

        return expr;
    }

    /**
     * Check if this looks like a function reference (name#arity).
     * Handles names with hyphens like upper-case#1 or prefix:upper-case#1
     */
    private isFunctionRefStart(): boolean {
        if (this.isAtEnd()) return false;

        const token = this.peek();
        // Check for identifier/function/operator/location that could start a QName
        if (token.type === 'IDENTIFIER' || token.type === 'FUNCTION' || token.type === 'OPERATOR' || token.type === 'LOCATION') {
            // Scan ahead to find a HASH token, allowing for:
            // name#N
            // prefix:name#N
            // upper-case#N (hyphenated names)
            // prefix:upper-case#N (hyphenated local names)
            
            let lookAhead = 1;
            let foundHash = false;

            while (lookAhead < this.tokens.length - this.current) {
                const tok = this.tokens[this.current + lookAhead];
                
                if (!tok) break;
                
                // Stop if we hit HASH - that's what we're looking for
                if (tok.type === 'HASH') {
                    foundHash = true;
                    break;
                }
                
                // Allow: hyphens, colons, and name tokens (IDENTIFIER, FUNCTION, OPERATOR, LOCATION, NODE_TYPE)
                const isValidQNameChar = tok.type === 'MINUS' ||
                                        tok.type === 'COLON' ||
                                        tok.type === 'IDENTIFIER' ||
                                        tok.type === 'FUNCTION' ||
                                        tok.type === 'OPERATOR' ||
                                        tok.type === 'LOCATION' ||
                                        tok.type === 'NODE_TYPE';
                
                if (isValidQNameChar) {
                    lookAhead++;
                } else {
                    // Stop if we hit something else
                    break;
                }
            }

            return foundHash;
        }

        return false;
    }

    /**
     * Parse named function reference: fn:name#arity or upper-case#arity
     * Handles hyphenated names and QNames.
     */
    private parseNamedFunctionRef(): XPathExpression {
        let name = this.advance().lexeme;

        // Build the full QName, handling hyphens and colons
        while (!this.isAtEnd() && !this.check('HASH')) {
            if (this.match('MINUS') || this.match('COLON')) {
                // match() has already advanced past the operator
                const op = this.previous().lexeme;
                // Peek at the next identifier and include it
                const nextToken = this.peek();
                if (nextToken && (nextToken.type === 'IDENTIFIER' || nextToken.type === 'FUNCTION' ||
                                  nextToken.type === 'OPERATOR' || nextToken.type === 'LOCATION' ||
                                  nextToken.type === 'NODE_TYPE')) {
                    this.advance();
                    name = `${name}${op}${nextToken.lexeme}`;
                } else {
                    throw grammarViolation(`Expected name after '${op}' in function reference`);
                }
            } else {
                break;
            }
        }

        // Consume #
        this.consume('HASH', "Expected '#' in function reference");

        // Parse arity (must be a number)
        const arityToken = this.consume('NUMBER', "Expected arity number after '#'");
        const arity = parseInt(arityToken.lexeme, 10);

        if (isNaN(arity) || arity < 0) {
            throw grammarViolation(`Invalid function arity: ${arityToken.lexeme}`);
        }

        return new XPathNamedFunctionRef(name, arity);
    }

    /**
     * Parse inline function: function($x as xs:integer, $y) as xs:integer { $x + $y }
     */
    private parseInlineFunction(): XPathExpression {
        this.advance(); // consume 'function'
        this.consume('OPEN_PAREN', "Expected '(' after 'function'");

        // Parse parameters
        const params: InlineFunctionParameter[] = [];
        if (!this.check('CLOSE_PAREN')) {
            do {
                this.consume('DOLLAR', "Expected '$' before parameter name");
                const paramName = this.consume('IDENTIFIER', "Expected parameter name").lexeme;

                // Optional type annotation
                let paramType: SequenceType | undefined;
                if (this.checkReservedWordInternal('as')) {
                    this.advance();
                    paramType = this.parseSequenceTypeInternal();
                }

                params.push({ name: paramName, type: paramType });
            } while (this.match('COMMA'));
        }
        this.consume('CLOSE_PAREN', "Expected ')' after function parameters");

        // Optional return type
        let returnType: SequenceType | undefined;
        if (this.checkReservedWordInternal('as')) {
            this.advance();
            returnType = this.parseSequenceTypeInternal();
        }

        // Function body in curly braces
        this.consume('OPEN_CURLY_BRACKET', "Expected '{' before function body");
        const body = this.parseExpr();
        this.consume('CLOSE_CURLY_BRACKET', "Expected '}' after function body");

        return new XPathInlineFunctionExpression(params, body, returnType);
    }

    /**
     * Parse let expression: let $x := expr, $y := expr return expr
     */
    private parseLetExpr(): XPathExpression {
        this.consumeReservedWordInternal('let', "Expected 'let'");

        const bindings: XPathLetBinding[] = [];
        do {
            bindings.push(this.parseLetBinding());
        } while (this.match('COMMA'));

        this.consumeReservedWordInternal('return', "Expected 'return' in let expression");
        const returnExpr = this.parseExpr();

        return new XPathLetExpression(bindings, returnExpr);
    }

    /**
     * Parse a single let binding: $x := expr
     */
    private parseLetBinding(): XPathLetBinding {
        this.consume('DOLLAR', "Expected '$' before variable name in let binding");
        // Variable name can be any name token (including function names like 'name', 'string', etc.)
        const nameToken = this.consumeNameTokenInternal("Expected variable name in let binding");
        const name = nameToken.lexeme;

        // Optional type annotation
        let type: SequenceType | undefined;
        if (this.checkReservedWordInternal('as')) {
            this.advance();
            type = this.parseSequenceTypeInternal();
        }

        this.consume('ASSIGNMENT', "Expected ':=' after variable name in let binding");
        // Use parseExprSingle to avoid consuming commas that separate bindings
        const expression = this.parseExprSingle();

        return { variable: name, expression, type };
    }

    // Helper methods

    private checkReservedWordInternal(word: string): boolean {
        return this.check('RESERVED_WORD') && this.peek().lexeme === word;
    }

    private consumeReservedWordInternal(word: string, message: string): void {
        if (this.checkReservedWordInternal(word)) {
            this.advance();
            return;
        }
        throw grammarViolation(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    /**
     * Parse sequence type for type annotations.
     */
    private parseSequenceTypeInternal(): SequenceType {
        // empty-sequence()
        if (this.checkNameInternal('empty-sequence')) {
            this.advance();
            this.consume('OPEN_PAREN', "Expected '(' after empty-sequence");
            this.consume('CLOSE_PAREN', "Expected ')' after empty-sequence");
            return createEmptySequenceType();
        }

        // item()
        if (this.checkNameInternal('item')) {
            this.advance();
            this.consume('OPEN_PAREN', "Expected '(' after item");
            this.consume('CLOSE_PAREN', "Expected ')' after item()");
            const occurrence = this.parseOccurrenceIndicatorInternal();
            return createItemSequenceType(ITEM_TYPE, occurrence);
        }

        // function(...) type - simplified handling
        if (this.checkReservedWordInternal('function')) {
            this.advance();
            this.consume('OPEN_PAREN', "Expected '(' after function");
            // Skip function signature for now (can be complex)
            let parenCount = 1;
            while (parenCount > 0 && !this.isAtEnd()) {
                if (this.match('OPEN_PAREN')) parenCount++;
                else if (this.match('CLOSE_PAREN')) parenCount--;
                else this.advance();
            }
            const occurrence = this.parseOccurrenceIndicatorInternal();
            // Return item type for now - full function type support would need more work
            return createItemSequenceType(ITEM_TYPE, occurrence);
        }

        // Atomic type name
        const qname = this.parseQNameInternal();
        const occurrence = this.parseOccurrenceIndicatorInternal();

        const localName = this.stripPrefixInternal(qname);
        const atomicType = getAtomicType(localName);
        if (!atomicType) {
            throw grammarViolation(`Unknown atomic type: ${qname}`);
        }

        return createAtomicSequenceType(atomicType, occurrence);
    }

    private parseOccurrenceIndicatorInternal(): OccurrenceIndicator {
        if (this.match('QUESTION')) return OccurrenceIndicator.ZERO_OR_ONE;
        if (this.match('ASTERISK')) return OccurrenceIndicator.ZERO_OR_MORE;
        if (this.match('PLUS')) return OccurrenceIndicator.ONE_OR_MORE;
        return OccurrenceIndicator.EXACTLY_ONE;
    }

    private parseQNameInternal(): string {
        const first = this.consumeNameTokenInternal('Expected type name');
        if (this.match('COLON')) {
            const local = this.consumeNameTokenInternal('Expected local name after :').lexeme;
            return `${first.lexeme}:${local}`;
        }
        return first.lexeme;
    }

    private stripPrefixInternal(qname: string): string {
        const parts = qname.split(':');
        return parts.length === 2 ? parts[1] : parts[0];
    }

    private consumeNameTokenInternal(message: string) {
        if (this.isNameTokenInternal()) {
            return this.advance();
        }
        throw grammarViolation(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    private isNameTokenInternal(): boolean {
        if (this.isAtEnd()) return false;
        const type = this.peek().type;
        return type === 'IDENTIFIER' || type === 'FUNCTION' || type === 'NODE_TYPE' ||
               type === 'OPERATOR' || type === 'LOCATION' || type === 'RESERVED_WORD';
    }

    private checkNameInternal(name: string): boolean {
        return this.isNameTokenInternal() && this.peek().lexeme === name;
    }
}
