import { XPathExpression } from './expression';

export type ArithmeticOperator = '+' | '-' | '*' | 'div' | 'mod';

export class XPathArithmeticExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;
    operator: ArithmeticOperator;

    constructor(left: XPathExpression, right: XPathExpression, operator: ArithmeticOperator) {
        super();
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    evaluate(context: any): number {
        const leftValue = Number(this.left.evaluate(context));
        const rightValue = Number(this.right.evaluate(context));

        switch (this.operator) {
            case '+':
                return leftValue + rightValue;
            case '-':
                return leftValue - rightValue;
            case '*':
                return leftValue * rightValue;
            case 'div':
                return leftValue / rightValue;
            case 'mod':
                return leftValue % rightValue;
            default:
                throw new Error(`Unknown arithmetic operator: ${this.operator}`);
        }
    }
}
