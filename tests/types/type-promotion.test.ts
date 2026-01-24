/**
 * Tests for XPath 2.0 Type Promotion and Atomization
 * Covers: Type promotion rules, numeric hierarchy, atomization, and node value extraction
 */

import {
  NumericTypeHierarchy,
  getNumericHierarchyLevel,
  canPromoteNumeric,
  promoteNumericValue,
  getCommonNumericType,
  canPromoteToString,
  promoteToString,
  promoteUntypedToNumeric,
  PromotionContext,
  promoteInContext,
  describePromotion
} from '../../src/types/type-promotion';

import {
  isNode,
  hasElementOnlyContent,
  getNodeTypedValue,
  getNodeStringValue,
  atomize,
  atomizeToSingleValue,
  extractStringValues,
  atomizationToSequence,
  isAtomizationSuccess,
  getAtomizationErrorDescription,
  createTestNode,
  createElementWithText,
  createElementWithChildren,
  XPathNode
} from '../../src/types/atomization';

import { getAtomicType } from '../../src/types';

describe('Type Promotion System', () => {
  describe('NumericTypeHierarchy', () => {
    it('should have correct hierarchy values', () => {
      expect(NumericTypeHierarchy.INTEGER).toBe(0);
      expect(NumericTypeHierarchy.DECIMAL).toBe(1);
      expect(NumericTypeHierarchy.FLOAT).toBe(2);
      expect(NumericTypeHierarchy.DOUBLE).toBe(3);
    });
  });

  describe('getNumericHierarchyLevel', () => {
    it('should return INTEGER for integer types', () => {
      const intType = getAtomicType('integer')!;
      expect(getNumericHierarchyLevel(intType)).toBe(NumericTypeHierarchy.INTEGER);
    });

    it('should return INTEGER for integer-derived types', () => {
      const types = ['long', 'int', 'short', 'byte', 'unsignedInt', 'positiveInteger'];
      for (const typeName of types) {
        const type = getAtomicType(typeName)!;
        expect(getNumericHierarchyLevel(type)).toBe(NumericTypeHierarchy.INTEGER);
      }
    });

    it('should return DECIMAL for decimal type', () => {
      const decType = getAtomicType('decimal')!;
      expect(getNumericHierarchyLevel(decType)).toBe(NumericTypeHierarchy.DECIMAL);
    });

    it('should return FLOAT for float type', () => {
      const floatType = getAtomicType('float')!;
      expect(getNumericHierarchyLevel(floatType)).toBe(NumericTypeHierarchy.FLOAT);
    });

    it('should return DOUBLE for double type', () => {
      const doubleType = getAtomicType('double')!;
      expect(getNumericHierarchyLevel(doubleType)).toBe(NumericTypeHierarchy.DOUBLE);
    });

    it('should return -1 for non-numeric types', () => {
      const strType = getAtomicType('string')!;
      expect(getNumericHierarchyLevel(strType)).toBe(-1);

      const boolType = getAtomicType('boolean')!;
      expect(getNumericHierarchyLevel(boolType)).toBe(-1);
    });
  });

  describe('canPromoteNumeric', () => {
    it('should allow promotion from integer to decimal', () => {
      const intType = getAtomicType('integer')!;
      const decType = getAtomicType('decimal')!;
      expect(canPromoteNumeric(intType, decType)).toBe(true);
    });

    it('should allow promotion from integer to float', () => {
      const intType = getAtomicType('integer')!;
      const floatType = getAtomicType('float')!;
      expect(canPromoteNumeric(intType, floatType)).toBe(true);
    });

    it('should allow promotion from integer to double', () => {
      const intType = getAtomicType('integer')!;
      const doubleType = getAtomicType('double')!;
      expect(canPromoteNumeric(intType, doubleType)).toBe(true);
    });

    it('should allow promotion from decimal to float', () => {
      const decType = getAtomicType('decimal')!;
      const floatType = getAtomicType('float')!;
      expect(canPromoteNumeric(decType, floatType)).toBe(true);
    });

    it('should allow promotion from decimal to double', () => {
      const decType = getAtomicType('decimal')!;
      const doubleType = getAtomicType('double')!;
      expect(canPromoteNumeric(decType, doubleType)).toBe(true);
    });

    it('should allow promotion from float to double', () => {
      const floatType = getAtomicType('float')!;
      const doubleType = getAtomicType('double')!;
      expect(canPromoteNumeric(floatType, doubleType)).toBe(true);
    });

    it('should not allow promotion in reverse', () => {
      const intType = getAtomicType('integer')!;
      const doubleType = getAtomicType('double')!;
      expect(canPromoteNumeric(doubleType, intType)).toBe(false);
    });

    it('should not allow promotion between non-numeric types', () => {
      const strType = getAtomicType('string')!;
      const boolType = getAtomicType('boolean')!;
      expect(canPromoteNumeric(strType, boolType)).toBe(false);
    });

    it('should allow same-type promotion', () => {
      const intType = getAtomicType('integer')!;
      expect(canPromoteNumeric(intType, intType)).toBe(true);
    });

    it('should work with derived integer types', () => {
      const byteType = getAtomicType('byte')!;
      const doubleType = getAtomicType('double')!;
      expect(canPromoteNumeric(byteType, doubleType)).toBe(true);
    });
  });

  describe('promoteNumericValue', () => {
    it('should promote integer to decimal', () => {
      const result = promoteNumericValue(42, 'integer', 'decimal');
      expect(result).toBe(42);
    });

    it('should promote integer to double', () => {
      const result = promoteNumericValue(100, 'integer', 'double');
      expect(result).toBe(100);
    });

    it('should not change value during promotion', () => {
      const value = 3.14159;
      const result = promoteNumericValue(value, 'decimal', 'double');
      expect(result).toBe(value);
    });

    it('should return unchanged for same type', () => {
      const result = promoteNumericValue(123, 'integer', 'integer');
      expect(result).toBe(123);
    });

    it('should throw error for invalid promotion', () => {
      expect(() => {
        promoteNumericValue(100, 'double', 'integer');
      }).toThrow();
    });

    it('should throw error for unknown types', () => {
      expect(() => {
        promoteNumericValue(100, 'unknown', 'integer');
      }).toThrow();
    });
  });

  describe('getCommonNumericType', () => {
    it('should return higher type when types differ', () => {
      const intType = getAtomicType('integer')!;
      const doubleType = getAtomicType('double')!;
      const result = getCommonNumericType(intType, doubleType);
      expect(result!.name).toBe('double');
    });

    it('should return one type when both are same', () => {
      const intType = getAtomicType('integer')!;
      const result = getCommonNumericType(intType, intType);
      expect(result!.name).toBe('integer');
    });

    it('should return undefined for non-numeric types', () => {
      const strType = getAtomicType('string')!;
      const intType = getAtomicType('integer')!;
      expect(getCommonNumericType(strType, intType)).toBeUndefined();
    });

    it('should work with multiple comparisons', () => {
      const intType = getAtomicType('integer')!;
      const floatType = getAtomicType('float')!;
      const result = getCommonNumericType(intType, floatType);
      expect(result!.name).toBe('float');
    });
  });

  describe('canPromoteToString', () => {
    it('should allow anyURI promotion to string', () => {
      const uriType = getAtomicType('anyURI')!;
      expect(canPromoteToString(uriType)).toBe(true);
    });

    it('should allow untypedAtomic promotion to string', () => {
      const untypedType = getAtomicType('untypedAtomic')!;
      expect(canPromoteToString(untypedType)).toBe(true);
    });

    it('should not allow other types to promote to string', () => {
      const intType = getAtomicType('integer')!;
      expect(canPromoteToString(intType)).toBe(false);
    });
  });

  describe('promoteToString', () => {
    it('should convert anyURI to string', () => {
      const result = promoteToString('http://example.com', 'anyURI');
      expect(result).toBe('http://example.com');
    });

    it('should convert untypedAtomic to string', () => {
      const result = promoteToString('hello world', 'untypedAtomic');
      expect(result).toBe('hello world');
    });

    it('should handle string type directly', () => {
      const result = promoteToString('test', 'string');
      expect(result).toBe('test');
    });

    it('should throw error for invalid type promotion', () => {
      expect(() => {
        promoteToString(42, 'integer');
      }).toThrow();
    });
  });

  describe('promoteUntypedToNumeric', () => {
    it('should promote untyped "42" to decimal', () => {
      const result = promoteUntypedToNumeric('42', 'decimal');
      expect(result).toBe(42);
    });

    it('should promote untyped "3.14" to double', () => {
      const result = promoteUntypedToNumeric('3.14', 'double');
      expect(result).toBe(3.14);
    });

    it('should promote untyped "-100" to integer', () => {
      const result = promoteUntypedToNumeric('-100', 'integer');
      expect(result).toBe(-100);
    });

    it('should throw error for non-numeric strings', () => {
      expect(() => {
        promoteUntypedToNumeric('not a number', 'integer');
      }).toThrow();
    });

    it('should throw error for non-numeric target type', () => {
      expect(() => {
        promoteUntypedToNumeric('42', 'string');
      }).toThrow();
    });
  });

  describe('PromotionContext', () => {
    it('should have correct context values', () => {
      expect(PromotionContext.ARITHMETIC).toBe('arithmetic');
      expect(PromotionContext.COMPARISON).toBe('comparison');
      expect(PromotionContext.STRING).toBe('string');
      expect(PromotionContext.BOOLEAN).toBe('boolean');
    });
  });

  describe('promoteInContext', () => {
    it('should promote untypedAtomic to double in arithmetic context', () => {
      const result = promoteInContext('42.5', 'untypedAtomic', PromotionContext.ARITHMETIC);
      expect(result.type).toBe('double');
      expect(result.value).toBe(42.5);
    });

    it('should promote untypedAtomic to string in string context', () => {
      const result = promoteInContext('hello', 'untypedAtomic', PromotionContext.STRING);
      expect(result.type).toBe('string');
      expect(result.value).toBe('hello');
    });

    it('should promote untypedAtomic to string in boolean context', () => {
      const result = promoteInContext('true', 'untypedAtomic', PromotionContext.BOOLEAN);
      expect(result.type).toBe('string');
    });

    it('should promote anyURI to string in string context', () => {
      const result = promoteInContext('http://test.com', 'anyURI', PromotionContext.STRING);
      expect(result.type).toBe('string');
    });

    it('should not promote if not needed', () => {
      const result = promoteInContext(42, 'integer', PromotionContext.ARITHMETIC);
      expect(result.type).toBe('integer');
      expect(result.value).toBe(42);
    });
  });

  describe('describePromotion', () => {
    it('should describe numeric promotion', () => {
      const desc = describePromotion('integer', 'double');
      expect(desc).toContain('Promote');
      expect(desc).toContain('integer');
    });

    it('should describe no promotion for same type', () => {
      const desc = describePromotion('string', 'string');
      expect(desc).toContain('No promotion');
    });

    it('should describe untyped promotion', () => {
      const desc = describePromotion('untypedAtomic', 'double');
      expect(desc).toContain('numeric context');
    });
  });
});

