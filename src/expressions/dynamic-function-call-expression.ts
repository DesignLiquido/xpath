/**
 * XPath 3.0 Dynamic Function Call (Section 3.2)
 *
 * Syntax: $func($arg1, $arg2, ...)
 *
 * A dynamic function call invokes a function item stored in a variable
 * or returned by an expression.
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-dynamic-function-call
 */

import { XPathContext, XPathResult, XPathFunctionItem } from '../context';
import { XPathExpression } from './expression';
import { isXPathMap } from './map-constructor-expression';
import { isXPathArray, getArrayMember } from './array-constructor-expression';

/**
 * Check if a value is a function item.
 */
function isFunctionItem(value: any): value is XPathFunctionItem {
    return value && typeof value === 'object' && value.__isFunctionItem === true;
}

/**
 * XPath 3.0 Dynamic Function Call
 *
 * Evaluates a function expression to get a function item,
 * then invokes it with the provided arguments.
 *
 * Examples:
 *   let $f := fn:upper-case#1 return $f("hello")    → "HELLO"
 *   let $add := function($a, $b) { $a + $b } return $add(2, 3)    → 5
 *   $callback($x, $y)
 *
 * Used when:
 * - Invoking a function stored in a variable
 * - Using arrow operator with variable function references
 * - Higher-order function callbacks
 */
export class XPathDynamicFunctionCall extends XPathExpression {
    /** Expression that evaluates to a function item */
    functionExpr: XPathExpression;
    /** Arguments to pass to the function */
    args: XPathExpression[];

    constructor(functionExpr: XPathExpression, args: XPathExpression[]) {
        super();
        this.functionExpr = functionExpr;
        this.args = args;
    }

    evaluate(context: XPathContext): XPathResult {
        // Evaluate the function expression to get a function item
        const funcValue = this.functionExpr.evaluate(context) as any;

        // XPath 3.1: Maps are single-argument functions (key lookup)
        if (isXPathMap(funcValue)) {
            if (this.args.length !== 1) {
                throw new Error(`Map lookup expects 1 argument but got ${this.args.length}`);
            }
            const key = String(this.args[0].evaluate(context));
            const value = funcValue[key];
            if (value === undefined) {
                throw new Error(`XPDY0002: Key "${key}" not found in map`);
            }
            return value;
        }

        // XPath 3.1: Arrays are single-argument functions (position lookup)
        if (isXPathArray(funcValue)) {
            if (this.args.length !== 1) {
                throw new Error(`Array lookup expects 1 argument but got ${this.args.length}`);
            }
            const position = Number(this.args[0].evaluate(context));
            return getArrayMember(funcValue, position);
        }

        // Check if it's a function item
        if (isFunctionItem(funcValue)) {
            const funcItem = funcValue as XPathFunctionItem;

            // Check arity
            if (funcItem.arity !== this.args.length) {
                throw new Error(
                    `Function expects ${funcItem.arity} arguments but got ${this.args.length}`
                );
            }

            // Evaluate arguments
            const evaluatedArgs = this.args.map((arg) => arg.evaluate(context));

            // Invoke the function
            return funcItem.implementation(...evaluatedArgs);
        }

        // Also check if it's a native JavaScript function (for compatibility)
        if (typeof funcValue === 'function') {
            // Evaluate arguments
            const evaluatedArgs = this.args.map((arg) => arg.evaluate(context));
            return funcValue(...evaluatedArgs);
        }

        throw new Error('Dynamic function call: expression does not evaluate to a function item');
    }

    toString(): string {
        const argsStr = this.args.map((a) => a.toString()).join(', ');
        return `${this.functionExpr}(${argsStr})`;
    }
}
