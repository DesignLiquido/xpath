/**
 * XPath 2.0 For Expression Tests (Section 3.7)
 */

import { XPathContext } from '../../src/context';
import { XPathExpression } from '../../src/expressions/expression';
import { XPathForBinding, XPathForExpression } from '../../src/expressions/for-expression';
import { XPathVariableReference } from '../../src/expressions/variable-reference-expression';
import { XPathArithmeticExpression } from '../../src/expressions/arithmetic-expression';
import { XPathLexer } from '../../src/lexer';
import { XPath20Parser } from '../../src/parser';

class LiteralExpression extends XPathExpression {
    constructor(private value: any) { super(); }
    evaluate(_ctx: XPathContext): any { return this.value; }
}

describe('XPath 2.0 For Expressions (Phase 3.2)', () => {
    const ctx: XPathContext = {};

    it('evaluates single binding to a sequence', () => {
        const bindings: XPathForBinding[] = [
            { variable: 'x', expression: new LiteralExpression([1, 2, 3]) },
        ];
        const expr = new XPathForExpression(bindings, new XPathVariableReference('x'));
        expect(expr.evaluate(ctx)).toEqual([1, 2, 3]);
    });

    it('returns empty sequence for empty binding results', () => {
        const bindings: XPathForBinding[] = [
            { variable: 'x', expression: new LiteralExpression(null) },
        ];
        const expr = new XPathForExpression(bindings, new XPathVariableReference('x'));
        expect(expr.evaluate(ctx)).toEqual([]);
    });

    it('supports multiple bindings with Cartesian expansion', () => {
        const bindings: XPathForBinding[] = [
            { variable: 'x', expression: new LiteralExpression([1, 2]) },
            { variable: 'y', expression: new LiteralExpression([10, 20]) },
        ];
        const sumExpr = new XPathArithmeticExpression(
            new XPathVariableReference('x'),
            new XPathVariableReference('y'),
            '+'
        );
        const expr = new XPathForExpression(bindings, sumExpr);
        expect(expr.evaluate(ctx)).toEqual([11, 21, 12, 22]);
    });

    describe('Parser integration', () => {
        // Use XPath 2.0 lexer to recognize 'for', 'in', 'return' as reserved words
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();

        function parseEval(expression: string, context: XPathContext): any {
            const tokens = lexer.scan(expression);
            const ast = parser.parse(tokens);
            return ast.evaluate(context);
        }

        it('parses single for binding with arithmetic return', () => {
            const context: XPathContext = {
                functions: {
                    seq: () => [1, 2, 3],
                },
            };
            const result = parseEval('for $x in seq() return $x + 1', context);
            expect(result).toEqual([2, 3, 4]);
        });

        it('parses multiple for bindings', () => {
            const context: XPathContext = {
                functions: {
                    seq: () => [1, 2, 3],
                },
            };
            const result = parseEval('for $x in seq(), $y in seq() return $x + $y', context);
            expect(result).toEqual([2, 3, 4, 3, 4, 5, 4, 5, 6]);
        });
    });
});
