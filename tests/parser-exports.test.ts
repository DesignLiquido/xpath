/**
 * Tests for parser exports and factory function.
 */

import {
    XPathBaseParser,
    XPath10Parser,
    XPath20Parser,
    XPathParser,
    createXPathParser,
} from '../src/parser';
import { XPathLexer } from '../src/lexer';

describe('Parser exports', () => {
    describe('XPathParser alias', () => {
        it('is an alias for XPath10Parser', () => {
            expect(XPathParser).toBe(XPath10Parser);
        });

        it('can be instantiated and used like XPath10Parser', () => {
            const parser = new XPathParser();
            const lexer = new XPathLexer('1.0');
            const tokens = lexer.scan('//book');
            const ast = parser.parse(tokens);
            expect(ast).toBeDefined();
        });
    });

    describe('createXPathParser factory', () => {
        it('creates XPath10Parser for version 1.0', () => {
            const parser = createXPathParser('1.0');
            expect(parser).toBeInstanceOf(XPath10Parser);
        });

        it('creates XPath20Parser for version 2.0', () => {
            const parser = createXPathParser('2.0');
            expect(parser).toBeInstanceOf(XPath20Parser);
        });

        it('defaults to XPath 1.0', () => {
            const parser = createXPathParser();
            expect(parser).toBeInstanceOf(XPath10Parser);
        });

        it('passes options to the parser', () => {
            const parser = createXPathParser('1.0', { enableNamespaceAxis: true });
            expect(parser.getOptions().enableNamespaceAxis).toBe(true);
        });

        it('throws for unsupported version', () => {
            expect(() => createXPathParser('4.0' as any)).toThrow('Unsupported XPath version');
        });
    });

    describe('Parser version validation', () => {
        it('XPath10Parser only accepts version 1.0', () => {
            expect(() => new XPath10Parser({ version: '2.0' })).toThrow();
        });

        it('XPath20Parser only accepts version 2.0', () => {
            expect(() => new XPath20Parser({ version: '1.0' })).toThrow();
        });

        it('XPath10Parser works without explicit version', () => {
            const parser = new XPath10Parser();
            expect(parser.getOptions().version).toBe('1.0');
        });

        it('XPath20Parser works without explicit version', () => {
            const parser = new XPath20Parser();
            expect(parser.getOptions().version).toBe('2.0');
        });
    });

    describe('XPath 1.0 vs 2.0 parsing', () => {
        it('XPath10Parser parses basic expressions', () => {
            const parser = new XPath10Parser();
            const lexer = new XPathLexer('1.0');
            const tokens = lexer.scan('//book[@price > 10]');
            const ast = parser.parse(tokens);
            expect(ast).toBeDefined();
        });

        it('XPath20Parser parses if-then-else', () => {
            const parser = new XPath20Parser();
            const lexer = new XPathLexer('2.0');
            const tokens = lexer.scan("if (true()) then 'yes' else 'no'");
            const ast = parser.parse(tokens);
            expect(ast).toBeDefined();
        });

        it('XPath20Parser parses for expressions', () => {
            const parser = new XPath20Parser();
            const lexer = new XPathLexer('2.0');
            // Use a simple path expression instead of sequence constructor
            const tokens = lexer.scan('for $x in //item return $x/@id');
            const ast = parser.parse(tokens);
            expect(ast).toBeDefined();
        });

        it('XPath20Parser parses quantified expressions', () => {
            const parser = new XPath20Parser();
            const lexer = new XPathLexer('2.0');
            // Use a simple path expression instead of sequence constructor
            const tokens = lexer.scan('some $x in //item satisfies $x/@price > 10');
            const ast = parser.parse(tokens);
            expect(ast).toBeDefined();
        });
    });
});
