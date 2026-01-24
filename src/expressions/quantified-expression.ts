/**
 * XPath 2.0 Quantified Expressions (Section 3.9)
 * Implements `some` (existential) and `every` (universal) quantifiers with one or more bindings.
 */
import { XPathContext, XPathResult } from '../context';
import { XPathExpression } from './expression';

export interface XPathQuantifiedBinding {
    variable: string;
    expression: XPathExpression;
}

export type Quantifier = 'some' | 'every';

export class XPathQuantifiedExpression extends XPathExpression {
    quantifier: Quantifier;
    bindings: XPathQuantifiedBinding[];
    satisfiesExpr: XPathExpression;

    constructor(quantifier: Quantifier, bindings: XPathQuantifiedBinding[], satisfiesExpr: XPathExpression) {
        super();
        this.quantifier = quantifier;
        this.bindings = bindings;
        this.satisfiesExpr = satisfiesExpr;
    }

    evaluate(context: XPathContext): XPathResult {
        const initialVariables = context.variables ? { ...context.variables } : {};
        const initialContext: XPathContext = { ...context, variables: initialVariables };

        if (this.quantifier === 'some') {
            return this.evaluateSome(0, initialContext);
        }
        return this.evaluateEvery(0, initialContext);
    }

    private evaluateSome(index: number, currentContext: XPathContext): boolean {
        if (index >= this.bindings.length) {
            return this.toBoolean(this.satisfiesExpr.evaluate(currentContext));
        }

        const binding = this.bindings[index];
        const sequence = this.normalizeSequence(binding.expression.evaluate(currentContext));

        for (let i = 0; i < sequence.length; i++) {
            const item = sequence[i];
            const variables = { ...(currentContext.variables ?? {}), [binding.variable]: item };
            const iterationContext: XPathContext = {
                ...currentContext,
                variables,
                node: this.resolveNode(item, currentContext),
                position: i + 1,
                size: sequence.length,
            };

            if (this.evaluateSome(index + 1, iterationContext)) {
                return true; // short-circuit on first match
            }
        }

        return false; // no binding satisfied predicate
    }

    private evaluateEvery(index: number, currentContext: XPathContext): boolean {
        if (index >= this.bindings.length) {
            return this.toBoolean(this.satisfiesExpr.evaluate(currentContext));
        }

        const binding = this.bindings[index];
        const sequence = this.normalizeSequence(binding.expression.evaluate(currentContext));

        // Vacuous truth: empty sequence means this binding imposes no constraint
        if (sequence.length === 0) {
            return true;
        }

        for (let i = 0; i < sequence.length; i++) {
            const item = sequence[i];
            const variables = { ...(currentContext.variables ?? {}), [binding.variable]: item };
            const iterationContext: XPathContext = {
                ...currentContext,
                variables,
                node: this.resolveNode(item, currentContext),
                position: i + 1,
                size: sequence.length,
            };

            if (!this.evaluateEvery(index + 1, iterationContext)) {
                return false; // short-circuit on first failure
            }
        }

        return true;
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

    private resolveNode(item: any, context: XPathContext) {
        if (item && typeof item === 'object' && 'nodeType' in item) {
            return item;
        }
        return context.node;
    }

    // Boolean conversion aligning with XPath EBV rules (simplified for current types)
    private toBoolean(value: XPathResult): boolean {
        if (value === null || value === undefined) return false;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
    }
}
