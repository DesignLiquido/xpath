/**
 * XPath 3.1 Array Functions
 *
 * Functions for working with XPath arrays.
 * All functions are in the "array:" namespace.
 *
 * Reference: https://www.w3.org/TR/xpath-functions-31/#array-functions
 */

import { XPathContext } from '../context';
import {
    isXPathArray,
    XPathArray,
    createXPathArray,
    getArrayMember,
    getArraySize,
} from '../expressions/array-constructor-expression';

/**
 * Check if a value is an XPath array and throw error if not.
 * Handles single-item sequences (unwraps them).
 */
function requireArray(value: any, funcName: string): XPathArray {
    // Unwrap single-item sequences (e.g., from . expression)
    if (Array.isArray(value) && !isXPathArray(value)) {
        if (value.length === 1) {
            value = value[0];
        } else if (value.length === 0) {
            throw new Error(`XPTY0004: ${funcName} requires an array, got empty sequence`);
        } else {
            throw new Error(
                `XPTY0004: ${funcName} requires a single array, got sequence of ${value.length} items`
            );
        }
    }

    if (!isXPathArray(value)) {
        throw new Error(`XPTY0004: ${funcName} requires an array, got ${typeof value}`);
    }
    return value;
}

/**
 * Validate array position (1-based).
 */
function validatePosition(arr: XPathArray, position: number, funcName: string): void {
    if (!Number.isInteger(position)) {
        throw new Error(`XPTY0004: ${funcName} position must be an integer, got ${position}`);
    }
    if (position < 1 || position > arr.members.length) {
        throw new Error(
            `FOAY0001: ${funcName} position ${position} is out of bounds (array size: ${arr.members.length})`
        );
    }
}

/**
 * array:size($array as array(*)) as xs:integer
 *
 * Returns the number of members in the array.
 */
export function arraySize(context: XPathContext, array: any): number {
    const arr = requireArray(array, 'array:size');
    return arr.members.length;
}

/**
 * array:get($array as array(*), $position as xs:integer) as item()*
 *
 * Returns the member at the specified position (1-based).
 * Equivalent to $array($position).
 */
export function arrayGet(context: XPathContext, array: any, position: number): any {
    const arr = requireArray(array, 'array:get');
    validatePosition(arr, position, 'array:get');
    return arr.members[position - 1];
}

/**
 * array:put($array as array(*), $position as xs:integer, $member as item()*) as array(*)
 *
 * Returns a new array with the member at position replaced.
 */
export function arrayPut(
    context: XPathContext,
    array: any,
    position: number,
    member: any
): XPathArray {
    const arr = requireArray(array, 'array:put');
    validatePosition(arr, position, 'array:put');

    const newMembers = [...arr.members];
    newMembers[position - 1] = member;
    return createXPathArray(newMembers);
}

/**
 * array:append($array as array(*), $appendage as item()*) as array(*)
 *
 * Returns a new array with the appendage added as the last member.
 */
export function arrayAppend(context: XPathContext, array: any, appendage: any): XPathArray {
    const arr = requireArray(array, 'array:append');
    return createXPathArray([...arr.members, appendage]);
}

/**
 * array:subarray($array as array(*), $start as xs:integer) as array(*)
 * array:subarray($array as array(*), $start as xs:integer, $length as xs:integer) as array(*)
 *
 * Returns a contiguous portion of the array.
 */
export function arraySubarray(
    context: XPathContext,
    array: any,
    start: number,
    length?: number
): XPathArray {
    const arr = requireArray(array, 'array:subarray');

    if (!Number.isInteger(start)) {
        throw new Error(`XPTY0004: array:subarray start must be an integer, got ${start}`);
    }

    if (start < 1) {
        throw new Error(`FOAY0001: array:subarray start ${start} must be >= 1`);
    }

    if (start > arr.members.length + 1) {
        throw new Error(
            `FOAY0001: array:subarray start ${start} is out of bounds (array size: ${arr.members.length})`
        );
    }

    const startIdx = start - 1;

    if (length === undefined) {
        // Return from start to end
        return createXPathArray(arr.members.slice(startIdx));
    }

    if (!Number.isInteger(length)) {
        throw new Error(`XPTY0004: array:subarray length must be an integer, got ${length}`);
    }

    if (length < 0) {
        throw new Error(`FOAY0002: array:subarray length ${length} must be >= 0`);
    }

    if (startIdx + length > arr.members.length) {
        throw new Error(
            `FOAY0001: array:subarray range [${start}, ${start + length - 1}] exceeds array bounds`
        );
    }

    return createXPathArray(arr.members.slice(startIdx, startIdx + length));
}

/**
 * array:remove($array as array(*), $positions as xs:integer*) as array(*)
 *
 * Returns a new array with members at specified positions removed.
 */
