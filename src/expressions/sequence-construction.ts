/**
 * XPath 2.0 Sequence Construction (Section 3.3.1)
 * https://www.w3.org/TR/xpath20/#construct
 *
 * Sequence construction creates sequences using:
 * 1. Comma operator: concatenates operand sequences into a single sequence
 * 2. Range expressions: creates sequences of integers (e.g., 1 to 10)
 * 3. Parenthesized expressions: groups sequences
 * 4. Empty sequence: represents the absence of a value
 *
 * Key rules:
 * - Sequences are automatically flattened (no nested sequences)
 * - Comma has lowest precedence
 * - Range expressions require integers
 * - Empty sequence has zero length
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';

/**
 * CommaExpression - concatenates sequences
 * Syntax: expr1 , expr2 , ...
 *
 * The comma operator has the lowest precedence and concatenates
 * all operand sequences into a single flat sequence.
 *
 * Example:
 *   1, 2, 3 → (1, 2, 3)
 *   (1 to 3), (5 to 7) → (1, 2, 3, 5, 6, 7)
 *   $x, $y, $z → concatenated sequence of all three variables
 */
export class CommaExpression extends XPathExpression {
  constructor(
    private operands: XPathExpression[]
  ) {
    super();
    if (operands.length < 2) {
      throw new Error('CommaExpression requires at least 2 operands');
    }
  }

  evaluate(context: XPathContext): any {
    // Concatenate all operand results into a single sequence
    const result: any[] = [];

    for (const operand of this.operands) {
      const value = operand.evaluate(context);

      // Flatten sequences
      if (Array.isArray(value)) {
        result.push(...value);
      } else if (value !== undefined && value !== null) {
        result.push(value);
      }
      // null/undefined are not added to the sequence
    }

    // Return the flattened sequence
    return result.length > 0 ? result : [];
  }

  getOperands(): XPathExpression[] {
    return this.operands;
  }

  toString(): string {
    return this.operands.map(op => op.toString()).join(', ');
  }
}

/**
 * RangeExpression - creates a sequence of consecutive integers
 * Syntax: expr1 to expr2
 *
 * Both operands must evaluate to single integers.
 * Creates a sequence from expr1 to expr2 (inclusive).
 * If expr1 > expr2, the result is an empty sequence.
 *
 * Examples:
 *   1 to 5 → (1, 2, 3, 4, 5)
 *   5 to 1 → () empty sequence
 *   1 to 1 → (1)
 *   -2 to 2 → (-2, -1, 0, 1, 2)
 */
export class RangeExpression extends XPathExpression {
  constructor(
    private startExpr: XPathExpression,
    private endExpr: XPathExpression
  ) {
    super();
  }

  evaluate(context: XPathContext): any {
    // Evaluate both operands
    const startValue = this.startExpr.evaluate(context);
    const endValue = this.endExpr.evaluate(context);

    // Convert to single values (atomization)
    let start: number;
    let end: number;

    try {
      // Handle arrays/sequences - take first item
      const startItem = Array.isArray(startValue) ? startValue[0] : startValue;
      const endItem = Array.isArray(endValue) ? endValue[0] : endValue;

      start = this.toInteger(startItem);
      end = this.toInteger(endItem);
    } catch (e) {
      throw new Error(
        `Range expression operands must be integers: ${String(e)}`
      );
    }

    // Create the range
    if (start > end) {
      return []; // Empty sequence
    }

    const result: number[] = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }

  private toInteger(value: any): number {
    if (typeof value === 'number') {
      // Truncate to integer
      return Math.trunc(value);
    }

    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        throw new Error(`Cannot convert "${value}" to integer`);
      }
      return num;
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    throw new Error(`Cannot convert ${typeof value} to integer`);
  }

  toString(): string {
    return `${this.startExpr.toString()} to ${this.endExpr.toString()}`;
  }
}

/**
 * EmptySequenceExpression - represents the empty sequence
 * Syntax: empty-sequence()
 *
 * The empty sequence has zero length and represents the absence of a value.
 * It's used in contexts where a sequence is required but no value is available.
 * It's different from null/undefined - it's an explicit empty sequence type.
 *
 * Example:
 *   empty-sequence() → ()
 */
export class EmptySequenceExpression extends XPathExpression {
  evaluate(context: XPathContext): any {
    // Return empty array representing the empty sequence
    return [];
  }

  toString(): string {
    return 'empty-sequence()';
  }
}

/**
 * ParenthesizedExpression - groups an expression
 * Syntax: ( expr )
 *
 * Parentheses are used to override operator precedence.
 * A parenthesized expression returns the value of its operand.
 *
 * Example:
 *   (1 to 3) → (1, 2, 3)
 *   (1 + 2) * 3 → 9
 *   (1, 2), (3, 4) → (1, 2, 3, 4)
 */
export class ParenthesizedExpression extends XPathExpression {
  constructor(
    private operand: XPathExpression
  ) {
    super();
  }

  evaluate(context: XPathContext): any {
    return this.operand.evaluate(context);
  }

  getOperand(): XPathExpression {
    return this.operand;
  }

  toString(): string {
    return `(${this.operand.toString()})`;
  }
}

/**
 * Sequence - represents a value that could be empty, single, or multiple items
 * Used internally for sequence operations
 */
export interface Sequence {
  /**
   * The items in the sequence
   */
  items: any[];

  /**
   * Check if sequence is empty
   */
  isEmpty(): boolean;

  /**
   * Get first item, or undefined if empty
   */
  first(): any | undefined;

  /**
   * Get last item, or undefined if empty
   */
  last(): any | undefined;

  /**
   * Get length of sequence
   */
  length(): number;
}

/**
 * Helper function to create a sequence from any value
 */
export function createSequence(value: any): Sequence {
  let items: any[];

  if (value === undefined || value === null) {
    items = [];
  } else if (Array.isArray(value)) {
    items = value;
  } else {
    items = [value];
  }

  return {
    items,
    isEmpty: () => items.length === 0,
    first: () => items[0],
    last: () => items[items.length - 1],
    length: () => items.length
  };
}

/**
 * Helper function to flatten nested sequences
 * XPath 2.0 sequences are always flat (no nested arrays)
 */
export function flattenSequence(value: any): any[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

/**
 * Helper function to concatenate sequences
 */
export function concatenateSequences(...sequences: any[]): any[] {
  const result: any[] = [];

  for (const seq of sequences) {
    if (Array.isArray(seq)) {
      result.push(...seq);
    } else if (seq !== undefined && seq !== null) {
      result.push(seq);
    }
  }

  return result;
}

/**
 * Helper function to check if a value is a node
 * Used for node operations (union, intersect, except)
 */
export function isXPathNode(value: any): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Check for node-like properties
  return (
    typeof value.nodeType === 'string' ||
    typeof value.nodeName === 'string' ||
    typeof value.textContent === 'string'
  );
}

/**
 * Helper function to get a unique identifier for a node
 * Used for deduplication in union/intersect/except
 */
export function getNodeId(node: any): string {
  if (!isXPathNode(node)) {
    return String(node);
  }

  // Use nodeType + nodeName + position for unique identification
  return `${node.nodeType}:${node.nodeName || node.localName || ''}:${node.__id || ''}`;
}
