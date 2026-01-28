/**
 * XPath 2.0 Node Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#node-functions
 */

import { XPathContext, XPathResult } from '../context';
import { XPathNode } from '../node';

/**
 * fn:node-name($arg as node()?) as xs:QName?
 * Returns the name of a node as an xs:QName.
 */
export function nodeName(arg: XPathResult, context: XPathContext): string | null {
    const node = getNode(arg, context);
    if (!node) return null;

    // Only elements, attributes, and processing instructions have names
    const nodeType = node.nodeType;
    if (
        nodeType !== 1 && // ELEMENT_NODE
        nodeType !== 2 && // ATTRIBUTE_NODE
        nodeType !== 7
    ) {
        // PROCESSING_INSTRUCTION_NODE
        return null;
    }

    return node.nodeName ?? null;
}

/**
 * fn:nilled($arg as node()?) as xs:boolean?
 * Returns true if the argument node is "nilled".
 * This is relevant for schema-validated documents where xsi:nil="true".
 */
export function nilled(arg: XPathResult, context: XPathContext): boolean | null {
    const node = getNode(arg, context);
    if (!node) return null;

    // Only element nodes can be nilled
    if (node.nodeType !== 1) return null; // ELEMENT_NODE

    // Check for xsi:nil attribute
    const nilAttr = node.getAttribute?.('xsi:nil');

    return nilAttr === 'true' || nilAttr === '1';
}

/**
 * fn:data($arg as item()*) as xs:anyAtomicType*
 * Returns the result of atomizing a sequence.
 */
export function data(arg: XPathResult): XPathResult[] {
    if (arg === null || arg === undefined) return [];

    const items = Array.isArray(arg) ? arg : [arg];
    const result: XPathResult[] = [];

    for (const item of items) {
        result.push(atomize(item));
    }

    return result;
}

/**
 * fn:base-uri() as xs:anyURI?
 * fn:base-uri($arg as node()?) as xs:anyURI?
 * Returns the base URI of a node.
 */
export function baseUri(arg: XPathResult, context: XPathContext): string | null {
    const node = getNode(arg, context);
    if (!node) return null;

    // Try to get baseURI from node
    if ('baseURI' in node && node.baseURI) {
        return node.baseURI as string;
    }

    // Check for xml:base attribute
    const xmlBase = node.getAttribute?.('xml:base');
    if (xmlBase) return xmlBase;

    // Try parent
    if (node.parentNode && isNode(node.parentNode)) {
        return baseUri([node.parentNode], context);
    }

    // Check context for base URI
    return context.baseUri ?? null;
}

/**
 * fn:document-uri($arg as node()?) as xs:anyURI?
 * Returns the document URI of a document node.
 */
export function documentUri(arg: XPathResult, context: XPathContext): string | null {
    const node = getNode(arg, context);
    if (!node) return null;

    // Only document nodes have document URIs
    if (node.nodeType !== 9) return null; // DOCUMENT_NODE

    // Check for documentURI property
    if ('documentURI' in node && node.documentURI) {
        return node.documentURI as string;
    }

    return null;
}

/**
 * fn:root() as node()
 * fn:root($arg as node()?) as node()?
 * Returns the root of the tree to which the argument node belongs.
 */
export function root(arg: XPathResult, context: XPathContext): XPathNode | null {
    const node = getNode(arg, context);
    if (!node) return null;

    let current: XPathNode = node;
    let depth = 0;
    const visited = new Set<XPathNode>();

    while (current.parentNode && depth < 10000) {
        if (visited.has(current)) {
            // Circular reference - return current node
            return current;
        }
        visited.add(current);
        current = current.parentNode as XPathNode;
        depth++;
    }

    return current;
}

/**
 * fn:string($arg as item()?) as xs:string
 * Returns the string value of the argument.
 */
export function string(arg: XPathResult, context: XPathContext): string {
    if (arg === null || arg === undefined) {
        // With no argument, use context node
        if (!context.node) return '';
        return getStringValue(context.node);
    }

    if (Array.isArray(arg)) {
        if (arg.length === 0) return '';
        arg = arg[0];
    }

    if (isNode(arg)) {
        return getStringValue(arg as XPathNode);
    }

    return String(arg);
}

/**
 * fn:number($arg as xs:anyAtomicType?) as xs:double
 * Returns the numeric value of the argument.
 */
export function number(arg: XPathResult, context: XPathContext): number {
    if (arg === null || arg === undefined) {
        // With no argument, use context node string value
        if (!context.node) return NaN;
        return Number(getStringValue(context.node));
    }

    if (Array.isArray(arg)) {
        if (arg.length === 0) return NaN;
        arg = arg[0];
    }

    if (isNode(arg)) {
        return Number(getStringValue(arg as XPathNode));
    }

    return Number(arg);
}

