import { XPathLexer, XPathToken } from "../src/lexer";

describe("Lexer", () => {
    const lexer = new XPathLexer();

    it("trivial (select all attributes)", () => {
        const expression = "@*";
        const tokens = lexer.scan(expression);
        expect(tokens).toEqual([
            new XPathToken("AT", "@"),
            new XPathToken("ASTERISK", "*"),
        ]);
    });
});
