/**
 * Union Types (XPath 3.1 Extension)
 *
 * Implements union type declarations for more expressive type constraints.
 * A union type matches a value if it matches ANY of the member types.
 *
 * Syntax: type1 | type2 | ... | typeN
 * Examples:
 *   - xs:string | xs:integer - matches strings or integers
 *   - (xs:integer | xs:decimal) | xs:double - nested unions
 *   - element() | attribute() - matches elements or attributes
 *
 * Reference: XPath 3.1 Type System Extensions
 */

import { ItemType } from './sequence-type';
import { AtomicType } from './base';

/**
 * UnionItemType represents a union of multiple ItemTypes
 * A value matches if it matches ANY of the member types
 */
export class UnionItemType implements ItemType {
    readonly name: string;
    readonly memberTypes: ItemType[];
    readonly isWildcard: boolean = false;

    /**
     * Create a UnionItemType
     *
     * @param memberTypes - Array of ItemTypes that form the union
     * @throws Error if memberTypes is empty or contains only one type
     */
    constructor(memberTypes: ItemType[]) {
        if (memberTypes.length === 0) {
            throw new Error('Union type must have at least one member type');
        }

        if (memberTypes.length === 1) {
            throw new Error(
                'Union type must have at least two member types (use the single type directly)'
            );
        }

        // Check for empty-sequence type (represented as 'empty' string)
        if (memberTypes.some((t: any) => t === 'empty')) {
            throw new Error('empty-sequence() cannot be used in union types');
        }

        this.memberTypes = memberTypes;
        this.name = memberTypes.map((t) => t.name).join(' | ');
    }

    /**
     * Check if a value matches this union type
     * Returns true if the value matches ANY of the member types
     *
     * @param value - The value to check
     * @returns true if value matches any member type
     */
    matches(value: any): boolean {
        // A value matches a union type if it matches at least one member type
        return this.memberTypes.some((memberType) => memberType.matches(value));
    }

    /**
     * Get all member types in this union
     */
    getMemberTypes(): ItemType[] {
        return [...this.memberTypes];
    }

    /**
     * Check if this union contains a specific type
     *
     * @param typeName - The name of the type to check for
     * @returns true if any member type has this name
     */
    containsType(typeName: string): boolean {
        return this.memberTypes.some((memberType) => memberType.name === typeName);
    }

    /**
     * Flatten nested unions into a single-level union
     * If any member is itself a union, extract its members
     *
     * @returns A new UnionItemType with all unions flattened
     */
    flatten(): UnionItemType {
        const flattenedTypes: ItemType[] = [];

        for (const memberType of this.memberTypes) {
            if (memberType instanceof UnionItemType) {
                // Recursively flatten nested unions
                const nested = memberType.flatten();
                flattenedTypes.push(...nested.memberTypes);
            } else {
                flattenedTypes.push(memberType);
            }
        }

        // Remove duplicates based on type name
        const uniqueTypes = flattenedTypes.filter(
            (type, index, self) => self.findIndex((t) => t.name === type.name) === index
        );

        return new UnionItemType(uniqueTypes);
    }

    /**
     * Get the most general atomic type in the union
     * Used for type promotion in expressions
     *
     * @returns The most general atomic type, or undefined if no atomic types
     */
    getMostGeneralAtomicType(): AtomicType | undefined {
        const atomicTypes = this.memberTypes
            .filter((t) => t.atomicType !== undefined)
            .map((t) => t.atomicType!);

        if (atomicTypes.length === 0) {
            return undefined;
        }

        // Determine the most general type
        // Priority order: xs:string > xs:double > xs:decimal > xs:integer
        const hasString = atomicTypes.some((t) => t.name === 'string');
        if (hasString) {
            return atomicTypes.find((t) => t.name === 'string');
        }

        const hasDouble = atomicTypes.some((t) => t.name === 'double');
        if (hasDouble) {
            return atomicTypes.find((t) => t.name === 'double');
        }

        const hasDecimal = atomicTypes.some((t) => t.name === 'decimal');
        if (hasDecimal) {
            return atomicTypes.find((t) => t.name === 'decimal');
        }

        // Return the first atomic type found
        return atomicTypes[0];
    }

    /**
     * String representation of this union type
     */
    toString(): string {
        return this.name;
    }
}

/**
 * Create a union type from multiple ItemTypes
 *
 * @param memberTypes - The types to combine into a union
 * @returns A UnionItemType
 * @throws Error if memberTypes is empty or contains only one type
 */
export function createUnionType(...memberTypes: ItemType[]): UnionItemType {
    return new UnionItemType(memberTypes);
}

/**
 * Check if an ItemType is a union type
 *
 * @param itemType - The ItemType to check
 * @returns true if itemType is a UnionItemType
 */
export function isUnionType(itemType: ItemType): itemType is UnionItemType {
    return itemType instanceof UnionItemType;
}
