import { XPathContext } from '../../src/context';
import { XPathLexer } from '../../src/lexer';
import { XPath20Parser } from '../../src/parser';
import { XPathTreatExpression } from '../../src/expressions';
import { OccurrenceIndicator, createAtomicSequenceType, getAtomicType } from '../../src/types';
import { XPathExpression } from '../../src/expressions/expression';

class LiteralExpression extends XPathExpression {
    constructor(private readonly value: any) { super(); }
    evaluate(_ctx: XPathContext): any { return this.value; }
}

describe('XPath 2.0 Treat Expression (Phase 4.4)', () => {
    const ctx: XPathContext = {};

    it('returns the value when it matches the SequenceType', () => {
        const intType = getAtomicType('int');
        const sequenceType = createAtomicSequenceType(intType!);
        const expr = new XPathTreatExpression(new LiteralExpression(123), sequenceType);
        expect(expr.evaluate(ctx)).toBe(123);
    });

    it('throws when the value does not match the SequenceType', () => {
        const intType = getAtomicType('int');
        const sequenceType = createAtomicSequenceType(intType!);
        const expr = new XPathTreatExpression(new LiteralExpression('abc'), sequenceType);
        expect(() => expr.evaluate(ctx)).toThrow('Treat expression type mismatch');
    });

    it('allows empty sequence when the type permits zero-or-one', () => {
        const intType = getAtomicType('int');
        const optionalType = createAtomicSequenceType(intType!, OccurrenceIndicator.ZERO_OR_ONE);
        const expr = new XPathTreatExpression(new LiteralExpression([]), optionalType);
        expect(expr.evaluate(ctx)).toEqual([]);
    });

    it('throws on empty sequence when the type requires at least one item', () => {
        const intType = getAtomicType('int');
        const requiredType = createAtomicSequenceType(intType!);
        const expr = new XPathTreatExpression(new LiteralExpression([]), requiredType);
        expect(() => expr.evaluate(ctx)).toThrow('Treat expression type mismatch');
    });

    it('parses treat as via parser', () => {
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();
        const tokens = lexer.scan('1 treat as xs:int');
        const ast = parser.parse(tokens);
        expect(ast.evaluate(ctx)).toBe(1);
    });

    it('parser throws on runtime mismatch', () => {
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();
        const tokens = lexer.scan("'abc' treat as xs:int");
        const ast = parser.parse(tokens);
        expect(() => ast.evaluate(ctx)).toThrow('Treat expression type mismatch');
    });
});
