/**
 * XPath 2.0 Node Functions Tests
 *
 * Tests for enhanced node functions as defined in XPath 2.0
 * Reference: https://www.w3.org/TR/xpath-functions/#node-functions
 */

import { getBuiltInFunction } from '../src/expressions/function-call-expression';
import { XPathContext } from '../src/context';

// Create mock nodes for testing
const createTextNode = (text: string) => ({
    nodeType: 3, // TEXT_NODE
    textContent: text,
    parentNode: null,
});

const createElementNode = (
    name: string,
    attrs: Record<string, string> = {},
    children: any[] = [],
    parent: any = null
) => {
    const node: any = {
        nodeType: 1, // ELEMENT_NODE
        nodeName: name,
        localName: name.includes(':') ? name.split(':')[1] : name,
        namespaceUri: '',
        textContent: '',
        parentNode: parent,
        childNodes: children,
        getAttribute: (attrName: string) => attrs[attrName] ?? null,
        attributes: attrs,
    };
    // Calculate textContent from children
    node.textContent = children
        .filter((c) => c.nodeType === 3)
        .map((c) => c.textContent)
        .join('');
    // Set parent on children
    children.forEach((c) => (c.parentNode = node));
    return node;
};

const createDocumentNode = (uri?: string) => ({
    nodeType: 9, // DOCUMENT_NODE
    nodeName: '#document',
    documentURI: uri ?? null,
    parentNode: null,
    childNodes: [],
});

// Create a minimal context for testing
const createContext = (node?: any, baseUri?: string): XPathContext => ({
    node: node ?? null,
    position: 1,
    size: 1,
    baseUri,
});

