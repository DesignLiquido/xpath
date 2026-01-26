/**
 * XPath 3.0 Simple Map Operator (!) (Section 3.3.2)
 *
 * Syntax: expr1 ! expr2
 *
 * The simple map operator evaluates expr1 to produce a sequence,
 * then for each item in the sequence, evaluates expr2 with that
 * item as the context item. The results are concatenated into
 * a single sequence.
 *
 * This is equivalent to: for $i in expr1 return $i/expr2
 * but more concise for simple cases.
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-map-operator
 */

import { XPathContext, XPathResult } from '../context';
import { XPathExpression } from './expression';

/**
 * XPath 3.0 Simple Map Expression (!)
 *
 * Examples:
 *   (1, 2, 3) ! (. * 2)           → (2, 4, 6)
 *   $items ! @id                   → sequence of @id values from each item
 *   $items ! name()                → sequence of element names
 *   "hello" ! string-length(.)     → 5
 *   (1 to 5) ! (. * .)             → (1, 4, 9, 16, 25)
 */
export class XPathSimpleMapExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;

    constructor(left: XPathExpression, right: XPathExpression) {
        super();
        this.left = left;
        this.right = right;
    }

    evaluate(context: XPathContext): XPathResult {
        // Evaluate left expression to get the sequence
        const leftValue = this.left.evaluate(context);
        const sequence = this.normalizeToSequence(leftValue);

        if (sequence.length === 0) {
            return [];
        }

        const results: any[] = [];
        const size = sequence.length;

        // For each item in the sequence, evaluate right expression with that item as context
        for (let i = 0; i < size; i++) {
            const item = sequence[i];

            // Create context with item as context node/item
            const itemContext: XPathContext = {
                ...context,
                position: i + 1,
                size,
            };

            // If item is a node, set it as context node
            if (this.isNode(item)) {
                itemContext.node = item;
            }

            // For non-node items, we need to make the item available
            // In XPath 3.0, the context item can be an atomic value
            // We store it in a special way that expressions can access
            (itemContext as any).contextItem = item;

            const rightValue = this.right.evaluate(itemContext);
            this.appendResults(results, rightValue);
        }

        return results;
    }

    /**
     * Normalize a value to a sequence (array).
     */
    private normalizeToSequence(value: XPathResult): any[] {
        if (value === null || value === undefined) {
            return [];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return [value];
    }

    /**
     * Check if a value is a DOM node.
     */
    private isNode(value: any): boolean {
        return value && typeof value === 'object' && 'nodeType' in value;
    }

    /**
     * Append results to the output array, flattening sequences.
     */
    private appendResults(results: any[], value: XPathResult): void {
        if (value === null || value === undefined) {
            return;
        }
        if (Array.isArray(value)) {
            results.push(...value);
        } else {
            results.push(value);
        }
    }

    toString(): string {
        return `${this.left} ! ${this.right}`;
    }
}
