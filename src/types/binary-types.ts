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

/**
 * Utility functions for binary data encoding/decoding
 */

/**
 * Decode hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have even length');
    }

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Encode Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

/**
 * Decode base64 string to Uint8Array
 */
export function base64ToBytes(base64: string): Uint8Array {
    // Remove whitespace
    base64 = base64.replace(/\s/g, '');

    // Validate
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 !== 0) {
        throw new Error('Invalid base64 string');
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup: { [key: string]: number } = {};
    for (let i = 0; i < chars.length; i++) {
        lookup[chars[i]] = i;
    }

    const len = base64.length;
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    const byteCount = (len / 4) * 3 - padding;
    const bytes = new Uint8Array(byteCount);

    let byteIndex = 0;
    for (let i = 0; i < len; i += 4) {
        const encoded1 = lookup[base64[i]];
        const encoded2 = lookup[base64[i + 1]];
        const encoded3 = base64[i + 2] === '=' ? 0 : lookup[base64[i + 2]];
        const encoded4 = base64[i + 3] === '=' ? 0 : lookup[base64[i + 3]];

        bytes[byteIndex++] = (encoded1 << 2) | (encoded2 >> 4);
        if (base64[i + 2] !== '=') {
            bytes[byteIndex++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        }
        if (base64[i + 3] !== '=') {
            bytes[byteIndex++] = ((encoded3 & 3) << 6) | encoded4;
        }
    }

    return bytes;
}

/**
 * Encode Uint8Array to base64 string
 */
export function bytesToBase64(bytes: Uint8Array): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    const len = bytes.length;

    while (i < len) {
        const a = bytes[i++];
        const hasB = i < len;
        const b = hasB ? bytes[i++] : 0;
        const hasC = i < len;
        const c = hasC ? bytes[i++] : 0;

        const bitmap = (a << 16) | (b << 8) | c;

        result += chars[(bitmap >> 18) & 0x3f];
        result += chars[(bitmap >> 12) & 0x3f];
        result += hasB ? chars[(bitmap >> 6) & 0x3f] : '=';
        result += hasC ? chars[bitmap & 0x3f] : '=';
    }

    return result;
}

/**
 * Convert string to Uint8Array using UTF-8 encoding
 */
export function stringToBytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

/**
 * Convert Uint8Array to string using UTF-8 decoding
 */
export function bytesToString(bytes: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}
