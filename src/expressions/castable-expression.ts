import { XPathContext } from '../context';
import { castAs } from '../types';
import { SequenceType, OccurrenceIndicator } from '../types/sequence-type';
import { XPathExpression } from './expression';

/**
 * XPath 2.0 castable as expression (Section 3.10.3)
 * Returns true if a value can be cast to the given atomic SequenceType without raising an error.
 */
export class XPathCastableExpression extends XPathExpression {
    constructor(
        private readonly expression: XPathExpression,
        private readonly sequenceType: SequenceType
    ) {
        super();
    }

    evaluate(context: XPathContext): boolean {
        const value = this.expression.evaluate(context);
        const sequence = Array.isArray(value)
            ? value
            : value === undefined || value === null
              ? []
              : [value];

        // cardinality: only zero or one item allowed
        if (sequence.length > 1) {
            return false;
        }

        // empty sequence handling
        if (sequence.length === 0) {
            return this.sequenceType.getOccurrence() === OccurrenceIndicator.ZERO_OR_ONE;
        }

        const item = sequence[0];
        const itemType = this.sequenceType.getItemType();

        // Only atomic types supported for casting here
        if (itemType === 'empty' || !itemType.atomicType) {
            return false;
        }

        try {
            castAs(item, itemType.atomicType.name);
            return true;
        } catch {
            return false;
        }
    }
}
