import { XPathToken } from "./token";
import { TokenType } from "./token-type";

type XPathVersion = '1.0' | '2.0' | '3.0' | '3.1';

type ReservedWordMap = Record<string, { type: TokenType; value: string }>;

const COMMON_RESERVED_WORDS: ReservedWordMap = {
    // Location axes (XPath 1.0 complete list)
    "ancestor": { type: "LOCATION", value: "ancestor" },
    "ancestor-or-self": { type: "LOCATION", value: "ancestor-or-self" },
    "attribute": { type: "LOCATION", value: "attribute" },
    "child": { type: "LOCATION", value: "child" },
    "descendant": { type: "LOCATION", value: "descendant" },
    "descendant-or-self": { type: "LOCATION", value: "descendant-or-self" },
    "following": { type: "LOCATION", value: "following" },
    "following-sibling": { type: "LOCATION", value: "following-sibling" },
    "namespace": { type: "LOCATION", value: "namespace" },
    "parent": { type: "LOCATION", value: "parent" },
    "preceding": { type: "LOCATION", value: "preceding" },
    "preceding-sibling": { type: "LOCATION", value: "preceding-sibling" },
    "self": { type: "LOCATION", value: "self" },

    // Node type tests
    "node": { type: "NODE_TYPE", value: "node" },
    "text": { type: "NODE_TYPE", value: "text" },
    "comment": { type: "NODE_TYPE", value: "comment" },
    "processing-instruction": { type: "NODE_TYPE", value: "processing-instruction" },

    // Operators
    "and": { type: "OPERATOR", value: "and" },
    "or": { type: "OPERATOR", value: "or" },
    "div": { type: "OPERATOR", value: "div" },
    "mod": { type: "OPERATOR", value: "mod" },

    // Node set functions (XPath 1.0, also valid in later versions)
    "last": { type: "FUNCTION", value: "last" },
    "position": { type: "FUNCTION", value: "position" },
    "count": { type: "FUNCTION", value: "count" },
    "id": { type: "FUNCTION", value: "id" },
    "local-name": { type: "FUNCTION", value: "local-name" },
    "namespace-uri": { type: "FUNCTION", value: "namespace-uri" },
    "name": { type: "FUNCTION", value: "name" },

    // String functions
    "string": { type: "FUNCTION", value: "string" },
    "concat": { type: "FUNCTION", value: "concat" },
    "starts-with": { type: "FUNCTION", value: "starts-with" },
    "contains": { type: "FUNCTION", value: "contains" },
    "substring-before": { type: "FUNCTION", value: "substring-before" },
    "substring-after": { type: "FUNCTION", value: "substring-after" },
    "substring": { type: "FUNCTION", value: "substring" },
    "string-length": { type: "FUNCTION", value: "string-length" },
    "normalize-space": { type: "FUNCTION", value: "normalize-space" },
    "translate": { type: "FUNCTION", value: "translate" },

    // Boolean functions
    "boolean": { type: "FUNCTION", value: "boolean" },
    "not": { type: "FUNCTION", value: "not" },
    "true": { type: "FUNCTION", value: "true" },
    "false": { type: "FUNCTION", value: "false" },
    "lang": { type: "FUNCTION", value: "lang" },

    // Number functions
    "number": { type: "FUNCTION", value: "number" },
    "sum": { type: "FUNCTION", value: "sum" },
    "floor": { type: "FUNCTION", value: "floor" },
    "ceiling": { type: "FUNCTION", value: "ceiling" },
    "round": { type: "FUNCTION", value: "round" },
};

const XPATH20_RESERVED_WORDS: ReservedWordMap = {
    // Conditional expression keywords (XPath 2.0)
    "if": { type: "RESERVED_WORD", value: "if" },
    "then": { type: "RESERVED_WORD", value: "then" },
    "else": { type: "RESERVED_WORD", value: "else" },

    // FLWOR expressions (XPath 2.0)
    "for": { type: "RESERVED_WORD", value: "for" },
    "in": { type: "RESERVED_WORD", value: "in" },
    "return": { type: "RESERVED_WORD", value: "return" },

    // Quantified expressions (XPath 2.0)
    "some": { type: "RESERVED_WORD", value: "some" },
    "every": { type: "RESERVED_WORD", value: "every" },
    "satisfies": { type: "RESERVED_WORD", value: "satisfies" },
};

function buildReservedWords(version: XPathVersion): ReservedWordMap {
    const merged: ReservedWordMap = { ...COMMON_RESERVED_WORDS };

    if (version !== '1.0') {
        Object.assign(merged, XPATH20_RESERVED_WORDS);
    }

    return merged;
}

export class XPathLexer {
    expression: string;
    current: number;
    tokens: XPathToken[];
    private additionalFunctions?: Set<string>;
    private readonly reservedWords: ReservedWordMap;

