/**
 * XPath 2.0 String Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#string-functions
 */

import { XPathContext, XPathResult } from '../context';
import { translateXPathRegex, handleExtendedMode } from '../expressions/regex-parser';

/**
 * fn:upper-case($arg as xs:string?) as xs:string
 * Converts a string to upper case.
 */
export function upperCase(arg: XPathResult): string {
    if (arg === null || arg === undefined) return '';
    if (Array.isArray(arg)) {
        if (arg.length === 0) return '';
        arg = arg[0];
    }
    return String(arg).toUpperCase();
}

/**
 * fn:lower-case($arg as xs:string?) as xs:string
 * Converts a string to lower case.
 */
export function lowerCase(arg: XPathResult): string {
    if (arg === null || arg === undefined) return '';
    if (Array.isArray(arg)) {
        if (arg.length === 0) return '';
        arg = arg[0];
    }
    return String(arg).toLowerCase();
}

/**
 * fn:ends-with($arg1 as xs:string?, $arg2 as xs:string?) as xs:boolean
 * Returns true if the first argument ends with the second argument.
 */
export function endsWith(arg1: XPathResult, arg2: XPathResult): boolean {
    const str1 = toString(arg1);
    const str2 = toString(arg2);
    if (str2 === '') return true;
    return str1.endsWith(str2);
}

/**
 * fn:matches($input as xs:string?, $pattern as xs:string) as xs:boolean
 * fn:matches($input as xs:string?, $pattern as xs:string, $flags as xs:string) as xs:boolean
 * Returns true if the input string matches the regular expression.
 */
export function matches(input: XPathResult, pattern: XPathResult, flags?: XPathResult): boolean {
    const str = toString(input);
    const patternStr = toString(pattern);
    const flagsStr = flags !== undefined ? toString(flags) : '';

    try {
        const regex = createRegex(patternStr, flagsStr);
        return regex.test(str);
    } catch (e) {
        throw new Error(`FORX0002: Invalid regular expression: ${patternStr}`);
    }
}

/**
 * fn:replace($input as xs:string?, $pattern as xs:string, $replacement as xs:string) as xs:string
 * fn:replace($input as xs:string?, $pattern as xs:string, $replacement as xs:string, $flags as xs:string) as xs:string
 * Replaces substrings matching a pattern with a replacement string.
 */
export function replace(
    input: XPathResult,
    pattern: XPathResult,
    replacement: XPathResult,
    flags?: XPathResult
): string {
    const str = toString(input);
    const patternStr = toString(pattern);
    const replacementStr = toString(replacement);
    const flagsStr = flags !== undefined ? toString(flags) : '';

    // Check for invalid replacement string (unescaped $ not followed by digit)
    if (/\$(?![0-9\\])/.test(replacementStr)) {
        throw new Error(`FORX0004: Invalid replacement string: ${replacementStr}`);
    }

    try {
        // Always use global replacement in XPath
        const regex = createRegex(patternStr, flagsStr + 'g');
        // Convert XPath replacement syntax to JavaScript
        const jsReplacement = convertReplacementString(replacementStr);
        return str.replace(regex, jsReplacement);
    } catch (e) {
        if ((e as Error).message.startsWith('FORX')) throw e;
        throw new Error(`FORX0002: Invalid regular expression: ${patternStr}`);
    }
}

/**
 * fn:tokenize($input as xs:string?, $pattern as xs:string) as xs:string*
 * fn:tokenize($input as xs:string?, $pattern as xs:string, $flags as xs:string) as xs:string*
 * Splits a string into a sequence of strings using a regular expression pattern.
 */
export function tokenize(input: XPathResult, pattern: XPathResult, flags?: XPathResult): string[] {
    const str = toString(input);
    if (str === '') return [];

    const patternStr = toString(pattern);
    const flagsStr = flags !== undefined ? toString(flags) : '';

    // Empty pattern is an error
    if (patternStr === '') {
        throw new Error(`FORX0003: Regular expression matches zero-length string`);
    }

    try {
        const regex = createRegex(patternStr, flagsStr + 'g');

        // Check if pattern matches empty string
        if (regex.test('')) {
            throw new Error(`FORX0003: Regular expression matches zero-length string`);
        }

        const result = str.split(regex);
        // Remove empty strings from start and end
        while (result.length > 0 && result[0] === '') result.shift();
        while (result.length > 0 && result[result.length - 1] === '') result.pop();
        return result;
    } catch (e) {
        if ((e as Error).message.startsWith('FORX')) throw e;
        throw new Error(`FORX0002: Invalid regular expression: ${patternStr}`);
    }
}

/**
 * fn:normalize-unicode($arg as xs:string?) as xs:string
 * fn:normalize-unicode($arg as xs:string?, $normalizationForm as xs:string) as xs:string
 * Returns the value of $arg after applying Unicode normalization.
 */
export function normalizeUnicode(arg: XPathResult, form?: XPathResult): string {
    const str = toString(arg);
    if (str === '') return '';

    let normForm = form !== undefined ? toString(form).toUpperCase().trim() : 'NFC';

    // Empty normalization form means no normalization
    if (normForm === '') return str;

    // Map XPath normalization forms to JavaScript forms
    const formMap: Record<string, 'NFC' | 'NFD' | 'NFKC' | 'NFKD'> = {
        NFC: 'NFC',
        NFD: 'NFD',
        NFKC: 'NFKC',
        NFKD: 'NFKD',
        'FULLY-NORMALIZED': 'NFC', // Approximate with NFC
    };

    const jsForm = formMap[normForm];
    if (!jsForm) {
        throw new Error(`FOCH0003: Unsupported normalization form: ${normForm}`);
    }

    return str.normalize(jsForm);
}

