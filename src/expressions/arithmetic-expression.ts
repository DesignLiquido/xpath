/**
 * XPath 2.0 Arithmetic Expressions (Section 3.4)
 * https://www.w3.org/TR/xpath20/#id-arithmetic
 *
 * Arithmetic operators work on numeric values:
 * 1. Binary operators: `+`, `-`, `*`, `div`, `idiv`, `mod`
 * 2. Unary operators: `+expr`, `-expr`
 *
 * Type promotion rules:
 * - Operands are atomized
 * - Atomic values are promoted to numeric types
 * - If operand is empty sequence, result is empty sequence (in 2.0 mode)
 * - In XPath 1.0 mode, empty sequence converts to NaN, then double
 *
 * Division by zero:
 * - `div` returns INF or -INF
 * - `idiv` raises XPDY0002 error
 * - `mod` by 0 raises XPDY0002 error
 */

import { XPathContext } from '../context';
import { XPathExpression } from './expression';

export type ArithmeticOperator = '+' | '-' | '*' | 'div' | 'idiv' | 'mod';

/**
 * ArithmeticExpression - Binary arithmetic operations
 *
 * Syntax:
 *   expr1 + expr2       // addition
 *   expr1 - expr2       // subtraction
 *   expr1 * expr2       // multiplication
 *   expr1 div expr2     // division
 *   expr1 idiv expr2    // integer division
 *   expr1 mod expr2     // modulo
 *
 * Examples:
 *   5 + 3 → 8
 *   10 div 3 → 3.3333...
 *   10 idiv 3 → 3
 *   10 mod 3 → 1
 *   "5" + 3 → 8 (string promoted to number)
 *   () + 5 → () (empty sequence in XPath 2.0)
 */
export class XPathArithmeticExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;
    operator: ArithmeticOperator;

    constructor(left: XPathExpression, right: XPathExpression, operator: ArithmeticOperator) {
        super();
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    evaluate(context: XPathContext): number | null {
        // Evaluate both operands
        const leftValue = this.left.evaluate(context);
        const rightValue = this.right.evaluate(context);

        // Atomize operands (extract atomic values from sequences)
        const leftAtomic = this.atomize(leftValue);
        const rightAtomic = this.atomize(rightValue);

        // In XPath 2.0, empty sequence returns empty sequence (null)
        if (leftAtomic === null || rightAtomic === null) {
            return null;
        }

        // Convert to numbers
        const leftNum = this.toNumber(leftAtomic);
        const rightNum = this.toNumber(rightAtomic);

        // Perform operation
        switch (this.operator) {
            case '+':
                return leftNum + rightNum;
            case '-':
                return leftNum - rightNum;
            case '*':
                return leftNum * rightNum;
            case 'div':
                return leftNum / rightNum; // Allows Infinity
            case 'idiv':
                if (rightNum === 0) {
                    throw new Error('XPDY0002: Integer division by zero');
                }
                return Math.trunc(leftNum / rightNum);
            case 'mod':
                if (rightNum === 0) {
                    throw new Error('XPDY0002: Modulo by zero');
                }
                // XPath mod: a mod b = a - (a idiv b) * b
                return leftNum - Math.trunc(leftNum / rightNum) * rightNum;
            default:
                throw new Error(`Unknown arithmetic operator: ${this.operator}`);
        }
    }

    /**
     * Atomize value - extract atomic values from sequences
     * Returns first atomic value or null for empty sequence
     */
    private atomize(value: any): any {
        if (value === null || value === undefined) {
            return null;
        }

        // Handle NodeValue objects from XSLT context (StringValue, NumberValue, etc.)
        if (typeof value === 'object' && 'numberValue' in value && typeof value.numberValue === 'function') {
            return value.numberValue();
        }

        // Single atomic value
        if (!Array.isArray(value)) {
            return value;
        }

        // Array (sequence)
        if (value.length === 0) {
            return null; // Empty sequence
        }

        // Multiple items - use first (recursive to handle nested NodeValue)
        return this.atomize(value[0]);
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
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}
