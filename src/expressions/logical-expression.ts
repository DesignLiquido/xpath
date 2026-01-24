import { XPathContext, XPathResult } from '../context';
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

    // Effective Boolean Value (EBV) per XPath 2.0 rules (simplified)
    private toBoolean(value: XPathResult): boolean {
        // Empty sequence -> false
        if (value === null || value === undefined) {
            return false;
        }

        // Boolean stays as is
        if (typeof value === 'boolean') {
            return value;
        }

        // Sequence handling
        if (Array.isArray(value)) {
            if (value.length === 0) return false;
            if (value.length === 1) return this.toBoolean(value[0] as XPathResult);
            // Multiple items: treat non-empty sequence as true (node-sequence case)
            return true;
        }

        // Number: false if 0 or NaN
        if (typeof value === 'number') {
            return value !== 0 && !isNaN(value);
        }

        // String: true if non-empty
        if (typeof value === 'string') {
            return value.length > 0;
        }

        // Fallback for maps/functions/other values
        return !!value;
    }

    evaluate(context: XPathContext): boolean {
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
