/**
 * XPath 2.0 Atomic Types Implementation
 * Provides the complete set of built-in atomic types as defined in W3C XML Schema Part 2
 */

// Re-export base types and interfaces
export { AtomicType, XS_NAMESPACE, xsType } from './base';
export { AtomicTypeImpl } from './base';

// Re-export all type implementations
export { AnyAtomicTypeImpl, UntypedAtomicImpl, StringTypeImpl, BooleanTypeImpl } from './simple-types';
export { DecimalTypeImpl, FloatTypeImpl, DoubleTypeImpl, IntegerTypeImpl } from './numeric-types';
export { DurationTypeImpl, DateTimeTypeImpl, DateTypeImpl, TimeTypeImpl } from './datetime-types';
export { parseDuration, parseTime } from './datetime-types';
export { GYearMonthTypeImpl, GYearTypeImpl, GMonthDayTypeImpl, GDayTypeImpl, GMonthTypeImpl } from './gregorian-types';
export { HexBinaryTypeImpl, Base64BinaryTypeImpl } from './binary-types';
export { AnyURITypeImpl, QNameTypeImpl } from './uri-qname-types';
export { IntegerDerivedTypeImpl } from './integer-derived-types';

// Import all type implementations
import { AnyAtomicTypeImpl } from './simple-types';
import { UntypedAtomicImpl } from './simple-types';
import { StringTypeImpl } from './simple-types';
import { BooleanTypeImpl } from './simple-types';
import { DecimalTypeImpl } from './numeric-types';
import { FloatTypeImpl } from './numeric-types';
import { DoubleTypeImpl } from './numeric-types';
import { IntegerTypeImpl } from './numeric-types';
import { DurationTypeImpl } from './datetime-types';
import { DateTimeTypeImpl } from './datetime-types';
import { DateTypeImpl } from './datetime-types';
import { TimeTypeImpl } from './datetime-types';
import { GYearMonthTypeImpl } from './gregorian-types';
import { GYearTypeImpl } from './gregorian-types';
import { GMonthDayTypeImpl } from './gregorian-types';
import { GDayTypeImpl } from './gregorian-types';
import { GMonthTypeImpl } from './gregorian-types';
import { HexBinaryTypeImpl } from './binary-types';
import { Base64BinaryTypeImpl } from './binary-types';
import { AnyURITypeImpl } from './uri-qname-types';
import { QNameTypeImpl } from './uri-qname-types';
import { IntegerDerivedTypeImpl } from './integer-derived-types';
import { AtomicType } from './base';

// ============================================================================
// Type Registry and Exports
// ============================================================================

// Create type instances
const anyAtomicType = new AnyAtomicTypeImpl();
const untypedAtomic = new UntypedAtomicImpl(anyAtomicType);
const stringType = new StringTypeImpl(anyAtomicType);
const booleanType = new BooleanTypeImpl(anyAtomicType);
const decimalType = new DecimalTypeImpl(anyAtomicType);
const floatType = new FloatTypeImpl(anyAtomicType);
const doubleType = new DoubleTypeImpl(anyAtomicType);
const durationType = new DurationTypeImpl(anyAtomicType);
const dateTimeType = new DateTimeTypeImpl(anyAtomicType);
const dateType = new DateTypeImpl(dateTimeType, dateTimeType);
const timeType = new TimeTypeImpl(dateTimeType, dateTimeType);
const anyURIType = new AnyURITypeImpl(anyAtomicType);
const qnameType = new QNameTypeImpl(anyAtomicType);

// Gregorian types
const gYearMonthType = new GYearMonthTypeImpl(anyAtomicType);
const gYearType = new GYearTypeImpl(anyAtomicType);
const gMonthDayType = new GMonthDayTypeImpl(anyAtomicType);
const gDayType = new GDayTypeImpl(anyAtomicType);
const gMonthType = new GMonthTypeImpl(anyAtomicType);

// Binary types
const hexBinaryType = new HexBinaryTypeImpl(anyAtomicType);
const base64BinaryType = new Base64BinaryTypeImpl(anyAtomicType);

