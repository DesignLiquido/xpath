/**
 * XPath 2.0 URI Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#uri-functions
 */

import { XPathContext, XPathResult } from '../context';

/**
 * fn:resolve-uri($relative as xs:string?) as xs:anyURI?
 * fn:resolve-uri($relative as xs:string?, $base as xs:string) as xs:anyURI?
 */
export function resolveUri(relative: XPathResult, base?: XPathResult, context?: XPathContext): string | null {
    const rel = toString(relative);
    if (rel === '') return null;

    const baseUri = base !== undefined ? toString(base) : context?.baseUri ?? '';

    try {
        if (baseUri) {
            return new URL(rel, baseUri).toString();
        }
        return new URL(rel).toString();
    } catch {
        return null;
    }
}

/**
 * fn:encode-for-uri($uri-part as xs:string?) as xs:string
 */
export function encodeForUri(uriPart: XPathResult): string {
    const str = toString(uriPart);
    return encodeURIComponent(str)
        .replace(/[!'()*]/g, ch => '%' + ch.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * fn:iri-to-uri($iri as xs:string?) as xs:string
 */
export function iriToUri(iri: XPathResult): string {
    const str = toString(iri);
    // encodeURI will leave valid URI chars untouched and percent-encode non-ASCII
    return encodeURI(str);
}

/**
 * fn:escape-html-uri($uri as xs:string?) as xs:string
 */
export function escapeHtmlUri(uri: XPathResult): string {
    const str = toString(uri);
    // Per spec, leave existing % escapes, encode spaces and quotes
    return encodeURI(str)
        .replace(/\+/g, '%2B')
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function toString(value: XPathResult): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
        if (value.length === 0) return '';
        value = value[0];
    }
    return String(value);
}
