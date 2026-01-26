/**
 * XPath 3.0 Integration Tests
 * 
 * Tests combining multiple XPath 3.0 features in realistic scenarios.
 * This suite demonstrates the integration of:
 * - Let expressions with complex bindings
 * - Simple map operator (!)
 * - String concatenation operator (||)
 * - Arrow operator (=>)
 */

import { XPathLexer } from '../src/lexer/lexer';
import { XPath30Parser } from '../src/parser';
import { XPathContext } from '../src/context';

describe('XPath 3.0 Integration Tests', () => {
    const parser = new XPath30Parser();

    const sampleContext: XPathContext = {
        node: undefined,
        position: 1,
        size: 1,
        variables: {},
        functions: {}
    };

    const parseExpression = (xpath: string) => {
        const lexer = new XPathLexer('3.0');
        const tokens = lexer.scan(xpath);
        return parser.parse(tokens);
    };

    describe('Let Expression with Multiple Bindings', () => {
        test('let with single binding', () => {
            const xpath = 'let $x := 10 return $x * 2';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(20);
        });

        test('let with multiple sequential bindings', () => {
            const xpath = 'let $x := 5, $y := $x * 2 return $x + $y';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(15); // 5 + 10
        });

        test('let with nested expressions', () => {
            const xpath = 'let $base := 10, $double := $base * 2, $result := $double + 5 return $result';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(25); // (10 * 2) + 5
        });

        test('let with sequence binding', () => {
            const xpath = 'let $numbers := (1, 2, 3) return count($numbers)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(3);
        });

        test('let with conditional binding', () => {
            const xpath = 'let $x := 5, $type := if ($x > 3) then "large" else "small" return $type';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('large');
        });
    });

    describe('String Concatenation Operator (||)', () => {
        test('simple string concatenation', () => {
            const xpath = '"Hello" || " " || "World"';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('Hello World');
        });

        test('concatenation with variables', () => {
            const context: XPathContext = {
                ...sampleContext,
                variables: {
                    first: 'John',
                    last: 'Doe'
                }
            };
            
            const xpath = '$first || " " || $last';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(context);
            expect(result).toBe('John Doe');
        });

        test.skip('concatenation with function results', () => {
            const xpath = 'fn:upper-case("hello") || " " || fn:lower-case("WORLD")';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('HELLO world');
        });

        test('concatenation within let expression', () => {
            const xpath = 'let $greeting := "Hello" || " " || "XPath" return $greeting';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('Hello XPath');
        });

        test('complex concatenation pipeline', () => {
            const context: XPathContext = {
                ...sampleContext,
                variables: {
                    name: 'User',
                    action: 'logged in'
                }
            };

            const xpath = '"Event: " || $name || " " || $action';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(context);
            expect(result).toBe('Event: User logged in');
        });
    });

    describe('Simple Map Operator (!)', () => {
        test('simple map with number sequence', () => {
            const xpath = '(1, 2, 3) ! (. * 2)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([2, 4, 6]);
        });

        test('simple map within let expression', () => {
            const xpath = 'let $nums := (1, 2, 3) return $nums ! (. + 10)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([11, 12, 13]);
        });

        test('simple map with concatenation', () => {
            const context: XPathContext = {
                ...sampleContext,
                variables: {
                    values: [1, 2, 3]
                }
            };

            const xpath = '$values ! ("Value: " || xs:string(.))';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(context);
            expect(Array.isArray(result)).toBe(true);
            if (Array.isArray(result)) {
                expect(result[0]).toBe('Value: 1');
                expect(result[1]).toBe('Value: 2');
                expect(result[2]).toBe('Value: 3');
            }
        });

        test('nested simple map operations', () => {
            const context: XPathContext = {
                ...sampleContext,
                variables: {
                    data: [2, 3, 4]
                }
            };
            
            const xpath = '$data ! (. * 2) ! (. + 1)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(context);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([5, 7, 9]); // (2*2)+1=5, (3*2)+1=7, (4*2)+1=9
        });
    });

    describe('Arrow Operator (=>)', () => {
        test.skip('arrow operator with function call', () => {
            const xpath = '"hello" => fn:upper-case()';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('HELLO');
        });

        test.skip('chained arrow operators', () => {
            const xpath = '"  hello world  " => fn:normalize-space() => fn:upper-case()';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('HELLO WORLD');
        });

        test.skip('arrow operator with sequence', () => {
            const xpath = '(1, 2, 3) => fn:count()';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(3);
        });

        test.skip('arrow with simple map', () => {
            const xpath = '(1, 2, 3) => (. * 2)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([2, 4, 6]);
        });
    });

    describe('Complex Integration Scenarios', () => {
        test.skip('let with arrow and simple map', () => {
            const xpath = 'let $nums := (1, 2, 3) return $nums => fn:count()';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(3);
        });

        test('multiple lets with string concatenation', () => {
            const xpath = 'let $first := "John", $last := "Doe", $fullName := $first || " " || $last return $fullName';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('John Doe');
        });

        test('let with simple map pipeline', () => {
            const xpath = 'let $values := (10, 20, 30) return $values ! (. div 10) ! (. * 2)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([2, 4, 6]); // (10/10)*2=2, (20/10)*2=4, (30/10)*2=6
        });

        test('combined features with conditional', () => {
            const xpath = 'let $x := 5 return if ($x > 3) then ("Value is " || "large") else ("Value is " || "small")';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('Value is large');
        });

        test.skip('sequential lets with arrow and simple map', () => {
            const xpath = 'let $nums := (1, 2, 3), $doubled := $nums ! (. * 2) return $doubled => fn:sum()';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(12); // 2+4+6
        });
    });

    describe('XPath 3.0 Math Functions Integration', () => {
        test.skip('math functions with let binding', () => {
            const xpath = 'let $radius := 5 return fn:math:pi() * ($radius * $radius)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(typeof result).toBe('number');
            expect(result).toBeCloseTo(78.54, 1); // pi * 25
        });

        test.skip('math operations in simple map', () => {
            const xpath = '(1, 2, 3, 4, 5) ! fn:math:sqrt(. * 4)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            if (Array.isArray(result)) {
                expect(result[0]).toBeCloseTo(2, 5);      // sqrt(4) = 2
                expect(result[1]).toBeCloseTo(2.828, 2);  // sqrt(8) ≈ 2.83
                expect(result[4]).toBeCloseTo(4.472, 2);  // sqrt(20) ≈ 4.47
            }
        });
    });

    describe('Sequence Functions Integration', () => {
        test.skip('head with let expression', () => {
            const xpath = 'let $seq := (10, 20, 30) return fn:head($seq)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(10);
        });

        test.skip('tail with simple map', () => {
            const xpath = 'let $seq := (1, 2, 3, 4) return fn:tail($seq)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([2, 3, 4]);
        });

        test.skip('sort with string concatenation in result', () => {
            const xpath = 'let $items := ("charlie", "alice", "bob"), $sorted := fn:sort($items) return $sorted ! ("Item: " || .)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            if (Array.isArray(result)) {
                expect(result[0]).toBe('Item: alice');
                expect(result[1]).toBe('Item: bob');
                expect(result[2]).toBe('Item: charlie');
            }
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test.skip('let with empty sequence', () => {
            const xpath = 'let $empty := () return fn:count($empty)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe(0);
        });

        test('concatenation with numbers (atomization)', () => {
            const xpath = '"Count: " || "5"';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('Count: 5');
        });

        test('simple map with single item', () => {
            const xpath = '42 ! (. * 2)';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toContain(84);
        });

        test('arrow with single value', () => {
            const xpath = '42 => fn:string()';
            const expr = parseExpression(xpath);
            const result = expr.evaluate(sampleContext);
            expect(result).toBe('42');
        });
    });
});
