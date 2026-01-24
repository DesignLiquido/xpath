/**
 * XPath 2.0 Logical Expressions Tests (Section 3.6)
 */

import { XPathContext } from '../../src/context';
import { XPathLogicalExpression } from '../../src/expressions/logical-expression';
import { XPathExpression } from '../../src/expressions/expression';

class LiteralExpression extends XPathExpression {
  constructor(private value: any) { super(); }
  evaluate(_ctx: XPathContext): any { return this.value; }
  toString(): string { return String(this.value); }
}

class ThrowExpression extends XPathExpression {
  evaluate(_ctx: XPathContext): any { throw new Error('should not evaluate'); }
}

class TrackingExpression extends XPathExpression {
  public evaluated = false;
  constructor(private value: any) { super(); }
  evaluate(_ctx: XPathContext): any { this.evaluated = true; return this.value; }
}

describe('XPath 2.0 Logical Expressions (Phase 2.5)', () => {
  const ctx: XPathContext = {};

  describe('Effective Boolean Value (EBV)', () => {
    it('treats boolean as is', () => {
      const expr = new XPathLogicalExpression(new LiteralExpression(true), new LiteralExpression(false), 'and');
      expect((expr as any).toBoolean(true)).toBe(true);
      expect((expr as any).toBoolean(false)).toBe(false);
    });

    it('treats null/empty sequence as false', () => {
      const expr = new XPathLogicalExpression(new LiteralExpression(null), new LiteralExpression(true), 'and');
      expect((expr as any).toBoolean(null)).toBe(false);
      expect((expr as any).toBoolean([])).toBe(false);
    });

    it('evaluates single-item sequences recursively', () => {
      const expr = new XPathLogicalExpression(new LiteralExpression(true), new LiteralExpression(true), 'and');
      expect((expr as any).toBoolean([0])).toBe(false);
      expect((expr as any).toBoolean([''])).toBe(false);
      expect((expr as any).toBoolean([1])).toBe(true);
      expect((expr as any).toBoolean(['x'])).toBe(true);
    });

    it('treats multi-item sequences as true (non-empty node sequences)', () => {
      const expr = new XPathLogicalExpression(new LiteralExpression(true), new LiteralExpression(true), 'and');
      expect((expr as any).toBoolean([1, 2])).toBe(true);
    });

    it('computes EBV for numbers and strings', () => {
      const expr = new XPathLogicalExpression(new LiteralExpression(true), new LiteralExpression(true), 'and');
      expect((expr as any).toBoolean(0)).toBe(false);
      expect((expr as any).toBoolean(NaN)).toBe(false);
      expect((expr as any).toBoolean(3)).toBe(true);
      expect((expr as any).toBoolean('')).toBe(false);
      expect((expr as any).toBoolean('hi')).toBe(true);
    });
  });

  describe('Short-circuit evaluation', () => {
    it('skips right on and when left is false', () => {
      const right = new ThrowExpression();
      const expr = new XPathLogicalExpression(new LiteralExpression(false), right, 'and');
      expect(expr.evaluate(ctx)).toBe(false);
    });

    it('skips right on or when left is true', () => {
      const right = new ThrowExpression();
      const expr = new XPathLogicalExpression(new LiteralExpression(true), right, 'or');
      expect(expr.evaluate(ctx)).toBe(true);
    });

    it('evaluates right on and when left is true', () => {
      const right = new TrackingExpression(true);
      const expr = new XPathLogicalExpression(new LiteralExpression(true), right, 'and');
      expect(expr.evaluate(ctx)).toBe(true);
      expect(right.evaluated).toBe(true);
    });

    it('evaluates right on or when left is false', () => {
      const right = new TrackingExpression(true);
      const expr = new XPathLogicalExpression(new LiteralExpression(false), right, 'or');
      expect(expr.evaluate(ctx)).toBe(true);
      expect(right.evaluated).toBe(true);
    });
  });
});
