/**
 * Unit tests for XPath 2.0 Atomic Types
 */

import {
  ATOMIC_TYPES,
  getAtomicType,
  isInstanceOf,
  castAs,
  isNumericType,
  xsType,
} from '../src/types/atomic-types';

describe('Atomic Types', () => {
  describe('Type Registry', () => {
    it('should have all basic built-in types', () => {
      expect(getAtomicType('string')).toBeDefined();
      expect(getAtomicType('boolean')).toBeDefined();
      expect(getAtomicType('decimal')).toBeDefined();
      expect(getAtomicType('float')).toBeDefined();
      expect(getAtomicType('double')).toBeDefined();
      expect(getAtomicType('integer')).toBeDefined();
      expect(getAtomicType('anyAtomicType')).toBeDefined();
      expect(getAtomicType('untypedAtomic')).toBeDefined();
    });

    it('should return undefined for unknown types', () => {
      expect(getAtomicType('unknownType')).toBeUndefined();
    });
  });

  describe('xs:string', () => {
    const stringType = getAtomicType('string')!;

    it('should validate strings', () => {
      expect(stringType.validate('hello')).toBe(true);
      expect(stringType.validate('')).toBe(true);
      expect(stringType.validate(123)).toBe(false);
      expect(stringType.validate(true)).toBe(false);
    });

    it('should cast values to string', () => {
      expect(castAs('hello', 'string')).toBe('hello');
      expect(castAs(123, 'string')).toBe('123');
      expect(castAs(true, 'string')).toBe('true');
      expect(castAs(false, 'string')).toBe('false');
    });

    it('should throw error for null/undefined', () => {
      expect(() => castAs(null, 'string')).toThrow();
      expect(() => castAs(undefined, 'string')).toThrow();
    });
  });

  describe('xs:boolean', () => {
    it('should validate booleans', () => {
      expect(isInstanceOf(true, 'boolean')).toBe(true);
      expect(isInstanceOf(false, 'boolean')).toBe(true);
      expect(isInstanceOf(1, 'boolean')).toBe(false);
      expect(isInstanceOf('true', 'boolean')).toBe(false);
    });

    it('should cast string values', () => {
      expect(castAs('true', 'boolean')).toBe(true);
      expect(castAs('false', 'boolean')).toBe(false);
      expect(castAs('1', 'boolean')).toBe(true);
      expect(castAs('0', 'boolean')).toBe(false);
      expect(castAs(' TRUE ', 'boolean')).toBe(true);
      expect(castAs(' FALSE ', 'boolean')).toBe(false);
    });

    it('should cast numeric values', () => {
      expect(castAs(1, 'boolean')).toBe(true);
      expect(castAs(0, 'boolean')).toBe(false);
    });

    it('should throw error for invalid casts', () => {
      expect(() => castAs('yes', 'boolean')).toThrow();
      expect(() => castAs(2, 'boolean')).toThrow();
      expect(() => castAs(-1, 'boolean')).toThrow();
    });
  });

  describe('xs:decimal', () => {
    it('should validate decimal numbers', () => {
      expect(isInstanceOf(123, 'decimal')).toBe(true);
      expect(isInstanceOf(123.456, 'decimal')).toBe(true);
      expect(isInstanceOf(-123.456, 'decimal')).toBe(true);
      expect(isInstanceOf(Infinity, 'decimal')).toBe(false);
      expect(isInstanceOf(NaN, 'decimal')).toBe(false);
    });

    it('should cast string values', () => {
      expect(castAs('123', 'decimal')).toBe(123);
      expect(castAs('123.456', 'decimal')).toBe(123.456);
      expect(castAs('-123.456', 'decimal')).toBe(-123.456);
    });

    it('should cast boolean values', () => {
      expect(castAs(true, 'decimal')).toBe(1);
      expect(castAs(false, 'decimal')).toBe(0);
    });

    it('should throw error for invalid values', () => {
      expect(() => castAs('abc', 'decimal')).toThrow();
      expect(() => castAs(Infinity, 'decimal')).toThrow();
      expect(() => castAs(NaN, 'decimal')).toThrow();
    });
  });

  describe('xs:float and xs:double', () => {
    it('should validate float values', () => {
      expect(isInstanceOf(123.456, 'float')).toBe(true);
      expect(isInstanceOf(Infinity, 'float')).toBe(true);
      expect(isInstanceOf(-Infinity, 'float')).toBe(true);
      expect(isInstanceOf(NaN, 'float')).toBe(true);
    });

    it('should cast special values', () => {
      expect(castAs('INF', 'float')).toBe(Infinity);
      expect(castAs('-INF', 'float')).toBe(-Infinity);
      expect(castAs('NaN', 'float')).toBe(NaN);
    });

    it('should cast numeric strings', () => {
      expect(castAs('123.456', 'double')).toBe(123.456);
      expect(castAs(' 123.456 ', 'double')).toBe(123.456);
    });

    it('should cast boolean values', () => {
      expect(castAs(true, 'float')).toBe(1);
      expect(castAs(false, 'double')).toBe(0);
    });
  });

  describe('xs:integer', () => {
    it('should validate integers', () => {
      expect(isInstanceOf(123, 'integer')).toBe(true);
      expect(isInstanceOf(-123, 'integer')).toBe(true);
      expect(isInstanceOf(0, 'integer')).toBe(true);
      expect(isInstanceOf(123.456, 'integer')).toBe(false);
    });

    it('should cast values to integer', () => {
      expect(castAs(123.456, 'integer')).toBe(123);
      expect(castAs(123.999, 'integer')).toBe(123);
      expect(castAs(-123.456, 'integer')).toBe(-123);
      expect(castAs('123', 'integer')).toBe(123);
      expect(castAs('123.456', 'integer')).toBe(123);
    });

    it('should cast boolean values', () => {
      expect(castAs(true, 'integer')).toBe(1);
      expect(castAs(false, 'integer')).toBe(0);
    });

    it('should throw error for special values', () => {
      expect(() => castAs(Infinity, 'integer')).toThrow();
      expect(() => castAs(NaN, 'integer')).toThrow();
    });
  });

  describe('xs:duration', () => {
    it('should validate duration objects', () => {
      const duration = {
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
      };
      expect(isInstanceOf(duration, 'duration')).toBe(true);
    });

    it('should parse ISO 8601 duration strings', () => {
      const duration1 = castAs('P1Y2M3DT4H5M6S', 'duration');
      expect(duration1.years).toBe(1);
      expect(duration1.months).toBe(2);
      expect(duration1.days).toBe(3);
      expect(duration1.hours).toBe(4);
      expect(duration1.minutes).toBe(5);
      expect(duration1.seconds).toBe(6);

      const duration2 = castAs('PT5H', 'duration');
      expect(duration2.hours).toBe(5);
      expect(duration2.minutes).toBe(0);

      const duration3 = castAs('P1Y', 'duration');
      expect(duration3.years).toBe(1);
      expect(duration3.months).toBe(0);
    });

    it('should parse negative durations', () => {
      const duration = castAs('-P1Y', 'duration');
      expect(duration.negative).toBe(true);
      expect(duration.years).toBe(-1);
    });

    it('should throw error for invalid format', () => {
      expect(() => castAs('1 year', 'duration')).toThrow();
      expect(() => castAs('P', 'duration')).toThrow();
    });
  });

  describe('xs:dateTime', () => {
    it('should validate Date objects', () => {
      expect(isInstanceOf(new Date(), 'dateTime')).toBe(true);
    });

    it('should cast ISO 8601 date strings', () => {
      const date = castAs('2024-01-15T10:30:00Z', 'dateTime');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
    });

    it('should throw error for invalid dates', () => {
      expect(() => castAs('not a date', 'dateTime')).toThrow();
    });
  });

  describe('xs:date', () => {
    it('should cast to date and reset time', () => {
      const date = castAs('2024-01-15T10:30:00Z', 'date');
      expect(date).toBeInstanceOf(Date);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });
  });

  describe('xs:time', () => {
    it('should validate time objects', () => {
      const time = { hours: 10, minutes: 30, seconds: 45 };
      expect(isInstanceOf(time, 'time')).toBe(true);
    });

    it('should parse time strings', () => {
      const time = castAs('10:30:45', 'time');
      expect(time.hours).toBe(10);
      expect(time.minutes).toBe(30);
      expect(time.seconds).toBe(45);
    });

    it('should parse time with timezone', () => {
      const time = castAs('10:30:45+05:30', 'time');
      expect(time.hours).toBe(10);
      expect(time.timezone).toBeDefined();
      expect(time.timezone.sign).toBe('+');
      expect(time.timezone.hours).toBe(5);
      expect(time.timezone.minutes).toBe(30);
    });

    it('should throw error for invalid time format', () => {
      expect(() => castAs('25:00:00', 'time')).toThrow();
      expect(() => castAs('10:30', 'time')).toThrow();
    });
  });

  describe('xs:anyURI', () => {
    it('should validate and cast URIs', () => {
      expect(isInstanceOf('http://example.com', 'anyURI')).toBe(true);
      expect(castAs('http://example.com', 'anyURI')).toBe('http://example.com');
      expect(castAs('relative/path', 'anyURI')).toBe('relative/path');
    });
  });

  describe('xs:QName', () => {
    it('should validate QName objects', () => {
      const qname = { localName: 'element', namespaceURI: 'http://example.com', prefix: 'ex' };
      expect(isInstanceOf(qname, 'QName')).toBe(true);
    });

    it('should parse QName strings', () => {
      const qname1 = castAs('element', 'QName');
      expect(qname1.localName).toBe('element');
      expect(qname1.prefix).toBeUndefined();

      const qname2 = castAs('ex:element', 'QName');
      expect(qname2.localName).toBe('element');
      expect(qname2.prefix).toBe('ex');
    });
  });

  describe('xs:untypedAtomic', () => {
    it('should validate strings', () => {
      expect(isInstanceOf('hello', 'untypedAtomic')).toBe(true);
      expect(isInstanceOf(123, 'untypedAtomic')).toBe(false);
    });

    it('should cast to string', () => {
      expect(castAs('hello', 'untypedAtomic')).toBe('hello');
      expect(castAs(123, 'untypedAtomic')).toBe('123');
    });
  });

  describe('Type Utilities', () => {
    it('should identify numeric types', () => {
      expect(isNumericType('integer')).toBe(true);
      expect(isNumericType('decimal')).toBe(true);
      expect(isNumericType('float')).toBe(true);
      expect(isNumericType('double')).toBe(true);
      expect(isNumericType('string')).toBe(false);
      expect(isNumericType('boolean')).toBe(false);
    });

    it('should generate qualified type names', () => {
      expect(xsType('string')).toBe('{http://www.w3.org/2001/XMLSchema}string');
      expect(xsType('integer')).toBe('{http://www.w3.org/2001/XMLSchema}integer');
    });
  });

  describe('Type Hierarchy', () => {
    it('should have correct base types', () => {
      const integerType = getAtomicType('integer')!;
      expect(integerType.baseType).toBeDefined();
      expect(integerType.baseType!.name).toBe('decimal');

      const untypedType = getAtomicType('untypedAtomic')!;
      expect(untypedType.baseType).toBeDefined();
      expect(untypedType.baseType!.name).toBe('anyAtomicType');
    });

    it('should have correct primitive types', () => {
      const integerType = getAtomicType('integer')!;
      expect(integerType.primitive).toBeDefined();
      expect(integerType.primitive!.name).toBe('decimal');

      const dateType = getAtomicType('date')!;
      expect(dateType.primitive).toBeDefined();
      expect(dateType.primitive!.name).toBe('dateTime');
    });
  });
});
