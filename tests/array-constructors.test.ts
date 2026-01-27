/**
 * XPath 3.1 Array Constructor Tests
 *
 * Tests for array constructor expressions:
 * - Square bracket syntax: [item1, item2, ...]
 * - Curly brace syntax: array { expr }
 *
 * Reference: https://www.w3.org/TR/xpath-31/#id-array-constructors
 */

import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser';
import { XPathContext } from '../src/context';
import { isXPathArray } from '../src/expressions/array-constructor-expression';

// Helper type for test results (since XPathArray may not be in XPathResult yet)
interface TestXPathArray {
    __isArray: true;
    members: any[];
}

describe('XPath 3.1 Array Constructors', () => {
    const mockContext: XPathContext = {};

    describe('Lexer - Array Keywords', () => {
        it('should recognize array as reserved word in 3.1', () => {
            const lexer = new XPathLexer('3.1');
            const tokens = lexer.scan('array { }');
            expect(tokens.some((t) => t.type === 'RESERVED_WORD' && t.lexeme === 'array')).toBe(
                true
            );
        });

        it('should recognize square brackets in 3.1', () => {
            const lexer = new XPathLexer('3.1');
            const tokens = lexer.scan('[1, 2, 3]');
            expect(tokens.some((t) => t.type === 'OPEN_SQUARE_BRACKET')).toBe(true);
            expect(tokens.some((t) => t.type === 'CLOSE_SQUARE_BRACKET')).toBe(true);
        });
    });

    describe('Parser - Square Bracket Array Syntax', () => {
        it('should parse empty array []', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[]');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse simple array with numbers', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[1, 2, 3]');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse array with strings', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('["a", "b", "c"]');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse array with expression items', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[1 + 2, 3 * 4, 5 - 1]');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse nested arrays', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[[1, 2], [3, 4]]');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse array with single item', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[42]');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should handle whitespace variations', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[ 1 , 2 , 3 ]');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });
    });

    describe('Parser - Curly Brace Array Syntax', () => {
        it('should parse empty curly array', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse curly array with sequence', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { 1, 2, 3 }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it.skip('should parse curly array with range (to operator not yet implemented)', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { 1 to 5 }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });

        it('should parse curly array with expression', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { (1, 2) }');
            const expr = parser.parse(tokens);
            expect(expr).toBeDefined();
        });
    });

    describe('Evaluator - Empty Arrays', () => {
        it('should evaluate empty square bracket array', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(0);
        });

        it('should evaluate empty curly brace array', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(0);
        });
    });

    describe('Evaluator - Square Bracket Arrays', () => {
        it('should evaluate array with numbers', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[1, 2, 3]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });

        it('should evaluate array with strings', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('["apple", "banana", "cherry"]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual(['apple', 'banana', 'cherry']);
        });

        it('should evaluate array with mixed types', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[1, "two", 3.0]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(3);
            expect(result.members[0]).toBe(1);
            expect(result.members[1]).toBe('two');
            expect(result.members[2]).toBe(3);
        });

        it('should evaluate array with expression items', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[1 + 1, 2 * 3, 10 div 2]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([2, 6, 5]);
        });

        it('should evaluate array where each member is a sequence', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[(1, 2), (3, 4)]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(2);
            expect(result.members[0]).toEqual([1, 2]);
            expect(result.members[1]).toEqual([3, 4]);
        });

        it('should evaluate single-item array', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[42]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([42]);
        });
    });

    describe('Evaluator - Curly Brace Arrays', () => {
        it('should evaluate curly array with sequence - each item becomes member', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { (1, 2, 3) }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });

        it.skip('should evaluate curly array with range (to operator not yet implemented)', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { 1 to 5 }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3, 4, 5]);
        });

        it('should evaluate curly array with single value', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { 42 }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([42]);
        });

        it('should evaluate curly array with empty sequence', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('array { () }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(0);
        });
    });

    describe('Evaluator - Nested Arrays', () => {
        it('should evaluate nested square bracket arrays', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[[1, 2], [3, 4]]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(2);
            expect(isXPathArray(result.members[0])).toBe(true);
            expect((result.members[0] as unknown as TestXPathArray).members).toEqual([1, 2]);
            expect(isXPathArray(result.members[1])).toBe(true);
            expect((result.members[1] as unknown as TestXPathArray).members).toEqual([3, 4]);
        });

        it('should evaluate deeply nested arrays', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[[[1]]]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(1);
            const level1 = result.members[0] as unknown as TestXPathArray;
            expect(isXPathArray(level1)).toBe(true);
            expect(level1.members.length).toBe(1);
            const level2 = level1.members[0] as unknown as TestXPathArray;
            expect(isXPathArray(level2)).toBe(true);
            expect(level2.members).toEqual([1]);
        });

        it('should evaluate mixed nesting styles', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[array { 1, 2 }, [3, 4]]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(2);
            expect(isXPathArray(result.members[0])).toBe(true);
            expect((result.members[0] as unknown as TestXPathArray).members).toEqual([1, 2]);
            expect(isXPathArray(result.members[1])).toBe(true);
            expect((result.members[1] as unknown as TestXPathArray).members).toEqual([3, 4]);
        });
    });

    describe('Evaluator - Arrays with Variables', () => {
        it('should evaluate array with variable references', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('let $x := 5 return [$x, $x * 2, $x * 3]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([5, 10, 15]);
        });

        it('should evaluate array in let binding', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('let $arr := [1, 2, 3] return $arr');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });

        it('should evaluate curly array with variable sequence', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('let $seq := (10, 20, 30) return array { $seq }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([10, 20, 30]);
        });
    });

    describe('Difference between [] and array {}', () => {
        it('square brackets: each expression is one member', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            // [(1,2), (3,4)] creates 2 members, each a sequence
            const tokens = lexer.scan('[(1, 2), (3, 4)]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(2);
        });

        it('curly braces: sequence items become members', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            // array { 1, 2, 3, 4 } creates 4 members
            const tokens = lexer.scan('array { (1, 2, 3, 4) }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(4);
            expect(result.members).toEqual([1, 2, 3, 4]);
        });
    });

    describe('Integration - Arrays with Maps', () => {
        it('should evaluate array containing maps', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[map { "x": 1 }, map { "x": 2 }]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members.length).toBe(2);
            expect(result.members[0].__isMap).toBe(true);
            expect(result.members[0].x).toBe(1);
            expect(result.members[1].__isMap).toBe(true);
            expect(result.members[1].x).toBe(2);
        });

        it('should evaluate map containing array', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('map { "items": [1, 2, 3] }');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any;

            expect(result.__isMap).toBe(true);
            expect(isXPathArray(result.items)).toBe(true);
            expect((result.items as unknown as TestXPathArray).members).toEqual([1, 2, 3]);
        });
    });

    describe('Integration - Arrays in Expressions', () => {
        it('should use array in for expression', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('for $a in ([1], [2], [3]) return $a');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as any[];

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(3);
            expect(isXPathArray(result[0])).toBe(true);
            expect((result[0] as unknown as TestXPathArray).members).toEqual([1]);
        });

        it('should use array in conditional expression', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('if (true()) then [1, 2] else [3, 4]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2]);
        });
    });

    describe('Edge Cases', () => {
        it('should handle array with boolean values', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[true(), false(), true()]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([true, false, true]);
        });

        it('should handle array with function results', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('[string-length("hello"), count((1,2,3))]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([5, 3]);
        });

        it('should handle array with concatenation operator', () => {
            const lexer = new XPathLexer('3.1');
            const parser = new XPath31Parser();
            const tokens = lexer.scan('["Hello" || " " || "World"]');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext) as unknown as TestXPathArray;

            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual(['Hello World']);
        });
    });
});
