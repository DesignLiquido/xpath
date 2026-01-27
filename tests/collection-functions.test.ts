import { describe, it, expect, beforeEach } from '@jest/globals';
import { createContext } from '../src/context';
import { collectionFn, docFn, docAvailableFn } from '../src/functions/collection-functions';

describe('Collection Functions (Phase 9.1)', () => {
    let ctx: any;

    beforeEach(() => {
        ctx = createContext(undefined as any);
    });

    describe('fn:collection()', () => {
        it('should return empty sequence when no default collection and no argument', () => {
            const result = collectionFn(ctx);
            expect(result).toEqual([]);
        });

        it('should return default collection when no argument provided', () => {
            const mockNode1 = { nodeName: 'item', nodeType: 1 };
            const mockNode2 = { nodeName: 'item', nodeType: 1 };
            const ctx2 = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/default': [mockNode1, mockNode2],
                },
                defaultCollection: 'http://example.com/default',
            });

            const result = collectionFn(ctx2);
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(mockNode1);
            expect(result[1]).toBe(mockNode2);
        });

        it('should return specified collection by URI', () => {
            const mockNode = { nodeName: 'item', nodeType: 1 };
            const ctx2 = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/collection1': [mockNode],
                    'http://example.com/collection2': [],
                },
            });

            const result = collectionFn(ctx2, 'http://example.com/collection1');
            expect(result).toHaveLength(1);
            expect(result[0]).toBe(mockNode);
        });

        it('should return empty sequence for non-existent collection URI', () => {
            const mockNode = { nodeName: 'item', nodeType: 1 };
            const ctx2 = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/collection1': [mockNode],
                },
            });

            const result = collectionFn(ctx2, 'http://example.com/nonexistent');
            expect(result).toEqual([]);
        });

        it('should return empty sequence when no availableCollections in context', () => {
            const ctx2 = createContext(undefined as any, {
                defaultCollection: 'http://example.com/default',
            });

            const result = collectionFn(ctx2);
            expect(result).toEqual([]);
        });

        it('should handle null URI argument as default collection', () => {
            const mockNode = { nodeName: 'item', nodeType: 1 };
            const ctx2 = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/default': [mockNode],
                },
                defaultCollection: 'http://example.com/default',
            });

            const result = collectionFn(ctx2, null);
            expect(result).toHaveLength(1);
            expect(result[0]).toBe(mockNode);
        });

        it('should preserve node order from collection', () => {
            const nodes = [
                { nodeName: 'a', nodeType: 1 },
                { nodeName: 'b', nodeType: 1 },
                { nodeName: 'c', nodeType: 1 },
            ];
            const ctx2 = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/collection': nodes,
                },
            });

            const result = collectionFn(ctx2, 'http://example.com/collection');
            expect(result).toEqual(nodes);
        });

        it('should handle multiple collections independently', () => {
            const nodes1 = [{ nodeName: 'item', nodeType: 1 }];
            const nodes2 = [
                { nodeName: 'item', nodeType: 1 },
                { nodeName: 'item', nodeType: 1 },
            ];
            const ctx2 = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/col1': nodes1,
                    'http://example.com/col2': nodes2,
                },
            });

            const result1 = collectionFn(ctx2, 'http://example.com/col1');
            const result2 = collectionFn(ctx2, 'http://example.com/col2');

            expect(result1).toHaveLength(1);
            expect(result2).toHaveLength(2);
        });

        it('should return empty array for empty collection', () => {
            const ctx2 = createContext(undefined as any, {
                availableCollections: {
                    'http://example.com/empty': [],
                },
            });

            const result = collectionFn(ctx2, 'http://example.com/empty');
            expect(result).toEqual([]);
        });
    });

    describe('fn:doc()', () => {
        it('should return document from availableDocuments', () => {
            const mockDoc = { nodeName: '#document', nodeType: 9 };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc1.xml': mockDoc,
                },
            });

            const result = docFn(ctx2, 'http://example.com/doc1.xml');
            expect(result).toBe(mockDoc);
        });

        it('should return null for non-existent document URI', () => {
            const mockDoc = { nodeName: '#document', nodeType: 9 };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc1.xml': mockDoc,
                },
            });

            const result = docFn(ctx2, 'http://example.com/nonexistent.xml');
            expect(result).toBeNull();
        });

        it('should return null when no availableDocuments in context', () => {
            const result = docFn(ctx, 'http://example.com/doc.xml');
            expect(result).toBeNull();
        });

        it('should throw error for empty URI', () => {
            expect(() => {
                docFn(ctx, '');
            }).toThrow();
        });

        it('should handle multiple documents independently', () => {
            const doc1 = { nodeName: '#document', nodeType: 9, uri: 'doc1' };
            const doc2 = { nodeName: '#document', nodeType: 9, uri: 'doc2' };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc1.xml': doc1,
                    'http://example.com/doc2.xml': doc2,
                },
            });

            const result1 = docFn(ctx2, 'http://example.com/doc1.xml');
            const result2 = docFn(ctx2, 'http://example.com/doc2.xml');

            expect(result1).toBe(doc1);
            expect(result2).toBe(doc2);
        });
    });

    describe('fn:doc-available()', () => {
        it('should return true for available document', () => {
            const mockDoc = { nodeName: '#document', nodeType: 9 };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc1.xml': mockDoc,
                },
            });

            const result = docAvailableFn(ctx2, 'http://example.com/doc1.xml');
            expect(result).toBe(true);
        });

        it('should return false for non-existent document URI', () => {
            const mockDoc = { nodeName: '#document', nodeType: 9 };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc1.xml': mockDoc,
                },
            });

            const result = docAvailableFn(ctx2, 'http://example.com/nonexistent.xml');
            expect(result).toBe(false);
        });

        it('should return false for empty URI', () => {
            const result = docAvailableFn(ctx, '');
            expect(result).toBe(false);
        });

        it('should return false when no availableDocuments in context', () => {
            const result = docAvailableFn(ctx, 'http://example.com/doc.xml');
            expect(result).toBe(false);
        });

        it('should return false for null URI', () => {
            const result = docAvailableFn(ctx, null as any);
            expect(result).toBe(false);
        });

        it('should return true for multiple documents', () => {
            const doc1 = { nodeName: '#document', nodeType: 9 };
            const doc2 = { nodeName: '#document', nodeType: 9 };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc1.xml': doc1,
                    'http://example.com/doc2.xml': doc2,
                },
            });

            const result1 = docAvailableFn(ctx2, 'http://example.com/doc1.xml');
            const result2 = docAvailableFn(ctx2, 'http://example.com/doc2.xml');

            expect(result1).toBe(true);
            expect(result2).toBe(true);
        });

        it('should be consistent with fn:doc() when document exists', () => {
            const mockDoc = { nodeName: '#document', nodeType: 9 };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc.xml': mockDoc,
                },
            });

            const available = docAvailableFn(ctx2, 'http://example.com/doc.xml');
            const doc = docFn(ctx2, 'http://example.com/doc.xml');

            expect(available).toBe(true);
            expect(doc).not.toBeNull();
        });

        it('should be consistent with fn:doc() when document does not exist', () => {
            const mockDoc = { nodeName: '#document', nodeType: 9 };
            const ctx2 = createContext(undefined as any, {
                availableDocuments: {
                    'http://example.com/doc.xml': mockDoc,
                },
            });

            const available = docAvailableFn(ctx2, 'http://example.com/missing.xml');
            const doc = docFn(ctx2, 'http://example.com/missing.xml');

            expect(available).toBe(false);
            expect(doc).toBeNull();
        });
    });
});
