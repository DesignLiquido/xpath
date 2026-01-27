/**
 * SequenceType Matching Algorithm (Section 2.5.4)
 *
 * Implements the algorithm for checking if a value/sequence matches a given SequenceType.
 *
 * The matching process:
 * 1. If the SequenceType is empty-sequence(), the sequence must be empty
 * 2. Otherwise, each item in the sequence must match the ItemType
 * 3. The total number of items must satisfy the occurrence indicator
 */

import { SequenceType, OccurrenceIndicator, ItemType, ITEM_TYPE } from './sequence-type';
import { AtomicType } from './base';

/**
 * Result of a sequence type match operation
 */
export interface MatchResult {
    /**
     * Whether the value matches the SequenceType
     */
    matches: boolean;

    /**
     * If doesn't match, reason why
     */
    reason?: string;

    /**
     * Number of items that matched (useful for debugging)
     */
    itemCount?: number;
}

/**
 * Check if a single value matches an ItemType
 *
 * @param value - The value to check
 * @param itemType - The ItemType to match against
 * @returns true if the value matches the ItemType
 */
export function matchesItemType(value: any, itemType: ItemType): boolean {
    // Check for typed collection types (map/array) which have their own wildcard semantics
    // These should use their matches() method directly, not the isWildcard shortcut
    const hasMapTest = (itemType as any).isMapTest;
    const hasArrayTest = (itemType as any).isArrayTest;

    if (hasMapTest || hasArrayTest) {
        return itemType.matches(value);
    }

    if (itemType.isWildcard) {
        // item() matches any single value
        return value !== null && value !== undefined;
    }

    return itemType.matches(value);
}

/**
 * Check if an array/sequence of values matches a SequenceType
 *
 * @param values - A single value or array of values to check
 * @param sequenceType - The SequenceType to match against
 * @returns MatchResult with details of the match
 */
export function matchesSequenceType(values: any, sequenceType: SequenceType): MatchResult {
    // Normalize input to array
    const sequence = Array.isArray(values) ? values : [values].filter((v) => v !== undefined);

    // Handle empty sequence
    if (sequence.length === 0) {
        if (sequenceType.isEmptySequence()) {
            return { matches: true, itemCount: 0 };
        }

        if (sequenceType.allowsZeroItems()) {
            return { matches: true, itemCount: 0 };
        }

        return {
            matches: false,
            itemCount: 0,
            reason: `Empty sequence not allowed by ${sequenceType.toString()}`,
        };
    }

    // Handle empty-sequence() type
    if (sequenceType.isEmptySequence()) {
        return {
            matches: false,
            itemCount: sequence.length,
            reason: `Expected empty sequence but got ${sequence.length} item(s)`,
        };
    }

    // Get the ItemType to match against
    const itemType = sequenceType.getItemType();
    if (itemType === 'empty') {
        return {
            matches: false,
            itemCount: sequence.length,
            reason: 'Expected empty sequence',
        };
    }

    // Check each item in the sequence
    const typedItemType = itemType as ItemType;
    const unmatched = sequence.findIndex((item) => !matchesItemType(item, typedItemType));

    if (unmatched !== -1) {
        const unmatchedItem = sequence[unmatched];
        // Handle object/array conversion safely for error messages
        let itemDesc: string;
        try {
            if (typeof unmatchedItem === 'object' && unmatchedItem !== null) {
                itemDesc = JSON.stringify(unmatchedItem);
            } else {
                itemDesc = String(unmatchedItem);
            }
        } catch {
            itemDesc = '[complex value]';
        }

        return {
            matches: false,
            itemCount: sequence.length,
            reason: `Item ${unmatched} (${itemDesc}) does not match ${typedItemType.name}`,
        };
    }

    // Check cardinality
    const occurrence = sequenceType.getOccurrence();
    const itemCount = sequence.length;

    switch (occurrence) {
        case OccurrenceIndicator.EXACTLY_ONE:
            if (itemCount === 1) {
                return { matches: true, itemCount };
            }
            return {
                matches: false,
                itemCount,
                reason: `Expected exactly one item but got ${itemCount}`,
            };

        case OccurrenceIndicator.ZERO_OR_ONE:
            if (itemCount <= 1) {
                return { matches: true, itemCount };
            }
            return {
                matches: false,
                itemCount,
                reason: `Expected zero or one item but got ${itemCount}`,
            };

        case OccurrenceIndicator.ZERO_OR_MORE:
            return { matches: true, itemCount };

        case OccurrenceIndicator.ONE_OR_MORE:
            if (itemCount >= 1) {
                return { matches: true, itemCount };
            }
            return {
                matches: false,
                itemCount: 0,
                reason: `Expected one or more items but got none`,
            };

        default:
            return {
                matches: false,
                itemCount,
                reason: `Unknown occurrence indicator: ${occurrence}`,
            };
    }
}

