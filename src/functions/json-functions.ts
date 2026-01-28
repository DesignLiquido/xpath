// src/functions/json-functions.ts
// XPath 3.1: JSON Functions
// Implements fn:parse-json($json-string as xs:string) as item()?
// and fn:parse-json($json-string as xs:string, $options as map(*)) as item()?
// Implements fn:serialize($value as item()*) as xs:string
// and fn:serialize($value as item()*, $options as map(*)) as xs:string
// Implements fn:json-to-xml($json-string as xs:string?) as node()?
// and fn:json-to-xml($json-string as xs:string?, $options as map(*)) as node()?
// Implements fn:xml-to-json($node-sequence as node()*) as xs:string?
// Spec: https://www.w3.org/TR/xpath-functions-31/#func-parse-json
//       https://www.w3.org/TR/xpath-functions-31/#func-serialize
//       https://www.w3.org/TR/xpath-functions-31/#func-json-to-xml
//       https://www.w3.org/TR/xpath-functions-31/#func-xml-to-json

import { XPathMap, isXPathMap } from '../expressions/map-constructor-expression';
import {
    XPathArray,
    isXPathArray,
    createXPathArray,
} from '../expressions/array-constructor-expression';
import { XPathError } from '../errors';
import { JsonToXmlConverter } from '../expressions/json-to-xml-converter';
import { XPathNode } from '../node';
import { NodeType } from '../constants';
import { XPathContext } from '../context';

// Helper: Convert JS value to XPath map/array/atomic
function jsToXPath(value: any): any {
    if (value === null) return null;
    if (Array.isArray(value)) return createXPathArray(value.map(jsToXPath));
    if (typeof value === 'object') {
        // Convert to XPathMap
        const map: XPathMap = Object.create(null);
        map.__isMap = true;
        for (const [k, v] of Object.entries(value)) {
            map[k] = jsToXPath(v);
        }
        return map;
    }
    // Atomic values: string, number, boolean
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return value;
    throw new XPathError('FOJS0001', 'Unsupported JSON value type');
}

// Helper: Process JSON string in liberal mode
// Removes comments and trailing commas to make it valid JSON
function processLiberalJson(json: string): string {
    let result = '';
    let i = 0;
    let inString = false;
    let stringChar = '';
    let escaped = false;

    while (i < json.length) {
        const char = json[i];
        const nextChar = i + 1 < json.length ? json[i + 1] : '';

        // Handle string state
        if (inString) {
            if (escaped) {
                result += char;
                escaped = false;
                i++;
                continue;
            }
            if (char === '\\') {
                result += char;
                escaped = true;
                i++;
                continue;
            }
            if (char === stringChar) {
                // End of string - convert single quotes to double quotes
                result += '"';
                inString = false;
                i++;
                continue;
            }
            // Regular string character - if we're in single-quoted string, escape internal double quotes
            if (stringChar === "'" && char === '"') {
                result += '\\"';
            } else {
                result += char;
            }
            i++;
            continue;
        }

        // Not in string - check for string start
        if (char === '"' || char === "'") {
            inString = true;
            stringChar = char;
            result += '"'; // Always use double quotes in output
            i++;
            continue;
        }

        // Handle comments (// and /* */)
        if (char === '/' && nextChar === '/') {
            // Single-line comment - skip until newline
            i += 2;
            while (i < json.length && json[i] !== '\n' && json[i] !== '\r') {
                i++;
            }
            continue;
        }

        if (char === '/' && nextChar === '*') {
            // Multi-line comment - skip until */
            i += 2;
            while (i < json.length - 1) {
                if (json[i] === '*' && json[i + 1] === '/') {
                    i += 2;
                    break;
                }
                i++;
            }
            continue;
        }

        // Handle trailing commas - check if next non-whitespace is ] or }
        if (char === ',') {
            // Look ahead to see if this is a trailing comma
            let j = i + 1;
            // Skip all whitespace including newlines
            while (j < json.length && /[\s\n\r\t]/.test(json[j])) {
                j++;
            }
            // Also skip any comments after the comma
            while (j < json.length) {
                if (json[j] === '/' && j + 1 < json.length && json[j + 1] === '/') {
                    // Skip single-line comment
                    j += 2;
                    while (j < json.length && json[j] !== '\n' && json[j] !== '\r') {
                        j++;
                    }
                    // Skip whitespace after comment
                    while (j < json.length && /[\s\n\r\t]/.test(json[j])) {
                        j++;
                    }
                } else if (json[j] === '/' && j + 1 < json.length && json[j + 1] === '*') {
                    // Skip multi-line comment
                    j += 2;
                    while (j < json.length - 1) {
                        if (json[j] === '*' && json[j + 1] === '/') {
                            j += 2;
                            break;
                        }
                        j++;
                    }
                    // Skip whitespace after comment
                    while (j < json.length && /[\s\n\r\t]/.test(json[j])) {
                        j++;
                    }
                } else {
                    break;
                }
            }

            if (j < json.length && (json[j] === '}' || json[j] === ']')) {
                // Trailing comma - skip it and preserve whitespace
                i++;
                // Add whitespace between comma position and closing bracket
                while (i < j) {
                    if (/[\s\n\r\t]/.test(json[i])) {
                        result += json[i];
                    }
                    i++;
                }
                continue;
            }
        }

        // Regular character
        result += char;
        i++;
    }

    return result;
}

