/**
 * Enhanced Serialization Functions - XSLT 3.0
 *
 * Provides advanced serialization capabilities including:
 * - Adaptive output method selection
 * - HTML5 serialization
 * - Text serialization
 * - Custom serialization parameters
 * - Output encoding options
 */

import { XPathContext } from '../context';
import { XPathNode } from '../node';

/**
 * Serialization parameters for output control
 */
export interface SerializationParameters {
    /**
     * Output method: 'xml', 'html', 'xhtml', 'text', 'adaptive', 'json', 'ixml'
     */
    method?: 'xml' | 'html' | 'xhtml' | 'text' | 'adaptive' | 'json' | 'ixml';

    /**
     * Output encoding
     */
    encoding?: string;

    /**
     * Include XML declaration
     */
    'indent'?: boolean;

    /**
     * Indentation spaces
     */
    'indent-spaces'?: number;

    /**
     * Public identifier for DOCTYPE
     */
    'doctype-public'?: string;

    /**
     * System identifier for DOCTYPE
     */
    'doctype-system'?: string;

    /**
     * Output version (e.g., "1.0", "1.1" for XML)
     */
    version?: string;

    /**
     * Strip whitespace (text-only)
     */
    'strip-whitespace'?: boolean;

    /**
     * Omit XML declaration
     */
    'omit-xml-declaration'?: boolean;

    /**
     * Use CDATA sections
     */
    'cdata-section-elements'?: string[];

    /**
     * Escape non-ASCII characters
     */
    'escape-non-ascii'?: boolean;

    /**
     * Include BOM
     */
    'byte-order-mark'?: boolean;
}

/**
 * Serialize nodes to string with specified parameters
 *
 * Main serialization function supporting multiple output methods
 */
export function serialize(
    context: XPathContext,
    nodes: any,
    params?: SerializationParameters
): string {
    const parameters: SerializationParameters = {
        method: 'adaptive',
        encoding: 'UTF-8',
        'omit-xml-declaration': false,
        'indent': true,
        'indent-spaces': 2,
        ...params,
    };

    // Handle empty sequence
    if (nodes === undefined || nodes === null) {
        return '';
    }

    // Convert to array if single value
    const nodeList = Array.isArray(nodes) ? nodes : [nodes];

    // Determine method if adaptive
    let method = parameters.method;
    if (method === 'adaptive') {
        method = determineAdaptiveMethod(nodeList);
    }

    // Serialize based on method
    switch (method) {
        case 'xml':
            return serializeXML(nodeList, parameters);
        case 'html':
        case 'xhtml':
            return serializeHTML(nodeList, parameters);
        case 'text':
            return serializeText(nodeList, parameters);
        case 'json':
            return serializeJSON(nodeList, parameters);
        default:
            return serializeXML(nodeList, parameters);
    }
}

/**
 * Determine output method based on content
 *
 * Adaptive method selects appropriate serialization based on result type
 */
function determineAdaptiveMethod(nodes: any[]): 'text' | 'xml' | 'html' | 'xhtml' | 'adaptive' | 'json' | 'ixml' {
    if (nodes.length === 0) {
        return 'text';
    }

    const firstNode = nodes[0];

    // Check for document node
    if (firstNode && typeof firstNode === 'object' && firstNode.nodeType === 9) {
        return 'xml';
    }

    // Check for element node
    if (firstNode && typeof firstNode === 'object' && firstNode.nodeType === 1) {
        const nodeName = firstNode.nodeName?.toLowerCase() || '';
        // If first element is HTML-related, use HTML
        if (['html', 'body', 'head', 'div', 'p', 'span'].includes(nodeName)) {
            return 'html';
        }
        return 'xml';
    }

    // Check for JSON-like object
    if (firstNode && typeof firstNode === 'object' && !firstNode.nodeType) {
        return 'json';
    }

    // Default to text for atomic values
    return 'text';
}

/**
 * Serialize as XML
 */
