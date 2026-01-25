/**
 * XPath 2.0 Sequence Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#sequence-functions
 */

import { XPathResult } from '../context';
import { typeMismatch } from '../errors';

/**
 * fn:empty($arg as item()*) as xs:boolean
 * Returns true if the argument is an empty sequence.
 */
export function empty(arg: XPathResult): boolean {
    if (arg === null || arg === undefined) return true;
    if (Array.isArray(arg)) return arg.length === 0;
    return false;
}

/**
 * fn:exists($arg as item()*) as xs:boolean
 * Returns true if the argument is a non-empty sequence.
 */
export function exists(arg: XPathResult): boolean {
    return !empty(arg);
}

/**
 * fn:head($arg as item()*) as item()?
 * Returns the first item in a sequence, or empty sequence if empty.
 */
export function head(arg: XPathResult): XPathResult {
    if (arg === null || arg === undefined) return null;
    if (Array.isArray(arg)) {
        return arg.length > 0 ? arg[0] : null;
    }
    return arg;
}

/**
 * fn:tail($arg as item()*) as item()*
 * Returns all items except the first in a sequence.
 */
export function tail(arg: XPathResult): XPathResult[] {
    if (arg === null || arg === undefined) return [];
    if (Array.isArray(arg)) {
        return arg.length > 1 ? arg.slice(1) : [];
    }
    return [];
}

/**
 * fn:insert-before($target as item()*, $position as xs:integer, $inserts as item()*) as item()*
 * Returns a new sequence with items inserted before the specified position.
 */
export function insertBefore(
    target: XPathResult,
    position: XPathResult,
    inserts: XPathResult
): XPathResult[] {
    const targetSeq = toSequence(target);
    const insertSeq = toSequence(inserts);
    let pos = Math.floor(Number(position));

    // Adjust position (XPath is 1-based)
    if (pos < 1) pos = 1;
    if (pos > targetSeq.length) pos = targetSeq.length + 1;

    const result: XPathResult[] = [];
    for (let i = 0; i < targetSeq.length; i++) {
        if (i === pos - 1) {
            result.push(...insertSeq);
        }
        result.push(targetSeq[i]);
    }

    // If position is after the end
    if (pos > targetSeq.length) {
        result.push(...insertSeq);
    }

    return result;
}

/**
 * fn:remove($target as item()*, $position as xs:integer) as item()*
 * Returns a new sequence with the item at the specified position removed.
 */
export function remove(target: XPathResult, position: XPathResult): XPathResult[] {
    const targetSeq = toSequence(target);
    const pos = Math.floor(Number(position));

    // Position out of range: return original sequence
    if (pos < 1 || pos > targetSeq.length) {
        return targetSeq;
    }

    const result: XPathResult[] = [];
    for (let i = 0; i < targetSeq.length; i++) {
        if (i !== pos - 1) {
            result.push(targetSeq[i]);
        }
    }

    return result;
}

/**
 * fn:reverse($arg as item()*) as item()*
 * Reverses the order of items in a sequence.
 */
export function reverse(arg: XPathResult): XPathResult[] {
    const seq = toSequence(arg);
    return seq.slice().reverse();
}

/**
 * fn:subsequence($sourceSeq as item()*, $startingLoc as xs:double) as item()*
 * fn:subsequence($sourceSeq as item()*, $startingLoc as xs:double, $length as xs:double) as item()*
 * Returns a contiguous sequence of items from a source sequence.
 */
export function subsequence(
    sourceSeq: XPathResult,
    startingLoc: XPathResult,
    length?: XPathResult
): XPathResult[] {
    const seq = toSequence(sourceSeq);
    let start = Number(startingLoc);

    // Handle special cases
    if (isNaN(start)) return [];

    // XPath uses 1-based indexing and rounds
    start = Math.round(start);

    if (length === undefined) {
        // No length specified: return from start to end
        if (start < 1) start = 1;
        if (start > seq.length) return [];
        return seq.slice(start - 1);
    }

    let len = Number(length);
    if (isNaN(len) || len < 0) return [];

    len = Math.round(len);

    // Handle negative start
    if (start < 1) {
        len = len + start - 1;
        start = 1;
    }

    if (len <= 0 || start > seq.length) return [];

    return seq.slice(start - 1, start - 1 + len);
}

