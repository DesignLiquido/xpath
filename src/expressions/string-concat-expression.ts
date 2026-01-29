/**
 * XPath 3.0 String Concatenation Operator (||) (Section 3.7.1)
 *
 * Syntax: expr1 || expr2
 *
 * The string concatenation operator atomizes both operands,
 * converts them to strings, and concatenates them.
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-concat
 */

import { XPathContext, XPathResult } from '../context';
import { XPathExpression } from './expression';

/**
 * XPath 3.0 String Concatenation Expression (||)
 *
 * Examples:
 *   "Hello" || " " || "World"    → "Hello World"
 *   "Value: " || 42              → "Value: 42"
 *   "Items: " || count($items)   → "Items: 5"
 *   () || "text"                 → "text" (empty sequence converts to "")
 */
export class XPathStringConcatExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;

    constructor(left: XPathExpression, right: XPathExpression) {
        super();
        this.left = left;
        this.right = right;
    }

    evaluate(context: XPathContext): string {
        // Evaluate both operands
        const leftValue = this.left.evaluate(context);
        const rightValue = this.right.evaluate(context);

        // Atomize and convert to strings
        const leftStr = this.atomizeToString(leftValue);
        const rightStr = this.atomizeToString(rightValue);

        // Concatenate
        return leftStr + rightStr;
    }

    /**
     * Atomize a value and convert to string.
     * Empty sequence becomes empty string.
     */
    private atomizeToString(value: XPathResult): string {
        // Empty sequence
        if (value === null || value === undefined) {
            return '';
        }

        // Handle NodeValue objects from XSLT context (StringValue, NumberValue, etc.)
        if (typeof value === 'object' && 'stringValue' in value && typeof (value as any).stringValue === 'function') {
            return (value as any).stringValue();
        }

        // Array (sequence)
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '';
            }
            // For sequences with multiple items, concatenate their string values with space
            // Actually in XPath 3.0, atomization of a sequence of >1 item is an error for ||
            // But for practical purposes, we'll take the first item
            return this.valueToString(value[0]);
        }

        return this.valueToString(value);
    }

    /**
     * Convert a single value to string.
     */
    private valueToString(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        // Handle NodeValue objects from XSLT context (StringValue, NumberValue, etc.)
        if (typeof value === 'object' && 'stringValue' in value && typeof value.stringValue === 'function') {
            return value.stringValue();
        }

        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number') {
            // Handle special numeric values
            if (Number.isNaN(value)) return 'NaN';
            if (value === Infinity) return 'INF';
            if (value === -Infinity) return '-INF';
            // Remove trailing zeros after decimal point
            return String(value);
        }

        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }

        // Node - get string value
        if (this.isNode(value)) {
            return this.getNodeStringValue(value);
        }

        // Default: convert to string
        return String(value);
    }

    /**
     * Check if a value is a DOM node.
     */
    private isNode(value: any): boolean {
        return value && typeof value === 'object' && 'nodeType' in value;
    }

    /**
     * Get the string value of a node.
     */
    private getNodeStringValue(node: any): string {
        if (!node) return '';

        // Text or CDATA node
        if (node.nodeType === 3 || node.nodeType === 4) {
            return node.nodeValue || '';
        }

        // Attribute node
        if (node.nodeType === 2) {
            return node.value || node.nodeValue || '';
        }

        // Element or document node - concatenate all text content
        if (node.nodeType === 1 || node.nodeType === 9) {
            return node.textContent || '';
        }

        // Comment or processing instruction
        if (node.nodeType === 7 || node.nodeType === 8) {
            return node.nodeValue || '';
        }

        return '';
    }

    toString(): string {
        return `${this.left} || ${this.right}`;
    }
}