// Integer is derived from decimal
const integerType = new IntegerTypeImpl(decimalType, decimalType);

// Integer-derived types with ranges
// Note: JavaScript numbers are 64-bit floats, so we use safe integer bounds
const longType = new IntegerDerivedTypeImpl('long', integerType, decimalType, -9223372036854775808, 9223372036854775807);
const intType = new IntegerDerivedTypeImpl('int', longType, decimalType, -2147483648, 2147483647);
const shortType = new IntegerDerivedTypeImpl('short', intType, decimalType, -32768, 32767);
const byteType = new IntegerDerivedTypeImpl('byte', shortType, decimalType, -128, 127);

const nonPositiveIntegerType = new IntegerDerivedTypeImpl('nonPositiveInteger', integerType, decimalType, undefined, 0);
const negativeIntegerType = new IntegerDerivedTypeImpl('negativeInteger', nonPositiveIntegerType, decimalType, undefined, -1);

const nonNegativeIntegerType = new IntegerDerivedTypeImpl('nonNegativeInteger', integerType, decimalType, 0, undefined);
const positiveIntegerType = new IntegerDerivedTypeImpl('positiveInteger', nonNegativeIntegerType, decimalType, 1, undefined);

const unsignedLongType = new IntegerDerivedTypeImpl('unsignedLong', nonNegativeIntegerType, decimalType, 0, 18446744073709551615);
const unsignedIntType = new IntegerDerivedTypeImpl('unsignedInt', unsignedLongType, decimalType, 0, 4294967295);
const unsignedShortType = new IntegerDerivedTypeImpl('unsignedShort', unsignedIntType, decimalType, 0, 65535);
const unsignedByteType = new IntegerDerivedTypeImpl('unsignedByte', unsignedShortType, decimalType, 0, 255);

/**
 * Built-in atomic types registry
 */
export const ATOMIC_TYPES: Record<string, AtomicType> = {
  'anyAtomicType': anyAtomicType,
  'untypedAtomic': untypedAtomic,
  'string': stringType,
  'boolean': booleanType,
  'decimal': decimalType,
  'float': floatType,
  'double': doubleType,
  'integer': integerType,
  'duration': durationType,
  'dateTime': dateTimeType,
  'date': dateType,
  'time': timeType,
  'anyURI': anyURIType,
  'QName': qnameType,
  // Gregorian types
  'gYearMonth': gYearMonthType,
  'gYear': gYearType,
  'gMonthDay': gMonthDayType,
  'gDay': gDayType,
  'gMonth': gMonthType,
  // Binary types
  'hexBinary': hexBinaryType,
  'base64Binary': base64BinaryType,
  // Integer-derived types
  'long': longType,
  'int': intType,
  'short': shortType,
  'byte': byteType,
  'nonPositiveInteger': nonPositiveIntegerType,
  'negativeInteger': negativeIntegerType,
  'nonNegativeInteger': nonNegativeIntegerType,
  'positiveInteger': positiveIntegerType,
  'unsignedLong': unsignedLongType,
  'unsignedInt': unsignedIntType,
  'unsignedShort': unsignedShortType,
  'unsignedByte': unsignedByteType,
};

/**
 * Get an atomic type by its local name
 */
export function getAtomicType(name: string): AtomicType | undefined {
  return ATOMIC_TYPES[name];
}

/**
 * Check if a value is an instance of a given atomic type
 */
export function isInstanceOf(value: any, typeName: string): boolean {
  const type = getAtomicType(typeName);
  if (!type) return false;
  return type.validate(value);
}

/**
 * Cast a value to a given atomic type
 */
export function castAs(value: any, typeName: string): any {
  const type = getAtomicType(typeName);
  if (!type) {
    throw new Error(`Unknown atomic type: ${typeName}`);
  }
  return type.cast(value);
}

/**
 * Check if a type is numeric (integer, decimal, float, double)
 */
export function isNumericType(type: AtomicType): boolean {
  return ['decimal', 'float', 'double', 'integer', 'long', 'int', 'short', 'byte'].includes(type.name);
}