// Main: fn:parse-json($json-string as xs:string, $options as map(*)?) as item()?
// Internal implementation (doesn't take context parameter)
function parseJsonImpl(jsonString: any, options?: any): any {
    if (typeof jsonString !== 'string')
        throw new XPathError('XPTY0004', 'parse-json: first argument must be a string');
    let opts = { liberal: false, duplicates: 'use-last' };
    if (options && isXPathMap(options)) {
        const lib = options['liberal'];
        if (lib === true) opts.liberal = true;
        const dups = options['duplicates'];
        if (typeof dups === 'string') opts.duplicates = dups;
    }
    try {
        // Duplicates: only 'use-last' supported (per spec, others error)
        if (opts.duplicates !== 'use-last')
            throw new XPathError('FOJS0001', 'Only duplicates="use-last" is supported');

        // Liberal mode: preprocess to handle comments, trailing commas, and single quotes
        const processedJson = opts.liberal ? processLiberalJson(jsonString) : jsonString;
        const parsed = JSON.parse(processedJson);
        return jsToXPath(parsed);
    } catch (e: any) {
        throw new XPathError('FOJS0001', 'parse-json: ' + (e && e.message ? e.message : String(e)));
    }
}

// Exported with overloads to support both XPath system (with context) and direct calls (without context)
export function parseJson(jsonString: any, options?: any): any;
export function parseJson(_context: XPathContext, jsonString: any, options?: any): any;
export function parseJson(_contextOrJson: any, jsonStringOrOptions?: any, options?: any): any {
    // If first arg is a string, it's direct call (no context)
    if (typeof _contextOrJson === 'string') {
        return parseJsonImpl(_contextOrJson, jsonStringOrOptions);
    }
    // Otherwise first arg is context, shift parameters
    return parseJsonImpl(jsonStringOrOptions, options);
}

// Helper: Convert XPath value to JSON-serializable JS value
function xpathToJs(value: any): any {
    if (value === null || value === undefined) return null;
    if (isXPathArray(value)) {
        return value.members.map(xpathToJs);
    }
    if (isXPathMap(value)) {
        const obj: Record<string, any> = {};
        for (const [k, v] of Object.entries(value)) {
            if (!k.startsWith('__')) {
                obj[k] = xpathToJs(v);
            }
        }
        return obj;
    }
    // Atomic values: string, number, boolean pass through
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return value;
    // Arrays (plain JS arrays from sequences)
    if (Array.isArray(value)) {
        return value.map(xpathToJs);
    }
    throw new XPathError('FOJS0002', `Cannot serialize value of type ${typeof value}`);
}

