/**
 * XPath 2.0 QName Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#QName-funcs
 */

import { NodeType } from '../constants';
import { XPathResult } from '../context';
import { XPathNode } from '../node';

/**
 * fn:QName($paramURI as xs:string?, $paramQName as xs:string) as xs:QName
 * Returns an xs:QName with the namespace URI given in $paramURI.
 */
export function QName(paramURI: XPathResult, paramQName: XPathResult): string {
    const uri = toString(paramURI);
    const qname = toString(paramQName);

    if (!qname) {
        throw new Error('FOCA0002: Invalid QName: empty string');
    }

    // Validate QName format (prefix:localName or just localName)
    const colonIndex = qname.indexOf(':');
    if (colonIndex !== -1) {
        const prefix = qname.substring(0, colonIndex);
        const localName = qname.substring(colonIndex + 1);

        // Validate prefix and local name as NCNames
        if (!isValidNCName(prefix) || !isValidNCName(localName)) {
            throw new Error(`FOCA0002: Invalid QName: ${qname}`);
        }

        // If there's a prefix, there must be a URI
        if (!uri) {
            throw new Error(`FONS0004: No namespace for prefix: ${prefix}`);
        }
    } else {
        // No prefix - validate as NCName
        if (!isValidNCName(qname)) {
            throw new Error(`FOCA0002: Invalid QName: ${qname}`);
        }
    }

    // Return as a string representation
    // In a full implementation, this would return a proper QName object
    return uri ? `{${uri}}${qname}` : qname;
}

/**
 * fn:resolve-QName($qname as xs:string?, $element as element()) as xs:QName?
 * Returns an xs:QName value by taking an xs:string that has the lexical form of an xs:QName
 * and resolving it using the in-scope namespaces for a given element.
 */
export function resolveQName(qname: XPathResult, element: XPathResult): string | null {
    const qnameStr = toString(qname);
    if (!qnameStr) return null;

    const elem = getElement(element);
    if (!elem) {
        throw new Error('FORG0001: Second argument to resolve-QName must be an element');
    }

    const colonIndex = qnameStr.indexOf(':');
    if (colonIndex === -1) {
        // No prefix - use default namespace
        const defaultNS = elem.getAttribute?.('xmlns') ?? '';
        return defaultNS ? `{${defaultNS}}${qnameStr}` : qnameStr;
    }

    const prefix = qnameStr.substring(0, colonIndex);
    const localName = qnameStr.substring(colonIndex + 1);

    // Find namespace for prefix
    const ns = getNamespaceForPrefix(elem, prefix);
    if (!ns) {
        throw new Error(`FONS0004: No namespace for prefix: ${prefix}`);
    }

    return `{${ns}}${qnameStr}`;
}

/**
 * fn:prefix-from-QName($arg as xs:QName?) as xs:NCName?
 * Returns the prefix of the xs:QName argument.
 */
export function prefixFromQName(arg: XPathResult): string | null {
    const qname = toString(arg);
    if (!qname) return null;

    // Handle Clark notation {uri}prefix:local
    let effectiveQName = qname;
    if (qname.startsWith('{')) {
        const closeBrace = qname.indexOf('}');
        if (closeBrace !== -1) {
            effectiveQName = qname.substring(closeBrace + 1);
        }
    }

    const colonIndex = effectiveQName.indexOf(':');
    if (colonIndex === -1) return null;

    return effectiveQName.substring(0, colonIndex);
}

/**
 * fn:local-name-from-QName($arg as xs:QName?) as xs:NCName?
 * Returns the local name of the xs:QName argument.
 */
export function localNameFromQName(arg: XPathResult): string | null {
    const qname = toString(arg);
    if (!qname) return null;

    // Handle Clark notation {uri}prefix:local or {uri}local
    let effectiveQName = qname;
    if (qname.startsWith('{')) {
        const closeBrace = qname.indexOf('}');
        if (closeBrace !== -1) {
            effectiveQName = qname.substring(closeBrace + 1);
        }
    }

    const colonIndex = effectiveQName.indexOf(':');
    if (colonIndex === -1) {
        return effectiveQName;
    }

    return effectiveQName.substring(colonIndex + 1);
}

/**
 * fn:namespace-uri-from-QName($arg as xs:QName?) as xs:anyURI?
 * Returns the namespace URI of the xs:QName argument.
 */
export function namespaceUriFromQName(arg: XPathResult): string | null {
    const qname = toString(arg);
    if (!qname) return null;

    // Handle Clark notation {uri}...
    if (qname.startsWith('{')) {
        const closeBrace = qname.indexOf('}');
        if (closeBrace !== -1) {
            return qname.substring(1, closeBrace);
        }
    }

    return null;
}

