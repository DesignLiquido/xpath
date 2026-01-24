/**
 * Simple atomic types: anyAtomicType, untypedAtomic, string, boolean
 */

import { AtomicType, AtomicTypeImpl, XS_NAMESPACE } from './base';

/**
 * xs:anyAtomicType - base type for all atomic types
 */
export class AnyAtomicTypeImpl extends AtomicTypeImpl {
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
export class UntypedAtomicImpl extends AtomicTypeImpl {
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
export class StringTypeImpl extends AtomicTypeImpl {
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
 * xs:boolean - true/false values
 */
export class BooleanTypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('boolean', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'boolean';
  }

  cast(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === 'true' || trimmed === '1') return true;
      if (trimmed === 'false' || trimmed === '0') return false;
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
