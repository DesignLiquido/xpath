/**
 * String Template Expression
 *
 * Implements XPath 3.0+ string templates with embedded expressions.
 * Syntax: `Hello {$name}, you are {$age} years old`
 *
 * Reference: XPath 3.0 Section 3.7 (String Constructors)
 */

import { XPathExpression } from './expression';
import { XPathContext, XPathResult } from '../context';

/**
 * Represents a string template with embedded expressions.
 * Parts are alternating strings and expressions.
 */
export class StringTemplateExpression implements XPathExpression {
    /**
     * Array of parts: alternating strings and Expression objects
     * Strings are at even indices (0, 2, 4, ...)
     * Expressions are at odd indices (1, 3, 5, ...)
     */
    private parts: (string | XPathExpression)[];

    constructor(parts: (string | XPathExpression)[]) {
        this.parts = parts;
    }

    evaluate(context: XPathContext): XPathResult {
        const result: string[] = [];

        for (const part of this.parts) {
            if (typeof part === 'string') {
                // String part - add as-is
                result.push(part);
            } else {
                // Expression part - evaluate and convert to string
                const value = part.evaluate(context);
                result.push(this.valueToString(value));
            }
        }

        return result.join('');
    }

    /**
     * Convert a value to string for concatenation in template.
     */
    private valueToString(value: XPathResult): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number') {
            // Handle special numbers per XPath spec
            if (Number.isNaN(value)) return 'NaN';
            if (value === Infinity) return 'INF';
            if (value === -Infinity) return '-INF';
            return String(value);
        }

        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }

        if (Array.isArray(value)) {
            // Array: convert first item
            if (value.length === 0) return '';
            return this.valueToString(value[0]);
        }

        // Node or other object
        if (typeof value === 'object' && value !== null) {
            // If it's a node, use its string value
            if ('nodeType' in value && value.nodeType) {
                return this.getNodeStringValue(value);
            }

            // For other objects, use toString if available
            if (typeof value.toString === 'function') {
                const str = value.toString();
                if (str !== '[object Object]') {
                    return str;
                }
            }
        }

        return String(value);
    }

    /**
     * Get string value of a node.
     */
    private getNodeStringValue(node: any): string {
        if (node.textContent !== undefined) {
            return String(node.textContent);
        }

        if (node.nodeType === 3) {
            // TEXT_NODE
            return node.data || node.textContent || '';
        }

        if (node.nodeType === 1 || node.nodeType === 9) {
            // ELEMENT_NODE or DOCUMENT_NODE - concatenate all text descendants
            return this.getDescendantTextContent(node);
        }

        return '';
    }

    /**
     * Get all text content from node and descendants.
     */
    private getDescendantTextContent(node: any): string {
        const parts: string[] = [];

        if ('childNodes' in node && Array.isArray(node.childNodes)) {
            for (const child of node.childNodes) {
                if (child.nodeType === 3) {
                    // TEXT_NODE
                    parts.push(child.textContent ?? child.data ?? '');
                } else if (child.nodeType === 1) {
                    // ELEMENT_NODE
                    parts.push(this.getDescendantTextContent(child));
                }
            }
        }

        return parts.join('');
    }
}

/**
 * Parse a string template and extract parts.
 * Returns array of alternating strings and parsed expression strings (not yet parsed).
 * The actual parsing is deferred to avoid circular dependencies.
 */
export function parseStringTemplate(template: string): (string | { expressionString: string })[] {
    const parts: (string | { expressionString: string })[] = [];
    let current = '';
    let i = 0;

    while (i < template.length) {
        const char = template[i];

        // Check for escape sequences
        if (char === '\\' && i + 1 < template.length) {
            const nextChar = template[i + 1];
            switch (nextChar) {
                case '`':
                    current += '`';
                    i += 2;
                    break;
                case '{':
                    current += '{';
                    i += 2;
                    break;
                case '}':
                    current += '}';
                    i += 2;
                    break;
                case 'n':
                    current += '\n';
                    i += 2;
                    break;
                case 'r':
                    current += '\r';
                    i += 2;
                    break;
                case 't':
                    current += '\t';
                    i += 2;
                    break;
                case '\\':
                    current += '\\';
                    i += 2;
                    break;
                default:
                    // Unknown escape - keep as-is
                    current += char;
                    i++;
            }
        } else if (char === '{' && i + 1 < template.length && template[i + 1] !== '{') {
            // Start of embedded expression
            // Save current string part if not empty
            if (current.length > 0) {
                parts.push(current);
                current = '';
            }

            // Find matching closing brace
            let depth = 1;
            let j = i + 1;
            while (j < template.length && depth > 0) {
                if (template[j] === '{' && template[j - 1] !== '\\') {
                    depth++;
                } else if (template[j] === '}' && template[j - 1] !== '\\') {
                    depth--;
                }
                j++;
            }

            if (depth !== 0) {
                throw new Error('Unclosed expression in string template');
            }

            // Extract expression string (without parsing)
            const exprStr = template.substring(i + 1, j - 1);
            parts.push({ expressionString: exprStr });

            i = j;
        } else {
            current += char;
            i++;
        }
    }

    // Add final string part if not empty
    if (current.length > 0) {
        parts.push(current);
    }

    return parts;
}
