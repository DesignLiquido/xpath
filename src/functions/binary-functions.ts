/**
 * Binary Data Functions for XPath 3.1
 *
 * Provides functions for working with binary data (hexBinary and base64Binary)
 */

import { XPathContext } from '../context';
import {
    hexToBytes,
    bytesToHex,
    base64ToBytes,
    bytesToBase64,
    stringToBytes,
    bytesToString,
} from '../types/binary-types';

/**
 * Convert hex string to base64
 *
 * @param context - XPath evaluation context
 * @param hex - Hex-encoded string
 * @returns Base64-encoded string
 */
export function hexToBase64(context: XPathContext, hex: string): string {
    if (typeof hex !== 'string') {
        throw new Error('hex-to-base64: argument must be a string');
    }

    const bytes = hexToBytes(hex);
    return bytesToBase64(bytes);
}

/**
 * Convert base64 string to hex
 *
 * @param context - XPath evaluation context
 * @param base64 - Base64-encoded string
 * @returns Hex-encoded string
 */
export function base64ToHex(context: XPathContext, base64: string): string {
    if (typeof base64 !== 'string') {
        throw new Error('base64-to-hex: argument must be a string');
    }

    const bytes = base64ToBytes(base64);
    return bytesToHex(bytes);
}

/**
 * Encode string to base64
 *
 * @param context - XPath evaluation context
 * @param str - String to encode
 * @returns Base64-encoded string
 */
export function encodeBase64(context: XPathContext, str: string): string {
    if (typeof str !== 'string') {
        throw new Error('encode-base64: argument must be a string');
    }

    const bytes = stringToBytes(str);
    return bytesToBase64(bytes);
}

/**
 * Decode base64 to string
 *
 * @param context - XPath evaluation context
 * @param base64 - Base64-encoded string
 * @returns Decoded string
 */
export function decodeBase64(context: XPathContext, base64: string): string {
    if (typeof base64 !== 'string') {
        throw new Error('decode-base64: argument must be a string');
    }

    const bytes = base64ToBytes(base64);
    return bytesToString(bytes);
}

/**
 * Encode string to hex
 *
 * @param context - XPath evaluation context
 * @param str - String to encode
 * @returns Hex-encoded string
 */
export function encodeHex(context: XPathContext, str: string): string {
    if (typeof str !== 'string') {
        throw new Error('encode-hex: argument must be a string');
    }

    const bytes = stringToBytes(str);
    return bytesToHex(bytes);
}

/**
 * Decode hex to string
 *
 * @param context - XPath evaluation context
 * @param hex - Hex-encoded string
 * @returns Decoded string
 */
export function decodeHex(context: XPathContext, hex: string): string {
    if (typeof hex !== 'string') {
        throw new Error('decode-hex: argument must be a string');
    }

    const bytes = hexToBytes(hex);
    return bytesToString(bytes);
}

/**
 * Get length of binary data in bytes
 *
 * @param context - XPath evaluation context
 * @param binary - Hex or base64 encoded string
 * @param format - 'hex' or 'base64'
 * @returns Number of bytes
 */
export function binaryLength(context: XPathContext, binary: string, format: string = 'base64'): number {
    if (typeof binary !== 'string') {
        throw new Error('binary-length: first argument must be a string');
    }

    try {
        if (format === 'hex') {
            return hexToBytes(binary).length;
        } else if (format === 'base64') {
            return base64ToBytes(binary).length;
        } else {
            throw new Error(`binary-length: unsupported format '${format}'`);
        }
    } catch (error) {
        throw new Error(`binary-length: invalid ${format} string`);
    }
}

/**
 * Concatenate binary data
 *
 * @param context - XPath evaluation context
 * @param binaries - Array of hex or base64 encoded strings
 * @param format - 'hex' or 'base64'
 * @returns Concatenated binary data in specified format
 */
export function binaryConcat(context: XPathContext, binaries: string[], format: string = 'base64'): string {
    if (!Array.isArray(binaries)) {
        binaries = [binaries];
    }

    const allBytes: Uint8Array[] = [];
    let totalLength = 0;

    for (const binary of binaries) {
        if (typeof binary !== 'string') {
            throw new Error('binary-concat: all arguments must be strings');
        }

        try {
            const bytes = format === 'hex' ? hexToBytes(binary) : base64ToBytes(binary);
            allBytes.push(bytes);
            totalLength += bytes.length;
        } catch (error) {
            throw new Error(`binary-concat: invalid ${format} string`);
        }
    }

    // Concatenate all byte arrays
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const bytes of allBytes) {
        result.set(bytes, offset);
        offset += bytes.length;
    }

    return format === 'hex' ? bytesToHex(result) : bytesToBase64(result);
}

/**
 * Extract part of binary data
 *
 * @param context - XPath evaluation context
 * @param binary - Hex or base64 encoded string
 * @param start - Start position (1-based)
 * @param length - Number of bytes to extract (optional)
 * @param format - 'hex' or 'base64'
 * @returns Extracted binary data in specified format
 */
export function binarySubstring(
    context: XPathContext,
    binary: string,
    start: number,
    length?: number,
    format: string = 'base64'
): string {
    if (typeof binary !== 'string') {
        throw new Error('binary-substring: first argument must be a string');
    }

    try {
        const bytes = format === 'hex' ? hexToBytes(binary) : base64ToBytes(binary);

        // Convert to 0-based index
        const startIndex = Math.max(0, start - 1);

        // Extract substring
        const endIndex = length !== undefined ? startIndex + length : bytes.length;
        const extracted = bytes.slice(startIndex, endIndex);

        return format === 'hex' ? bytesToHex(extracted) : bytesToBase64(extracted);
    } catch (error) {
        throw new Error(`binary-substring: invalid ${format} string`);
    }
}

/**
 * XPath function registry for binary data functions
 */
export const binaryFunctions = {
    'hex-to-base64': {
        name: 'hex-to-base64',
        minArgs: 1,
        maxArgs: 1,
        implementation: hexToBase64,
        description: 'Converts hexBinary to base64Binary',
    },

    'base64-to-hex': {
        name: 'base64-to-hex',
        minArgs: 1,
        maxArgs: 1,
        implementation: base64ToHex,
        description: 'Converts base64Binary to hexBinary',
    },

    'encode-base64': {
        name: 'encode-base64',
        minArgs: 1,
        maxArgs: 1,
        implementation: encodeBase64,
        description: 'Encodes string to base64',
    },

    'decode-base64': {
        name: 'decode-base64',
        minArgs: 1,
        maxArgs: 1,
        implementation: decodeBase64,
        description: 'Decodes base64 to string',
    },

    'encode-hex': {
        name: 'encode-hex',
        minArgs: 1,
        maxArgs: 1,
        implementation: encodeHex,
        description: 'Encodes string to hex',
    },

    'decode-hex': {
        name: 'decode-hex',
        minArgs: 1,
        maxArgs: 1,
        implementation: decodeHex,
        description: 'Decodes hex to string',
    },

    'binary-length': {
        name: 'binary-length',
        minArgs: 1,
        maxArgs: 2,
        implementation: binaryLength,
        description: 'Returns length of binary data in bytes',
    },

    'binary-concat': {
        name: 'binary-concat',
        minArgs: 1,
        maxArgs: 2,
        implementation: binaryConcat,
        description: 'Concatenates binary data',
    },

    'binary-substring': {
        name: 'binary-substring',
        minArgs: 2,
        maxArgs: 4,
        implementation: binarySubstring,
        description: 'Extracts part of binary data',
    },
};
