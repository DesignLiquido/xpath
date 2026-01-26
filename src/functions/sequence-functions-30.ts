/**
 * XPath 3.0 Sequence Functions
 * 
 * Implements additional sequence manipulation functions for XPath 3.0:
 * https://www.w3.org/TR/xpath-functions-30/#sequence
 */

import { XPathContext, XPathResult } from '../context';
import { XPathNode } from '../node';
import { head as seqHead, tail as seqTail } from './sequence-functions';

/**
 * fn:innermost($nodes as node()*) as node()*
 * Returns nodes that have no ancestor in the input sequence.
 * Most deeply nested nodes (descendants take precedence over ancestors).
 */
export function innermost(context: XPathContext, nodes: any): XPathResult {
    const nodeList = Array.isArray(nodes) ? nodes : (nodes ? [nodes] : []);
    
    if (nodeList.length === 0) {
        return [];
    }

    // For each node, check if any ancestor is in the set
    return nodeList.filter(node => {
        // Skip non-nodes
        if (!isNode(node)) {
            return false;
        }
        
        // Check if any other node in the list is an ancestor
        return !nodeList.some(otherNode => {
            if (!isNode(otherNode) || node === otherNode) {
                return false;
            }
            // Check if otherNode is an ancestor of node
            return isAncestor(otherNode, node);
        });
    });
}

/**
 * fn:outermost($nodes as node()*) as node()*
 * Returns nodes that have no descendant in the input sequence.
 * Least deeply nested nodes (ancestors take precedence over descendants).
 */
export function outermost(context: XPathContext, nodes: any): XPathResult {
    const nodeList = Array.isArray(nodes) ? nodes : (nodes ? [nodes] : []);
    
    if (nodeList.length === 0) {
        return [];
    }

    // For each node, check if any descendant is in the set
    return nodeList.filter(node => {
        // Skip non-nodes
        if (!isNode(node)) {
            return false;
        }
        
        // Check if any other node in the list is a descendant
        return !nodeList.some(otherNode => {
            if (!isNode(otherNode) || node === otherNode) {
                return false;
            }
            // Check if otherNode is a descendant of node
            return isAncestor(node, otherNode);
        });
    });
}

/**
 * fn:sort($input as item()*, $collation as xs:string?, $key as function(item()) as xs:anyAtomicType*) as item()*
 * Sorts a sequence with optional collation and key function.
 * 
 * For now, we implement the basic version without collation support.
 * Key function version will be added when needed.
 */
export function sort(context: XPathContext, input: any, collation?: any, keyFn?: any): XPathResult {
    const items = Array.isArray(input) ? input : (input ? [input] : []);
    
    if (items.length <= 1) {
        return input;
    }

    // Create array with index tracking for stable sort
    const indexed = items.map((item, index) => ({ item, index }));

    // Sort based on whether we have a key function
    if (keyFn && typeof keyFn === 'object' && keyFn.__isFunctionItem) {
        // Sort using key function
        indexed.sort((a, b) => {
            const keyA = keyFn.implementation(a.item);
            const keyB = keyFn.implementation(b.item);
            return compareValues(keyA, keyB);
        });
    } else {
        // Direct comparison sort
        indexed.sort((a, b) => {
            return compareValues(a.item, b.item);
        });
    }

    return indexed.map(x => x.item);
}

/**
 * Helper: Check if value is a node
 */
function isNode(value: any): boolean {
    return value !== null && 
           value !== undefined && 
           typeof value === 'object' && 
           ('nodeType' in value || 'localName' in value);
}

/**
 * Helper: Check if first node is an ancestor of second node
 */
function isAncestor(potential: any, node: any): boolean {
    if (!isNode(potential) || !isNode(node)) {
        return false;
    }

    // Check parent chain
    let current = node.parent || node.parentNode;
    while (current) {
        if (current === potential) {
            return true;
        }
        current = current.parent || current.parentNode;
    }
    return false;
}

/**
 * Helper: Compare two values for sorting
 */
function compareValues(a: any, b: any): number {
    // Handle arrays (take first item)
    if (Array.isArray(a) && a.length > 0) {
        a = a[0];
    }
    if (Array.isArray(b) && b.length > 0) {
        b = b[0];
    }

    // Handle null/undefined
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    // Numeric comparison
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    // String comparison
    const aStr = String(a);
    const bStr = String(b);
    return aStr.localeCompare(bStr);
}

// Export all sequence functions
export const SEQUENCE_FUNCTIONS_30 = {
    head: seqHead,
    tail: seqTail,
    innermost,
    outermost,
    sort,
};
