/**
 * XPath 3.0 Higher-Order Functions
 *
 * Functions that take other functions as arguments or return functions.
 *
 * Reference: https://www.w3.org/TR/xpath-functions-30/#higher-order-functions
 */

import { XPathContext, XPathResult, XPathFunctionItem } from '../context';
import { isFunctionItem } from '../types/function-type';

/**
 * fn:for-each($seq as item()*, $action as function(item()) as item()*) as item()*
 *
 * Applies the function $action to every item in the sequence $seq, returning
 * the concatenation of the resulting sequences.
 *
 * Example: fn:for-each((1, 2, 3), function($x) { $x * 2 }) => (2, 4, 6)
 */
export function forEach(context: XPathContext, seq: any, action: any): XPathResult {
    if (!isFunctionItem(action)) {
        throw new Error('fn:for-each: second argument must be a function');
    }

    const funcItem = action as XPathFunctionItem;

    // Handle empty sequence
    if (seq === null || seq === undefined) {
        return [];
    }

    // Ensure seq is an array
    const items = Array.isArray(seq) ? seq : [seq];

    // Apply function to each item and flatten results
    const results: any[] = [];
    for (const item of items) {
        const result = funcItem.implementation(item);
        if (Array.isArray(result)) {
            results.push(...result);
        } else if (result !== null && result !== undefined) {
            results.push(result);
        }
    }

    return results.length === 0 ? [] : results;
}

/**
 * fn:filter($seq as item()*, $predicate as function(item()) as xs:boolean) as item()*
 *
 * Returns those items from the sequence $seq for which the function $predicate
 * returns true.
 *
 * Example: fn:filter((1, 2, 3, 4, 5), function($x) { $x mod 2 = 0 }) => (2, 4)
 */
export function filter(context: XPathContext, seq: any, predicate: any): XPathResult {
    if (!isFunctionItem(predicate)) {
        throw new Error('fn:filter: second argument must be a function');
    }

    const funcItem = predicate as XPathFunctionItem;

    // Handle empty sequence
    if (seq === null || seq === undefined) {
        return [];
    }

    // Ensure seq is an array
    const items = Array.isArray(seq) ? seq : [seq];

    // Filter items based on predicate
    const results = items.filter(item => {
        const result = funcItem.implementation(item);
        // Convert result to boolean
        return Boolean(result);
    });

    return results.length === 0 ? [] : results;
}

/**
 * fn:fold-left($seq as item()*, $zero as item()*, $f as function(item()*, item()) as item()*) as item()*
 *
 * Processes the items in $seq from left to right, applying the function $f
 * to each item in turn, together with an accumulated result.
 *
 * Example: fn:fold-left((1, 2, 3, 4), 0, function($acc, $x) { $acc + $x }) => 10
 */
export function foldLeft(context: XPathContext, seq: any, zero: any, f: any): XPathResult {
    if (!isFunctionItem(f)) {
        throw new Error('fn:fold-left: third argument must be a function');
    }

    const funcItem = f as XPathFunctionItem;

    // Handle empty sequence - return zero value
    if (seq === null || seq === undefined) {
        return zero;
    }

    // Ensure seq is an array
    const items = Array.isArray(seq) ? seq : [seq];

    // Fold from left
    let accumulator = zero;
    for (const item of items) {
        accumulator = funcItem.implementation(accumulator, item);
    }

    return accumulator;
}

/**
 * fn:fold-right($seq as item()*, $zero as item()*, $f as function(item(), item()*) as item()*) as item()*
 *
 * Processes the items in $seq from right to left, applying the function $f
 * to each item in turn, together with an accumulated result.
 *
 * Example: fn:fold-right((1, 2, 3, 4), 0, function($x, $acc) { $acc + $x }) => 10
 */
export function foldRight(context: XPathContext, seq: any, zero: any, f: any): XPathResult {
    if (!isFunctionItem(f)) {
        throw new Error('fn:fold-right: third argument must be a function');
    }

    const funcItem = f as XPathFunctionItem;

    // Handle empty sequence - return zero value
    if (seq === null || seq === undefined) {
        return zero;
    }

    // Ensure seq is an array
    const items = Array.isArray(seq) ? seq : [seq];

    // Fold from right
    let accumulator = zero;
    for (let i = items.length - 1; i >= 0; i--) {
        accumulator = funcItem.implementation(items[i], accumulator);
    }

    return accumulator;
}

/**
 * fn:for-each-pair($seq1 as item()*, $seq2 as item()*, $action as function(item(), item()) as item()*) as item()*
 *
 * Applies the function $action to successive pairs of items taken one from $seq1
 * and one from $seq2, returning the concatenation of the resulting sequences.
 *
 * Example: fn:for-each-pair((1, 2, 3), (4, 5, 6), function($a, $b) { $a + $b }) => (5, 7, 9)
 */
