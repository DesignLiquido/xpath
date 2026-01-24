/**
 * XPath 2.0 Arithmetic Expressions Tests
 * Section 3.4: Arithmetic Expressions
 * https://www.w3.org/TR/xpath20/#id-arithmetic
 */

import { XPathContext } from '../src/context';
import { XPathArithmeticExpression } from '../src/expressions/arithmetic-expression';
import { XPathUnaryExpression } from '../src/expressions/unary-expression';
import { XPathExpression } from '../src/expressions/expression';

/**
 * Test helper - creates literal expressions for testing
 */
class LiteralExpression extends XPathExpression {
  constructor(private value: any) {
    super();
  }
  evaluate(_context: XPathContext): any {
    return this.value;
  }
  toString(): string {
    return String(this.value);
  }
}

describe('XPath 2.0 Arithmetic Expressions (Phase 2.4)', () => {
  let mockContext: XPathContext;

  beforeEach(() => {
    mockContext = {
      node: undefined,
      position: 1,
      size: 1,
      variables: {},
      functions: {},
      namespaces: {},
    };
  });

  describe('Binary Arithmetic Operations', () => {
    describe('Addition (+)', () => {
      it('should add two positive numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5),
          new LiteralExpression(3),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBe(8);
      });

      it('should add positive and negative numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5),
          new LiteralExpression(-3),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBe(2);
      });

      it('should add floating point numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5.5),
          new LiteralExpression(3.2),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBeCloseTo(8.7);
      });

      it('should add string to number with type promotion', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression('5'),
          new LiteralExpression(3),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBe(8);
      });

      it('should add boolean to number with type promotion', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(true),
          new LiteralExpression(3),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBe(4); // true -> 1
      });

      it('should return null for empty sequence', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression([]),
          new LiteralExpression(5),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBeNull();
      });

      it('should handle NaN from empty string', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(''),
          new LiteralExpression(5),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBeNaN();
      });
    });

    describe('Subtraction (-)', () => {
      it('should subtract two numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(3),
          '-'
        );
        expect(expr.evaluate(mockContext)).toBe(7);
      });

      it('should handle negative result', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(3),
          new LiteralExpression(10),
          '-'
        );
        expect(expr.evaluate(mockContext)).toBe(-7);
      });

      it('should subtract with type promotion', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression('10'),
          new LiteralExpression(3),
          '-'
        );
        expect(expr.evaluate(mockContext)).toBe(7);
      });
    });

    describe('Multiplication (*)', () => {
      it('should multiply two positive numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5),
          new LiteralExpression(3),
          '*'
        );
        expect(expr.evaluate(mockContext)).toBe(15);
      });

      it('should multiply positive and negative numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5),
          new LiteralExpression(-3),
          '*'
        );
        expect(expr.evaluate(mockContext)).toBe(-15);
      });

      it('should multiply by zero', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5),
          new LiteralExpression(0),
          '*'
        );
        expect(expr.evaluate(mockContext)).toBe(0);
      });

      it('should multiply floating point numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(2.5),
          new LiteralExpression(4),
          '*'
        );
        expect(expr.evaluate(mockContext)).toBe(10);
      });
    });

    describe('Division (div)', () => {
      it('should divide two numbers', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(2),
          'div'
        );
        expect(expr.evaluate(mockContext)).toBe(5);
      });

      it('should return decimal result', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(3),
          'div'
        );
        expect(expr.evaluate(mockContext)).toBeCloseTo(3.333, 2);
      });

      it('should return Infinity for division by zero', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5),
          new LiteralExpression(0),
          'div'
        );
        expect(expr.evaluate(mockContext)).toBe(Infinity);
      });

      it('should return -Infinity for negative division by zero', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(-5),
          new LiteralExpression(0),
          'div'
        );
        expect(expr.evaluate(mockContext)).toBe(-Infinity);
      });

      it('should divide with type promotion', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression('10'),
          new LiteralExpression('2'),
          'div'
        );
        expect(expr.evaluate(mockContext)).toBe(5);
      });
    });

    describe('Integer Division (idiv)', () => {
      it('should divide and truncate to integer', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(3),
          'idiv'
        );
        expect(expr.evaluate(mockContext)).toBe(3);
      });

      it('should truncate positive result', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(17),
          new LiteralExpression(5),
          'idiv'
        );
        expect(expr.evaluate(mockContext)).toBe(3);
      });

      it('should truncate negative result', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(-17),
          new LiteralExpression(5),
          'idiv'
        );
        expect(expr.evaluate(mockContext)).toBe(-3);
      });

      it('should throw error on division by zero', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(0),
          'idiv'
        );
        expect(() => expr.evaluate(mockContext)).toThrow('XPDY0002');
      });

      it('should handle zero divided by number', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(0),
          new LiteralExpression(5),
          'idiv'
        );
        expect(expr.evaluate(mockContext)).toBe(0);
      });
    });

    describe('Modulo (mod)', () => {
      it('should return remainder of division', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(3),
          'mod'
        );
        expect(expr.evaluate(mockContext)).toBe(1);
      });

      it('should return zero when divisible', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(5),
          'mod'
        );
        expect(expr.evaluate(mockContext)).toBe(0);
      });

      it('should handle negative operand', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(-10),
          new LiteralExpression(3),
          'mod'
        );
        expect(expr.evaluate(mockContext)).toBe(-1);
      });

      it('should handle negative divisor', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(-3),
          'mod'
        );
        expect(expr.evaluate(mockContext)).toBe(1);
      });

      it('should throw error on modulo by zero', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(10),
          new LiteralExpression(0),
          'mod'
        );
        expect(() => expr.evaluate(mockContext)).toThrow('XPDY0002');
      });

      it('should handle floating point modulo', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(5.5),
          new LiteralExpression(2.2),
          'mod'
        );
        expect(expr.evaluate(mockContext)).toBeCloseTo(1.1, 10);
      });
    });

    describe('Error Handling', () => {
      it('should handle NaN in addition', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression(NaN),
          new LiteralExpression(5),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBeNaN();
      });

      it('should propagate NaN through operations', () => {
        const expr = new XPathArithmeticExpression(
          new LiteralExpression('abc'),
          new LiteralExpression(5),
          '+'
        );
        expect(expr.evaluate(mockContext)).toBeNaN();
      });
    });
  });

  describe('Unary Arithmetic Operations', () => {
    describe('Unary Plus (+)', () => {
      it('should convert positive number', () => {
        const expr = new XPathUnaryExpression('+', new LiteralExpression(5));
        expect(expr.evaluate(mockContext)).toBe(5);
      });

      it('should convert negative number', () => {
        const expr = new XPathUnaryExpression('+', new LiteralExpression(-5));
        expect(expr.evaluate(mockContext)).toBe(-5);
      });

      it('should convert string to number', () => {
        const expr = new XPathUnaryExpression('+', new LiteralExpression('5'));
        expect(expr.evaluate(mockContext)).toBe(5);
      });

      it('should convert boolean to number', () => {
        const expr = new XPathUnaryExpression('+', new LiteralExpression(true));
        expect(expr.evaluate(mockContext)).toBe(1);
      });

      it('should convert false to 0', () => {
        const expr = new XPathUnaryExpression('+', new LiteralExpression(false));
        expect(expr.evaluate(mockContext)).toBe(0);
      });

      it('should return null for empty sequence', () => {
        const expr = new XPathUnaryExpression('+', new LiteralExpression([]));
        expect(expr.evaluate(mockContext)).toBeNull();
      });

      it('should return NaN for empty string', () => {
        const expr = new XPathUnaryExpression('+', new LiteralExpression(''));
        expect(expr.evaluate(mockContext)).toBeNaN();
      });
    });

    describe('Unary Minus (-)', () => {
      it('should negate positive number', () => {
        const expr = new XPathUnaryExpression('-', new LiteralExpression(10));
        expect(expr.evaluate(mockContext)).toBe(-10);
      });

      it('should negate negative number', () => {
        const expr = new XPathUnaryExpression('-', new LiteralExpression(-10));
        expect(expr.evaluate(mockContext)).toBe(10);
      });

      it('should negate zero', () => {
        const expr = new XPathUnaryExpression('-', new LiteralExpression(0));
        expect(expr.evaluate(mockContext)).toBe(-0);
      });

      it('should negate converted string', () => {
        const expr = new XPathUnaryExpression('-', new LiteralExpression('5'));
        expect(expr.evaluate(mockContext)).toBe(-5);
      });

      it('should negate converted boolean', () => {
        const expr = new XPathUnaryExpression('-', new LiteralExpression(true));
        expect(expr.evaluate(mockContext)).toBe(-1);
      });

      it('should return null for empty sequence', () => {
        const expr = new XPathUnaryExpression('-', new LiteralExpression([]));
        expect(expr.evaluate(mockContext)).toBeNull();
      });
    });
  });

  describe('Type Conversions', () => {
    it('should promote multiple types in expression', () => {
      const expr = new XPathArithmeticExpression(
        new LiteralExpression('10'),
        new LiteralExpression(true),
        '+'
      );
      expect(expr.evaluate(mockContext)).toBe(11);
    });

    it('should handle whitespace in strings', () => {
      const expr = new XPathArithmeticExpression(
        new LiteralExpression('  5  '),
        new LiteralExpression(3),
        '+'
      );
      expect(expr.evaluate(mockContext)).toBe(8);
    });

    it('should handle floating point strings', () => {
      const expr = new XPathArithmeticExpression(
        new LiteralExpression('3.14'),
        new LiteralExpression(0.86),
        '+'
      );
      expect(expr.evaluate(mockContext)).toBe(4);
    });

    it('should handle scientific notation strings', () => {
      const expr = new XPathArithmeticExpression(
        new LiteralExpression('1e2'),
        new LiteralExpression(50),
        '+'
      );
      expect(expr.evaluate(mockContext)).toBe(150);
    });
  });

  describe('Sequence Handling', () => {
    it('should use first item from sequence', () => {
      const expr = new XPathArithmeticExpression(
        new LiteralExpression([5, 6, 7]),
        new LiteralExpression(3),
        '+'
      );
      expect(expr.evaluate(mockContext)).toBe(8);
    });

    it('should return null for empty sequence in addition', () => {
      const expr = new XPathArithmeticExpression(
        new LiteralExpression([]),
        new LiteralExpression(5),
        '+'
      );
      expect(expr.evaluate(mockContext)).toBeNull();
    });

    it('should return null for empty sequence in unary minus', () => {
      const expr = new XPathUnaryExpression('-', new LiteralExpression([]));
      expect(expr.evaluate(mockContext)).toBeNull();
    });
  });

  describe('toString() Method', () => {
    it('should produce readable output for binary operations', () => {
      const expr = new XPathArithmeticExpression(
        new LiteralExpression(5),
        new LiteralExpression(3),
        '+'
      );
      expect(expr.toString()).toContain('+');
      expect(expr.toString()).toContain('5');
      expect(expr.toString()).toContain('3');
    });

    it('should produce readable output for unary minus', () => {
      const expr = new XPathUnaryExpression('-', new LiteralExpression(5));
      expect(expr.toString()).toBe('-5');
    });

    it('should produce readable output for unary plus', () => {
      const expr = new XPathUnaryExpression('+', new LiteralExpression(5));
      expect(expr.toString()).toBe('+5');
    });

    it('should handle complex expressions', () => {
      const inner = new XPathArithmeticExpression(
        new LiteralExpression(5),
        new LiteralExpression(3),
        '*'
      );
      const expr = new XPathUnaryExpression('-', inner);
      expect(expr.toString()).toContain('-');
      expect(expr.toString()).toContain('*');
    });
  });

  describe('Integration Tests', () => {
    it('should handle nested arithmetic expressions', () => {
      // (5 + 3) * 2 = 16
      const add = new XPathArithmeticExpression(
        new LiteralExpression(5),
        new LiteralExpression(3),
        '+'
      );
      const expr = new XPathArithmeticExpression(add, new LiteralExpression(2), '*');
      expect(expr.evaluate(mockContext)).toBe(16);
    });

    it('should handle mixed operators', () => {
      // 10 - 3 * 2 (no operator precedence, evaluated left-to-right in expressions)
      // But in this test, we manually nest to show order
      const mult = new XPathArithmeticExpression(
        new LiteralExpression(3),
        new LiteralExpression(2),
        '*'
      );
      const expr = new XPathArithmeticExpression(
        new LiteralExpression(10),
        mult,
        '-'
      );
      expect(expr.evaluate(mockContext)).toBe(4);
    });

    it('should handle unary in binary operations', () => {
      // -5 + 3 = -2
      const negate = new XPathUnaryExpression('-', new LiteralExpression(5));
      const expr = new XPathArithmeticExpression(negate, new LiteralExpression(3), '+');
      expect(expr.evaluate(mockContext)).toBe(-2);
    });

    it('should calculate complex mathematical expression', () => {
      // ((10 + 5) * 2) - 3 = 27
      const add = new XPathArithmeticExpression(
        new LiteralExpression(10),
        new LiteralExpression(5),
        '+'
      );
      const mult = new XPathArithmeticExpression(add, new LiteralExpression(2), '*');
      const expr = new XPathArithmeticExpression(mult, new LiteralExpression(3), '-');
      expect(expr.evaluate(mockContext)).toBe(27);
    });
  });
});
