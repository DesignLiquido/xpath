/**
 * XPath 2.0 Numeric Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#numeric-functions
 */

import { XPathResult } from '../context';

/**
 * fn:abs($arg as numeric?) as numeric?
 * Returns the absolute value of $arg.
 */
export function abs(arg: XPathResult): number | null {
    if (arg === null || arg === undefined) return null;
    if (Array.isArray(arg)) {
        if (arg.length === 0) return null;
        arg = arg[0];
    }
    const num = Number(arg);
    if (isNaN(num)) return NaN;
    return Math.abs(num);
}

/**
 * fn:round-half-to-even($arg as numeric?) as numeric?
 * fn:round-half-to-even($arg as numeric?, $precision as xs:integer) as numeric?
 * Rounds a value to a specified number of decimal places, rounding to even on half.
 */
export function roundHalfToEven(arg: XPathResult, precision?: XPathResult): number | null {
    if (arg === null || arg === undefined) return null;
    if (Array.isArray(arg)) {
        if (arg.length === 0) return null;
        arg = arg[0];
    }

    const num = Number(arg);
    if (isNaN(num)) return NaN;
    if (!isFinite(num)) return num;

    const prec = precision !== undefined ? Math.floor(Number(precision)) : 0;

    if (prec >= 0) {
        // Positive precision: round to decimal places
        const factor = Math.pow(10, prec);
        const scaled = num * factor;
        const rounded = bankersRound(scaled);
        return rounded / factor;
    } else {
        // Negative precision: round to tens, hundreds, etc.
        const factor = Math.pow(10, -prec);
        const scaled = num / factor;
        const rounded = bankersRound(scaled);
        return rounded * factor;
    }
}

/**
 * Banker's rounding (round half to even)
 */
function bankersRound(num: number): number {
    const floor = Math.floor(num);
    const decimal = num - floor;

    if (decimal < 0.5) {
        return floor;
    } else if (decimal > 0.5) {
        return floor + 1;
    } else {
        // Exactly 0.5 - round to even
        return floor % 2 === 0 ? floor : floor + 1;
    }
}

/**
 * fn:avg($arg as xs:anyAtomicType*) as xs:anyAtomicType?
 * Returns the average of the values in the input sequence.
 */
export function avg(arg: XPathResult): number | null {
    if (arg === null || arg === undefined) return null;

    const values = Array.isArray(arg) ? arg : [arg];
    if (values.length === 0) return null;

    let sum = 0;
    let count = 0;

    for (const value of values) {
        const num = toNumber(value);
        if (isNaN(num)) return NaN;
        sum += num;
        count++;
    }

    return count > 0 ? sum / count : null;
}

/**
 * fn:min($arg as xs:anyAtomicType*) as xs:anyAtomicType?
 * fn:min($arg as xs:anyAtomicType*, $collation as xs:string) as xs:anyAtomicType?
 * Returns the minimum value from the input sequence.
 */
export function min(arg: XPathResult, collation?: XPathResult): number | string | null {
    if (arg === null || arg === undefined) return null;

    const values = Array.isArray(arg) ? arg : [arg];
    if (values.length === 0) return null;

    // Determine comparison mode: numeric if all items can be converted to numbers
    const allNumeric = values.every(v => !isNaN(toNumber(v)));

    if (allNumeric) {
        let minVal = Infinity;
        for (const value of values) {
            const num = toNumber(value);
            if (isNaN(num)) return NaN;
            if (num < minVal) minVal = num;
        }
        return minVal === Infinity ? null : minVal;
    } else {
        // String comparison
        let minStr: string | null = null;
        const coll = typeof collation === 'string' ? collation : undefined;
        for (const value of values) {
            const str = toString(value);
            if (minStr === null || compareStrings(str, minStr, coll) < 0) {
                minStr = str;
            }
        }
        return minStr;
    }
}

/**
 * fn:max($arg as xs:anyAtomicType*) as xs:anyAtomicType?
 * fn:max($arg as xs:anyAtomicType*, $collation as xs:string) as xs:anyAtomicType?
 * Returns the maximum value from the input sequence.
 */
export function max(arg: XPathResult, collation?: XPathResult): number | string | null {
    if (arg === null || arg === undefined) return null;

    const values = Array.isArray(arg) ? arg : [arg];
    if (values.length === 0) return null;

    // Determine comparison mode: numeric if all items can be converted to numbers
    const allNumeric = values.every(v => !isNaN(toNumber(v)));

    if (allNumeric) {
        let maxVal = -Infinity;
        for (const value of values) {
            const num = toNumber(value);
            if (isNaN(num)) return NaN;
            if (num > maxVal) maxVal = num;
        }
        return maxVal === -Infinity ? null : maxVal;
    } else {
        // String comparison
        let maxStr: string | null = null;
        const coll = typeof collation === 'string' ? collation : undefined;
        for (const value of values) {
            const str = toString(value);
            if (maxStr === null || compareStrings(str, maxStr, coll) > 0) {
                maxStr = str;
            }
        }
        return maxStr;
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

function toNumber(value: unknown): number {
    if (value === null || value === undefined) return NaN;
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'object' && value !== null && 'textContent' in value) {
        return Number((value as { textContent?: string }).textContent);
    }
    return Number(value);
}

function toString(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object' && value !== null && 'textContent' in value) {
        return (value as { textContent?: string }).textContent ?? '';
    }
    return String(value);
}

/**
 * String comparison with optional collation.
 * Currently supports codepoint collation by default. Other collations fall back to
 * localeCompare with 'en' and sensitivity 'variant'.
 */
function compareStrings(a: string, b: string, collation?: string): number {
    // Default or codepoint collation: simple Unicode codepoint ordering
    if (!collation || collation.endsWith('/collation/codepoint')) {
        if (a === b) return 0;
        return a < b ? -1 : 1;
    }
    // Fallback: locale-aware comparison
    try {
        return a.localeCompare(b, 'en', { sensitivity: 'variant' });
    } catch {
        // If localeCompare fails, fallback to codepoint ordering
        if (a === b) return 0;
        return a < b ? -1 : 1;
    }
}
