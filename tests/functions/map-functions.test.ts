import { XPathLexer } from '../../src/lexer/lexer';
import { XPath31Parser } from '../../src/parser';
import { XPathContext } from '../../src/context';
import { isXPathMap } from '../../src/expressions/map-constructor-expression';

function evaluate(xpath: string, context: XPathContext = {}): any {
    const lexer = new XPathLexer('3.1');
    const parser = new XPath31Parser();
    const tokens = lexer.scan(xpath);
    const expr = parser.parse(tokens);
    return expr.evaluate(context);
}

describe('XPath 3.1 Map Functions', () => {
    test('map:size', () => {
        const result = evaluate('map:size(map { "a": 1, "b": 2 })');
        expect(result).toBe(2);
    });

    test('map:keys', () => {
        const result = evaluate('map:keys(map { "a": 1, "b": 2 })');
        expect(Array.isArray(result)).toBe(true);
        expect(result.sort()).toEqual(['a', 'b']);
    });

    test('map:contains', () => {
        expect(evaluate('map:contains(map { "a": 1 }, "a")')).toBe(true);
        expect(evaluate('map:contains(map { "a": 1 }, "b")')).toBe(false);
    });

    test('map:get', () => {
        expect(evaluate('map:get(map { "a": 1 }, "a")')).toBe(1);
        expect(evaluate('map:get(map { "a": 1 }, "b")')).toBeUndefined();
    });

    test('map:put and immutability', () => {
        const result = evaluate('map:put(map { "a": 1 }, "b", 2)');
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(1);
        expect(result.b).toBe(2);

        const tuple = evaluate('let $m := map { "a": 1 } return (map:put($m, "a", 99), $m)');
        expect(Array.isArray(tuple)).toBe(true);
        expect(tuple[0].a).toBe(99);
        expect(tuple[1].a).toBe(1);
    });

    test('map:entry', () => {
        const result = evaluate('map:entry("x", 42)');
        expect(isXPathMap(result)).toBe(true);
        expect(result.x).toBe(42);
    });

    test('map:merge', () => {
        const result = evaluate('map:merge((map { "a": 1 }, map { "b": 2 }, map { "a": 3 }))');
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(3); // last wins
        expect(result.b).toBe(2);
    });

    test('map:merge with use-last option (explicit)', () => {
        const result = evaluate(
            'map:merge((map { "a": 1 }, map { "b": 2 }, map { "a": 3 }), map { "duplicates": "use-last" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(3); // last value wins
        expect(result.b).toBe(2);
    });

    test('map:merge with use-first option', () => {
        const result = evaluate(
            'map:merge((map { "a": 1 }, map { "b": 2 }, map { "a": 3 }), map { "duplicates": "use-first" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(1); // first value wins
        expect(result.b).toBe(2);
    });

    test('map:merge with combine option (arrays)', () => {
        const result = evaluate(
            'map:merge((map { "a": 1 }, map { "b": 2 }, map { "a": 3 }), map { "duplicates": "combine" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(Array.isArray(result.a)).toBe(true);
        expect(result.a).toEqual([1, 3]); // values combined
        expect(result.b).toBe(2);
    });

    test('map:merge with combine option (multiple duplicates)', () => {
        const result = evaluate(
            'map:merge((map { "x": "a" }, map { "x": "b" }, map { "x": "c" }), map { "duplicates": "combine" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(Array.isArray(result.x)).toBe(true);
        expect(result.x).toEqual(['a', 'b', 'c']);
    });

    test('map:merge with combine option (nested arrays)', () => {
        const result = evaluate(
            'map:merge((map { "data": [1, 2] }, map { "data": [3, 4] }), map { "duplicates": "combine" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(Array.isArray(result.data)).toBe(true);
        // combine creates an array with both values as elements
        expect(result.data.length).toBe(2);
        // XPath arrays are represented as objects with __isArray and members
        if (result.data[0].__isArray) {
            expect(result.data[0].members).toEqual([1, 2]);
            expect(result.data[1].members).toEqual([3, 4]);
        } else {
            expect(result.data[0]).toEqual([1, 2]);
            expect(result.data[1]).toEqual([3, 4]);
        }
    });

    test('map:merge with reject option (no duplicates)', () => {
        const result = evaluate(
            'map:merge((map { "a": 1 }, map { "b": 2 }), map { "duplicates": "reject" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(1);
        expect(result.b).toBe(2);
    });

    test('map:merge with reject option (throws on duplicate)', () => {
        expect(() => {
            evaluate(
                'map:merge((map { "a": 1 }, map { "b": 2 }, map { "a": 3 }), map { "duplicates": "reject" })'
            );
        }).toThrow();
    });

    test('map:merge with reject option (single map)', () => {
        const result = evaluate(
            'map:merge((map { "a": 1, "b": 2 }), map { "duplicates": "reject" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(1);
        expect(result.b).toBe(2);
    });

    test('map:merge with use-first on multiple conflicts', () => {
        const result = evaluate(
            'map:merge((map { "a": 1, "b": 10 }, map { "a": 2, "c": 20 }, map { "b": 30 }), map { "duplicates": "use-first" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(1); // first occurrence
        expect(result.b).toBe(10); // first occurrence
        expect(result.c).toBe(20); // no duplicate
    });

    test('map:merge with empty maps', () => {
        const result = evaluate(
            'map:merge((map { }, map { "a": 1 }), map { "duplicates": "use-first" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(1);
    });

    test('map:merge with combine and no duplicates', () => {
        const result = evaluate(
            'map:merge((map { "a": 1 }, map { "b": 2 }), map { "duplicates": "combine" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(1);
        expect(result.b).toBe(2);
    });

    test('map:merge invalid duplicates option throws error', () => {
        expect(() => {
            evaluate(
                'map:merge((map { "a": 1 }), map { "duplicates": "invalid-option" })'
            );
        }).toThrow();
    });

    test('map:merge with complex values and use-last', () => {
        const result = evaluate(
            'map:merge((map { "data": map { "x": 1 } }, map { "data": map { "x": 2 } }), map { "duplicates": "use-last" })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(isXPathMap(result.data)).toBe(true);
        expect(result.data.x).toBe(2); // last map wins
    });

    test('map:for-each', () => {
        const result = evaluate(
            'map:for-each(map { "a": 1, "b": 2 }, function($k, $v) { $v * 2 })'
        );
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBe(2);
        expect(result.b).toBe(4);
    });

    test('map:remove', () => {
        const result = evaluate('map:remove(map { "a": 1, "b": 2 }, ("a"))');
        expect(isXPathMap(result)).toBe(true);
        expect(result.a).toBeUndefined();
        expect(result.b).toBe(2);
    });
});
