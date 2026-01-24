/**
 * XPath Error System Tests (Phase 7.1)
 *
 * Comprehensive test suite for error codes, error classes, validation,
 * and error propagation per W3C XPath 2.0 specification.
 */

import {
  XPathError,
  XPathStaticError,
  XPathDynamicError,
  XPathTypeError,
  staticContextComponentUndefined,
  grammarViolation,
  emptySequenceNotAllowed,
  unresolvedNameReference,
  unsupportedAxis,
  functionSignatureMismatch,
  unknownAtomicType,
  notationOrAnyAtomicInCast,
  dynamicContextUndefined,
  contextItemNotNode,
  typeMismatch,
  mixedPathContent,
  nonNodeInPath,
  contextItemNotNodeInPath,
  invalidCastArgument,
  elementOnlyContent,
  invalidTimezone,
  divisionByZero,
  validateNotUndefined,
  validateArgumentCount,
  validateNumericOperands,
  isStaticError,
  isDynamicError,
  isXPathError,
  getErrorCode,
  formatError,
  XPATH_ERROR_NAMESPACE,
} from '../src/errors';
import * as codes from '../src/errors/codes';

describe('XPath Error System (Phase 7.1)', () => {
  // ============================================================================
  // ERROR CLASS TESTS
  // ============================================================================

  describe('XPathError (base class)', () => {
    it('creates error with code and message', () => {
      const error = new XPathError('TEST0001', 'Test message');
      expect(error.code).toBe('TEST0001');
      expect(error.message).toContain('TEST0001');
      expect(error.message).toContain('Test message');
    });

    it('includes code in message', () => {
      const error = new XPathError('XPST0001', 'Component undefined');
      expect(error.message).toBe('XPST0001: Component undefined');
    });

    it('generates qualified QName', () => {
      const error = new XPathError('XPST0001', 'Test');
      expect(error.getQName()).toBe('err:XPST0001');
    });

    it('generates error URI', () => {
      const error = new XPathError('XPST0001', 'Test');
      expect(error.getErrorURI()).toContain(XPATH_ERROR_NAMESPACE);
      expect(error.getErrorURI()).toContain('XPST0001');
    });

    it('tracks static/dynamic error type', () => {
      const staticErr = new XPathError('XPST0001', 'Static', true, false);
      expect(staticErr.isStatic).toBe(true);
      expect(staticErr.isDynamic).toBe(false);

      const dynamicErr = new XPathError('XPDY0002', 'Dynamic', false, true);
      expect(dynamicErr.isStatic).toBe(false);
      expect(dynamicErr.isDynamic).toBe(true);
    });

    it('extends Error class', () => {
      const error = new XPathError('TEST0001', 'Test');
      expect(error instanceof Error).toBe(true);
      expect(error.name).toBe('XPathError');
    });
  });

  describe('XPathStaticError', () => {
    it('creates static error with proper flags', () => {
      const error = new XPathStaticError('XPST0001', 'Test');
      expect(error.isStatic).toBe(true);
      expect(error.isDynamic).toBe(false);
      expect(error.name).toBe('XPathStaticError');
    });

    it('extends XPathError', () => {
      const error = new XPathStaticError('XPST0001', 'Test');
      expect(error instanceof XPathError).toBe(true);
    });
  });

  describe('XPathDynamicError', () => {
    it('creates dynamic error with proper flags', () => {
      const error = new XPathDynamicError('XPDY0002', 'Test');
      expect(error.isStatic).toBe(false);
      expect(error.isDynamic).toBe(true);
      expect(error.name).toBe('XPathDynamicError');
    });

    it('extends XPathError', () => {
      const error = new XPathDynamicError('XPDY0002', 'Test');
      expect(error instanceof XPathError).toBe(true);
    });
  });

  describe('XPathTypeError', () => {
    it('creates type error as subclass of dynamic error', () => {
      const error = new XPathTypeError('XPTY0004', 'Type mismatch');
      expect(error.isDynamic).toBe(true);
      expect(error.isStatic).toBe(false);
      expect(error instanceof XPathDynamicError).toBe(true);
      expect(error.name).toBe('XPathTypeError');
    });
  });

  // ============================================================================
  // STATIC ERROR FACTORY TESTS (XPST*)
  // ============================================================================

  describe('Static Errors (XPST*)', () => {
    it('XPST0001: staticContextComponentUndefined', () => {
      const error = staticContextComponentUndefined('namespace');
      expect(error.code).toBe('XPST0001');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('namespace');
    });

    it('XPST0003: grammarViolation', () => {
      const error = grammarViolation('Unexpected token');
      expect(error.code).toBe('XPST0003');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('Unexpected token');
    });

    it('XPST0005: emptySequenceNotAllowed', () => {
      const error = emptySequenceNotAllowed('cast');
      expect(error.code).toBe('XPST0005');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('cast');
    });

    it('XPST0008: unresolvedNameReference for variable', () => {
      const error = unresolvedNameReference('$myVar', 'variable');
      expect(error.code).toBe('XPST0008');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('$myVar');
      expect(error.message).toContain('variable');
    });

    it('XPST0008: unresolvedNameReference for function', () => {
      const error = unresolvedNameReference('fn:unknown', 'function');
      expect(error.code).toBe('XPST0008');
      expect(error.message).toContain('fn:unknown');
      expect(error.message).toContain('function');
    });

    it('XPST0008: unresolvedNameReference with default type', () => {
      const error = unresolvedNameReference('something');
      expect(error.code).toBe('XPST0008');
      expect(error.message).toContain('something');
      expect(error.message).toContain('name');
    });

    it('XPST0010: unsupportedAxis', () => {
      const error = unsupportedAxis('namespace');
      expect(error.code).toBe('XPST0010');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('namespace');
    });

    it('XPST0017: functionSignatureMismatch', () => {
      const error = functionSignatureMismatch('fn:concat', '2+', 0);
      expect(error.code).toBe('XPST0017');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('fn:concat');
      expect(error.message).toContain('2+');
      expect(error.message).toContain('0');
    });

    it('XPST0051: unknownAtomicType', () => {
      const error = unknownAtomicType('xs:unknownType');
      expect(error.code).toBe('XPST0051');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('xs:unknownType');
    });

    it('XPST0080: notationOrAnyAtomicInCast', () => {
      const error = notationOrAnyAtomicInCast('xs:NOTATION');
      expect(error.code).toBe('XPST0080');
      expect(error.isStatic).toBe(true);
      expect(error.message).toContain('NOTATION');
    });
  });

  // ============================================================================
  // DYNAMIC ERROR FACTORY TESTS (XPDY*)
  // ============================================================================

  describe('Dynamic Errors (XPDY*)', () => {
    it('XPDY0002: dynamicContextUndefined', () => {
      const error = dynamicContextUndefined('currentDateTime');
      expect(error.code).toBe('XPDY0002');
      expect(error.isDynamic).toBe(true);
      expect(error.message).toContain('currentDateTime');
    });

    it('XPDY0050: contextItemNotNode with context', () => {
      const error = contextItemNotNode('document');
      expect(error.code).toBe('XPDY0050');
      expect(error.isDynamic).toBe(true);
      expect(error.message).toContain('document');
    });

    it('XPDY0050: contextItemNotNode without context', () => {
      const error = contextItemNotNode();
      expect(error.code).toBe('XPDY0050');
      expect(error.message).toContain('not a node');
    });
  });

  // ============================================================================
  // TYPE ERROR FACTORY TESTS (XPTY*)
  // ============================================================================

  describe('Type Errors (XPTY*)', () => {
    it('XPTY0004: typeMismatch with context', () => {
      const error = typeMismatch('numeric', 'string', 'arithmetic');
      expect(error.code).toBe('XPTY0004');
      expect(error instanceof XPathTypeError).toBe(true);
      expect(error.message).toContain('arithmetic');
      expect(error.message).toContain('numeric');
      expect(error.message).toContain('string');
    });

    it('XPTY0004: typeMismatch without context', () => {
      const error = typeMismatch('xs:integer', 'xs:string');
      expect(error.code).toBe('XPTY0004');
      expect(error.message).not.toContain('in ');
    });

    it('XPTY0018: mixedPathContent', () => {
      const error = mixedPathContent();
      expect(error.code).toBe('XPTY0018');
      expect(error.isDynamic).toBe(true);
      expect(error.message).toContain('node-set');
      expect(error.message).toContain('atomic');
    });

    it('XPTY0019: nonNodeInPath', () => {
      const error = nonNodeInPath('xs:string');
      expect(error.code).toBe('XPTY0019');
      expect(error.isDynamic).toBe(true);
      expect(error.message).toContain('xs:string');
    });

    it('XPTY0020: contextItemNotNodeInPath', () => {
      const error = contextItemNotNodeInPath();
      expect(error.code).toBe('XPTY0020');
      expect(error.isDynamic).toBe(true);
    });
  });

  // ============================================================================
  // FUNCTION EXECUTION ERROR TESTS
  // ============================================================================

  describe('Function Execution Errors', () => {
    it('FORG0001: invalidCastArgument', () => {
      const error = invalidCastArgument('abc', 'xs:integer');
      expect(error.code).toBe('FORG0001');
      expect(error.isDynamic).toBe(true);
      expect(error.message).toContain('abc');
      expect(error.message).toContain('xs:integer');
    });

    it('FOTY0012: elementOnlyContent', () => {
      const error = elementOnlyContent();
      expect(error.code).toBe('FOTY0012');
      expect(error.isDynamic).toBe(true);
      expect(error.message).toContain('element-only');
    });

    it('FODT0002: invalidTimezone', () => {
      const error = invalidTimezone('UTC+25:00');
      expect(error.code).toBe('FODT0002');
      expect(error.isDynamic).toBe(true);
      expect(error.message).toContain('UTC+25:00');
    });

    it('FOAR0001: divisionByZero', () => {
      const error = divisionByZero();
      expect(error.code).toBe('FOAR0001');
      expect(error.isDynamic).toBe(true);
    });
  });

  // ============================================================================
  // VALIDATION HELPER TESTS
  // ============================================================================

  describe('Validation Helpers', () => {
    it('validateNotUndefined returns value when defined', () => {
      const value = 'test';
      const result = validateNotUndefined(value, 'context');
      expect(result).toBe(value);
    });

    it('validateNotUndefined throws on null', () => {
      expect(() => {
        validateNotUndefined(null, 'test');
      }).toThrow();
    });

    it('validateNotUndefined throws on undefined', () => {
      expect(() => {
        validateNotUndefined(undefined, 'test');
      }).toThrow();
    });

    it('validateNotUndefined error includes context', () => {
      try {
        validateNotUndefined(null, 'myComponent');
        fail('Should throw');
      } catch (error) {
        expect((error as any).code).toBe('XPDY0002');
        expect((error as any).message).toContain('myComponent');
      }
    });

    it('validateArgumentCount accepts valid count', () => {
      expect(() => {
        validateArgumentCount('fn:test', 2, 2);
      }).not.toThrow();
    });

    it('validateArgumentCount accepts count in range', () => {
      expect(() => {
        validateArgumentCount('fn:test', 3, 2, 5);
      }).not.toThrow();
    });

    it('validateArgumentCount throws on too few arguments', () => {
      expect(() => {
        validateArgumentCount('fn:test', 1, 2);
      }).toThrow('XPST0017');
    });

    it('validateArgumentCount throws on too many arguments', () => {
      expect(() => {
        validateArgumentCount('fn:test', 5, 2, 4);
      }).toThrow('XPST0017');
    });

    it('validateArgumentCount formats range error message', () => {
      try {
        validateArgumentCount('fn:concat', 0, 2, 5);
        fail('Should throw');
      } catch (error) {
        expect((error as any).message).toContain('2 to 5');
      }
    });

    it('validateNumericOperands accepts numeric values', () => {
      expect(() => {
        validateNumericOperands(5, 3);
      }).not.toThrow();
    });

    it('validateNumericOperands accepts strings', () => {
      expect(() => {
        validateNumericOperands('5', '3');
      }).not.toThrow();
    });

    it('validateNumericOperands accepts booleans', () => {
      expect(() => {
        validateNumericOperands(true, false);
      }).not.toThrow();
    });

    it('validateNumericOperands accepts mixed numeric types', () => {
      expect(() => {
        validateNumericOperands(5, '3');
        validateNumericOperands(true, 3.14);
      }).not.toThrow();
    });

    it('validateNumericOperands allows null/undefined', () => {
      // Empty sequence handling - valid in XPath 2.0
      expect(() => {
        validateNumericOperands(null, 5);
        validateNumericOperands(undefined, 5);
      }).not.toThrow();
    });

    it('validateNumericOperands rejects non-numeric left', () => {
      expect(() => {
        validateNumericOperands({}, 5);
      }).toThrow('XPTY0004');
    });

    it('validateNumericOperands rejects non-numeric right', () => {
      expect(() => {
        validateNumericOperands(5, {});
      }).toThrow('XPTY0004');
    });
  });

  // ============================================================================
  // ERROR CLASSIFICATION TESTS
  // ============================================================================

  describe('Error Classification', () => {
    it('isStaticError identifies static errors', () => {
      const error = new XPathStaticError('XPST0001', 'Test');
      expect(isStaticError(error)).toBe(true);
      expect(isDynamicError(error)).toBe(false);
      expect(isXPathError(error)).toBe(true);
    });

    it('isDynamicError identifies dynamic errors', () => {
      const error = new XPathDynamicError('XPDY0002', 'Test');
      expect(isDynamicError(error)).toBe(true);
      expect(isStaticError(error)).toBe(false);
      expect(isXPathError(error)).toBe(true);
    });

    it('isXPathError identifies all XPath errors', () => {
      expect(isXPathError(new XPathError('TEST', 'Test'))).toBe(true);
      expect(isXPathError(new XPathStaticError('XPST', 'Test'))).toBe(true);
      expect(isXPathError(new XPathDynamicError('XPDY', 'Test'))).toBe(true);
      expect(isXPathError(new Error('Regular error'))).toBe(false);
    });

    it('getErrorCode extracts code from XPath error', () => {
      const error = new XPathError('XPST0001', 'Test');
      expect(getErrorCode(error)).toBe('XPST0001');
    });

    it('getErrorCode returns null for non-XPath errors', () => {
      expect(getErrorCode(new Error('Regular'))).toBeNull();
      expect(getErrorCode('string')).toBeNull();
    });

    it('formatError includes code and message', () => {
      const error = new XPathError('XPST0001', 'Test message');
      expect(formatError(error)).toBe('XPST0001: Test message');
    });

    it('formatError handles regular Error', () => {
      const error = new Error('Regular error');
      expect(formatError(error)).toBe('Regular error');
    });

    it('formatError handles non-Error values', () => {
      expect(formatError('string')).toBe('string');
      expect(formatError(123)).toBe('123');
    });
  });

  // ============================================================================
  // ERROR CODE METADATA TESTS
  // ============================================================================

  describe('Error Code Metadata', () => {
    it('getErrorMetadata returns metadata for known code', () => {
      const meta = codes.getErrorMetadata('XPST0001');
      expect(meta).toBeDefined();
      expect(meta?.code).toBe('XPST0001');
      expect(meta?.type).toBe('static');
      expect(meta?.description).toBeDefined();
    });

    it('getErrorMetadata returns undefined for unknown code', () => {
      const meta = codes.getErrorMetadata('UNKNOWN0000');
      expect(meta).toBeUndefined();
    });

    it('isStaticErrorCode identifies static codes', () => {
      expect(codes.isStaticErrorCode('XPST0001')).toBe(true);
      expect(codes.isStaticErrorCode('XPST0008')).toBe(true);
    });

    it('isDynamicErrorCode identifies dynamic codes', () => {
      expect(codes.isDynamicErrorCode('XPDY0002')).toBe(true);
      expect(codes.isDynamicErrorCode('XPDY0050')).toBe(true);
    });

    it('isTypeErrorCode identifies type error codes', () => {
      expect(codes.isTypeErrorCode('XPTY0004')).toBe(true);
      expect(codes.isTypeErrorCode('XPTY0020')).toBe(true);
    });

    it('getErrorCodesByType returns correct codes', () => {
      const staticCodes = codes.getErrorCodesByType('static');
      expect(staticCodes).toContain('XPST0001');
      expect(staticCodes).toContain('XPST0003');
      expect(staticCodes).not.toContain('XPDY0002');

      const dynamicCodes = codes.getErrorCodesByType('dynamic');
      expect(dynamicCodes).toContain('XPDY0002');
      expect(dynamicCodes).not.toContain('XPST0001');

      const typeCodes = codes.getErrorCodesByType('type');
      expect(typeCodes).toContain('XPTY0004');
      expect(typeCodes).not.toContain('XPST0001');
    });

    it('formatErrorCodeDescription includes code and title', () => {
      const description = codes.formatErrorCodeDescription('XPST0001');
      expect(description).toContain('XPST0001');
      expect(description).toContain('Static context component');
    });

    it('formatErrorCodeDescription handles unknown code', () => {
      const description = codes.formatErrorCodeDescription('UNKNOWN');
      expect(description).toContain('Unknown error');
    });

    it('all error codes have metadata', () => {
      const xpstCodes = ['XPST0001', 'XPST0003', 'XPST0005', 'XPST0008', 'XPST0010', 'XPST0017', 'XPST0051', 'XPST0080'];
      xpstCodes.forEach(code => {
        const meta = codes.getErrorMetadata(code);
        expect(meta).toBeDefined();
        expect(meta?.code).toBe(code);
        expect(meta?.type).toBe('static');
      });

      const xpdyCodes = ['XPDY0002', 'XPDY0050'];
      xpdyCodes.forEach(code => {
        const meta = codes.getErrorMetadata(code);
        expect(meta).toBeDefined();
        expect(meta?.code).toBe(code);
        expect(meta?.type).toBe('dynamic');
      });

      const xptyCodes = ['XPTY0004', 'XPTY0018', 'XPTY0019', 'XPTY0020'];
      xptyCodes.forEach(code => {
        const meta = codes.getErrorMetadata(code);
        expect(meta).toBeDefined();
        expect(meta?.code).toBe(code);
        expect(meta?.type).toBe('type');
      });
    });
  });

  // ============================================================================
  // ERROR PROPAGATION TESTS
  // ============================================================================

  describe('Error Propagation', () => {
    it('static errors terminate parsing immediately', () => {
      const error = staticContextComponentUndefined('namespace');
      expect(() => {
        throw error;
      }).toThrow(XPathStaticError);
    });

    it('dynamic errors can be caught during evaluation', () => {
      const error = dynamicContextUndefined('test');
      let caught = false;
      try {
        throw error;
      } catch (e) {
        if (isDynamicError(e)) {
          caught = true;
        }
      }
      expect(caught).toBe(true);
    });

    it('type errors are catchable as dynamic errors', () => {
      const error = typeMismatch('numeric', 'string');
      expect(error instanceof XPathDynamicError).toBe(true);
      let caught = false;
      try {
        throw error;
      } catch (e) {
        if (isDynamicError(e)) {
          caught = true;
        }
      }
      expect(caught).toBe(true);
    });

    it('preserves error code through throw/catch', () => {
      const originalCode = 'XPTY0004';
      try {
        throw typeMismatch('numeric', 'string');
      } catch (error) {
        expect(getErrorCode(error)).toBe(originalCode);
      }
    });

    it('preserves error message through throw/catch', () => {
      const message = 'Test message';
      try {
        throw new XPathDynamicError('XPDY0002', message);
      } catch (error) {
        expect((error as any).message).toContain(message);
      }
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles empty error messages', () => {
      const error = new XPathError('XPST0001', '');
      expect(error.code).toBe('XPST0001');
      expect(error.message).toBe('XPST0001: ');
    });

    it('handles special characters in error messages', () => {
      const message = 'Error with <>&" special chars';
      const error = new XPathDynamicError('XPDY0002', message);
      expect(error.message).toContain(message);
    });

    it('handles very long function names in signature mismatch', () => {
      const longName = 'fn:' + 'a'.repeat(100);
      const error = functionSignatureMismatch(longName, '2+', 1);
      expect(error.message).toContain(longName);
    });

    it('handles numeric edge cases in argument validation', () => {
      expect(() => {
        validateArgumentCount('fn:test', 0, 0);
      }).not.toThrow();

      expect(() => {
        validateArgumentCount('fn:test', 1000, 1000);
      }).not.toThrow();
    });

    it('handles undefined context in validation', () => {
      try {
        validateNotUndefined(undefined, '');
        fail('Should throw');
      } catch (error) {
        expect(isXPathError(error)).toBe(true);
      }
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration', () => {
    it('error codes follow naming convention', () => {
      Object.values(codes.ERROR_CODES).forEach(meta => {
        expect(meta.code).toMatch(/^(XPST|XPDY|XPTY|FO[A-Z]{2})\d{4}$/);
      });
    });

    it('error metadata includes descriptions', () => {
      Object.values(codes.ERROR_CODES).forEach(meta => {
        expect(meta.description).toBeTruthy();
        expect(meta.description.length).toBeGreaterThan(10);
      });
    });

    it('error factory functions create errors with correct codes', () => {
      const errors = [
        [staticContextComponentUndefined('test'), 'XPST0001'],
        [grammarViolation('test'), 'XPST0003'],
        [emptySequenceNotAllowed('test'), 'XPST0005'],
        [unresolvedNameReference('test'), 'XPST0008'],
        [unsupportedAxis('test'), 'XPST0010'],
        [functionSignatureMismatch('fn:test', '2', 1), 'XPST0017'],
        [unknownAtomicType('test'), 'XPST0051'],
        [notationOrAnyAtomicInCast('test'), 'XPST0080'],
        [dynamicContextUndefined('test'), 'XPDY0002'],
        [contextItemNotNode(), 'XPDY0050'],
        [typeMismatch('a', 'b'), 'XPTY0004'],
        [mixedPathContent(), 'XPTY0018'],
        [nonNodeInPath('test'), 'XPTY0019'],
        [contextItemNotNodeInPath(), 'XPTY0020'],
      ];

      errors.forEach(([error, expectedCode]) => {
        expect(getErrorCode(error as any)).toBe(expectedCode);
      });
    });
  });
});
