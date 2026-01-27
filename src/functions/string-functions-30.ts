/**
 * XPath 3.0 String Functions (Additional)
 *
 * Implements additional string manipulation functions for XPath 3.0:
 * https://www.w3.org/TR/xpath-functions-30/#string-functions
 */

import { XPathContext, XPathResult } from '../context';

/**
 * fn:analyze-string($input as xs:string?, $pattern as xs:string) as element()*
 * fn:analyze-string($input as xs:string?, $pattern as xs:string, $flags as xs:string) as element()*
 *
 * Analyzes a string using a regular expression and returns a sequence of elements.
 * For now, we return a simplified result as building proper XML elements requires more infrastructure.
 * Basic implementation: Returns array of match and non-match objects.
 */
export function analyzeString(
    context: XPathContext,
    input: any,
    pattern: any,
    flags?: any
): XPathResult {
    const str = input === null || input === undefined ? '' : String(input);
    const pat = String(pattern);
    const flgs = flags ? String(flags) : '';

    try {
        // Build regex with flags
        let regexFlags = '';
        if (flgs.includes('i')) regexFlags += 'i';
        if (flgs.includes('m')) regexFlags += 'm';
        if (flgs.includes('s')) regexFlags += 's';
        if (flgs.includes('x')) regexFlags += 'x'; // Verbose flag (minimal support)

        const regex = new RegExp(pat, regexFlags + 'g');
        const result: any[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(str)) !== null) {
            // Add non-match text before this match
            if (match.index > lastIndex) {
                result.push({
                    type: 'non-match',
                    value: str.substring(lastIndex, match.index),
                });
            }

            // Add the match
            result.push({
                type: 'match',
                value: match[0],
                groups: match.slice(1).map((g) => g || ''),
            });

            lastIndex = regex.lastIndex;
        }

        // Add remaining non-match text
        if (lastIndex < str.length) {
            result.push({
                type: 'non-match',
                value: str.substring(lastIndex),
            });
        }

        // If no matches, return single non-match with full string
        if (result.length === 0) {
            result.push({
                type: 'non-match',
                value: str,
            });
        }

        return result;
    } catch (e) {
        // Invalid regex pattern
        throw new Error(`Invalid regular expression: ${pat}`);
    }
}

/**
 * fn:format-integer($value as xs:integer?, $picture as xs:string) as xs:string
 * fn:format-integer($value as xs:integer?, $picture as xs:string, $lang as xs:string?) as xs:string
 *
 * Formats an integer according to a picture string.
 * Simplified implementation supporting basic patterns like "1", "01", "a", "A", etc.
 */
export function formatInteger(
    context: XPathContext,
    value: any,
    picture: any,
    lang?: any
): XPathResult {
    // Handle null/undefined input
    if (value === null || value === undefined) {
        return '';
    }

    const num = Array.isArray(value) ? (value.length > 0 ? Number(value[0]) : 0) : Number(value);
    const pic = String(picture);

    // Extract the integer part
    const intValue = Math.floor(num);
    const isNegative = intValue < 0;
    const absValue = Math.abs(intValue);

    // Determine format type from picture
    if (pic === '1') {
        return String(intValue);
    } else if (pic === '01') {
        // Zero-padded to match picture length
        return String(Math.abs(intValue)).padStart(2, '0');
    } else if (pic === 'a') {
        // Lowercase letters: a=1, b=2, ... z=26, aa=27, etc.
        return toLetters(absValue, 'a');
    } else if (pic === 'A') {
        // Uppercase letters: A=1, B=2, ... Z=26, AA=27, etc.
        return toLetters(absValue, 'A');
    } else if (pic === 'i') {
        // Lowercase Roman numerals
        return toRoman(absValue).toLowerCase();
    } else if (pic === 'I') {
        // Uppercase Roman numerals
        return toRoman(absValue);
    } else if (pic === 'w') {
        // Word: one, two, three, ... (English only for now)
        return toWords(absValue);
    } else if (pic === 'W') {
        // Capitalized words
        return toWords(absValue).replace(/^\w/, (c) => c.toUpperCase());
    }

    // Default: treat as numeric with padding
    const paddingMatch = pic.match(/^(0+)$/);
    if (paddingMatch) {
        const padLength = paddingMatch[1].length;
        return String(absValue).padStart(padLength, '0');
    }

    // Fallback to simple number format
    return String(intValue);
}

/**
 * fn:format-number($value as xs:number?, $picture as xs:string) as xs:string
 * fn:format-number($value as xs:number?, $picture as xs:string, $format-name as xs:string?) as xs:string
 *
 * Formats a number according to a picture string.
 * Simplified implementation supporting basic decimal formats.
 */