/**
 * fn:unordered($sourceSeq as item()*) as item()*
 * Returns the items of $sourceSeq in an implementation-dependent order.
 * In this implementation, we simply return them in the same order.
 */
export function unordered(sourceSeq: XPathResult): XPathResult[] {
    return toSequence(sourceSeq);
}

/**
 * fn:distinct-values($arg as xs:anyAtomicType*) as xs:anyAtomicType*
 * fn:distinct-values($arg as xs:anyAtomicType*, $collation as xs:string) as xs:anyAtomicType*
 * Returns the distinct values from a sequence.
 */
export function distinctValues(arg: XPathResult, collation?: XPathResult): XPathResult[] {
    const seq = toSequence(arg);
    if (seq.length === 0) return [];

    const seen = new Set<string>();
    const result: XPathResult[] = [];

    for (const item of seq) {
        // Create a comparable key
        const key = getComparisonKey(item);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(atomize(item));
        }
    }

    return result;
}

/**
 * fn:index-of($seqParam as xs:anyAtomicType*, $srchParam as xs:anyAtomicType) as xs:integer*
 * fn:index-of($seqParam as xs:anyAtomicType*, $srchParam as xs:anyAtomicType, $collation as xs:string) as xs:integer*
 * Returns a sequence of integers giving the positions of matching items.
 */
export function indexOf(
    seqParam: XPathResult,
    srchParam: XPathResult,
    collation?: XPathResult
): number[] {
    const seq = toSequence(seqParam);
    if (seq.length === 0) return [];

    const searchKey = getComparisonKey(srchParam);
    const result: number[] = [];

    for (let i = 0; i < seq.length; i++) {
        const itemKey = getComparisonKey(seq[i]);
        if (itemKey === searchKey) {
            result.push(i + 1); // 1-based index
        }
    }

    return result;
}

/**
 * fn:deep-equal($parameter1 as item()*, $parameter2 as item()*) as xs:boolean
 * fn:deep-equal($parameter1 as item()*, $parameter2 as item()*, $collation as xs:string) as xs:boolean
 * Returns true if the two sequences are deep-equal.
 */
export function deepEqual(
    parameter1: XPathResult,
    parameter2: XPathResult,
    collation?: XPathResult
): boolean {
    const seq1 = toSequence(parameter1);
    const seq2 = toSequence(parameter2);

    if (seq1.length !== seq2.length) return false;

    for (let i = 0; i < seq1.length; i++) {
        if (!itemsDeepEqual(seq1[i], seq2[i])) {
            return false;
        }
    }

    return true;
}

/**
 * fn:zero-or-one($arg as item()*) as item()?
 * Returns $arg if it contains zero or one items. Otherwise raises an error.
 */
export function zeroOrOne(arg: XPathResult): XPathResult {
    const seq = toSequence(arg);
    if (seq.length > 1) {
        throw typeMismatch('zero or one item', `sequence of ${seq.length} items`, 'fn:zero-or-one');
    }
    return seq.length === 0 ? null : seq[0];
}

/**
 * fn:one-or-more($arg as item()*) as item()+
 * Returns $arg if it contains one or more items. Otherwise raises an error.
 */
export function oneOrMore(arg: XPathResult): XPathResult[] {
    const seq = toSequence(arg);
    if (seq.length === 0) {
        throw typeMismatch('one or more items', 'empty sequence', 'fn:one-or-more');
    }
    return seq;
}

/**
 * fn:exactly-one($arg as item()*) as item()
 * Returns $arg if it contains exactly one item. Otherwise raises an error.
 */
export function exactlyOne(arg: XPathResult): XPathResult {
    const seq = toSequence(arg);
    if (seq.length !== 1) {
        throw typeMismatch('exactly one item', seq.length === 0 ? 'empty sequence' : `sequence of ${seq.length} items`, 'fn:exactly-one');
    }
    return seq[0];
}

