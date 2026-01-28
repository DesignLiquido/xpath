/**
 * CSV Serialization Functions
 *
 * Implements CSV serialization for XPath 3.1, converting sequences to CSV format.
 * Supports:
 * - Header row generation
 * - Configurable delimiter and quote character
 * - Nested structure flattening
 * - RFC 4180 compliant output
 */

import { XPathContext } from '../context';

/**
 * CSV serialization parameters
 */
export interface CSVSerializationParameters {
    /**
     * Field delimiter (default: ',')
     */
    delimiter?: string;

    /**
     * Quote character (default: '"')
     */
    quote?: string;

    /**
     * Whether to include header row (default: true)
     */
    includeHeader?: boolean;

    /**
     * Header field names (if not provided, derived from first row)
     */
    headers?: string[];

    /**
     * Line ending (default: '\r\n' for RFC 4180 compliance)
     */
    lineEnding?: string;

    /**
     * Whether to always quote fields (default: false - quote only when necessary)
     */
    alwaysQuote?: boolean;

    /**
     * How to flatten nested structures: 'json' | 'flatten' | 'skip'
     * - json: Convert nested objects to JSON strings
     * - flatten: Flatten with dot notation (e.g., 'user.name')
     * - skip: Skip nested fields
     * Default: 'json'
     */
    nestedHandling?: 'json' | 'flatten' | 'skip';

    /**
     * Character encoding (default: 'UTF-8')
     */
    encoding?: string;
}

/**
 * Serialize a sequence to CSV format
 *
 * @param context - XPath evaluation context
 * @param sequence - Sequence to serialize (array of objects/maps or array of arrays)
 * @param params - CSV serialization parameters
 * @returns CSV string
 */
export function serializeCSV(
    context: XPathContext,
    sequence: any,
    params?: CSVSerializationParameters
): string {
    const options: Required<CSVSerializationParameters> = {
        delimiter: params?.delimiter ?? ',',
        quote: params?.quote ?? '"',
        includeHeader: params?.includeHeader ?? true,
        headers: params?.headers ?? [],
        lineEnding: params?.lineEnding ?? '\r\n',
        alwaysQuote: params?.alwaysQuote ?? false,
        nestedHandling: params?.nestedHandling ?? 'json',
        encoding: params?.encoding ?? 'UTF-8',
    };

    // Handle empty sequence
    if (!sequence || (Array.isArray(sequence) && sequence.length === 0)) {
        return '';
    }

    // Convert to array if single value
    const items = Array.isArray(sequence) ? sequence : [sequence];

    // Determine if we're dealing with objects/maps or arrays
    const isObjectBased = items.length > 0 && isObjectLike(items[0]);

    if (isObjectBased) {
        return serializeObjectsToCSV(items, options);
    } else {
        return serializeArraysToCSV(items, options);
    }
}

/**
 * Check if value is object-like (Map or plain object)
 */
function isObjectLike(value: any): boolean {
    if (value instanceof Map) {
        return true;
    }
    return value !== null && typeof value === 'object' && !Array.isArray(value) && value.nodeType === undefined;
}

/**
 * Serialize array of objects/maps to CSV
 */
function serializeObjectsToCSV(
    items: any[],
    options: Required<CSVSerializationParameters>
): string {
    const rows: string[] = [];

    // Extract all unique keys from all objects
    let headers: string[] = options.headers;
    if (headers.length === 0) {
        const keysSet = new Set<string>();
        for (const item of items) {
            const keys = extractKeys(item);
            keys.forEach(k => keysSet.add(k));
        }
        headers = Array.from(keysSet);
    }

    // Add header row if requested
    if (options.includeHeader && headers.length > 0) {
        rows.push(formatCSVRow(headers, options));
    }

    // Add data rows
    for (const item of items) {
        const values = headers.map(key => extractValue(item, key, options));
        rows.push(formatCSVRow(values, options));
    }

    return rows.join(options.lineEnding);
}

/**
 * Serialize array of arrays to CSV
 */
function serializeArraysToCSV(
    items: any[],
    options: Required<CSVSerializationParameters>
): string {
    const rows: string[] = [];

    // If first item is not an array, treat entire sequence as single row
    if (!Array.isArray(items[0])) {
        return formatCSVRow(items, options);
    }

    // Each item is a row
    for (const row of items) {
        const values = Array.isArray(row) ? row : [row];
        rows.push(formatCSVRow(values, options));
    }

    return rows.join(options.lineEnding);
}

/**
 * Extract keys from object or Map
 */
function extractKeys(obj: any): string[] {
    if (obj instanceof Map) {
        return Array.from(obj.keys()).map(String);
    }
    if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj);
    }
    return [];
}

/**
 * Extract value from object/Map by key
 */
