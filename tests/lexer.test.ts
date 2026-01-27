import { XPathLexer, XPathToken } from '../src/lexer';

describe('Lexer', () => {
    // Default lexer uses XPath 1.0
    const lexer = new XPathLexer();

    it('trivial (select all attributes)', () => {
        const expression = '@*';
        const tokens = lexer.scan(expression);
        expect(tokens).toEqual([new XPathToken('AT', '@'), new XPathToken('ASTERISK', '*')]);
    });

    it('defaults to XPath 1.0 version', () => {
        expect(lexer.getVersion()).toBe('1.0');
    });
});

describe('Lexer version handling', () => {
    it('accepts version string in constructor', () => {
        const lexer10 = new XPathLexer('1.0');
        const lexer20 = new XPathLexer('2.0');
        expect(lexer10.getVersion()).toBe('1.0');
        expect(lexer20.getVersion()).toBe('2.0');
    });

    it('accepts options object in constructor', () => {
        const lexer = new XPathLexer({ version: '2.0' });
        expect(lexer.getVersion()).toBe('2.0');
    });

    it("treats 'if' as identifier in XPath 1.0", () => {
        const lexer10 = new XPathLexer('1.0');
        const tokens = lexer10.scan('if');
        expect(tokens[0].type).toBe('IDENTIFIER');
    });

    it("treats 'if' as reserved word in XPath 2.0", () => {
        const lexer20 = new XPathLexer('2.0');
        const tokens = lexer20.scan('if');
        expect(tokens[0].type).toBe('RESERVED_WORD');
    });

    it("treats 'for' as identifier in XPath 1.0", () => {
        const lexer10 = new XPathLexer('1.0');
        const tokens = lexer10.scan('for');
        expect(tokens[0].type).toBe('IDENTIFIER');
    });

    it("treats 'for' as reserved word in XPath 2.0", () => {
        const lexer20 = new XPathLexer('2.0');
        const tokens = lexer20.scan('for');
        expect(tokens[0].type).toBe('RESERVED_WORD');
    });
});
