import { XPathExpression } from './expression';

export class XPathLogicalExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;
    operator: 'and' | 'or';

    constructor(left: XPathExpression, right: XPathExpression, operator: 'and' | 'or') {
        super();
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

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
        return !!value;
    }

    evaluate(context: any): boolean {
        const leftValue = this.toBoolean(this.left.evaluate(context));

        // Short-circuit evaluation
        if (this.operator === 'and') {
            if (!leftValue) return false;
            return this.toBoolean(this.right.evaluate(context));
        }

        if (this.operator === 'or') {
            if (leftValue) return true;
            return this.toBoolean(this.right.evaluate(context));
        }

        throw new Error(`Unknown logical operator: ${this.operator}`);
    }
}