function serializeXML(nodes: any[], params: SerializationParameters): string {
    const results: string[] = [];
    const indentSize = params['indent-spaces'] ?? 2;
    const useIndent = params['indent'] ?? true;

    // Add XML declaration if requested
    if (!params['omit-xml-declaration']) {
        results.push(`<?xml version="${params.version || '1.0'}" encoding="${params.encoding || 'UTF-8'}"?>`);
    }

    // Add DOCTYPE if specified
    if (params['doctype-public'] || params['doctype-system']) {
        let doctype = '<!DOCTYPE ';
        if (nodes[0]?.nodeName) {
            doctype += nodes[0].nodeName;
        }
        if (params['doctype-public']) {
            doctype += ` PUBLIC "${params['doctype-public']}"`;
        }
        if (params['doctype-system']) {
            doctype += ` "${params['doctype-system']}"`;
        }
        doctype += '>';
        results.push(doctype);
    }

    // Serialize nodes
    for (const node of nodes) {
        results.push(serializeNode(node, useIndent ? indentSize : 0, 0, params));
    }

    return results.join('\n');
}

/**
 * Serialize as HTML (HTML5)
 */
function serializeHTML(nodes: any[], params: SerializationParameters): string {
    const results: string[] = [];
    const indentSize = params['indent-spaces'] ?? 2;
    const useIndent = params['indent'] ?? true;

    // HTML5 doesn't use XML declaration
    // Add DOCTYPE if not present
    const hasDoctype = nodes.some(
        (n) => n && typeof n === 'object' && n.nodeType === 10 // DOCTYPE node
    );

    if (!hasDoctype && nodes.some((n) => n?.nodeName?.toLowerCase() === 'html')) {
        results.push('<!DOCTYPE html>');
    }

    // Serialize nodes
    for (const node of nodes) {
        results.push(serializeNodeAsHTML(node, useIndent ? indentSize : 0, 0, params));
    }

    return results.join('\n');
}

/**
 * Serialize as text (atomic values only)
 */
function serializeText(nodes: any[], params: SerializationParameters): string {
    const results: string[] = [];

    for (const node of nodes) {
        if (node === null || node === undefined) {
            continue;
        }

        if (typeof node === 'object' && node.nodeType !== undefined) {
            // Extract text from node
            results.push(extractTextContent(node));
        } else {
            // Atomic value
            results.push(String(node));
        }
    }

    return results.join(params['strip-whitespace'] ? '' : '\n');
}

/**
 * Serialize as JSON
 */
function serializeJSON(nodes: any[], params: SerializationParameters): string {
    if (nodes.length === 0) {
        return '[]';
    }

    if (nodes.length === 1) {
        return JSON.stringify(nodes[0], null, params['indent'] ? (params['indent-spaces'] ?? 2) : 0);
    }

    return JSON.stringify(nodes, null, params['indent'] ? (params['indent-spaces'] ?? 2) : 0);
}

/**
 * Serialize single node recursively
 */
function serializeNode(node: XPathNode, indentSize: number, depth: number, params: SerializationParameters): string {
    if (!node || typeof node !== 'object') {
        return String(node);
    }

    const indent = ' '.repeat(depth * indentSize);
    const nextIndent = ' '.repeat((depth + 1) * indentSize);

    switch (node.nodeType) {
        case 1: // Element
            return serializeElement(node, indentSize, depth, indent, nextIndent, params);
        case 3: // Text
            return escapeXML((node as any).nodeValue || '');
        case 8: // Comment
            return `<!--${(node as any).nodeValue}-->`;
        case 7: // Processing instruction
            return `<?${node.nodeName} ${(node as any).nodeValue}?>`;
        case 9: // Document
            return Array.from(node.childNodes || [])
                .map((child: XPathNode) => serializeNode(child, indentSize, depth, params))
                .join('\n');
        default:
            return '';
    }
}

/**
 * Serialize element node
 */
function serializeElement(
    node: XPathNode,
    indentSize: number,
    depth: number,
    indent: string,
    nextIndent: string,
    params: SerializationParameters
): string {
    let result = `${indent}<${node.nodeName}`;

    // Add attributes
    if (node.attributes && node.attributes.length > 0) {
        for (const attr of Array.from(node.attributes)) {
            result += ` ${attr.nodeName}="${escapeXML((attr as any).nodeValue, true)}"`;
        }
    }

    // Handle empty elements
    if (!node.childNodes || node.childNodes.length === 0) {
        result += ' />';
        return result;
    }

    result += '>';

    // Add children
    const hasElementChildren = Array.from(node.childNodes).some((child: XPathNode) => child.nodeType === 1);

    if (hasElementChildren && indentSize > 0) {
        result += '\n';
        for (const child of Array.from(node.childNodes)) {
            result += serializeNode(child, indentSize, depth + 1, params);
            if (child.nodeType === 1) {
                result += '\n';
            }
        }
        result += indent;
    } else {
        // Inline text content
        for (const child of Array.from(node.childNodes)) {
            result += serializeNode(child, 0, depth, params);
        }
    }

    result += `</${node.nodeName}>`;
    return result;
}

