/**
 * URI and QName types: anyURI, QName
 */

import { AtomicType, AtomicTypeImpl, XS_NAMESPACE } from './base';

/**
 * xs:anyURI - Uniform Resource Identifier
 */
export class AnyURITypeImpl extends AtomicTypeImpl {
  constructor(baseType: AtomicType) {
    super('anyURI', XS_NAMESPACE, baseType, undefined);
  }

  validate(value: any): boolean {
    return typeof value === 'string';
  }

  cast(value: any): string {
    if (typeof value === 'string') return value;
    throw new Error(`Cannot cast ${typeof value} to xs:anyURI`);
  }
}

/**
 * xs:QName - qualified name
 */
export class QNameTypeImpl extends AtomicTypeImpl {
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
