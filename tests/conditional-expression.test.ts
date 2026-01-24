/**
 * XPath 2.0 Conditional Expression Tests (Section 3.8)
 */

import { XPathContext } from '../src/context';
import { XPathExpression } from '../src/expressions/expression';
import { XPathConditionalExpression } from '../src/expressions/conditional-expression';
import { XPathLexer } from '../src/lexer';
import { XPathParser } from '../src/parser';

class LiteralExpression extends XPathExpression {
	constructor(private value: any) { super(); }
	evaluate(_ctx: XPathContext): any { return this.value; }
}

class ThrowExpression extends XPathExpression {
	evaluate(_ctx: XPathContext): any { throw new Error('should not evaluate'); }
}

class TrackingExpression extends XPathExpression {
	public evaluated = false;
	constructor(private value: any) { super(); }
	evaluate(_ctx: XPathContext): any { this.evaluated = true; return this.value; }
}

describe('XPath 2.0 Conditional Expression (Phase 3.1)', () => {
	const ctx: XPathContext = {};

	describe('EBV in test condition', () => {
		it('true boolean selects then branch', () => {
			const expr = new XPathConditionalExpression(new LiteralExpression(true), new LiteralExpression('T'), new LiteralExpression('F'));
			expect(expr.evaluate(ctx)).toBe('T');
		});

		it('false boolean selects else branch', () => {
			const expr = new XPathConditionalExpression(new LiteralExpression(false), new LiteralExpression('T'), new LiteralExpression('F'));
			expect(expr.evaluate(ctx)).toBe('F');
		});

		it('empty sequence (null) selects else branch', () => {
			const expr = new XPathConditionalExpression(new LiteralExpression(null), new LiteralExpression('T'), new LiteralExpression('F'));
			expect(expr.evaluate(ctx)).toBe('F');
		});

		it('single-item sequence uses EBV of item', () => {
			const expr1 = new XPathConditionalExpression(new LiteralExpression([0]), new LiteralExpression('T'), new LiteralExpression('F'));
			expect(expr1.evaluate(ctx)).toBe('F');
			const expr2 = new XPathConditionalExpression(new LiteralExpression(['']), new LiteralExpression('T'), new LiteralExpression('F'));
			expect(expr2.evaluate(ctx)).toBe('F');
			const expr3 = new XPathConditionalExpression(new LiteralExpression([1]), new LiteralExpression('T'), new LiteralExpression('F'));
			expect(expr3.evaluate(ctx)).toBe('T');
		});

		it('multi-item sequence is true (node-sequence case)', () => {
			const expr = new XPathConditionalExpression(new LiteralExpression([1, 2]), new LiteralExpression('T'), new LiteralExpression('F'));
			expect(expr.evaluate(ctx)).toBe('T');
		});
	});

	describe('Short-circuit branch evaluation', () => {
		it('does not evaluate else when test is true', () => {
			const elseExpr = new ThrowExpression();
			const expr = new XPathConditionalExpression(new LiteralExpression(true), new LiteralExpression('T'), elseExpr);
			expect(expr.evaluate(ctx)).toBe('T');
		});

		it('does not evaluate then when test is false', () => {
			const thenExpr = new ThrowExpression();
			const expr = new XPathConditionalExpression(new LiteralExpression(false), thenExpr, new LiteralExpression('F'));
			expect(expr.evaluate(ctx)).toBe('F');
		});

		it('evaluates only the selected branch', () => {
			const thenExpr = new TrackingExpression('T');
			const elseExpr = new TrackingExpression('F');
			const exprTrue = new XPathConditionalExpression(new LiteralExpression(true), thenExpr, elseExpr);
			expect(exprTrue.evaluate(ctx)).toBe('T');
			expect(thenExpr.evaluated).toBe(true);
			expect(elseExpr.evaluated).toBe(false);

			const thenExpr2 = new TrackingExpression('T');
			const elseExpr2 = new TrackingExpression('F');
			const exprFalse = new XPathConditionalExpression(new LiteralExpression(false), thenExpr2, elseExpr2);
			expect(exprFalse.evaluate(ctx)).toBe('F');
			expect(thenExpr2.evaluated).toBe(false);
			expect(elseExpr2.evaluated).toBe(true);
		});
	});

	describe('Parser integration', () => {
		const lexer = new XPathLexer();
		const parser = new XPathParser({ strict: false, version: '1.0' });

		function parseEval(expression: string) {
			const tokens = lexer.scan(expression);
			const ast = parser.parse(tokens);
			return ast.evaluate({});
		}

		it('parses simple conditional with boolean functions', () => {
			expect(parseEval("if (true()) then 'yes' else 'no'")).toBe('yes');
			expect(parseEval("if (false()) then 'yes' else 'no'")).toBe('no');
		});

		it('parses conditional with arithmetic in branches', () => {
			expect(parseEval("if (1 = 1) then 2 + 3 else 0")).toBe(5);
		});

		it('supports nested conditionals', () => {
			const result = parseEval("if (true()) then (if (false()) then 'a' else 'b') else 'c'");
			expect(result).toBe('b');
		});
	});
});
