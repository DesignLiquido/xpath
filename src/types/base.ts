/**
 * Base types and interfaces for XPath 2.0 Atomic Types
 * Based on XML Schema Part 2: Datatypes and XPath 2.0 Section 2.5.1
 */

import { XS_NAMESPACE } from '../constants';

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

// Re-export constant from unified constants.ts
export { XS_NAMESPACE };

/**
 * Creates a qualified type name for an XS type
 */
export function xsType(localName: string): string {
  return `{${XS_NAMESPACE}}${localName}`;
}

/**
 * Abstract base implementation for atomic types
 */
export abstract class AtomicTypeImpl implements AtomicType {
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