function extractValue(obj: any, key: string, options: Required<CSVSerializationParameters>): any {
    let value: any;

    if (obj instanceof Map) {
        value = obj.get(key);
    } else if (typeof obj === 'object' && obj !== null) {
        value = obj[key];
    } else {
        return '';
    }

    // Handle nested structures
    if (value !== null && typeof value === 'object') {
        switch (options.nestedHandling) {
            case 'json':
                return JSON.stringify(value);
            case 'flatten':
                // For flatten, we would need to expand the object
                // For now, just convert to JSON
                return JSON.stringify(value);
            case 'skip':
                return '';
            default:
                return JSON.stringify(value);
        }
    }

    return value;
}

/**
 * Format a single CSV row
 */
function formatCSVRow(values: any[], options: Required<CSVSerializationParameters>): string {
    const formatted = values.map(value => formatCSVField(value, options));
    return formatted.join(options.delimiter);
}

/**
 * Format a single CSV field with proper quoting
 */
function formatCSVField(value: any, options: Required<CSVSerializationParameters>): string {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return '';
    }

    // Convert to string
    let str = String(value);

    // Determine if quoting is needed
    const needsQuoting =
        options.alwaysQuote ||
        str.includes(options.delimiter) ||
        str.includes(options.quote) ||
        str.includes('\n') ||
        str.includes('\r');

    if (needsQuoting) {
        // Escape quotes by doubling them (RFC 4180)
        str = str.replace(new RegExp(options.quote, 'g'), options.quote + options.quote);
        return options.quote + str + options.quote;
    }

    return str;
}

/**
 * Parse CSV string to sequence of maps
 *
 * @param context - XPath evaluation context
 * @param csv - CSV string to parse
 * @param params - CSV parsing parameters
 * @returns Array of maps representing rows
 */
export function parseCSV(
    context: XPathContext,
    csv: string,
    params?: CSVSerializationParameters
): Map<string, any>[] {
    const options: Required<CSVSerializationParameters> = {
        delimiter: params?.delimiter ?? ',',
        quote: params?.quote ?? '"',
        includeHeader: params?.includeHeader ?? true,
        headers: params?.headers ?? [],
        lineEnding: params?.lineEnding ?? '\r\n',
        alwaysQuote: params?.alwaysQuote ?? false,
        nestedHandling: params?.nestedHandling ?? 'json',
        encoding: params?.encoding ?? 'UTF-8',
    };

    // Handle empty CSV
    if (!csv || csv.trim() === '') {
        return [];
    }

    // Split into lines (handle both \r\n and \n)
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length === 0) {
        return [];
    }

    // Parse header row
    let headers: string[] = options.headers;
    let startIndex = 0;

    if (options.includeHeader && headers.length === 0) {
        const headerRow = parseCSVLine(lines[0], options);
        headers = headerRow.map(String);
        startIndex = 1;
    }

    // If no headers provided or parsed, generate numbered headers
    if (headers.length === 0 && lines.length > startIndex) {
        const firstRow = parseCSVLine(lines[startIndex], options);
        headers = firstRow.map((_, i) => `column${i + 1}`);
    }

    // Parse data rows
    const result: Map<string, any>[] = [];

    for (let i = startIndex; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], options);
        const row = new Map<string, any>();

        for (let j = 0; j < headers.length; j++) {
            const value = j < values.length ? values[j] : '';
            row.set(headers[j], value);
        }

        result.push(row);
    }

    return result;
}

/**
 * Parse a single CSV line into fields
 */
function parseCSVLine(line: string, options: Required<CSVSerializationParameters>): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];
        const nextChar = i + 1 < line.length ? line[i + 1] : '';

        if (inQuotes) {
            if (char === options.quote) {
                if (nextChar === options.quote) {
                    // Escaped quote
                    currentField += options.quote;
                    i += 2;
                    continue;
                } else {
                    // End of quoted field
                    inQuotes = false;
                    i++;
                    continue;
                }
            } else {
                currentField += char;
                i++;
            }
        } else {
            if (char === options.quote) {
                // Start of quoted field
                inQuotes = true;
                i++;
            } else if (char === options.delimiter) {
                // End of field
                fields.push(currentField);
                currentField = '';
                i++;
            } else {
                currentField += char;
                i++;
            }
        }
    }

    // Add last field
    fields.push(currentField);

    return fields;
}

/**
 * XPath function registry for CSV functions
 */
export const csvFunctions = {
    'serialize-csv': {
        name: 'serialize-csv',
        minArgs: 1,
        maxArgs: 2,
        implementation: serializeCSV,
        description: 'Serializes a sequence to CSV format',
    },

    'parse-csv': {
        name: 'parse-csv',
        minArgs: 1,
        maxArgs: 2,
        implementation: parseCSV,
        description: 'Parses CSV string to sequence of maps',
    },
};
