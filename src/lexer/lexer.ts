import { XPathToken } from './token';
import { TokenType } from './token-type';

type XPathVersion = '1.0' | '2.0' | '3.0' | '3.1';

/**
 * Configuration options for the XPath lexer.
 */
export interface XPathLexerOptions {
    /**
     * XPath specification version to use for tokenization.
     *
     * - '1.0': XPath 1.0 keywords only (and, or, div, mod, axes, node types, core functions)
     * - '2.0': Adds XPath 2.0 reserved words (if, then, else, for, return, some, every, etc.)
     * - '3.0'/'3.1': Same as 2.0 (reserved words are forward-compatible)
     *
     * Default: '1.0'
     *
     * @example
     * ```typescript
     * // XPath 1.0 lexer (treats 'if', 'then', 'else' as identifiers)
     * const lexer10 = new XPathLexer({ version: '1.0' });
     *
     * // XPath 2.0 lexer (treats 'if', 'then', 'else' as reserved words)
     * const lexer20 = new XPathLexer({ version: '2.0' });
     * ```
     */
    version?: XPathVersion;
}

/**
 * Default XPath version for the lexer.
 * Set to '1.0' for backward compatibility.
 */
const DEFAULT_LEXER_VERSION: XPathVersion = '1.0';

type ReservedWordMap = Record<string, { type: TokenType; value: string }>;

const COMMON_RESERVED_WORDS: ReservedWordMap = {
    // Location axes (XPath 1.0 complete list)
    ancestor: { type: 'LOCATION', value: 'ancestor' },
    'ancestor-or-self': { type: 'LOCATION', value: 'ancestor-or-self' },
    attribute: { type: 'LOCATION', value: 'attribute' },
    child: { type: 'LOCATION', value: 'child' },
    descendant: { type: 'LOCATION', value: 'descendant' },
    'descendant-or-self': { type: 'LOCATION', value: 'descendant-or-self' },
    following: { type: 'LOCATION', value: 'following' },
    'following-sibling': { type: 'LOCATION', value: 'following-sibling' },
    namespace: { type: 'LOCATION', value: 'namespace' },
    parent: { type: 'LOCATION', value: 'parent' },
    preceding: { type: 'LOCATION', value: 'preceding' },
    'preceding-sibling': { type: 'LOCATION', value: 'preceding-sibling' },
    self: { type: 'LOCATION', value: 'self' },

    // Node type tests
    node: { type: 'NODE_TYPE', value: 'node' },
    text: { type: 'NODE_TYPE', value: 'text' },
    comment: { type: 'NODE_TYPE', value: 'comment' },
    'processing-instruction': { type: 'NODE_TYPE', value: 'processing-instruction' },

    // Operators
    and: { type: 'OPERATOR', value: 'and' },
    or: { type: 'OPERATOR', value: 'or' },
    div: { type: 'OPERATOR', value: 'div' },
    mod: { type: 'OPERATOR', value: 'mod' },

    // Node set functions (XPath 1.0, also valid in later versions)
    last: { type: 'FUNCTION', value: 'last' },
    position: { type: 'FUNCTION', value: 'position' },
    count: { type: 'FUNCTION', value: 'count' },
    id: { type: 'FUNCTION', value: 'id' },
    'local-name': { type: 'FUNCTION', value: 'local-name' },
    'namespace-uri': { type: 'FUNCTION', value: 'namespace-uri' },
    name: { type: 'FUNCTION', value: 'name' },

    // String functions
    string: { type: 'FUNCTION', value: 'string' },
    concat: { type: 'FUNCTION', value: 'concat' },
    'starts-with': { type: 'FUNCTION', value: 'starts-with' },
    contains: { type: 'FUNCTION', value: 'contains' },
    'substring-before': { type: 'FUNCTION', value: 'substring-before' },
    'substring-after': { type: 'FUNCTION', value: 'substring-after' },
    substring: { type: 'FUNCTION', value: 'substring' },
    'string-length': { type: 'FUNCTION', value: 'string-length' },
    'normalize-space': { type: 'FUNCTION', value: 'normalize-space' },
    translate: { type: 'FUNCTION', value: 'translate' },

    // Boolean functions
    boolean: { type: 'FUNCTION', value: 'boolean' },
    not: { type: 'FUNCTION', value: 'not' },
    true: { type: 'FUNCTION', value: 'true' },
    false: { type: 'FUNCTION', value: 'false' },
    lang: { type: 'FUNCTION', value: 'lang' },

    // Number functions
    number: { type: 'FUNCTION', value: 'number' },
    sum: { type: 'FUNCTION', value: 'sum' },
    floor: { type: 'FUNCTION', value: 'floor' },
    ceiling: { type: 'FUNCTION', value: 'ceiling' },
    round: { type: 'FUNCTION', value: 'round' },
};

