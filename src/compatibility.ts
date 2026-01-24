/**
 * XPath 1.0 Backward Compatibility Mode (Phase 8.1)
 *
 * This module implements XPath 1.0 compatibility mode for XPath 2.0+ expressions,
 * enabling applications to use XPath 2.0 features while maintaining backward
 * compatibility with existing XPath 1.0-based code.
 *
 * Reference: XPath 2.0 Specification, Section 3.6 and Appendix I
 */

import { XPathNode } from './node';

/**
 * Configuration for XPath 1.0 compatibility mode.
 * When enabled, XPath 2.0 expressions follow XPath 1.0 type conversion rules.
 */
export interface XPath1CompatibilityMode {
    /**
     * Enable XPath 1.0 compatibility mode.
     * When true, type conversions and operator behavior follow XPath 1.0 rules.
     * Default: false (XPath 2.0 semantics)
     */
    enabled: boolean;

    /**
     * When true, suppress errors in the false branch of logical operators.
     * This allows expressions like "false() and error()" to return false
     * instead of raising an error.
     * Default: true
     */
    suppressErrorsInFalseBranches?: boolean;

    /**
     * When true, guaranteed short-circuit evaluation is enforced.
     * This ensures the false branch is never evaluated in "and" expressions,
     * and the true branch is never evaluated in "or" expressions.
     * Default: true
     */
    shortCircuitEvaluation?: boolean;
}

/**
 * Converts a value to a boolean using XPath 1.0 rules (Appendix I.2).
 *
 * XPath 1.0 boolean conversion rules:
 * - Number: false if 0 or NaN, true otherwise
 * - String: false if empty, true otherwise
 * - Node-set: false if empty, true otherwise
 * - Other types: apply fn:boolean() rules
 *
 * @param value The value to convert
 * @returns Boolean result
 */
export function toBoolean1_0(value: any): boolean {
    // Empty sequence = false
    if (value === null || value === undefined) {
        return false;
    }

    // Array/sequence: convert to boolean (empty = false)
    if (Array.isArray(value)) {
        return value.length > 0;
    }

    // Number: 0 or NaN = false, otherwise true
    if (typeof value === 'number') {
        return value !== 0 && !isNaN(value);
    }

    // String: empty string = false, otherwise true
    if (typeof value === 'string') {
        return value.length > 0;
    }

    // Boolean: as-is
    if (typeof value === 'boolean') {
        return value;
    }

    // Node/object: always true
    return true;
}

/**
 * Converts a value to a number using XPath 1.0 rules (Appendix I.2).
 *
 * XPath 1.0 numeric conversion rules:
 * - Number: as-is
 * - String: use fn:number() rules (parse as number, NaN if not parseable)
 * - Boolean: true = 1, false = 0
 * - Node-set: convert to string, then to number
 * - Empty sequence: NaN
 *
 * @param value The value to convert
 * @returns Numeric result (may be NaN)
 */
export function toNumber1_0(value: any): number {
    // Empty sequence = NaN
    if (value === null || value === undefined) {
        return NaN;
    }

    // Array/sequence: convert first item (or NaN if empty)
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return NaN;
        }
        // Recursively convert the first item
        return toNumber1_0(value[0]);
    }

    // Boolean: true = 1, false = 0
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    // Number: as-is
    if (typeof value === 'number') {
        return value;
    }

    // String: use fn:number() semantics
    if (typeof value === 'string') {
        if (value.length === 0) {
            return NaN;
        }
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return NaN;
        }
        const num = parseFloat(trimmed);
        // Only accept if the entire trimmed string is a number
        if (isNaN(num) || String(num) !== trimmed) {
            // Check if it's a valid number representation
            const parsed = Number(trimmed);
            if (isNaN(parsed)) {
                return NaN;
            }
            return parsed;
        }
        return num;
    }

    // Object/Node: convert to string first, then to number
    return toNumber1_0(value.toString?.() || String(value));
}

/**
 * Converts a value to a string using XPath 1.0 rules (Appendix I.2).
 *
 * XPath 1.0 string conversion rules:
 * - String: as-is
 * - Number: use fn:string() rules (format as string)
 * - Boolean: 'true' or 'false'
 * - Node-set: string value of first node in document order
 * - Empty sequence: empty string
 *
 * @param value The value to convert
 * @returns String result
 */
export function toString1_0(value: any): string {
    // Empty sequence = empty string
    if (value === null || value === undefined) {
        return '';
    }

    // Array/sequence: convert to string of first item
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '';
        }
        return toString1_0(value[0]);
    }

    // String: as-is
    if (typeof value === 'string') {
        return value;
    }

    // Boolean: 'true' or 'false'
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    // Number: format as string
    if (typeof value === 'number') {
        // Special cases
        if (isNaN(value)) {
            return 'NaN';
        }
        if (value === Infinity) {
            return 'Infinity';
        }
        if (value === -Infinity) {
            return '-Infinity';
        }
        // For integers, don't include .0
        if (Number.isInteger(value)) {
            return String(value);
        }
        return String(value);
    }

    // Object/Node: convert to string
    return String(value);
}

/**
 * Gets the string value of a node (XPath 1.0 fn:string semantics).
 *
 * For elements: concatenation of all text node descendants.
 * For attributes and text nodes: the text content.
 * For processing instructions and comments: the content.
 * For documents: string of root element.
 *
 * @param node The node to get string value of
 * @returns String value of node
 */
