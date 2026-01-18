import { XPathContext } from '../context';
import { XPathExpression } from './expression';

export class XPathBinaryExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;
    operator: string;

    constructor(left: XPathExpression, right: XPathExpression, operator: string) {
        super();
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    evaluate(context: XPathContext): boolean {
        const leftValue = this.left.evaluate(context);
        const rightValue = this.right.evaluate(context);

        switch (this.operator) {
            /* case '+':
                return leftValue + rightValue;
            case '-':
                return leftValue - rightValue;
            case '*':
                return leftValue * rightValue;
            case '/':
                return leftValue / rightValue; */
            case '=':
                return leftValue === rightValue;
            case '!=':
                return leftValue !== rightValue;
            case '<':
                return leftValue < rightValue;
            case '>':
                return leftValue > rightValue;
            case '<=':
                return leftValue <= rightValue;
            case '>=':
                return leftValue >= rightValue;
            default:
                throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}