/**
 * XPath 3.1 Map Constructor Tests
 *
 * Tests for map constructor expressions: map { key: value, ... }
 * Reference: https://www.w3.org/TR/xpath-31/#id-map-constructors
 */

import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser';
import { XPathContext } from '../src/context';

describe('XPath 3.1 Map Constructors', () => {
    const mockContext: XPathContext = {};

    describe('Lexer - Map Keywords', () => {
        it('should recognize map as reserved word in 3.1', () => {
            const lexer = new XPathLexer('3.1');
            const tokens = lexer.scan('map { }');
            expect(tokens.some(t => t.type === 'RESERVED_WORD' && t.lexeme === 'map')).toBe(true);
        });

        it('should recognize array as reserved word in 3.1', () => {
            const lexer = new XPathLexer('3.1');
            const tokens = lexer.scan('array { }');
            expect(tokens.some(t => t.type === 'RESERVED_WORD' && t.lexeme === 'array')).toBe(true);
        });

        it('should not recognize map as reserved word in 3.0', () => {
            const lexer = new XPathLexer('3.0');
            const tokens = lexer.scan('map');
            expect(tokens.some(t => t.type === 'RESERVED_WORD' && t.lexeme === 'map')).toBe(false);
        });
    });

    describe('Parser - Map Constructor Syntax', () => {
        it('should parse empty map', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse simple map with string keys', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "name": "John", "age": 30 }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse map with expression keys', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { 1 + 2: "value" }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse map with expression values', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "sum": 1 + 2 + 3 }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse nested maps', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "outer": map { "inner": 42 } }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse map with multiple entries', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "a": 1, "b": 2, "c": 3, "d": 4 }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should handle whitespace variations', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map{"key":"value"}');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });
    });

    describe('Evaluator - Empty Map', () => {
        it('should evaluate empty map', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result).toBeDefined();
            expect(result.__isMap).toBe(true);
            expect(Object.keys(result).filter(k => k !== '__isMap').length).toBe(0);
        });
    });

    describe('Evaluator - Simple Maps', () => {
        it('should evaluate map with single string key', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "name": "Alice" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.name).toBe('Alice');
        });

        it('should evaluate map with numeric key', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { 42: "answer" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result['42']).toBe('answer');
        });

        it('should evaluate map with multiple entries', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "x": 10, "y": 20, "z": 30 }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.x).toBe(10);
            expect(result.y).toBe(20);
            expect(result.z).toBe(30);
        });

        it('should evaluate map with expression values', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "sum": 1 + 2, "product": 3 * 4 }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.sum).toBe(3);
            expect(result.product).toBe(12);
        });
    });

    describe('Evaluator - Duplicate Keys', () => {
        it('should use last value for duplicate keys', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "key": "first", "key": "second", "key": "third" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.key).toBe('third');
        });

        it('should handle duplicate numeric keys', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { 1: "one", 1: "uno" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result['1']).toBe('uno');
        });
    });

    describe('Evaluator - Nested Maps', () => {
        it('should evaluate nested map', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "person": map { "name": "Bob", "age": 25 } }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.person.__isMap).toBe(true);
            expect(result.person.name).toBe('Bob');
            expect(result.person.age).toBe(25);
        });

        it('should evaluate deeply nested maps', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "a": map { "b": map { "c": "deep" } } }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.a.__isMap).toBe(true);
            expect(result.a.b.__isMap).toBe(true);
            expect(result.a.b.c).toBe('deep');
        });

        it('should evaluate map with mixed nested and simple entries', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "name": "Test", "data": map { "x": 1, "y": 2 }, "count": 5 }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.name).toBe('Test');
            expect(result.data.__isMap).toBe(true);
            expect(result.data.x).toBe(1);
            expect(result.data.y).toBe(2);
            expect(result.count).toBe(5);
        });
    });

    describe('Evaluator - Complex Values', () => {
        it('should handle sequence values', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "numbers": (1, 2, 3) }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(Array.isArray(result.numbers)).toBe(true);
            expect(result.numbers).toEqual([1, 2, 3]);
        });

        it('should handle empty sequence values', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "empty": () }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(Array.isArray(result.empty)).toBe(true);
            expect(result.empty.length).toBe(0);
        });
    });

    describe('Evaluator - With Variables', () => {
        it('should evaluate map with variable references', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('let $name := "Charlie" return map { "person": $name }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.person).toBe('Charlie');
        });

        it('should evaluate map in let binding', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('let $m := map { "x": 5, "y": 10 } return $m');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.x).toBe(5);
            expect(result.y).toBe(10);
        });
    });

    describe('Evaluator - Key Atomization', () => {
        it('should atomize numeric expression keys', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { 2 + 3: "five" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result['5']).toBe('five');
        });

        it('should atomize boolean keys', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { true(): "yes", false(): "no" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result['true']).toBe('yes');
            expect(result['false']).toBe('no');
        });
    });

    describe('Edge Cases', () => {
        it('should handle map with special characters in string keys', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "with-dash": 1, "with_underscore": 2, "with.dot": 3 }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result['with-dash']).toBe(1);
            expect(result['with_underscore']).toBe(2);
            expect(result['with.dot']).toBe(3);
        });

        it('should handle map with empty string key', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "": "empty key" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result['']).toBe('empty key');
        });

        it('should handle very long keys', () => {
            const longKey = 'a'.repeat(1000);
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan(`map { "${longKey}": "value" }`);
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result[longKey]).toBe('value');
        });
    });

    describe('Integration - Map in Expressions', () => {
        it('should use map in for expression', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('for $m in (map { "x": 1 }, map { "x": 2 }) return $m');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0].__isMap).toBe(true);
            expect(result[0].x).toBe(1);
            expect(result[1].__isMap).toBe(true);
            expect(result[1].x).toBe(2);
        });

        it('should use map in conditional expression', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('if (true()) then map { "result": "yes" } else map { "result": "no" }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;
            
            expect(result.__isMap).toBe(true);
            expect(result.result).toBe('yes');
        });
    });
});
