/**
 * XPath 2.0 Castable Expression Tests (Phase 4.3)
 */

import { XPathContext } from '../../src/context';
import { XPathCastableExpression, XPathExpression } from '../../src/expressions';
import { XPathLexer } from '../../src/lexer';
import { XPath20Parser } from '../../src/parser';
import { ITEM_TYPE, OccurrenceIndicator, createAtomicSequenceType, createItemSequenceType, getAtomicType } from '../../src/types';

class LiteralExpression extends XPathExpression {
    constructor(private readonly value: any) { super(); }
    evaluate(_ctx: XPathContext): any { return this.value; }
}

describe('XPath 2.0 Castable Expression (Phase 4.3)', () => {
    const ctx: XPathContext = {};

    it('returns true when cast succeeds', () => {
        const stringType = getAtomicType('string');
        const sequenceType = createAtomicSequenceType(stringType!);
        const expr = new XPathCastableExpression(new LiteralExpression('123'), sequenceType);
        expect(expr.evaluate(ctx)).toBe(true);
    });

    it('returns false when cast fails', () => {
        const intType = getAtomicType('int');
        const sequenceType = createAtomicSequenceType(intType!);
        const expr = new XPathCastableExpression(new LiteralExpression('abc'), sequenceType);
        expect(expr.evaluate(ctx)).toBe(false);
    });

    it('enforces single-item cardinality', () => {
        const intType = getAtomicType('int');
        const sequenceType = createAtomicSequenceType(intType!);
        const expr = new XPathCastableExpression(new LiteralExpression([1, 2]), sequenceType);
        expect(expr.evaluate(ctx)).toBe(false);
    });

    it('supports empty sequence only when type allows zero-or-one', () => {
        const intType = getAtomicType('int');
        const optionalInt = createAtomicSequenceType(intType!, OccurrenceIndicator.ZERO_OR_ONE);
        const requiredInt = createAtomicSequenceType(intType!);
        const optionalExpr = new XPathCastableExpression(new LiteralExpression([]), optionalInt);
        const requiredExpr = new XPathCastableExpression(new LiteralExpression([]), requiredInt);
        expect(optionalExpr.evaluate(ctx)).toBe(true);
        expect(requiredExpr.evaluate(ctx)).toBe(false);
    });

    it('returns false when target is not atomic', () => {
        const itemType = createItemSequenceType(ITEM_TYPE);
        const expr = new XPathCastableExpression(new LiteralExpression('abc'), itemType);
        expect(expr.evaluate(ctx)).toBe(false);
    });

    it('parses castable as via parser', () => {
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();
        const tokens = lexer.scan("'123' castable as xs:int");
        const ast = parser.parse(tokens);
        expect(ast.evaluate(ctx)).toBe(true);
    });

    it('parses castable with ? occurrence', () => {
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();
        const tokens = lexer.scan("() castable as xs:int?");
        const ast = parser.parse(tokens);
        expect(ast.evaluate(ctx)).toBe(true);
    });
});