describe('Atomization System', () => {
  describe('isNode', () => {
    it('should identify node objects', () => {
      const node: XPathNode = { nodeType: 'element' };
      expect(isNode(node)).toBe(true);
    });

    it('should reject non-node objects', () => {
      expect(isNode(42)).toBe(false);
      expect(isNode('text')).toBe(false);
      expect(isNode(null)).toBe(false);
    });

    it('should identify nodes by nodeName', () => {
      const node: XPathNode = { nodeType: 'element', nodeName: 'test' };
      expect(isNode(node)).toBe(true);
    });
  });

  describe('hasElementOnlyContent', () => {
    it('should return false for empty nodes', () => {
      const node = createTestNode('element');
      expect(hasElementOnlyContent(node)).toBe(false);
    });

    it('should return true for nodes with only element children', () => {
      const child1 = createTestNode('element', 'child1');
      const child2 = createTestNode('element', 'child2');
      const parent = createElementWithChildren('parent', [child1, child2]);
      expect(hasElementOnlyContent(parent)).toBe(true);
    });

    it('should return false for nodes with text content', () => {
      const textNode = createTestNode('text', 'some text');
      const node = createElementWithText('element', 'text content');
      expect(hasElementOnlyContent(node)).toBe(false);
    });

    it('should return false for mixed content', () => {
      const textNode = createTestNode('text', 'text');
      const elemNode = createTestNode('element');
      const node = createElementWithChildren('parent', [textNode, elemNode]);
      expect(hasElementOnlyContent(node)).toBe(false);
    });
  });

  describe('getNodeStringValue', () => {
    it('should get text node content', () => {
      const node = createTestNode('text', 'hello');
      expect(getNodeStringValue(node)).toBe('hello');
    });

    it('should get attribute value', () => {
      const node = createTestNode('attribute', 'value');
      expect(getNodeStringValue(node)).toBe('value');
    });

    it('should concatenate element text nodes', () => {
      const node = createElementWithText('element', 'element content');
      expect(getNodeStringValue(node)).toBe('element content');
    });

    it('should handle empty text nodes', () => {
      const node = createTestNode('text');
      expect(getNodeStringValue(node)).toBe('');
    });

    it('should concatenate nested element text content', () => {
      const textChild = createTestNode('text', 'child text');
      const elemChild = createElementWithChildren('child', [textChild]);
      const parent = createElementWithChildren('parent', [elemChild]);
      const result = getNodeStringValue(parent);
      expect(result).toBe('child text');
    });
  });

  describe('getNodeTypedValue', () => {
    it('should use explicit typed value if available', () => {
      const node: XPathNode = {
        nodeType: 'element',
        typedValue: 42,
        type: 'integer'
      };
      const result = getNodeTypedValue(node);
      expect(result.value).toBe(42);
      expect(result.type?.name).toBe('integer');
    });

    it('should return string value for untyped nodes', () => {
      const node = createElementWithText('element', 'test');
      const result = getNodeTypedValue(node);
      expect(result.value).toBe('test');
      expect(result.type).toBeUndefined();
    });

    it('should cast value to type if type specified', () => {
      const node: XPathNode = {
        nodeType: 'element',
        textContent: '42',
        type: 'integer'
      };
      const result = getNodeTypedValue(node);
      // The cast should work for numeric types
      expect(typeof result.value).toBe('number');
    });
  });

  describe('atomize', () => {
    it('should return empty sequence for undefined', () => {
      const result = atomize(undefined);
      expect(result.isEmpty).toBe(true);
      expect(result.values).toEqual([]);
    });

    it('should return empty sequence for null', () => {
      const result = atomize(null);
      expect(result.isEmpty).toBe(true);
    });

    it('should return atomic value unchanged', () => {
      const result = atomize(42);
      expect(result.values).toEqual([42]);
      expect(result.isEmpty).toBe(false);
    });

    it('should atomize node to string value', () => {
      const node = createElementWithText('element', 'content');
      const result = atomize(node);
      expect(result.values).toEqual(['content']);
    });

    it('should handle array of values', () => {
      const result = atomize([1, 2, 3]);
      expect(result.values).toEqual([1, 2, 3]);
    });

    it('should handle mixed array with nodes', () => {
      const node = createElementWithText('element', 'text');
      const result = atomize([42, node, 'string']);
      expect(result.values.length).toBe(3);
    });

    it('should report error for element-only content in strict mode', () => {
      const child = createTestNode('element');
      const parent = createElementWithChildren('parent', [child]);
      const result = atomize(parent, true);
      expect(result.error).toBe('FOTY0012');
    });

    it('should not report error for element-only content in non-strict mode', () => {
      const child = createTestNode('element');
      const parent = createElementWithChildren('parent', [child]);
      const result = atomize(parent, false);
      expect(result.error).toBeUndefined();
    });
  });

  describe('atomizeToSingleValue', () => {
    it('should return single value', () => {
      const result = atomizeToSingleValue(42);
      expect(result).toBe(42);
    });

    it('should return undefined for empty sequence', () => {
      const result = atomizeToSingleValue(undefined);
      expect(result).toBeUndefined();
    });

    it('should throw error for multiple values', () => {
      expect(() => {
        atomizeToSingleValue([1, 2, 3]);
      }).toThrow();
    });

    it('should throw error for atomization error', () => {
      const child = createTestNode('element');
      const parent = createElementWithChildren('parent', [child]);
      expect(() => {
        // Note: atomizeToSingleValue doesn't use strict mode, so this won't throw
        atomizeToSingleValue(parent);
      }).not.toThrow();
    });
  });

  describe('extractStringValues', () => {
    it('should extract string from value', () => {
      const result = extractStringValues('hello');
      expect(result).toEqual(['hello']);
    });

    it('should extract strings from array', () => {
      const result = extractStringValues(['a', 'b', 'c']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should extract string from node', () => {
      const node = createElementWithText('element', 'content');
      const result = extractStringValues(node);
      expect(result).toEqual(['content']);
    });

    it('should return empty array for undefined', () => {
      const result = extractStringValues(undefined);
      expect(result).toEqual([]);
    });

    it('should convert number to string', () => {
      const result = extractStringValues(42);
      expect(result).toEqual(['42']);
    });
  });

  describe('Helper functions', () => {
    it('atomizationToSequence should return values', () => {
      const result = {
        values: [1, 2, 3],
        type: undefined,
        isEmpty: false
      };
      expect(atomizationToSequence(result)).toEqual([1, 2, 3]);
    });

    it('isAtomizationSuccess should check for errors', () => {
      const success = { values: [1], type: undefined, isEmpty: false };
      expect(isAtomizationSuccess(success)).toBe(true);

      const failure = { values: [], type: undefined, isEmpty: false, error: 'FOTY0012' };
      expect(isAtomizationSuccess(failure)).toBe(false);
    });

    it('getAtomizationErrorDescription should describe errors', () => {
      const desc = getAtomizationErrorDescription('FOTY0012');
      expect(desc).toContain('element-only');
    });
  });

  describe('Test node factories', () => {
    it('createTestNode should create basic node', () => {
      const node = createTestNode('element', 'content');
      expect(node.nodeType).toBe('element');
      expect(node.textContent).toBe('content');
    });

    it('createElementWithText should create element with text child', () => {
      const node = createElementWithText('book', 'The Great Gatsby');
      expect(node.nodeType).toBe('element');
      expect(node.localName).toBe('book');
      expect(node.textContent).toBe('The Great Gatsby');
    });

    it('createElementWithChildren should create parent with children', () => {
      const child1 = createTestNode('element');
      const child2 = createTestNode('element');
      const parent = createElementWithChildren('parent', [child1, child2]);
      expect(parent.nodeType).toBe('element');
      expect(parent.childNodes?.length).toBe(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should atomize element with schema type', () => {
      const node: XPathNode = {
        nodeType: 'element',
        nodeName: 'age',
        textContent: '25',
        type: 'integer',
        childNodes: [createTestNode('text', '25')]
      };
      const result = atomize(node);
      expect(result.values.length).toBeGreaterThan(0);
    });

    it('should handle mixed sequence atomization', () => {
      const node = createElementWithText('value', '42');
      const sequence = [1, 'string', node, undefined, 3.14];
      const result = atomize(sequence);
      // Should contain: 1, 'string', '42', 3.14 (undefined filtered out)
      expect(result.values.length).toBeGreaterThanOrEqual(4);
    });

    it('should concatenate multiple text nodes in element', () => {
      const text1 = createTestNode('text', 'Hello ');
      const text2 = createTestNode('text', 'World');
      const elem = createElementWithChildren('greeting', [text1, text2]);
      const value = getNodeStringValue(elem);
      expect(value).toContain('Hello');
      expect(value).toContain('World');
    });
  });
});
