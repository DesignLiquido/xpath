import { XPathToken } from './lexer/token';
import { TokenType } from './lexer/token-type';
import {
    XPathExpression,
    XPathStringLiteral,
    XPathNumberLiteral,
    XPathVariableReference,
    XPathUnaryExpression,
    XPathArithmeticExpression,
    ArithmeticOperator,
    XPathBinaryExpression,
    XPathLogicalExpression,
    XPathFunctionCall,
    XPathStep,
    AxisType,
    NodeTest,
    XPathPredicate,
    XPathLocationPath,
    XPathFilterExpression,
    XPathUnionExpression,
} from './expressions';

/**
 * Recursive descent parser for XPath 1.0 expressions.
 *
 * Grammar (simplified):
 *   Expr           ::= OrExpr
 *   OrExpr         ::= AndExpr ('or' AndExpr)*
 *   AndExpr        ::= EqualityExpr ('and' EqualityExpr)*
 *   EqualityExpr   ::= RelationalExpr (('=' | '!=') RelationalExpr)*
 *   RelationalExpr ::= AdditiveExpr (('<' | '>' | '<=' | '>=') AdditiveExpr)*
 *   AdditiveExpr   ::= MultiplicativeExpr (('+' | '-') MultiplicativeExpr)*
 *   MultiplicativeExpr ::= UnaryExpr (('*' | 'div' | 'mod') UnaryExpr)*
 *   UnaryExpr      ::= '-'* UnionExpr
 *   UnionExpr      ::= PathExpr ('|' PathExpr)*
 *   PathExpr       ::= LocationPath | FilterExpr (('/' | '//') RelativeLocationPath)?
 *   FilterExpr     ::= PrimaryExpr Predicate*
 *   PrimaryExpr    ::= VariableReference | '(' Expr ')' | Literal | Number | FunctionCall
 *   LocationPath   ::= RelativeLocationPath | AbsoluteLocationPath
 *   Step           ::= AxisSpecifier NodeTest Predicate* | AbbreviatedStep
 *   Predicate      ::= '[' Expr ']'
 */
export class XPathParser {
    private tokens: XPathToken[] = [];
    private current: number = 0;

    parse(tokens: XPathToken[]): XPathExpression {
        this.tokens = tokens;
        this.current = 0;

        if (tokens.length === 0) {
            throw new Error('Empty expression');
        }

        const expr = this.parseExpr();

        if (!this.isAtEnd()) {
            throw new Error(`Unexpected token: ${this.peek().lexeme}`);
        }

        return expr;
    }

    // ==================== Token Management ====================

    private peek(): XPathToken {
        return this.tokens[this.current];
    }

    private peekNext(): XPathToken | undefined {
        return this.tokens[this.current + 1];
    }

    private previous(): XPathToken {
        return this.tokens[this.current - 1];
    }

    private isAtEnd(): boolean {
        return this.current >= this.tokens.length;
    }

