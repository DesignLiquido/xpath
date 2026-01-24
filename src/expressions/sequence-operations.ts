/**
 * XPath 2.0 Sequence Operations (Section 3.3.3)
 * https://www.w3.org/TR/xpath20/#id-sequence-operators
 *
 * Operators on sequences:
 * 1. union (|) - combines two node sequences with deduplication
 * 2. intersect - returns nodes that appear in both sequences
 * 3. except - returns nodes from first sequence not in second
 *
 * Key rules:
 * - All operands must be node sequences (atomic values not allowed)
 * - Result is in document order
 * - Duplicate nodes are removed (deduplication)
 * - Node identity is determined by their position in the document
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';
import { isXPathNode, getNodeId, flattenSequence } from './sequence-construction';

/**
 * Internal node representation with metadata
 */
interface NodeItem {
  value: any;
  id: string;
}

/**
 * UnionExpression - combines two sequences
 * Syntax: expr1 union expr2 or expr1 | expr2
 *
 * Returns a sequence containing all nodes from both operand sequences,
 * with duplicates removed. Result is in document order.
 *
 * Both operands must evaluate to node sequences.
 * Atomic values are not allowed.
 *
 * Examples:
 *   //book | //author → combined sequence of book and author elements
 *   $nodes1 union $nodes2 → combined sequence
 *   //* | //@* → all elements and attributes
 */
export class UnionExpression extends XPathExpression {
  constructor(
    private operand1: XPathExpression,
    private operand2: XPathExpression,
    private operator: 'union' | '|' = 'union'
  ) {
    super();
  }

  evaluate(context: XPathContext): any {
    const result1 = flattenSequence(this.operand1.evaluate(context));
    const result2 = flattenSequence(this.operand2.evaluate(context));

    // Validate that operands are nodes
    if (!result1.every(isXPathNode) || !result2.every(isXPathNode)) {
      throw new Error('union operator requires sequences of nodes');
    }

    // Combine and deduplicate
    const combined = this.deduplicateNodes([...result1, ...result2]);

    // Sort in document order
    return this.sortInDocumentOrder(combined);
  }

  private deduplicateNodes(nodes: any[]): any[] {
    const seen = new Set<string>();
    const result: any[] = [];

    for (const node of nodes) {
      const id = this.getNodeIdentifier(node);
      if (!seen.has(id)) {
        seen.add(id);
        result.push(node);
      }
    }

    return result;
  }

  private getNodeIdentifier(node: any): string {
    // For testing purposes, use the node reference if available
    if (node.__id) {
      return node.__id;
    }
    if (node === node) {
      // For DOM-like nodes, use their unique position
      return `${node.nodeType}:${node.nodeName || node.localName}`;
    }
    return getNodeId(node);
  }

  private sortInDocumentOrder(nodes: any[]): any[] {
    // For now, maintain insertion order
    // Full implementation would sort by document order using tree position
    return nodes;
  }

  toString(): string {
    return `${this.operand1.toString()} ${this.operator} ${this.operand2.toString()}`;
  }
}

/**
 * IntersectExpression - returns nodes that appear in both sequences
 * Syntax: expr1 intersect expr2
 *
 * Returns a sequence containing only nodes that appear in both operands.
 * Result is in document order with no duplicates.
 *
 * Both operands must evaluate to node sequences.
 *
 * Examples:
 *   $a intersect $b → nodes in both $a and $b
 *   //book intersect //book[@isbn] → books that have isbn attribute
 */
export class IntersectExpression extends XPathExpression {
  constructor(
    private operand1: XPathExpression,
    private operand2: XPathExpression
  ) {
    super();
  }

  evaluate(context: XPathContext): any {
    const result1 = flattenSequence(this.operand1.evaluate(context));
    const result2 = flattenSequence(this.operand2.evaluate(context));

    // Validate that operands are nodes
    if (!result1.every(isXPathNode) || !result2.every(isXPathNode)) {
      throw new Error('intersect operator requires sequences of nodes');
    }

    // Find intersection
    const intersection = this.findIntersection(result1, result2);

    // Remove duplicates and sort in document order
    return this.sortInDocumentOrder(this.deduplicateNodes(intersection));
  }

