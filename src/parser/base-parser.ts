import { XPathToken } from '../lexer/token';
import { TokenType } from '../lexer/token-type';
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
    FilteredPathExpression,
    EmptySequenceExpression,
} from '../expressions';
import { XSLTExtensions, XPathBaseParserOptions, validateExtensions } from '../xslt-extensions';
import { XPathVersion } from '../xpath-version';

/**
 * Recursive descent parser shared by XPath 1.0+ implementations.
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
export abstract class XPathBaseParser {
    protected tokens: XPathToken[] = [];
    protected current: number = 0;
    protected extensions?: XSLTExtensions;
    protected options: XPathBaseParserOptions;

    /**
     * Create a new XPath parser.
     * 
     * @param options Optional parser configuration including XSLT extensions
     */
    protected constructor(options?: XPathBaseParserOptions) {
        this.options = {
            strict: options?.strict ?? true,
            version: options?.version,
            cache: options?.cache,
            extensions: options?.extensions,
        };

        if (this.options.extensions) {
            const errors = validateExtensions(this.options.extensions);
            if (errors.length > 0) {
                throw new Error(`Invalid XSLT extensions: ${errors.join(', ')}`);
            }
            this.extensions = this.options.extensions;
        }
    }

    /**
     * Enforce the supported XPath versions for a concrete parser.
     */
    protected ensureVersionSupport(supportedVersions: XPathVersion[], defaultVersion: XPathVersion): void {
        const resolvedVersion = this.options.version ?? defaultVersion;
        this.options.version = resolvedVersion;

        if (this.options.strict !== false && !supportedVersions.includes(resolvedVersion)) {
            throw new Error(
                `XPath version ${resolvedVersion} is not supported by ${this.constructor.name}. ` +
                `Supported versions: ${supportedVersions.join(', ')}`
            );
        }
    }

    /**
     * Get the parser options.
     */
    getOptions(): Readonly<XPathBaseParserOptions> {
        return this.options;
    }

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

    protected peek(): XPathToken {
        return this.tokens[this.current];
    }

    protected peekNext(): XPathToken | undefined {
        return this.tokens[this.current + 1];
    }

    protected previous(): XPathToken {
        return this.tokens[this.current - 1];
    }

    protected isAtEnd(): boolean {
        return this.current >= this.tokens.length;
    }

    protected advance(): XPathToken {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    protected check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    protected checkLexeme(lexeme: string): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().lexeme === lexeme;
    }

    protected match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    protected consume(type: TokenType, message: string): XPathToken {
        if (this.check(type)) return this.advance();
        throw new Error(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    // ==================== Expression Parsing ====================

    protected parseExpr(): XPathExpression {
        return this.parseOrExpr();
    }

    protected parseOrExpr(): XPathExpression {
        let left = this.parseAndExpr();

        while (this.check('OPERATOR') && this.peek().lexeme === 'or') {
            this.advance();
            const right = this.parseAndExpr();
            left = new XPathLogicalExpression(left, right, 'or');
        }

        return left;
    }

    protected parseAndExpr(): XPathExpression {
        let left = this.parseEqualityExpr();

        while (this.check('OPERATOR') && this.peek().lexeme === 'and') {
            this.advance();
            const right = this.parseEqualityExpr();
            left = new XPathLogicalExpression(left, right, 'and');
        }

        return left;
    }

    protected parseEqualityExpr(): XPathExpression {
        let left = this.parseRelationalExpr();

        while (this.match('EQUALS', 'NOT_EQUALS')) {
            const operator = this.previous().lexeme;
            const right = this.parseRelationalExpr();
            left = new XPathBinaryExpression(left, right, operator);
        }

        return left;
    }

    protected parseRelationalExpr(): XPathExpression {
        let left = this.parseAdditiveExpr();

        while (this.match('LESS_THAN', 'GREATER_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL')) {
            const operator = this.previous().lexeme;
            const right = this.parseAdditiveExpr();
            left = new XPathBinaryExpression(left, right, operator);
        }

        return left;
    }

    protected parseAdditiveExpr(): XPathExpression {
        let left = this.parseMultiplicativeExpr();

        while (this.match('PLUS', 'MINUS')) {
            const operator = this.previous().lexeme as ArithmeticOperator;
            const right = this.parseMultiplicativeExpr();
            left = new XPathArithmeticExpression(left, right, operator);
        }

        return left;
    }

    protected parseMultiplicativeExpr(): XPathExpression {
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

    protected parseUnaryExpr(): XPathExpression {
        if (this.match('MINUS')) {
            const operand = this.parseUnaryExpr();
            return new XPathUnaryExpression('-', operand);
        }

        return this.parseUnionExpr();
    }

    protected parseUnionExpr(): XPathExpression {
        let left = this.parsePathExpr();

        while (this.match('PIPE')) {
            const right = this.parsePathExpr();
            left = new XPathUnionExpression(left, right);
        }

        return left;
    }

    // ==================== Path Expression Parsing ====================

    protected parsePathExpr(): XPathExpression {
        // Check if this starts a location path
        if (this.check('SLASH') || this.check('DOUBLE_SLASH')) {
            return this.parseLocationPath();
        }

        // Check for axis or abbreviated step that starts a relative location path
        if (this.isStepStart()) {
            return this.parseLocationPath();
        }

        // Otherwise it's a filter expression (possibly followed by path)
        let expr = this.parseFilterExpr();

        // Check if followed by '/' or '//'
        if (this.match('SLASH', 'DOUBLE_SLASH')) {
            const isDescendant = this.previous().type === 'DOUBLE_SLASH';
            const steps = this.parseRelativeLocationPath();

            if (isDescendant) {
                // Insert descendant-or-self::node() step
                steps.unshift(new XPathStep('descendant-or-self', { type: 'node-type', nodeType: 'node' }));
            }

            // Create a composite expression: evaluate filter expr, then apply location path to each result
            const locationPath = new XPathLocationPath(steps, false);
            return new FilteredPathExpression(expr, locationPath);
        }

        return expr;
    }

    protected isStepStart(): boolean {
        if (this.isAtEnd()) return false;

        // Don't treat QName function calls as location steps
        if (this.isFunctionCallStart()) return false;

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
        // OPERATOR tokens (div, mod, and, or) can also be element names
        // FUNCTION tokens (id, count, etc.) can also be element/attribute names
        if (token.type === 'IDENTIFIER' || token.type === 'OPERATOR' || token.type === 'FUNCTION') {
            const next = this.peekNext();
            // It's a step if not followed by '(' (which would make it a function call)
            return !next || next.type !== 'OPEN_PAREN';
        }

        return false;
    }

    protected parseLocationPath(): XPathExpression {
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

    protected parseRelativeLocationPath(): XPathStep[] {
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

    protected parseStep(): XPathStep {
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

    protected parseNodeTest(): NodeTest {
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

        // Name test - can be IDENTIFIER, LOCATION (axis names), FUNCTION (function names), NODE_TYPE,
        // or OPERATOR (div, mod, and, or can be element names too)
        // All of these can be used as element names in XPath
        if (this.check('IDENTIFIER') || this.check('LOCATION') || this.check('FUNCTION') ||
            this.check('NODE_TYPE') || this.check('OPERATOR')) {
            const name = this.advance().lexeme;

            // Check for namespace prefix
            if (this.match('COLON')) {
                if (this.match('ASTERISK')) {
                    // prefix:* - match any element in namespace
                    return { type: 'wildcard', name: `${name}:*` };
                }
                // Local name can also be any of these token types
                if (this.check('IDENTIFIER') || this.check('LOCATION') || this.check('FUNCTION') ||
                    this.check('NODE_TYPE') || this.check('OPERATOR')) {
                    const localName = this.advance().lexeme;
                    return { type: 'name', name: `${name}:${localName}` };
                }
                throw new Error('Expected local name after namespace prefix');
            }

            return { type: 'name', name };
        }

        throw new Error(`Expected node test, got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    protected parsePredicates(): XPathExpression[] {
        const predicates: XPathExpression[] = [];

        while (this.match('OPEN_SQUARE_BRACKET')) {
            const expr = this.parseExpr();
            this.consume('CLOSE_SQUARE_BRACKET', "Expected ']' after predicate");
            predicates.push(new XPathPredicate(expr));
        }

        return predicates;
    }

    // ==================== Filter Expression Parsing ====================

    protected parseFilterExpr(): XPathExpression {
        let expr = this.parsePrimaryExpr();

        // Collect all predicates
        const predicates: XPathExpression[] = [];
        while (this.check('OPEN_SQUARE_BRACKET')) {
            predicates.push(...this.parsePredicates());
        }

        // If there are predicates, wrap in filter expression
        if (predicates.length > 0) {
            return new XPathFilterExpression(expr, predicates);
        }

        return expr;
    }

    protected parsePrimaryExpr(): XPathExpression {
        // Variable reference: $name
        if (this.match('DOLLAR')) {
            const name = this.consume('IDENTIFIER', 'Expected variable name after $').lexeme;
            return new XPathVariableReference(name);
        }

        // Parenthesized expression
        if (this.match('OPEN_PAREN')) {
            // Allow empty parentheses to represent the empty sequence in XPath 2.0
            if (this.check('CLOSE_PAREN')) {
                this.advance();
                return new EmptySequenceExpression();
            }

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

        // Function call (supports QName prefixes)
        if (this.isFunctionCallStart()) {
            return this.parseFunctionCall();
        }

        throw new Error(`Unexpected token in primary expression: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    protected parseFunctionCall(): XPathExpression {
        let name = this.advance().lexeme;

        if (this.match('COLON')) {
            const local = this.advance();
            if (!this.isNcNameToken(local.type)) {
                throw new Error('Expected local name after function prefix');
            }
            name = `${name}:${local.lexeme}`;
        }

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

    private isFunctionCallStart(): boolean {
        if (this.isAtEnd()) return false;

        const first = this.peek();
        const second = this.peekNext();

        // Simple function name followed by '(' (exclude node-type tests)
        if (this.isFunctionNameToken(first.type) && second?.type === 'OPEN_PAREN') {
            return true;
        }

        // QName: prefix:local followed by '(' (exclude node-type tokens)
        if (this.isFunctionNameToken(first.type) && second?.type === 'COLON') {
            const local = this.tokens[this.current + 2];
            const afterLocal = this.tokens[this.current + 3];
            if (local && this.isFunctionNameToken(local.type) && afterLocal?.type === 'OPEN_PAREN') {
                return true;
            }
        }

        return false;
    }

    private isFunctionNameToken(type: TokenType | undefined): boolean {
        // NODE_TYPE tokens (node, text, comment, processing-instruction) are reserved for node tests, not functions
        return type === 'IDENTIFIER' || type === 'FUNCTION' || type === 'OPERATOR' || type === 'LOCATION';
    }

    private isNcNameToken(type: TokenType | undefined): boolean {
        // Allow any token kinds that can represent NCName parts (prefix/local), including node-type tokens for QNames
        return type === 'IDENTIFIER' || type === 'FUNCTION' || type === 'OPERATOR' || type === 'LOCATION' || type === 'NODE_TYPE';
    }
}
