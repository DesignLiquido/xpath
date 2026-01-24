/**
 * XPath 2.0 Atomic Types Implementation
 * Based on XML Schema Part 2: Datatypes and XPath 2.0 Section 2.5.1
 * 
 * This module defines the built-in atomic types for XPath 2.0.
 */

/**
 * Base interface for all atomic types
 */
export interface AtomicType {
  readonly name: string;
  readonly namespace: string;
  readonly baseType?: AtomicType;
  readonly primitive?: AtomicType;
  validate(value: any): boolean;
  cast(value: any): any;
}

/**
 * XML Schema namespace
 */
export const XS_NAMESPACE = 'http://www.w3.org/2001/XMLSchema';

/**
 * Creates a qualified type name for an XS type
 */
export function xsType(localName: string): string {
  return `{${XS_NAMESPACE}}${localName}`;
}

/**
 * Abstract base implementation for atomic types
 */
abstract class AtomicTypeImpl implements AtomicType {
  constructor(
    public readonly name: string,
    public readonly namespace: string = XS_NAMESPACE,
    public readonly baseType?: AtomicType,
    public readonly primitive?: AtomicType
  ) {}

  abstract validate(value: any): boolean;
  abstract cast(value: any): any;

  get qualifiedName(): string {
    return `{${this.namespace}}${this.name}`;
  }
}

/**
 * xs:anyAtomicType - base type for all atomic types
 */
class AnyAtomicTypeImpl extends AtomicTypeImpl {
  constructor() {
    super('anyAtomicType', XS_NAMESPACE);
  }

  validate(value: any): boolean {
    // anyAtomicType accepts any atomic value
    return value !== null && value !== undefined && typeof value !== 'object';
  }

  cast(value: any): any {
    return value;
  }
}

/**
 * xs:untypedAtomic - for untyped atomic data
 */
class UntypedAtomicImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('untypedAtomic', XS_NAMESPACE, baseType, baseType);
  }

  validate(value: any): boolean {
    return typeof value === 'string';
  }

  cast(value: any): string {
    return String(value);
  }
}

/**
 * xs:string - character strings
 */
class StringTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('string', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'string';
  }

  cast(value: any): string {
    if (value === null || value === undefined) {
      throw new Error('Cannot cast null or undefined to xs:string');
    }
    return String(value);
  }
}

/**
 * xs:boolean - true or false
 */
class BooleanTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('boolean', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'boolean';
  }

  cast(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
      throw new Error(`Cannot cast "${value}" to xs:boolean`);
    }
    if (typeof value === 'number') {
      if (value === 0) return false;
      if (value === 1) return true;
      throw new Error(`Cannot cast ${value} to xs:boolean`);
    }
    throw new Error(`Cannot cast ${typeof value} to xs:boolean`);
  }
}

/**
 * xs:decimal - arbitrary precision decimal numbers
 */
class DecimalTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('decimal', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'number' && isFinite(value);
  }

  cast(value: any): number {
    if (typeof value === 'number') {
      if (!isFinite(value)) {
        throw new Error('Cannot cast Infinity or NaN to xs:decimal');
      }
      return value;
    }
    if (typeof value === 'string') {
      const num = Number(value);
      if (isNaN(num) || !isFinite(num)) {
        throw new Error(`Cannot cast "${value}" to xs:decimal`);
      }
      return num;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:decimal`);
  }
}

/**
 * xs:float - 32-bit floating point
 */
class FloatTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('float', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'number';
  }

  cast(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const normalized = value.trim();
      if (normalized === 'INF') return Infinity;
      if (normalized === '-INF') return -Infinity;
      if (normalized === 'NaN') return NaN;
      const num = Number(normalized);
      if (isNaN(num)) {
        throw new Error(`Cannot cast "${value}" to xs:float`);
      }
      return num;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:float`);
  }
}

/**
 * xs:double - 64-bit floating point
 */
class DoubleTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('double', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'number';
  }

  cast(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const normalized = value.trim();
      if (normalized === 'INF') return Infinity;
      if (normalized === '-INF') return -Infinity;
      if (normalized === 'NaN') return NaN;
      const num = Number(normalized);
      if (isNaN(num)) {
        throw new Error(`Cannot cast "${value}" to xs:double`);
      }
      return num;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:double`);
  }
}

/**
 * xs:integer - arbitrary size integer
 */
class IntegerTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType, primitive: AtomicType) {
    super('integer', XS_NAMESPACE, baseType, primitive);
  }

  validate(value: any): boolean {
    return typeof value === 'number' && Number.isInteger(value) && isFinite(value);
  }

  cast(value: any): number {
    if (typeof value === 'number') {
      if (!isFinite(value)) {
        throw new Error('Cannot cast Infinity or NaN to xs:integer');
      }
      return Math.trunc(value);
    }
    if (typeof value === 'string') {
      const num = Number(value);
      if (isNaN(num) || !isFinite(num)) {
        throw new Error(`Cannot cast "${value}" to xs:integer`);
      }
      return Math.trunc(num);
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:integer`);
  }
}

/**
 * xs:duration - time duration
 */
class DurationTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('duration', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    // Duration is represented as an object with specific properties
    return typeof value === 'object' && value !== null && 
           'years' in value && 'months' in value && 
           'days' in value && 'hours' in value && 
           'minutes' in value && 'seconds' in value;
  }

  cast(value: any): any {
    if (typeof value === 'string') {
      return this.parseDuration(value);
    }
    if (this.validate(value)) {
      return value;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:duration`);
  }

  private parseDuration(str: string): any {
    // ISO 8601 duration format: P[nY][nM][nD][T[nH][nM][nS]]
    const regex = /^(-)?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
    const match = str.match(regex);
    
    if (!match) {
      throw new Error(`Invalid duration format: "${str}"`);
    }

    // Check if at least one component is present (not just 'P')
    const hasComponents = match.slice(2).some(component => component !== undefined);
    if (!hasComponents) {
      throw new Error(`Invalid duration format: "${str}"`);
    }

    const [, sign, years, months, days, hours, minutes, seconds] = match;
    const negative = sign === '-' ? -1 : 1;

    return {
      negative: sign === '-',
      years: negative * (parseInt(years || '0', 10)),
      months: negative * (parseInt(months || '0', 10)),
      days: negative * (parseInt(days || '0', 10)),
      hours: negative * (parseInt(hours || '0', 10)),
      minutes: negative * (parseInt(minutes || '0', 10)),
      seconds: negative * (parseFloat(seconds || '0'))
    };
  }
}

/**
 * xs:dateTime - date and time
 */
class DateTimeTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('dateTime', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return value instanceof Date || 
           (typeof value === 'object' && value !== null && 'date' in value);
  }

  cast(value: any): Date {
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Cannot cast "${value}" to xs:dateTime`);
      }
      return date;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:dateTime`);
  }
}

/**
 * xs:date - calendar date
 */
class DateTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType, primitive: AtomicType) {
    super('date', XS_NAMESPACE, baseType, primitive);
  }

  validate(value: any): boolean {
    return value instanceof Date || 
           (typeof value === 'object' && value !== null && 'year' in value && 'month' in value && 'day' in value);
  }

  cast(value: any): Date {
    if (value instanceof Date) {
      // Reset time part to midnight
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Cannot cast "${value}" to xs:date`);
      }
      date.setHours(0, 0, 0, 0);
      return date;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:date`);
  }
}

/**
 * xs:time - time of day
 */
class TimeTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType, primitive: AtomicType) {
    super('time', XS_NAMESPACE, baseType, primitive);
  }

  validate(value: any): boolean {
    return typeof value === 'object' && value !== null && 
           'hours' in value && 'minutes' in value && 'seconds' in value;
  }

  cast(value: any): any {
    if (typeof value === 'string') {
      return this.parseTime(value);
    }
    if (this.validate(value)) {
      return value;
    }
    throw new Error(`Cannot cast ${typeof value} to xs:time`);
  }

  private parseTime(str: string): any {
    // HH:MM:SS format with optional timezone
    const regex = /^(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)(?:Z|([+-])(\d{2}):(\d{2}))?$/;
    const match = str.match(regex);
    
    if (!match) {
      throw new Error(`Invalid time format: "${str}"`);
    }

    const [, hours, minutes, seconds, tzSign, tzHours, tzMinutes] = match;
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const s = parseFloat(seconds);
    
    // Validate ranges
    if (h < 0 || h > 23) {
      throw new Error(`Invalid hours value: ${h}`);
    }
    if (m < 0 || m > 59) {
      throw new Error(`Invalid minutes value: ${m}`);
    }
    if (s < 0 || s >= 60) {
      throw new Error(`Invalid seconds value: ${s}`);
    }
    
    return {
      hours: h,
      minutes: m,
      seconds: s,
      timezone: tzSign ? {
        sign: tzSign,
        hours: parseInt(tzHours, 10),
        minutes: parseInt(tzMinutes, 10)
      } : undefined
    };
  }
}

/**
 * xs:anyURI - URI reference
 */
class AnyURITypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('anyURI', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'string';
  }

  cast(value: any): string {
    if (typeof value === 'string') return value;
    return String(value);
  }
}

/**
 * xs:QName - qualified name
 */
class QNameTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('QName', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'object' && value !== null && 
           'localName' in value && 'namespaceURI' in value;
  }

  cast(value: any): any {
    if (this.validate(value)) return value;
    if (typeof value === 'string') {
      // Simple parsing: prefix:localName
      const parts = value.split(':');
      if (parts.length === 1) {
        return { localName: parts[0], namespaceURI: '', prefix: undefined };
      }
      if (parts.length === 2) {
        return { localName: parts[1], namespaceURI: '', prefix: parts[0] };
      }
    }
    throw new Error(`Cannot cast ${typeof value} to xs:QName`);
  }
}

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

// Integer is derived from decimal
const integerType = new IntegerTypeImpl(decimalType, decimalType);

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
 * Numeric types for type promotion
 */
export const NUMERIC_TYPES = new Set(['integer', 'decimal', 'float', 'double']);

/**
 * Check if a type is numeric
 */
export function isNumericType(typeName: string): boolean {
  return NUMERIC_TYPES.has(typeName);
}
