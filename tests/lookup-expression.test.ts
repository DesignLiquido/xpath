import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser/parser-31';
import { XPathContext } from '../src/context';
import { XPathLookupExpression } from '../src/expressions/lookup-expression';
import { createXPathArray } from '../src/expressions/array-constructor-expression';

describe('XPath 3.1 Lookup Operator', () => {
    const parser = new XPath31Parser();

    // Helper functions to create proper XPath objects
    const createXPathMap = (entries: Record<string, any>): any => {
        const map = Object.create(null);
        map.__isMap = true;
        Object.assign(map, entries);
        return map;
    };

    const createContext = (variables: Record<string, any> = {}, contextItem?: any): XPathContext => ({
        node: undefined,
        position: 1,
        size: 1,
        variables,
        functions: {},
        ...(contextItem !== undefined && { contextItem })
    } as any);

    const parseExpression = (xpath: string) => {
        const lexer = new XPathLexer('3.1');
        const tokens = lexer.scan(xpath);
        return parser.parse(tokens);
    };

    describe('Parser - Lookup Syntax', () => {
        test('should parse unary lookup with NCName', () => {
            const result = parseExpression('?key');
            expect(result).toBeInstanceOf(XPathLookupExpression);
            const lookup = result as XPathLookupExpression;
            expect(lookup.toString()).toBe('?key');
        });

        test('should parse unary lookup with integer', () => {
            const result = parseExpression('?1');
            expect(result).toBeInstanceOf(XPathLookupExpression);
            const lookup = result as XPathLookupExpression;
            expect(lookup.toString()).toBe('?1');
        });

        test('should parse unary lookup with wildcard', () => {
            const result = parseExpression('?*');
            expect(result).toBeInstanceOf(XPathLookupExpression);
            const lookup = result as XPathLookupExpression;
            expect(lookup.toString()).toBe('?*');
        });

        test('should parse unary lookup with parenthesized expression', () => {
            const result = parseExpression('?(1 + 2)');
            expect(result).toBeInstanceOf(XPathLookupExpression);
            const lookup = result as XPathLookupExpression;
            expect(lookup.toString()).toBe('?(1 + 2)');
        });

        test('should parse postfix lookup on variable', () => {
            const result = parseExpression('$map?key');
            expect(result).toBeInstanceOf(XPathLookupExpression);
            const lookup = result as XPathLookupExpression;
            expect(lookup.toString()).toBe('$map?key');
        });

        test('should parse postfix lookup on array', () => {
            const result = parseExpression('[1, 2, 3]?2');
            expect(result).toBeInstanceOf(XPathLookupExpression);
            const lookup = result as XPathLookupExpression;
            expect(lookup.toString()).toBe('[1, 2, 3]?2');
        });

        test('should parse chained lookups', () => {
            const result = parseExpression('$data?items?*');
            expect(result).toBeInstanceOf(XPathLookupExpression);
            const lookup = result as XPathLookupExpression;
            expect(lookup.toString()).toBe('$data?items?*');
        });
    });

    describe('Evaluator - Map Lookup', () => {
        test('should lookup string key in map', () => {
            const map = createXPathMap({ name: 'John', age: 30 });
            const context = createContext({ testMap: map });

            const result = parseExpression('$testMap?name').evaluate(context);
            expect(result).toBe('John');
        });

        test('should lookup integer key in map (converted to string)', () => {
            const map = createXPathMap({ '1': 'first', '2': 'second' });
            const context = createContext({ testMap: map });

            const result = parseExpression('$testMap?1').evaluate(context);
            expect(result).toBe('first');
        });

        test('should lookup with dynamic key expression', () => {
            const map = createXPathMap({ key1: 'value1', key2: 'value2' });
            const context = createContext({ testMap: map, keyVar: 'key2' });

            const result = parseExpression('$testMap?($keyVar)').evaluate(context);
            expect(result).toBe('value2');
        });

        test('should return all values with wildcard', () => {
            const map = createXPathMap({ a: 1, b: 2, c: 3 });
            const context = createContext({ testMap: map });

            const result = parseExpression('$testMap?*').evaluate(context);
            expect(result).toEqual([1, 2, 3]);
        });

        test('should return undefined for missing key', () => {
            const map = createXPathMap({ name: 'John' });
            const context = createContext({ testMap: map });

            const result = parseExpression('$testMap?missing').evaluate(context);
            expect(result).toBeUndefined();
        });
    });

    describe('Evaluator - Array Lookup', () => {
        test('should lookup array element by 1-based index', () => {
            const array = createXPathArray([10, 20, 30, 40]);
            const context = createContext({ testArray: array });

            const result = parseExpression('$testArray?2').evaluate(context);
            expect(result).toBe(20);
        });

        test('should lookup first element', () => {
            const array = createXPathArray(['a', 'b', 'c']);
            const context = createContext({ testArray: array });

            const result = parseExpression('$testArray?1').evaluate(context);
            expect(result).toBe('a');
        });

        test('should lookup last element', () => {
            const array = createXPathArray([1, 2, 3, 4, 5]);
            const context = createContext({ testArray: array });

            const result = parseExpression('$testArray?5').evaluate(context);
            expect(result).toBe(5);
        });

        test('should lookup with dynamic index expression', () => {
            const array = createXPathArray(['zero', 'one', 'two', 'three']);
            const context = createContext({ testArray: array, index: 3 });

            const result = parseExpression('$testArray?($index + 1)').evaluate(context);
            expect(result).toBe('three');
        });

        test('should flatten nested arrays with wildcard', () => {
            const array = createXPathArray([1, createXPathArray([2, 3]), createXPathArray([4, createXPathArray([5, 6])])]);
            const context = createContext({ testArray: array });

            const result = parseExpression('$testArray?*').evaluate(context);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        });

        test('should throw error for index 0', () => {
            const array = createXPathArray([10, 20, 30]);
            const context = createContext({ testArray: array });

            expect(() => {
                parseExpression('$testArray?0').evaluate(context);
            }).toThrow('FOAY0001: Array index must be positive');
        });

        test('should throw error for negative index', () => {
            const array = createXPathArray([10, 20, 30]);
            const context = createContext({ testArray: array });

            expect(() => {
                parseExpression('$testArray?(-1)').evaluate(context);
            }).toThrow('FOAY0001: Array index must be positive');
        });

        test('should throw error for out of bounds index', () => {
            const array = createXPathArray([10, 20, 30]);
            const context = createContext({ testArray: array });

            expect(() => {
                parseExpression('$testArray?10').evaluate(context);
            }).toThrow('FOAY0001: Array index out of bounds');
        });
    });

    describe('Evaluator - Unary Lookup', () => {
        test('should lookup in context item map', () => {
            const map = createXPathMap({ name: 'Alice', city: 'Paris' });
            const context = createContext({}, map);

            const result = parseExpression('?name').evaluate(context);
            expect(result).toBe('Alice');
        });

        test('should lookup in context item array', () => {
            const array = createXPathArray(['first', 'second', 'third']);
            const context = createContext({}, array);

            const result = parseExpression('?2').evaluate(context);
            expect(result).toBe('second');
        });

        test('should throw error when context item is undefined', () => {
            const context = createContext({});

            expect(() => {
                parseExpression('?key').evaluate(context);
            }).toThrow('XPDY0002: Context item is undefined for unary lookup');
        });
    });

    describe('Evaluator - Chained Lookups', () => {
        test('should chain map lookups', () => {
            const nestedMap = createXPathMap({
                user: createXPathMap({ name: 'Bob', age: 25 }),
                settings: createXPathMap({ theme: 'dark' })
            });
            const context = createContext({ data: nestedMap });

            const result = parseExpression('$data?user?name').evaluate(context);
            expect(result).toBe('Bob');
        });

        test('should chain array and map lookups', () => {
            const arrayOfMaps = createXPathArray([
                createXPathMap({ id: 1, value: 'A' }),
                createXPathMap({ id: 2, value: 'B' })
            ]);
            const context = createContext({ items: arrayOfMaps });

            const result = parseExpression('$items?2?value').evaluate(context);
            expect(result).toBe('B');
        });
    });

    describe('Error Cases', () => {
        test('should throw error for lookup on non-map/array', () => {
            const context = createContext({ stringVar: 'not a map or array' });

            expect(() => {
                parseExpression('$stringVar?key').evaluate(context);
            }).toThrow('XPTY0004: Lookup operator can only be applied to maps and arrays');
        });

        test('should throw error for invalid key specifier', () => {
            const map = createXPathMap({ key: 'value' });
            const context = createContext({ testMap: map });

            // This would require invalid syntax, but let's test the error handling
            // by creating a malformed lookup expression
            expect(() => {
                // This should be caught during parsing, but if it gets through:
                const invalidLookup = new XPathLookupExpression(null, { type: 'INVALID' as any, value: undefined });
                invalidLookup.evaluate(context);
            }).toThrow();
        });
    });
});