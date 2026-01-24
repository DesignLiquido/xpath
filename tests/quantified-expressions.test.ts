/**
 * XPath 2.0 Quantified Expressions Tests (Section 3.9)
 */

import { XPathContext } from '../src/context';
import { XPathExpression } from '../src/expressions/expression';
import { XPathQuantifiedBinding, XPathQuantifiedExpression } from '../src/expressions/quantified-expression';
import { XPathVariableReference } from '../src/expressions/variable-reference-expression';
import { XPathBinaryExpression } from '../src/expressions/binary-expression';
import { XPathLexer } from '../src/lexer';
import { XPath20Parser } from '../src/parser';

class LiteralExpression extends XPathExpression {
    constructor(private value: any) { super(); }
    evaluate(_ctx: XPathContext): any { return this.value; }
}

describe('XPath 2.0 Quantified Expressions (Phase 3.3)', () => {
    const ctx: XPathContext = {};

    it('evaluates some quantifier (existential)', () => {
        const bindings: XPathQuantifiedBinding[] = [
            { variable: 'x', expression: new LiteralExpression([0, 1, 2]) },
        ];
        const pred = new XPathBinaryExpression(new XPathVariableReference('x'), new LiteralExpression(1), '>');
        const expr = new XPathQuantifiedExpression('some', bindings, pred);
        expect(expr.evaluate(ctx)).toBe(true);
    });

    it('evaluates every quantifier (universal)', () => {
        const bindings: XPathQuantifiedBinding[] = [
            { variable: 'x', expression: new LiteralExpression([1, 2, 3]) },
        ];
        const pred = new XPathBinaryExpression(new XPathVariableReference('x'), new LiteralExpression(0), '>');
        const expr = new XPathQuantifiedExpression('every', bindings, pred);
        expect(expr.evaluate(ctx)).toBe(true);
    });

    it('handles empty sequence: some => false, every => true', () => {
        const emptyBinding: XPathQuantifiedBinding = { variable: 'x', expression: new LiteralExpression(null) };
        const pred = new XPathBinaryExpression(new XPathVariableReference('x'), new LiteralExpression(0), '>');
        expect(new XPathQuantifiedExpression('some', [emptyBinding], pred).evaluate(ctx)).toBe(false);
        expect(new XPathQuantifiedExpression('every', [emptyBinding], pred).evaluate(ctx)).toBe(true);
    });

    it('supports multiple bindings (Cartesian expansion)', () => {
        const bindings: XPathQuantifiedBinding[] = [
            { variable: 'x', expression: new LiteralExpression([1, 2]) },
            { variable: 'y', expression: new LiteralExpression([10]) },
        ];
        const pred = new XPathBinaryExpression(
            new XPathVariableReference('x'),
            new XPathBinaryExpression(new XPathVariableReference('y'), new LiteralExpression(5), '>'),
            '>'
        );
        const someExpr = new XPathQuantifiedExpression('some', bindings, pred);
        expect(someExpr.evaluate(ctx)).toBe(true);
    });

    describe('Parser integration', () => {
        const lexer = new XPathLexer();
        const parser = new XPath20Parser();

        function parseEval(expression: string, context: XPathContext): any {
            const tokens = lexer.scan(expression);
            const ast = parser.parse(tokens);
            return ast.evaluate(context);
        }

        it('parses some quantifier', () => {
            const context: XPathContext = {
                functions: {
                    seq: () => [1, 2, 3],
                },
            };
            const result = parseEval('some $x in seq() satisfies $x > 2', context);
            expect(result).toBe(true);
        });

        it('parses every quantifier with multiple bindings', () => {
            const context: XPathContext = {
                functions: {
                    a: () => [1, 2],
                    b: () => [10],
                },
            };
            const result = parseEval('every $x in a(), $y in b() satisfies $y > $x', context);
            expect(result).toBe(true);
        });
    });
});