/**
 * fn:lang($testlang as xs:string?) as xs:boolean
 * fn:lang($testlang as xs:string?, $node as node()) as xs:boolean
 * Returns true if the language of the node matches the specified language.
 */
export function lang(testlang: XPathResult, nodeArg: XPathResult, context: XPathContext): boolean {
    const targetLang = toString(testlang).toLowerCase();
    if (!targetLang) return false;

    const node = nodeArg !== undefined ? getNode(nodeArg, context) : context.node;
    if (!node) return false;

    let current: XPathNode | null = node;
    while (current) {
        const langAttr = current.getAttribute?.('xml:lang') || current.getAttribute?.('lang');
        if (langAttr) {
            const nodeLang = langAttr.toLowerCase();
            return nodeLang === targetLang || nodeLang.startsWith(targetLang + '-');
        }
        current = current.parentNode as XPathNode | null;
    }

    return false;
}

/**
 * fn:local-name() as xs:string
 * fn:local-name($arg as node()?) as xs:string
 * Returns the local name of a node.
 */
export function localName(arg: XPathResult, context: XPathContext): string {
    const node = getNode(arg, context);
    if (!node) return '';

    // Only elements, attributes, and PIs have local names
    const nodeType = node.nodeType;
    if (
        nodeType !== 1 && // ELEMENT_NODE
        nodeType !== 2 && // ATTRIBUTE_NODE
        nodeType !== 7
    ) {
        // PROCESSING_INSTRUCTION_NODE
        return '';
    }

    return node.localName ?? '';
}

/**
 * fn:namespace-uri() as xs:anyURI
 * fn:namespace-uri($arg as node()?) as xs:anyURI
 * Returns the namespace URI of a node.
 */
export function namespaceUri(arg: XPathResult, context: XPathContext): string {
    const node = getNode(arg, context);
    if (!node) return '';

    // Only elements and attributes have namespace URIs
    const nodeType = node.nodeType;
    if (
        nodeType !== 1 && // ELEMENT_NODE
        nodeType !== 2
    ) {
        // ATTRIBUTE_NODE
        return '';
    }

    return node.namespaceUri ?? '';
}

/**
 * fn:name() as xs:string
 * fn:name($arg as node()?) as xs:string
 * Returns the name of a node as a string.
 */
export function name(arg: XPathResult, context: XPathContext): string {
    const node = getNode(arg, context);
    if (!node) return '';

    // Only elements, attributes, and PIs have names
    const nodeType = node.nodeType;
    if (
        nodeType !== 1 && // ELEMENT_NODE
        nodeType !== 2 && // ATTRIBUTE_NODE
        nodeType !== 7
    ) {
        // PROCESSING_INSTRUCTION_NODE
        return '';
    }

    return node.nodeName ?? '';
}

/**
 * fn:generate-id() as xs:string
 * fn:generate-id($arg as node()?) as xs:string
 * Generates a unique ID for a node that is consistent across multiple invocations.
 */
export function generateId(arg: XPathResult, context: XPathContext): string {
    const node = getNode(arg, context);
    if (!node) return '';

    // Create a WeakMap to store IDs (or use a property on the node itself)
    // For simplicity, we'll use a symbol property if available
    const idSymbol = Symbol.for('__xpath_node_id__');

    if (!node[idSymbol as any]) {
        // Generate a unique ID starting with a letter
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        const counter = (Math.floor(Math.random() * 10000)).toString(36);
        node[idSymbol as any] = `n${timestamp}${random}${counter}`;
    }

    return node[idSymbol as any];
}

/**
 * fn:path() as xs:string?
 * fn:path($arg as node()?) as xs:string?
 * Returns the XPath expression that would select the given node.
 */
export function path(arg: XPathResult, context: XPathContext): string {
    const node = getNode(arg, context);
    if (!node) return '';

    const pathSegments: string[] = [];
    let current: XPathNode | null = node;
    let depth = 0;
    const visited = new Set<XPathNode>();

    while (current && depth < 10000) {
        if (visited.has(current)) {
            // Circular reference detected
            break;
        }
        visited.add(current);
        const segment = buildPathSegment(current);
        if (segment) {
            pathSegments.unshift(segment);
        }
        current = current.parentNode as XPathNode | null;
        depth++;
    }

    return '/' + pathSegments.join('/');
}

/**
 * fn:has-children() as xs:boolean
 * fn:has-children($arg as node()?) as xs:boolean
 * Returns true if the argument node has child nodes.
 */
