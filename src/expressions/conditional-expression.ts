import { XPathContext, XPathResult } from '../context';
import { XPathExpression } from './expression';

export class XPathConditionalExpression extends XPathExpression {
    test: XPathExpression;
    thenExpr: XPathExpression;
    elseExpr: XPathExpression;

    constructor(test: XPathExpression, thenExpr: XPathExpression, elseExpr: XPathExpression) {
        super();
        this.test = test;
        this.thenExpr = thenExpr;
        this.elseExpr = elseExpr;
    }

    // Effective Boolean Value (EBV) per XPath 2.0 rules (simplified)
    private toBoolean(value: XPathResult): boolean {
        if (value === null || value === undefined) return false;

        if (typeof value === 'boolean') return value;

        if (Array.isArray(value)) {
            if (value.length === 0) return false;
            if (value.length === 1) return this.toBoolean(value[0] as XPathResult);
            return true;
        }

        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;

        return !!value;
    }

    evaluate(context: XPathContext): XPathResult {
        const testValue = this.toBoolean(this.test.evaluate(context));
        if (testValue) {
            return this.thenExpr.evaluate(context);
        }
        return this.elseExpr.evaluate(context);
    }
}