export function forEachPair(context: XPathContext, seq1: any, seq2: any, action: any): XPathResult {
    if (!isFunctionItem(action)) {
        throw new Error('fn:for-each-pair: third argument must be a function');
    }

    const funcItem = action as XPathFunctionItem;

    // Handle empty sequences
    if (seq1 === null || seq1 === undefined || seq2 === null || seq2 === undefined) {
        return [];
    }

    // Ensure both are arrays
    const items1 = Array.isArray(seq1) ? seq1 : [seq1];
    const items2 = Array.isArray(seq2) ? seq2 : [seq2];

    // Process pairs up to the length of the shorter sequence
    const results: any[] = [];
    const minLength = Math.min(items1.length, items2.length);

    for (let i = 0; i < minLength; i++) {
        const result = funcItem.implementation(items1[i], items2[i]);
        if (Array.isArray(result)) {
            results.push(...result);
        } else if (result !== null && result !== undefined) {
            results.push(result);
        }
    }

    return results.length === 0 ? [] : results;
}

/**
 * fn:sort($input as item()*, $collation as xs:string?, $key as function(item()) as xs:anyAtomicType*) as item()*
 *
 * Sorts a sequence. If $key is provided, items are sorted by applying the key
 * function to each item. Otherwise, items are sorted by their atomic values.
 *
 * Example: fn:sort((3, 1, 4, 1, 5), (), function($x) { $x }) => (1, 1, 3, 4, 5)
 */
export function sort(context: XPathContext, input: any, collation?: any, key?: any): XPathResult {
    // Handle empty sequence
    if (input === null || input === undefined) {
        return [];
    }

    // Ensure input is an array
    const items = Array.isArray(input) ? [...input] : [input];

    // If key function is provided, use it
    if (key !== undefined && key !== null) {
        if (!isFunctionItem(key)) {
            throw new Error('fn:sort: key argument must be a function');
        }

        const keyFunc = key as XPathFunctionItem;

        items.sort((a, b) => {
            const keyA = keyFunc.implementation(a);
            const keyB = keyFunc.implementation(b);
            return compare(keyA, keyB);
        });
    } else {
        // Sort by atomic values
        items.sort(compare);
    }

    return items;
}

/**
 * Helper function to compare two values for sorting
 */
function compare(a: any, b: any): number {
    // Handle null/undefined
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;

    // Convert to comparable types
    const typeA = typeof a;
    const typeB = typeof b;

    // If types differ, sort by type
    if (typeA !== typeB) {
        return typeA < typeB ? -1 : 1;
    }

    // Compare values of same type
    if (typeA === 'number') {
        return a - b;
    }

    if (typeA === 'string') {
        return a.localeCompare(b);
    }

    if (typeA === 'boolean') {
        return a === b ? 0 : (a ? 1 : -1);
    }

    // Default comparison
    return String(a).localeCompare(String(b));
}

/**
 * fn:apply($function as function(*) as item()*, $array as array(*)) as item()*
 *
 * Calls the function $function with arguments taken from the array $array.
 * For now, we accept an array or sequence of arguments.
 *
 * Example: fn:apply(fn:concat#3, ["a", "b", "c"]) => "abc"
 */
export function apply(context: XPathContext, func: any, array: any): XPathResult {
    if (!isFunctionItem(func)) {
        throw new Error('fn:apply: first argument must be a function');
    }

    const funcItem = func as XPathFunctionItem;

    // Handle empty array
    if (array === null || array === undefined) {
        return funcItem.implementation();
    }

    // Ensure array is an array
    const args = Array.isArray(array) ? array : [array];

    // Apply function with arguments
    return funcItem.implementation(...args);
}

/**
 * fn:function-name($func as function(*)) as xs:QName?
 *
 * Returns the name of the function, or an empty sequence if it's anonymous.
 *
 * Example: fn:function-name(fn:concat#2) => QName("http://www.w3.org/2005/xpath-functions", "concat")
 */
export function functionName(context: XPathContext, func: any): XPathResult {
    if (!isFunctionItem(func)) {
        throw new Error('fn:function-name: argument must be a function');
    }

    const funcItem = func as XPathFunctionItem;

    // Return the name if available, otherwise empty sequence
    if (funcItem.name) {
        // Return as QName string (simplified - in full implementation would return QName object)
        if (funcItem.namespace) {
            return `Q{${funcItem.namespace}}${funcItem.name}`;
        }
        return funcItem.name;
    }

    return null;
}

/**
 * fn:function-arity($func as function(*)) as xs:integer
 *
 * Returns the arity (number of parameters) of the function.
 *
 * Example: fn:function-arity(fn:concat#2) => 2
 */
export function functionArity(context: XPathContext, func: any): XPathResult {
    if (!isFunctionItem(func)) {
        throw new Error('fn:function-arity: argument must be a function');
    }

    const funcItem = func as XPathFunctionItem;
    return funcItem.arity;
}
