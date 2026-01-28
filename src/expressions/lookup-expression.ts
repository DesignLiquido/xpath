/**
 * Lookup Expression (? operator) - XPath 3.1
 *
 * Implements the lookup operator (?) for accessing map and array members:
 * - Unary lookup: ?key (when context item is map/array)
 * - Postfix lookup: $expr?key, $expr?1, $expr?(expr), $expr?*
 *
 * Key features:
 * - Maps: ?key accesses by string key
 * - Arrays: ?1, ?2, ... accesses by 1-based index
 * - Wildcard: ?* returns all members/keys
 * - Dynamic: ?(expr) evaluates expression for key
 * - Chaining: $map?data?items?* flattens nested structures
 *
 * Reference: https://www.w3.org/TR/xpath-31/#id-lookup
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';
import { isXPathArray, XPathArray } from './array-constructor-expression';
import { isXPathMap, XPathMap } from './map-constructor-expression';

/**
 * Key specifier types for lookup operations.
 */
export enum KeySpecifierType {
    NCNAME = 'NCNAME',
    INTEGER_LITERAL = 'INTEGER_LITERAL',
    PARENTHESIZED_EXPR = 'PARENTHESIZED_EXPR',
    WILDCARD = 'WILDCARD',
}

/**
 * Represents a key specifier in a lookup expression.
 */
export interface KeySpecifier {
    type: KeySpecifierType;
    value?: string | number | XPathExpression;
}

/**
 * Lookup expression: ?key, ?1, ?(expr), ?*
 */
export class XPathLookupExpression implements XPathExpression {
    constructor(
        private baseExpr: XPathExpression | null, // null for unary lookup
        private keySpecifier: KeySpecifier
    ) { }

    evaluate(context: XPathContext): any {
        // Determine the target (base expression result or context item)
        let target: any;
        if (this.baseExpr) {
            // Postfix lookup: evaluate base expression
            target = this.baseExpr.evaluate(context);
        } else {
            // Unary lookup: use context item
            target = (context as any).contextItem;
            if (target === undefined) {
                throw new Error('XPDY0002: Context item is undefined for unary lookup');
            }
        }

        // Apply lookup based on target type
        if (isXPathMap(target)) {
            return this.lookupInMap(target, this.keySpecifier, context);
        } else if (isXPathArray(target)) {
            return this.lookupInArray(target, this.keySpecifier, context);
        } else {
            throw new Error('XPTY0004: Lookup operator can only be applied to maps and arrays');
        }
    }

    private lookupInMap(map: XPathMap, keySpecifier: KeySpecifier, context: XPathContext): any {
        switch (keySpecifier.type) {
            case KeySpecifierType.NCNAME:
                const key = keySpecifier.value as string;
                return map[key];

            case KeySpecifierType.INTEGER_LITERAL:
                // For maps, integer keys are converted to strings
                const intKey = (keySpecifier.value as number).toString();
                return map[intKey];

            case KeySpecifierType.PARENTHESIZED_EXPR:
                // Evaluate the expression to get the key
                const expr = keySpecifier.value as XPathExpression;
                const dynamicKey = expr.evaluate(context);
                const stringKey = this.atomizeToString(dynamicKey);
                return map[stringKey];

            case KeySpecifierType.WILDCARD:
                // Return all values in the map, excluding internal properties
                return Object.keys(map)
                    .filter((key) => !key.startsWith('__'))
                    .map((key) => map[key]);

            default:
                throw new Error('FOAY0001: Invalid key specifier for map lookup');
        }
    }

    private lookupInArray(
        array: XPathArray,
        keySpecifier: KeySpecifier,
        context: XPathContext
    ): any {
        switch (keySpecifier.type) {
            case KeySpecifierType.INTEGER_LITERAL:
                const position = keySpecifier.value as number;
                if (position < 1) {
                    throw new Error('FOAY0001: Array index must be positive');
                }
                if (position > array.members.length) {
                    throw new Error('FOAY0001: Array index out of bounds');
                }
                return array.members[position - 1]; // 1-based indexing

            case KeySpecifierType.PARENTHESIZED_EXPR:
                // Evaluate expression to get position
                const expr = keySpecifier.value as XPathExpression;
                const dynamicPos = expr.evaluate(context);
                const positionNum = this.atomizeToNumber(dynamicPos);
                if (positionNum < 1) {
                    throw new Error('FOAY0001: Array index must be positive');
                }
                if (positionNum > array.members.length) {
                    throw new Error('FOAY0001: Array index out of bounds');
                }
                return array.members[positionNum - 1];

            case KeySpecifierType.WILDCARD:
                // Return all members (flattened if nested)
                return this.flattenArrayMembers(array.members);

            case KeySpecifierType.NCNAME:
                // NCName keys not valid for arrays
                throw new Error('XPTY0004: NCName key not valid for array lookup');

            default:
                throw new Error('FOAY0001: Invalid key specifier for array lookup');
        }
    }

