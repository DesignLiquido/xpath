const RESERVED_WORDS = [

];

export type Token = 
    "AT" |
    "OPEN_CURLY_BRACKET" |
    "CLOSE_CURLY_BRACKET" |
    "OPEN_SQUARE_BRACKET" |
    "CLOSE_SQUARE_BRACKET" |
    "OPEN_PAREN" |
    "CLOSE_PAREN" | 
    "SLASH";


export class XPathLexer {
    expression: string;
    current: number;
    tokens: Token[];

    scan(expression: string): Token[] {
        this.expression = expression;
        this.current = 0;

        while (this.current < this.expression.length) {

        }

        return this.tokens;
    }
}