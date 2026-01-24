import { XPathContext } from '../src/context';
import {
  ValueComparisonExpression,
  GeneralComparisonExpression,
  NodeComparisonExpression,
} from '../src/expressions';
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

describe('XPath 2.0 Comparison Expressions (Phase 2.3)', () => {
  const mockContext: XPathContext = {};

  describe('Value Comparisons (Section 3.5.1)', () => {
    describe('Equality (eq/ne)', () => {
      it('should compare equal numbers with eq', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(5),
          'eq',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare unequal numbers with eq', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(5),
          'eq',
          new LiteralExpression(3)
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });

      it('should compare unequal numbers with ne', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(5),
          'ne',
          new LiteralExpression(3)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare equal strings with eq', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression('hello'),
          'eq',
          new LiteralExpression('hello')
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare unequal strings with eq', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression('hello'),
          'eq',
          new LiteralExpression('world')
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });

      it('should handle NaN comparison - NaN ne NaN', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(NaN),
          'ne',
          new LiteralExpression(NaN)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });

    describe('Ordering (lt/le/gt/ge)', () => {
      it('should compare numbers with lt', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(3),
          'lt',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare numbers with le', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(5),
          'le',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare numbers with gt', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(7),
          'gt',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare numbers with ge', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(5),
          'ge',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare strings with lt', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression('apple'),
          'lt',
          new LiteralExpression('banana')
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare strings with gt', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression('zebra'),
          'gt',
          new LiteralExpression('apple')
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });

    describe('Type Promotion', () => {
      it('should promote string to number in comparison', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression('5'),
          'eq',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should promote boolean to number in comparison', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(true),
          'eq',
          new LiteralExpression(1)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should promote false to 0', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression(false),
          'eq',
          new LiteralExpression(0)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should handle string to string comparison', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression('10'),
          'lt',
          new LiteralExpression('2')
        );
        // String comparison (not numeric)
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should error on empty sequence', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression([]),
          'eq',
          new LiteralExpression(5)
        );
        expect(() => expr.evaluate(mockContext)).toThrow('non-empty');
      });

      it('should error on multiple items in operand', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression([1, 2]),
          'eq',
          new LiteralExpression(1)
        );
        expect(() => expr.evaluate(mockContext)).toThrow('single');
      });

      it('should handle single item in array', () => {
        const expr = new ValueComparisonExpression(
          new LiteralExpression([5]),
          'eq',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });
  });

  describe('General Comparisons (Section 3.5.2)', () => {
    describe('Basic Comparisons with Sequences', () => {
      it('should compare single values', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression(5),
          '=',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should use existential quantification for sequences', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([1, 2, 3]),
          '=',
          new LiteralExpression(2)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should return false if no match in sequences', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([1, 2, 3]),
          '=',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });

      it('should match on any pair in two sequences', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([1, 2, 3]),
          '=',
          new LiteralExpression([3, 4, 5])
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });

    describe('Ordering Comparisons', () => {
      it('should compare with < operator', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([1, 2]),
          '<',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare with > operator', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([6, 7]),
          '>',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare with <= operator', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([1, 5]),
          '<=',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare with >= operator', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([5, 6]),
          '>=',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should compare with != operator', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([1, 2]),
          '!=',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });

    describe('Empty Sequence Handling', () => {
      it('should return false for empty left sequence', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([]),
          '=',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });

      it('should return false for empty right sequence', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression(5),
          '=',
          new LiteralExpression([])
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });

      it('should return false for both empty sequences', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression([]),
          '=',
          new LiteralExpression([])
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });
    });

    describe('Type Promotion', () => {
      it('should promote string to number', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression('5'),
          '=',
          new LiteralExpression(5)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should promote boolean to number', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression(true),
          '=',
          new LiteralExpression(1)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should handle sequence with mixed promotions', () => {
        const expr = new GeneralComparisonExpression(
          new LiteralExpression(['1', 2, true]),
          '=',
          new LiteralExpression(1)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });
  });

  describe('Node Comparisons (Section 3.5.3)', () => {
    function createTestNode(id: string): any {
      return {
        __id: id,
        nodeType: 1,
        nodeName: 'test',
        parentNode: null,
        childNodes: [],
      };
    }

    describe('Node Identity (is)', () => {
      it('should identify same node', () => {
        const node = createTestNode('node1');
        const expr = new NodeComparisonExpression(
          new LiteralExpression(node),
          'is',
          new LiteralExpression(node)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should distinguish different nodes', () => {
        const node1 = createTestNode('node1');
        const node2 = createTestNode('node2');
        const expr = new NodeComparisonExpression(
          new LiteralExpression(node1),
          'is',
          new LiteralExpression(node2)
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });

      it('should use __id for identity if available', () => {
        const node1 = { __id: 'same', nodeType: 1 };
        const node2 = { __id: 'same', nodeType: 1 };
        const expr = new NodeComparisonExpression(
          new LiteralExpression(node1),
          'is',
          new LiteralExpression(node2)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });

    describe('Document Order (<</>>', () => {
      it('should determine document order with <<', () => {
        const parent = createTestNode('parent');
        const child1 = { ...createTestNode('child1'), parentNode: parent };
        const child2 = { ...createTestNode('child2'), parentNode: parent };
        parent.childNodes = [child1, child2];

        const expr = new NodeComparisonExpression(
          new LiteralExpression(child1),
          '<<',
          new LiteralExpression(child2)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should determine document order with >>', () => {
        const parent = createTestNode('parent');
        const child1 = { ...createTestNode('child1'), parentNode: parent };
        const child2 = { ...createTestNode('child2'), parentNode: parent };
        parent.childNodes = [child1, child2];

        const expr = new NodeComparisonExpression(
          new LiteralExpression(child2),
          '>>',
          new LiteralExpression(child1)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });

      it('should return false if same node', () => {
        const node = createTestNode('node1');
        const expr = new NodeComparisonExpression(
          new LiteralExpression(node),
          '<<',
          new LiteralExpression(node)
        );
        expect(expr.evaluate(mockContext)).toBe(false);
      });
    });

    describe('Error Handling', () => {
      it('should error on non-node comparison', () => {
        const expr = new NodeComparisonExpression(
          new LiteralExpression(5),
          'is',
          new LiteralExpression(10)
        );
        expect(() => expr.evaluate(mockContext)).toThrow('requires node');
      });

      it('should error when one operand is not a node', () => {
        const node = createTestNode('node1');
        const expr = new NodeComparisonExpression(
          new LiteralExpression(node),
          'is',
          new LiteralExpression(5)
        );
        expect(() => expr.evaluate(mockContext)).toThrow('requires node');
      });

      it('should extract single node from single-item sequence', () => {
        const node = createTestNode('node1');
        const expr = new NodeComparisonExpression(
          new LiteralExpression([node]),
          'is',
          new LiteralExpression(node)
        );
        expect(expr.evaluate(mockContext)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle chained comparisons', () => {
      const expr1 = new ValueComparisonExpression(
        new LiteralExpression(5),
        'gt',
        new LiteralExpression(3)
      );
      expect(expr1.evaluate(mockContext)).toBe(true);

      const expr2 = new ValueComparisonExpression(
        new LiteralExpression(5),
        'lt',
        new LiteralExpression(10)
      );
      expect(expr2.evaluate(mockContext)).toBe(true);
    });

    it('should handle multiple comparisons in sequence', () => {
      const values = [1, 2, 3, 4, 5];

      const less = new GeneralComparisonExpression(
        new LiteralExpression(values),
        '<',
        new LiteralExpression(4)
      );
      expect(less.evaluate(mockContext)).toBe(true);

      const greater = new GeneralComparisonExpression(
        new LiteralExpression(values),
        '>',
        new LiteralExpression(2)
      );
      expect(greater.evaluate(mockContext)).toBe(true);
    });

    it('should correctly precedence comparisons with sequences', () => {
      // (1, 2, 3) = 2 should be true (existential)
      const expr = new GeneralComparisonExpression(
        new LiteralExpression([1, 2, 3]),
        '=',
        new LiteralExpression(2)
      );
      expect(expr.evaluate(mockContext)).toBe(true);
    });
  });
});
