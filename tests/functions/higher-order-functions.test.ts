/**
 * Tests for XPath 3.0 Higher-Order Functions
 */

import { XPathLexer } from '../../src/lexer/lexer';
import { XPath30Parser } from '../../src/parser';
import { XPathContext } from '../../src/context';

describe('XPath 3.0 Higher-Order Functions', () => {
    const mockContext: XPathContext = {};

    describe('fn:for-each', () => {
        it('should apply function to each item in sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('for-each((1, 2, 3), function($x) { $x * 2 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([2, 4, 6]);
        });

        it('should handle empty sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('for-each((), function($x) { $x * 2 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([]);
        });

        it('should flatten results', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('for-each((1, 2), function($x) { ($x, $x * 10) })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([1, 10, 2, 20]);
        });

        it('should work with named function reference', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('for-each(("hello", "world"), upper-case#1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual(['HELLO', 'WORLD']);
        });
    });

    describe('fn:filter', () => {
        it('should filter sequence by predicate', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('filter((1, 2, 3, 4, 5), function($x) { $x > 2 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([3, 4, 5]);
        });

        it('should return empty for no matches', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('filter((1, 2, 3), function($x) { $x > 10 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([]);
        });

        it('should handle empty sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('filter((), function($x) { $x > 2 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([]);
        });
    });

    describe('fn:fold-left', () => {
        it('should sum numbers from left', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'fold-left((1, 2, 3, 4), 0, function($acc, $x) { $acc + $x })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(10);
        });

        it('should concatenate strings from left', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'fold-left(("a", "b", "c"), "", function($acc, $x) { $acc || $x })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('abc');
        });

        it('should return zero for empty sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('fold-left((), 42, function($acc, $x) { $acc + $x })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(42);
        });

        it('should build reverse sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'fold-left((1, 2, 3), (), function($acc, $x) { ($x, $acc) })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([3, 2, 1]);
        });
    });

    describe('fn:fold-right', () => {
        it('should sum numbers from right', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'fold-right((1, 2, 3, 4), 0, function($x, $acc) { $acc + $x })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(10);
        });

        it('should concatenate strings from right', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'fold-right(("a", "b", "c"), "", function($x, $acc) { $acc || $x })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('cba');
        });

        it('should return zero for empty sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('fold-right((), 42, function($x, $acc) { $acc + $x })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(42);
        });
    });

    describe('fn:for-each-pair', () => {
        it('should apply function to pairs of items', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'for-each-pair((1, 2, 3), (4, 5, 6), function($a, $b) { $a + $b })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([5, 7, 9]);
        });

        it('should stop at shorter sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'for-each-pair((1, 2, 3, 4), (10, 20), function($a, $b) { $a + $b })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([11, 22]);
        });

        it('should handle empty sequences', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('for-each-pair((), (1, 2, 3), function($a, $b) { $a + $b })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([]);
        });

        it('should concatenate strings pairwise', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'for-each-pair(("a", "b"), ("1", "2"), function($a, $b) { $a || $b })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual(['a1', 'b2']);
        });
    });

    describe('fn:sort', () => {
        it('should sort numbers in ascending order', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('sort((3, 1, 4, 1, 5, 9, 2, 6))');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
        });

        it('should sort strings in ascending order', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('sort(("banana", "apple", "cherry"))');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual(['apple', 'banana', 'cherry']);
        });

        it('should sort with key function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('sort((3, 1, 4, 1, 5), (), function($x) { -$x })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([5, 4, 3, 1, 1]);
        });

        it('should handle empty sequence', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('sort(())');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([]);
        });
    });

    describe('fn:apply', () => {
        it('should apply function with array of arguments', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('apply(concat#3, ("a", "b", "c"))');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('abc');
        });

        it('should work with inline function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('apply(function($a, $b) { $a + $b }, (5, 3))');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(8);
        });

        it('should handle single argument', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('apply(upper-case#1, ("hello"))');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('HELLO');
        });
    });

    describe('fn:function-name', () => {
        it('should return name of named function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('function-name(upper-case#1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            // Returns QName with namespace
            expect(result).toContain('upper-case');
        });

        it('should return null for anonymous function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('function-name(function($x) { $x + 1 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNull();
        });
    });

    describe('fn:function-arity', () => {
        it('should return arity of function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('function-arity(concat#3)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(3);
        });

        it('should return arity of inline function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('function-arity(function($a, $b, $c) { $a + $b + $c })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(3);
        });

        it('should return 0 for zero-arity function', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('function-arity(function() { 42 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });
    });

    describe('Integration - Complex HOF combinations', () => {
        it('should chain for-each with filter', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan(
                'for-each(filter((1, 2, 3, 4, 5), function($x) { $x > 2 }), function($x) { $x * 2 })'
            );
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([6, 8, 10]);
        });

        it('should use fold-left with function reference', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('fold-left(("a", "b", "c"), "", concat#2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe('abc');
        });

        it('should combine sort and for-each', () => {
            const lexer = new XPathLexer('3.0');
            const parser = new XPath30Parser();
            const tokens = lexer.scan('for-each(sort((3, 1, 2)), function($x) { $x * 10 })');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([10, 20, 30]);
        });
    });
});
