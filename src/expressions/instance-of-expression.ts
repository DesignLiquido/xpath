import { XPathContext } from '../context';
import { matchesSequenceType, SequenceType } from '../types';
import { XPathExpression } from './expression';

export class XPathInstanceOfExpression extends XPathExpression {
    constructor(
        private readonly expression: XPathExpression,
        private readonly sequenceType: SequenceType
    ) {
        super();
    }

    evaluate(context: XPathContext): boolean {
        const value = this.expression.evaluate(context);
        return matchesSequenceType(value, this.sequenceType).matches;
    }
}
