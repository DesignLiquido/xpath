import {
    XPathContext,
    createContext,
    XPathDocuments,
    XPathCollections,
    XPathFunctionRegistry,
} from '../src';

describe('XPath Dynamic Context (XPath 2.0+)', () => {
    describe('Current dateTime', () => {
        it('allows setting current dateTime in dynamic context', () => {
            const now = new Date('2025-01-24T10:30:00Z');
            const ctx: XPathContext = createContext(undefined as any, {
                currentDateTime: now,
            });

            expect(ctx.currentDateTime).toBe(now);
        });

        it('creates context without currentDateTime (defaults at evaluation time)', () => {
            const ctx: XPathContext = createContext(undefined as any);
            expect(ctx.currentDateTime).toBeUndefined();
        });
    });

    describe('Available documents mapping', () => {
        it('stores document URIs mapping to root nodes', () => {
            const mockNode = {
                nodeName: '#document',
                nodeType: 9,
                childNodes: [],
            };
            const docs: XPathDocuments = {
                'http://example.com/data.xml': mockNode as any,
                'http://example.com/missing.xml': null,
            };
            const ctx: XPathContext = createContext(undefined as any, {
                availableDocuments: docs,
            });

            expect(ctx.availableDocuments).toEqual(docs);
            expect(ctx.availableDocuments?.['http://example.com/data.xml']).toBe(mockNode);
            expect(ctx.availableDocuments?.['http://example.com/missing.xml']).toBeNull();
        });

        it('supports empty documents mapping', () => {
            const ctx: XPathContext = createContext(undefined as any, {
                availableDocuments: {},
            });

            expect(ctx.availableDocuments).toEqual({});
        });
    });

    describe('Available collections mapping', () => {
        it('stores collection URIs mapping to node sequences', () => {
            const mockNode1 = { nodeName: 'item', nodeType: 1 };
            const mockNode2 = { nodeName: 'item', nodeType: 1 };
            const collections: XPathCollections = {
                'http://example.com/collection1': [mockNode1 as any, mockNode2 as any],
                'http://example.com/collection2': [],
            };
            const ctx: XPathContext = createContext(undefined as any, {
                availableCollections: collections,
            });

            expect(ctx.availableCollections).toEqual(collections);
            expect(ctx.availableCollections?.['http://example.com/collection1']).toHaveLength(2);
            expect(ctx.availableCollections?.['http://example.com/collection2']).toHaveLength(0);
        });
    });

    describe('Default collection', () => {
        it('sets default collection URI', () => {
            const ctx: XPathContext = createContext(undefined as any, {
                defaultCollection: 'http://example.com/default',
            });

            expect(ctx.defaultCollection).toBe('http://example.com/default');
        });

        it('works with available collections for fn:collection()', () => {
            const mockNode = { nodeName: 'item', nodeType: 1 };
            const ctx: XPathContext = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/default': [mockNode as any],
                },
                defaultCollection: 'http://example.com/default',
            });

            const collection = ctx.availableCollections?.[ctx.defaultCollection || ''];
            expect(collection).toHaveLength(1);
            expect(collection?.[0]).toBe(mockNode);
        });
    });

    describe('Function implementations registry', () => {
        it('registers function implementations by local name', () => {
            const mockFn = () => 'result';
            const registry: XPathFunctionRegistry = {
                'custom-fn': mockFn,
                'another-fn': () => 42,
            };
            const ctx: XPathContext = createContext(undefined as any, {
                functionRegistry: registry,
            });

            expect(ctx.functionRegistry).toEqual(registry);
            expect(ctx.functionRegistry?.['custom-fn']).toBe(mockFn);
            expect(ctx.functionRegistry?.['custom-fn']()).toBe('result');
        });

        it('supports QName-style function names with namespaces', () => {
            const registry: XPathFunctionRegistry = {
                'xs:string': () => '',
                'fn:concat': (...args: any[]) => args.join(''),
                'custom:my-fn': () => null,
            };
            const ctx: XPathContext = createContext(undefined as any, {
                functionRegistry: registry,
            });

            expect(ctx.functionRegistry?.['xs:string']).toBeDefined();
            expect(ctx.functionRegistry?.['fn:concat']('a', 'b')).toBe('ab');
        });

        it('allows function registry to be empty', () => {
            const ctx: XPathContext = createContext(undefined as any, {
                functionRegistry: {},
            });

            expect(ctx.functionRegistry).toEqual({});
        });
    });

    describe('Combined dynamic context', () => {
        it('combines all dynamic context properties together', () => {
            const now = new Date('2025-01-24T12:00:00Z');
            const mockNode = { nodeName: '#document', nodeType: 9 };
            const ctx: XPathContext = createContext(undefined as any, {
                currentDateTime: now,
                availableDocuments: { 'http://example.com/doc.xml': mockNode as any },
                availableCollections: { 'http://example.com/col': [mockNode as any] },
                defaultCollection: 'http://example.com/col',
                functionRegistry: { 'custom:fn': () => 'value' },
                baseUri: 'http://example.com/',
                defaultCollation: 'http://www.w3.org/2005/xpath-functions/collation/codepoint',
            });

            expect(ctx.currentDateTime).toBe(now);
            expect(ctx.availableDocuments).toBeDefined();
            expect(ctx.availableCollections).toBeDefined();
            expect(ctx.defaultCollection).toBe('http://example.com/col');
            expect(ctx.functionRegistry?.['custom:fn']()).toBe('value');
            expect(ctx.baseUri).toBe('http://example.com/');
            expect(ctx.defaultCollation).toBeDefined();
        });

        it('preserves dynamic context across predicate evaluation', () => {
            const now = new Date();
            const parentCtx: XPathContext = createContext(undefined as any, {
                currentDateTime: now,
                functionRegistry: { 'test-fn': () => 1 },
            });
            parentCtx.position = 1;
            parentCtx.size = 5;

            const childCtx: XPathContext = {
                ...parentCtx,
                position: 2,
                size: 5,
            };

            expect(childCtx.currentDateTime).toBe(now);
            expect(childCtx.functionRegistry?.['test-fn']()).toBe(1);
            expect(childCtx.position).toBe(2);
            expect(childCtx.size).toBe(5);
        });
    });
});
