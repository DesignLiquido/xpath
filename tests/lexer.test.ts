import { XPathLexer, XPathToken } from "../src/lexer";

describe("Lexer", () => {
  it("should tokenize a simple expression", () => {
    const lexer = new XPathLexer();
    const expression = "@name{value}[index]";
    const tokens = lexer.scan(expression);
    expect(tokens).toEqual([
      new XPathToken("AT", "@"),
      new XPathToken("IDENTIFIER", "name"),
      new XPathToken("OPEN_CURLY_BRACKET", "{"),
      new XPathToken("IDENTIFIER", "value"),
      new XPathToken("CLOSE_CURLY_BRACKET", "}"),
      new XPathToken("OPEN_SQUARE_BRACKET", "["),
      new XPathToken("IDENTIFIER", "index"),
      new XPathToken("CLOSE_SQUARE_BRACKET", "]"),
    ]);
  });
});