/**
 * Check if a value matches an ItemType (shorthand)
 */
export function matchesItem(value: any, itemType: ItemType): boolean {
    return matchesItemType(value, itemType);
}

/**
 * Check if a sequence matches a SequenceType (shorthand - returns boolean)
 */
export function matches(values: any, sequenceType: SequenceType): boolean {
    return matchesSequenceType(values, sequenceType).matches;
}

/**
 * Find the first item in a sequence that doesn't match an ItemType
 *
 * @param sequence - Array of values
 * @param itemType - The ItemType to match against
 * @returns Index of non-matching item, or -1 if all match
 */
export function findMismatch(sequence: any[], itemType: ItemType): number {
    return sequence.findIndex((item) => !matchesItemType(item, itemType));
}

/**
 * Count how many items in a sequence match an ItemType
 */
export function countMatches(sequence: any[], itemType: ItemType): number {
    return sequence.filter((item) => matchesItemType(item, itemType)).length;
}

/**
 * Check if an AtomicType satisfies a SequenceType's ItemType
 * (useful for static type checking)
 *
 * @param atomicType - The atomic type to check
 * @param sequenceType - The sequence type to match against
 * @returns true if the atomic type satisfies the sequence type's item type
 */
export function atomicTypeSatisfies(atomicType: AtomicType, sequenceType: SequenceType): boolean {
    const itemType = sequenceType.getItemType();

    if (itemType === 'empty') {
        return false; // Atomic type cannot be empty
    }

    const typedItemType = itemType as ItemType;

    // Check if the ItemType's atomic type matches
    if (typedItemType.atomicType) {
        return typedItemType.atomicType.name === atomicType.name;
    }

    // Check if it's the wildcard item() type
    if (typedItemType.isWildcard) {
        return true;
    }

    // Check by name
    return typedItemType.name === atomicType.name;
}

/**
 * Get a human-readable description of what a SequenceType accepts
 */
export function describeSequenceType(sequenceType: SequenceType): string {
    if (sequenceType.isEmptySequence()) {
        return 'an empty sequence';
    }

    const itemType = sequenceType.getItemType() as ItemType;
    const typeName = itemType.name;

    const occurrence = sequenceType.getOccurrence();
    const descriptions: { [key: string]: string } = {
        [OccurrenceIndicator.EXACTLY_ONE]: `exactly one ${typeName}`,
        [OccurrenceIndicator.ZERO_OR_ONE]: `zero or one ${typeName}`,
        [OccurrenceIndicator.ZERO_OR_MORE]: `zero or more ${typeName}s`,
        [OccurrenceIndicator.ONE_OR_MORE]: `one or more ${typeName}s`,
    };

    return descriptions[occurrence] || typeName;
}

/**
 * Check if a value is a valid single item (not a sequence)
 */
export function isSingleItem(value: any): boolean {
    return value !== null && value !== undefined && !Array.isArray(value);
}

/**
 * Check if a value is a valid sequence (array or single item)
 */
export function isValidSequence(value: any): boolean {
    return Array.isArray(value) || isSingleItem(value);
}

/**
 * Convert a value to a sequence (array)
 *
 * @param value - Single item or array
 * @returns Array representation of the sequence
 */
export function toSequence(value: any): any[] {
    if (Array.isArray(value)) {
        return value;
    }
    if (value === undefined || value === null) {
        return [];
    }
    return [value];
}

/**
 * Check if two ItemTypes are equivalent
 */
export function itemTypesEquivalent(itemType1: ItemType, itemType2: ItemType): boolean {
    if (itemType1.isWildcard && itemType2.isWildcard) {
        return true;
    }

    if (itemType1.isWildcard || itemType2.isWildcard) {
        return false;
    }

    // Compare by name and namespace
    if (itemType1.name !== itemType2.name) {
        return false;
    }

    if (itemType1.namespace !== itemType2.namespace) {
        return false;
    }

    return true;
}

/**
 * Check if two SequenceTypes are equivalent
 */
export function sequenceTypesEquivalent(seq1: SequenceType, seq2: SequenceType): boolean {
    // Both empty
    if (seq1.isEmptySequence() && seq2.isEmptySequence()) {
        return true;
    }

    // One empty, other not
    if (seq1.isEmptySequence() || seq2.isEmptySequence()) {
        return false;
    }

    // Compare occurrence indicators
    if (seq1.getOccurrence() !== seq2.getOccurrence()) {
        return false;
    }

    // Compare item types
    const itemType1 = seq1.getItemType() as ItemType;
    const itemType2 = seq2.getItemType() as ItemType;

    return itemTypesEquivalent(itemType1, itemType2);
}