export function formatNumber(
    context: XPathContext,
    value: any,
    picture: any,
    formatName?: any
): XPathResult {
    // Handle null/undefined input
    if (value === null || value === undefined) {
        return 'NaN';
    }

    const num = Array.isArray(value) ? (value.length > 0 ? Number(value[0]) : NaN) : Number(value);

    // Handle special cases
    if (isNaN(num)) {
        return 'NaN';
    }
    if (!isFinite(num)) {
        return num > 0 ? 'Infinity' : '-Infinity';
    }

    const pic = String(picture);

    // Parse picture format: 0.00, #,##0.00, etc.
    // Simplified: extract integer and decimal places
    const parts = pic.split('.');
    const integerPart = parts[0] || '0';
    const decimalPart = parts[1] || '';

    // Count zeros for padding
    const minIntDigits = (integerPart.match(/0/g) || []).length;
    const minDecDigits = (decimalPart.match(/0/g) || []).length;
    const maxDecDigits = decimalPart.length;

    // Format the number
    let result: string;
    if (minDecDigits > 0 || maxDecDigits > 0) {
        const decimals = Math.max(minDecDigits, Math.min(maxDecDigits, 6));
        result = num.toFixed(decimals);
    } else {
        result = String(Math.round(num));
    }

    // Pad integer part if needed
    const [intPart, decPart] = result.split('.');
    const paddedInt = intPart.padStart(minIntDigits, '0');

    return decPart !== undefined ? `${paddedInt}.${decPart}` : paddedInt;
}

/**
 * Helper: Convert number to letter sequence (a=1, b=2, ..., z=26, aa=27, etc.)
 */
function toLetters(num: number, baseChar: string): string {
    if (num <= 0) return '';

    const base = baseChar.charCodeAt(0);
    let result = '';
    let n = num;

    while (n > 0) {
        n--; // Adjust for 0-based indexing
        result = String.fromCharCode(base + (n % 26)) + result;
        n = Math.floor(n / 26);
    }

    return result;
}

/**
 * Helper: Convert number to Roman numerals
 */
function toRoman(num: number): string {
    if (num <= 0 || num >= 4000) return String(num);

    const romanMap = [
        { value: 1000, numeral: 'M' },
        { value: 900, numeral: 'CM' },
        { value: 500, numeral: 'D' },
        { value: 400, numeral: 'CD' },
        { value: 100, numeral: 'C' },
        { value: 90, numeral: 'XC' },
        { value: 50, numeral: 'L' },
        { value: 40, numeral: 'XL' },
        { value: 10, numeral: 'X' },
        { value: 9, numeral: 'IX' },
        { value: 5, numeral: 'V' },
        { value: 4, numeral: 'IV' },
        { value: 1, numeral: 'I' },
    ];

    let result = '';
    let n = num;

    for (const { value, numeral } of romanMap) {
        while (n >= value) {
            result += numeral;
            n -= value;
        }
    }

    return result;
}

/**
 * Helper: Convert number to English words
 */
function toWords(num: number): string {
    if (num === 0) return 'zero';
    if (num < 0) return 'negative ' + toWords(-num);

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = [
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen',
        'nineteen',
    ];
    const tens = [
        '',
        '',
        'twenty',
        'thirty',
        'forty',
        'fifty',
        'sixty',
        'seventy',
        'eighty',
        'ninety',
    ];
    const scales = ['', 'thousand', 'million', 'billion', 'trillion'];

    let result = '';
    let scaleIndex = 0;

    while (num > 0) {
        const chunk = num % 1000;
        if (chunk !== 0) {
            result =
                convertHundreds(chunk, ones, teens, tens) +
                (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') +
                (result ? ' ' : '') +
                result;
        }
        num = Math.floor(num / 1000);
        scaleIndex++;
    }

    return result.trim();
}

/**
 * Helper: Convert 0-999 to words
 */
function convertHundreds(num: number, ones: string[], teens: string[], tens: string[]): string {
    let result = '';

    const hundreds = Math.floor(num / 100);
    if (hundreds > 0) {
        result += ones[hundreds] + ' hundred';
    }

    const remainder = num % 100;
    if (remainder >= 20) {
        if (result) result += ' ';
        const tenDigit = Math.floor(remainder / 10);
        const oneDigit = remainder % 10;
        result += tens[tenDigit];
        if (oneDigit > 0) {
            result += ' ' + ones[oneDigit];
        }
    } else if (remainder >= 10) {
        if (result) result += ' ';
        result += teens[remainder - 10];
    } else if (remainder > 0) {
        if (result) result += ' ';
        result += ones[remainder];
    }

    return result;
}

// Export all string functions for XPath 3.0
export const STRING_FUNCTIONS_30 = {
    'analyze-string': analyzeString,
    'format-integer': formatInteger,
    'format-number': formatNumber,
};
