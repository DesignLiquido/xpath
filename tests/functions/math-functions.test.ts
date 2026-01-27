/**
 * Tests for XPath 3.0 Math Functions
 */

import { XPath30Parser } from '../../src/parser/parser-30';
import { XPathLexer } from '../../src/lexer/lexer';
import { XPathContext } from '../../src/context';

describe('XPath 3.0 Math Functions', () => {
    let parser: XPath30Parser;
    let lexer: XPathLexer;
    let mockContext: XPathContext;

    beforeEach(() => {
        parser = new XPath30Parser();
        lexer = new XPathLexer('3.0');
        mockContext = {
            node: undefined,
            position: 1,
            size: 1,
            variables: {},
            namespaces: {
                math: 'http://www.w3.org/2005/xpath-functions/math',
            },
        } as XPathContext;
    });

    describe('math:pi()', () => {
        it('should return the value of pi', () => {
            const tokens = lexer.scan('math:pi()');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(3.141592653589793, 15);
            expect(result).toBe(Math.PI);
        });

        it('should work with EQName syntax', () => {
            const tokens = lexer.scan('Q{http://www.w3.org/2005/xpath-functions/math}pi()');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(3.141592653589793, 15);
        });
    });

    describe('math:exp($arg)', () => {
        it('should compute e^x', () => {
            const tokens = lexer.scan('math:exp(1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.E, 15);
        });

        it('should compute e^0 = 1', () => {
            const tokens = lexer.scan('math:exp(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(1);
        });

        it('should handle negative exponents', () => {
            const tokens = lexer.scan('math:exp(-1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(1 / Math.E, 15);
        });

        it('should return Infinity for large values', () => {
            const tokens = lexer.scan('math:exp(1000)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(Infinity);
        });
    });

    describe('math:exp10($arg)', () => {
        it('should compute 10^x', () => {
            const tokens = lexer.scan('math:exp10(2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(100);
        });

        it('should compute 10^0 = 1', () => {
            const tokens = lexer.scan('math:exp10(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(1);
        });

        it('should handle negative exponents', () => {
            const tokens = lexer.scan('math:exp10(-2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0.01);
        });

        it('should handle fractional exponents', () => {
            const tokens = lexer.scan('math:exp10(0.5)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.sqrt(10), 15);
        });
    });

    describe('math:log($arg)', () => {
        it('should compute natural logarithm', () => {
            const tokens = lexer.scan('math:log(2.718281828459045)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(1, 15);
        });

        it('should compute ln(1) = 0', () => {
            const tokens = lexer.scan('math:log(1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });

        it('should return -Infinity for log(0)', () => {
            const tokens = lexer.scan('math:log(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(-Infinity);
        });

        it('should return NaN for negative numbers', () => {
            const tokens = lexer.scan('math:log(-1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNaN();
        });
    });

    describe('math:log10($arg)', () => {
        it('should compute base-10 logarithm', () => {
            const tokens = lexer.scan('math:log10(100)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(2);
        });

        it('should compute log10(10) = 1', () => {
            const tokens = lexer.scan('math:log10(10)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(1);
        });

        it('should compute log10(1) = 0', () => {
            const tokens = lexer.scan('math:log10(1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });

        it('should return NaN for negative numbers', () => {
            const tokens = lexer.scan('math:log10(-10)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNaN();
        });
    });

    describe('math:pow($x, $y)', () => {
        it('should compute power', () => {
            const tokens = lexer.scan('math:pow(2, 3)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(8);
        });

        it('should handle negative base', () => {
            const tokens = lexer.scan('math:pow(-2, 3)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(-8);
        });

        it('should handle fractional exponents', () => {
            const tokens = lexer.scan('math:pow(4, 0.5)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(2);
        });

        it('should compute x^0 = 1', () => {
            const tokens = lexer.scan('math:pow(5, 0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(1);
        });

        it('should compute x^1 = x', () => {
            const tokens = lexer.scan('math:pow(7, 1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(7);
        });
    });

    describe('math:sqrt($arg)', () => {
        it('should compute square root', () => {
            const tokens = lexer.scan('math:sqrt(16)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(4);
        });

        it('should compute sqrt(0) = 0', () => {
            const tokens = lexer.scan('math:sqrt(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });

        it('should compute sqrt(1) = 1', () => {
            const tokens = lexer.scan('math:sqrt(1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(1);
        });

        it('should handle non-perfect squares', () => {
            const tokens = lexer.scan('math:sqrt(2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(1.4142135623730951, 15);
        });

        it('should return NaN for negative numbers', () => {
            const tokens = lexer.scan('math:sqrt(-1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNaN();
        });
    });

    describe('math:sin($arg)', () => {
        it('should compute sine', () => {
            const tokens = lexer.scan('math:sin(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(0, 15);
        });

        it('should compute sin(π/2) = 1', () => {
            const tokens = lexer.scan('math:sin(math:pi() div 2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(1, 15);
        });

        it('should compute sin(π) ≈ 0', () => {
            const tokens = lexer.scan('math:sin(math:pi())');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(0, 15);
        });

        it('should handle negative angles', () => {
            const tokens = lexer.scan('math:sin(-math:pi() div 2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(-1, 15);
        });
    });

    describe('math:cos($arg)', () => {
        it('should compute cosine', () => {
            const tokens = lexer.scan('math:cos(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(1);
        });

        it('should compute cos(π/2) ≈ 0', () => {
            const tokens = lexer.scan('math:cos(math:pi() div 2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(0, 15);
        });

        it('should compute cos(π) = -1', () => {
            const tokens = lexer.scan('math:cos(math:pi())');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(-1, 15);
        });

        it('should handle negative angles', () => {
            const tokens = lexer.scan('math:cos(-math:pi())');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(-1, 15);
        });
    });

    describe('math:tan($arg)', () => {
        it('should compute tangent', () => {
            const tokens = lexer.scan('math:tan(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(0, 15);
        });

        it('should compute tan(π/4) = 1', () => {
            const tokens = lexer.scan('math:tan(math:pi() div 4)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(1, 15);
        });

        it('should handle negative angles', () => {
            const tokens = lexer.scan('math:tan(-math:pi() div 4)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(-1, 15);
        });
    });

    describe('math:asin($arg)', () => {
        it('should compute arc sine', () => {
            const tokens = lexer.scan('math:asin(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });

        it('should compute asin(1) = π/2', () => {
            const tokens = lexer.scan('math:asin(1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI / 2, 15);
        });

        it('should compute asin(-1) = -π/2', () => {
            const tokens = lexer.scan('math:asin(-1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(-Math.PI / 2, 15);
        });

        it('should return NaN for values outside [-1, 1]', () => {
            const tokens = lexer.scan('math:asin(2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNaN();
        });
    });

    describe('math:acos($arg)', () => {
        it('should compute arc cosine', () => {
            const tokens = lexer.scan('math:acos(1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });

        it('should compute acos(0) = π/2', () => {
            const tokens = lexer.scan('math:acos(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI / 2, 15);
        });

        it('should compute acos(-1) = π', () => {
            const tokens = lexer.scan('math:acos(-1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI, 15);
        });

        it('should return NaN for values outside [-1, 1]', () => {
            const tokens = lexer.scan('math:acos(1.5)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNaN();
        });
    });

    describe('math:atan($arg)', () => {
        it('should compute arc tangent', () => {
            const tokens = lexer.scan('math:atan(0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });

        it('should compute atan(1) = π/4', () => {
            const tokens = lexer.scan('math:atan(1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI / 4, 15);
        });

        it('should compute atan(-1) = -π/4', () => {
            const tokens = lexer.scan('math:atan(-1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(-Math.PI / 4, 15);
        });

        it('should handle large values', () => {
            const tokens = lexer.scan('math:atan(1000000)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI / 2, 5);
        });
    });

    describe('math:atan2($y, $x)', () => {
        it('should compute atan2(0, 1) = 0', () => {
            const tokens = lexer.scan('math:atan2(0, 1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(0);
        });

        it('should compute atan2(1, 0) = π/2', () => {
            const tokens = lexer.scan('math:atan2(1, 0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI / 2, 15);
        });

        it('should compute atan2(0, -1) = π', () => {
            const tokens = lexer.scan('math:atan2(0, -1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI, 15);
        });

        it('should compute atan2(-1, 0) = -π/2', () => {
            const tokens = lexer.scan('math:atan2(-1, 0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(-Math.PI / 2, 15);
        });

        it('should handle all four quadrants', () => {
            // First quadrant
            const tokens1 = lexer.scan('math:atan2(1, 1)');
            const expr1 = parser.parse(tokens1);
            expect(expr1.evaluate(mockContext)).toBeCloseTo(Math.PI / 4, 15);

            // Second quadrant
            const tokens2 = lexer.scan('math:atan2(1, -1)');
            const expr2 = parser.parse(tokens2);
            expect(expr2.evaluate(mockContext)).toBeCloseTo((3 * Math.PI) / 4, 15);

            // Third quadrant
            const tokens3 = lexer.scan('math:atan2(-1, -1)');
            const expr3 = parser.parse(tokens3);
            expect(expr3.evaluate(mockContext)).toBeCloseTo((-3 * Math.PI) / 4, 15);

            // Fourth quadrant
            const tokens4 = lexer.scan('math:atan2(-1, 1)');
            const expr4 = parser.parse(tokens4);
            expect(expr4.evaluate(mockContext)).toBeCloseTo(-Math.PI / 4, 15);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty sequence as NaN', () => {
            mockContext.variables = { x: [] };
            const tokens = lexer.scan('math:sqrt($x)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNaN();
        });

        it('should handle null as NaN', () => {
            mockContext.variables = { x: null };
            const tokens = lexer.scan('math:sqrt($x)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeNaN();
        });

        it('should handle string coercion', () => {
            mockContext.variables = { x: '16' };
            const tokens = lexer.scan('math:sqrt($x)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(4);
        });

        it('should handle Infinity', () => {
            const tokens = lexer.scan('math:sqrt(1 div 0)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(Infinity);
        });
    });

    describe('Integration with other XPath 3.0 features', () => {
        it('should work with let expressions', () => {
            const tokens = lexer.scan('let $r := 5 return math:pi() * math:pow($r, 2)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBeCloseTo(Math.PI * 25, 15);
        });

        it('should work with arrow operator', () => {
            const tokens = lexer.scan('16 => math:sqrt()');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(4);
        });

        it('should work with for-each HOF', () => {
            const tokens = lexer.scan('for-each((1, 4, 9, 16), math:sqrt#1)');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toEqual([1, 2, 3, 4]);
        });

        it('should work in complex expressions', () => {
            const tokens = lexer.scan('math:sqrt(math:pow(3, 2) + math:pow(4, 2))');
            const expr = parser.parse(tokens);
            const result = expr.evaluate(mockContext);
            expect(result).toBe(5); // Pythagorean theorem
        });
    });
});
