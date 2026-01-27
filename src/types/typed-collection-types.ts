/**
 * Typed Collection Types for XPath 3.1
 *
 * Implements TypedMapTest and TypedArrayTest for runtime type checking
 * of maps and arrays with constrained key/value and member types.
 *
 * Syntax:
 * - map(key-type, value-type) - Map with specific key and value types
 * - map(*) - Any map with any key/value types
 * - array(member-type) - Array with specific member type
 * - array(*) - Any array with any member type
 */

import { ItemType, SequenceType } from './sequence-type';
import { isXPathMap } from '../expressions/map-constructor-expression';
import { isXPathArray } from '../expressions/array-constructor-expression';
import { matchesSequenceType } from './sequence-type-matcher';

/**
 * TypedMapItemType represents map(key-type, value-type) type test
 * Used for static and dynamic type checking of maps
 */
export interface TypedMapItemType extends ItemType {
    /**
     * Indicates this is a map type test
     */
    readonly isMapTest: true;

    /**
     * The SequenceType that keys must match
     * If null, allows any key (map(*))
     */
    readonly keyType: SequenceType | null;

    /**
     * The SequenceType that values must match
     * If null, allows any value (map(*))
     */
    readonly valueType: SequenceType | null;

    /**
     * Whether this is the wildcard map(*) test
     */
    readonly isWildcard: boolean;
}

/**
 * TypedArrayItemType represents array(member-type) type test
 * Used for static and dynamic type checking of arrays
 */
export interface TypedArrayItemType extends ItemType {
    /**
     * Indicates this is an array type test
     */
    readonly isArrayTest: true;

    /**
     * The SequenceType that members must match
     * If null, allows any member (array(*))
     */
    readonly memberType: SequenceType | null;

    /**
     * Whether this is the wildcard array(*) test
     */
    readonly isWildcard: boolean;
}

/**
 * Create a TypedMapItemType for map(key-type, value-type)
 *
 * @param keyType - The SequenceType for keys (null for wildcard)
 * @param valueType - The SequenceType for values (null for wildcard)
 * @returns TypedMapItemType that can be used in instance-of or treat-as expressions
 */
export function createTypedMapTest(
    keyType: SequenceType | null,
    valueType: SequenceType | null
): TypedMapItemType {
    const isWildcardMapTest = keyType === null && valueType === null;

    const itemType: TypedMapItemType = {
        name: formatMapTypeName(keyType, valueType),
        isMapTest: true,
        keyType,
        valueType,
        isWildcard: isWildcardMapTest, // TypedMapItemType.isWildcard field
        namespace: undefined,

        matches(value: any): boolean {
            // Must be a map
            if (!isXPathMap(value)) {
                return false;
            }

            // Wildcard map matches any map
            if (isWildcardMapTest) {
                return true;
            }

            // Check each entry if specific types are required
            const entries = Object.entries(value).filter(
                ([key]) => !key.startsWith('_') && !key.startsWith('__')
            );

            for (const [key, val] of entries) {
                // Check key type
                if (keyType !== null) {
                    const matchResult = matchesSequenceType(key, keyType);
                    if (!matchResult.matches) {
                        return false;
                    }
                }

                // Check value type
                if (valueType !== null) {
                    const matchResult = matchesSequenceType(val, valueType);
                    if (!matchResult.matches) {
                        return false;
                    }
                }
            }

            return true;
        },
    };

    return itemType;
}

/**
 * Create a TypedArrayItemType for array(member-type)
 *
 * @param memberType - The SequenceType for members (null for wildcard)
 * @returns TypedArrayItemType that can be used in instance-of or treat-as expressions
 */
export function createTypedArrayTest(memberType: SequenceType | null): TypedArrayItemType {
    const isWildcardArrayTest = memberType === null;

    const itemType: TypedArrayItemType = {
        name: formatArrayTypeName(memberType),
        isArrayTest: true,
        memberType,
        isWildcard: isWildcardArrayTest, // TypedArrayItemType.isWildcard field
        namespace: undefined,

        matches(value: any): boolean {
            // Must be an array
            if (!isXPathArray(value)) {
                return false;
            }

            // Wildcard array matches any array
            if (isWildcardArrayTest) {
                return true;
            }

            // Check each member if specific type is required
            const members = value.members || [];
            for (const member of members) {
                const matchResult = matchesSequenceType(member, memberType as SequenceType);
                if (!matchResult.matches) {
                    return false;
                }
            }

            return true;
        },
    };

    return itemType;
}

/**
 * Format a map type name for display
 *
 * @param keyType - Key SequenceType or null
 * @param valueType - Value SequenceType or null
 * @returns Formatted type name like "map(*)" or "map(xs:string, xs:integer)"
 */
function formatMapTypeName(keyType: SequenceType | null, valueType: SequenceType | null): string {
    if (keyType === null && valueType === null) {
        return 'map(*)';
    }

    const keyStr = keyType ? keyType.toString() : '*';
    const valueStr = valueType ? valueType.toString() : '*';

    return `map(${keyStr}, ${valueStr})`;
}

/**
 * Format an array type name for display
 *
 * @param memberType - Member SequenceType or null
 * @returns Formatted type name like "array(*)" or "array(xs:string)"
 */
function formatArrayTypeName(memberType: SequenceType | null): string {
    if (memberType === null) {
        return 'array(*)';
    }

    return `array(${memberType.toString()})`;
}

/**
 * Check if an ItemType is a TypedMapTest
 */
export function isTypedMapTest(itemType: ItemType): itemType is TypedMapItemType {
    return (itemType as TypedMapItemType).isMapTest === true;
}

/**
 * Check if an ItemType is a TypedArrayTest
 */
export function isTypedArrayTest(itemType: ItemType): itemType is TypedArrayItemType {
    return (itemType as TypedArrayItemType).isArrayTest === true;
}