describe('XPath 2.0 Node Functions', () => {
    describe('root', () => {
        it('should return the root node', () => {
            const fn = getBuiltInFunction('root');
            expect(fn).toBeDefined();

            const root = createElementNode('root');
            const child = createElementNode('child', {}, [], root);
            root.childNodes = [child];

            const result = fn!(createContext(), child);
            expect(result).toBe(root);
        });

        it('should return the node itself if it has no parent', () => {
            const fn = getBuiltInFunction('root');
            const root = createElementNode('root');

            const result = fn!(createContext(), root);
            expect(result).toBe(root);
        });

        it('should use context node when no argument provided', () => {
            const fn = getBuiltInFunction('root');
            const root = createElementNode('root');
            const child = createElementNode('child', {}, [], root);
            root.childNodes = [child];

            const result = fn!(createContext(child));
            expect(result).toBe(root);
        });

        it('should return null for null input', () => {
            const fn = getBuiltInFunction('root');
            const result = fn!(createContext(), null);
            expect(result).toBeNull();
        });
    });

    describe('base-uri', () => {
        it('should return base URI from node property', () => {
            const fn = getBuiltInFunction('base-uri');
            expect(fn).toBeDefined();

            const node = createElementNode('test');
            (node as any).baseURI = 'http://example.com/doc.xml';

            const result = fn!(createContext(), node);
            expect(result).toBe('http://example.com/doc.xml');
        });

        it('should return xml:base attribute if present', () => {
            const fn = getBuiltInFunction('base-uri');
            const node = createElementNode('test', { 'xml:base': 'http://example.com/base/' });

            const result = fn!(createContext(), node);
            expect(result).toBe('http://example.com/base/');
        });

        it('should inherit from parent if not set', () => {
            const fn = getBuiltInFunction('base-uri');
            const parent = createElementNode('parent', { 'xml:base': 'http://example.com/' });
            const child = createElementNode('child', {}, [], parent);
            parent.childNodes = [child];

            const result = fn!(createContext(), child);
            expect(result).toBe('http://example.com/');
        });

        it('should use context base URI as fallback', () => {
            const fn = getBuiltInFunction('base-uri');
            const node = createElementNode('test');

            const result = fn!(createContext(null, 'http://context.com/'), node);
            expect(result).toBe('http://context.com/');
        });

        it('should return null if no base URI found', () => {
            const fn = getBuiltInFunction('base-uri');
            const node = createElementNode('test');

            const result = fn!(createContext(), node);
            expect(result).toBeNull();
        });
    });

    describe('document-uri', () => {
        it('should return document URI for document node', () => {
            const fn = getBuiltInFunction('document-uri');
            expect(fn).toBeDefined();

            const doc = createDocumentNode('http://example.com/doc.xml');
            const result = fn!(createContext(), doc);
            expect(result).toBe('http://example.com/doc.xml');
        });

        it('should return null for non-document nodes', () => {
            const fn = getBuiltInFunction('document-uri');
            const elem = createElementNode('test');

            const result = fn!(createContext(), elem);
            expect(result).toBeNull();
        });

        it('should return null if document has no URI', () => {
            const fn = getBuiltInFunction('document-uri');
            const doc = createDocumentNode();

            const result = fn!(createContext(), doc);
            expect(result).toBeNull();
        });
    });

    describe('nilled', () => {
        it('should return true for element with xsi:nil="true"', () => {
            const fn = getBuiltInFunction('nilled');
            expect(fn).toBeDefined();

            const node = createElementNode('test', { 'xsi:nil': 'true' });
            const result = fn!(createContext(), node);
            expect(result).toBe(true);
        });

        it('should return true for element with xsi:nil="1"', () => {
            const fn = getBuiltInFunction('nilled');
            const node = createElementNode('test', { 'xsi:nil': '1' });

            const result = fn!(createContext(), node);
            expect(result).toBe(true);
        });

        it('should return false for element without xsi:nil', () => {
            const fn = getBuiltInFunction('nilled');
            const node = createElementNode('test');

            const result = fn!(createContext(), node);
            expect(result).toBe(false);
        });

        it('should return null for non-element nodes', () => {
            const fn = getBuiltInFunction('nilled');
            const textNode = createTextNode('hello');

            const result = fn!(createContext(), textNode);
            expect(result).toBeNull();
        });
    });

    describe('node-name', () => {
        it('should return element name', () => {
            const fn = getBuiltInFunction('node-name');
            expect(fn).toBeDefined();

            const node = createElementNode('myElement');
            const result = fn!(createContext(), node);
            expect(result).toBe('myElement');
        });

        it('should return null for text nodes', () => {
            const fn = getBuiltInFunction('node-name');
            const textNode = createTextNode('hello');

            const result = fn!(createContext(), textNode);
            expect(result).toBeNull();
        });

        it('should return null for null input', () => {
            const fn = getBuiltInFunction('node-name');
            const result = fn!(createContext(), null);
            expect(result).toBeNull();
        });
    });

    describe('data', () => {
        it('should atomize a single node', () => {
            const fn = getBuiltInFunction('data');
            expect(fn).toBeDefined();

            const textNode = createTextNode('hello');
            const elem = createElementNode('test', {}, [textNode]);

            const result = fn!(createContext(), elem);
            expect(result).toEqual(['hello']);
        });

        it('should atomize a sequence of values', () => {
            const fn = getBuiltInFunction('data');
            const result = fn!(createContext(), [1, 'two', true]);
            expect(result).toEqual([1, 'two', true]);
        });

        it('should return empty array for null', () => {
            const fn = getBuiltInFunction('data');
            const result = fn!(createContext(), null);
            expect(result).toEqual([]);
        });
    });

    describe('lang', () => {
        it('should return true for matching language', () => {
            const fn = getBuiltInFunction('lang');
            expect(fn).toBeDefined();

            const node = createElementNode('test', { 'xml:lang': 'en' });
            const result = fn!(createContext(), 'en', node);
            expect(result).toBe(true);
        });

        it('should return true for language subtag match', () => {
            const fn = getBuiltInFunction('lang');
            const node = createElementNode('test', { 'xml:lang': 'en-US' });

            const result = fn!(createContext(), 'en', node);
            expect(result).toBe(true);
        });

        it('should be case-insensitive', () => {
            const fn = getBuiltInFunction('lang');
            const node = createElementNode('test', { 'xml:lang': 'EN-US' });

            const result = fn!(createContext(), 'en', node);
            expect(result).toBe(true);
        });

        it('should return false for non-matching language', () => {
            const fn = getBuiltInFunction('lang');
            const node = createElementNode('test', { 'xml:lang': 'fr' });

            const result = fn!(createContext(), 'en', node);
            expect(result).toBe(false);
        });

        it('should inherit language from ancestors', () => {
            const fn = getBuiltInFunction('lang');
            const parent = createElementNode('parent', { 'xml:lang': 'de' });
            const child = createElementNode('child', {}, [], parent);
            parent.childNodes = [child];

            const result = fn!(createContext(), 'de', child);
            expect(result).toBe(true);
        });

        it('should use context node when node argument not provided', () => {
            const fn = getBuiltInFunction('lang');
            const node = createElementNode('test', { 'xml:lang': 'es' });

            const result = fn!(createContext(node), 'es');
            expect(result).toBe(true);
        });
    });
});
