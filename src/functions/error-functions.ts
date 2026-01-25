/**
 * XPath 2.0 Error Function
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#errors
 * fn:error($code as xs:QName?, $description as xs:string?, $error-object as item()*) as none
 */

import { XPathResult } from '../context';
import { XPathDynamicError, formatError } from '../errors';

/** Default error code when none is supplied (per spec) */
const DEFAULT_ERROR_CODE = 'FOER0000';

/**
 * fn:error
 * Throws a dynamic error with optional code, description, and error object.
 */
export function errorFn(code?: XPathResult, description?: XPathResult, errorObject?: XPathResult): never {
  const codeStr = toQNameString(code);
  const errCode = extractErrorCode(codeStr) || DEFAULT_ERROR_CODE;
  const desc = toString(description);

  // Build message including description and optional object (stringified)
  let msg = desc || 'Error raised via fn:error()';
  if (errorObject !== undefined) {
    try {
      const objStr = summarize(errorObject);
      if (objStr) {
        msg = desc ? `${desc} | object: ${objStr}` : `object: ${objStr}`;
      }
    } catch {
      // ignore serialization problems
    }
  }

  throw new XPathDynamicError(errCode, msg);
}

function toString(value?: XPathResult): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return toString(value[0] as any);
  }
  if (typeof value === 'object') {
    // If it's a node-like object
    if (value && 'textContent' in value) {
      return (value as any).textContent ?? '';
    }
  }
  return String(value);
}

/** Accepts xs:QName lexical forms: "err:CODE", "{uri}local", or plain "CODE" */
function toQNameString(value?: XPathResult): string | undefined {
  const s = toString(value);
  return s || undefined;
}

function extractErrorCode(qname?: string): string | undefined {
  if (!qname) return undefined;
  // Clark notation {uri}local
  if (qname.startsWith('{')) {
    const idx = qname.indexOf('}');
    if (idx !== -1) {
      const local = qname.substring(idx + 1);
      return stripPrefix(local);
    }
  }
  return stripPrefix(qname);
}

function stripPrefix(name: string): string {
  const colon = name.indexOf(':');
  return colon !== -1 ? name.substring(colon + 1) : name;
}

function summarize(obj: XPathResult): string {
  if (obj === null || obj === undefined) return '';
  if (Array.isArray(obj)) {
    return `[${obj.map(v => summarize(v as any)).join(', ')}]`;
  }
  if (typeof obj === 'object') {
    if ((obj as any).nodeType !== undefined) {
      // Node summary: name/localName if present
      const name = (obj as any).nodeName || (obj as any).localName || '#node';
      return `<${name}>`;
    }
    return JSON.stringify(obj);
  }
  return String(obj);
}