const XPATH20_RESERVED_WORDS: ReservedWordMap = {
    // Conditional expression keywords (XPath 2.0)
    if: { type: 'RESERVED_WORD', value: 'if' },
    then: { type: 'RESERVED_WORD', value: 'then' },
    else: { type: 'RESERVED_WORD', value: 'else' },

    // FLWOR expressions (XPath 2.0)
    for: { type: 'RESERVED_WORD', value: 'for' },
    in: { type: 'RESERVED_WORD', value: 'in' },
    return: { type: 'RESERVED_WORD', value: 'return' },

    // Quantified expressions (XPath 2.0)
    some: { type: 'RESERVED_WORD', value: 'some' },
    every: { type: 'RESERVED_WORD', value: 'every' },
    satisfies: { type: 'RESERVED_WORD', value: 'satisfies' },

    // SequenceType operations (XPath 2.0)
    instance: { type: 'RESERVED_WORD', value: 'instance' },
    of: { type: 'RESERVED_WORD', value: 'of' },

    // Cast expressions (XPath 2.0)
    cast: { type: 'RESERVED_WORD', value: 'cast' },
    as: { type: 'RESERVED_WORD', value: 'as' },
    castable: { type: 'RESERVED_WORD', value: 'castable' },
    treat: { type: 'RESERVED_WORD', value: 'treat' },

    // Range expression (XPath 2.0)
    to: { type: 'RESERVED_WORD', value: 'to' },
};

const XPATH30_RESERVED_WORDS: ReservedWordMap = {
    // Let expression (XPath 3.0)
    let: { type: 'RESERVED_WORD', value: 'let' },

    // Function keyword for inline functions (XPath 3.0)
    function: { type: 'RESERVED_WORD', value: 'function' },
};

const XPATH31_RESERVED_WORDS: ReservedWordMap = {
    // Map constructor keyword (XPath 3.1)
    map: { type: 'RESERVED_WORD', value: 'map' },

    // Array constructor keyword (XPath 3.1)
    array: { type: 'RESERVED_WORD', value: 'array' },
};

function buildReservedWords(version: XPathVersion): ReservedWordMap {
    const merged: ReservedWordMap = { ...COMMON_RESERVED_WORDS };

    if (version !== '1.0') {
        Object.assign(merged, XPATH20_RESERVED_WORDS);
    }

    if (version === '3.0' || version === '3.1') {
        Object.assign(merged, XPATH30_RESERVED_WORDS);
    }

    if (version === '3.1') {
        Object.assign(merged, XPATH31_RESERVED_WORDS);
    }

    return merged;
}

/**
 * Lexer (tokenizer) for XPath expressions.
 *
 * Converts XPath expression strings into a sequence of tokens that can be
 * parsed by XPath10Parser or XPath20Parser.
 *
 * @example
 * ```typescript
 * // Create lexer with default options (XPath 1.0)
 * const lexer = new XPathLexer();
 *
 * // Create lexer with explicit version
 * const lexer10 = new XPathLexer('1.0');
 * const lexer20 = new XPathLexer('2.0');
 *
 * // Create lexer with options object
 * const lexer = new XPathLexer({ version: '2.0' });
 *
 * // Tokenize an expression
 * const tokens = lexer.scan('//book[@price > 10]');
 * ```
 */
