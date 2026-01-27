/**
 * XSLT 3.0 Functions Tests
 *
 * Comprehensive test suite for XSLT 3.0 features including:
 * - Streaming functions (accumulators, copy-of)
 * - Try-catch expressions
 * - Enhanced serialization
 */

import {
    accumulatorBefore,
    accumulatorAfter,
    copyOf,
    registerAccumulators,
    updateAccumulator,
    createStreamingSnapshot,
    restoreStreamingSnapshot,
} from '../src/functions/xslt-streaming-functions';

import {
    TryExpression,
    createTryOnly,
    createTryWithFallback,
} from '../src/expressions';

import { serialize } from '../src/functions/serialization-functions';

import { XPathContext } from '../src/context';

describe('XSLT 3.0 Functions - Phase 9.2', () => {
    // Helper to create context
    const createContext = (variables: Record<string, any> = {}): XPathContext =>
    ({
        node: undefined,
        position: 1,
        size: 1,
        variables,
        functions: {},
    } as XPathContext);
    // ==================== Streaming Functions ====================

    describe('Streaming Functions', () => {
        describe('Accumulator Functions', () => {
            it('should register accumulators', () => {
                const context = createContext();
                const accumulators = {
                    'test-acc': {
                        value: 0,
                        rules: [],
                    },
                };

                registerAccumulators(context, accumulators);
                expect((context as any).__xslt_accumulator_registry).toBeDefined();
            });

            it('should get accumulator-before value', () => {
                const context = createContext();
                const accumulators = {
                    'count-acc': {
                        value: 5,
                        rules: [],
                        preValue: 3,
                    },
                };

                registerAccumulators(context, accumulators);
                const result = accumulatorBefore(context, 'count-acc');

                expect(result).toBe(3);
            });

            it('should get accumulator-after value', () => {
                const context = createContext();
                const accumulators = {
                    'count-acc': {
                        value: 5,
                        rules: [],
                        postValue: 7,
                    },
                };

                registerAccumulators(context, accumulators);
                const result = accumulatorAfter(context, 'count-acc');

                expect(result).toBe(7);
            });

            it('should return current value if pre/post not set', () => {
                const context = createContext();
                const accumulators = {
                    'count-acc': {
                        value: 10,
                        rules: [],
                    },
                };

                registerAccumulators(context, accumulators);

                expect(accumulatorBefore(context, 'count-acc')).toBe(10);
                expect(accumulatorAfter(context, 'count-acc')).toBe(10);
            });

            it('should throw error for undefined accumulator', () => {
                const context = createContext();
                expect(() => accumulatorBefore(context, 'undefined-acc')).toThrow(
                    'Accumulator not defined: undefined-acc'
                );
            });

            it('should update accumulator value', () => {
                const context = createContext();
                registerAccumulators(context, {
                    'count-acc': { value: 0, rules: [] },
                });

                updateAccumulator(context, 'count-acc', 5, 'post');
                const result = accumulatorAfter(context, 'count-acc');

                expect(result).toBe(5);
            });

            it('should create and restore streaming snapshots', () => {
                const context = createContext();
                registerAccumulators(context, {
                    'acc1': { value: 10, rules: [] },
                    'acc2': { value: 20, rules: [] },
                });

                const snapshot = createStreamingSnapshot(context);

                expect(snapshot.get('acc1')).toBe(10);
                expect(snapshot.get('acc2')).toBe(20);

                updateAccumulator(context, 'acc1', 99, 'post');
                expect(accumulatorAfter(context, 'acc1')).toBe(99);

                restoreStreamingSnapshot(context, snapshot);
                expect(accumulatorAfter(context, 'acc1')).toBe(10);
            });
        });

        describe('Copy-Of Function', () => {
            it('should handle undefined nodes', () => {
                const context = createContext();
                const result = copyOf(context, undefined);

                expect(result).toBeUndefined();
            });

            it('should handle null nodes', () => {
                const context = createContext();
                const result = copyOf(context, null);

                expect(result).toBeNull();
            });

            it('should copy single node (deep)', () => {
                const context = createContext();
                const node = {
                    nodeName: 'test',
                    nodeType: 1,
                    nodeValue: 'value',
                    childNodes: [],
                };

                const copy = copyOf(context, node, true);

                expect(copy.nodeName).toBe('test');
                expect(copy.nodeValue).toBe('value');
                expect(copy).not.toBe(node);
            });

            it('should copy single node (shallow)', () => {
                const context = createContext();
                const childNode = { nodeName: 'child', nodeType: 3, nodeValue: 'text' };
                const node = {
                    nodeName: 'test',
                    nodeType: 1,
                    nodeValue: 'value',
                    childNodes: [childNode],
                };

                const copy = copyOf(context, node, false);

                expect(copy.nodeName).toBe('test');
                expect(copy.childNodes).toBe(node.childNodes); // Shallow copy shares reference
            });

            it('should handle array of nodes', () => {
                const context = createContext();
                const nodes = [
                    { nodeName: 'a', nodeType: 1, nodeValue: '', childNodes: [] },
                    { nodeName: 'b', nodeType: 1, nodeValue: '', childNodes: [] },
                ];

                const copies = copyOf(context, nodes, true);

                expect(Array.isArray(copies)).toBe(true);
                expect(copies.length).toBe(2);
                expect(copies[0]).not.toBe(nodes[0]);
            });

            it('should handle atomic values', () => {
                const context = createContext();

                expect(copyOf(context, 42)).toBe(42);
                expect(copyOf(context, 'string')).toBe('string');
                expect(copyOf(context, true)).toBe(true);
            });
        });
    });

    // ==================== Try-Catch Expressions ====================

    describe('Try-Catch Expressions', () => {
        it('should create try-catch expression', () => {
            const tryExpr = { toString: () => 'try_expr' } as any;
            const catchExpr = { toString: () => 'catch_expr' } as any;

            const tryStmt = new TryExpression(tryExpr, catchExpr);
            expect(tryStmt).toBeDefined();
        });

        it('should provide string representation without catch', () => {
            const tryExpr = { toString: () => 'try_expr' } as any;
            const tryStmt = new TryExpression(tryExpr, undefined);
            const str = tryStmt.toString();

            expect(str).toContain('try');
            expect(str).toContain('try_expr');
        });

        it('should provide string representation with catch', () => {
            const tryExpr = { toString: () => 'try_expr' } as any;
            const catchExpr = { toString: () => 'catch_expr' } as any;

            const tryStmt = new TryExpression(tryExpr, catchExpr);
            const str = tryStmt.toString();

            expect(str).toContain('try');
            expect(str).toContain('catch');
        });

        it('should create try-only (suppress errors)', () => {
            const tryExpr = { toString: () => 'test' } as any;
            const tryStmt = createTryOnly(tryExpr);

            expect(tryStmt).toBeDefined();
            expect(tryStmt.toString()).toContain('try');
        });

        it('should create try with fallback value', () => {
            const tryExpr = { toString: () => 'test' } as any;
            const tryStmt = createTryWithFallback(tryExpr, 'default-value');

            expect(tryStmt).toBeDefined();
            expect(tryStmt.toString()).toContain('try');
        });
    });

    // ==================== Serialization Functions ====================

    describe('Serialization Functions', () => {
        describe('XML Serialization', () => {
            it('should serialize element as XML', () => {
                const node = {
                    nodeName: 'root',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'xml', 'omit-xml-declaration': true });

                expect(result).toContain('<root');
            });

            it('should include XML declaration', () => {
                const node = {
                    nodeName: 'root',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'xml', 'omit-xml-declaration': false });

                expect(result).toContain('<?xml');
            });

            it('should serialize with attributes', () => {
                const node = {
                    nodeName: 'element',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [{ nodeName: 'id', nodeValue: '123' }],
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'xml', 'omit-xml-declaration': true });

                expect(result).toContain('id="123"');
            });

            it('should serialize with children', () => {
                const node = {
                    nodeName: 'root',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [
                        {
                            nodeName: 'child',
                            nodeType: 1,
                            nodeValue: '',
                            attributes: [],
                            childNodes: [],
                        },
                    ],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'xml', 'omit-xml-declaration': true });

                expect(result).toContain('<root>');
                expect(result).toContain('<child');
            });

            it('should escape XML special characters', () => {
                const node = {
                    nodeName: 'text',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [
                        {
                            nodeName: '#text',
                            nodeType: 3,
                            nodeValue: 'Value with <special> & "chars"',
                        },
                    ],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'xml', 'omit-xml-declaration': true });

                expect(result).toContain('&lt;special&gt;');
                expect(result).toContain('&amp;');
                expect(result).toContain('&quot;');
            });
        });

        describe('HTML Serialization', () => {
            it('should serialize as HTML with DOCTYPE', () => {
                const node = {
                    nodeName: 'html',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'html' });

                expect(result).toContain('<!DOCTYPE html>');
                expect(result).toContain('<html');
            });

            it('should handle HTML void elements', () => {
                const node = {
                    nodeName: 'br',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'html' });

                expect(result).toContain('<br>');
                expect(result).not.toContain('</br>');
            });

            it('should lowercase HTML tag names', () => {
                const node = {
                    nodeName: 'DIV',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [{ nodeName: 'CLASS', nodeValue: 'test' }],
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'html' });

                expect(result).toContain('<div');
                expect(result).toContain('class=');
            });
        });

        describe('Text Serialization', () => {
            it('should extract text content', () => {
                const node = {
                    nodeName: 'root',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [
                        {
                            nodeName: '#text',
                            nodeType: 3,
                            nodeValue: 'Hello World',
                        },
                    ],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'text' });

                expect(result).toBe('Hello World');
            });

            it('should handle atomic values', () => {
                const context = createContext();
                const result = serialize(context, 42, { method: 'text' });

                expect(result).toBe('42');
            });

            it('should concatenate multiple text nodes', () => {
                const context = createContext();
                const result = serialize(context, ['hello', ' ', 'world'], { method: 'text' });

                expect(result).toContain('hello');
                expect(result).toContain('world');
            });
        });

        describe('JSON Serialization', () => {
            it('should serialize as JSON', () => {
                const obj = { name: 'test', value: 42 };
                const context = createContext();
                const result = serialize(context, obj, { method: 'json' });

                expect(JSON.parse(result)).toEqual(obj);
            });

            it('should handle arrays', () => {
                const arr = [1, 2, 3, 4, 5];
                const context = createContext();
                const result = serialize(context, arr, { method: 'json' });

                expect(JSON.parse(result)).toEqual(arr);
            });
        });

        describe('Adaptive Method', () => {
            it('should auto-select XML for elements', () => {
                const node = {
                    nodeName: 'root',
                    nodeType: 1,
                    nodeValue: '',
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'adaptive', 'omit-xml-declaration': true });

                expect(result).toContain('<root');
            });

            it('should auto-select HTML for HTML elements', () => {
                const node = {
                    nodeName: 'html',
                    nodeType: 1,
                    nodeValue: '',
                    childNodes: [],
                };

                const context = createContext();
                const result = serialize(context, node, { method: 'adaptive' });

                expect(result).toContain('<!DOCTYPE html>');
            });

            it('should auto-select text for atomic values', () => {
                const context = createContext();
                const result = serialize(context, 'string value', { method: 'adaptive' });

                expect(result).toBe('string value');
            });

            it('should auto-select JSON for objects', () => {
                const obj = { key: 'value' };
                const context = createContext();
                const result = serialize(context, obj, { method: 'adaptive' });

                expect(JSON.parse(result)).toEqual(obj);
            });
        });

        describe('Serialization Parameters', () => {
            it('should apply indentation', () => {
                const node = {
                    nodeName: 'root',
                    nodeType: 1,
                    nodeValue: '',
                    attributes: [],
                    childNodes: [
                        {
                            nodeName: 'child',
                            nodeType: 1,
                            nodeValue: '',
                            attributes: [],
                            childNodes: [],
                        },
                    ],
                };

                const context = createContext();
                const result = serialize(context, node, {
                    method: 'xml',
                    'omit-xml-declaration': true,
                    'indent': true,
                    'indent-spaces': 4,
                });

                // Should have indentation
                expect(result).toMatch(/\s{4}</);
            });

            it('should handle empty sequence', () => {
                const context = createContext();
                const result = serialize(context, undefined);

                expect(result).toBe('');
            });
        });
    });
});