export function arrayRemove(
    context: XPathContext,
    array: any,
    positions: number | number[]
): XPathArray {
    const arr = requireArray(array, 'array:remove');

    // Normalize positions to array
    const posArray = Array.isArray(positions) ? positions : [positions];

    // Validate all positions
    for (const pos of posArray) {
        if (!Number.isInteger(pos)) {
            throw new Error(`XPTY0004: array:remove position must be an integer, got ${pos}`);
        }
        if (pos < 1 || pos > arr.members.length) {
            throw new Error(
                `FOAY0001: array:remove position ${pos} is out of bounds (array size: ${arr.members.length})`
            );
        }
    }

    // Convert to 0-based indices and create a set for O(1) lookup
    const indicesToRemove = new Set(posArray.map((p) => p - 1));

    const newMembers = arr.members.filter((_, idx) => !indicesToRemove.has(idx));
    return createXPathArray(newMembers);
}

/**
 * array:insert-before($array as array(*), $position as xs:integer, $member as item()*) as array(*)
 *
 * Returns a new array with a new member inserted before the specified position.
 */
export function arrayInsertBefore(
    context: XPathContext,
    array: any,
    position: number,
    member: any
): XPathArray {
    const arr = requireArray(array, 'array:insert-before');

    if (!Number.isInteger(position)) {
        throw new Error(
            `XPTY0004: array:insert-before position must be an integer, got ${position}`
        );
    }

    // Position can be from 1 to length + 1 (insert at end)
    if (position < 1 || position > arr.members.length + 1) {
        throw new Error(
            `FOAY0001: array:insert-before position ${position} is out of bounds (valid range: 1 to ${arr.members.length + 1})`
        );
    }

    const newMembers = [...arr.members];
    newMembers.splice(position - 1, 0, member);
    return createXPathArray(newMembers);
}

/**
 * array:head($array as array(*)) as item()*
 *
 * Returns the first member of the array.
 * Error if array is empty.
 */
export function arrayHead(context: XPathContext, array: any): any {
    const arr = requireArray(array, 'array:head');

    if (arr.members.length === 0) {
        throw new Error(`FOAY0001: array:head called on empty array`);
    }

    return arr.members[0];
}

/**
 * array:tail($array as array(*)) as array(*)
 *
 * Returns all members except the first.
 * Error if array is empty.
 */
export function arrayTail(context: XPathContext, array: any): XPathArray {
    const arr = requireArray(array, 'array:tail');

    if (arr.members.length === 0) {
        throw new Error(`FOAY0001: array:tail called on empty array`);
    }

    return createXPathArray(arr.members.slice(1));
}

/**
 * array:reverse($array as array(*)) as array(*)
 *
 * Returns a new array with members in reverse order.
 */
export function arrayReverse(context: XPathContext, array: any): XPathArray {
    const arr = requireArray(array, 'array:reverse');
    return createXPathArray([...arr.members].reverse());
}

/**
 * array:join($arrays as array(*)*) as array(*)
 *
 * Concatenates multiple arrays into a single array.
 */
export function arrayJoin(context: XPathContext, arrays: any | any[]): XPathArray {
    // Normalize to array
    const arrList = Array.isArray(arrays) ? arrays : [arrays];

    const allMembers: any[] = [];

    for (const arr of arrList) {
        if (arr === null || arr === undefined) continue;

        const xpathArr = requireArray(arr, 'array:join');
        allMembers.push(...xpathArr.members);
    }

    return createXPathArray(allMembers);
}

/**
 * array:flatten($input as item()*) as item()*
 *
 * Flattens an array or sequence, recursively extracting array members.
 * Non-array items are returned as-is.
 */
export function arrayFlatten(context: XPathContext, input: any): any[] {
    const result: any[] = [];

    const flatten = (item: any) => {
        if (isXPathArray(item)) {
            // Recursively flatten array members
            for (const member of item.members) {
                flatten(member);
            }
        } else if (Array.isArray(item)) {
            // Flatten sequences
            for (const elem of item) {
                flatten(elem);
            }
        } else {
            // Non-array items are kept as-is
            result.push(item);
        }
    };

    flatten(input);
    return result;
}

/**
 * array:for-each($array as array(*), $action as function(item()*) as item()*) as array(*)
 *
 * Applies a function to each member of the array and returns a new array.
 */
export function arrayForEach(context: XPathContext, array: any, action: any): XPathArray {
    const arr = requireArray(array, 'array:for-each');

    if (!action || (typeof action !== 'function' && !action.__isFunctionItem)) {
        throw new Error(`XPTY0004: array:for-each requires a function as second argument`);
    }

    const fn = action.__isFunctionItem ? action.implementation : action;

    const newMembers = arr.members.map((member, index) => {
        // Inline function implementations don't expect context as first arg
        return fn(member);
    });

    return createXPathArray(newMembers);
}

/**
 * array:filter($array as array(*), $predicate as function(item()*) as xs:boolean) as array(*)
 *
 * Returns a new array containing only members for which the predicate returns true.
 */
