/**
 * XPath 3.0 Parser Tests
 *
 * Tests for Phase 1 (Lexer/Parser Infrastructure) and Phase 2 (Let/Map/Concat)
 */

import { XPathLexer } from '../src/lexer/lexer';
import { XPath30Parser, createXPathParser } from '../src/parser';
import { XPathContext } from '../src/context';

describe('XPath 3.0 Parser', () => {
    const mockContext: XPathContext = {};

    describe('Factory Function', () => {
        it('should create XPath30Parser for version 3.0', () => {
            const parser = createXPathParser('3.0');
            expect(parser).toBeInstanceOf(XPath30Parser);
        });

        it('should create XPath30Parser for version 3.1', () => {
            const parser = createXPathParser('3.1');
            expect(parser).toBeInstanceOf(XPath30Parser);
        });
    });

    describe('Lexer - XPath 3.0 Tokens', () => {
        it('should tokenize simple map operator (!)', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('$items ! name()');
            expect(tokens.some(t => t.type === 'SIMPLE_MAP')).toBe(true);
        });

        it('should tokenize string concatenation (||)', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('"a" || "b"');
            expect(tokens.some(t => t.type === 'CONCAT')).toBe(true);
        });

        it('should tokenize hash for function references (#)', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('upper-case#1');
            expect(tokens.some(t => t.type === 'HASH')).toBe(true);
        });

        it('should tokenize fat arrow (=>)', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('$x => upper-case()');
            expect(tokens.some(t => t.type === 'FAT_ARROW')).toBe(true);
        });

        it('should tokenize assignment (:=)', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('let $x := 1');
            expect(tokens.some(t => t.type === 'ASSIGNMENT')).toBe(true);
        });

        it('should recognize let as reserved word in 3.0', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('let $x := 1');
            expect(tokens.some(t => t.type === 'RESERVED_WORD' && t.lexeme === 'let')).toBe(true);
        });

        it('should recognize function as reserved word in 3.0', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('function($x) { $x }');
            expect(tokens.some(t => t.type === 'RESERVED_WORD' && t.lexeme === 'function')).toBe(true);
        });

        it('should still tokenize != correctly', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('1 != 2');
            expect(tokens.some(t => t.type === 'NOT_EQUALS')).toBe(true);
        });
    });

    describe('Let Expression', () => {
        it('should parse simple let expression', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $x := 5 return $x');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(5);
        });

        it('should parse let with arithmetic', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $x := 3 return $x * 2');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(6);
        });

        it('should parse let with multiple bindings', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $x := 3, $y := 4 return $x + $y');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(7);
        });

        it('should parse let with dependent bindings', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $x := 5, $y := $x * 2 return $y');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(10);
        });

        it('should parse nested let expressions', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $x := 2 return let $y := 3 return $x * $y');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(6);
        });

        it('should parse let with string values', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $name := "World" return concat("Hello ", $name)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('Hello World');
        });
    });

    describe('String Concatenation Operator (||)', () => {
        it('should concatenate two strings', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"Hello" || " World"');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('Hello World');
        });

        it('should concatenate multiple strings', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"a" || "b" || "c"');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('abc');
        });

        it('should convert numbers to strings', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"Value: " || 42');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('Value: 42');
        });

        it('should handle empty sequence as empty string', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"prefix" || () || "suffix"');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('prefixsuffix');
        });

        it('should work with let expression', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $greeting := "Hello" return $greeting || "!"');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('Hello!');
        });
    });

    describe('Simple Map Operator (!)', () => {
        it('should apply expression to each item in sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('(1, 2, 3) ! (. * 2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([2, 4, 6]);
        });

        it('should apply expression to single value', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"hello" ! string-length(.)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([5]);
        });

        it('should handle empty sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('() ! (. * 2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([]);
        });

        it('should chain simple map operations', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('(1, 2, 3) ! (. * 2) ! (. + 1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([3, 5, 7]);
        });
    });

    describe('Arrow Operator (=>)', () => {
        it('should apply function with left expression as first argument', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"hello" => upper-case()');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('HELLO');
        });

        it('should chain arrow operations', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"  hello  " => normalize-space() => upper-case()');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('HELLO');
        });

        it('should work with additional arguments', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"hello world" => substring(1, 5)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('hello');
        });

        it('should work with concat', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('"hello" => concat(" ", "world")');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('hello world');
        });
    });

    describe('Named Function References (#)', () => {
        it('should create function reference', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('upper-case#1');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            expect(result.__isFunctionItem).toBe(true);
            expect(result.arity).toBe(1);
        });

        it('should use function reference with dynamic call', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $f := upper-case#1 return $f("hello")');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('HELLO');
        });
    });

    describe('Inline Functions', () => {
        it('should parse inline function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('function($x) { $x * 2 }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            expect(result.__isFunctionItem).toBe(true);
            expect(result.arity).toBe(1);
        });

        it('should invoke inline function immediately', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $double := function($x) { $x * 2 } return $double(5)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(10);
        });

        it('should support multiple parameters', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $add := function($a, $b) { $a + $b } return $add(3, 4)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(7);
        });

        it('should capture closure variables', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $multiplier := 3, $multiply := function($x) { $x * $multiplier } return $multiply(5)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(15);
        });
    });

    describe('Integration Tests', () => {
        it('should combine let with string concat', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $greeting := "Hello", $name := "World" return $greeting || " " || $name || "!"');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('Hello World!');
        });

        it('should combine arrow with let', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $text := "hello world" return $text => upper-case()');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('HELLO WORLD');
        });

        it('should combine simple map with let', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('let $nums := (1, 2, 3) return $nums ! (. * 2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([2, 4, 6]);
        });
    });
});
