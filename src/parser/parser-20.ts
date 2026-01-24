import { XPathConditionalExpression, XPathExpression, XPathForExpression, XPathQuantifiedExpression } from "../expressions";
import { XPathBaseParserOptions } from "../xslt-extensions";
import { XPathBaseParser } from "./base-parser";

export class XPath20Parser extends XPathBaseParser {
    constructor(options?: XPathBaseParserOptions) {
        super(options);
        this.ensureVersionSupport(['2.0'], '2.0');
    }

    protected parseExpr(): XPathExpression {
        if (this.checkReservedWord('for')) {
            return this.parseForExpr();
        }

        if (this.checkReservedWord('some') || this.checkReservedWord('every')) {
            return this.parseQuantifiedExpr();
        }

        return super.parseExpr();
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

    private parseQuantifiedExpr(): XPathExpression {
        const quantifier = this.consumeReservedWordOneOf(['some', 'every'], "Expected 'some' or 'every' at start of quantified expression") as 'some' | 'every';

        const bindings: { variable: string; expression: XPathExpression }[] = [];
        do {
            bindings.push(this.parseForBinding());
        } while (this.match('COMMA'));

        this.consumeReservedWord('satisfies', "Expected 'satisfies' after quantified expression bindings");
        const satisfiesExpr = this.parseExpr();

        return new XPathQuantifiedExpression(quantifier, bindings, satisfiesExpr);
    }

    private parseForExpr(): XPathExpression {
        this.consumeReservedWord('for', "Expected 'for' at start of for expression");

        const bindings: { variable: string; expression: XPathExpression }[] = [];
        do {
            bindings.push(this.parseForBinding());
        } while (this.match('COMMA'));

        this.consumeReservedWord('return', "Expected 'return' in for expression");
        const returnExpr = this.parseExpr();

        return new XPathForExpression(bindings, returnExpr);
    }

    private parseForBinding(): { variable: string; expression: XPathExpression } {
        this.consume('DOLLAR', "Expected '$' after 'for'");
        const name = this.consume('IDENTIFIER', 'Expected variable name in for binding').lexeme;
        this.consumeReservedWord('in', "Expected 'in' after variable name in for clause");
        const expression = this.parseExpr();
        return { variable: name, expression };
    }

    private checkReservedWord(word: string): boolean {
        return this.check('RESERVED_WORD') && this.peek().lexeme === word;
    }

    private consumeReservedWord(word: string, message: string): void {
        if (this.checkReservedWord(word)) {
            this.advance();
            return;
        }
        throw new Error(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    private consumeReservedWordOneOf(words: string[], message: string): string {
        for (const word of words) {
            if (this.checkReservedWord(word)) {
                this.advance();
                return word;
            }
        }
        throw new Error(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }
}
