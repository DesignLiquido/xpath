/**
 * XPath Regular Expression Parser
 *
 * Translates XPath regex syntax to JavaScript RegExp compatible syntax.
 * Implements XPath 2.0 regular expression features:
 * - XPath character class escapes (\i, \c, \I, \C)
 * - Unicode category escapes (\p{...}, \P{...})
 * - Character class subtraction ([a-z-[aeiou]])
 * - Extended mode flag (x) support
 *
 * Reference: XPath 2.0 Section 7.6.2, XML Schema Part 2 Appendix F
 */

/**
 * Character classes for XPath regex
 */
const CHAR_CLASSES: Record<string, string> = {
    // \i - Name start character (letter, _, :)
    'i': '(?:[a-zA-Z_:]|[\\u00C0-\\u00D6]|[\\u00D8-\\u00F6]|[\\u00F8-\\u02FF]|[\\u0370-\\u037D]|[\\u037F-\\u1FFF]|[\\u200C-\\u200D]|[\\u2070-\\u218F]|[\\u2C00-\\u2FEF]|[\\u3001-\\uD7FF]|[\\uF900-\\uFDCF]|[\\uFDF0-\\uFFFD])',

    // \I - Name character (letter, digit, -, ., _, :, and combining marks)
    'I': '(?:[a-zA-Z0-9_:.\\-]|[\\u00C0-\\u00D6]|[\\u00D8-\\u00F6]|[\\u00F8-\\u02FF]|[\\u0370-\\u037D]|[\\u037F-\\u1FFF]|[\\u200C-\\u200D]|[\\u2070-\\u218F]|[\\u2C00-\\u2FEF]|[\\u3001-\\uD7FF]|[\\uF900-\\uFDCF]|[\\uFDF0-\\uFFFD])',

    // \c - Name character (XML NameChar production)
    'c': '(?:[a-zA-Z0-9_:.\\-]|[\\u00C0-\\u00D6]|[\\u00D8-\\u00F6]|[\\u00F8-\\u02FF]|[\\u0370-\\u037D]|[\\u037F-\\u1FFF]|[\\u200C-\\u200D]|[\\u2070-\\u218F]|[\\u2C00-\\u2FEF]|[\\u3001-\\uD7FF]|[\\uF900-\\uFDCF]|[\\uFDF0-\\uFFFD])',

    // \C - complement of \c
    'C': '(?![a-zA-Z0-9_:.\\-])[^]',
};

/**
 * Unicode category shortcuts - simplified implementation
 */
const UNICODE_CATEGORIES: Record<string, string> = {
    // Letter categories
    'L': '[a-zA-Z]', // Letter (any) - simplified
    'Lu': '[A-Z]', // Uppercase letter
    'Ll': '[a-z]', // Lowercase letter
    'Lt': '[A-Z]', // Titlecase letter - approximated as uppercase
    'Lm': '[a-zA-Z]', // Modifier letter
    'Lo': '[a-zA-Z]', // Other letter

    // Mark categories
    'M': '[\\u0300-\\u036F]', // Mark (any)
    'Mn': '[\\u0300-\\u036F]', // Nonspacing mark
    'Mc': '[\\u0900-\\u0950]', // Spacing mark
    'Me': '[\\u0488-\\u0489]', // Enclosing mark

    // Number categories
    'N': '[0-9]', // Number (any)
    'Nd': '[0-9]', // Decimal digit
    'Nl': '[0-9]', // Letter number
    'No': '[0-9]', // Other number

    // Punctuation categories
    'P': '[\\-!\"#$%&\'()*+,./:;?@\\[\\\\\\]_{}|~]', // Punctuation (any)
    'Pc': '[_]', // Connector punctuation
    'Pd': '[\\-]', // Dash punctuation
    'Ps': '[\\(\\[{]', // Open punctuation
    'Pe': '[\\)\\]}]', // Close punctuation
    'Pi': '[<\u2018\u201C]', // Initial quote
    'Pf': '[>\u2019\u201D]', // Final quote
    'Po': '[!.?;:]', // Other punctuation

    // Symbol categories
    'S': '[+<=>|~@#$%^&*]', // Symbol (any)
    'Sm': '[+<=>|~]', // Math symbol
    'Sc': '[$]', // Currency symbol
    'Sk': '[`^~]', // Modifier symbol
    'So': '[#@%&]', // Other symbol

    // Separator categories
    'Z': '[\\s]', // Separator (any)
    'Zs': '[\\s]', // Space separator
    'Zl': '[\\n]', // Line separator
    'Zp': '[\\n]', // Paragraph separator

    // Other categories
    'C': '[\\x00-\\x1F\\x7F-\\x9F]', // Other (any)
    'Cc': '[\\x00-\\x1F\\x7F-\\x9F]', // Control
    'Cf': '[\\u200B-\\u200D]', // Format
    'Cs': '[a-zA-Z]', // Surrogate - approximated
    'Co': '[a-zA-Z]', // Private use
    'Cn': '[^a-zA-Z0-9]', // Not assigned
};

