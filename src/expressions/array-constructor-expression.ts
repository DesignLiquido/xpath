/**
 * Array Constructor Expression (XPath 3.1)
 *
 * Represents array constructor expressions:
 * - Square bracket syntax: [item1, item2, ...]
 * - Curly syntax: array { expr }
 *
 * Key features:
 * - Each item in square bracket syntax becomes a separate array member
 * - In curly syntax, the expression result is atomized/flattened into members
 * - Empty array: [] or array { }
 * - Arrays are 1-indexed (not 0-indexed)
 * - Nested arrays allowed: [[1, 2], [3, 4]]
 *
 * Reference: https://www.w3.org/TR/xpath-31/#id-array-constructors
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';

/**
 * Marker interface for XPath 3.1 arrays.
 * Arrays are distinguishable from plain JavaScript arrays.
 */
export interface XPathArray {
    __isArray: true;
    members: any[];
}

/**
 * Check if a value is an XPath array.
 */
export function isXPathArray(value: any): value is XPathArray {
    return value && typeof value === 'object' && value.__isArray === true;
}

/**
 * Create an XPath array from members.
 */
export function createXPathArray(members: any[]): XPathArray {
    return {
        __isArray: true,
        members: members,
    };
}

/**
 * Get the size of an XPath array.
 */
export function getArraySize(arr: XPathArray): number {
    return arr.members.length;
}

/**
 * Get a member from an XPath array (1-based indexing).
 * @param arr The array
 * @param position 1-based position
 * @returns The member at that position, or throws error if out of bounds
 */
export function getArrayMember(arr: XPathArray, position: number): any {
    if (position < 1 || position > arr.members.length) {
        throw new Error(
            `FOAY0001: Array index ${position} out of bounds (array size: ${arr.members.length})`
        );
    }
    return arr.members[position - 1];
}

/**
 * Square Bracket Array Constructor: [item1, item2, ...]
 *
 * Creates an array where each expression becomes a separate member.
 * Each member can be any sequence.
 */
export class XPathSquareBracketArrayConstructor implements XPathExpression {
    constructor(private items: XPathExpression[]) {}

    evaluate(context: XPathContext): any {
        const members: any[] = [];

        for (const item of this.items) {
            // Each expression evaluates to one array member
            // The member can be any sequence (including empty sequence)
            const value = item.evaluate(context);
            members.push(value);
        }

        return createXPathArray(members);
    }

    toString(): string {
        const itemStrs = this.items.map((i) => i.toString()).join(', ');
        return `[${itemStrs}]`;
    }
}

/**
 * Curly Brace Array Constructor: array { expr }
 *
 * Creates an array where the expression result is flattened into members.
 * Each item in the sequence becomes a separate array member.
 */
export class XPathCurlyBraceArrayConstructor implements XPathExpression {
    constructor(private expr: XPathExpression) {}

    evaluate(context: XPathContext): any {
        const result = this.expr.evaluate(context);

        // Convert the result to an array of members
        // Each item in the sequence becomes a member
        const members = this.toSequence(result);

        return createXPathArray(members);
    }

    /**
     * Convert any value to a sequence (array) of items.
     */
    private toSequence(value: any): any[] {
        if (value === null || value === undefined) {
            return [];
        }

        // If it's already a plain JavaScript array, use it as is
        // (each element becomes a member)
        if (Array.isArray(value)) {
            return value;
        }

        // If it's an XPath array, don't flatten - treat it as single item
        if (isXPathArray(value)) {
            return [value];
        }

        // Single value becomes single-member array
        return [value];
    }

    toString(): string {
        return `array { ${this.expr.toString()} }`;
    }
}