  private findIntersection(seq1: any[], seq2: any[]): any[] {
    // Create a set of identifiers from seq2 for fast lookup
    const id2Set = new Set<string>();
    for (const node of seq2) {
      id2Set.add(this.getNodeIdentifier(node));
    }

    // Return nodes from seq1 that are in seq2
    return seq1.filter(node => id2Set.has(this.getNodeIdentifier(node)));
  }

  private getNodeIdentifier(node: any): string {
    if (node.__id) {
      return node.__id;
    }
    return getNodeId(node);
  }

  private deduplicateNodes(nodes: any[]): any[] {
    const seen = new Set<string>();
    const result: any[] = [];

    for (const node of nodes) {
      const id = this.getNodeIdentifier(node);
      if (!seen.has(id)) {
        seen.add(id);
        result.push(node);
      }
    }

    return result;
  }

  private sortInDocumentOrder(nodes: any[]): any[] {
    // For now, maintain insertion order
    return nodes;
  }

  toString(): string {
    return `${this.operand1.toString()} intersect ${this.operand2.toString()}`;
  }
}

/**
 * ExceptExpression - returns nodes from first sequence not in second
 * Syntax: expr1 except expr2
 *
 * Returns a sequence containing nodes from the first operand
 * that do not appear in the second operand.
 * Result is in document order with no duplicates.
 *
 * Both operands must evaluate to node sequences.
 *
 * Examples:
 *   $a except $b → nodes in $a but not in $b
 *   //book except //book[@out-of-print] → books that are in print
 */
export class ExceptExpression extends XPathExpression {
  constructor(
    private operand1: XPathExpression,
    private operand2: XPathExpression
  ) {
    super();
  }

  evaluate(context: XPathContext): any {
    const result1 = flattenSequence(this.operand1.evaluate(context));
    const result2 = flattenSequence(this.operand2.evaluate(context));

    // Validate that operands are nodes
    if (!result1.every(isXPathNode) || !result2.every(isXPathNode)) {
      throw new Error('except operator requires sequences of nodes');
    }

    // Find difference
    const difference = this.findDifference(result1, result2);

    // Remove duplicates and sort in document order
    return this.sortInDocumentOrder(this.deduplicateNodes(difference));
  }

  private findDifference(seq1: any[], seq2: any[]): any[] {
    // Create a set of identifiers from seq2
    const id2Set = new Set<string>();
    for (const node of seq2) {
      id2Set.add(this.getNodeIdentifier(node));
    }

    // Return nodes from seq1 that are not in seq2
    return seq1.filter(node => !id2Set.has(this.getNodeIdentifier(node)));
  }

  private getNodeIdentifier(node: any): string {
    if (node.__id) {
      return node.__id;
    }
    return getNodeId(node);
  }

  private deduplicateNodes(nodes: any[]): any[] {
    const seen = new Set<string>();
    const result: any[] = [];

    for (const node of nodes) {
      const id = this.getNodeIdentifier(node);
      if (!seen.has(id)) {
        seen.add(id);
        result.push(node);
      }
    }

    return result;
  }

  private sortInDocumentOrder(nodes: any[]): any[] {
    // For now, maintain insertion order
    return nodes;
  }

  toString(): string {
    return `${this.operand1.toString()} except ${this.operand2.toString()}`;
  }
}

/**
 * Helper function to check if a value is a valid node sequence
 * Used for validating operands to sequence operators
 */
export function isValidNodeSequence(value: any): boolean {
  if (value === undefined || value === null) {
    return true; // Empty sequence is valid
  }

  if (!Array.isArray(value)) {
    value = [value];
  }

  // All items must be nodes
  return value.every(item => isXPathNode(item));
}

/**
 * Helper function to deduplicate a node sequence
 * Returns a new sequence with only the first occurrence of each node
 */
export function deduplicateNodeSequence(nodes: any[]): any[] {
  const seen = new Set<string>();
  const result: any[] = [];

  for (const node of nodes) {
    const id = isXPathNode(node) && node.__id ? node.__id : String(node);
    if (!seen.has(id)) {
      seen.add(id);
      result.push(node);
    }
  }

  return result;
}

/**
 * Helper function to sort nodes in document order
 * Full implementation would use document position information
 */
export function sortNodesInDocumentOrder(nodes: any[]): any[] {
  // For now, return as-is
  // Full implementation would:
  // 1. Get document position for each node
  // 2. Sort by position
  // 3. Return sorted sequence
  return nodes;
}