export class XPathLexer {
    expression: string;
    current: number;
    tokens: XPathToken[];
    private additionalFunctions?: Set<string>;
    private readonly reservedWords: ReservedWordMap;
    private readonly version: XPathVersion;

    /**
     * Create a new XPath lexer.
     *
     * @param versionOrOptions - Either an XPath version string ('1.0', '2.0', '3.0', '3.1')
     *                           or an options object with a version property.
     *                           Defaults to '1.0' for backward compatibility.
     *
     * @example
     * ```typescript
     * // All of these create an XPath 1.0 lexer:
     * const lexer1 = new XPathLexer();
     * const lexer2 = new XPathLexer('1.0');
     * const lexer3 = new XPathLexer({ version: '1.0' });
     *
     * // Create an XPath 2.0 lexer:
     * const lexer4 = new XPathLexer('2.0');
     * const lexer5 = new XPathLexer({ version: '2.0' });
     * ```
     */
    constructor(versionOrOptions?: XPathVersion | XPathLexerOptions) {
        if (typeof versionOrOptions === 'object') {
            this.version = versionOrOptions.version ?? DEFAULT_LEXER_VERSION;
        } else {
            this.version = versionOrOptions ?? DEFAULT_LEXER_VERSION;
        }
        this.reservedWords = buildReservedWords(this.version);
    }

    /**
     * Get the XPath version this lexer is configured for.
     */
    getVersion(): XPathVersion {
        return this.version;
    }

    /**
     * Register additional function names to be recognized by the lexer.
     * Used for XSLT extension functions.
     */
    registerFunctions(functionNames: string[]): void {
        if (!this.additionalFunctions) {
            this.additionalFunctions = new Set();
        }
        for (const name of functionNames) {
            this.additionalFunctions.add(name);
        }
    }

