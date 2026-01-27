/**
 * XPath 2.0 General Comparisons (Section 3.5.2)
 * https://www.w3.org/TR/xpath20/#id-general-comparisons
 *
 * General comparisons use standard operators (=, !=, <, <=, >, >=) that:
 * 1. Work on sequences (not just single values)
 * 2. Use existential quantification
 * 3. Flatten sequences
 * 4. Work with XPath 1.0 compatibility mode
 * 5. Return boolean results
 *
 * Key differences from value comparisons:
 * - Can work with sequences and multiple items
 * - Uses existential semantics (there exists one pair that matches)
 * - Empty sequences are allowed
 * - XPath 1.0 compatible
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';

export type GeneralComparisonOperator = '=' | '!=' | '<' | '<=' | '>' | '>=';

/**
 * GeneralComparisonExpression - XPath 2.0 general comparison with sequences
 *
 * Syntax: expr1 = expr2 | expr1 != expr2 | expr1 < expr2 | expr1 <= expr2 | expr1 > expr2 | expr1 >= expr2
 *
 * Semantics: Returns true if there exists at least one pair of values (one from each operand)
 * where the comparison is true.
 *
 * Examples:
 *   (1, 2, 3) = 2 → true (2 = 2)
 *   (1, 2) < 5 → true (1 < 5 and 2 < 5)
 *   (4, 5) = (5, 6) → true (5 = 5)
 */
export class GeneralComparisonExpression extends XPathExpression {
    constructor(
        private left: XPathExpression,
        private operator: GeneralComparisonOperator,
        private right: XPathExpression
    ) {
        super();
    }

    evaluate(context: XPathContext): boolean {
        // Evaluate both operands
        let leftValue = this.left.evaluate(context);
        let rightValue = this.right.evaluate(context);

        // Flatten sequences
        const leftItems = this.flatten(leftValue);
        const rightItems = this.flatten(rightValue);

        // Empty sequences are false
        if (leftItems.length === 0 || rightItems.length === 0) {
            return false;
        }

        // Use existential quantification
        // Return true if at least one pair satisfies the condition
        for (const left of leftItems) {
            for (const right of rightItems) {
                if (this.compareValues(left, right, this.operator)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Flatten a value into an array
     */
    private flatten(value: any): any[] {
        if (value === undefined || value === null) {
            return [];
        }

        if (Array.isArray(value)) {
            const result: any[] = [];
            for (const item of value) {
                if (item !== undefined && item !== null) {
                    result.push(item);
                }
            }
            return result;
        }

        return [value];
    }

    /**
     * Compare two values from the existential quantification
     */
    private compareValues(left: any, right: any, operator: GeneralComparisonOperator): boolean {
        // Get comparable values (atomize/extract if needed)
        const leftVal = this.getComparableValue(left);
        const rightVal = this.getComparableValue(right);

        // Perform type promotion
        const [promotedLeft, promotedRight] = this.promoteTypes(leftVal, rightVal);

        // Compare based on operator
        switch (operator) {
            case '=':
                return this.equal(promotedLeft, promotedRight);
            case '!=':
                return !this.equal(promotedLeft, promotedRight);
            case '<':
                return this.lessThan(promotedLeft, promotedRight);
            case '<=':
                return (
                    this.lessThan(promotedLeft, promotedRight) ||
                    this.equal(promotedLeft, promotedRight)
                );
            case '>':
                return this.greaterThan(promotedLeft, promotedRight);
            case '>=':
                return (
                    this.greaterThan(promotedLeft, promotedRight) ||
                    this.equal(promotedLeft, promotedRight)
                );
            default:
                throw new Error(`Unknown comparison operator: ${operator}`);
        }
    }

    /**
     * Get comparable value (extract from nodes if needed)
     */
    private getComparableValue(value: any): any {
        if (value === undefined || value === null) {
            return undefined;
        }

        // If node, extract string value
        if (this.isNode(value)) {
            return this.getNodeStringValue(value);
        }

        return value;
    }

    /**
     * Promote types to common type for comparison
     */
    private promoteTypes(left: any, right: any): [any, any] {
        // If both are numbers, use numeric comparison
        if (typeof left === 'number' && typeof right === 'number') {
            return [left, right];
        }

        // If either is a number, convert the other to number
        if (typeof left === 'number') {
            return [left, this.toNumber(right)];
        }
        if (typeof right === 'number') {
            return [this.toNumber(left), right];
        }

        // If both are strings, use string comparison
        if (typeof left === 'string' && typeof right === 'string') {
            return [left, right];
        }

        // If either is a string, convert to string
        if (typeof left === 'string') {
            return [left, this.valueToString(right)];
        }
        if (typeof right === 'string') {
            return [this.valueToString(left), right];
        }

        // Boolean comparisons
        if (typeof left === 'boolean' || typeof right === 'boolean') {
            return [this.toBoolean(left), this.toBoolean(right)];
        }

        return [left, right];
    }

    /**
     * Check equality of two values
     */
    private equal(left: any, right: any): boolean {
        if (typeof left !== typeof right) {
            return false;
        }

        if (typeof left === 'number') {
            // Handle NaN comparison - NaN != NaN
            if (isNaN(left) && isNaN(right)) {
                return false;
            }
            return left === right;
        }

        return left === right;
    }

    /**
     * Check if left < right
     */
    private lessThan(left: any, right: any): boolean {
        if (typeof left === 'number' && typeof right === 'number') {
            return left < right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
            return left < right;
        }
        throw new Error(`Cannot compare ${typeof left} with ${typeof right}`);
    }

    /**
     * Check if left > right
     */
    private greaterThan(left: any, right: any): boolean {
        if (typeof left === 'number' && typeof right === 'number') {
            return left > right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
            return left > right;
        }
        throw new Error(`Cannot compare ${typeof left} with ${typeof right}`);
    }

    /**
     * Convert value to number
     */
    private toNumber(value: any): number {
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? NaN : num;
        }
        return NaN;
    }

    /**
     * Convert value to string
     */
    private valueToString(value: any): string {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (this.isNode(value)) return this.getNodeStringValue(value);
        return String(value);
    }

    /**
     * Convert value to boolean
     */
    private toBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
    }

    /**
     * Check if value is a node
     */
    private isNode(value: any): boolean {
        return value && typeof value === 'object' && ('nodeType' in value || 'nodeName' in value);
    }

    /**
     * Get string value of a node
     */
    private getNodeStringValue(node: any): string {
        if (node.textContent !== undefined) return String(node.textContent);
        if (node.nodeValue !== undefined) return String(node.nodeValue);
        if (node.value !== undefined) return String(node.value);
        return '';
    }

    toString(): string {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}
