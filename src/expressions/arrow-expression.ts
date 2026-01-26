/**
 * XPath 3.0 Arrow Operator (=>) (Section 3.4)
 *
 * Syntax: expr => func(args)
 *
 * The arrow operator is syntactic sugar that allows function calls
 * to be chained in a more readable left-to-right style.
 * expr => f(arg2, arg3) is equivalent to f(expr, arg2, arg3)
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-arrow-operator
 */

import { XPathContext, XPathResult } from '../context';
import { XPathExpression } from './expression';
import { XPathFunctionCall } from './function-call-expression';

/**
 * XPath 3.0 Arrow Expression (=>)
 *
 * The expression before => becomes the first argument to the function.
 *
 * Examples:
 *   "hello" => upper-case()                  → "HELLO"
 *   "hello" => substring(2, 3)               → "ell"
 *   $input => upper-case() => substring(1, 3) → "HEL"
 *   (1, 2, 3) => sum()                        → 6
 */
export class XPathArrowExpression extends XPathExpression {
    /** The expression that becomes the first argument */
    input: XPathExpression;
    /** The function name (may include namespace prefix) */
    functionName: string;
    /** Additional arguments (after the implicit first argument) */
    args: XPathExpression[];

    constructor(input: XPathExpression, functionName: string, args: XPathExpression[]) {
        super();
        this.input = input;
        this.functionName = functionName;
        this.args = args;
    }

    evaluate(context: XPathContext): XPathResult {
        // The arrow operator transforms expr => f(args) into f(expr, args)
        // We create a function call with the input as the first argument
        const allArgs = [this.input, ...this.args];
        const funcCall = new XPathFunctionCall(this.functionName, allArgs);
        return funcCall.evaluate(context);
    }

    toString(): string {
        const argsStr = this.args.length > 0
            ? this.args.map(a => a.toString()).join(', ')
            : '';
        return `${this.input} => ${this.functionName}(${argsStr})`;
    }
}