/**
 * fn:in-scope-prefixes($element as element()) as xs:string*
 * Returns the prefixes of the in-scope namespaces for an element.
 */
export function inScopePrefixes(element: XPathResult): string[] {
    const elem = getElement(element);
    if (!elem) {
        throw new Error('FORG0001: Argument to in-scope-prefixes must be an element');
    }

    const prefixes = new Set<string>();

    // Always include xml prefix
    prefixes.add('xml');

    // Walk up the tree collecting namespace declarations
    let current: XPathNode | null = elem;
    while (current) {
        // Check for xmlns attributes
        if ('attributes' in current && current.attributes) {
            const attrs = current.attributes as NamedNodeMap | { [key: string]: unknown };

            if (typeof (attrs as NamedNodeMap).getNamedItem === 'function') {
                // DOM NamedNodeMap
                for (let i = 0; i < (attrs as NamedNodeMap).length; i++) {
                    const attr = (attrs as NamedNodeMap).item(i);
                    if (attr) {
                        const name = attr.name || attr.nodeName;
                        if (name === 'xmlns') {
                            prefixes.add(''); // Default namespace
                        } else if (name.startsWith('xmlns:')) {
                            prefixes.add(name.substring(6));
                        }
                    }
                }
            } else if (Array.isArray(attrs)) {
                // Array of attribute objects (custom format)
                for (const attr of attrs) {
                    if (attr && typeof attr === 'object') {
                        const name = (attr as any).name || (attr as any).nodeName;
                        if (name === 'xmlns') {
                            prefixes.add('');
                        } else if (name && typeof name === 'string' && name.startsWith('xmlns:')) {
                            prefixes.add(name.substring(6));
                        }
                    }
                }
            } else {
                // Object-style attributes (key-value pairs)
                for (const name of Object.keys(attrs)) {
                    if (name === 'xmlns') {
                        prefixes.add('');
                    } else if (name.startsWith('xmlns:')) {
                        prefixes.add(name.substring(6));
                    }
                }
            }
        }

        current = current.parentNode as XPathNode | null;
    }

    return Array.from(prefixes);
}

/**
 * fn:namespace-uri-for-prefix($prefix as xs:string?, $element as element()) as xs:anyURI?
 * Returns the namespace URI associated with a prefix in the in-scope namespaces for an element.
 */
export function namespaceUriForPrefix(prefix: XPathResult, element: XPathResult): string | null {
    const prefixStr = toString(prefix);
    const elem = getElement(element);

    if (!elem) {
        throw new Error('FORG0001: Second argument to namespace-uri-for-prefix must be an element');
    }

    // Handle xml prefix
    if (prefixStr === 'xml') {
        return 'http://www.w3.org/XML/1998/namespace';
    }

    return getNamespaceForPrefix(elem, prefixStr);
}

// ============================================================================
// Helper Functions
// ============================================================================

function toString(value: XPathResult): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
        if (value.length === 0) return '';
        value = value[0];
    }
    if (typeof value === 'object' && value !== null && 'textContent' in value) {
        return (value as { textContent?: string }).textContent ?? '';
    }
    return String(value);
}

function getElement(value: XPathResult): XPathNode | null {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        value = value[0];
    }

    if (typeof value === 'object' && value !== null && 'nodeType' in value) {
        const node = value as unknown as XPathNode;
        if (node.nodeType === NodeType.ELEMENT_NODE) {
            return node;
        }
    }

    return null;
}

function isValidNCName(name: string): boolean {
    if (!name) return false;

    // NCName cannot start with a digit or hyphen
    const firstChar = name.charAt(0);
    if (/[0-9\-.]/.test(firstChar)) return false;

    // NCName can only contain letters, digits, hyphens, underscores, and periods
    // Also cannot contain colons
    if (name.includes(':')) return false;

    // Simplified validation - allow letters, digits, hyphen, underscore, period
    return /^[a-zA-Z_][\w.\-]*$/.test(name);
}

function getNamespaceForPrefix(elem: XPathNode, prefix: string): string | null {
    let current: XPathNode | null = elem;

    while (current) {
        // Look for xmlns:prefix or xmlns (for default namespace)
        const attrName = prefix ? `xmlns:${prefix}` : 'xmlns';
        const ns = current.getAttribute?.(attrName);
        if (ns !== null && ns !== undefined) {
            return ns;
        }

        current = current.parentNode as XPathNode | null;
    }

    return null;
}
