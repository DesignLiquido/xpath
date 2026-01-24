/**
 * XPath 2.0 SequenceType System (Section 2.5.3)
 * 
 * A SequenceType specifies:
 * 1. ItemType - what kinds of items are allowed
 * 2. OccurrenceIndicator - how many items are expected
 * 
 * Syntax: ItemType OccurrenceIndicator?
 * Examples:
 *   - item() ? - zero or one item
 *   - xs:integer * - zero or more integers
 *   - element(name) + - one or more elements with local name "name"
 *   - attribute(*, xs:ID) - attribute with any name and xs:ID type
 *   - empty-sequence() - no items (special case)
 */

import { AtomicType } from './base';

/**
 * OccurrenceIndicator specifies cardinality of items in a sequence
 */
export enum OccurrenceIndicator {
  /**
   * Exactly one item (no indicator)
   * Cardinality: exactly 1
   */
  EXACTLY_ONE = 'ONE',

  /**
   * Zero or one item (?)
   * Cardinality: 0 or 1
   */
  ZERO_OR_ONE = '?',

  /**
   * Zero or more items (*)
   * Cardinality: 0 or more
   */
  ZERO_OR_MORE = '*',

  /**
   * One or more items (+)
   * Cardinality: 1 or more
   */
  ONE_OR_MORE = '+'
}

/**
 * ItemType represents the type of individual items in a sequence
 * Can be: atomic types, node types, or item()
 */
export interface ItemType {
  /**
   * Human-readable name of the item type
   */
  readonly name: string;

  /**
   * Check if a value matches this ItemType
   */
  matches(value: any): boolean;

  /**
   * Get the type's namespace URI (if applicable)
   */
  readonly namespace?: string;

  /**
   * Indicates if this is a wildcard match (matches any item)
   */
  readonly isWildcard?: boolean;

  /**
   * For atomic types, reference to the AtomicType
   */
  readonly atomicType?: AtomicType;
}

/**
 * KindTest represents tests for specific node kinds
 * Used in path expressions and sequence types
 */
export interface KindTest extends ItemType {
  /**
   * The node kind being tested
   * Possible values: 'element', 'attribute', 'text', 'comment', 'processing-instruction', 'document-node'
   */
  readonly nodeKind: string;

  /**
   * Optional name constraint for the node
   */
  readonly nodeName?: string;

  /**
   * Optional type constraint for the node
   */
  readonly nodeType?: string;

  /**
   * Indicates if name is a wildcard (*)
   */
  readonly isWildcardName?: boolean;
}

/**
 * SequenceType specifies the expected type and cardinality of a sequence
 * 
 * Special cases:
 * - empty-sequence() : represents a sequence with no items
 * - item() : matches any single item
 * - xs:integer+ : one or more integers
 */
export class SequenceType {
  private readonly itemType: ItemType | 'empty';
  private readonly occurrence: OccurrenceIndicator;

  /**
   * Create a SequenceType
   * 
   * @param itemType - The ItemType (or 'empty' for empty-sequence())
   * @param occurrence - The occurrence indicator (default: EXACTLY_ONE)
   */
  constructor(itemType: ItemType | 'empty', occurrence: OccurrenceIndicator = OccurrenceIndicator.EXACTLY_ONE) {
    if (itemType === 'empty' && occurrence !== OccurrenceIndicator.EXACTLY_ONE) {
      throw new Error('empty-sequence() must have exactly one occurrence');
    }
    this.itemType = itemType;
    this.occurrence = occurrence;
  }

  /**
   * Get the ItemType
   */
  getItemType(): ItemType | 'empty' {
    return this.itemType;
  }

  /**
   * Get the OccurrenceIndicator
   */
  getOccurrence(): OccurrenceIndicator {
    return this.occurrence;
  }

  /**
   * Check if this is empty-sequence()
   */
  isEmptySequence(): boolean {
    return this.itemType === 'empty';
  }

  /**
   * Check if this type allows zero items
   */
  allowsZeroItems(): boolean {
    return (
      this.isEmptySequence() ||
      this.occurrence === OccurrenceIndicator.ZERO_OR_ONE ||
      this.occurrence === OccurrenceIndicator.ZERO_OR_MORE
    );
  }

