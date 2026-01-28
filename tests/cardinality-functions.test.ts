/**
 * XPath 2.0 Cardinality Functions Tests
 *
 * Tests for cardinality checking functions as defined in XPath 2.0
 * Reference: https://www.w3.org/TR/xpath-functions/#cardinality-funcs
 */

import { getBuiltInFunction } from '../src/expressions/function-call-expression';
import { XPathContext } from '../src/context';

// Create a minimal context for testing
const createContext = (): XPathContext => ({
    node: null as any,
    position: 1,
    size: 1,
});

describe('XPath 2.0 Cardinality Functions', () => {
    describe('zero-or-one', () => {
        it('should return null for empty sequence', () => {
            const fn = getBuiltInFunction('zero-or-one');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), [])).toBeNull();
        });

        it('should return single item for sequence of one', () => {
            const fn = getBuiltInFunction('zero-or-one');
            expect(fn!(createContext(), [42])).toBe(42);
            expect(fn!(createContext(), ['hello'])).toBe('hello');
        });

        it('should return item unchanged for non-array single value', () => {
            const fn = getBuiltInFunction('zero-or-one');
            expect(fn!(createContext(), 42)).toBe(42);
            expect(fn!(createContext(), 'hello')).toBe('hello');
        });

        it('should throw error for sequence of more than one', () => {
            const fn = getBuiltInFunction('zero-or-one');
            expect(() => fn!(createContext(), [1, 2])).toThrow();
            expect(() => fn!(createContext(), [1, 2, 3])).toThrow();
        });
    });

    describe('one-or-more', () => {
        it('should return sequence for sequence of one', () => {
            const fn = getBuiltInFunction('one-or-more');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), [42])).toEqual([42]);
        });

        it('should return sequence for sequence of multiple', () => {
            const fn = getBuiltInFunction('one-or-more');
            expect(fn!(createContext(), [1, 2, 3])).toEqual([1, 2, 3]);
        });

        it('should wrap single value in array', () => {
            const fn = getBuiltInFunction('one-or-more');
            expect(fn!(createContext(), 42)).toEqual([42]);
        });

        it('should throw error for empty sequence', () => {
            const fn = getBuiltInFunction('one-or-more');
            expect(() => fn!(createContext(), [])).toThrow();
        });
    });

    describe('exactly-one', () => {
        it('should return single item for sequence of one', () => {
            const fn = getBuiltInFunction('exactly-one');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), [42])).toBe(42);
            expect(fn!(createContext(), ['hello'])).toBe('hello');
        });

        it('should return item unchanged for non-array single value', () => {
            const fn = getBuiltInFunction('exactly-one');
            expect(fn!(createContext(), 42)).toBe(42);
        });

        it('should throw error for empty sequence', () => {
            const fn = getBuiltInFunction('exactly-one');
            expect(() => fn!(createContext(), [])).toThrow();
        });

        it('should throw error for sequence of more than one', () => {
            const fn = getBuiltInFunction('exactly-one');
            expect(() => fn!(createContext(), [1, 2])).toThrow();
            expect(() => fn!(createContext(), [1, 2, 3])).toThrow();
        });
    });

    describe('unordered', () => {
        it('should return sequence unchanged', () => {
            const fn = getBuiltInFunction('unordered');
            expect(fn).toBeDefined();
            // unordered returns the sequence, potentially in any order
            // but for deterministic testing we just check same items
            const result = fn!(createContext(), [1, 2, 3]);
            expect(result).toHaveLength(3);
            expect(result).toContain(1);
            expect(result).toContain(2);
            expect(result).toContain(3);
        });

        it('should return empty array for empty sequence', () => {
            const fn = getBuiltInFunction('unordered');
            expect(fn!(createContext(), [])).toEqual([]);
        });

        it('should wrap single value in array', () => {
            const fn = getBuiltInFunction('unordered');
            expect(fn!(createContext(), 42)).toEqual([42]);
        });

        it('should handle null/undefined', () => {
            const fn = getBuiltInFunction('unordered');
            expect(fn!(createContext(), null)).toEqual([]);
            expect(fn!(createContext(), undefined)).toEqual([]);
        });
    });
});