    constructor(private readonly version: XPathVersion = '2.0') {
        this.reservedWords = buildReservedWords(version);
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
        return /^[a-zA-Z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/.test(char);
    }

    /**
     * Check if character is valid in an identifier (after the first character).
     * Supports Unicode letters and digits according to XML NCName specification.
     * Note: Hyphen is handled separately in parseIdentifier for reserved words.
     */
    isAlphaNumeric(char: string): boolean {
        // Allow ASCII alphanumerics, underscore, and Unicode letters/digits/combining chars
        return /^[a-zA-Z0-9_\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/.test(char);
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
            } else if (char === "-") {
                // Look ahead to check if this is a hyphenated identifier or subtraction
                const nextChar = this.expression[this.current + 1];

                // If hyphen is immediately followed by an alphanumeric character,
                // it's likely part of the identifier (e.g., "my-element", "ancestor-or-self")
                if (nextChar && this.isAlphaNumeric(nextChar)) {
                    this.current++; // consume the hyphen
                    characters += "-";
                    // Continue parsing the rest of the identifier
                    while (this.current < this.expression.length && this.isAlphaNumeric(this.expression[this.current])) {
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
            return new XPathToken("FUNCTION", characters);
        }

        if (characters.length > 0) {
            return new XPathToken("IDENTIFIER", characters);
        }

        throw new Error(`Invalid identifier: ${characters}`);
    }

    parseString(quoteChar: string): XPathToken {
        let value = "";

        while (this.current < this.expression.length && this.expression[this.current] !== quoteChar) {
            value += this.next();
        }

        if (this.current >= this.expression.length) {
            throw new Error(`Unterminated string literal`);
        }

        this.next(); // consume closing quote
        return new XPathToken("STRING", value);
    }

    parseNumber(firstCharacter: string): XPathToken {
        let characters = firstCharacter;

        while (
            this.current < this.expression.length &&
            this.isNumber(this.expression[this.current]) &&
            this.expression[this.current] !== "."
        ) {
            characters += this.next();
        }

        // Allow for a decimal point in the number
        if (this.current < this.expression.length && this.expression[this.current] === ".") {
            characters += this.next();
            while (
                this.current < this.expression.length &&
                this.isNumber(this.expression[this.current])
            ) {
                characters += this.next();
            }
        }

        if (characters.length > 0) {
            return new XPathToken("NUMBER", characters);
        }

        // If no valid number was found, return an error token
        throw new Error(`Invalid number: ${characters}`);
    }

    scanToken(): XPathToken | null {
        const char = this.next();

        // Skip whitespace
        if (this.isWhitespace(char)) {
            return null;
        }

        switch (char) {
            case "@":
                return new XPathToken("AT", char);
            case "$":
                return new XPathToken("DOLLAR", char);
            case "|":
                return new XPathToken("PIPE", char);
            case "{":
                return new XPathToken("OPEN_CURLY_BRACKET", char);
            case "}":
                return new XPathToken("CLOSE_CURLY_BRACKET", char);
            case "[":
                return new XPathToken("OPEN_SQUARE_BRACKET", char);
            case "]":
                return new XPathToken("CLOSE_SQUARE_BRACKET", char);
            case "(":
                return new XPathToken("OPEN_PAREN", char);
            case ")":
                return new XPathToken("CLOSE_PAREN", char);
            case "+":
                return new XPathToken("PLUS", char);
            case "-":
                return new XPathToken("MINUS", char);
            case "*":
                return new XPathToken("ASTERISK", char);
            case ",":
                return new XPathToken("COMMA", char);

            // Tokens that may be single or double character
            case ".":
                if (this.match(".")) {
                    return new XPathToken("DOT_DOT", "..");
                }
                // Check if it's a number starting with decimal point
                if (this.peek() && this.isNumber(this.peek()!)) {
                    return this.parseNumber(char);
                }
                return new XPathToken("DOT", char);

            case "/":
                if (this.match("/")) {
                    return new XPathToken("DOUBLE_SLASH", "//");
                }
                return new XPathToken("SLASH", char);

            case ":":
                if (this.match(":")) {
                    return new XPathToken("COLON_COLON", "::");
                }
                return new XPathToken("COLON", char);

            case "=":
                return new XPathToken("EQUALS", char);

            case "!":
                if (this.match("=")) {
                    return new XPathToken("NOT_EQUALS", "!=");
                }
                throw new Error(`Unexpected character: ${char}`);

            case "<":
                if (this.match("=")) {
                    return new XPathToken("LESS_THAN_OR_EQUAL", "<=");
                }
                return new XPathToken("LESS_THAN", char);

            case ">":
                if (this.match("=")) {
                    return new XPathToken("GREATER_THAN_OR_EQUAL", ">=");
                }
                return new XPathToken("GREATER_THAN", char);

            // String literals
            case "'":
                return this.parseString("'");

            case '"':
                return this.parseString('"');

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
