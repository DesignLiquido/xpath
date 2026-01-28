/**
 * YAML Functions for XPath 3.1
 *
 * Provides YAML parsing and serialization functions.
 * Note: This is a basic implementation without external dependencies.
 * For production use, consider integrating a full YAML library.
 */

import { XPathContext } from '../context';

/**
 * YAML serialization parameters
 */
export interface YAMLSerializationParameters {
    /**
     * Indentation spaces (default: 2)
     */
    indent?: number;

    /**
     * Whether to use flow style for arrays (default: false)
     */
    flowArrays?: boolean;

    /**
     * Whether to use flow style for maps (default: false)
     */
    flowMaps?: boolean;

    /**
     * Maximum line width before wrapping (default: 80, 0 = no limit)
     */
    lineWidth?: number;

    /**
     * Whether to sort map keys (default: false)
     */
    sortKeys?: boolean;
}

/**
 * Parse YAML string to XPath Data Model
 *
 * Basic YAML parser supporting:
 * - Scalars (strings, numbers, booleans, null)
 * - Maps (converted to XPath Map)
 * - Arrays (converted to XPath arrays)
 * - Simple structures only (no anchors, aliases, tags)
 *
 * @param context - XPath evaluation context
 * @param yaml - YAML string to parse
 * @param params - Parsing parameters
 * @returns Parsed YAML as XPath value (Map, array, or atomic)
 */
export function parseYAML(
    context: XPathContext,
    yaml: string,
    params?: YAMLSerializationParameters
): any {
    if (!yaml || yaml.trim() === '') {
        return null;
    }

    // Remove BOM if present
    yaml = yaml.replace(/^\uFEFF/, '');

    // Split into lines
    const lines = yaml.split(/\r?\n/);

    // Parse the YAML structure
    const result = parseYAMLLines(lines, 0, 0);

    return result.value;
}

/**
 * Parse YAML lines recursively
 */
function parseYAMLLines(
    lines: string[],
    startIndex: number,
    baseIndent: number
): { value: any; nextIndex: number } {
    let currentIndex = startIndex;

    // Skip empty lines and comments
    while (currentIndex < lines.length) {
        const line = lines[currentIndex];
        const trimmed = line.trim();

        if (trimmed === '' || trimmed.startsWith('#')) {
            currentIndex++;
            continue;
        }

        break;
    }

    if (currentIndex >= lines.length) {
        return { value: null, nextIndex: currentIndex };
    }

    const firstLine = lines[currentIndex];
    const indent = getIndent(firstLine);
    const trimmed = firstLine.trim();

    // Check if it's a list item
    if (trimmed.startsWith('- ')) {
        return parseYAMLArray(lines, currentIndex, baseIndent);
    }

    // Check if it's a map key
    if (trimmed.includes(':')) {
        return parseYAMLMap(lines, currentIndex, baseIndent);
    }

    // It's a scalar value
    const value = parseYAMLScalar(trimmed);
    return { value, nextIndex: currentIndex + 1 };
}

/**
 * Parse YAML array
 */
function parseYAMLArray(
    lines: string[],
    startIndex: number,
    baseIndent: number
): { value: any[]; nextIndex: number } {
    const result: any[] = [];
    let currentIndex = startIndex;
    const arrayIndent = getIndent(lines[startIndex]);

    while (currentIndex < lines.length) {
        const line = lines[currentIndex];
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (trimmed === '' || trimmed.startsWith('#')) {
            currentIndex++;
            continue;
        }

        const indent = getIndent(line);

        // Check if we're still in the array
        if (indent < arrayIndent) {
            break;
        }

        if (!trimmed.startsWith('- ')) {
            break;
        }

        // Parse array item
        const itemValue = trimmed.substring(2).trim();

        if (itemValue === '') {
            // Multi-line item
            const nested = parseYAMLLines(lines, currentIndex + 1, indent + 2);
            result.push(nested.value);
            currentIndex = nested.nextIndex;
        } else if (itemValue.includes(':')) {
            // Inline object
            const objLine = itemValue;
            const obj = parseYAMLInlineMap(objLine);
            result.push(obj);
            currentIndex++;
        } else {
            // Scalar value
            result.push(parseYAMLScalar(itemValue));
            currentIndex++;
        }
    }

    return { value: result, nextIndex: currentIndex };
}

