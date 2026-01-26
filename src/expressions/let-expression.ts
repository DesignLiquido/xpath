/**
 * XPath 3.0 Let Expression (Section 3.12)
 *
 * Syntax: let $x := expr1, $y := expr2 return expr3
 *
 * The let expression binds variables to values and makes them available
 * in the return expression. Unlike for expressions, let does not iterate -
 * it simply assigns values to variables.
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-let-expressions
 */

import { XPathContext, XPathResult } from '../context';
import { SequenceType } from '../types';
import { XPathExpression } from './expression';

/**
 * Represents a single variable binding in a let expression.
 */
export interface XPathLetBinding {
    /** Variable name (without $) */
    variable: string;
    /** Expression whose value is bound to the variable */
    expression: XPathExpression;
    /** Optional type annotation */
    type?: SequenceType;
}

/**
 * XPath 3.0 Let Expression
 *
 * Examples:
 *   let $x := 5 return $x * 2                    → 10
 *   let $x := 1, $y := 2 return $x + $y          → 3
 *   let $items := (1, 2, 3) return sum($items)   → 6
 */
export class XPathLetExpression extends XPathExpression {
    bindings: XPathLetBinding[];
    returnExpr: XPathExpression;

    constructor(bindings: XPathLetBinding[], returnExpr: XPathExpression) {
        super();
        this.bindings = bindings;
        this.returnExpr = returnExpr;
    }

    evaluate(context: XPathContext): XPathResult {
        // Start with existing variables
        const variables = { ...(context.variables ?? {}) };

        // Evaluate each binding and add to variables
        let currentContext: XPathContext = { ...context, variables };

        for (const binding of this.bindings) {
            const value = binding.expression.evaluate(currentContext);
            variables[binding.variable] = value;
            currentContext = { ...currentContext, variables: { ...variables } };
        }

        // Evaluate return expression with all bindings in scope
        return this.returnExpr.evaluate(currentContext);
    }

    toString(): string {
        const bindingStrs = this.bindings.map(b => `$${b.variable} := ${b.expression}`);
        return `let ${bindingStrs.join(', ')} return ${this.returnExpr}`;
    }
}
