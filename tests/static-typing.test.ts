import {
    XS,
    exactlyOne,
    inferLiteral,
    inferArithmetic,
    inferComparison,
    inferSequence,
    inferType,
} from '../src/static-typing';

describe('Static Typing (minimal scaffolding)', () => {
    test('inferLiteral for primitives', () => {
        expect(inferLiteral('abc')).toEqual(exactlyOne(XS.string));
        expect(inferLiteral(42)).toEqual(exactlyOne(XS.double));
        expect(inferLiteral(true)).toEqual(exactlyOne(XS.boolean));
    });

    test('inferArithmetic returns double', () => {
        const t = inferArithmetic(exactlyOne(XS.integer), exactlyOne(XS.decimal));
        expect(t).toEqual(exactlyOne(XS.double));
    });

    test('inferComparison returns boolean', () => {
        expect(inferComparison()).toEqual(exactlyOne(XS.boolean));
    });

    test('inferSequence aggregates to item() with proper cardinality', () => {
        const s1 = inferSequence([exactlyOne(XS.string), exactlyOne(XS.integer)]);
        expect(s1).toEqual({ name: XS.item, cardinality: 'one-or-more' });

        const s2 = inferSequence([]);
        expect(s2).toEqual({ name: XS.item, cardinality: 'zero-or-more' });
    });

    test('inferType basic AST nodes', () => {
        const env = {} as any;

        expect(inferType({ kind: 'StringLiteral', value: 'x' }, env)).toEqual(
            exactlyOne(XS.string)
        );
        expect(inferType({ kind: 'NumericLiteral', value: '5' }, env)).toEqual(
            exactlyOne(XS.double)
        );
        expect(inferType({ kind: 'BooleanLiteral', value: true }, env)).toEqual(
            exactlyOne(XS.boolean)
        );

        const bin = {
            kind: 'BinaryExpression',
            operator: '+',
            left: { kind: 'NumericLiteral', value: '1' },
            right: { kind: 'NumericLiteral', value: '2' },
        };
        expect(inferType(bin, env)).toEqual(exactlyOne(XS.double));

        const cmp = {
            kind: 'BinaryExpression',
            operator: 'eq',
            left: { kind: 'StringLiteral', value: 'a' },
            right: { kind: 'StringLiteral', value: 'b' },
        };
        expect(inferType(cmp, env)).toEqual(exactlyOne(XS.boolean));

        const seq = {
            kind: 'SequenceExpression',
            items: [
                { kind: 'StringLiteral', value: 'a' },
                { kind: 'NumericLiteral', value: '2' },
            ],
        };
        expect(inferType(seq, env)).toEqual({ name: XS.item, cardinality: 'one-or-more' });
    });
});