/**
 * Parse YAML map (object)
 */
function parseYAMLMap(
    lines: string[],
    startIndex: number,
    baseIndent: number
): { value: Map<string, any>; nextIndex: number } {
    const result = new Map<string, any>();
    let currentIndex = startIndex;
    const mapIndent = getIndent(lines[startIndex]);

    while (currentIndex < lines.length) {
        const line = lines[currentIndex];
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (trimmed === '' || trimmed.startsWith('#')) {
            currentIndex++;
            continue;
        }

        const indent = getIndent(line);

        // Check if we're still in the map
        if (indent < mapIndent) {
            break;
        }

        if (!trimmed.includes(':')) {
            break;
        }

        // Parse key-value pair
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        const valueStr = trimmed.substring(colonIndex + 1).trim();

        if (valueStr === '') {
            // Multi-line value
            const nested = parseYAMLLines(lines, currentIndex + 1, indent + 2);
            result.set(key, nested.value);
            currentIndex = nested.nextIndex;
        } else {
            // Inline value
            result.set(key, parseYAMLScalar(valueStr));
            currentIndex++;
        }
    }

    return { value: result, nextIndex: currentIndex };
}

/**
 * Parse inline YAML map (on single line)
 */
function parseYAMLInlineMap(line: string): Map<string, any> {
    const result = new Map<string, any>();
    const parts = line.split(',').map(p => p.trim());

    for (const part of parts) {
        const colonIndex = part.indexOf(':');
        if (colonIndex > 0) {
            const key = part.substring(0, colonIndex).trim();
            const value = part.substring(colonIndex + 1).trim();
            result.set(key, parseYAMLScalar(value));
        }
    }

    return result;
}

/**
 * Parse YAML scalar value
 */
function parseYAMLScalar(value: string): any {
    // Handle quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.substring(1, value.length - 1);
    }

    // Handle special values
    if (value === 'null' || value === '~') {
        return null;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }

    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num) && value !== '') {
        return num;
    }

    // Return as string
    return value;
}

/**
 * Get indentation level of a line
 */
function getIndent(line: string): number {
    let indent = 0;
    for (const char of line) {
        if (char === ' ') {
            indent++;
        } else if (char === '\t') {
            indent += 4; // Treat tab as 4 spaces
        } else {
            break;
        }
    }
    return indent;
}

/**
 * Serialize XPath value to YAML
 *
 * @param context - XPath evaluation context
 * @param value - Value to serialize
 * @param params - Serialization parameters
 * @returns YAML string
 */
export function serializeYAML(
    context: XPathContext,
    value: any,
    params?: YAMLSerializationParameters
): string {
    const options: Required<YAMLSerializationParameters> = {
        indent: params?.indent ?? 2,
        flowArrays: params?.flowArrays ?? false,
        flowMaps: params?.flowMaps ?? false,
        lineWidth: params?.lineWidth ?? 80,
        sortKeys: params?.sortKeys ?? false,
    };

    return serializeYAMLValue(value, 0, options);
}

/**
 * Serialize a single value to YAML
 */
function serializeYAMLValue(
    value: any,
    depth: number,
    options: Required<YAMLSerializationParameters>
): string {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return 'null';
    }

    // Handle Map
    if (value instanceof Map) {
        return serializeYAMLMap(value, depth, options);
    }

    // Handle Array
    if (Array.isArray(value)) {
        return serializeYAMLArray(value, depth, options);
    }

    // Handle Object (convert to Map first)
    if (typeof value === 'object' && value.nodeType === undefined) {
        const map = new Map<string, any>();
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                map.set(key, value[key]);
            }
        }
        return serializeYAMLMap(map, depth, options);
    }

    // Handle scalar values
    return serializeYAMLScalar(value);
}