  /**
   * Check if this type allows multiple items
   */
  allowsMultipleItems(): boolean {
    return (
      this.occurrence === OccurrenceIndicator.ZERO_OR_MORE ||
      this.occurrence === OccurrenceIndicator.ONE_OR_MORE
    );
  }

  /**
   * Check if this type requires at least one item
   */
  requiresItems(): boolean {
    return !this.allowsZeroItems();
  }

  /**
   * Get a string representation of this SequenceType
   * Examples: "empty-sequence()", "xs:integer", "xs:integer?", "element(*)"
   */
  toString(): string {
    if (this.isEmptySequence()) {
      return 'empty-sequence()';
    }

    const typeName = (this.itemType as ItemType).name;
    const indicator =
      this.occurrence === OccurrenceIndicator.EXACTLY_ONE ? '' : this.occurrence;

    return typeName + indicator;
  }

  /**
   * Get the minimum cardinality allowed by this type
   * 0 = allows empty, 1 = requires at least one item
   */
  getMinCardinality(): number {
    if (this.isEmptySequence() || this.allowsZeroItems()) {
      return 0;
    }
    return 1;
  }

  /**
   * Get the maximum cardinality allowed by this type
   * 1 = exactly one item, Infinity = unbounded
   */
  getMaxCardinality(): number {
    if (this.allowsMultipleItems()) {
      return Infinity;
    }
    return 1;
  }

  /**
   * Check if another SequenceType is compatible with this one
   * (i.e., can values of that type be assigned to this type)
   * 
   * This is a simple compatibility check. Full implementation would require
   * schema information and type hierarchy checking.
   */
  isCompatibleWith(other: SequenceType): boolean {
    // Empty sequence is compatible with any type
    if (other.isEmptySequence()) {
      return this.allowsZeroItems();
    }

    // Check cardinality compatibility
    const otherMin = other.getMinCardinality();
    const otherMax = other.getMaxCardinality();
    const thisMin = this.getMinCardinality();
    const thisMax = this.getMaxCardinality();

    // Other's cardinality must fit within this type's cardinality
    if (otherMin < thisMin || (otherMax > thisMax && thisMax !== Infinity)) {
      return false;
    }

    // For item types, check if other's item type matches
    if (this.itemType !== 'empty' && other.itemType !== 'empty') {
      const thisItemType = this.itemType as ItemType;
      const otherItemType = other.itemType as ItemType;

      // If this is a wildcard item type, accept any item type
      if (thisItemType.isWildcard) {
        return true;
      }

      // Otherwise, names must match (simplified check)
      return thisItemType.name === otherItemType.name;
    }

    return this.itemType === 'empty' ? other.isEmptySequence() : true;
  }
}

/**
 * Built-in ItemType for "item()" - matches any single item
 */
export const ITEM_TYPE: ItemType = {
  name: 'item()',
  isWildcard: true,
  matches: () => true
};

/**
 * Create a SequenceType for empty-sequence()
 */
export function createEmptySequenceType(): SequenceType {
  return new SequenceType('empty', OccurrenceIndicator.EXACTLY_ONE);
}

/**
 * Create a SequenceType for a single item type with specified occurrence
 */
export function createItemSequenceType(
  itemType: ItemType,
  occurrence: OccurrenceIndicator = OccurrenceIndicator.EXACTLY_ONE
): SequenceType {
  return new SequenceType(itemType, occurrence);
}

/**
 * Create a SequenceType from an AtomicType with specified occurrence
 */
export function createAtomicSequenceType(
  atomicType: AtomicType,
  occurrence: OccurrenceIndicator = OccurrenceIndicator.EXACTLY_ONE
): SequenceType {
  const itemType: ItemType = {
    name: atomicType.name,
    namespace: atomicType.namespace,
    atomicType: atomicType,
    matches: (value: any) => {
      if (value === null || value === undefined) return false;
      try {
        return atomicType.validate(value);
      } catch {
        return false;
      }
    }
  };

  return new SequenceType(itemType, occurrence);
}