/**
 * Serialize element as HTML
 */
function serializeNodeAsHTML(
    node: XPathNode,
    indentSize: number,
    depth: number,
    params: SerializationParameters
): string {
    if (!node || typeof node !== 'object') {
        return String(node);
    }

    const indent = ' '.repeat(depth * indentSize);
    const nextIndent = ' '.repeat((depth + 1) * indentSize);

    // Void elements in HTML that don't have closing tags
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

    if (node.nodeType === 1) {
        // Element
        const tagName = (node.nodeName || '').toLowerCase();
        let result = `${indent}<${tagName}`;

        // Add attributes
        if (node.attributes && node.attributes.length > 0) {
            for (const attr of Array.from(node.attributes)) {
                result += ` ${attr.nodeName.toLowerCase()}="${escapeXML((attr as any).nodeValue, true)}"`;
            }
        }

        // Void elements
        if (voidElements.includes(tagName)) {
            result += '>';
            return result;
        }

        // Check for children
        if (!node.childNodes || node.childNodes.length === 0) {
            result += `></${tagName}>`;
            return result;
        }

        result += '>';

        const hasElementChildren = Array.from(node.childNodes).some((child: XPathNode) => child.nodeType === 1);

        if (hasElementChildren && indentSize > 0) {
            result += '\n';
            for (const child of Array.from(node.childNodes)) {
                result += serializeNodeAsHTML(child, indentSize, depth + 1, params);
                if (child.nodeType === 1) {
                    result += '\n';
                }
            }
            result += indent;
        } else {
            for (const child of Array.from(node.childNodes)) {
                result += serializeNodeAsHTML(child, 0, depth, params);
            }
        }

        result += `</${tagName}>`;
        return result;
    } else if (node.nodeType === 3) {
        // Text
        return escapeXML((node as any).nodeValue || '');
    } else if (node.nodeType === 8) {
        // Comment
        return `<!--${(node as any).nodeValue}-->`;
    }

    return '';
}

/**
 * Extract text content from node tree
 */
function extractTextContent(node: XPathNode): string {
    if (!node || typeof node !== 'object') {
        return String(node);
    }

    if (node.nodeType === 3) {
        // Text node
        return (node as any).nodeValue || '';
    }

    if (node.childNodes && node.childNodes.length > 0) {
        // Element: concatenate text from all children
        return Array.from(node.childNodes).map((child: XPathNode) => extractTextContent(child)).join('');
    }

    return '';
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string, isAttribute: boolean = false): string {
    let result = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    if (isAttribute) {
        result = result.replace(/'/g, '&apos;');
    }

    return result;
}

/**
 * Serialization functions registry
 */
export const serializationFunctions = {
    serialize: {
        name: 'serialize',
        minArgs: 1,
        maxArgs: 2,
        implementation: serialize,
        description: 'Serializes nodes to string with optional parameters',
    },

    'serialize-xml': {
        name: 'serialize-xml',
        minArgs: 1,
        implementation: (context: XPathContext, nodes: any) =>
            serialize(context, nodes, { method: 'xml' }),
        description: 'Serializes nodes as XML',
    },

    'serialize-html': {
        name: 'serialize-html',
        minArgs: 1,
        implementation: (context: XPathContext, nodes: any) =>
            serialize(context, nodes, { method: 'html' }),
        description: 'Serializes nodes as HTML5',
    },

    'serialize-text': {
        name: 'serialize-text',
        minArgs: 1,
        implementation: (context: XPathContext, nodes: any) =>
            serialize(context, nodes, { method: 'text' }),
        description: 'Serializes nodes as text (atomic values only)',
    },

    'serialize-json': {
        name: 'serialize-json',
        minArgs: 1,
        implementation: (context: XPathContext, nodes: any) =>
            serialize(context, nodes, { method: 'json' }),
        description: 'Serializes nodes as JSON',
    },
};
