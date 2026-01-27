/**
 * XPath 3.0 Inline Function Expression (Section 3.1.7)
 *
 * Syntax: function($param1 as Type1, $param2 as Type2) as ReturnType { body-expr }
 *
 * Inline functions create anonymous function items with access to
 * variables in the enclosing scope (closure).
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-inline-func
 */

import { XPathContext, XPathResult, XPathFunctionItem } from '../context';
import { SequenceType } from '../types';
import { XPathExpression } from './expression';

/**
 * Represents a parameter in an inline function definition.
 */
export interface InlineFunctionParameter {
    /** Parameter name (without $) */
    name: string;
    /** Optional type annotation */
    type?: SequenceType;
}

/**
 * XPath 3.0 Inline Function Expression
 *
 * Creates an anonymous function item that can be:
 * - Stored in a variable
 * - Passed to higher-order functions
 * - Invoked dynamically
 *
 * Examples:
 *   function($x) { $x + 1 }
 *   function($x as xs:integer) as xs:integer { $x * 2 }
 *   function($a, $b) { $a + $b }
 *
 * Inline functions capture their lexical environment (closure):
 *   let $multiplier := 3
 *   return function($x) { $x * $multiplier }
 */
export class XPathInlineFunctionExpression extends XPathExpression {
    /** Function parameters */
    params: InlineFunctionParameter[];
    /** Function body expression */
    body: XPathExpression;
    /** Optional return type annotation */
    returnType?: SequenceType;

    constructor(
        params: InlineFunctionParameter[],
        body: XPathExpression,
        returnType?: SequenceType
    ) {
        super();
        this.params = params;
        this.body = body;
        this.returnType = returnType;
    }

    evaluate(context: XPathContext): XPathFunctionItem {
        // Capture the current context's variables for closure
        const closureVariables = { ...(context.variables ?? {}) };

        // Create the function implementation
        const self = this;
        const implementation = function (...args: any[]): XPathResult {
            // Create a new context with closure variables and parameter bindings
            const variables: Record<string, any> = { ...closureVariables };

            // Bind arguments to parameters
            for (let i = 0; i < self.params.length; i++) {
                const param = self.params[i];
                const arg = i < args.length ? args[i] : null;
                variables[param.name] = arg;
            }

            // Evaluate body with the new context
            const evalContext: XPathContext = {
                ...context,
                variables,
            };

            return self.body.evaluate(evalContext);
        };

        // Create and return the function item
        return {
            __isFunctionItem: true as const,
            implementation,
            arity: this.params.length,
            name: undefined,
            namespace: undefined,
        };
    }

    toString(): string {
        const paramsStr = this.params
            .map((p) => {
                let s = `$${p.name}`;
                if (p.type) s += ` as ${p.type}`;
                return s;
            })
            .join(', ');

        let result = `function(${paramsStr})`;
        if (this.returnType) {
            result += ` as ${this.returnType}`;
        }
        result += ` { ${this.body} }`;
        return result;
    }
}
