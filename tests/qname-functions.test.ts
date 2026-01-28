/**
 * XPath 2.0 QName Functions Tests
 *
 * Tests for QName-related functions as defined in XPath 2.0
 * Reference: https://www.w3.org/TR/xpath-functions/#QName-funcs
 */

import { getBuiltInFunction } from '../src/expressions/function-call-expression';
import { XPathContext } from '../src/context';

// Create a minimal context for testing
const createContext = (): XPathContext => ({
    node: null as any,
    position: 1,
    size: 1,
});

// Mock element with namespace declarations
const createElementWithNamespaces = (namespaces: Record<string, string>) => {
    const attributes: Record<string, string> = {};
    for (const [prefix, uri] of Object.entries(namespaces)) {
        if (prefix === '') {
            attributes['xmlns'] = uri;
        } else {
            attributes[`xmlns:${prefix}`] = uri;
        }
    }
    return {
        nodeType: 1, // ELEMENT_NODE
        nodeName: 'test',
        localName: 'test',
        attributes,
        getAttribute: (name: string) => attributes[name] ?? null,
        parentNode: null,
    };
};

describe('XPath 2.0 QName Functions', () => {
    describe('QName', () => {
        it('should create QName with namespace URI', () => {
            const fn = getBuiltInFunction('QName');
            expect(fn).toBeDefined();
            const result = fn!(createContext(), 'http://example.com', 'prefix:local');
            expect(result).toBe('{http://example.com}prefix:local');
        });

        it('should create QName without prefix', () => {
            const fn = getBuiltInFunction('QName');
            const result = fn!(createContext(), 'http://example.com', 'local');
            expect(result).toBe('{http://example.com}local');
        });

        it('should create QName with empty namespace', () => {
            const fn = getBuiltInFunction('QName');
            const result = fn!(createContext(), '', 'local');
            expect(result).toBe('local');
        });

        it('should throw error for invalid QName', () => {
            const fn = getBuiltInFunction('QName');
            expect(() => fn!(createContext(), '', '')).toThrow(/Invalid QName/);
        });

        it('should throw error for prefix without namespace', () => {
            const fn = getBuiltInFunction('QName');
            expect(() => fn!(createContext(), '', 'prefix:local')).toThrow(/No namespace for prefix/);
        });
    });

    describe('resolve-QName', () => {
        it('should resolve prefixed QName', () => {
            const fn = getBuiltInFunction('resolve-QName');
            expect(fn).toBeDefined();
            const element = createElementWithNamespaces({
                'ns': 'http://example.com/ns',
            });
            const result = fn!(createContext(), 'ns:local', element);
            expect(result).toBe('{http://example.com/ns}ns:local');
        });

        it('should resolve unprefixed QName with default namespace', () => {
            const fn = getBuiltInFunction('resolve-QName');
            const element = createElementWithNamespaces({
                '': 'http://example.com/default',
            });
            const result = fn!(createContext(), 'local', element);
            expect(result).toBe('{http://example.com/default}local');
        });

        it('should resolve unprefixed QName without default namespace', () => {
            const fn = getBuiltInFunction('resolve-QName');
            const element = createElementWithNamespaces({});
            const result = fn!(createContext(), 'local', element);
            expect(result).toBe('local');
        });

        it('should return null for empty string input', () => {
            const fn = getBuiltInFunction('resolve-QName');
            const element = createElementWithNamespaces({});
            const result = fn!(createContext(), '', element);
            expect(result).toBeNull();
        });

        it('should throw error for unknown prefix', () => {
            const fn = getBuiltInFunction('resolve-QName');
            const element = createElementWithNamespaces({});
            expect(() => fn!(createContext(), 'unknown:local', element)).toThrow(/No namespace for prefix/);
        });
    });

    describe('prefix-from-QName', () => {
        it('should extract prefix from QName', () => {
            const fn = getBuiltInFunction('prefix-from-QName');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), '{http://example.com}prefix:local')).toBe('prefix');
        });

        it('should return null for QName without prefix', () => {
            const fn = getBuiltInFunction('prefix-from-QName');
            expect(fn!(createContext(), '{http://example.com}local')).toBeNull();
        });

        it('should return null for empty input', () => {
            const fn = getBuiltInFunction('prefix-from-QName');
            expect(fn!(createContext(), '')).toBeNull();
        });

        it('should handle Clark notation', () => {
            const fn = getBuiltInFunction('prefix-from-QName');
            expect(fn!(createContext(), '{http://example.com}ns:name')).toBe('ns');
        });
    });

    describe('local-name-from-QName', () => {
        it('should extract local name from prefixed QName', () => {
            const fn = getBuiltInFunction('local-name-from-QName');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), '{http://example.com}prefix:local')).toBe('local');
        });

        it('should extract local name from unprefixed QName', () => {
            const fn = getBuiltInFunction('local-name-from-QName');
            expect(fn!(createContext(), '{http://example.com}local')).toBe('local');
        });

        it('should return null for empty input', () => {
            const fn = getBuiltInFunction('local-name-from-QName');
            expect(fn!(createContext(), '')).toBeNull();
        });

        it('should handle simple local name', () => {
            const fn = getBuiltInFunction('local-name-from-QName');
            expect(fn!(createContext(), 'local')).toBe('local');
        });
    });

    describe('namespace-uri-from-QName', () => {
        it('should extract namespace URI from QName', () => {
            const fn = getBuiltInFunction('namespace-uri-from-QName');
            expect(fn).toBeDefined();
            expect(fn!(createContext(), '{http://example.com}prefix:local')).toBe('http://example.com');
        });

        it('should return null for QName without namespace', () => {
            const fn = getBuiltInFunction('namespace-uri-from-QName');
            expect(fn!(createContext(), 'local')).toBeNull();
        });

        it('should return null for empty input', () => {
            const fn = getBuiltInFunction('namespace-uri-from-QName');
            expect(fn!(createContext(), '')).toBeNull();
        });
    });

    describe('in-scope-prefixes', () => {
        it('should return all declared prefixes', () => {
            const fn = getBuiltInFunction('in-scope-prefixes');
            expect(fn).toBeDefined();
            const element = createElementWithNamespaces({
                'ns1': 'http://example.com/ns1',
                'ns2': 'http://example.com/ns2',
            });
            const result = fn!(createContext(), element);
            expect(result).toContain('xml'); // Always present
            expect(result).toContain('ns1');
            expect(result).toContain('ns2');
        });

        it('should include default namespace prefix (empty string)', () => {
            const fn = getBuiltInFunction('in-scope-prefixes');
            const element = createElementWithNamespaces({
                '': 'http://example.com/default',
                'ns': 'http://example.com/ns',
            });
            const result = fn!(createContext(), element);
            expect(result).toContain('');
            expect(result).toContain('ns');
            expect(result).toContain('xml');
        });

        it('should always include xml prefix', () => {
            const fn = getBuiltInFunction('in-scope-prefixes');
            const element = createElementWithNamespaces({});
            const result = fn!(createContext(), element);
            expect(result).toContain('xml');
        });
    });

    describe('namespace-uri-for-prefix', () => {
        it('should return namespace URI for known prefix', () => {
            const fn = getBuiltInFunction('namespace-uri-for-prefix');
            expect(fn).toBeDefined();
            const element = createElementWithNamespaces({
                'ns': 'http://example.com/ns',
            });
            const result = fn!(createContext(), 'ns', element);
            expect(result).toBe('http://example.com/ns');
        });

        it('should return xml namespace for xml prefix', () => {
            const fn = getBuiltInFunction('namespace-uri-for-prefix');
            const element = createElementWithNamespaces({});
            const result = fn!(createContext(), 'xml', element);
            expect(result).toBe('http://www.w3.org/XML/1998/namespace');
        });

        it('should return default namespace for empty prefix', () => {
            const fn = getBuiltInFunction('namespace-uri-for-prefix');
            const element = createElementWithNamespaces({
                '': 'http://example.com/default',
            });
            const result = fn!(createContext(), '', element);
            expect(result).toBe('http://example.com/default');
        });

        it('should return null for unknown prefix', () => {
            const fn = getBuiltInFunction('namespace-uri-for-prefix');
            const element = createElementWithNamespaces({});
            const result = fn!(createContext(), 'unknown', element);
            expect(result).toBeNull();
        });
    });
});
