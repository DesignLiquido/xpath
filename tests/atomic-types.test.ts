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
} from '../src/types';

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
      expect(isNumericType(getAtomicType('integer')!)).toBe(true);
      expect(isNumericType(getAtomicType('decimal')!)).toBe(true);
      expect(isNumericType(getAtomicType('float')!)).toBe(true);
      expect(isNumericType(getAtomicType('double')!)).toBe(true);
      expect(isNumericType(getAtomicType('string')!)).toBe(false);
      expect(isNumericType(getAtomicType('boolean')!)).toBe(false);
    });

    it('should generate qualified type names', () => {
      expect(xsType('string')).toBe('{http://www.w3.org/2001/XMLSchema}string');
      expect(xsType('integer')).toBe('{http://www.w3.org/2001/XMLSchema}integer');
    });
  });

  describe('xs:gYearMonth', () => {
    it('should validate gYearMonth objects', () => {
      const ym = { year: 2024, month: 1 };
      expect(isInstanceOf(ym, 'gYearMonth')).toBe(true);
    });

    it('should parse gYearMonth strings', () => {
      const ym = castAs('2024-01', 'gYearMonth');
      expect(ym.year).toBe(2024);
      expect(ym.month).toBe(1);
    });

    it('should parse negative years', () => {
      const ym = castAs('-0001-12', 'gYearMonth');
      expect(ym.year).toBe(-1);
      expect(ym.month).toBe(12);
    });

    it('should throw error for invalid month', () => {
      expect(() => castAs('2024-13', 'gYearMonth')).toThrow();
      expect(() => castAs('2024-00', 'gYearMonth')).toThrow();
    });

    it('should throw error for invalid format', () => {
      expect(() => castAs('2024', 'gYearMonth')).toThrow();
      expect(() => castAs('2024/01', 'gYearMonth')).toThrow();
    });
  });

  describe('xs:gYear', () => {
    it('should parse gYear strings', () => {
      const y = castAs('2024', 'gYear');
      expect(y.year).toBe(2024);
    });

    it('should parse negative years', () => {
      const y = castAs('-0001', 'gYear');
      expect(y.year).toBe(-1);
    });
  });

  describe('xs:gMonthDay', () => {
    it('should parse gMonthDay strings', () => {
      const md = castAs('--01-15', 'gMonthDay');
      expect(md.month).toBe(1);
      expect(md.day).toBe(15);
    });

    it('should throw error for invalid values', () => {
      expect(() => castAs('--13-15', 'gMonthDay')).toThrow();
      expect(() => castAs('--01-32', 'gMonthDay')).toThrow();
    });
  });

  describe('xs:gDay', () => {
    it('should parse gDay strings', () => {
      const d = castAs('---15', 'gDay');
      expect(d.day).toBe(15);
    });

    it('should throw error for invalid day', () => {
      expect(() => castAs('---32', 'gDay')).toThrow();
      expect(() => castAs('---00', 'gDay')).toThrow();
    });
  });

  describe('xs:gMonth', () => {
    it('should parse gMonth strings', () => {
      const m = castAs('--01', 'gMonth');
      expect(m.month).toBe(1);
    });

    it('should throw error for invalid month', () => {
      expect(() => castAs('--13', 'gMonth')).toThrow();
      expect(() => castAs('--00', 'gMonth')).toThrow();
    });
  });

  describe('xs:hexBinary', () => {
    it('should validate hex strings', () => {
      expect(isInstanceOf('48656C6C6F', 'hexBinary')).toBe(true);
      expect(isInstanceOf('0123456789ABCDEF', 'hexBinary')).toBe(true);
    });

    it('should validate Uint8Array', () => {
      expect(isInstanceOf(new Uint8Array([1, 2, 3]), 'hexBinary')).toBe(true);
    });

    it('should cast hex string to uppercase', () => {
      expect(castAs('48656c6c6f', 'hexBinary')).toBe('48656C6C6F');
    });

    it('should cast Uint8Array to hex', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      expect(castAs(bytes, 'hexBinary')).toBe('48656C6C6F');
    });

    it('should reject invalid hex strings', () => {
      expect(() => castAs('ZZZZ', 'hexBinary')).toThrow();
      expect(() => castAs('123', 'hexBinary')).toThrow(); // odd length
    });
  });

  describe('xs:base64Binary', () => {
    it('should validate base64 strings', () => {
      expect(isInstanceOf('SGVsbG8=', 'base64Binary')).toBe(true);
      expect(isInstanceOf('AQIDBA==', 'base64Binary')).toBe(true);
    });

    it('should cast Uint8Array to base64', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      expect(castAs(bytes, 'base64Binary')).toBe('SGVsbG8=');
    });

    it('should reject invalid base64 strings', () => {
      expect(() => castAs('SGVsbG8', 'base64Binary')).toThrow(); // invalid length
      expect(() => castAs('SGVs!G8=', 'base64Binary')).toThrow(); // invalid chars
    });
  });

  describe('Integer-derived types', () => {
    describe('xs:long', () => {
      it('should accept values in range', () => {
        expect(castAs(123456789, 'long')).toBe(123456789);
        expect(castAs(-123456789, 'long')).toBe(-123456789);
      });

      it('should reject out-of-range values', () => {
        expect(() => castAs(Number.MAX_SAFE_INTEGER + 1, 'long')).toThrow();
      });
    });

    describe('xs:int', () => {
      it('should accept values in range', () => {
        expect(castAs(2147483647, 'int')).toBe(2147483647);
        expect(castAs(-2147483648, 'int')).toBe(-2147483648);
      });

      it('should reject out-of-range values', () => {
        expect(() => castAs(2147483648, 'int')).toThrow();
        expect(() => castAs(-2147483649, 'int')).toThrow();
      });
    });

    describe('xs:short', () => {
      it('should accept values in range', () => {
        expect(castAs(32767, 'short')).toBe(32767);
        expect(castAs(-32768, 'short')).toBe(-32768);
      });

      it('should reject out-of-range values', () => {
        expect(() => castAs(32768, 'short')).toThrow();
        expect(() => castAs(-32769, 'short')).toThrow();
      });
    });

    describe('xs:byte', () => {
      it('should accept values in range', () => {
        expect(castAs(127, 'byte')).toBe(127);
        expect(castAs(-128, 'byte')).toBe(-128);
      });

      it('should reject out-of-range values', () => {
        expect(() => castAs(128, 'byte')).toThrow();
        expect(() => castAs(-129, 'byte')).toThrow();
      });
    });

    describe('xs:nonPositiveInteger', () => {
      it('should accept zero and negative values', () => {
        expect(castAs(0, 'nonPositiveInteger')).toBe(0);
        expect(castAs(-123, 'nonPositiveInteger')).toBe(-123);
      });

      it('should reject positive values', () => {
        expect(() => castAs(1, 'nonPositiveInteger')).toThrow();
      });
    });

    describe('xs:negativeInteger', () => {
      it('should accept negative values', () => {
        expect(castAs(-1, 'negativeInteger')).toBe(-1);
        expect(castAs(-123, 'negativeInteger')).toBe(-123);
      });

      it('should reject zero and positive values', () => {
        expect(() => castAs(0, 'negativeInteger')).toThrow();
        expect(() => castAs(1, 'negativeInteger')).toThrow();
      });
    });

    describe('xs:nonNegativeInteger', () => {
      it('should accept zero and positive values', () => {
        expect(castAs(0, 'nonNegativeInteger')).toBe(0);
        expect(castAs(123, 'nonNegativeInteger')).toBe(123);
      });

      it('should reject negative values', () => {
        expect(() => castAs(-1, 'nonNegativeInteger')).toThrow();
      });
    });

    describe('xs:positiveInteger', () => {
      it('should accept positive values', () => {
        expect(castAs(1, 'positiveInteger')).toBe(1);
        expect(castAs(123, 'positiveInteger')).toBe(123);
      });

      it('should reject zero and negative values', () => {
        expect(() => castAs(0, 'positiveInteger')).toThrow();
        expect(() => castAs(-1, 'positiveInteger')).toThrow();
      });
    });

    describe('xs:unsignedLong', () => {
      it('should accept non-negative values', () => {
        expect(castAs(0, 'unsignedLong')).toBe(0);
        expect(castAs(123456, 'unsignedLong')).toBe(123456);
      });

      it('should reject negative values', () => {
        expect(() => castAs(-1, 'unsignedLong')).toThrow();
      });
    });

    describe('xs:unsignedInt', () => {
      it('should accept values in range', () => {
        expect(castAs(0, 'unsignedInt')).toBe(0);
        expect(castAs(4294967295, 'unsignedInt')).toBe(4294967295);
      });

      it('should reject out-of-range values', () => {
        expect(() => castAs(-1, 'unsignedInt')).toThrow();
        expect(() => castAs(4294967296, 'unsignedInt')).toThrow();
      });
    });

    describe('xs:unsignedShort', () => {
      it('should accept values in range', () => {
        expect(castAs(0, 'unsignedShort')).toBe(0);
        expect(castAs(65535, 'unsignedShort')).toBe(65535);
      });

      it('should reject out-of-range values', () => {
        expect(() => castAs(-1, 'unsignedShort')).toThrow();
        expect(() => castAs(65536, 'unsignedShort')).toThrow();
      });
    });

    describe('xs:unsignedByte', () => {
      it('should accept values in range', () => {
        expect(castAs(0, 'unsignedByte')).toBe(0);
        expect(castAs(255, 'unsignedByte')).toBe(255);
      });

      it('should reject out-of-range values', () => {
        expect(() => castAs(-1, 'unsignedByte')).toThrow();
        expect(() => castAs(256, 'unsignedByte')).toThrow();
      });
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
      
      const intType = getAtomicType('int')!;
      expect(intType.baseType).toBeDefined();
      expect(intType.baseType!.name).toBe('long');
    });

    it('should have correct primitive types', () => {
      const integerType = getAtomicType('integer')!;
      expect(integerType.primitive).toBeDefined();
      expect(integerType.primitive!.name).toBe('decimal');

      const dateType = getAtomicType('date')!;
      expect(dateType.primitive).toBeDefined();
      expect(dateType.primitive!.name).toBe('dateTime');
      
      const byteType = getAtomicType('byte')!;
      expect(byteType.primitive).toBeDefined();
      expect(byteType.primitive!.name).toBe('decimal');
    });
  });
});
