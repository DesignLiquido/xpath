/**
 * XPath 2.0 Unary Expressions (Section 3.4)
 * https://www.w3.org/TR/xpath20/#id-arithmetic
 *
 * Unary arithmetic operators:
 * - `+expr` - converts operand to number (identity)
 * - `-expr` - numeric negation
 *
 * Type promotion rules:
 * - Operand is atomized
 * - Atomic value is promoted to numeric type
 * - Empty sequence returns empty sequence
 */

import { XPathContext } from '../context';
import { XPathExpression } from './expression';

/**
 * UnaryExpression - Unary plus and minus operations
 *
 * Syntax:
 *   +expr           // unary plus (converts to number)
 *   -expr           // unary negation
 *
 * Examples:
 *   +5 → 5
 *   +"5" → 5
 *   -10 → -10
 *   -"5" → -5
 *   +() → () (empty sequence)
 */
export class XPathUnaryExpression extends XPathExpression {
    operator: '+' | '-';
    operand: XPathExpression;

    constructor(operator: '+' | '-', operand: XPathExpression) {
        super();
        this.operator = operator;
        this.operand = operand;
    }

    evaluate(context: XPathContext): number | null {
        const value = this.operand.evaluate(context);

        // Atomize operand
        const atomic = this.atomize(value);

        // Empty sequence returns empty sequence
        if (atomic === null) {
            return null;
        }

        // Convert to number
        const num = this.toNumber(atomic);

        // Apply operator
        if (this.operator === '+') {
            return num;
        } else {
            return -num;
        }
    }

    /**
     * Atomize value - extract atomic values from sequences
     */
    private atomize(value: any): any {
        if (value === null || value === undefined) {
            return null;
        }

        // Single atomic value
        if (!Array.isArray(value)) {
            return value;
        }

        // Array (sequence)
        if (value.length === 0) {
            return null; // Empty sequence
        }

        // Multiple items - use first
        return value[0];
    }

    /**
     * Convert atomic value to number following XPath 2.0 rules
     */
    private toNumber(value: any): number {
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') return NaN;
            const num = Number(trimmed);
            return num;
        }
        // For other types, try generic conversion
        return Number(value);
    }

    toString(): string {
        return `${this.operator}${this.operand.toString()}`;
    }
}
