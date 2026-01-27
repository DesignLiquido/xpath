// src/functions/json-functions.ts
// XPath 3.1: JSON Functions
// Implements fn:parse-json($json-string as xs:string) as item()?
// and fn:parse-json($json-string as xs:string, $options as map(*)) as item()?
// Implements fn:serialize($value as item()*) as xs:string
// and fn:serialize($value as item()*, $options as map(*)) as xs:string
// Spec: https://www.w3.org/TR/xpath-functions-31/#func-parse-json
//       https://www.w3.org/TR/xpath-functions-31/#func-serialize

import { XPathMap, isXPathMap } from '../expressions/map-constructor-expression';
import { XPathArray, isXPathArray, createXPathArray } from '../expressions/array-constructor-expression';
import { XPathError } from '../errors';

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
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  throw new XPathError('FOJS0001', 'Unsupported JSON value type');
}

// Main: fn:parse-json($json-string as xs:string, $options as map(*)?) as item()?
export function parseJson(jsonString: any, options?: any): any {
  if (typeof jsonString !== 'string') throw new XPathError('XPTY0004', 'parse-json: first argument must be a string');
  let opts = { liberal: false, duplicates: 'use-last' };
  if (options && isXPathMap(options)) {
    const lib = options['liberal'];
    if (lib === true) opts.liberal = true;
    const dups = options['duplicates'];
    if (typeof dups === 'string') opts.duplicates = dups;
  }
  try {
    // Liberal mode: allow comments, trailing commas, etc. (not implemented)
    // Duplicates: only 'use-last' supported (per spec, others error)
    if (opts.duplicates !== 'use-last') throw new XPathError('FOJS0001', 'Only duplicates="use-last" is supported');
    // TODO: Implement liberal mode if needed
    const parsed = JSON.parse(jsonString);
    return jsToXPath(parsed);
  } catch (e: any) {
    throw new XPathError('FOJS0001', 'parse-json: ' + (e && e.message ? e.message : String(e)));
  }
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
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  // Arrays (plain JS arrays from sequences)
  if (Array.isArray(value)) {
    return value.map(xpathToJs);
  }
  throw new XPathError('FOJS0002', `Cannot serialize value of type ${typeof value}`);
}

// Main: fn:serialize($value as item()*, $options as map(*)?) as xs:string
// Serializes XPath values to JSON string representation
export function serialize(value: any, options?: any): string {
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

// Export for function registry
export const jsonFunctions = {
  'parse-json': parseJson
};
