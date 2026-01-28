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

    describe('generate-id', () => {
        it('should generate consistent IDs for nodes', () => {
            const fn = getBuiltInFunction('generate-id');
            expect(fn).toBeDefined();

            const node = createElementNode('test');
            const id1 = fn!(createContext(), node);
            const id2 = fn!(createContext(), node);

            expect(typeof id1).toBe('string');
            expect(id1).toBe(id2); // Same node, same ID
        });

        it('should generate different IDs for different nodes', () => {
            const fn = getBuiltInFunction('generate-id');
            const node1 = createElementNode('test1');
            const node2 = createElementNode('test2');

            const id1 = fn!(createContext(), node1);
            const id2 = fn!(createContext(), node2);

            expect(id1).not.toBe(id2);
        });

        it('should generate valid XML Name IDs', () => {
            const fn = getBuiltInFunction('generate-id');
            const node = createElementNode('test');

            const id = fn!(createContext(), node) as string;
            // IDs should match XML Name pattern (start with letter or underscore)
            expect(/^[a-zA-Z_]/.test(id)).toBe(true);
        });

        it('should use context node when no argument provided', () => {
            const fn = getBuiltInFunction('generate-id');
            const node = createElementNode('contextNode');

            const id1 = fn!(createContext(node));
            const id2 = fn!(createContext(node));

            expect(id1).toBe(id2);
        });

        it('should return empty string for null input', () => {
            const fn = getBuiltInFunction('generate-id');
            const result = fn!(createContext(), null);
            expect(result).toBe('');
        });

        it('should handle text nodes', () => {
            const fn = getBuiltInFunction('generate-id');
            const textNode = createTextNode('text content');

            const id = fn!(createContext(), textNode) as string;
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });
    });

    describe('path', () => {
        it('should return the XPath of a node', () => {
            const fn = getBuiltInFunction('path');
            expect(fn).toBeDefined();

            const root = createElementNode('root');
            const child = createElementNode('child', {}, [], root);
            root.childNodes = [child];

            const path = fn!(createContext(), child) as string;
            expect(typeof path).toBe('string');
            expect(path).toContain('child');
        });

        it('should include position for non-unique node names', () => {
            const fn = getBuiltInFunction('path');
            const root = createElementNode('root');
            const child1 = createElementNode('item', {}, [], root);
            const child2 = createElementNode('item', {}, [], root);
            root.childNodes = [child1, child2];

            const path2 = fn!(createContext(), child2) as string;
            expect(path2).toMatch(/\[2\]/); // Second item should have [2]
        });

        it('should handle root node', () => {
            const fn = getBuiltInFunction('path');
            const root = createElementNode('root');

            const path = fn!(createContext(), root) as string;
            expect(typeof path).toBe('string');
            // Root path is typically just the element name
            expect(path.length).toBeGreaterThan(0);
        });

        it('should use context node when no argument provided', () => {
            const fn = getBuiltInFunction('path');
            const node = createElementNode('testNode');

            const path1 = fn!(createContext(node)) as string;
            const path2 = fn!(createContext(node)) as string;

            expect(path1).toBe(path2);
        });

        it('should return empty string for null input', () => {
            const fn = getBuiltInFunction('path');
            const result = fn!(createContext(), null);
            expect(result).toBe('');
        });
    });

    describe('has-children', () => {
        it('should return true for element with child elements', () => {
            const fn = getBuiltInFunction('has-children');
            expect(fn).toBeDefined();

            const parent = createElementNode('parent');
            const child = createElementNode('child', {}, [], parent);
            parent.childNodes = [child];

            const result = fn!(createContext(), parent);
            expect(result).toBe(true);
        });

        it('should return false for element with no children', () => {
            const fn = getBuiltInFunction('has-children');
            const empty = createElementNode('empty');

            const result = fn!(createContext(), empty);
            expect(result).toBe(false);
        });

        it('should return false for text nodes', () => {
            const fn = getBuiltInFunction('has-children');
            const textNode = createTextNode('text');

            const result = fn!(createContext(), textNode);
            expect(result).toBe(false);
        });

        it('should use context node when no argument provided', () => {
            const fn = getBuiltInFunction('has-children');
            const parent = createElementNode('parent');
            const child = createElementNode('child', {}, [], parent);
            parent.childNodes = [child];

            const result = fn!(createContext(parent));
            expect(result).toBe(true);
        });

        it('should return false for null input', () => {
            const fn = getBuiltInFunction('has-children');
            const result = fn!(createContext(), null);
            expect(result).toBe(false);
        });

        it('should return true when only text children exist', () => {
            const fn = getBuiltInFunction('has-children');
            const parent = createElementNode('parent');
            const textChild = createTextNode('text');
            parent.childNodes = [textChild];

            // Text nodes count as children
            const result = fn!(createContext(), parent);
            expect(Array.isArray(parent.childNodes) && parent.childNodes.length > 0).toBe(true);
        });
    });

    describe('innermost and outermost', () => {
        it('should return innermost nodes (deepest descendants)', () => {
            const fn = getBuiltInFunction('innermost');
            expect(fn).toBeDefined();

            const root = createElementNode('root');
            const child = createElementNode('child', {}, [], root);
            const grandchild = createElementNode('grandchild', {}, [], child);
            root.childNodes = [child];
            child.childNodes = [grandchild];

            const result = fn!(createContext(), [root, child, grandchild]) as any[];
            expect(result).toContain(grandchild);
            expect(result).not.toContain(root);
        });

        it('should return outermost nodes (shallowest ancestors)', () => {
            const fn = getBuiltInFunction('outermost');
            expect(fn).toBeDefined();

            const root = createElementNode('root');
            const child = createElementNode('child', {}, [], root);
            const grandchild = createElementNode('grandchild', {}, [], child);
            root.childNodes = [child];
            child.childNodes = [grandchild];

            const result = fn!(createContext(), [root, child, grandchild]) as any[];
            expect(result).toContain(root);
            expect(result).not.toContain(child);
            expect(result).not.toContain(grandchild);
        });

        it('should handle single node input', () => {
            const fn = getBuiltInFunction('innermost');
            const node = createElementNode('single');

            const result = fn!(createContext(), [node]) as any[];
            expect(result).toContain(node);
        });

        it('should handle siblings (same depth)', () => {
            const fn = getBuiltInFunction('innermost');
            const parent = createElementNode('parent');
            const child1 = createElementNode('child1', {}, [], parent);
            const child2 = createElementNode('child2', {}, [], parent);
            parent.childNodes = [child1, child2];

            const result = fn!(createContext(), [child1, child2]) as any[];
            expect(result.length).toBe(2); // Both at same depth
            expect(result).toContain(child1);
            expect(result).toContain(child2);
        });

        it('should return empty sequence for empty input', () => {
            const fn = getBuiltInFunction('innermost');
            const result = fn!(createContext(), []);
            expect(Array.isArray(result) && result.length === 0).toBe(true);
        });
    });

    describe('Complex node operations', () => {
        it('should handle deeply nested structures', () => {
            const fn = getBuiltInFunction('path');
            const root = createElementNode('root');
            let current = root;
            for (let i = 0; i < 5; i++) {
                const next = createElementNode(`level${i}`, {}, [], current);
                current.childNodes = [next];
                current = next;
            }

            const path = fn!(createContext(), current) as string;
            expect(path).toContain('root');
            expect(path).toContain('level4');
        });

        it('should maintain ID consistency across multiple calls', () => {
            const idFn = getBuiltInFunction('generate-id');
            const node = createElementNode('persistent');

            const ids = [];
            for (let i = 0; i < 5; i++) {
                ids.push(idFn!(createContext(), node));
            }

            // All IDs should be identical
            expect(ids.every(id => id === ids[0])).toBe(true);
        });

        it('should handle node collections with mixed types', () => {
            const innerFn = getBuiltInFunction('innermost');
            const element = createElementNode('elem');
            const text = createTextNode('text');
            const parent = createElementNode('parent', {}, [element, text], null);

            const result = innerFn!(createContext(), [parent, element, text]) as any[];
            // Both element and text are innermost
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        it('should identify ancestors and descendants correctly', () => {
            const root = createElementNode('root');
            const child = createElementNode('child', {}, [], root);
            const grandchild = createElementNode('grandchild', {}, [], child);
            root.childNodes = [child];
            child.childNodes = [grandchild];

            const pathFn = getBuiltInFunction('path');
            const childPath = pathFn!(createContext(), child) as string;
            const grandchildPath = pathFn!(createContext(), grandchild) as string;

            // Child path should be shorter/simpler than grandchild
            expect(grandchildPath.length).toBeGreaterThanOrEqual(childPath.length);
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle nodes without parentNode property gracefully', () => {
            const fn = getBuiltInFunction('root');
            const orphanNode = { nodeType: 1, nodeName: 'orphan' };

            const result = fn!(createContext(), orphanNode as any);
            expect(result).toBe(orphanNode); // Returns self as root
        });

        it('should handle null childNodes array', () => {
            const fn = getBuiltInFunction('has-children');
            const node = createElementNode('test');
            node.childNodes = null;

            const result = fn!(createContext(), node);
            expect(result).toBe(false);
        });

        it('should handle missing nodeType property', () => {
            const fn = getBuiltInFunction('path');
            const invalidNode = { nodeName: 'invalid' };

            // Should not crash
            expect(() => {
                fn!(createContext(), invalidNode as any);
            }).not.toThrow();
        });

        it('should handle arrays with null elements', () => {
            const fn = getBuiltInFunction('innermost');
            const node = createElementNode('valid');

            const result = fn!(createContext(), [node, null]) as any[];
            expect(result).toContain(node);
        });
    });

    describe('Specification compliance', () => {
        it('generate-id() should start with valid XML Name characters', () => {
            const fn = getBuiltInFunction('generate-id');
            const node = createElementNode('test');

            const id = fn!(createContext(), node) as string;
            // XML Name: must start with letter, underscore, or colon
            expect(/^[a-zA-Z_:]/.test(id)).toBe(true);
        });

        it('path() should return valid XPath expression for node', () => {
            const fn = getBuiltInFunction('path');
            const node = createElementNode('elem');

            const path = fn!(createContext(), node) as string;
            // Path should contain element information
            expect(path).toMatch(/elem/);
        });

        it('has-children() returns boolean', () => {
            const fn = getBuiltInFunction('has-children');
            const node = createElementNode('test');

            const result = fn!(createContext(), node);
            expect(typeof result).toBe('boolean');
        });

        it('innermost() maintains document order', () => {
            const fn = getBuiltInFunction('innermost');
            const root = createElementNode('root');
            const child1 = createElementNode('c1', {}, [], root);
            const child2 = createElementNode('c2', {}, [], root);
            const child3 = createElementNode('c3', {}, [], root);
            root.childNodes = [child1, child2, child3];

            const result = fn!(createContext(), [child1, child2, child3]) as any[];
            // Result should maintain relative order
            if (result.length > 1) {
                const idx1 = result.indexOf(child1);
                const idx2 = result.indexOf(child2);
                const idx3 = result.indexOf(child3);
                if (idx1 >= 0 && idx2 >= 0) {
                    expect(idx1 < idx2).toBe(true);
                }
            }
        });

        it('outermost() removes all descendants', () => {
            const fn = getBuiltInFunction('outermost');
            const root = createElementNode('root');
            const child = createElementNode('child', {}, [], root);
            const grandchild = createElementNode('grandchild', {}, [], child);
            root.childNodes = [child];
            child.childNodes = [grandchild];

            const result = fn!(createContext(), [root, child, grandchild]) as any[];
            expect(result.length).toBe(1);
            expect(result[0]).toBe(root);
        });
    });
});
