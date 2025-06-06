import { XPathToken } from "./token";

const RESERVED_WORDS = {
    // Location paths
    ancestor: {
        type: "RESERVED_WORD",
        value: "ancestor",
    },
    "ancestor-or-self": {
        type: "RESERVED_WORD",
        value: "ancestor-or-self",
    },
    attribute: {
        type: "RESERVED_WORD",
        value: "attribute",
    },
    child: {
        type: "RESERVED_WORD",
        value: "child",
    },
    descendant: {
        type: "RESERVED_WORD",
        value: "descendant",
    },
    "descendant-or-self": {
        type: "RESERVED_WORD",
        value: "descendant-or-self",
    },
    following: {
        type: "RESERVED_WORD",
        value: "following",
    },
    "following-sibling": {
        type: "RESERVED_WORD",
        value: "following-sibling",
    },
    parent: {
        type: "RESERVED_WORD",
        value: "parent",
    },
    preceding: {
        type: "RESERVED_WORD",
        value: "preceding",
    },
    "preceding-sibling": {
        type: "RESERVED_WORD",
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

    next(): string {
        return this.expression[this.current++];
    }

    identifier(firstCharacter: string): XPathToken {
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
            default:
                return this.identifier(char);
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
