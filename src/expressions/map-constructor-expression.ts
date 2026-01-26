/**
 * Map Constructor Expression (XPath 3.1)
 *
 * Represents a map constructor expression: map { key: value, key: value, ... }
 *
 * Syntax: map { ExprSingle : ExprSingle (, ExprSingle : ExprSingle)* }
 *
 * Key features:
 * - Keys are atomized (converted to atomic values)
 * - Duplicate keys: last value wins
 * - Empty map: map { }
 * - Nested maps allowed: map { "outer": map { "inner": 42 } }
 *
 * Reference: https://www.w3.org/TR/xpath-31/#id-map-constructors
 */

import { XPathExpression } from "./expression";
import { XPathContext } from "../context";
import { atomize } from "../types/atomization";
import { typeMismatch } from "../errors";

/**
 * Represents a single key-value pair entry in a map constructor.
 */
export interface MapConstructorEntry {
    key: XPathExpression;
    value: XPathExpression;
}

/**
 * Map Constructor Expression: map { key: value, ... }
 *
 * Creates a map data structure from key-value pairs.
 * Keys must be atomic values, values can be any sequence.
 */
export class XPathMapConstructorExpression implements XPathExpression {
    constructor(private entries: MapConstructorEntry[]) {}

    evaluate(context: XPathContext): any {
        const result: Record<string, any> = {};

        for (const entry of this.entries) {
            // Evaluate and atomize the key
            const keyResult = entry.key.evaluate(context);
            const atomicKeys = atomize(keyResult);

            // Keys must be atomic values (single atomic value per entry)
            if (atomicKeys.error) {
                throw typeMismatch("atomic value", "value with error", "map key");
            }

            if (atomicKeys.isEmpty || atomicKeys.values.length === 0) {
                throw typeMismatch("atomic value", "empty sequence", "map key");
            }

            if (atomicKeys.values.length > 1) {
                throw typeMismatch("single atomic value", "sequence", "map key");
            }

            const key = atomicKeys.values[0];

            // Convert key to string for JavaScript object property
            const keyString = String(key);

            // Evaluate the value (can be any sequence)
            const value = entry.value.evaluate(context);

            // Store in map (last value wins for duplicate keys)
            result[keyString] = value;
        }

        // Mark the result as a map for type checking
        return this.createMap(result);
    }

    /**
     * Create a map object with type marker.
     * Maps are distinguishable from plain objects and arrays.
     */
    private createMap(entries: Record<string, any>): any {
        // Create a map with a type marker
        // This allows us to distinguish maps from plain objects
        const map = Object.create(null);
        map.__isMap = true;
        Object.assign(map, entries);
        return map;
    }
}
