/**
 * Binary types: hexBinary, base64Binary
 */

import { AtomicType, AtomicTypeImpl, XS_NAMESPACE } from './base';

/**
 * xs:hexBinary - hex-encoded binary data
 */
export class HexBinaryTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('hexBinary', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        if (typeof value === 'string') {
            return /^[0-9A-Fa-f]*$/.test(value) && value.length % 2 === 0;
        }
        return value instanceof Uint8Array;
    }

    cast(value: any): string {
        if (typeof value === 'string') {
            if (!this.validate(value)) {
                throw new Error(`Invalid hexBinary format: "${value}"`);
            }
            return value.toUpperCase();
        }
        if (value instanceof Uint8Array) {
            return Array.from(value)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase();
        }
        throw new Error(`Cannot cast ${typeof value} to xs:hexBinary`);
    }
}

/**
 * xs:base64Binary - base64-encoded binary data
 */
export class Base64BinaryTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('base64Binary', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        if (typeof value === 'string') {
            return /^[A-Za-z0-9+/]*={0,2}$/.test(value) && value.length % 4 === 0;
        }
        return value instanceof Uint8Array;
    }

    cast(value: any): string {
        if (typeof value === 'string') {
            if (!this.validate(value)) {
                throw new Error(`Invalid base64Binary format: "${value}"`);
            }
            return value;
        }
        if (value instanceof Uint8Array) {
            // Simple base64 encoding
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            let result = '';
            let i = 0;
            const len = value.length;

            while (i < len) {
                const a = value[i++];
                const hasB = i < len;
                const b = hasB ? value[i++] : 0;
                const hasC = i < len;
                const c = hasC ? value[i++] : 0;

                const bitmap = (a << 16) | (b << 8) | c;

                result += chars[(bitmap >> 18) & 0x3f];
                result += chars[(bitmap >> 12) & 0x3f];
                result += hasB ? chars[(bitmap >> 6) & 0x3f] : '=';
                result += hasC ? chars[bitmap & 0x3f] : '=';
            }

            return result;
        }
        throw new Error(`Cannot cast ${typeof value} to xs:base64Binary`);
    }
}