    /**
     * Check if character is a valid start of an identifier.
     * Supports Unicode letters according to XML NCName specification.
     */
    isAlpha(char: string): boolean {
        // Allow ASCII letters, underscore, and Unicode letters
        // Using Unicode property escapes for broader Unicode support
        return /^[a-zA-Z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/.test(
            char
        );
    }

    /**
     * Check if character is valid in an identifier (after the first character).
     * Supports Unicode letters and digits according to XML NCName specification.
     * Note: Hyphen is handled separately in parseIdentifier for reserved words.
     */
    isAlphaNumeric(char: string): boolean {
        // Allow ASCII alphanumerics, underscore, and Unicode letters/digits/combining chars
        return /^[a-zA-Z0-9_\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/.test(
            char
        );
    }

    isNumber(char: string): boolean {
        return /^[0-9]$/.test(char);
    }

    isWhitespace(char: string): boolean {
        return /^[\s\t\n\r]$/.test(char);
    }

    peek(): string | undefined {
        return this.expression[this.current];
    }

    peekNext(): string | undefined {
        return this.expression[this.current + 1];
    }

    next(): string {
        return this.expression[this.current++];
    }

    match(expected: string): boolean {
        if (this.current >= this.expression.length) return false;
        if (this.expression[this.current] !== expected) return false;
        this.current++;
        return true;
    }

    parseIdentifier(firstCharacter: string): XPathToken {
        let characters = firstCharacter;

        // Parse alphanumeric characters, allowing hyphens for element names
        // XML NCName allows hyphens (but not at the start)
        while (this.current < this.expression.length) {
            const char = this.expression[this.current];

            if (this.isAlphaNumeric(char)) {
                characters += this.next();
            } else if (char === '-') {
                // Look ahead to check if this is a hyphenated identifier or subtraction
                const nextChar = this.expression[this.current + 1];

                // If hyphen is immediately followed by an alphanumeric character,
                // it's likely part of the identifier (e.g., "my-element", "ancestor-or-self")
                if (nextChar && this.isAlphaNumeric(nextChar)) {
                    this.current++; // consume the hyphen
                    characters += '-';
                    // Continue parsing the rest of the identifier
                    while (
                        this.current < this.expression.length &&
                        this.isAlphaNumeric(this.expression[this.current])
                    ) {
                        characters += this.next();
                    }
                } else {
                    // Hyphen followed by space or operator - it's subtraction
                    break;
                }
            } else {
                break;
            }
        }

        const likelyReservedWord = this.reservedWords[characters.toLowerCase()];
        if (likelyReservedWord) {
            return new XPathToken(likelyReservedWord.type, characters);
        }

        // Check if this is an extension function
        if (this.additionalFunctions && this.additionalFunctions.has(characters)) {
            return new XPathToken('FUNCTION', characters);
        }

        if (characters.length > 0) {
            return new XPathToken('IDENTIFIER', characters);
        }

        throw new Error(`Invalid identifier: ${characters}`);
    }

    parseString(quoteChar: string): XPathToken {
        let value = '';

        while (
            this.current < this.expression.length &&
            this.expression[this.current] !== quoteChar
        ) {
            value += this.next();
        }

        if (this.current >= this.expression.length) {
            throw new Error(`Unterminated string literal`);
        }

        this.next(); // consume closing quote
        return new XPathToken('STRING', value);
    }

    /**
     * Parse string template: `Hello {$name}!`
     * Returns the entire template as-is for the parser to handle interpolation.
     */
    parseStringTemplate(): XPathToken {
        let value = '';
        let depth = 0;

        while (this.current < this.expression.length) {
            const char = this.expression[this.current];

            // Handle escape sequences
            if (char === '\\' && this.current + 1 < this.expression.length) {
                const nextChar = this.expression[this.current + 1];
                // Check for valid escapes: \`, \{, \}, \n, \r, \t, \\
                if (
                    nextChar === '`' ||
                    nextChar === '{' ||
                    nextChar === '}' ||
                    nextChar === 'n' ||
                    nextChar === 'r' ||
                    nextChar === 't' ||
                    nextChar === '\\'
                ) {
                    value += char;
                    this.next();
                    value += this.next();
                    continue;
                }
            }

            // End of template
            if (char === '`' && depth === 0) {
                this.next(); // consume closing backtick
                return new XPathToken('STRING_TEMPLATE', value);
            }

            // Track nested braces
            if (char === '{') {
                depth++;
            } else if (char === '}') {
                depth--;
            }

            value += this.next();
        }

        throw new Error('Unterminated string template');
    }

    parseNumber(firstCharacter: string): XPathToken {
        let characters = firstCharacter;

        while (
            this.current < this.expression.length &&
            this.isNumber(this.expression[this.current]) &&
            this.expression[this.current] !== '.'
        ) {
            characters += this.next();
        }

        // Allow for a decimal point in the number
        if (this.current < this.expression.length && this.expression[this.current] === '.') {
            characters += this.next();
            while (
                this.current < this.expression.length &&
                this.isNumber(this.expression[this.current])
            ) {
                characters += this.next();
            }
        }

        if (characters.length > 0) {
            return new XPathToken('NUMBER', characters);
        }

        // If no valid number was found, return an error token
        throw new Error(`Invalid number: ${characters}`);
    }

    /**
     * Parse EQName (Expanded QName): Q{uri}local-name
     * XPath 3.0 syntax for directly specifying namespace URIs.
     * Example: Q{http://www.w3.org/2005/xpath-functions/math}pi
     */
    parseEQName(): XPathToken {
        // Q is already consumed, consume the opening brace
        this.next(); // consume '{'

        let uri = '';
        // Read until closing brace
        while (this.current < this.expression.length && this.expression[this.current] !== '}') {
            uri += this.next();
        }

        if (this.current >= this.expression.length) {
            throw new Error(`Unterminated EQName: missing '}' after URI`);
        }

        this.next(); // consume '}'

        // Now parse the local name
        let localName = '';
        if (this.current < this.expression.length && this.isAlpha(this.expression[this.current])) {
            while (this.current < this.expression.length) {
                const char = this.expression[this.current];
                if (this.isAlphaNumeric(char) || char === '-' || char === '_') {
                    localName += this.next();
                } else {
                    break;
                }
            }
        }

        if (localName.length === 0) {
            throw new Error(`EQName missing local name after '}': Q{${uri}}`);
        }

        // Store the full EQName as "Q{uri}local"
        const fullEQName = `Q{${uri}}${localName}`;
        return new XPathToken('EQNAME', fullEQName);
    }

    scanToken(): XPathToken | null {
        const char = this.next();

        // Skip whitespace
        if (this.isWhitespace(char)) {
            return null;
        }

        switch (char) {
            case '@':
                return new XPathToken('AT', char);
            case '$':
                return new XPathToken('DOLLAR', char);
            case '|':
                // XPath 3.0: || is string concatenation operator
                if (this.match('|')) {
                    return new XPathToken('CONCAT', '||');
                }
                return new XPathToken('PIPE', char);

            case '#':
                // XPath 3.0: # is used for named function references (fn:name#arity)
                return new XPathToken('HASH', char);
            case '{':
                return new XPathToken('OPEN_CURLY_BRACKET', char);
            case '}':
                return new XPathToken('CLOSE_CURLY_BRACKET', char);
            case '[':
                return new XPathToken('OPEN_SQUARE_BRACKET', char);
            case ']':
                return new XPathToken('CLOSE_SQUARE_BRACKET', char);
            case '(':
                return new XPathToken('OPEN_PAREN', char);
            case ')':
                return new XPathToken('CLOSE_PAREN', char);
            case '+':
                return new XPathToken('PLUS', char);
            case '-':
                return new XPathToken('MINUS', char);
            case '*':
                return new XPathToken('ASTERISK', char);
            case ',':
                return new XPathToken('COMMA', char);
            case '?':
                return new XPathToken('QUESTION', char);

            case 'Q':
                // XPath 3.0: Q{uri}local is an EQName (expanded QName)
                if (this.peek() === '{') {
                    return this.parseEQName();
                }
                // Otherwise treat as identifier
                return this.parseIdentifier(char);

            // Tokens that may be single or double character
            case '.':
                if (this.match('.')) {
                    return new XPathToken('DOT_DOT', '..');
                }
                // Check if it's a number starting with decimal point
                if (this.peek() && this.isNumber(this.peek()!)) {
                    return this.parseNumber(char);
                }
                return new XPathToken('DOT', char);

            case '/':
                if (this.match('/')) {
                    return new XPathToken('DOUBLE_SLASH', '//');
                }
                return new XPathToken('SLASH', char);

            case ':':
                if (this.match(':')) {
                    return new XPathToken('COLON_COLON', '::');
                }
                // XPath 3.0: := is variable assignment in let expressions
                if (this.match('=')) {
                    return new XPathToken('ASSIGNMENT', ':=');
                }
                return new XPathToken('COLON', char);

            case '=':
                // XPath 3.0: => is the arrow operator
                if (this.match('>')) {
                    return new XPathToken('FAT_ARROW', '=>');
                }
                return new XPathToken('EQUALS', char);

            case '!':
                if (this.match('=')) {
                    return new XPathToken('NOT_EQUALS', '!=');
                }
                // XPath 3.0: ! is the simple map operator
                return new XPathToken('SIMPLE_MAP', char);

            case '<':
                if (this.match('=')) {
                    return new XPathToken('LESS_THAN_OR_EQUAL', '<=');
                }
                return new XPathToken('LESS_THAN', char);

            case '>':
                if (this.match('=')) {
                    return new XPathToken('GREATER_THAN_OR_EQUAL', '>=');
                }
                return new XPathToken('GREATER_THAN', char);

            // String literals
            case "'":
                return this.parseString("'");

            case '"':
                return this.parseString('"');

            // String template (XPath 3.0+): `Hello {$name}!`
            case '`':
                return this.parseStringTemplate();

            default:
                if (this.isNumber(char)) {
                    return this.parseNumber(char);
                }

                if (this.isAlpha(char)) {
                    return this.parseIdentifier(char);
                }

                throw new Error(`Unexpected character: ${char}`);
        }
    }

    scan(expression: string): XPathToken[] {
        this.expression = expression;
        this.tokens = [];
        this.current = 0;

        while (this.current < this.expression.length) {
            const token = this.scanToken();
            if (token !== null) {
                this.tokens.push(token);
            }
        }

        return this.tokens;
    }
}