// Main: fn:serialize($value as item()*, $options as map(*)?) as xs:string
// Serializes XPath values to JSON string representation
// Internal implementation
function serializeImpl(value: any, options?: any): string {
    let opts = { indent: undefined, method: 'json' };
    if (options && isXPathMap(options)) {
        const ind = options['indent'];
        if (typeof ind === 'number') opts.indent = ind;
        const meth = options['method'];
        if (typeof meth === 'string') opts.method = meth;
    }

    try {
        // Handle sequences: convert to array if needed
        let toSerialize: any;
        if (Array.isArray(value)) {
            if (value.length === 0) {
                toSerialize = null;
            } else if (value.length === 1) {
                toSerialize = value[0];
            } else {
                toSerialize = value;
            }
        } else {
            toSerialize = value;
        }

        // Convert to JS value
        const jsValue = xpathToJs(toSerialize);

        // Serialize to JSON string
        const indent = opts.indent !== undefined ? opts.indent : undefined;
        return JSON.stringify(jsValue, null, indent);
    } catch (e: any) {
        if (e instanceof XPathError) throw e;
        throw new XPathError('FOJS0002', 'serialize: ' + (e && e.message ? e.message : String(e)));
    }
}

// Exported with overloads to support both XPath system (with context) and direct calls (without context)
export function serialize(value: any, options?: any): string;
export function serialize(_context: XPathContext, value: any, options?: any): string;
export function serialize(_contextOrValue: any, valueOrOptions?: any, options?: any): string {
    // If we have 3 parameters, first is context
    if (options !== undefined) {
        return serializeImpl(valueOrOptions, options);
    }
    // If first arg is an object without data properties (__isMap, __isArray, or other keys),
    // and we have a second arg, then first is likely context
    if (_contextOrValue && typeof _contextOrValue === 'object' &&
        !('__isMap' in _contextOrValue) &&
        !('__isArray' in _contextOrValue) &&
        valueOrOptions !== undefined) {
        // First arg appears to be context (empty {} or context object), second is the value
        return serializeImpl(valueOrOptions, options);
    }
    // Otherwise first arg is the value to serialize
    return serializeImpl(_contextOrValue, valueOrOptions);
}

// Export for function registry
export const jsonFunctions = {
    'parse-json': parseJson,
};

// Main: fn:json-to-xml($json-string as xs:string?, $options as map(*)?) as node()?
// Converts JSON string to XML document representation
// Internal implementation
function jsonToXmlImpl(jsonString: any, options?: any): XPathNode | null {
    // Handle null/empty input
    if (jsonString === null || jsonString === undefined || jsonString === '') {
        return null;
    }

    if (typeof jsonString !== 'string') {
        throw new XPathError('XPTY0004', 'json-to-xml: first argument must be a string or null');
    }

    // Parse options parameter
    let opts: any = { liberal: false, duplicates: 'reject' };
    if (options && isXPathMap(options)) {
        const lib = options['liberal'];
        if (lib === true) opts.liberal = true;
        const dups = options['duplicates'];
        if (typeof dups === 'string') opts.duplicates = dups;
    }

    try {
        const converter = new JsonToXmlConverter();
        return converter.convert(jsonString, opts);
    } catch (e: any) {
        throw new XPathError(
            'FOJS0001',
            'json-to-xml: ' + (e && e.message ? e.message : String(e))
        );
    }
}

// Exported with overloads to support both XPath system (with context) and direct calls (without context)
export function jsonToXml(jsonString: any, options?: any): XPathNode | null;
export function jsonToXml(_context: XPathContext, jsonString: any, options?: any): XPathNode | null;
export function jsonToXml(_contextOrJson: any, jsonStringOrOptions?: any, options?: any): XPathNode | null {
    // If first arg is a string or null/undefined, it's direct call (no context)
    if (typeof _contextOrJson === 'string' || _contextOrJson === null || _contextOrJson === undefined) {
        return jsonToXmlImpl(_contextOrJson, jsonStringOrOptions);
    }
    // If first arg is a number or other non-string/non-object, it's an error in direct call
    if (typeof _contextOrJson !== 'object') {
        throw new XPathError('XPTY0004', 'json-to-xml: first argument must be a string or null');
    }
    // First arg is an object (context), shift parameters
    return jsonToXmlImpl(jsonStringOrOptions, options);
}

