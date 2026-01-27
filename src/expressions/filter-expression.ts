import { XPathExpression } from './expression';
import { XPathContext } from '../context';
import { XPathPredicate } from './predicate-expression';

/**
 * Represents a filter expression in XPath 2.0.
 *
 * A filter expression is a primary expression followed by one or more predicates.
 * The predicates are evaluated against each item in the result of the primary expression.
 *
 * Syntax: PrimaryExpr Predicate*
 * Examples:
 *   - (1 to 10)[. > 5]          Filter with boolean predicate
 *   - (1, 2, 3)[2]              Filter with numeric predicate (position)
 *   - (1 to 10)[position() mod 2 = 0]  Filter with position-based predicate
 */
export class XPathFilterExpression extends XPathExpression {
    /**
     * The primary expression to be filtered.
     */
    expression: XPathExpression;

    /**
     * The list of predicates to apply to the expression result.
     */
    predicates: XPathExpression[];

    constructor(expression: XPathExpression, predicates: XPathExpression[]) {
        super();
        this.expression = expression;
        this.predicates = predicates || [];
    }

    /**
     * Evaluate the filter expression.
     *
     * Steps:
     * 1. Evaluate the primary expression to get a sequence
     * 2. For each predicate:
     *    a. Set position/size in context
     *    b. Evaluate predicate for each item
     *    c. Keep items where predicate test succeeds
     * 3. Return the filtered result
     *
     * @param context The evaluation context
     * @returns The filtered sequence
     */
    evaluate(context: XPathContext): any[] {
        // Step 1: Evaluate the primary expression
        let result = this.expression.evaluate(context);

        // Ensure result is an array
        if (!Array.isArray(result)) {
            result = result === undefined || result === null ? [] : [result];
        }

        // Step 2: Apply each predicate to filter the result
        for (const predicateExpr of this.predicates) {
            result = this.applyPredicate(result, predicateExpr, context);
        }

        return result;
    }

    /**
     * Apply a single predicate to filter the result sequence.
     *
     * For each item in the sequence:
     * - Set position and size in context
     * - Evaluate the predicate
     * - Test if the predicate matches
     * - Keep the item if it matches
     *
     * @param items The sequence to filter
     * @param predicateExpr The predicate expression
     * @param context The evaluation context
     * @returns The filtered sequence
     */
    private applyPredicate(
        items: any[],
        predicateExpr: XPathExpression,
        context: XPathContext
    ): any[] {
        const result: any[] = [];

        // Iterate through each item with position and size
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemContext: XPathContext = {
                ...context,
                node: item?.nodeType !== undefined ? item : context.node,
                position: i + 1, // XPath uses 1-based indexing
                size: items.length,
            };

            // Evaluate the predicate for this item
            if (this.testPredicate(predicateExpr, itemContext)) {
                result.push(item);
            }
        }

        return result;
    }

    /**
     * Test if a predicate expression matches in the given context.
     *
     * A predicate matches if:
     * - It evaluates to a number equal to the context position (numeric predicate)
     * - It evaluates to true (boolean predicate)
     *
     * @param predicateExpr The predicate expression
     * @param context The evaluation context with position/size
     * @returns True if the predicate matches
     */
    private testPredicate(predicateExpr: XPathExpression, context: XPathContext): boolean {
        const result = predicateExpr.evaluate(context);

        // Numeric predicate: test if number equals context position
        if (typeof result === 'number') {
            return result === context.position;
        }

        // Boolean predicate: convert to boolean using XPath rules
        return this.toBoolean(result);
    }

    /**
     * Convert a value to boolean using XPath rules.
     *
     * XPath boolean conversion rules:
     * - boolean: use as-is
     * - number: 0 or NaN is false, otherwise true
     * - string: empty string is false, non-empty is true
     * - array/sequence: non-empty is true, empty is false
     * - object/node: true
     * - null/undefined: false
     *
     * @param value The value to convert
     * @returns The boolean result
     */
    private toBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value !== 0 && !isNaN(value);
        }
        if (typeof value === 'string') {
            return value.length > 0;
        }
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        if (value === null || value === undefined) {
            return false;
        }
        return true;
    }
}

/**
 * Helper class for combining a filter expression with a subsequent location path.
 *
 * This represents expressions like: (primary-expr)[predicates]/steps
 * The filter expression is evaluated first, then the location path is applied to each result.
 *
 * @internal
 */
export class FilteredPathExpression extends XPathExpression {
    /**
     * The filter expression to evaluate first.
     */
    filterExpr: XPathExpression;

    /**
     * The location path to apply to the filter results.
     */
    pathExpr: XPathExpression;

    constructor(filterExpr: XPathExpression, pathExpr: XPathExpression) {
        super();
        this.filterExpr = filterExpr;
        this.pathExpr = pathExpr;
    }

    /**
     * Evaluate by first evaluating the filter expression,
     * then applying the path expression to each result.
     *
     * @param context The evaluation context
     * @returns The combined result
     */
    evaluate(context: XPathContext): any[] {
        // Step 1: Evaluate the filter expression to get initial items
        const items = this.filterExpr.evaluate(context);

        if (!Array.isArray(items)) {
            return [];
        }

        // Step 2: Apply the path expression to each item
        const result: any[] = [];

        for (const item of items) {
            const itemContext: XPathContext = {
                ...context,
                node: item?.nodeType !== undefined ? item : context.node,
            };

            const pathResult = this.pathExpr.evaluate(itemContext);
            if (Array.isArray(pathResult)) {
                result.push(...pathResult);
            } else if (pathResult !== undefined && pathResult !== null) {
                result.push(pathResult);
            }
        }

        return result;
    }
}