/**
 * Serialize YAML map
 */
function serializeYAMLMap(
    map: Map<string, any>,
    depth: number,
    options: Required<YAMLSerializationParameters>
): string {
    if (map.size === 0) {
        return '{}';
    }

    const indent = ' '.repeat(depth * options.indent);
    const lines: string[] = [];

    let keys = Array.from(map.keys());
    if (options.sortKeys) {
        keys = keys.sort();
    }

    for (const key of keys) {
        const value = map.get(key);
        const keyStr = needsQuoting(String(key)) ? `"${escapeYAML(String(key))}"` : String(key);

        if (value instanceof Map || (Array.isArray(value) && !options.flowArrays) ||
            (typeof value === 'object' && value !== null && value.nodeType === undefined)) {
            // Multi-line value
            lines.push(`${indent}${keyStr}:`);
            const valueStr = serializeYAMLValue(value, depth + 1, options);
            lines.push(valueStr);
        } else {
            // Inline value
            const valueStr = serializeYAMLValue(value, depth + 1, options);
            lines.push(`${indent}${keyStr}: ${valueStr}`);
        }
    }

    return lines.join('\n');
}

/**
 * Serialize YAML array
 */
function serializeYAMLArray(
    array: any[],
    depth: number,
    options: Required<YAMLSerializationParameters>
): string {
    if (array.length === 0) {
        return '[]';
    }

    // Use flow style if requested
    if (options.flowArrays) {
        const items = array.map(item => serializeYAMLValue(item, 0, options));
        return `[${items.join(', ')}]`;
    }

    const indent = ' '.repeat(depth * options.indent);
    const lines: string[] = [];

    for (const item of array) {
        if (item instanceof Map || Array.isArray(item) ||
            (typeof item === 'object' && item !== null && item.nodeType === undefined)) {
            // Complex item
            lines.push(`${indent}-`);
            const itemStr = serializeYAMLValue(item, depth + 1, options);
            lines.push(itemStr);
        } else {
            // Simple item
            const itemStr = serializeYAMLValue(item, depth, options);
            lines.push(`${indent}- ${itemStr}`);
        }
    }

    return lines.join('\n');
}

/**
 * Serialize YAML scalar
 */
function serializeYAMLScalar(value: any): string {
    // Handle boolean
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    // Handle number
    if (typeof value === 'number') {
        return String(value);
    }

    // Handle string
    const str = String(value);

    // Check if quoting is needed
    if (needsQuoting(str)) {
        return `"${escapeYAML(str)}"`;
    }

    return str;
}

/**
 * Check if string needs quoting in YAML
 */
function needsQuoting(str: string): boolean {
    // Empty string needs quotes
    if (str === '') {
        return true;
    }

    // Strings that look like special values need quotes
    if (['true', 'false', 'null', 'yes', 'no', 'on', 'off'].includes(str.toLowerCase())) {
        return true;
    }

    // Strings starting with special characters need quotes
    if (/^[#@`|>!%&*[\]{}]/.test(str)) {
        return true;
    }

    // Strings containing : or # need quotes
    if (str.includes(':') || str.includes('#')) {
        return true;
    }

    // Strings with leading/trailing whitespace need quotes
    if (str !== str.trim()) {
        return true;
    }

    return false;
}

/**
 * Escape special characters in YAML string
 */
function escapeYAML(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

/**
 * XPath function registry for YAML functions
 */
export const yamlFunctions = {
    'parse-yaml': {
        name: 'parse-yaml',
        minArgs: 1,
        maxArgs: 2,
        implementation: parseYAML,
        description: 'Parses YAML string to XPath Data Model',
    },

    'serialize-yaml': {
        name: 'serialize-yaml',
        minArgs: 1,
        maxArgs: 2,
        implementation: serializeYAML,
        description: 'Serializes XPath value to YAML format',
    },
};