    /**
     * Flatten array members, handling nested arrays.
     * For wildcard lookup, nested arrays are flattened.
     */
    private flattenArrayMembers(members: any[]): any[] {
        const result: any[] = [];
        for (const member of members) {
            if (isXPathArray(member)) {
                // Recursively flatten nested arrays
                result.push(...this.flattenArrayMembers(member.members));
            } else {
                result.push(member);
            }
        }
        return result;
    }

    /**
     * Atomize a value to a string for use as a map key.
     * Per XPath 2.0 Section 2.4.2: Atomization
     * - Atomic values pass through unchanged
     * - Arrays/Maps: extract atomic values and convert to string
     * - Nodes: use string value
     * - Function items: should error (cannot atomize function items)
     */
    private atomizeToString(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();

        // Handle XPath arrays (objects with $isXPathArray flag)
        if (Array.isArray(value)) {
            if (value.length === 0) return '';
            if (value.length === 1) return this.atomizeToString(value[0]);
            // Multiple values: use first
            return this.atomizeToString(value[0]);
        }

        // Handle XPath maps (objects with $isXPathMap flag)
        if (typeof value === 'object' && value.$isXPathMap) {
            // Maps cannot be directly atomized - should error
            throw new Error('XPTY0004: Cannot atomize a map to string');
        }

        // Handle node-like objects (have nodeType, nodeName, or textContent)
        if (typeof value === 'object' && (value.nodeType || value.nodeName || value.textContent)) {
            return (value.textContent || value.value || '').toString();
        }

        // Function items or other non-atomizable types
        if (typeof value === 'function') {
            throw new Error('XPTY0004: Cannot atomize a function item');
        }

        // Default: convert to string
        try {
            return String(value);
        } catch {
            throw new Error('XPTY0004: Cannot atomize value');
        }
    }

    /**
     * Atomize a value to a number for use as an array index.
     * Per XPath 2.0 Section 2.4.2: Atomization
     * - Numbers pass through unchanged
     * - Strings: convert to number
     * - Booleans: error
     * - Arrays/Maps/Function items: error
     */
    private atomizeToNumber(value: any): number {
        if (value === null || value === undefined) {
            throw new Error('XPTY0004: Cannot convert empty sequence to number');
        }

        if (typeof value === 'number') return value;

        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) throw new Error('FORG0001: Invalid number');
            return num;
        }

        if (typeof value === 'boolean') {
            throw new Error('XPTY0004: Cannot convert boolean to number for array index');
        }

        // Handle XPath arrays
        if (Array.isArray(value)) {
            if (value.length === 0) {
                throw new Error('XPTY0004: Cannot convert empty sequence to number');
            }
            if (value.length === 1) {
                return this.atomizeToNumber(value[0]);
            }
            throw new Error('XPTY0004: Cannot convert sequence to single number');
        }

        // Handle XPath maps
        if (typeof value === 'object' && value.$isXPathMap) {
            throw new Error('XPTY0004: Cannot atomize a map to number');
        }

        // Handle node-like objects
        if (typeof value === 'object' && (value.nodeType || value.nodeName || value.textContent)) {
            const str = (value.textContent || value.value || '').toString();
            const num = parseFloat(str);
            if (isNaN(num)) throw new Error('FORG0001: Invalid number from node');
            return num;
        }

        // Function items
        if (typeof value === 'function') {
            throw new Error('XPTY0004: Cannot atomize a function item');
        }

        throw new Error('FORG0001: Cannot convert to number');
    }

    toString(): string {
        const base = this.baseExpr ? this.baseExpr.toString() : '';
        let keyStr: string;
        switch (this.keySpecifier.type) {
            case KeySpecifierType.NCNAME:
                keyStr = this.keySpecifier.value as string;
                break;
            case KeySpecifierType.INTEGER_LITERAL:
                keyStr = (this.keySpecifier.value as number).toString();
                break;
            case KeySpecifierType.PARENTHESIZED_EXPR:
                keyStr = `(${this.keySpecifier.value})`;
                break;
            case KeySpecifierType.WILDCARD:
                keyStr = '*';
                break;
            default:
                keyStr = '?';
        }
        return base + '?' + keyStr;
    }
}
