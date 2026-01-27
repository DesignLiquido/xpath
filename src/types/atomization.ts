/**
 * XPath 2.0 Atomization (Section 2.4.2)
 * https://www.w3.org/TR/xpath20/#atomization
 *
 * Atomization is the process of extracting typed atomic values from nodes.
 *
 * Rules:
 * 1. If the input is already an atomic value, return it unchanged
 * 2. If the input is a node:
 *    a. If it has a typed value, return that value (or values)
 *    b. If it's untyped, return the string value
 * 3. For nodes with complex content, extract the text nodes and concatenate
 * 4. Special error FOTY0012 for nodes with element-only content (no text)
 */

import { AtomicType } from './base';
import { getAtomicType } from './index';

/**
 * Result of atomization
 */
export interface AtomizationResult {
    /**
     * The atomized value(s) - always an array
     */
    values: any[];

    /**
     * The type of the atomized value(s)
     */
    type: AtomicType | undefined;

    /**
     * Whether this is an empty sequence
     */
    isEmpty: boolean;

    /**
     * Error code if atomization failed (e.g., 'FOTY0012')
     */
    error?: string;
}

/**
 * Node-like object interface
 */
export interface XPathNode {
    nodeType: string;
    nodeName?: string;
    localName?: string;
    value?: any;
    textContent?: string;
    childNodes?: XPathNode[];
    attributes?: { [key: string]: any };
    /**
     * Optional: typed value (if node has schema type info)
     */
    typedValue?: any;
    /**
     * Optional: type annotation
     */
    type?: string;
}

/**
 * Check if a value is a node-like object
 */
export function isNode(value: any): value is XPathNode {
    if (!value || typeof value !== 'object') {
        return false;
    }

    // Check for node-like properties
    return (
        typeof value.nodeType === 'string' ||
        typeof value.nodeName === 'string' ||
        typeof value.textContent === 'string'
    );
}

/**
 * Check if a node contains only element content (no text nodes)
 * This would trigger error FOTY0012 in certain contexts
 */
export function hasElementOnlyContent(node: XPathNode): boolean {
    if (!node.childNodes || node.childNodes.length === 0) {
        return false; // Empty is not "element-only"
    }

    // Check if all children are elements (nodeType === 'element')
    return node.childNodes.every((child) => child.nodeType === 'element');
}

/**
 * Get the typed value of a node
 * This extracts the schema-validated value from a node
 */
export function getNodeTypedValue(node: XPathNode): { value: any; type: AtomicType | undefined } {
    // If node has explicit typed value, use it
    if (node.typedValue !== undefined) {
        if (node.type) {
            const atomicType = getAtomicType(node.type);
            return { value: node.typedValue, type: atomicType };
        }
        return { value: node.typedValue, type: undefined };
    }

    // If node has type annotation, use it with string content
    if (node.type) {
        const atomicType = getAtomicType(node.type);
        const textContent = getNodeStringValue(node);
        if (atomicType) {
            try {
                const castValue = atomicType.cast(textContent);
                return { value: castValue, type: atomicType };
            } catch {
                // If casting fails, return as untyped
                return { value: textContent, type: undefined };
            }
        }
    }

    // Default: use string value
    return { value: getNodeStringValue(node), type: undefined };
}

/**
 * Get the string value of a node
 * For element/document nodes: concatenates all text nodes
 * For text/attribute/comment nodes: the text content
 * For processing instructions: the data part
 */
export function getNodeStringValue(node: XPathNode): string {
    if (node.nodeType === 'text' || node.nodeType === 'attribute' || node.nodeType === 'comment') {
        return node.value || node.textContent || '';
    }

    if (node.nodeType === 'processing-instruction') {
        // PI: target followed by space and data
        return node.value || '';
    }

    if (node.nodeType === 'element' || node.nodeType === 'document') {
        // Concatenate all text node descendants
        if (node.textContent) {
            return node.textContent;
        }

        if (!node.childNodes) {
            return '';
        }

        let result = '';
        for (const child of node.childNodes) {
            if (child.nodeType === 'text') {
                result += child.value || child.textContent || '';
            } else if (child.nodeType === 'element') {
                result += getNodeStringValue(child);
            }
        }
        return result;
    }

    return '';
}

