import { XPathExpression } from './expression';

export class XPathFilterExpression extends XPathExpression {
    expression: XPathExpression;
    predicate: XPathExpression;

    constructor(expression: XPathExpression, predicate: XPathExpression) {
        super();
        this.expression = expression;
        this.predicate = predicate;
    }

    evaluate(context: any): any[] {
        /* const result = this.expression.evaluate(context);
        return result.filter(item => this.predicate.evaluate(item)); */
        return [];
    }
}
