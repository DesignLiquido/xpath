/**
 * XPath 2.0 Value Comparisons (Section 3.5.1)
 * https://www.w3.org/TR/xpath20/#id-value-comparisons
 *
 * Value comparisons use special operators (eq, ne, lt, le, gt, ge) that:
 * 1. Atomize both operands
 * 2. Work on single atomic values
 * 3. Raise an error on empty sequences or multiple items
 * 4. Perform type checking and conversions
 * 5. Return boolean results
 *
 * Key differences from general comparisons:
 * - Must have exactly one atomic value on each side
 * - Empty sequence raises an error
 * - Type promotion may be applied
 * - Not compatible with XPath 1.0
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';

export type ValueComparisonOperator = 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge';

/**
 * ValueComparisonExpression - XPath 2.0 value comparison
 *
 * Syntax: expr1 eq expr2 | expr1 ne expr2 | expr1 lt expr2 | expr1 le expr2 | expr1 gt expr2 | expr1 ge expr2
 *
 * Examples:
 *   5 eq 5 → true
 *   "a" ne "b" → true
 *   10 lt 20 → true
 *   3.14 ge 3 → true
 */
export class ValueComparisonExpression extends XPathExpression {
  constructor(
    private left: XPathExpression,
    private operator: ValueComparisonOperator,
    private right: XPathExpression
  ) {
    super();
  }

  evaluate(context: XPathContext): boolean {
    // Evaluate both operands
    const leftValue = this.left.evaluate(context);
    const rightValue = this.right.evaluate(context);

    // Atomize operands
    const leftAtom = this.atomize(leftValue);
    const rightAtom = this.atomize(rightValue);

    // Both must be single values (error on empty or multiple)
    if (leftAtom === undefined || rightAtom === undefined) {
      throw new Error('Value comparison requires non-empty sequences');
    }

    // Perform comparison based on operator
    return this.compare(leftAtom, rightAtom, this.operator);
  }

  /**
   * Atomize a value - convert to single atomic value
   */
  private atomize(value: any): any {
    if (value === undefined || value === null) {
      return undefined;
    }

    // If array, must have exactly one item
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return undefined;
      }
      if (value.length === 1) {
        return value[0];
      }
      // Multiple items - error
      throw new Error('Value comparison requires single atomic values');
    }

    // If node, extract typed value
    if (this.isNode(value)) {
      // For nodes, extract string value
      return this.getNodeStringValue(value);
    }

    return value;
  }

  /**
   * Compare two atomic values
   */
  private compare(left: any, right: any, operator: ValueComparisonOperator): boolean {
    // Perform type promotion and conversion
    const [promotedLeft, promotedRight] = this.promoteTypes(left, right);

    // Compare based on operator
    switch (operator) {
      case 'eq':
        return this.equal(promotedLeft, promotedRight);
      case 'ne':
        return !this.equal(promotedLeft, promotedRight);
      case 'lt':
        return this.lessThan(promotedLeft, promotedRight);
      case 'le':
        return this.lessThan(promotedLeft, promotedRight) || this.equal(promotedLeft, promotedRight);
      case 'gt':
        return this.greaterThan(promotedLeft, promotedRight);
      case 'ge':
        return this.greaterThan(promotedLeft, promotedRight) || this.equal(promotedLeft, promotedRight);
      default:
        throw new Error(`Unknown comparison operator: ${operator}`);
    }
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
      // Handle NaN comparison
      if (isNaN(left) && isNaN(right)) {
        return false; // NaN != NaN in XPath
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
