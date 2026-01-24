/**
 * XPath 2.0 For Expression (Section 3.7)
 * Supports one or more variable bindings with sequential expansion.
 */
import { XPathContext, XPathResult } from '../context';
import { XPathExpression } from './expression';

export interface XPathForBinding {
    variable: string;
    expression: XPathExpression;
}

export class XPathForExpression extends XPathExpression {
    bindings: XPathForBinding[];
    returnExpr: XPathExpression;

    constructor(bindings: XPathForBinding[], returnExpr: XPathExpression) {
        super();
        this.bindings = bindings;
        this.returnExpr = returnExpr;
    }

    evaluate(context: XPathContext): XPathResult {
        const initialVariables = context.variables ? { ...context.variables } : {};
        const initialContext: XPathContext = { ...context, variables: initialVariables };
        const results: any[] = [];

        this.evaluateBinding(0, initialContext, results);
        return results;
    }

    private evaluateBinding(index: number, currentContext: XPathContext, results: any[]): void {
        // Base case: evaluate the return expression with accumulated bindings
        if (index >= this.bindings.length) {
            const value = this.returnExpr.evaluate(currentContext);
            this.appendResult(results, value);
            return;
        }

        const binding = this.bindings[index];
        const sequence = this.normalizeSequence(binding.expression.evaluate(currentContext));
        const size = sequence.length;

        for (let i = 0; i < size; i++) {
            const item = sequence[i];
            const variables = { ...(currentContext.variables ?? {}), [binding.variable]: item };
            const iterationContext: XPathContext = {
                ...currentContext,
                variables,
                node: this.resolveNode(item, currentContext),
                position: i + 1,
                size,
            };

            this.evaluateBinding(index + 1, iterationContext, results);
        }
    }

    private normalizeSequence(value: XPathResult): any[] {
        if (value === null || value === undefined) {
            return [];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return [value];
    }

    private appendResult(results: any[], value: XPathResult): void {
        if (value === null || value === undefined) {
            return;
        }
        if (Array.isArray(value)) {
            results.push(...value);
            return;
        }
        results.push(value);
    }

    private resolveNode(item: any, context: XPathContext) {
        if (item && typeof item === 'object' && 'nodeType' in item) {
            return item;
        }
        return context.node;
    }
}
