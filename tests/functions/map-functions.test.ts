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
