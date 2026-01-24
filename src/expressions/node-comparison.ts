/**
 * XPath 2.0 Node Comparisons (Section 3.5.3)
 * https://www.w3.org/TR/xpath20/#id-node-comparisons
 *
 * Node comparisons use special operators that work on nodes:
 * 1. `is` - tests node identity (same node)
 * 2. `<<` - tests document order (left node comes before right)
 * 3. `>>` - tests document order (left node comes after right)
 *
 * These operators:
 * - Work only on nodes
 * - Return boolean results
 * - Use object identity for node comparison
 * - Are not available in XPath 1.0
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';

export type NodeComparisonOperator = 'is' | '<<' | '>>';

/**
 * NodeComparisonExpression - XPath 2.0 node comparison
 *
 * Syntax:
 *   expr1 is expr2          // node identity
 *   expr1 << expr2          // document order (left before right)
 *   expr1 >> expr2          // document order (left after right)
 *
 * Examples:
 *   $node1 is $node2 → true if same node
 *   $a << $b → true if $a comes before $b in document
 *   $a >> $b → true if $a comes after $b in document
 */
export class NodeComparisonExpression extends XPathExpression {
  constructor(
    private left: XPathExpression,
    private operator: NodeComparisonOperator,
    private right: XPathExpression
  ) {
    super();
  }

  evaluate(context: XPathContext): boolean {
    // Evaluate both operands
    const leftValue = this.left.evaluate(context);
    const rightValue = this.right.evaluate(context);

    // Extract single nodes from sequences
    const leftNode = this.extractNode(leftValue);
    const rightNode = this.extractNode(rightValue);

    // Both must be nodes
    if (!this.isNode(leftNode) || !this.isNode(rightNode)) {
      throw new Error('Node comparison requires node operands');
    }

    // Perform comparison based on operator
    switch (this.operator) {
      case 'is':
        return this.isIdentical(leftNode, rightNode);
      case '<<':
        return this.isDocumentOrderBefore(leftNode, rightNode);
      case '>>':
        return this.isDocumentOrderAfter(leftNode, rightNode);
      default:
        throw new Error(`Unknown node comparison operator: ${this.operator}`);
    }
  }

  /**
   * Extract single node from a value
   */
  private extractNode(value: any): any {
    if (value === undefined || value === null) {
      return undefined;
    }

    // Single node
    if (this.isNode(value)) {
      return value;
    }

    // Array of nodes
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return undefined;
      }
      if (value.length === 1) {
        return value[0];
      }
      // Multiple nodes - use first
      return value[0];
    }

    return undefined;
  }

  /**
   * Check if two nodes are identical (same object)
   */
  private isIdentical(left: any, right: any): boolean {
    // If both have __id, use that
    if (left.__id !== undefined && right.__id !== undefined) {
      return left.__id === right.__id;
    }

    // Otherwise use object identity
    return left === right;
  }

  /**
   * Check if left node comes before right node in document order
   */
  private isDocumentOrderBefore(left: any, right: any): boolean {
    // Try to determine document order
    const leftPos = this.getDocumentPosition(left);
    const rightPos = this.getDocumentPosition(right);

    if (leftPos !== -1 && rightPos !== -1) {
      return leftPos < rightPos;
    }

    // Fallback: use depth-first traversal comparison
    return this.compareDocumentOrder(left, right) < 0;
  }

  /**
   * Check if left node comes after right node in document order
   */
  private isDocumentOrderAfter(left: any, right: any): boolean {
    // Try to determine document order
    const leftPos = this.getDocumentPosition(left);
    const rightPos = this.getDocumentPosition(right);

    if (leftPos !== -1 && rightPos !== -1) {
      return leftPos > rightPos;
    }

    // Fallback: use depth-first traversal comparison
    return this.compareDocumentOrder(left, right) > 0;
  }

  /**
   * Get document position if available (optional optimization)
   */
  private getDocumentPosition(node: any): number {
    if (node.__documentPosition !== undefined) {
      return node.__documentPosition;
    }
    return -1; // Not available
  }

  /**
   * Compare nodes by walking up to ancestors and comparing positions
   * Returns: -1 if left before right, 0 if same, 1 if left after right
   */
  private compareDocumentOrder(left: any, right: any): number {
    // If same node, they're not in document order relative to each other
    if (left === right) {
      return 0;
    }

    // Get ancestors for both nodes
    const leftAncestors = this.getAncestors(left);
    const rightAncestors = this.getAncestors(right);

    // Find common ancestor
    let i = 0;
    while (i < leftAncestors.length && i < rightAncestors.length && leftAncestors[i] === rightAncestors[i]) {
      i++;
    }

    // If one is ancestor of the other
    if (i === leftAncestors.length) {
      // left is ancestor of right (comes before)
      return -1;
    }
    if (i === rightAncestors.length) {
      // right is ancestor of left (left comes after)
      return 1;
    }

    // Compare children of common ancestor
    const leftChild = leftAncestors[i];
    const rightChild = rightAncestors[i];

    const leftPosition = this.getChildPosition(leftChild);
    const rightPosition = this.getChildPosition(rightChild);

    if (leftPosition < rightPosition) {
      return -1;
    } else if (leftPosition > rightPosition) {
      return 1;
    }

    return 0;
  }

  /**
   * Get ancestors of a node (from root to node)
   */
  private getAncestors(node: any): any[] {
    const ancestors: any[] = [node];
    let current = node;

    while (current && current.parentNode) {
      current = current.parentNode;
      ancestors.unshift(current);
    }

    return ancestors;
  }

  /**
   * Get position of a node among its siblings
   */
  private getChildPosition(node: any): number {
    if (!node.parentNode) {
      return 0;
    }

    const parent = node.parentNode;
    const children = parent.childNodes || [];

    for (let i = 0; i < children.length; i++) {
      if (children[i] === node) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Check if value is a node
   */
  private isNode(value: any): boolean {
    return value && typeof value === 'object' && ('nodeType' in value || 'nodeName' in value);
  }

  toString(): string {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
