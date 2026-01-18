import { XPathContext } from '../context';
import { XPathExpression } from './expression';

export class XPathUnaryExpression extends XPathExpression {
    operator: string;
    operand: XPathExpression;

    constructor(operator: string, operand: XPathExpression) {
        super();
        this.operator = operator;
        this.operand = operand;
    }

    evaluate(context: XPathContext): number {
        const value = this.operand.evaluate(context);

        switch (this.operator) {
            case '-':
                return -Number(value);
            default:
                throw new Error(`Unknown unary operator: ${this.operator}`);
        }
    }
}
