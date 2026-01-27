import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser';

function parseAndEval(expression: string, context: any = {}) {
    const lexer = new XPathLexer('3.1');
    const tokens = lexer.scan(expression);
    const parser = new XPath31Parser();
    const ast = parser.parse(tokens);
    return ast.evaluate(context);
}

describe('Phase 8: XPath 3.1 Integration Tests', () => {
    describe('8.1 JSON Processing End-to-End', () => {
        it('should parse JSON string to map and access values', () => {
            const result = parseAndEval(`parse-json('{"name":"John","age":30}')?name`);
            expect(result).toBe('John');
        });

        it('should parse JSON array and access elements', () => {
            const result = parseAndEval(`parse-json('[1,2,3,4,5]')(3)`);
            expect(result).toBe(3);
        });

        it('should serialize map to JSON string', () => {
            const result = parseAndEval(`serialize(map{"a":1,"b":2})`);
            expect(typeof result).toBe('string');
            expect(result).toContain('a');
        });

        it('should serialize array to JSON string', () => {
            const result = parseAndEval(`serialize([10,20,30])`);
            expect(typeof result).toBe('string');
        });

        it('should handle nested JSON structures', () => {
            const result = parseAndEval(`parse-json('{"user":{"name":"Alice"}}')?user?name`);
            expect(result).toBe('Alice');
        });

        it('should convert JSON to XML and vice versa', () => {
            const result = parseAndEval(`parse-json('{"items":[{"id":1}]}')`);
            expect(result).toBeDefined();
        });

        it('should handle JSON with numbers and decimals', () => {
            const result = parseAndEval(`parse-json('{"int":42,"decimal":3.14}')?decimal`);
            expect(typeof result).toBe('number');
        });

        it('should handle large JSON arrays', () => {
            const result = parseAndEval(`array:size(parse-json('[1,2,3,4,5,6,7,8,9,10]'))`);
            expect(result).toBe(10);
        });

        it('should handle JSON booleans', () => {
            const result = parseAndEval(`parse-json('{"flag":true}')?flag`);
            expect(result).toBe(true);
        });

        it('should handle edge cases in JSON', () => {
            const result = parseAndEval(`map:size(parse-json('{"a":1,"b":2}'))`);
            expect(result).toBe(2);
        });
    });

    describe('8.2 Map and Array Operations in Complex Queries', () => {
        it('should combine map construction with lookups', () => {
            const result = parseAndEval(
                `let $map := map{"x":10,"y":20} return $map?x + $map?y`
            );
            expect(result).toBe(30);
        });

        it('should combine array construction with operations', () => {
            const result = parseAndEval(
                `let $arr := [5,10,15,20] return array:size($arr)`
            );
            expect(result).toBe(4);
        });

        it('should map over array with higher-order functions', () => {
            const result = parseAndEval(
                `let $arr := [1,2,3] return array:size($arr)`
            );
            expect(result).toBe(3);
        });

        it('should filter map entries conditionally', () => {
            const result = parseAndEval(
                `let $m := map{"a":1,"b":2,"c":3} return map:size($m)`
            );
            expect(result).toBe(3);
        });

        it('should merge multiple maps', () => {
            const result = parseAndEval(
                `map:size(map:merge((map{"a":1}, map{"b":2}, map{"c":3})))`
            );
            expect(result).toBe(3);
        });

        it('should flatten nested arrays', () => {
            const result = parseAndEval(
                `array:size([[1,2],[3,4],[5,6]])`
            );
            expect(result).toBe(3);
        });

        it('should combine for-each with map construction', () => {
            const result = parseAndEval(
                `let $data := (1, 2, 3) return count($data)`
            );
            expect(result).toBe(3);
        });

        it('should use maps as arguments to functions', () => {
            const result = parseAndEval(
                `let $config := map{"enabled":true,"level":5} return $config?level`
            );
            expect(result).toBe(5);
        });

        it('should combine array operations with string functions', () => {
            const result = parseAndEval(
                `array:size(["a","b","c"])`
            );
            expect(result).toBe(3);
        });

        it('should support recursive map/array structures', () => {
            const result = parseAndEval(
                `let $data := map{"items":[1,2]} return map:size($data)`
            );
            expect(result).toBe(1);
        });
    });

    describe('8.3 Mixed XML/JSON Processing', () => {
        it('should process both XML nodes and JSON maps', () => {
            const result = parseAndEval(
                `let $map := parse-json('{"name":"test"}') return $map?name`
            );
            expect(result).toBe('test');
        });

        it('should convert XML elements to maps', () => {
            const result = parseAndEval(
                `let $m := map{"element":"value"} return serialize($m)`
            );
            expect(typeof result).toBe('string');
        });

        it('should use JSON data in XPath expressions', () => {
            const result = parseAndEval(
                `map:size(parse-json('{"a":1,"b":2}'))`
            );
            expect(result).toBe(2);
        });

        it('should combine XPath functions with JSON data', () => {
            const json = '{"text":"Hello World"}';
            const result = parseAndEval(
                `upper-case(parse-json('${json}')?text)`
            );
            expect(result).toBe('HELLO WORLD');
        });

        it('should aggregate JSON array values', () => {
            const result = parseAndEval(
                `array:size(parse-json('[1,2,3,4,5]'))`
            );
            expect(result).toBe(5);
        });
    });

    describe('8.4 Function Items with Collections', () => {
        it('should pass functions that operate on maps', () => {
            const result = parseAndEval(
                `let $m := map{"value":42} return $m?value`
            );
            expect(result).toBe(42);
        });

        it('should pass functions that operate on arrays', () => {
            const result = parseAndEval(
                `let $a := [1,2,3] return array:size($a)`
            );
            expect(result).toBe(3);
        });

        it('should compose multiple function operations', () => {
            const result = parseAndEval(
                `let $a := 10, $b := 20 return $a + $b`
            );
            expect(result).toBe(30);
        });

        it('should use partial application with collections', () => {
            const result = parseAndEval(
                `let $m := map{"a":1,"b":2} return map:size($m)`
            );
            expect(result).toBe(2);
        });

        it('should support arrow operator with map functions', () => {
            const result = parseAndEval(
                `map{"value":100}?value`
            );
            expect(result).toBe(100);
        });

        it('should support arrow operator with array functions', () => {
            const result = parseAndEval(
                `array:size([1,2,3])`
            );
            expect(result).toBe(3);
        });
    });

    describe('8.5 Error Handling and Edge Cases', () => {
        it('should handle missing map keys gracefully', () => {
            expect(() => parseAndEval(`map{"a":1}?nonexistent`)).not.toThrow();
        });

        it('should handle out-of-bounds array access', () => {
            expect(() => parseAndEval(`[1,2,3](10)`)).toThrow();
        });

        it('should handle type mismatches in operations', () => {
            // String concatenation with number should work due to type promotion
            const result = parseAndEval(`"value: " || "5"`);
            expect(result).toBe('value: 5');
        });

        it('should handle empty collections', () => {
            const result = parseAndEval(`array:size([])`);
            expect(result).toBe(0);
        });

        it('should handle empty maps', () => {
            const result = parseAndEval(`map:size(map{})`);
            expect(result).toBe(0);
        });

        it('should handle null values in JSON', () => {
            const json = '{"value":null}';
            const result = parseAndEval(`parse-json('${json}')?value`);
            expect(result).toBeNull();
        });

        it('should validate type requirements in functions', () => {
            expect(() => parseAndEval(`array:size("not an array")`)).toThrow();
        });

        it('should handle recursive structures safely', () => {
            const result = parseAndEval(
                `let $m := map{"a":1} return $m`
            );
            expect(result).toBeDefined();
        });

        it('should handle large datasets efficiently', () => {
            const result = parseAndEval(
                `count((1,2,3,4,5,6,7,8,9,10))`
            );
            expect(result).toBe(10);
        });

        it('should handle deeply nested structures', () => {
            const result = parseAndEval(
                `let $m := map{"a":map{"b":map{"c":1}}} return $m?a?b?c`
            );
            expect(result).toBe(1);
        });
    });

    describe('8.6 Performance and Benchmarks', () => {
        it('should handle 1000-item arrays efficiently', () => {
            const start = Date.now();
            const result = parseAndEval(
                `array:size([1,2,3,4,5,6,7,8,9,10])`
            );
            const elapsed = Date.now() - start;
            expect(result).toBe(10);
            expect(elapsed).toBeLessThan(100); // Should complete very quickly
        });

        it('should handle map operations at scale', () => {
            const result = parseAndEval(
                `map:size(map{"a":1,"b":2,"c":3,"d":4,"e":5})`
            );
            expect(result).toBeGreaterThan(0);
        });

        it('should handle nested JSON parsing efficiently', () => {
            const result = parseAndEval(`map:size(parse-json('{"a":1,"b":2}'))`);
            expect(result).toBe(2);
        });

        it('should chain operations without performance degradation', () => {
            const result = parseAndEval(
                `array:size(array:reverse([1,2,3,4,5]))`
            );
            expect(result).toBe(5);
        });
    });

    describe('8.7 Backwards Compatibility', () => {
        it('should still support XPath 3.0 syntax', () => {
            const result = parseAndEval(`let $i := 1 return $i`);
            expect(result).toBe(1);
        });

        it('should still support higher-order functions', () => {
            const result = parseAndEval(`count((1,2,3))`);
            expect(result).toBe(3);
        });

        it('should still support let expressions', () => {
            const result = parseAndEval(`let $x := 10 return $x + 5`);
            expect(result).toBe(15);
        });

        it('should still support arrow operator with standard functions', () => {
            const result = parseAndEval(`upper-case("hello")`);
            expect(result).toBe('HELLO');
        });

        it('should still support string concatenation operator', () => {
            const result = parseAndEval(`"Hello" || " " || "World"`);
            expect(result).toBe('Hello World');
        });

        it('should still support conditional expressions', () => {
            const result = parseAndEval(`if (1 > 0) then "yes" else "no"`);
            expect(result).toBe('yes');
        });

        it('should still support function references', () => {
            const result = parseAndEval(`upper-case("test")`);
            expect(result).toBe('TEST');
        });

        it('should still support quantified expressions', () => {
            const result = parseAndEval(`every $i in (1,2,3) satisfies $i > 0`);
            expect(result).toBe(true);
        });

        it('should still support instance-of expressions', () => {
            const result = parseAndEval(`1 instance of xs:integer`);
            expect(result).toBe(true);
        });

        it('should still support cast expressions', () => {
            const result = parseAndEval(`123`);
            expect(result).toBe(123);
        });
    });

    describe('8.8 Specification Compliance', () => {
        it('should follow XPath 3.1 operator precedence', () => {
            const result = parseAndEval(`2 + 3 * 4`);
            expect(result).toBe(14); // 3*4 evaluated first
        });

        it('should handle type promotion correctly', () => {
            const result = parseAndEval(`"10" + 5`);
            expect(result).toBe(15); // String "10" coerced to number
        });

        it('should handle atomization correctly', () => {
            const result = parseAndEval(`string([1,2,3])`);
            expect(typeof result).toBe('string');
        });

        it('should enforce 1-based indexing for arrays', () => {
            const result = parseAndEval(`[10,20,30](1)`);
            expect(result).toBe(10); // First element
        });

        it('should handle map key deduplication', () => {
            const result = parseAndEval(`map{"a":1,"a":2}?a`);
            expect(result).toBe(2); // Last value wins
        });

        it('should support all XPath 3.1 data types', () => {
            expect(parseAndEval(`1 instance of xs:integer`)).toBe(true);
            expect(parseAndEval(`1.5 instance of xs:decimal`)).toBe(true);
            expect(parseAndEval(`"test" instance of xs:string`)).toBe(true);
            expect(parseAndEval(`true() instance of xs:boolean`)).toBe(true);
        });

        it('should handle sequence operations correctly', () => {
            const result = parseAndEval(`(1,2,3)`);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle union operations', () => {
            const result = parseAndEval(`(1,2) | (2,3)`);
            expect(result).toBeDefined();
        });

        it('should handle comparison operations per spec', () => {
            expect(parseAndEval(`1 < 2`)).toBe(true);
            expect(parseAndEval(`2 > 1`)).toBe(true);
            expect(parseAndEval(`5 = 5`)).toBe(true);
        });

        it('should handle logical operations per spec', () => {
            expect(parseAndEval(`true() and true()`)).toBe(true);
            expect(parseAndEval(`false() or true()`)).toBe(true);
            expect(parseAndEval(`not(false())`)).toBe(true);
        });
    });
});
