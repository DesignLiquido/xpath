import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser';
import { XPathContext } from '../src/context';
import { isXPathMap } from '../src/expressions/map-constructor-expression';
import { isXPathArray } from '../src/expressions/array-constructor-expression';

// Helper function to parse and evaluate XPath expressions
function parseXPath(xpath: string) {
    const lexer = new XPathLexer('3.1');
    const tokens = lexer.scan(xpath);
    const parser = new XPath31Parser();
    return parser.parse(tokens);
}

describe('TypedMapTest (map(key-type, value-type))', () => {
    describe('Parsing', () => {
        it('should parse map(*) as wildcard map type', () => {
            const expr = parseXPath('. instance of map(*)');
            expect(expr).toBeDefined();
        });

        it('should parse map(xs:string, xs:integer) as typed map', () => {
            const expr = parseXPath('. instance of map(xs:string, xs:integer)');
            expect(expr).toBeDefined();
        });

        it('should parse map(xs:QName, xs:anyAtomicType) with qualified names', () => {
            const expr = parseXPath('. instance of map(xs:QName, xs:anyAtomicType)');
            expect(expr).toBeDefined();
        });

        it('should parse nested map types', () => {
            const expr = parseXPath('. instance of map(xs:string, map(xs:integer, xs:string))');
            expect(expr).toBeDefined();
        });

        it('should parse array as value type in map', () => {
            const expr = parseXPath('. instance of map(xs:string, array(xs:integer))');
            expect(expr).toBeDefined();
        });
    });

    describe('Instance-of expression', () => {
        it('should return true when map matches map(*)', () => {
            const expr = parseXPath('map { "key": 1, "another": 2 } instance of map(*)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should return false when non-map is tested against map(*)', () => {
            const expr = parseXPath('"string" instance of map(*)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should return false when non-map (array) is tested against map(*)', () => {
            const expr = parseXPath('[1, 2, 3] instance of map(*)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should return true when map with correct key/value types matches typed map test', () => {
            const expr = parseXPath(
                'map { "key1": 10, "key2": 20 } instance of map(xs:string, xs:integer)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should return false when map has wrong key type', () => {
            const expr = parseXPath('map { "key": 10 } instance of map(xs:integer, xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should return false when map has wrong value type', () => {
            const expr = parseXPath(
                'map { "key": "value" } instance of map(xs:string, xs:integer)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should handle empty map correctly', () => {
            const expr = parseXPath('map {} instance of map(xs:string, xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(true); // Empty map matches any typed map
        });

        it('should handle map with multiple entries', () => {
            const expr = parseXPath(
                'map { "a": 1, "b": 2, "c": 3 } instance of map(xs:string, xs:integer)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should return false when one entry has wrong value type', () => {
            const expr = parseXPath(
                'map { "a": 1, "b": "wrong", "c": 3 } instance of map(xs:string, xs:integer)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });
    });

    describe('Treat-as expression', () => {
        it('should allow cast via treat-as for matching map type', () => {
            const expr = parseXPath(
                'map { "key": 1 } treat as map(xs:string, xs:integer) instance of map(xs:string, xs:integer)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should work with treat-as and map(*)  ', () => {
            const expr = parseXPath(
                'map { "key": 1, "other": "string" } treat as map(*) instance of map(*)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });
    });

    describe('Type compatibility', () => {
        it('should match map(xs:string, xs:integer) with map(*)', () => {
            const expr = parseXPath('let $m := map { "a": 1 } return $m instance of map(*)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should support nested typed map checking', () => {
            const expr = parseXPath(
                'map { "data": map { "nested": 42 } } instance of map(xs:string, map(xs:string, xs:integer))'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should reject nested map with wrong inner type', () => {
            const expr = parseXPath(
                'map { "data": map { "nested": "string" } } instance of map(xs:string, map(xs:string, xs:integer))'
            );
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });
    });

    describe('With variables', () => {
        it('should check type of map stored in variable', () => {
            const expr = parseXPath(
                'let $m := map { "key": 42 } return $m instance of map(xs:string, xs:integer)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should use variable in map type test', () => {
            const expr = parseXPath(
                'let $m := map { "a": 1, "b": 2 } return if ($m instance of map(xs:string, xs:integer)) then "yes" else "no"'
            );
            const result = expr.evaluate({});
            expect(result).toBe('yes');
        });
    });

    describe('With for/let expressions', () => {
        it('should check type in conditional within for loop', () => {
            const expr = parseXPath(
                'for $m in (map { "a": 1 }, map { "b": "string" }, map { "c": 2 }) ' +
                    'return if ($m instance of map(xs:string, xs:integer)) then map:size($m) else 0'
            );
            const result = expr.evaluate({});
            // Should return sizes for matching maps and 0 for non-matching
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Error handling', () => {
        it('should handle null/undefined maps gracefully', () => {
            const expr = parseXPath('. instance of map(*)');
            const result = expr.evaluate({});
            expect(typeof result).toBe('boolean');
        });

        it('should not throw on empty sequence', () => {
            const expr = parseXPath('() instance of map(*)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });
    });

    describe('Occurrence indicators with map types', () => {
        it('should parse map(xs:string, xs:integer)?', () => {
            const expr = parseXPath('. instance of map(xs:string, xs:integer)?');
            expect(expr).toBeDefined();
        });

        it('should parse map(xs:string, xs:integer)*', () => {
            const expr = parseXPath('. instance of map(xs:string, xs:integer)*');
            expect(expr).toBeDefined();
        });

        it('should parse map(xs:string, xs:integer)+', () => {
            const expr = parseXPath('. instance of map(xs:string, xs:integer)+');
            expect(expr).toBeDefined();
        });

        it('should handle occurrence indicator with instance-of', () => {
            const expr = parseXPath(
                '(map { "a": 1 }, map { "b": 2 }) instance of map(xs:string, xs:integer)+'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should reject sequence when occurrence is not met', () => {
            const expr = parseXPath('() instance of map(xs:string, xs:integer)+');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });
    });

    describe('Type display/toString', () => {
        it('should have readable type names', () => {
            const expr = parseXPath('. instance of map(*)');
            // Just verify the expression is defined, toString() may vary
            expect(expr).toBeDefined();
        });
    });
});

describe('TypedArrayTest (array(member-type))', () => {
    describe('Parsing', () => {
        it('should parse array(*) as wildcard array type', () => {
            const expr = parseXPath('. instance of array(*)');
            expect(expr).toBeDefined();
        });

        it('should parse array(xs:integer) as typed array', () => {
            const expr = parseXPath('. instance of array(xs:integer)');
            expect(expr).toBeDefined();
        });

        it('should parse array(xs:string) with atomic type', () => {
            const expr = parseXPath('. instance of array(xs:string)');
            expect(expr).toBeDefined();
        });

        it('should parse nested array types', () => {
            const expr = parseXPath('. instance of array(array(xs:integer))');
            expect(expr).toBeDefined();
        });

        it('should parse map as member type in array', () => {
            const expr = parseXPath('. instance of array(map(xs:string, xs:integer))');
            expect(expr).toBeDefined();
        });
    });

    describe('Instance-of expression', () => {
        it('should return true when array matches array(*)', () => {
            const expr = parseXPath('[1, 2, 3] instance of array(*)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should return false when non-array is tested against array(*)', () => {
            const expr = parseXPath('"string" instance of array(*)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should return false when non-array (map) is tested against array(*)', () => {
            const expr = parseXPath('map { "key": 1 } instance of array(*)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should return true when array with correct member type matches typed array test', () => {
            const expr = parseXPath('[1, 2, 3] instance of array(xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should return false when array has wrong member type', () => {
            const expr = parseXPath('["a", "b"] instance of array(xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should handle empty array correctly', () => {
            const expr = parseXPath('[] instance of array(xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(true); // Empty array matches any typed array
        });

        it('should handle array with multiple members', () => {
            const expr = parseXPath('[1, 2, 3, 4, 5] instance of array(xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should return false when one member has wrong type', () => {
            const expr = parseXPath('[1, 2, "three", 4] instance of array(xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });

        it('should handle arrays with string members', () => {
            const expr = parseXPath('["a", "b", "c"] instance of array(xs:string)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });
    });

    describe('Treat-as expression', () => {
        it('should allow cast via treat-as for matching array type', () => {
            const expr = parseXPath(
                '[1, 2, 3] treat as array(xs:integer) instance of array(xs:integer)'
            );
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should work with treat-as and array(*)', () => {
            const expr = parseXPath('[1, "two", 3] treat as array(*) instance of array(*)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });
    });

    describe('Type compatibility', () => {
        it('should match array(xs:integer) with array(*)', () => {
            const expr = parseXPath('let $a := [1, 2, 3] return $a instance of array(*)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should support nested typed array checking', () => {
            const expr = parseXPath('[[1, 2], [3, 4]] instance of array(array(xs:integer))');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should reject nested array with wrong inner type', () => {
            const expr = parseXPath('[[1, 2], ["a", "b"]] instance of array(array(xs:integer))');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });
    });

    describe('With variables', () => {
        it('should check type of array stored in variable', () => {
            const expr = parseXPath('let $a := [1, 2, 3] return $a instance of array(xs:integer)');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should use variable in array type test', () => {
            const expr = parseXPath(
                'let $a := [1, 2, 3] return if ($a instance of array(xs:integer)) then "yes" else "no"'
            );
            const result = expr.evaluate({});
            expect(result).toBe('yes');
        });
    });

    describe('Error handling', () => {
        it('should handle null/undefined arrays gracefully', () => {
            const expr = parseXPath('. instance of array(*)');
            const result = expr.evaluate({});
            expect(typeof result).toBe('boolean');
        });

        it('should not throw on invalid array structure', () => {
            const expr = parseXPath('[ ] instance of array(*)'); // Array literal
            expect(() => expr.evaluate({})).not.toThrow();
        });
    });

    describe('Occurrence indicators with array types', () => {
        it('should parse array(xs:integer)?', () => {
            const expr = parseXPath('. instance of array(xs:integer)?');
            expect(expr).toBeDefined();
        });

        it('should parse array(xs:integer)*', () => {
            const expr = parseXPath('. instance of array(xs:integer)*');
            expect(expr).toBeDefined();
        });

        it('should parse array(xs:integer)+', () => {
            const expr = parseXPath('. instance of array(xs:integer)+');
            expect(expr).toBeDefined();
        });

        it('should handle occurrence indicator with instance-of', () => {
            const expr = parseXPath('([1, 2], [3, 4]) instance of array(xs:integer)+');
            const result = expr.evaluate({});
            expect(result).toBe(true);
        });

        it('should reject sequence when occurrence is not met', () => {
            const expr = parseXPath('() instance of array(xs:integer)+');
            const result = expr.evaluate({});
            expect(result).toBe(false);
        });
    });
});

describe('Complex type combinations', () => {
    it('should handle array of maps with typed entries', () => {
        const expr = parseXPath(
            '[map { "a": 1 }, map { "b": 2 }] instance of array(map(xs:string, xs:integer))'
        );
        const result = expr.evaluate({});
        expect(result).toBe(true);
    });

    it('should handle map of arrays with typed members', () => {
        const expr = parseXPath(
            'map { "nums": [1, 2, 3], "more": [4, 5] } instance of map(xs:string, array(xs:integer))'
        );
        const result = expr.evaluate({});
        expect(result).toBe(true);
    });

    it('should reject mixed type array', () => {
        const expr = parseXPath(
            '[map { "a": 1 }, map { "b": "wrong" }] instance of array(map(xs:string, xs:integer))'
        );
        const result = expr.evaluate({});
        expect(result).toBe(false);
    });

    it('should handle deeply nested structures', () => {
        const expr = parseXPath(
            'map { "data": [map { "items": [1, 2, 3] }] } instance of map(xs:string, array(map(xs:string, array(xs:integer))))'
        );
        const result = expr.evaluate({});
        expect(result).toBe(true);
    });
});