export function hasChildren(arg: XPathResult, context: XPathContext): boolean {
    const node = getNode(arg, context);
    if (!node) return false;

    if ('childNodes' in node && Array.isArray(node.childNodes)) {
        return node.childNodes.length > 0;
    }

    return false;
}

// Note: innermost() and outermost() are implemented in sequence-functions-30.ts
// They are XPath 3.0 functions that operate on sequences, not node-specific functions.

// ============================================================================
// Helper Functions
// ============================================================================

function getNode(arg: XPathResult, context: XPathContext): XPathNode | null {
    if (arg === null || arg === undefined) {
        return context.node ?? null;
    }

    if (Array.isArray(arg)) {
        if (arg.length === 0) return null;
        arg = arg[0];
    }

    if (isNode(arg)) {
        return arg;
    }

    return null;
}

function isNode(value: unknown): value is XPathNode {
    return typeof value === 'object' && value !== null && 'nodeType' in value;
}

function getStringValue(node: XPathNode): string {
    if (node.textContent !== undefined) {
        return node.textContent;
    }

    // For element nodes, concatenate all text descendants
    if (
        node.nodeType === 1 || // ELEMENT_NODE
        node.nodeType === 9
    ) {
        // DOCUMENT_NODE
        return getDescendantTextContent(node);
    }

    return String(node);
}

function getDescendantTextContent(node: XPathNode): string {
    const parts: string[] = [];

    if ('childNodes' in node && Array.isArray(node.childNodes)) {
        for (const child of node.childNodes) {
            if (child.nodeType === 3) {
                // TEXT_NODE
                parts.push(child.textContent ?? '');
            } else if (child.nodeType === 1) {
                // ELEMENT_NODE
                parts.push(getDescendantTextContent(child as XPathNode));
            }
        }
    }

    return parts.join('');
}

function atomize(value: XPathResult): XPathResult {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (isNode(value)) {
        return getStringValue(value as XPathNode);
    }
    return String(value);
}

function toString(value: XPathResult): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
        if (value.length === 0) return '';
        value = value[0];
    }
    if (isNode(value)) {
        return getStringValue(value as XPathNode);
    }
    return String(value);
}

// ============================================================================
// Additional Helper Functions for Advanced Node Operations
// ============================================================================

// Maximum depth to prevent infinite loops in case of circular references
const MAX_DEPTH = 10000;

/**
 * Calculate the depth of a node in the document tree.
 */
function calculateDepth(node: XPathNode): number {
    let depth = 0;
    let current: XPathNode | null = node;
    const visited = new Set<XPathNode>();

    while (current.parentNode && depth < MAX_DEPTH) {
        if (visited.has(current)) {
            // Circular reference detected
            break;
        }
        visited.add(current);
        depth++;
        current = current.parentNode as XPathNode;
    }

    return depth;
}

/**
 * Check if a node is an ancestor of any node in an array.
 */
function isAncestorOf(nodes: XPathNode[], node: XPathNode): boolean {
    for (const candidate of nodes) {
        let current: XPathNode | null = node.parentNode as XPathNode | null;
        let depth = 0;
        const visited = new Set<XPathNode>();

        while (current && depth < MAX_DEPTH) {
            if (visited.has(current)) {
                // Circular reference detected
                break;
            }
            if (current === candidate) {
                return true;
            }
            visited.add(current);
            current = current.parentNode as XPathNode | null;
            depth++;
        }
    }
    return false;
}

/**
 * Build a single segment of an XPath expression for a node.
 */
function buildPathSegment(node: XPathNode): string {
    const nodeName = node.nodeName || 'node()';
    const nodeType = node.nodeType;

    switch (nodeType) {
        case 1: // ELEMENT_NODE
            // Check if we need a position index
            const parent = node.parentNode;
            if (parent && 'childNodes' in parent && Array.isArray(parent.childNodes)) {
                const siblings = parent.childNodes.filter(
                    (n: any) => n.nodeType === 1 && n.nodeName === nodeName
                );
                if (siblings.length > 1) {
                    const position = siblings.indexOf(node) + 1;
                    return `${nodeName}[${position}]`;
                }
            }
            return nodeName;
        case 2: // ATTRIBUTE_NODE
            return `@${nodeName}`;
        case 3: // TEXT_NODE
            return 'text()';
        case 7: // PROCESSING_INSTRUCTION_NODE
            return `processing-instruction(${nodeName})`;
        case 8: // COMMENT_NODE
            return 'comment()';
        case 9: // DOCUMENT_NODE
            return '';
        default:
            return 'node()';
    }
}

/**
 * Normalize an argument to an array of nodes.
 */
function normalizeToArray(arg: XPathResult): any[] {
    if (arg === null || arg === undefined) return [];
    if (Array.isArray(arg)) return arg;
    return [arg];
}