export function getNodeStringValue(node: XPathNode): string {
    if (!node) {
        return '';
    }

    const nodeType = node.nodeType || 1; // Default to ELEMENT

    switch (nodeType) {
        case 1: // ELEMENT_NODE
            return getElementStringValue(node);
        case 2: // ATTRIBUTE_NODE
            return (node as any).value ?? (node as any).nodeValue ?? '';
        case 3: // TEXT_NODE
            return (node as any).nodeValue ?? '';
        case 7: // PROCESSING_INSTRUCTION_NODE
            return (node as any).nodeValue ?? '';
        case 8: // COMMENT_NODE
            return (node as any).nodeValue ?? '';
        case 9: // DOCUMENT_NODE
            return getElementStringValue((node.childNodes && (node.childNodes as any)[0]) || node);
        default:
            return '';
    }
}

/**
 * Gets the string value of an element by concatenating all text node descendants.
 *
 * @param element The element node
 * @returns Concatenated text content
 */
function getElementStringValue(element: XPathNode): string {
    let result = '';

    function walkNodes(node: XPathNode | undefined) {
        if (!node) return;

        const nodeType = node.nodeType || 1;

        // TEXT_NODE and CDATA_SECTION_NODE contribute their text
        if (nodeType === 3 || nodeType === 4) {
            result += (node as any).nodeValue ?? '';
        }

        // Recursively process child nodes
        if (node.childNodes) {
            const childNodes = node.childNodes as any;
            // Handle both array and array-like objects
            for (let i = 0; i < childNodes.length; i++) {
                walkNodes(childNodes[i]);
            }
        }
    }

    walkNodes(element);
    return result;
}

/**
 * Extracts the first item from a sequence (XPath 1.0 first-item-only semantics).
 *
 * When XPath 1.0 compatibility mode is enabled, sequences are treated as
 * node-sets containing only the first node. This function extracts that first item.
 *
 * @param sequence The sequence or single value
 * @returns The first item, or null if empty sequence
 */
export function getFirstItem(sequence: any): any {
    if (sequence === null || sequence === undefined) {
        return null;
    }

    if (Array.isArray(sequence)) {
        return sequence.length > 0 ? sequence[0] : null;
    }

    return sequence;
}

/**
 * Extracts all nodes from a sequence, preserving document order and removing duplicates.
 *
 * This is used when a sequence must be treated as a node-set in XPath 1.0 mode.
 *
 * @param sequence The sequence or single value
 * @returns Array of unique nodes in document order, or empty array
 */
export function toNodeSet(sequence: any): XPathNode[] {
    if (sequence === null || sequence === undefined) {
        return [];
    }

    if (!Array.isArray(sequence)) {
        if (sequence instanceof Object && 'nodeType' in sequence) {
            return [sequence as XPathNode];
        }
        return [];
    }

    // Filter to only nodes and remove duplicates
    const nodes: XPathNode[] = [];
    const seen = new Set<XPathNode>();

    for (const item of sequence) {
        if (item instanceof Object && 'nodeType' in item) {
            if (!seen.has(item)) {
                nodes.push(item as XPathNode);
                seen.add(item);
            }
        }
    }

    return nodes;
}

/**
 * Compares two values using XPath 1.0 comparison rules.
 *
 * In XPath 1.0, comparisons follow type conversion rules:
 * - If operand is a node-set, convert to string
 * - If operand is a number, convert to number
 * - If operand is a boolean, convert to boolean
 * - Then compare using appropriate comparison
 *
 * @param left The left operand
 * @param right The right operand
 * @param operator The comparison operator ('==', '<', etc.)
 * @returns Boolean result of comparison
 */
export function compare1_0(left: any, right: any, operator: string): boolean {
    // If either operand is a node-set (array), extract string values
    if (Array.isArray(left)) {
        left = left.length > 0 && left[0] && (left[0] as any).nodeType ? getNodeStringValue(left[0]) : getFirstItem(left);
    }
    if (Array.isArray(right)) {
        right = right.length > 0 && right[0] && (right[0] as any).nodeType ? getNodeStringValue(right[0]) : getFirstItem(right);
    }

    switch (operator) {
        case '==':
            // If both are empty: false
            if (left === null || right === null) {
                return false;
            }
            // If either is a boolean, convert both to boolean
            if (typeof left === 'boolean' || typeof right === 'boolean') {
                return toBoolean1_0(left) === toBoolean1_0(right);
            }
            // If either is a number, convert both to number
            if (typeof left === 'number' || typeof right === 'number') {
                return toNumber1_0(left) === toNumber1_0(right);
            }
            // Otherwise, compare as strings
            return toString1_0(left) === toString1_0(right);

        case '!=':
            return !compare1_0(left, right, '==');

        case '<':
            // Both are numbers or convertible to numbers
            const leftNum = toNumber1_0(left);
            const rightNum = toNumber1_0(right);
            if (isNaN(leftNum) || isNaN(rightNum)) {
                return false;
            }
            return leftNum < rightNum;

        case '<=':
            return compare1_0(left, right, '<') || compare1_0(left, right, '==');

        case '>':
            return !compare1_0(left, right, '<=');

        case '>=':
            return !compare1_0(left, right, '<');

        default:
            return false;
    }
}

/**
 * Creates a default XPath 1.0 compatibility mode configuration.
 *
 * @param enabled Whether to enable compatibility mode
 * @returns Compatibility mode configuration
 */
export function createCompatibilityMode(enabled: boolean = true): XPath1CompatibilityMode {
    return {
        enabled,
        suppressErrorsInFalseBranches: true,
        shortCircuitEvaluation: true,
    };
}

/**
 * Checks if a value is effectively an empty sequence.
 *
 * @param value The value to check
 * @returns True if value represents an empty sequence
 */
export function isEmptySequence(value: any): boolean {
    return value === null || value === undefined || (Array.isArray(value) && value.length === 0);
}
