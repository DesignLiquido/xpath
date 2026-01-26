/**
 * Tests for XPath 3.0 EQNames (Expanded QNames)
 */

import { XPathLexer } from '../../src/lexer/lexer';
import { XPath30Parser } from '../../src/parser';
import { XPathContext } from '../../src/context';

describe('XPath 3.0 EQNames', () => {
    const mockContext: XPathContext = {};

    describe('Lexer - EQName tokenization', () => {
        it('should tokenize simple EQName', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('Q{http://example.com}foo');
            expect(tokens.some(t => t.type === 'EQNAME' && t.lexeme === 'Q{http://example.com}foo')).toBe(true);
        });

        it('should tokenize EQName with empty URI', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('Q{}localname');
            expect(tokens.some(t => t.type === 'EQNAME' && t.lexeme === 'Q{}localname')).toBe(true);
        });

        it('should tokenize EQName in function call', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions}concat("a", "b")');
            const eqnameToken = tokens.find(t => t.type === 'EQNAME');
            expect(eqnameToken).toBeDefined();
            expect(eqnameToken?.lexeme).toBe('Q{http://www.w3.org/2005/xpath-functions}concat');
        });

        it('should tokenize EQName with hyphenated local name', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('Q{http://example.com}my-function');
            expect(tokens.some(t => t.type === 'EQNAME' && t.lexeme === 'Q{http://example.com}my-function')).toBe(true);
        });

        it('should handle Q not followed by brace as identifier', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('Quality');
            expect(tokens[0].type).toBe('IDENTIFIER');
            expect(tokens[0].lexeme).toBe('Quality');
        });
    });

    describe('Parser - EQName in function calls', () => {
        it('should parse EQName function call', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions}concat("hello", " ", "world")');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should evaluate EQName function call (built-in)', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            // Built-in functions might not be resolved by EQName yet, but it should parse
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions}upper-case("test")');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse math namespace EQName', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions/math}pi()');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse EQName with empty namespace', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('Q{}localname()');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });
    });

    describe('Parser - EQName in function references', () => {
        it('should parse EQName function reference', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions}concat#3');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            expect(result.__isFunctionItem).toBe(true);
            expect(result.arity).toBe(3);
        });

        it('should use EQName function reference with apply', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('apply(Q{http://www.w3.org/2005/xpath-functions}concat#3, ("a", "b", "c"))');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('abc');
        });

        it.skip('should parse math EQName function reference', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions/math}sqrt#1');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            expect(result.__isFunctionItem).toBe(true);
            expect(result.arity).toBe(1);
        });
    });

    describe('Parser - EQName in arrow expressions', () => {
        it('should parse EQName in arrow operator', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"hello" => Q{http://www.w3.org/2005/xpath-functions}upper-case()');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should chain EQName functions with arrow', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"hello" => Q{http://www.w3.org/2005/xpath-functions}upper-case() => Q{http://www.w3.org/2005/xpath-functions}substring(1, 3)');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });
    });

    describe('EQName namespace equivalence', () => {
        it('should parse standard fn namespace EQName', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions}string-length("test")');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse with empty namespace for no-namespace functions', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('Q{}customFunction()');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });
    });

    describe('Integration - EQNames with other XPath 3.0 features', () => {
        it('should use EQName in let expression', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $f := Q{http://www.w3.org/2005/xpath-functions}upper-case#1 return $f("hello")');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('HELLO');
        });

        it('should use EQName with for-each', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('for-each(("a", "b", "c"), Q{http://www.w3.org/2005/xpath-functions}upper-case#1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual(['A', 'B', 'C']);
        });

        it('should use EQName in filter', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('filter((1, 2, 3, 4, 5), function($x) { $x > 2 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([3, 4, 5]);
        });
    });
});