/**
 * fn:count($arg as item()*) as xs:integer
 * Returns the number of items in a sequence.
 */
export function count(arg: XPathResult): number {
    if (arg === null || arg === undefined) return 0;
    if (Array.isArray(arg)) return arg.length;
    return 1;
}

/**
 * fn:sum($arg as xs:anyAtomicType*) as xs:anyAtomicType
 * fn:sum($arg as xs:anyAtomicType*, $zero as xs:anyAtomicType?) as xs:anyAtomicType?
 * Returns the sum of the values in the input sequence.
 */
export function sum(arg: XPathResult, zero?: XPathResult): number {
    const seq = toSequence(arg);
    if (seq.length === 0) {
        return zero !== undefined ? Number(zero) : 0;
    }

    let total = 0;
    for (const item of seq) {
        const value = atomize(item);
        const num = Number(value);
        if (isNaN(num)) {
            return NaN;
        }
        total += num;
    }

    return total;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts a value to a sequence (array).
 */
function toSequence(value: XPathResult): XPathResult[] {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) return value as XPathResult[];
    return [value];
}

/**
 * Gets a comparable key for a value.
 */
function getComparisonKey(value: XPathResult): string {
    if (value === null || value === undefined) return 'null';

    const atomized = atomize(value);

    if (typeof atomized === 'number') {
        if (isNaN(atomized)) return 'NaN';
        return `n:${atomized}`;
    }
    if (typeof atomized === 'boolean') {
        return `b:${atomized}`;
    }
    return `s:${String(atomized)}`;
}

/**
 * Atomizes a value (extracts the typed value).
 */
function atomize(value: XPathResult): string | number | boolean {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
        return value;
    }
    if (typeof value === 'object' && 'textContent' in value) {
        return (value as { textContent?: string }).textContent ?? '';
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? atomize(value[0]) : '';
    }
    return String(value);
}

/**
 * Compares two items for deep equality.
 */
function itemsDeepEqual(item1: XPathResult, item2: XPathResult): boolean {
    // Both null/undefined
    if ((item1 === null || item1 === undefined) &&
        (item2 === null || item2 === undefined)) {
        return true;
    }

    // One null, other not
    if (item1 === null || item1 === undefined ||
        item2 === null || item2 === undefined) {
        return false;
    }

    // Both nodes
    if (isNode(item1) && isNode(item2)) {
        return nodesDeepEqual(item1, item2);
    }

    // Both atomic values
    const atom1 = atomize(item1);
    const atom2 = atomize(item2);

    // NaN handling
    if (typeof atom1 === 'number' && typeof atom2 === 'number') {
        if (isNaN(atom1) && isNaN(atom2)) return true;
    }

    return atom1 === atom2;
}

/**
 * Checks if a value is a node.
 */
function isNode(value: XPathResult): boolean {
    return typeof value === 'object' && value !== null && 'nodeType' in value;
}

/**
 * Deep equality comparison for nodes.
 */
function nodesDeepEqual(node1: XPathResult, node2: XPathResult): boolean {
    const n1 = node1 as { nodeType?: number; nodeName?: string; textContent?: string; childNodes?: any[] };
    const n2 = node2 as { nodeType?: number; nodeName?: string; textContent?: string; childNodes?: any[] };

    // Different node types
    if (n1.nodeType !== n2.nodeType) return false;

    // Different names
    if (n1.nodeName !== n2.nodeName) return false;

    // For text, comment, etc.: compare text content
    if (n1.nodeType === 3 || n1.nodeType === 8) { // Text or Comment
        return n1.textContent === n2.textContent;
    }

    // For elements: compare children
    if (n1.nodeType === 1) {
        const children1 = n1.childNodes ?? [];
        const children2 = n2.childNodes ?? [];

        if (children1.length !== children2.length) return false;

        for (let i = 0; i < children1.length; i++) {
            if (!nodesDeepEqual(children1[i], children2[i])) {
                return false;
            }
        }
    }

    return true;
}