/**
 * Atomize a value
 * Extracts atomic values from nodes or returns atomic values unchanged
 *
 * @param value - Single value or array of values
 * @param strict - If true, raise error FOTY0012 for element-only content
 * @returns AtomizationResult
 */
export function atomize(value: any, strict: boolean = false): AtomizationResult {
    // Handle undefined/null
    if (value === undefined || value === null) {
        return {
            values: [],
            type: undefined,
            isEmpty: true,
        };
    }

    // Handle arrays
    if (Array.isArray(value)) {
        const results: any[] = [];
        let resultType: AtomicType | undefined = undefined;
        let hasError = false;
        let errorCode = '';

        for (const item of value) {
            const result = atomize(item, strict);

            if (result.error) {
                hasError = true;
                errorCode = result.error;
                break;
            }

            results.push(...result.values);

            // Track type (should be consistent)
            if (result.type && !resultType) {
                resultType = result.type;
            }
        }

        return {
            values: results,
            type: resultType,
            isEmpty: results.length === 0,
            error: hasError ? errorCode : undefined,
        };
    }

    // Handle nodes
    if (isNode(value)) {
        // Check for element-only content error
        if (strict && hasElementOnlyContent(value)) {
            return {
                values: [],
                type: undefined,
                isEmpty: false,
                error: 'FOTY0012', // Cannot atomize node with element-only content
            };
        }

        const { value: atomizedValue, type } = getNodeTypedValue(value);

        return {
            values: atomizedValue !== undefined ? [atomizedValue] : [],
            type,
            isEmpty: atomizedValue === undefined,
        };
    }

    // Atomic values are returned unchanged
    return {
        values: [value],
        type: undefined,
        isEmpty: false,
    };
}

/**
 * Atomize and return single value
 * Throws error if sequence contains multiple values
 */
export function atomizeToSingleValue(value: any): any {
    const result = atomize(value);

    if (result.error) {
        throw new Error(`Atomization error: ${result.error}`);
    }

    if (result.values.length === 0) {
        return undefined;
    }

    if (result.values.length > 1) {
        throw new Error(
            `Cannot atomize to single value: expected 1 item, got ${result.values.length}`
        );
    }

    return result.values[0];
}

/**
 * Extract all string values from nodes by concatenating text content
 * Used for string operations on mixed content
 */
export function extractStringValues(value: any): string[] {
    if (value === undefined || value === null) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap(extractStringValues);
    }

    if (isNode(value)) {
        return [getNodeStringValue(value)];
    }

    if (typeof value === 'string') {
        return [value];
    }

    return [String(value)];
}

/**
 * Convert atomization result to a sequence of values
 */
export function atomizationToSequence(result: AtomizationResult): any[] {
    if (result.error) {
        throw new Error(`Atomization failed: ${result.error}`);
    }
    return result.values;
}

/**
 * Check if atomization succeeded
 */
export function isAtomizationSuccess(result: AtomizationResult): boolean {
    return !result.error;
}

/**
 * Get error description from atomization result
 */
export function getAtomizationErrorDescription(error: string): string {
    const descriptions: { [key: string]: string } = {
        FOTY0012: 'Cannot atomize node with element-only content (no text nodes)',
        XPTY0004: 'Type error in atomization',
    };

    return descriptions[error] || `Atomization error: ${error}`;
}

/**
 * Create a mock node for testing
 */
export function createTestNode(
    nodeType: string,
    content?: string,
    type?: string,
    children?: XPathNode[]
): XPathNode {
    return {
        nodeType,
        nodeName: nodeType === 'element' ? 'test' : undefined,
        localName: nodeType === 'element' ? 'test' : undefined,
        value: content,
        textContent: content,
        type,
        childNodes: children,
    };
}

/**
 * Create a test element node with child text nodes
 */
export function createElementWithText(
    elementName: string,
    textContent: string,
    type?: string
): XPathNode {
    const textNode = createTestNode('text', textContent);

    return {
        nodeType: 'element',
        nodeName: elementName,
        localName: elementName,
        textContent,
        type,
        childNodes: [textNode],
    };
}

/**
 * Create a test element node with only element children (element-only content)
 */
export function createElementWithChildren(
    elementName: string,
    children: XPathNode[],
    type?: string
): XPathNode {
    return {
        nodeType: 'element',
        nodeName: elementName,
        localName: elementName,
        type,
        childNodes: children,
    };
}
