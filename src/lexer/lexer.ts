import { XPathToken } from "./token";

const RESERVED_WORDS = {
    // Location paths
    ancestor: {
        type: "LOCATION",
        value: "ancestor",
    },
    "ancestor-or-self": {
        type: "LOCATION",
        value: "ancestor-or-self",
    },
    attribute: {
        type: "LOCATION",
        value: "attribute",
    },
    child: {
        type: "LOCATION",
        value: "child",
    },
    descendant: {
        type: "LOCATION",
        value: "descendant",
    },
    "descendant-or-self": {
        type: "LOCATION",
        value: "descendant-or-self",
    },
    following: {
        type: "LOCATION",
        value: "following",
    },
    "following-sibling": {
        type: "LOCATION",
        value: "following-sibling",
    },
    parent: {
        type: "LOCATION",
        value: "parent",
    },
    preceding: {
        type: "LOCATION",
        value: "preceding",
    },
    "preceding-sibling": {
        type: "LOCATION",
        value: "preceding-sibling",
    },
    // Functions
    document: {
        type: "FUNCTION",
        value: "document",
    },
    boolean: {
        type: "FUNCTION",
        value: "boolean",
    },
    floor: {
        type: "FUNCTION",
        value: "floor",
    },
    mod: {
        type: "FUNCTION",
        value: "mod",
    },
    string: {
        type: "FUNCTION",
        value: "string",
    },
    number: {
        type: "FUNCTION",
        value: "number",
    },
    ceiling: {
        type: "FUNCTION",
        value: "ceiling",
    },
    concat: {
        type: "FUNCTION",
        value: "concat",
    },
    count: {
        type: "FUNCTION",
        value: "count",
    },
    sum: {
        type: "FUNCTION",
        value: "sum",
    },
    round: {
        type: "FUNCTION",
        value: "round",
    }
};

export class XPathLexer {
    expression: string;
    current: number;
    tokens: XPathToken[];

    isAlphaNumeric(char: string): boolean {
        return /^[a-zA-Z0-9]$/.test(char);
    }

    isNumber(char: string): boolean {
        return /^[0-9]$/.test(char);
    }

    next(): string {
        return this.expression[this.current++];
    }

    parseIdentifier(firstCharacter: string): XPathToken {
        let characters = firstCharacter;

        while (
            this.current < this.expression.length &&
            this.isAlphaNumeric(this.expression[this.current])
        ) {
            characters += this.next();
        }

        const likelyReservedWord = RESERVED_WORDS[characters.toLowerCase()];
        if (likelyReservedWord) {
            return new XPathToken(likelyReservedWord.type, characters);
        }

        if (characters.length > 0) {
            return new XPathToken("IDENTIFIER", characters);
        }

        // If no valid identifier was found, return an error token
        throw new Error(`Invalid identifier: ${characters}`);
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

    scanToken(): XPathToken {
        const char = this.next();
        switch (char) {
            case "@":
                return new XPathToken("AT", char);
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
            case "/":
                return new XPathToken("SLASH", char);
            case "'":
                return new XPathToken("QUOTE", char);
            case "=":
                return new XPathToken("EQUALS", char);
            default:
                if (this.isNumber(char)) {
                    return this.parseNumber(char);
                }

                return this.parseIdentifier(char);
        }
    }

    scan(expression: string): XPathToken[] {
        this.expression = expression;
        this.tokens = [];
        this.current = 0;

        while (this.current < this.expression.length) {
            const token = this.scanToken();
            this.tokens.push(token);
        }

        return this.tokens;
    }
}
