/**
 * XPath 2.0 Boolean Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#boolean-functions
 */

import { XPathContext, XPathResult } from '../context';

/**
 * fn:boolean($arg as item()?) as xs:boolean
 * Effective Boolean Value (EBV) conversion.
 */
export function booleanFn(arg: XPathResult, context?: XPathContext): boolean {
    // If argument missing, use context node
    if (arg === undefined) {
        if (context && context.node) {
            return true;
        }
        return false;
    }

    // Empty sequence
    if (arg === null) return false;

    // Sequence handling
    if (Array.isArray(arg)) {
        if (arg.length === 0) return false;
        if (arg.length === 1) return booleanFn(arg[0] as XPathResult, context);
        // Multiple items in sequence => true
        return true;
    }

    // Numeric values: false if 0 or NaN
    if (typeof arg === 'number') {
        return arg !== 0 && !isNaN(arg);
    }

    // Strings: false if empty
    if (typeof arg === 'string') {
        return arg.length > 0;
    }

    // Booleans: as-is
    if (typeof arg === 'boolean') {
        return arg;
    }

    // Nodes and objects: true
    return true;
}

/**
 * fn:not($arg as item()?) as xs:boolean
 */
export function notFn(arg: XPathResult, context?: XPathContext): boolean {
    return !booleanFn(arg, context);
}

/**
 * fn:true() as xs:boolean
 */
export function trueFn(): boolean {
    return true;
}

/**
 * fn:false() as xs:boolean
 */
export function falseFn(): boolean {
    return false;
}