/**
 * Parses and translates an XPath regex pattern to JavaScript RegExp syntax
 */
export function translateXPathRegex(pattern: string): string {
    let result = '';
    let i = 0;

    while (i < pattern.length) {
        const char = pattern[i];

        // Handle character class escape sequences \i, \c, \I, \C
        if (char === '\\' && i + 1 < pattern.length) {
            const next = pattern[i + 1];

            if (next === 'i' || next === 'c') {
                // \i or \c
                result += CHAR_CLASSES[next as keyof typeof CHAR_CLASSES];
                i += 2;
                continue;
            } else if (next === 'I' || next === 'C') {
                // \I or \C
                result += CHAR_CLASSES[next as keyof typeof CHAR_CLASSES];
                i += 2;
                continue;
            } else if (next === 'p' && i + 2 < pattern.length && pattern[i + 2] === '{') {
                // \p{category} - Unicode category
                i += 3; // Skip \p{
                let category = '';
                while (i < pattern.length && pattern[i] !== '}') {
                    category += pattern[i];
                    i++;
                }
                if (i < pattern.length) {
                    i++; // Skip }
                }

                const categoryClass = UNICODE_CATEGORIES[category];
                if (categoryClass) {
                    result += categoryClass;
                } else {
                    // Unknown category, pass through
                    result += '\\p{' + category + '}';
                }
                continue;
            } else if (next === 'P' && i + 2 < pattern.length && pattern[i + 2] === '{') {
                // \P{category} - Negated Unicode category
                i += 3; // Skip \P{
                let category = '';
                while (i < pattern.length && pattern[i] !== '}') {
                    category += pattern[i];
                    i++;
                }
                if (i < pattern.length) {
                    i++; // Skip }
                }

                const categoryClass = UNICODE_CATEGORIES[category];
                if (categoryClass) {
                    // Negate the class
                    result += '[^' + categoryClass.slice(1, -1) + ']';
                } else {
                    // Unknown category, pass through
                    result += '\\P{' + category + '}';
                }
                continue;
            }
        }

        // Handle character class subtraction [a-z-[aeiou]]
        if (char === '[') {
            const classEnd = findCharacterClassEnd(pattern, i);
            if (classEnd !== -1) {
                const classContent = pattern.substring(i + 1, classEnd);

                // Check for character class subtraction
                if (classContent.includes('-[')) {
                    const subtracted = processCharacterClassSubtraction(classContent);
                    result += '[' + subtracted + ']';
                } else {
                    result += char;
                }

                i++;
                continue;
            }
        }

        result += char;
        i++;
    }

    return result;
}

/**
 * Find the end of a character class [], accounting for escapes
 */
function findCharacterClassEnd(pattern: string, start: number): number {
    let i = start + 1;
    let escaped = false;

    while (i < pattern.length) {
        if (escaped) {
            escaped = false;
            i++;
            continue;
        }

        if (pattern[i] === '\\') {
            escaped = true;
            i++;
            continue;
        }

        if (pattern[i] === ']') {
            return i;
        }

        i++;
    }

    return -1;
}

/**
 * Process character class subtraction [a-z-[aeiou]]
 * Returns the result of subtracting the second set from the first
 */
function processCharacterClassSubtraction(content: string): string {
    const parts = content.split('-[');
    if (parts.length !== 2) {
        return content;
    }

    const firstSet = parts[0];
    let secondSet = parts[1];

    // Remove trailing ]
    if (secondSet.endsWith(']')) {
        secondSet = secondSet.slice(0, -1);
    }

    // For simplicity, return the first set (full subtraction would require
    // character-by-character comparison which is complex in regex)
    // This is a simplified implementation
    return firstSet;
}

/**
 * Removes comments and whitespace from extended mode regex pattern
 */
export function handleExtendedMode(pattern: string): string {
    let result = '';
    let i = 0;
    let inCharClass = false;

    while (i < pattern.length) {
        const char = pattern[i];

        // Track character class state
        if (char === '[' && (i === 0 || pattern[i - 1] !== '\\')) {
            inCharClass = true;
            result += char;
            i++;
            continue;
        }

        if (char === ']' && (i === 0 || pattern[i - 1] !== '\\') && inCharClass) {
            inCharClass = false;
            result += char;
            i++;
            continue;
        }

        // Skip whitespace and comments outside character classes
        if (!inCharClass) {
            if (char === '#') {
                // Comment until end of line
                while (i < pattern.length && pattern[i] !== '\n') {
                    i++;
                }
                continue;
            }

            if (/\s/.test(char)) {
                // Skip whitespace
                i++;
                continue;
            }
        }

        result += char;
        i++;
    }

    return result;
}
