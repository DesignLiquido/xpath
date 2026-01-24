import { XPathConditionalExpression, XPathExpression } from "../expressions";
import { XPathBaseParserOptions } from "../xslt-extensions";
import { XPathBaseParser } from "./base-parser";

export class XPath20Parser extends XPathBaseParser {
    constructor(options?: XPathBaseParserOptions) {
        super(options);
        this.ensureVersionSupport(['2.0'], '2.0');
    }

    protected parsePrimaryExpr(): XPathExpression {
        if (this.check('RESERVED_WORD') && this.peek().lexeme === 'if') {
            return this.parseIfExpr();
        }

        return super.parsePrimaryExpr();
    }

    private parseIfExpr(): XPathExpression {
        this.advance();
        this.consume('OPEN_PAREN', "Expected '(' after 'if'");
        const testExpr = this.parseExpr();
        this.consume('CLOSE_PAREN', "Expected ')' after if test expression");

        if (!(this.check('RESERVED_WORD') && this.peek().lexeme === 'then')) {
            throw new Error("Expected 'then' in conditional expression");
        }
        this.advance();
        const thenExpr = this.parseExpr();

        if (!(this.check('RESERVED_WORD') && this.peek().lexeme === 'else')) {
            throw new Error("Expected 'else' in conditional expression");
        }
        this.advance();
        const elseExpr = this.parseExpr();

        return new XPathConditionalExpression(testExpr, thenExpr, elseExpr);
    }
}
