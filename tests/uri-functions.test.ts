/**
 * XPath 2.0 URI Functions Tests
 *
 * Tests for URI-related functions as defined in XPath 2.0
 * Reference: https://www.w3.org/TR/xpath-functions/#uri-functions
 */

import { getBuiltInFunction } from '../src/expressions/function-call-expression';
import { XPathContext } from '../src/context';

// Create a minimal context for testing
const createContext = (baseUri?: string): XPathContext => ({
    node: null as any,
    position: 1,
    size: 1,
    baseUri,
});

describe('XPath 2.0 URI Functions', () => {
    describe('resolve-uri', () => {
        it('should resolve relative URI against base', () => {
            const fn = getBuiltInFunction('resolve-uri');
            expect(fn).toBeDefined();
            const result = fn!(createContext(), 'path/file.xml', 'http://example.com/base/');
            expect(result).toBe('http://example.com/base/path/file.xml');
        });

        it('should resolve relative URI against context base', () => {
            const fn = getBuiltInFunction('resolve-uri');
            const ctx = createContext('http://example.com/context/');
            const result = fn!(ctx, 'file.xml');
            expect(result).toBe('http://example.com/context/file.xml');
        });

        it('should return absolute URI unchanged', () => {
            const fn = getBuiltInFunction('resolve-uri');
            const result = fn!(createContext(), 'http://other.com/path', 'http://example.com/');
            expect(result).toBe('http://other.com/path');
        });

        it('should return null for empty relative URI', () => {
            const fn = getBuiltInFunction('resolve-uri');
            const result = fn!(createContext(), '', 'http://example.com/');
            expect(result).toBeNull();
        });

        it('should handle parent directory navigation', () => {
            const fn = getBuiltInFunction('resolve-uri');
            const result = fn!(createContext(), '../other/file.xml', 'http://example.com/base/sub/');
            expect(result).toBe('http://example.com/base/other/file.xml');
        });
    });

    describe('encode-for-uri', () => {
        it('should encode special characters', () => {
            const fn = getBuiltInFunction('encode-for-uri');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), 'hello world')).toBe('hello%20world');
        });

        it('should encode reserved URI characters', () => {
            const fn = getBuiltInFunction('encode-for-uri');
            expect(fn!(createContext(), 'a/b?c=d&e=f')).toBe('a%2Fb%3Fc%3Dd%26e%3Df');
        });

        it('should encode quotes and special chars', () => {
            const fn = getBuiltInFunction('encode-for-uri');
            const result = fn!(createContext(), "it's \"quoted\"");
            expect(result).toContain('%27'); // single quote
            expect(result).toContain('%22'); // double quote
        });

        it('should preserve alphanumeric characters', () => {
            const fn = getBuiltInFunction('encode-for-uri');
            expect(fn!(createContext(), 'abc123')).toBe('abc123');
        });

        it('should handle empty string', () => {
            const fn = getBuiltInFunction('encode-for-uri');
            expect(fn!(createContext(), '')).toBe('');
        });

        it('should encode Unicode characters', () => {
            const fn = getBuiltInFunction('encode-for-uri');
            const result = fn!(createContext(), 'caf\u00e9');
            expect(result).toBe('caf%C3%A9');
        });
    });

    describe('iri-to-uri', () => {
        it('should preserve valid URI characters', () => {
            const fn = getBuiltInFunction('iri-to-uri');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), 'http://example.com/path?q=1')).toBe('http://example.com/path?q=1');
        });

        it('should encode non-ASCII characters', () => {
            const fn = getBuiltInFunction('iri-to-uri');
            const result = fn!(createContext(), 'http://example.com/caf\u00e9');
            expect(result).toBe('http://example.com/caf%C3%A9');
        });

        it('should preserve already valid URI', () => {
            const fn = getBuiltInFunction('iri-to-uri');
            const uri = 'http://example.com/path/to/file.xml';
            expect(fn!(createContext(), uri)).toBe(uri);
        });

        it('should handle empty string', () => {
            const fn = getBuiltInFunction('iri-to-uri');
            expect(fn!(createContext(), '')).toBe('');
        });

        it('should encode spaces', () => {
            const fn = getBuiltInFunction('iri-to-uri');
            expect(fn!(createContext(), 'http://example.com/my file.xml')).toBe('http://example.com/my%20file.xml');
        });
    });

    describe('escape-html-uri', () => {
        it('should escape HTML-sensitive characters', () => {
            const fn = getBuiltInFunction('escape-html-uri');
            expect(fn).toBeDefined();
            const result = fn!(createContext(), 'http://example.com/<script>');
            expect(result).toContain('%3C');
            expect(result).toContain('%3E');
        });

        it('should escape quotes', () => {
            const fn = getBuiltInFunction('escape-html-uri');
            const result = fn!(createContext(), 'http://example.com/page?name="test"');
            expect(result).toContain('%22');
        });

        it('should escape single quotes', () => {
            const fn = getBuiltInFunction('escape-html-uri');
            const result = fn!(createContext(), "http://example.com/page?name='test'");
            expect(result).toContain('%27');
        });

        it('should escape plus sign', () => {
            const fn = getBuiltInFunction('escape-html-uri');
            const result = fn!(createContext(), 'http://example.com/page?a+b');
            expect(result).toContain('%2B');
        });

        it('should preserve valid URI characters', () => {
            const fn = getBuiltInFunction('escape-html-uri');
            const uri = 'http://example.com/path?q=1&r=2';
            expect(fn!(createContext(), uri)).toBe(uri);
        });

        it('should handle empty string', () => {
            const fn = getBuiltInFunction('escape-html-uri');
            expect(fn!(createContext(), '')).toBe('');
        });
    });
});
