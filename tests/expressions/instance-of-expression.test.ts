/**
 * XPath 2.0 Instance Of Expression Tests (Phase 4.1)
 */

import { XPathContext } from '../../src/context';
import { XPathInstanceOfExpression, XPathExpression } from '../../src/expressions';
import { XPathLexer } from '../../src/lexer';
import { XPath20Parser } from '../../src/parser';
import { ITEM_TYPE, OccurrenceIndicator, createAtomicSequenceType, createEmptySequenceType, createItemSequenceType, getAtomicType } from '../../src/types';

class LiteralExpression extends XPathExpression {
    constructor(private readonly value: any) { super(); }
    evaluate(_ctx: XPathContext): any { return this.value; }
}

describe('XPath 2.0 Instance Of Expression (Phase 4.1)', () => {
    const ctx: XPathContext = {};

    it('matches atomic type when value conforms', () => {
        const stringType = getAtomicType('string');
        expect(stringType).toBeDefined();
        const sequenceType = createAtomicSequenceType(stringType!);
        const expr = new XPathInstanceOfExpression(new LiteralExpression('hello'), sequenceType);
        expect(expr.evaluate(ctx)).toBe(true);
    });

    it('rejects mismatched atomic type', () => {
        const stringType = getAtomicType('string');
        const sequenceType = createAtomicSequenceType(stringType!);
        const expr = new XPathInstanceOfExpression(new LiteralExpression(123), sequenceType);
        expect(expr.evaluate(ctx)).toBe(false);
    });

    it('supports occurrence indicators (zero or one)', () => {
        const stringType = getAtomicType('string');
        const optionalString = createAtomicSequenceType(stringType!, OccurrenceIndicator.ZERO_OR_ONE);
        const expr = new XPathInstanceOfExpression(new LiteralExpression(undefined), optionalString);
        expect(expr.evaluate(ctx)).toBe(true);
    });

    it('matches item() wildcard', () => {
        const itemType = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ONE_OR_MORE);
        const expr = new XPathInstanceOfExpression(new LiteralExpression(['a', 'b']), itemType);
        expect(expr.evaluate(ctx)).toBe(true);
    });

    it('matches empty-sequence() when value is empty', () => {
        const emptyType = createEmptySequenceType();
        const expr = new XPathInstanceOfExpression(new LiteralExpression([]), emptyType);
        expect(expr.evaluate(ctx)).toBe(true);
    });

    it('parses instance of expressions via parser', () => {
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();
        const tokens = lexer.scan("'abc' instance of xs:string");
        const ast = parser.parse(tokens);
        expect(ast.evaluate(ctx)).toBe(true);
    });

    it('parses occurrence indicator ?', () => {
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();
        const tokens = lexer.scan("'' instance of xs:string?");
        const ast = parser.parse(tokens);
        expect(ast.evaluate(ctx)).toBe(true);
    });
});
