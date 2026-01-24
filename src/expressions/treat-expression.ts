import { XPathContext } from '../context';
import { XPathExpression } from './expression';
import { SequenceType } from '../types';
import { matchesSequenceType } from '../types/sequence-type-matcher';

/**
 * XPath 2.0 Treat Expression (Section 3.10.5)
 * Dynamically asserts that the operand matches a SequenceType; throws on mismatch.
 */
export class XPathTreatExpression extends XPathExpression {
    constructor(
        private readonly expression: XPathExpression,
        private readonly sequenceType: SequenceType
    ) {
        super();
    }

    evaluate(context: XPathContext): any {
        const value = this.expression.evaluate(context);
        const result = matchesSequenceType(value, this.sequenceType);

        if (!result.matches) {
            const reason = result.reason ?? `Value does not match ${this.sequenceType.toString()}`;
            throw new Error(`Treat expression type mismatch: ${reason}`);
        }

        return value;
    }
}
