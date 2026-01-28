/**
 * PSVI (Post-Schema-Validation Infoset) Support
 *
 * Implements type information attached to nodes after schema validation
 * Per XPath 2.0 Section 2.3.4
 */

import { XPathNode } from '../types/index';
import { SchemaType } from './validator';

/**
 * PSVI information for a node
 */
export interface PSVI {
    // Schema-related properties
    schemaType?: SchemaType;
    schemaTypeName?: string;
    schemaElement?: string;
    schemaAttribute?: string;
    schemaTypeNamespace?: string;

    // Validation properties
    isValid: boolean;
    validationErrors: string[];

    // Type information
    typedValue?: any;
    typeCode?: string;

    // Ancestry information
    ancestry?: {
        parent?: PSVI;
        elementDeclaration?: string;
    };

    // Content model
    isNilled: boolean;
    contentType?: 'empty' | 'simple' | 'complex' | 'mixed';

    // Default/fixed values
    defaultValue?: string;
    fixedValue?: string;

    // Substitution information
    substitutionGroup?: string;
    isSubstitutableFor?: string;
}

/**
 * PSVI symbol for storing type information on nodes
 */
const PSVI_SYMBOL = Symbol.for('__xpath_psvi__');

/**
 * Set PSVI information on a node
 */
export function setPSVI(node: XPathNode, psvi: PSVI): void {
    if (node && typeof node === 'object') {
        (node as any)[PSVI_SYMBOL] = psvi;
    }
}

/**
 * Get PSVI information from a node
 */
export function getPSVI(node: XPathNode): PSVI | undefined {
    if (node && typeof node === 'object') {
        return (node as any)[PSVI_SYMBOL];
    }
    return undefined;
}

/**
 * Check if node has PSVI information
 */
export function hasPSVI(node: XPathNode): boolean {
    return getPSVI(node) !== undefined;
}

/**
 * Get schema type of a node
 */
export function getSchemaType(node: XPathNode): SchemaType | undefined {
    const psvi = getPSVI(node);
    return psvi?.schemaType;
}

/**
 * Get schema type name of a node
 */
export function getSchemaTypeName(node: XPathNode): string | undefined {
    const psvi = getPSVI(node);
    return psvi?.schemaTypeName || psvi?.schemaType?.name;
}

/**
 * Check if node is schema-valid
 */
export function isSchemaValid(node: XPathNode): boolean {
    const psvi = getPSVI(node);
    return psvi?.isValid ?? true; // Default to valid if no PSVI
}

/**
 * Get schema validation errors
 */
export function getValidationErrors(node: XPathNode): string[] {
    const psvi = getPSVI(node);
    return psvi?.validationErrors ?? [];
}

/**
 * Get typed value of a node
 */
export function getTypedValue(node: XPathNode): any {
    const psvi = getPSVI(node);
    if (psvi?.typedValue !== undefined) {
        return psvi.typedValue;
    }

    // Fall back to string value
    return getStringValue(node);
}

/**
 * Get string value of a node
 */
function getStringValue(node: XPathNode): string {
    if (node.nodeType === 'text' || node.nodeType === '3') {
        // Text node
        return node.value || (node as any).nodeValue || '';
    }
    if (node.nodeType === 'element' || node.nodeType === '1') {
        // Element node - concatenate all text descendants
        if (node.childNodes) {
            return node.childNodes
                .map((child) => getStringValue(child))
                .join('');
        }
    }
    return node.value || (node as any).nodeValue || '';
}

/**
 * Get content type of a node
 */
export function getContentType(node: XPathNode): string | undefined {
    const psvi = getPSVI(node);
    return psvi?.contentType;
}

/**
 * Check if node is nilled
 */
export function isNilled(node: XPathNode): boolean {
    const psvi = getPSVI(node);
    if (psvi?.isNilled) {
        return true;
    }

    // Check xsi:nil attribute
    if ((node.nodeType === 'element' || node.nodeType === '1') && node.attributes) {
        const nilAttrs = Object.entries(node.attributes);
        const nilAttr = nilAttrs.find(
            ([name, value]) =>
                name.endsWith('}nil') || name === 'xsi:nil' || name === 'nil'
        );
        if (nilAttr) {
            return String(nilAttr[1]).toLowerCase() === 'true';
        }
    }

    return false;
}

/**
 * Create default PSVI for unvalidated node
 */
export function createDefaultPSVI(node: XPathNode): PSVI {
    return {
        isValid: true,
        validationErrors: [],
        isNilled: isNilled(node),
        contentType: getNodeContentType(node),
    };
}

/**
 * Determine content type from node structure
 */
function getNodeContentType(node: XPathNode): 'empty' | 'simple' | 'complex' | 'mixed' {
    if (node.nodeType !== 'element' && node.nodeType !== '1') {
        return 'simple';
    }

    if (!node.childNodes || node.childNodes.length === 0) {
        return 'empty';
    }

    const hasElementChildren = node.childNodes.some((child) => child.nodeType === 'element' || child.nodeType === '1');
    const hasTextChildren = node.childNodes.some((child) => child.nodeType === 'text' || child.nodeType === '3');

    if (hasElementChildren && hasTextChildren) {
        return 'mixed';
    }
    if (hasElementChildren) {
        return 'complex';
    }
    return 'simple';
}

/**
 * Attach PSVI information to node tree
 */
export function attachPSVIToTree(rootNode: XPathNode, psviMap: Map<XPathNode, PSVI>): void {
    const psviArray = Array.from(psviMap);
    for (const [node, psvi] of psviArray) {
        setPSVI(node, psvi);
    }
}

/**
 * Extract PSVI information from node tree
 */
export function extractPSVIFromTree(rootNode: XPathNode): Map<XPathNode, PSVI> {
    const psviMap = new Map<XPathNode, PSVI>();
    const visited = new Set<XPathNode>();

    function traverse(node: XPathNode): void {
        if (visited.has(node)) {
            return;
        }
        visited.add(node);

        const psvi = getPSVI(node);
        if (psvi) {
            psviMap.set(node, psvi);
        }

        if (node.childNodes) {
            for (const child of node.childNodes) {
                traverse(child);
            }
        }
    }

    traverse(rootNode);
    return psviMap;
}

/**
 * Clear PSVI information from node tree
 */
export function clearPSVIFromTree(rootNode: XPathNode): void {
    const visited = new Set<XPathNode>();

    function traverse(node: XPathNode): void {
        if (visited.has(node)) {
            return;
        }
        visited.add(node);

        if (node && typeof node === 'object') {
            delete (node as any)[PSVI_SYMBOL];
        }

        if (node.childNodes) {
            for (const child of node.childNodes) {
                traverse(child);
            }
        }
    }

    traverse(rootNode);
}
