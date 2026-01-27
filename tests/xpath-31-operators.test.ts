/**
 * XPath 3.1 Phase 7: Operator and Expression Refinement Tests
 *
 * Tests operators and expressions with maps, arrays, and function types
 */

import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser';

function parseAndEval(xpath: string, context: any = {}) {
    const lexer = new XPathLexer('3.1');
    const tokens = lexer.scan(xpath);
    const parser = new XPath31Parser();
    const expr = parser.parse(tokens);
    return expr.evaluate(context);
}

describe('Phase 7: Operators with Maps/Arrays/Functions', () => {
    describe('7.1 Operators with Maps/Arrays', () => {
        it('should handle equality comparison with maps', () => {
            // Maps are compared by identity, not value
            const result = parseAndEval('map { "a": 1 } = map { "a": 1 }');
            expect(typeof result).toBe('boolean');
        });

        it('should handle equality comparison with arrays', () => {
            // Arrays are compared by identity, not value
            const result = parseAndEval('[1, 2, 3] = [1, 2, 3]');
            expect(typeof result).toBe('boolean');
        });

        it('should allow maps in sequence construction', () => {
            const result = parseAndEval('(map { "a": 1 }, map { "b": 2 })');
            expect(Array.isArray(result)).toBe(true);
            if (Array.isArray(result)) {
                expect(result.length).toBe(2);
            }
        });

        it('should allow arrays in sequence construction', () => {
            const result = parseAndEval('([1, 2], [3, 4])');
            expect(Array.isArray(result)).toBe(true);
            if (Array.isArray(result)) {
                expect(result.length).toBe(2);
            }
        });

        it('should handle empty sequence with maps', () => {
            const result = parseAndEval('() = map { "a": 1 }');
            expect(result).toBe(false);
        });

        it('should handle string concatenation with map values', () => {
            const result = parseAndEval('map { "a": 1 }?a || " items"');
            expect(result).toBe('1 items');
        });

        it('should handle string concatenation with array members', () => {
            const result = parseAndEval('["hello"]?1 || " world"');
            expect(result).toBe('hello world');
        });

        it('should allow maps in conditional expressions', () => {
            const result = parseAndEval(
                'if (map:size(map { "a": 1 }) > 0) then "has items" else "empty"'
            );
            expect(result).toBe('has items');
        });

        it('should allow arrays in conditional expressions', () => {
            const result = parseAndEval('if (array:size([1, 2, 3]) > 2) then "large" else "small"');
            expect(result).toBe('large');
        });
    });

    describe('7.2 Dynamic Function Calls with Maps/Arrays', () => {
        it('should call map as function with key', () => {
            const result = parseAndEval('let $m := map { "a": 1, "b": 2 } return $m("a")');
            expect(result).toBe(1);
        });

        it('should call array as function with position', () => {
            const result = parseAndEval('let $a := [10, 20, 30] return $a(2)');
            expect(result).toBe(20);
        });

        it('should handle map function call in expression', () => {
            const result = parseAndEval('(map { "x": 5, "y": 10 })("y") * 2');
            expect(result).toBe(20);
        });

        it('should handle array function call in expression', () => {
            const result = parseAndEval('([100, 200, 300])(1) + 50');
            expect(result).toBe(150);
        });

        it('should allow map calls in let bindings', () => {
            const result = parseAndEval(
                'let $m := map { "key": "value" }, $v := $m("key") return $v'
            );
            expect(result).toBe('value');
        });

        it('should allow array calls in for loops', () => {
            const result = parseAndEval('for $i in (1, 2, 3) return ([10, 20, 30])($i)');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([10, 20, 30]);
        });

        it('should handle nested map function calls', () => {
            const result = parseAndEval(
                'let $outer := map { "outer": map { "inner": 42 } }("outer") return $outer("inner")'
            );
            expect(result).toBe(42);
        });

        it('should handle map function call with dynamic key', () => {
            const result = parseAndEval('let $key := "value" return map { "value": 123 }($key)');
            expect(result).toBe(123);
        });

        it('should handle array function call with computed position', () => {
            const result = parseAndEval('let $pos := 1 + 1 return [5, 10, 15]($pos)');
            expect(result).toBe(10);
        });

        it('should throw error for invalid map key', () => {
            expect(() => parseAndEval('map { "a": 1 }("b")')).toThrow();
        });

        it('should throw error for out-of-bounds array position', () => {
            expect(() => parseAndEval('[1, 2, 3](5)')).toThrow(/FOAY0001/);
        });
    });

    describe('7.3 Instance-of and Cast with New Types', () => {
        it('should verify map matches function(*)', () => {
            const result = parseAndEval('map { "a": 1 } instance of function(*)');
            expect(result).toBe(true);
        });

        it('should verify array matches function(*)', () => {
            const result = parseAndEval('[1, 2, 3] instance of function(*)');
            expect(result).toBe(true);
        });

        it('should verify map matches map(*)', () => {
            const result = parseAndEval('map { "a": 1 } instance of map(*)');
            expect(result).toBe(true);
        });

        it('should verify array matches array(*)', () => {
            const result = parseAndEval('[1, 2, 3] instance of array(*)');
            expect(result).toBe(true);
        });

        it('should verify typed map matching', () => {
            const result = parseAndEval(
                'map { "a": 1, "b": 2 } instance of map(xs:string, xs:integer)'
            );
            expect(result).toBe(true);
        });

        it('should verify typed array matching', () => {
            const result = parseAndEval('[1, 2, 3] instance of array(xs:integer)');
            expect(result).toBe(true);
        });

        it('should reject wrong map type', () => {
            const result = parseAndEval(
                'map { "a": "string" } instance of map(xs:string, xs:integer)'
            );
            expect(result).toBe(false);
        });

        it('should reject wrong array type', () => {
            const result = parseAndEval('["a", "b"] instance of array(xs:integer)');
            expect(result).toBe(false);
        });

        it('should allow treat-as with maps', () => {
            const result = parseAndEval('map { "a": 1 } treat as map(*) instance of map(*)');
            expect(result).toBe(true);
        });

        it('should allow treat-as with arrays', () => {
            const result = parseAndEval('[1, 2, 3] treat as array(*) instance of array(*)');
            expect(result).toBe(true);
        });

        it('should handle occurrence indicators with maps', () => {
            const result = parseAndEval('(map { "a": 1 }, map { "b": 2 }) instance of map(*)+');
            expect(result).toBe(true);
        });

        it('should handle occurrence indicators with arrays', () => {
            const result = parseAndEval('([1, 2], [3, 4]) instance of array(*)+');
            expect(result).toBe(true);
        });
    });

    describe('7.4 String and Number Conversions', () => {
        it('should convert map size to string', () => {
            const result = parseAndEval('string(map:size(map { "a": 1, "b": 2 }))');
            expect(result).toBe('2');
        });

        it('should convert array size to string', () => {
            const result = parseAndEval('string(array:size([1, 2, 3, 4]))');
            expect(result).toBe('4');
        });

        it('should concatenate strings with map/array operations', () => {
            const result = parseAndEval('"Size: " || string(map:size(map { "x": 1 }))');
            expect(result).toBe('Size: 1');
        });

        it('should handle number conversion in arithmetic', () => {
            const result = parseAndEval('map:size(map { "a": 1 }) + array:size([1, 2])');
            expect(result).toBe(3);
        });

        it('should handle boolean conversion with maps', () => {
            const result = parseAndEval('if (map { "a": 1 }) then "truthy" else "falsy"');
            expect(result).toBe('truthy');
        });

        it('should handle boolean conversion with arrays', () => {
            const result = parseAndEval('if ([1, 2, 3]) then "truthy" else "falsy"');
            expect(result).toBe('truthy');
        });

        it('should handle boolean conversion with empty map', () => {
            const result = parseAndEval('if (map { }) then "truthy" else "falsy"');
            expect(result).toBe('truthy'); // Empty map is still truthy
        });

        it('should handle boolean conversion with empty array', () => {
            const result = parseAndEval('if ([ ]) then "truthy" else "falsy"');
            expect(result).toBe('truthy'); // Empty array is still truthy
        });
    });

    describe('7.5 Arrow Operator with Maps/Arrays', () => {
        it('should use arrow operator with map functions', () => {
            const result = parseAndEval('map { "a": 1, "b": 2 } => map:size()');
            expect(result).toBe(2);
        });

        it('should use arrow operator with array functions', () => {
            const result = parseAndEval('[1, 2, 3] => array:size()');
            expect(result).toBe(3);
        });

        it('should chain arrow operators with maps', () => {
            const result = parseAndEval('map { "a": 1, "b": 2 } => map:keys() => count()');
            expect(result).toBe(2);
        });

        it('should chain arrow operators with arrays', () => {
            const result = parseAndEval('[1, 2, 3] => array:reverse() => array:head()');
            expect(result).toBe(3);
        });

        it('should use arrow operator with lookup', () => {
            const result = parseAndEval(
                'map { "data": [1, 2, 3] } => map:get("data") => array:size()'
            );
            expect(result).toBe(3);
        });
    });

    describe('7.6 Complex Type Interactions', () => {
        it('should handle map of arrays', () => {
            const result = parseAndEval('map { "nums": [1, 2, 3] }?nums?2');
            expect(result).toBe(2);
        });

        it('should handle array of maps', () => {
            const result = parseAndEval('[map { "a": 1 }, map { "b": 2 }]?1?a');
            expect(result).toBe(1);
        });

        it('should handle nested lookups', () => {
            const result = parseAndEval(
                'map { "data": map { "items": [10, 20, 30] } }?data?items?2'
            );
            expect(result).toBe(20);
        });

        it('should handle wildcard with nested structures', () => {
            const result = parseAndEval('map { "a": 1, "b": 2, "c": 3 }?*');
            expect(Array.isArray(result)).toBe(true);
            if (Array.isArray(result)) {
                expect(result.length).toBe(3);
            }
        });

        it('should allow maps in higher-order functions', () => {
            const result = parseAndEval(
                'for-each([1, 2, 3], function($x) { map { "value": $x } })'
            );
            // for-each returns sequence of maps
            expect(result).toBeDefined();
        });

        it('should allow arrays in filter operations', () => {
            const result = parseAndEval(
                'filter([[1], [2, 3], [4, 5, 6]], function($a) { array:size($a) > 1 })'
            );
            // filter returns filtered sequence
            expect(result).toBeDefined();
        });
    });

    describe('7.7 Error Handling', () => {
        it('should handle type errors gracefully', () => {
            expect(() => parseAndEval('"string" instance of map(*)')).not.toThrow();
            expect(parseAndEval('"string" instance of map(*)')).toBe(false);
        });

        it('should handle invalid lookups gracefully', () => {
            const result = parseAndEval('map { }?nonexistent');
            // Empty map lookup returns empty sequence, not error
            expect(result).toBeUndefined();
        });

        it('should handle arithmetic with non-numeric values', () => {
            expect(() => parseAndEval('map { "a": 1 } + 5')).toThrow();
        });

        it('should provide clear error for wrong arity', () => {
            expect(() => parseAndEval('let $m := map { "a": 1 } return $m("a", "b")')).toThrow();
        });
    });
});
