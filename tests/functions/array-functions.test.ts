/**
 * XPath 3.1 Array Functions Tests
 *
 * Tests for array: namespace functions.
 * Reference: https://www.w3.org/TR/xpath-functions-31/#array-functions
 */

import { XPathLexer } from '../../src/lexer/lexer';
import { XPath31Parser } from '../../src/parser';
import { XPathContext } from '../../src/context';
import { isXPathArray } from '../../src/expressions/array-constructor-expression';

// Helper to parse and evaluate XPath expressions
function evaluate(xpath: string, context: XPathContext = {}): any {
    const lexer = new XPathLexer('3.1');
    const parser = new XPath31Parser();
    const tokens = lexer.scan(xpath);
    const expr = parser.parse(tokens);
    return expr.evaluate(context);
}

describe('XPath 3.1 Array Functions', () => {
    describe('array:size', () => {
        it('should return size of array', () => {
            const result = evaluate('array:size([1, 2, 3])');
            expect(result).toBe(3);
        });

        it('should return 0 for empty array', () => {
            const result = evaluate('array:size([])');
            expect(result).toBe(0);
        });

        it('should return 1 for single-element array', () => {
            const result = evaluate('array:size([42])');
            expect(result).toBe(1);
        });
    });

    describe('array:get', () => {
        it('should get first element (1-based)', () => {
            const result = evaluate('array:get([10, 20, 30], 1)');
            expect(result).toBe(10);
        });

        it('should get middle element', () => {
            const result = evaluate('array:get([10, 20, 30], 2)');
            expect(result).toBe(20);
        });

        it('should get last element', () => {
            const result = evaluate('array:get([10, 20, 30], 3)');
            expect(result).toBe(30);
        });

        it('should throw error for position 0', () => {
            expect(() => evaluate('array:get([1, 2, 3], 0)')).toThrow('FOAY0001');
        });

        it('should throw error for position out of bounds', () => {
            expect(() => evaluate('array:get([1, 2, 3], 4)')).toThrow('FOAY0001');
        });
    });

    describe('array:put', () => {
        it('should replace element at position', () => {
            const result = evaluate('array:put([1, 2, 3], 2, 99)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 99, 3]);
        });

        it('should not modify original array', () => {
            const result = evaluate('let $arr := [1, 2, 3] return (array:put($arr, 1, 99), $arr)');
            expect(Array.isArray(result)).toBe(true);
            const modified = result[0];
            const original = result[1];
            expect(modified.members[0]).toBe(99);
            expect(original.members[0]).toBe(1);
        });
    });

    describe('array:append', () => {
        it('should append to end of array', () => {
            const result = evaluate('array:append([1, 2], 3)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });

        it('should append to empty array', () => {
            const result = evaluate('array:append([], 42)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([42]);
        });
    });

    describe('array:subarray', () => {
        it('should return subarray from start', () => {
            const result = evaluate('array:subarray([1, 2, 3, 4, 5], 2)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([2, 3, 4, 5]);
        });

        it('should return subarray with length', () => {
            const result = evaluate('array:subarray([1, 2, 3, 4, 5], 2, 3)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([2, 3, 4]);
        });

        it('should return empty array for length 0', () => {
            const result = evaluate('array:subarray([1, 2, 3], 1, 0)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([]);
        });
    });

    describe('array:remove', () => {
        it('should remove single position', () => {
            const result = evaluate('array:remove([1, 2, 3], 2)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 3]);
        });

        it('should remove first element', () => {
            const result = evaluate('array:remove([1, 2, 3], 1)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([2, 3]);
        });

        it('should remove last element', () => {
            const result = evaluate('array:remove([1, 2, 3], 3)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2]);
        });
    });

    describe('array:insert-before', () => {
        it('should insert at beginning', () => {
            const result = evaluate('array:insert-before([2, 3], 1, 1)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });

        it('should insert in middle', () => {
            const result = evaluate('array:insert-before([1, 3], 2, 2)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });

        it('should insert at end', () => {
            const result = evaluate('array:insert-before([1, 2], 3, 3)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });
    });

    describe('array:head', () => {
        it('should return first element', () => {
            const result = evaluate('array:head([10, 20, 30])');
            expect(result).toBe(10);
        });

        it('should return only element of single-element array', () => {
            const result = evaluate('array:head([42])');
            expect(result).toBe(42);
        });

        it('should throw error for empty array', () => {
            expect(() => evaluate('array:head([])')).toThrow('FOAY0001');
        });
    });

    describe('array:tail', () => {
        it('should return all but first element', () => {
            const result = evaluate('array:tail([10, 20, 30])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([20, 30]);
        });

        it('should return empty array for single-element array', () => {
            const result = evaluate('array:tail([42])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([]);
        });

        it('should throw error for empty array', () => {
            expect(() => evaluate('array:tail([])')).toThrow('FOAY0001');
        });
    });

    describe('array:reverse', () => {
        it('should reverse array', () => {
            const result = evaluate('array:reverse([1, 2, 3])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([3, 2, 1]);
        });

        it('should handle empty array', () => {
            const result = evaluate('array:reverse([])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([]);
        });

        it('should handle single element', () => {
            const result = evaluate('array:reverse([42])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([42]);
        });
    });

    describe('array:join', () => {
        it('should join two arrays', () => {
            const result = evaluate('array:join(([1, 2], [3, 4]))');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3, 4]);
        });

        it('should join single array', () => {
            const result = evaluate('array:join([1, 2, 3])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });

        it('should handle empty sequence', () => {
            const result = evaluate('array:join(())');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([]);
        });
    });

    describe('array:flatten', () => {
        it('should flatten nested array', () => {
            const result = evaluate('array:flatten([[1, 2], [3, 4]])');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([1, 2, 3, 4]);
        });

        it('should flatten simple array', () => {
            const result = evaluate('array:flatten([1, 2, 3])');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([1, 2, 3]);
        });

        it('should handle deeply nested arrays', () => {
            const result = evaluate('array:flatten([[[1]], [[2]]])');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([1, 2]);
        });
    });

    describe('array:for-each', () => {
        it('should apply function to each element', () => {
            const result = evaluate('array:for-each([1, 2, 3], function($x) { $x * 2 })');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([2, 4, 6]);
        });

        it('should handle empty array', () => {
            const result = evaluate('array:for-each([], function($x) { $x * 2 })');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([]);
        });
    });

    describe('array:filter', () => {
        it('should filter elements by predicate', () => {
            const result = evaluate('array:filter([1, 2, 3, 4, 5], function($x) { $x > 2 })');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([3, 4, 5]);
        });

        it('should return empty array when no elements match', () => {
            const result = evaluate('array:filter([1, 2, 3], function($x) { $x > 10 })');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([]);
        });

        it('should return all elements when all match', () => {
            const result = evaluate('array:filter([1, 2, 3], function($x) { $x > 0 })');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 2, 3]);
        });
    });

    describe('array:fold-left', () => {
        it('should sum array elements', () => {
            const result = evaluate('array:fold-left([1, 2, 3, 4], 0, function($acc, $x) { $acc + $x })');
            expect(result).toBe(10);
        });

        it('should concatenate strings', () => {
            const result = evaluate('array:fold-left(["a", "b", "c"], "", function($acc, $x) { $acc || $x })');
            expect(result).toBe('abc');
        });

        it('should handle empty array', () => {
            const result = evaluate('array:fold-left([], 42, function($acc, $x) { $acc + $x })');
            expect(result).toBe(42);
        });
    });

    describe('array:fold-right', () => {
        it('should fold from right', () => {
            const result = evaluate('array:fold-right([1, 2, 3, 4], 0, function($x, $acc) { $acc + $x })');
            expect(result).toBe(10);
        });

        it('should concatenate strings in reverse order', () => {
            const result = evaluate('array:fold-right(["a", "b", "c"], "", function($x, $acc) { $acc || $x })');
            expect(result).toBe('cba');
        });

        it('should handle empty array', () => {
            const result = evaluate('array:fold-right([], 42, function($x, $acc) { $acc + $x })');
            expect(result).toBe(42);
        });
    });

    describe('array:sort', () => {
        it('should sort numbers', () => {
            const result = evaluate('array:sort([3, 1, 4, 1, 5, 9, 2, 6])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
        });

        it('should sort strings', () => {
            const result = evaluate('array:sort(["banana", "apple", "cherry"])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual(['apple', 'banana', 'cherry']);
        });

        it('should handle empty array', () => {
            const result = evaluate('array:sort([])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([]);
        });

        it('should handle single element', () => {
            const result = evaluate('array:sort([42])');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([42]);
        });
    });

    describe('Integration Tests', () => {
        it('should work with let expressions', () => {
            const result = evaluate('let $arr := [1, 2, 3] return array:size($arr)');
            expect(result).toBe(3);
        });

        it('should chain array operations', () => {
            const result = evaluate(`
                let $arr := [5, 3, 8, 1, 9]
                return array:size(array:filter($arr, function($x) { $x > 4 }))
            `);
            expect(result).toBe(3);
        });

        it('should work with nested arrays', () => {
            const result = evaluate('array:get([[1, 2], [3, 4]], 2)');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([3, 4]);
        });

        it('should combine with arrow operator', () => {
            const result = evaluate('[1, 2, 3] => array:reverse()');
            expect(isXPathArray(result)).toBe(true);
            expect(result.members).toEqual([3, 2, 1]);
        });

        it('should combine with simple map', () => {
            const result = evaluate('([1, 2], [3, 4]) ! array:size(.)');
            expect(result).toEqual([2, 2]);
        });
    });
});
