/**
 * XPath 2.0 Type Constructor Functions Tests
 *
 * Tests for xs:* type constructor functions as defined in XPath 2.0
 * Reference: https://www.w3.org/TR/xpath-functions/#constructor-functions
 */

import { getBuiltInFunction } from '../src/expressions/function-call-expression';
import { XPathContext } from '../src/context';

// Create a minimal context for testing
const createContext = (): XPathContext => ({
    node: null as any,
    position: 1,
    size: 1,
});

describe('XPath 2.0 Type Constructor Functions', () => {
    describe('xs:string', () => {
        it('should convert number to string', () => {
            const fn = getBuiltInFunction('xs:string');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), 123)).toBe('123');
        });

        it('should convert boolean to string', () => {
            const fn = getBuiltInFunction('xs:string');
            expect(fn!(createContext(), true)).toBe('true');
            expect(fn!(createContext(), false)).toBe('false');
        });

        it('should preserve string input', () => {
            const fn = getBuiltInFunction('xs:string');
            expect(fn!(createContext(), 'hello')).toBe('hello');
        });
    });

    describe('xs:boolean', () => {
        it('should convert string "true" to true', () => {
            const fn = getBuiltInFunction('xs:boolean');
            expect(fn!(createContext(), 'true')).toBe(true);
            expect(fn!(createContext(), '1')).toBe(true);
        });

        it('should convert string "false" to false', () => {
            const fn = getBuiltInFunction('xs:boolean');
            expect(fn!(createContext(), 'false')).toBe(false);
            expect(fn!(createContext(), '0')).toBe(false);
        });

        it('should preserve boolean input', () => {
            const fn = getBuiltInFunction('xs:boolean');
            expect(fn!(createContext(), true)).toBe(true);
            expect(fn!(createContext(), false)).toBe(false);
        });
    });

    describe('xs:integer', () => {
        it('should convert string to integer', () => {
            const fn = getBuiltInFunction('xs:integer');
            expect(fn!(createContext(), '42')).toBe(42);
            expect(fn!(createContext(), '-100')).toBe(-100);
        });

        it('should convert number to integer (truncating)', () => {
            const fn = getBuiltInFunction('xs:integer');
            expect(fn!(createContext(), 42.9)).toBe(42);
            expect(fn!(createContext(), -42.9)).toBe(-42);
        });
    });

    describe('xs:decimal', () => {
        it('should convert string to decimal', () => {
            const fn = getBuiltInFunction('xs:decimal');
            expect(fn!(createContext(), '123.45')).toBe(123.45);
            expect(fn!(createContext(), '-0.5')).toBe(-0.5);
        });

        it('should convert integer to decimal', () => {
            const fn = getBuiltInFunction('xs:decimal');
            expect(fn!(createContext(), 42)).toBe(42);
        });
    });

    describe('xs:float', () => {
        it('should convert string to float', () => {
            const fn = getBuiltInFunction('xs:float');
            expect(fn!(createContext(), '3.14')).toBeCloseTo(3.14);
        });

        it('should handle special values', () => {
            const fn = getBuiltInFunction('xs:float');
            expect(fn!(createContext(), 'INF')).toBe(Infinity);
            expect(fn!(createContext(), '-INF')).toBe(-Infinity);
            expect(Number.isNaN(fn!(createContext(), 'NaN'))).toBe(true);
        });
    });

    describe('xs:double', () => {
        it('should convert string to double', () => {
            const fn = getBuiltInFunction('xs:double');
            expect(fn!(createContext(), '2.718281828')).toBeCloseTo(2.718281828);
        });

        it('should handle special values', () => {
            const fn = getBuiltInFunction('xs:double');
            expect(fn!(createContext(), 'INF')).toBe(Infinity);
            expect(fn!(createContext(), '-INF')).toBe(-Infinity);
        });
    });

    describe('xs:date', () => {
        it('should parse ISO date string', () => {
            const fn = getBuiltInFunction('xs:date');
            const result = fn!(createContext(), '2024-01-15');
            // Date type returns a Date object
            expect(result instanceof Date).toBe(true);
            expect((result as Date).getFullYear()).toBe(2024);
        });
    });

    describe('xs:time', () => {
        it('should parse ISO time string', () => {
            const fn = getBuiltInFunction('xs:time');
            const result = fn!(createContext(), '14:30:00');
            // Time type returns a structured time object
            expect(result).toBeDefined();
            expect(result.hours).toBe(14);
            expect(result.minutes).toBe(30);
            expect(result.seconds).toBe(0);
        });
    });

    describe('xs:dateTime', () => {
        it('should parse ISO dateTime string', () => {
            const fn = getBuiltInFunction('xs:dateTime');
            const result = fn!(createContext(), '2024-01-15T14:30:00');
            // DateTime type returns a Date object
            expect(result instanceof Date).toBe(true);
            expect((result as Date).getFullYear()).toBe(2024);
        });
    });

    describe('xs:duration', () => {
        it('should parse ISO duration string', () => {
            const fn = getBuiltInFunction('xs:duration');
            const result = fn!(createContext(), 'P1Y2M3DT4H5M6S');
            expect(result).toBeDefined();
        });
    });

    describe('xs:anyURI', () => {
        it('should accept valid URI string', () => {
            const fn = getBuiltInFunction('xs:anyURI');
            expect(fn!(createContext(), 'http://example.com/path')).toBe('http://example.com/path');
        });
    });

    describe('Integer-derived types', () => {
        describe('xs:long', () => {
            it('should accept valid long values', () => {
                const fn = getBuiltInFunction('xs:long');
                expect(fn!(createContext(), '1234567890')).toBe(1234567890);
            });
        });

        describe('xs:int', () => {
            it('should accept valid int values', () => {
                const fn = getBuiltInFunction('xs:int');
                expect(fn!(createContext(), '2147483647')).toBe(2147483647);
                expect(fn!(createContext(), '-2147483648')).toBe(-2147483648);
            });
        });

        describe('xs:short', () => {
            it('should accept valid short values', () => {
                const fn = getBuiltInFunction('xs:short');
                expect(fn!(createContext(), '32767')).toBe(32767);
                expect(fn!(createContext(), '-32768')).toBe(-32768);
            });
        });

        describe('xs:byte', () => {
            it('should accept valid byte values', () => {
                const fn = getBuiltInFunction('xs:byte');
                expect(fn!(createContext(), '127')).toBe(127);
                expect(fn!(createContext(), '-128')).toBe(-128);
            });
        });

        describe('xs:nonNegativeInteger', () => {
            it('should accept zero and positive values', () => {
                const fn = getBuiltInFunction('xs:nonNegativeInteger');
                expect(fn!(createContext(), '0')).toBe(0);
                expect(fn!(createContext(), '100')).toBe(100);
            });
        });

        describe('xs:positiveInteger', () => {
            it('should accept positive values', () => {
                const fn = getBuiltInFunction('xs:positiveInteger');
                expect(fn!(createContext(), '1')).toBe(1);
                expect(fn!(createContext(), '100')).toBe(100);
            });
        });

        describe('xs:nonPositiveInteger', () => {
            it('should accept zero and negative values', () => {
                const fn = getBuiltInFunction('xs:nonPositiveInteger');
                expect(fn!(createContext(), '0')).toBe(0);
                expect(fn!(createContext(), '-100')).toBe(-100);
            });
        });

        describe('xs:negativeInteger', () => {
            it('should accept negative values', () => {
                const fn = getBuiltInFunction('xs:negativeInteger');
                expect(fn!(createContext(), '-1')).toBe(-1);
                expect(fn!(createContext(), '-100')).toBe(-100);
            });
        });

        describe('xs:unsignedLong', () => {
            it('should accept non-negative values', () => {
                const fn = getBuiltInFunction('xs:unsignedLong');
                expect(fn!(createContext(), '0')).toBe(0);
                expect(fn!(createContext(), '4294967295')).toBe(4294967295);
            });
        });

        describe('xs:unsignedInt', () => {
            it('should accept non-negative values within range', () => {
                const fn = getBuiltInFunction('xs:unsignedInt');
                expect(fn!(createContext(), '0')).toBe(0);
                expect(fn!(createContext(), '4294967295')).toBe(4294967295);
            });
        });

        describe('xs:unsignedShort', () => {
            it('should accept non-negative values within range', () => {
                const fn = getBuiltInFunction('xs:unsignedShort');
                expect(fn!(createContext(), '0')).toBe(0);
                expect(fn!(createContext(), '65535')).toBe(65535);
            });
        });

        describe('xs:unsignedByte', () => {
            it('should accept non-negative values within range', () => {
                const fn = getBuiltInFunction('xs:unsignedByte');
                expect(fn!(createContext(), '0')).toBe(0);
                expect(fn!(createContext(), '255')).toBe(255);
            });
        });
    });

    describe('Binary types', () => {
        describe('xs:hexBinary', () => {
            it('should accept valid hex string', () => {
                const fn = getBuiltInFunction('xs:hexBinary');
                const result = fn!(createContext(), '48454C4C4F');
                expect(result).toBeDefined();
            });
        });

        describe('xs:base64Binary', () => {
            it('should accept valid base64 string', () => {
                const fn = getBuiltInFunction('xs:base64Binary');
                const result = fn!(createContext(), 'SGVsbG8=');
                expect(result).toBeDefined();
            });
        });
    });

    describe('Gregorian types', () => {
        describe('xs:gYear', () => {
            it('should accept year string', () => {
                const fn = getBuiltInFunction('xs:gYear');
                const result = fn!(createContext(), '2024');
                expect(result).toBeDefined();
            });
        });

        describe('xs:gYearMonth', () => {
            it('should accept year-month string', () => {
                const fn = getBuiltInFunction('xs:gYearMonth');
                const result = fn!(createContext(), '2024-01');
                expect(result).toBeDefined();
            });
        });

        describe('xs:gMonth', () => {
            it('should accept month string', () => {
                const fn = getBuiltInFunction('xs:gMonth');
                const result = fn!(createContext(), '--01');
                expect(result).toBeDefined();
            });
        });

        describe('xs:gMonthDay', () => {
            it('should accept month-day string', () => {
                const fn = getBuiltInFunction('xs:gMonthDay');
                const result = fn!(createContext(), '--01-15');
                expect(result).toBeDefined();
            });
        });

        describe('xs:gDay', () => {
            it('should accept day string', () => {
                const fn = getBuiltInFunction('xs:gDay');
                const result = fn!(createContext(), '---15');
                expect(result).toBeDefined();
            });
        });
    });

    describe('xs:untypedAtomic', () => {
        it('should accept any value', () => {
            const fn = getBuiltInFunction('xs:untypedAtomic');
            expect(fn!(createContext(), 'test')).toBe('test');
            expect(fn!(createContext(), 123)).toBe('123');
        });
    });
});