// Helper: Convert XML node tree back to JSON representation
function nodeToJsonValue(node: XPathNode | null): any {
    if (!node) return null;

    // Document node: recurse to document element
    if (node.nodeType === NodeType.DOCUMENT_NODE) {
        if (node.documentElement) {
            return nodeToJsonValue(node.documentElement);
        }
        return null;
    }

    // Element node
    if (node.nodeType === NodeType.ELEMENT_NODE) {
        // Handle special structure: check if this is a map-like or array-like element
        const childNodesArrayLike = node.childNodes || [];
        const children = Array.from(childNodesArrayLike);

        // If no children: return null or empty object based on element name
        if (children.length === 0) {
            return null;
        }

        // If all children are text nodes: concatenate text
        const allText = children.every((n) => n.nodeType === NodeType.TEXT_NODE);
        if (allText) {
            const text = children.map((n) => n.textContent || '').join('');
            // Try to parse as number or boolean
            if (text === 'true') return true;
            if (text === 'false') return false;
            if (text === 'null') return null;
            const num = Number(text);
            if (!Number.isNaN(num)) return num;
            return text;
        }

        // If children are mixed or all elements: treat as object
        const obj: Record<string, any> = {};
        const seenKeys = new Set<string>();

        for (const child of children) {
            if (child.nodeType === NodeType.ELEMENT_NODE) {
                const key = child.localName || child.nodeName || '';
                const value = nodeToJsonValue(child);

                if (seenKeys.has(key)) {
                    // Duplicate key: handle per W3C spec (allow)
                    if (Array.isArray(obj[key])) {
                        obj[key].push(value);
                    } else {
                        obj[key] = [obj[key], value];
                    }
                } else {
                    obj[key] = value;
                }
                seenKeys.add(key);
            }
        }

        return obj;
    }

    // Text node
    if (node.nodeType === NodeType.TEXT_NODE) {
        return node.textContent || '';
    }

    // Other node types: skip
    return null;
}

// Main: fn:xml-to-json($node-sequence as node()*) as xs:string?
// Converts XML nodes to JSON string representation (inverse of json-to-xml)
// Note: First parameter is context for BUILT_IN_FUNCTIONS compatibility
export function xmlToJson(context: any, nodes?: any): string | null {
    // When called from BUILT_IN_FUNCTIONS, context is always first parameter
    // When called directly, first arg could be the nodes
    // We check if second parameter exists - if so, first is context
    let actualNodes: any;
    if (nodes !== undefined) {
        // context + nodes provided
        actualNodes = nodes;
    } else {
        // Only one arg - treat as nodes (direct call)
        actualNodes = context;
    }

    // Handle empty sequence or null
    if (actualNodes === null || actualNodes === undefined) {
        return null;
    }

    // Convert to array if not already
    let nodeList: any[] = Array.isArray(actualNodes) ? actualNodes : [actualNodes];

    // Filter out non-nodes
    nodeList = nodeList.filter((n) => n && typeof n === 'object' && 'nodeType' in n);

    if (nodeList.length === 0) {
        return null;
    }

    try {
        // If multiple nodes: wrap in array
        let toSerialize: any;
        if (nodeList.length === 1) {
            toSerialize = nodeToJsonValue(nodeList[0]);
        } else {
            toSerialize = nodeList.map((n) => nodeToJsonValue(n));
        }

        // Serialize to JSON
        return JSON.stringify(toSerialize);
    } catch (e: any) {
        throw new XPathError(
            'FOJS0002',
            'xml-to-json: ' + (e && e.message ? e.message : String(e))
        );
    }
}
// Exported with overloads to support both XPath system (with context) and direct calls (without context)