/**
 * fn:codepoints-to-string($arg as xs:integer*) as xs:string
 * Creates a string from a sequence of Unicode code points.
 */
export function codepointsToString(arg: XPathResult): string {
    if (arg === null || arg === undefined) return '';

    const codepoints = Array.isArray(arg) ? arg : [arg];

    const chars: string[] = [];
    for (const cp of codepoints) {
        const codepoint = Number(cp);
        if (!Number.isInteger(codepoint) || codepoint < 0 || codepoint > 0x10ffff) {
            throw new Error(`FOCH0001: Invalid codepoint: ${cp}`);
        }
        // Check for invalid XML characters
        if (
            codepoint === 0 ||
            (codepoint >= 0xd800 && codepoint <= 0xdfff) ||
            (codepoint >= 0xfffe && codepoint <= 0xffff)
        ) {
            throw new Error(`FOCH0001: Codepoint not valid in XML: ${codepoint}`);
        }
        chars.push(String.fromCodePoint(codepoint));
    }

    return chars.join('');
}

/**
 * fn:string-to-codepoints($arg as xs:string?) as xs:integer*
 * Returns the sequence of Unicode code points that constitute the string.
 */
export function stringToCodepoints(arg: XPathResult): number[] {
    const str = toString(arg);
    if (str === '') return [];

    const codepoints: number[] = [];
    for (const char of str) {
        const cp = char.codePointAt(0);
        if (cp !== undefined) {
            codepoints.push(cp);
        }
    }

    return codepoints;
}

/**
 * fn:compare($comparand1 as xs:string?, $comparand2 as xs:string?) as xs:integer?
 * fn:compare($comparand1 as xs:string?, $comparand2 as xs:string?, $collation as xs:string) as xs:integer?
 * Returns -1, 0, or 1 depending on whether the first comparand is less than, equal to, or greater than the second.
 */
export function compare(
    comparand1: XPathResult,
    comparand2: XPathResult,
    collation?: XPathResult
): number | null {
    // Empty sequence handling
    if (
        comparand1 === null ||
        comparand1 === undefined ||
        (Array.isArray(comparand1) && comparand1.length === 0)
    ) {
        return null;
    }
    if (
        comparand2 === null ||
        comparand2 === undefined ||
        (Array.isArray(comparand2) && comparand2.length === 0)
    ) {
        return null;
    }

    const str1 = toString(comparand1);
    const str2 = toString(comparand2);

    // Use collation if provided (simplified - using localeCompare)
    if (collation !== undefined) {
        const collationStr = toString(collation);
        // For now, we just use default locale comparison
        // A full implementation would parse the collation URI
        const result = str1.localeCompare(str2);
        return result < 0 ? -1 : result > 0 ? 1 : 0;
    }

    // Default: Unicode codepoint collation
    if (str1 < str2) return -1;
    if (str1 > str2) return 1;
    return 0;
}

/**
 * fn:string-join($arg1 as xs:string*, $arg2 as xs:string) as xs:string
 * Returns a string created by concatenating the items in a sequence, with a defined separator.
 */
export function stringJoin(arg1: XPathResult, arg2: XPathResult): string {
    const separator = toString(arg2);

    if (arg1 === null || arg1 === undefined) return '';
    if (!Array.isArray(arg1)) return toString(arg1);

    return arg1.map((item) => toString(item)).join(separator);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts XPath result to string, handling empty sequences.
 */
function toString(value: XPathResult): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
        if (value.length === 0) return '';
        // Get string value of first item
        const first = value[0];
        if (first && typeof first === 'object' && 'textContent' in first) {
            return first.textContent ?? '';
        }
        return String(first);
    }
    if (typeof value === 'object' && value !== null && 'textContent' in value) {
        return (value as { textContent?: string }).textContent ?? '';
    }
    return String(value);
}

/**
 * Creates a JavaScript RegExp from XPath regex pattern and flags.
 */
function createRegex(pattern: string, flags: string): RegExp {
    // Convert XPath flags to JavaScript flags
    let jsFlags = '';
    let dotAll = false;
    let multiline = false;
    let caseInsensitive = false;
    let extended = false;

    for (const flag of flags) {
        switch (flag) {
            case 's': // dot-all: . matches newline
                dotAll = true;
                break;
            case 'm': // multi-line: ^ and $ match line boundaries
                multiline = true;
                jsFlags += 'm';
                break;
            case 'i': // case-insensitive
                caseInsensitive = true;
                jsFlags += 'i';
                break;
            case 'x': // extended: whitespace in pattern is ignored
                extended = true;
                break;
            case 'g': // global (used internally)
                jsFlags += 'g';
                break;
            default:
                throw new Error(`FORX0001: Invalid flag: ${flag}`);
        }
    }

    // Handle extended mode - remove whitespace and comments
    let processedPattern = pattern;
    if (extended) {
        processedPattern = handleExtendedMode(processedPattern);
    }

    // Translate XPath regex features to JavaScript
    processedPattern = translateXPathRegex(processedPattern);

    // Handle dot-all mode
    if (dotAll) {
        // Replace unescaped . with [\s\S]
        processedPattern = processedPattern.replace(/(?<!\\)\./g, '[\\s\\S]');
    }

    return new RegExp(processedPattern, jsFlags);
}

/**
 * Converts XPath replacement string syntax to JavaScript.
 */
function convertReplacementString(replacement: string): string {
    // XPath uses $0 for whole match, $1-$9 for groups
    // JavaScript uses $& for whole match, $1-$9 for groups
    return replacement
        .replace(/\$0/g, '$&')
        .replace(/\\\$/g, '$$$$') // Escape \$ to $$
        .replace(/\\\\/g, '\\'); // Unescape \\
}
