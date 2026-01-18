import { XPathExpression } from './expression';

export class XPathPredicate extends XPathExpression {
    expression: XPathExpression;

    constructor(expression: XPathExpression) {
        super();
        this.expression = expression;
    }

    evaluate(context: any): any {
        return this.expression.evaluate(context);
    }

    test(context: any): boolean {
        const result = this.evaluate(context);

        // If the result is a number, compare with position
        if (typeof result === 'number') {
            return result === context?.position;
        }

        // Otherwise convert to boolean
        return this.toBoolean(result);
    }

    private toBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
    }
}