export function arrayFilter(context: XPathContext, array: any, predicate: any): XPathArray {
    const arr = requireArray(array, 'array:filter');

    if (!predicate || (typeof predicate !== 'function' && !predicate.__isFunctionItem)) {
        throw new Error(`XPTY0004: array:filter requires a function as second argument`);
    }

    const fn = predicate.__isFunctionItem ? predicate.implementation : predicate;

    const filteredMembers = arr.members.filter((member) => {
        // Inline function implementations don't expect context as first arg
        const result = fn(member);
        // Convert to boolean
        if (typeof result === 'boolean') return result;
        if (typeof result === 'number') return result !== 0 && !isNaN(result);
        if (typeof result === 'string') return result.length > 0;
        if (Array.isArray(result)) return result.length > 0;
        return !!result;
    });

    return createXPathArray(filteredMembers);
}

/**
 * array:fold-left($array as array(*), $zero as item()*, $f as function(item()*, item()*) as item()*) as item()*
 *
 * Applies a function cumulatively from left to right.
 */
export function arrayFoldLeft(context: XPathContext, array: any, zero: any, f: any): any {
    const arr = requireArray(array, 'array:fold-left');

    if (!f || (typeof f !== 'function' && !f.__isFunctionItem)) {
        throw new Error(`XPTY0004: array:fold-left requires a function as third argument`);
    }

    const fn = f.__isFunctionItem ? f.implementation : f;

    let accumulator = zero;
    for (const member of arr.members) {
        // Inline function implementations don't expect context as first arg
        accumulator = fn(accumulator, member);
    }

    return accumulator;
}

/**
 * array:fold-right($array as array(*), $zero as item()*, $f as function(item()*, item()*) as item()*) as item()*
 *
 * Applies a function cumulatively from right to left.
 */
export function arrayFoldRight(context: XPathContext, array: any, zero: any, f: any): any {
    const arr = requireArray(array, 'array:fold-right');

    if (!f || (typeof f !== 'function' && !f.__isFunctionItem)) {
        throw new Error(`XPTY0004: array:fold-right requires a function as third argument`);
    }

    const fn = f.__isFunctionItem ? f.implementation : f;

    let accumulator = zero;
    for (let i = arr.members.length - 1; i >= 0; i--) {
        // Inline function implementations don't expect context as first arg
        accumulator = fn(arr.members[i], accumulator);
    }

    return accumulator;
}

/**
 * array:sort($array as array(*)) as array(*)
 * array:sort($array as array(*), $collation as xs:string?) as array(*)
 * array:sort($array as array(*), $collation as xs:string?, $key as function(item()*) as xs:anyAtomicType*) as array(*)
 *
 * Returns a new array with members sorted.
 */
export function arraySort(
    context: XPathContext,
    array: any,
    collation?: string,
    key?: any
): XPathArray {
    const arr = requireArray(array, 'array:sort');

    // Get key function if provided
    const keyFn = key && (key.__isFunctionItem ? key.implementation : key);

    // Create copy with indices for stable sort
    const indexedMembers = arr.members.map((member, idx) => ({ member, idx }));

    indexedMembers.sort((a, b) => {
        // Inline function implementations don't expect context as first arg
        let aKey = keyFn ? keyFn(a.member) : a.member;
        let bKey = keyFn ? keyFn(b.member) : b.member;

        // Handle arrays/sequences - use first item for comparison
        if (Array.isArray(aKey)) aKey = aKey[0];
        if (Array.isArray(bKey)) bKey = bKey[0];

        // Compare based on type
        if (typeof aKey === 'number' && typeof bKey === 'number') {
            return aKey - bKey;
        }

        // Convert to strings for comparison
        const aStr = String(aKey ?? '');
        const bStr = String(bKey ?? '');

        // Use localeCompare for string comparison
        const result = aStr.localeCompare(bStr);

        // Stable sort: preserve original order for equal elements
        return result !== 0 ? result : a.idx - b.idx;
    });

    return createXPathArray(indexedMembers.map((item) => item.member));
}

/**
 * Register all array functions in the function registry.
 */
export const ARRAY_FUNCTIONS: Record<string, (...args: any[]) => any> = {
    'array:size': arraySize,
    'array:get': arrayGet,
    'array:put': arrayPut,
    'array:append': arrayAppend,
    'array:subarray': arraySubarray,
    'array:remove': arrayRemove,
    'array:insert-before': arrayInsertBefore,
    'array:head': arrayHead,
    'array:tail': arrayTail,
    'array:reverse': arrayReverse,
    'array:join': arrayJoin,
    'array:flatten': arrayFlatten,
    'array:for-each': arrayForEach,
    'array:filter': arrayFilter,
    'array:fold-left': arrayFoldLeft,
    'array:fold-right': arrayFoldRight,
    'array:sort': arraySort,
};
