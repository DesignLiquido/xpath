/**
 * Compatibility Mode Tests (Phase 8.1)
 *
 * Tests for XPath 1.0 backward compatibility mode implementation.
 * Ensures XPath 1.0 type conversion rules work correctly in XPath 2.0+ expressions.
 *
 * Reference: XPath 2.0 Specification, Section 3.6 and Appendix I
 */

import {
    toBoolean1_0,
    toNumber1_0,
    toString1_0,
    getNodeStringValue,
    getFirstItem,
    toNodeSet,
    compare1_0,
    createCompatibilityMode,
    isEmptySequence,
    XPath1CompatibilityMode,
} from '../src/compatibility';
import { XPathNode } from '../src/node';

describe('XPath 1.0 Compatibility Mode (Phase 8.1)', () => {
    // ===== Boolean Conversion Tests =====

    describe('toBoolean1_0 - Boolean Conversion', () => {
        it('should convert empty sequence to false', () => {
            expect(toBoolean1_0(null)).toBe(false);
            expect(toBoolean1_0(undefined)).toBe(false);
        });

        it('should convert empty sequence (array) to false', () => {
            expect(toBoolean1_0([])).toBe(false);
        });

        it('should convert non-empty sequence to true', () => {
            expect(toBoolean1_0([1, 2, 3])).toBe(true);
            expect(toBoolean1_0([0])).toBe(true); // Even 0 in array = true
        });

        it('should convert number 0 to false', () => {
            expect(toBoolean1_0(0)).toBe(false);
        });

        it('should convert non-zero number to true', () => {
            expect(toBoolean1_0(1)).toBe(true);
            expect(toBoolean1_0(-1)).toBe(true);
            expect(toBoolean1_0(0.001)).toBe(true);
        });

        it('should convert NaN to false', () => {
            expect(toBoolean1_0(NaN)).toBe(false);
        });

        it('should convert empty string to false', () => {
            expect(toBoolean1_0('')).toBe(false);
        });

        it('should convert non-empty string to true', () => {
            expect(toBoolean1_0('hello')).toBe(true);
            expect(toBoolean1_0('0')).toBe(true); // String '0' is true
            expect(toBoolean1_0(' ')).toBe(true); // Even whitespace
        });

        it('should preserve boolean values', () => {
            expect(toBoolean1_0(true)).toBe(true);
            expect(toBoolean1_0(false)).toBe(false);
        });

        it('should convert objects to true', () => {
            expect(toBoolean1_0({})).toBe(true);
            expect(toBoolean1_0({ key: 'value' })).toBe(true);
        });
    });

    // ===== Numeric Conversion Tests =====

    describe('toNumber1_0 - Numeric Conversion', () => {
        it('should convert empty sequence to NaN', () => {
            expect(toNumber1_0(null)).toBe(NaN);
            expect(toNumber1_0(undefined)).toBe(NaN);
        });

        it('should convert empty array to NaN', () => {
            expect(toNumber1_0([])).toBe(NaN);
        });

        it('should convert array to first item\'s number', () => {
            expect(toNumber1_0([42])).toBe(42);
            expect(toNumber1_0(['123'])).toBe(123);
            expect(toNumber1_0([true])).toBe(1);
            expect(toNumber1_0([false])).toBe(0);
        });

        it('should convert boolean to number', () => {
            expect(toNumber1_0(true)).toBe(1);
            expect(toNumber1_0(false)).toBe(0);
        });

        it('should preserve numbers', () => {
            expect(toNumber1_0(42)).toBe(42);
            expect(toNumber1_0(-3.14)).toBe(-3.14);
            expect(toNumber1_0(0)).toBe(0);
        });

        it('should convert numeric strings to number', () => {
            expect(toNumber1_0('42')).toBe(42);
            expect(toNumber1_0('-3.14')).toBe(-3.14);
            expect(toNumber1_0('0')).toBe(0);
        });

        it('should convert empty string to NaN', () => {
            expect(toNumber1_0('')).toBe(NaN);
        });

        it('should convert whitespace-only string to NaN', () => {
            expect(toNumber1_0('   ')).toBe(NaN);
        });

        it('should convert non-numeric strings to NaN', () => {
            expect(toNumber1_0('hello')).toBe(NaN);
            expect(toNumber1_0('12abc')).toBe(NaN);
        });

        it('should handle special float values', () => {
            expect(toNumber1_0('Infinity')).toBe(Infinity);
            expect(toNumber1_0('-Infinity')).toBe(-Infinity);
        });
    });

    // ===== String Conversion Tests =====

    describe('toString1_0 - String Conversion', () => {
        it('should convert empty sequence to empty string', () => {
            expect(toString1_0(null)).toBe('');
            expect(toString1_0(undefined)).toBe('');
        });

        it('should convert empty array to empty string', () => {
            expect(toString1_0([])).toBe('');
        });

        it('should convert array to first item\'s string', () => {
            expect(toString1_0([42])).toBe('42');
            expect(toString1_0(['hello'])).toBe('hello');
        });

        it('should preserve strings', () => {
            expect(toString1_0('hello')).toBe('hello');
            expect(toString1_0('')).toBe('');
        });

        it('should convert boolean to string', () => {
            expect(toString1_0(true)).toBe('true');
            expect(toString1_0(false)).toBe('false');
        });

        it('should convert numbers to strings', () => {
            expect(toString1_0(42)).toBe('42');
            expect(toString1_0(-3.14)).toBe('-3.14');
            expect(toString1_0(0)).toBe('0');
        });

        it('should convert special numbers to strings', () => {
            expect(toString1_0(NaN)).toBe('NaN');
            expect(toString1_0(Infinity)).toBe('Infinity');
            expect(toString1_0(-Infinity)).toBe('-Infinity');
        });

        it('should not append .0 to integers', () => {
            expect(toString1_0(42)).toBe('42');
            expect(toString1_0(0)).toBe('0');
        });
    });

    // ===== Node String Value Tests =====

    describe('getNodeStringValue - Node String Values', () => {
        it('should return text node value', () => {
            const textNode: any = {
                nodeType: 3,
                nodeName: '#text',
                nodeValue: 'Hello',
            };
            expect(getNodeStringValue(textNode)).toBe('Hello');
        });

        it('should return attribute value', () => {
            const attrNode: any = {
                nodeType: 2,
                nodeName: 'id',
                value: 'attr-value',
            };
            expect(getNodeStringValue(attrNode)).toBe('attr-value');
        });

        it('should return element text concatenation', () => {
            const element: any = {
                nodeType: 1,
                nodeName: 'element',
                childNodes: [
                    { nodeType: 3, nodeName: '#text', nodeValue: 'Hello ' },
                    { nodeType: 3, nodeName: '#text', nodeValue: 'World' },
                ],
            };
            expect(getNodeStringValue(element)).toBe('Hello World');
        });

        it('should recursively extract element text', () => {
            const element: any = {
                nodeType: 1,
                nodeName: 'element',
                childNodes: [
                    { nodeType: 3, nodeName: '#text', nodeValue: 'Start' },
                    {
                        nodeType: 1,
                        nodeName: 'sub',
                        childNodes: [
                            { nodeType: 3, nodeName: '#text', nodeValue: 'Middle' },
                        ],
                    },
                    { nodeType: 3, nodeName: '#text', nodeValue: 'End' },
                ],
            };
            expect(getNodeStringValue(element)).toBe('StartMiddleEnd');
        });

        it('should return comment value', () => {
            const comment: any = {
                nodeType: 8,
                nodeName: '#comment',
                nodeValue: 'Comment text',
            };
            expect(getNodeStringValue(comment)).toBe('Comment text');
        });

        it('should return processing instruction value', () => {
            const pi: any = {
                nodeType: 7,
                nodeName: 'pi',
                nodeValue: 'PI data',
            };
            expect(getNodeStringValue(pi)).toBe('PI data');
        });

        it('should handle empty element', () => {
            const element: any = {
                nodeType: 1,
                nodeName: 'element',
                childNodes: [],
            };
            expect(getNodeStringValue(element)).toBe('');
        });

        it('should handle null node', () => {
            expect(getNodeStringValue(null as any)).toBe('');
        });
    });

    // ===== First Item Extraction Tests =====

    describe('getFirstItem - First Item Extraction', () => {
        it('should extract first item from sequence', () => {
            expect(getFirstItem([1, 2, 3])).toBe(1);
        });

        it('should return single value as-is', () => {
            expect(getFirstItem(42)).toBe(42);
            expect(getFirstItem('hello')).toBe('hello');
        });

        it('should return null for empty sequence', () => {
            expect(getFirstItem(null)).toBeNull();
            expect(getFirstItem(undefined)).toBeNull();
        });

        it('should return null for empty array', () => {
            expect(getFirstItem([])).toBeNull();
        });

        it('should extract first node from node-set', () => {
            const node1: any = { nodeType: 1, nodeName: 'test' };
            const node2: any = { nodeType: 1, nodeName: 'test' };
            expect(getFirstItem([node1, node2])).toBe(node1);
        });
    });

    // ===== Node-Set Conversion Tests =====

    describe('toNodeSet - Node-Set Conversion', () => {
        it('should extract nodes from sequence', () => {
            const node1: any = { nodeType: 1, nodeName: 'test' };
            const node2: any = { nodeType: 1, nodeName: 'test' };
            const result = toNodeSet([node1, node2]);
            expect(result).toEqual([node1, node2]);
        });

        it('should return single node in array', () => {
            const node: any = { nodeType: 1, nodeName: 'test' };
            expect(toNodeSet(node)).toEqual([node]);
        });

        it('should return empty array for null', () => {
            expect(toNodeSet(null)).toEqual([]);
            expect(toNodeSet(undefined)).toEqual([]);
        });

        it('should filter non-nodes from sequence', () => {
            const node: any = { nodeType: 1, nodeName: 'test' };
            const result = toNodeSet([1, node, 'string', null]);
            expect(result).toEqual([node]);
        });

        it('should remove duplicate nodes', () => {
            const node: any = { nodeType: 1, nodeName: 'test' };
            const result = toNodeSet([node, 42, node, 'hello']);
            expect(result).toEqual([node]);
        });

        it('should return empty array for non-node values', () => {
            expect(toNodeSet(42)).toEqual([]);
            expect(toNodeSet('hello')).toEqual([]);
            expect(toNodeSet({ key: 'value' })).toEqual([]);
        });
    });

    // ===== Comparison Tests =====

    describe('compare1_0 - XPath 1.0 Comparisons', () => {
        it('should compare numbers equal', () => {
            expect(compare1_0(42, 42, '==')).toBe(true);
            expect(compare1_0(3.14, 3.14, '==')).toBe(true);
        });

        it('should handle empty sequence in comparison', () => {
            expect(compare1_0(null, 42, '==')).toBe(false);
            expect(compare1_0(42, null, '==')).toBe(false);
        });

        it('should compare numbers with != operator', () => {
            expect(compare1_0(42, 43, '!=')).toBe(true);
            expect(compare1_0(42, 42, '!=')).toBe(false);
        });

        it('should convert to number for < comparison', () => {
            expect(compare1_0(10, 20, '<')).toBe(true);
            expect(compare1_0('10', 20, '<')).toBe(true);
            expect(compare1_0(30, 20, '<')).toBe(false);
        });

        it('should return false for < with NaN', () => {
            expect(compare1_0(NaN, 42, '<')).toBe(false);
            expect(compare1_0(42, NaN, '<')).toBe(false);
        });

        it('should handle <= comparison', () => {
            expect(compare1_0(10, 20, '<=')).toBe(true);
            expect(compare1_0(20, 20, '<=')).toBe(true);
            expect(compare1_0(30, 20, '<=')).toBe(false);
        });

        it('should handle > comparison', () => {
            expect(compare1_0(30, 20, '>')).toBe(true);
            expect(compare1_0(10, 20, '>')).toBe(false);
        });

        it('should handle >= comparison', () => {
            expect(compare1_0(30, 20, '>=')).toBe(true);
            expect(compare1_0(20, 20, '>=')).toBe(true);
            expect(compare1_0(10, 20, '>=')).toBe(false);
        });

        it('should convert strings for numeric comparison', () => {
            expect(compare1_0('42', 50, '<')).toBe(true);
            expect(compare1_0('100', '50', '>')).toBe(true);
        });
    });

    // ===== Empty Sequence Detection Tests =====

    describe('isEmptySequence - Empty Sequence Detection', () => {
        it('should detect null as empty', () => {
            expect(isEmptySequence(null)).toBe(true);
        });

        it('should detect undefined as empty', () => {
            expect(isEmptySequence(undefined)).toBe(true);
        });

        it('should detect empty array as empty', () => {
            expect(isEmptySequence([])).toBe(true);
        });

        it('should detect non-empty array as not empty', () => {
            expect(isEmptySequence([1])).toBe(false);
            expect(isEmptySequence([null])).toBe(false);
        });

        it('should detect values as not empty', () => {
            expect(isEmptySequence(0)).toBe(false);
            expect(isEmptySequence('')).toBe(false);
            expect(isEmptySequence(false)).toBe(false);
        });
    });

    // ===== Compatibility Mode Configuration Tests =====

    describe('createCompatibilityMode - Configuration', () => {
        it('should create enabled compatibility mode', () => {
            const mode = createCompatibilityMode(true);
            expect(mode.enabled).toBe(true);
            expect(mode.suppressErrorsInFalseBranches).toBe(true);
            expect(mode.shortCircuitEvaluation).toBe(true);
        });

        it('should create disabled compatibility mode', () => {
            const mode = createCompatibilityMode(false);
            expect(mode.enabled).toBe(false);
        });

        it('should default to disabled', () => {
            const mode = createCompatibilityMode();
            expect(mode.enabled).toBe(true);
        });
    });

    // ===== Complex Scenarios =====

    describe('Complex Compatibility Scenarios', () => {
        it('should handle node-set in comparison (first item)', () => {
            const node: any = { nodeType: 3, nodeName: '#text', nodeValue: '42' };
            // When comparing node-set, use first item
            expect(compare1_0([node], 42, '==')).toBe(true);
        });

        it('should handle mixed sequence conversion', () => {
            const result = toBoolean1_0([null, undefined, false, 0]);
            expect(result).toBe(true); // Non-empty sequence = true
        });

        it('should convert empty node-set to false', () => {
            expect(toBoolean1_0([])).toBe(false);
        });

        it('should handle string to number in arithmetic context', () => {
            const num = toNumber1_0('  42  ');
            expect(num).toBe(42);
        });

        it('should preserve NaN in arithmetic context', () => {
            const result = toBoolean1_0(NaN);
            expect(result).toBe(false);
        });

        it('should convert boolean in comparison context', () => {
            expect(compare1_0(true, 1, '==')).toBe(true);
            expect(compare1_0(false, 0, '==')).toBe(true);
        });
    });

    // ===== Edge Cases =====

    describe('Edge Cases', () => {
        it('should handle Infinity correctly', () => {
            expect(toBoolean1_0(Infinity)).toBe(true);
            expect(toBoolean1_0(-Infinity)).toBe(true);
        });

        it('should handle very large numbers', () => {
            const large = Number.MAX_VALUE;
            expect(toNumber1_0(String(large))).toBe(large);
        });

        it('should handle very small numbers', () => {
            const small = Number.MIN_VALUE;
            expect(toNumber1_0(String(small))).toBe(small);
        });

        it('should handle deeply nested element text', () => {
            const deep: any = {
                nodeType: 1,
                nodeName: 'root',
                childNodes: [
                    {
                        nodeType: 1,
                        nodeName: 'level1',
                        childNodes: [
                            {
                                nodeType: 1,
                                nodeName: 'level2',
                                childNodes: [
                                    { nodeType: 3, nodeName: '#text', nodeValue: 'deep' },
                                ],
                            },
                        ],
                    },
                ],
            };
            expect(getNodeStringValue(deep)).toBe('deep');
        });

        it('should handle array with mixed node and non-node items', () => {
            const node: any = { nodeType: 1, nodeName: 'test' };
            const mixed = [node, 42, 'string', { regular: 'object' }, null];
            expect(toNodeSet(mixed)).toEqual([node]);
        });
    });
});