    private advance(): XPathToken {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private checkLexeme(lexeme: string): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().lexeme === lexeme;
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private consume(type: TokenType, message: string): XPathToken {
        if (this.check(type)) return this.advance();
        throw new Error(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    // ==================== Expression Parsing ====================

    private parseExpr(): XPathExpression {
        return this.parseOrExpr();
    }

    private parseOrExpr(): XPathExpression {
        let left = this.parseAndExpr();

        while (this.check('OPERATOR') && this.peek().lexeme === 'or') {
            this.advance();
            const right = this.parseAndExpr();
            left = new XPathLogicalExpression(left, right, 'or');
        }

        return left;
    }

    private parseAndExpr(): XPathExpression {
        let left = this.parseEqualityExpr();

        while (this.check('OPERATOR') && this.peek().lexeme === 'and') {
            this.advance();
            const right = this.parseEqualityExpr();
            left = new XPathLogicalExpression(left, right, 'and');
        }

        return left;
    }

    private parseEqualityExpr(): XPathExpression {
        let left = this.parseRelationalExpr();

        while (this.match('EQUALS', 'NOT_EQUALS')) {
            const operator = this.previous().lexeme;
            const right = this.parseRelationalExpr();
            left = new XPathBinaryExpression(left, right, operator);
        }

        return left;
    }

    private parseRelationalExpr(): XPathExpression {
        let left = this.parseAdditiveExpr();

        while (this.match('LESS_THAN', 'GREATER_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL')) {
            const operator = this.previous().lexeme;
            const right = this.parseAdditiveExpr();
            left = new XPathBinaryExpression(left, right, operator);
        }

        return left;
    }

    private parseAdditiveExpr(): XPathExpression {
        let left = this.parseMultiplicativeExpr();

        while (this.match('PLUS', 'MINUS')) {
            const operator = this.previous().lexeme as ArithmeticOperator;
            const right = this.parseMultiplicativeExpr();
            left = new XPathArithmeticExpression(left, right, operator);
        }

        return left;
    }

    private parseMultiplicativeExpr(): XPathExpression {
        let left = this.parseUnaryExpr();

        while (true) {
            if (this.match('ASTERISK')) {
                const right = this.parseUnaryExpr();
                left = new XPathArithmeticExpression(left, right, '*');
            } else if (this.check('OPERATOR') && (this.peek().lexeme === 'div' || this.peek().lexeme === 'mod')) {
                const operator = this.advance().lexeme as ArithmeticOperator;
                const right = this.parseUnaryExpr();
                left = new XPathArithmeticExpression(left, right, operator);
            } else {
                break;
            }
        }

        return left;
    }

    private parseUnaryExpr(): XPathExpression {
        if (this.match('MINUS')) {
            const operand = this.parseUnaryExpr();
            return new XPathUnaryExpression('-', operand);
        }

        return this.parseUnionExpr();
    }

    private parseUnionExpr(): XPathExpression {
        let left = this.parsePathExpr();

        while (this.match('PIPE')) {
            const right = this.parsePathExpr();
            left = new XPathUnionExpression(left, right);
        }

        return left;
    }

    // ==================== Path Expression Parsing ====================

    private parsePathExpr(): XPathExpression {
        // Check if this starts a location path
        if (this.check('SLASH') || this.check('DOUBLE_SLASH')) {
            return this.parseLocationPath();
        }

        // Check for axis or abbreviated step that starts a relative location path
        if (this.isStepStart()) {
            return this.parseLocationPath();
        }

        // Otherwise it's a filter expression (possibly followed by path)
        const filterExpr = this.parseFilterExpr();

        // Check if followed by '/' or '//'
        if (this.match('SLASH', 'DOUBLE_SLASH')) {
            const isDescendant = this.previous().type === 'DOUBLE_SLASH';
            const steps = this.parseRelativeLocationPath();

            if (isDescendant) {
                // Insert descendant-or-self::node() step
                steps.unshift(new XPathStep('descendant-or-self', { type: 'node-type', nodeType: 'node' }));
            }

            // Combine filter expression with location path
            // The filter expression becomes the context for the path
            return new XPathFilterExpression(filterExpr, new XPathLocationPath(steps, false));
        }

        return filterExpr;
    }

    private isStepStart(): boolean {
        if (this.isAtEnd()) return false;

        const token = this.peek();

        // Abbreviated steps
        if (token.type === 'DOT' || token.type === 'DOT_DOT') return true;

        // Attribute axis abbreviation
        if (token.type === 'AT') return true;

        // Axis name followed by ::
        if (token.type === 'LOCATION') return true;

        // Node type test
        if (token.type === 'NODE_TYPE') return true;

        // Wildcard
        if (token.type === 'ASTERISK') return true;

        // Name test (identifier that's not a function call)
        if (token.type === 'IDENTIFIER') {
            const next = this.peekNext();
            // It's a step if not followed by '(' (which would make it a function call)
            return !next || next.type !== 'OPEN_PAREN';
        }

        return false;
    }

    private parseLocationPath(): XPathExpression {
        let absolute = false;
        const steps: XPathStep[] = [];

        if (this.match('SLASH')) {
            absolute = true;

            // Check if there's a relative path following
            if (!this.isAtEnd() && this.isStepStart()) {
                steps.push(...this.parseRelativeLocationPath());
            }
        } else if (this.match('DOUBLE_SLASH')) {
            absolute = true;

            // '//' is shorthand for '/descendant-or-self::node()/'
            steps.push(new XPathStep('descendant-or-self', { type: 'node-type', nodeType: 'node' }));
            steps.push(...this.parseRelativeLocationPath());
        } else {
            // Relative location path
            steps.push(...this.parseRelativeLocationPath());
        }

        return new XPathLocationPath(steps, absolute);
    }

    private parseRelativeLocationPath(): XPathStep[] {
        const steps: XPathStep[] = [];

        steps.push(this.parseStep());

        while (this.match('SLASH', 'DOUBLE_SLASH')) {
            const isDescendant = this.previous().type === 'DOUBLE_SLASH';

            if (isDescendant) {
                // '//' is shorthand for '/descendant-or-self::node()/'
                steps.push(new XPathStep('descendant-or-self', { type: 'node-type', nodeType: 'node' }));
            }

            steps.push(this.parseStep());
        }

        return steps;
    }

    private parseStep(): XPathStep {
        // Handle abbreviated steps
        if (this.match('DOT')) {
            return new XPathStep('self', { type: 'node-type', nodeType: 'node' });
        }

        if (this.match('DOT_DOT')) {
            return new XPathStep('parent', { type: 'node-type', nodeType: 'node' });
        }

        // Parse axis
        let axis: AxisType = 'child'; // default axis

        if (this.match('AT')) {
            axis = 'attribute';
        } else if (this.check('LOCATION')) {
            // Only treat as axis if followed by ::
            const next = this.peekNext();
            if (next && next.type === 'COLON_COLON') {
                axis = this.advance().lexeme as AxisType;
                this.advance(); // consume ::
            }
            // Otherwise, it's an element name that happens to match an axis name
        }

        // Parse node test
        const nodeTest = this.parseNodeTest();

        // Parse predicates
        const predicates = this.parsePredicates();

        return new XPathStep(axis, nodeTest, predicates);
    }

    private parseNodeTest(): NodeTest {
        // Wildcard
        if (this.match('ASTERISK')) {
            return { type: 'wildcard' };
        }

        // Node type test: node(), text(), comment(), processing-instruction()
        // Only if followed by '(' - otherwise it's a name test
        if (this.check('NODE_TYPE')) {
            const next = this.peekNext();
            if (next && next.type === 'OPEN_PAREN') {
                const nodeType = this.advance().lexeme as 'node' | 'text' | 'comment' | 'processing-instruction';
                this.advance(); // consume '('

                // processing-instruction can have an optional literal argument
                if (nodeType === 'processing-instruction' && this.check('STRING')) {
                    const name = this.advance().lexeme;
                    this.consume('CLOSE_PAREN', "Expected ')' after processing-instruction name");
                    return { type: 'processing-instruction', name };
                }

                this.consume('CLOSE_PAREN', "Expected ')' after node type");
                return { type: 'node-type', nodeType };
            }
            // Fall through to name test if not followed by '('
        }

        // Name test - can be IDENTIFIER, LOCATION (axis names), FUNCTION (function names), or NODE_TYPE
        // All of these can be used as element names
        if (this.check('IDENTIFIER') || this.check('LOCATION') || this.check('FUNCTION') || this.check('NODE_TYPE')) {
            const name = this.advance().lexeme;

            // Check for namespace prefix
            if (this.match('COLON')) {
                if (this.match('ASTERISK')) {
                    // prefix:* - match any element in namespace
                    return { type: 'wildcard', name: `${name}:*` };
                }
                // Local name can also be any of these token types
                if (this.check('IDENTIFIER') || this.check('LOCATION') || this.check('FUNCTION') || this.check('NODE_TYPE')) {
                    const localName = this.advance().lexeme;
                    return { type: 'name', name: `${name}:${localName}` };
                }
                throw new Error('Expected local name after namespace prefix');
            }

            return { type: 'name', name };
        }

        throw new Error(`Expected node test, got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    private parsePredicates(): XPathExpression[] {
        const predicates: XPathExpression[] = [];

        while (this.match('OPEN_SQUARE_BRACKET')) {
            const expr = this.parseExpr();
            this.consume('CLOSE_SQUARE_BRACKET', "Expected ']' after predicate");
            predicates.push(new XPathPredicate(expr));
        }

        return predicates;
    }

    // ==================== Filter Expression Parsing ====================

    private parseFilterExpr(): XPathExpression {
        let expr = this.parsePrimaryExpr();

        // Apply predicates
        while (this.check('OPEN_SQUARE_BRACKET')) {
            const predicates = this.parsePredicates();
            for (const predicate of predicates) {
                expr = new XPathFilterExpression(expr, predicate);
            }
        }

        return expr;
    }

    private parsePrimaryExpr(): XPathExpression {
        // Variable reference: $name
        if (this.match('DOLLAR')) {
            const name = this.consume('IDENTIFIER', 'Expected variable name after $').lexeme;
            return new XPathVariableReference(name);
        }

        // Parenthesized expression
        if (this.match('OPEN_PAREN')) {
            const expr = this.parseExpr();
            this.consume('CLOSE_PAREN', "Expected ')' after expression");
            return expr;
        }

        // String literal
        if (this.check('STRING')) {
            const value = this.advance().lexeme;
            return new XPathStringLiteral(value);
        }

        // Number literal
        if (this.check('NUMBER')) {
            const value = parseFloat(this.advance().lexeme);
            return new XPathNumberLiteral(value);
        }

        // Function call
        if (this.check('FUNCTION') || this.check('IDENTIFIER')) {
            const next = this.peekNext();
            if (next && next.type === 'OPEN_PAREN') {
                return this.parseFunctionCall();
            }
        }

        throw new Error(`Unexpected token in primary expression: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    private parseFunctionCall(): XPathExpression {
        const name = this.advance().lexeme;
        this.consume('OPEN_PAREN', "Expected '(' after function name");

        const args: XPathExpression[] = [];

        if (!this.check('CLOSE_PAREN')) {
            do {
                args.push(this.parseExpr());
            } while (this.match('COMMA'));
        }

        this.consume('CLOSE_PAREN', "Expected ')' after function arguments");

        return new XPathFunctionCall(name, args);
    }
}
