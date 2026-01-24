/**
 * Numeric types: decimal, float, double, integer
 */

import { AtomicType, AtomicTypeImpl, XS_NAMESPACE } from './base';

/**
 * xs:decimal - arbitrary precision decimal numbers
 */
export class DecimalTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('decimal', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    if (typeof value === 'number') {
      return isFinite(value);
    }
    return false;
  }

  cast(value: any): number {
    if (typeof value === 'number' && isFinite(value)) return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (!isFinite(num)) throw new Error(`Cannot cast "${value}" to xs:decimal`);
      return num;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    throw new Error(`Cannot cast ${typeof value} to xs:decimal`);
  }
}

/**
 * xs:float - 32-bit floating point (IEEE 754)
 */
export class FloatTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('float', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'number';
  }

  cast(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value === 'INF') return Infinity;
      if (value === '-INF') return -Infinity;
      if (value === 'NaN') return NaN;
      const num = parseFloat(value);
      if (isNaN(num)) throw new Error(`Cannot cast "${value}" to xs:float`);
      return num;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    throw new Error(`Cannot cast ${typeof value} to xs:float`);
  }
}

/**
 * xs:double - 64-bit floating point (IEEE 754)
 */
export class DoubleTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('double', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'number';
  }

  cast(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value === 'INF') return Infinity;
      if (value === '-INF') return -Infinity;
      if (value === 'NaN') return NaN;
      const num = parseFloat(value);
      if (isNaN(num)) throw new Error(`Cannot cast "${value}" to xs:double`);
      return num;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    throw new Error(`Cannot cast ${typeof value} to xs:double`);
  }
}

/**
 * xs:integer - whole numbers (unbounded)
 */
export class IntegerTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType, primitive: AtomicType) {
    super('integer', XS_NAMESPACE, baseType, primitive);
  }

  validate(value: any): boolean {
    return typeof value === 'number' && Number.isInteger(value) && isFinite(value);
  }

  cast(value: any): number {
    const num = this.baseType!.cast(value);
    const intVal = Math.trunc(num);
    if (!isFinite(intVal)) throw new Error(`Cannot cast ${value} to xs:integer`);
    return intVal;
  }
}
