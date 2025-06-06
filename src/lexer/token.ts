import { TokenType as XPathTokenType } from "./token-type";

export class XPathToken {
    type: XPathTokenType;
    lexeme: string;

    constructor(type: XPathTokenType, lexeme: string) {
        this.type = type;
        this.lexeme = lexeme;
    }
}
