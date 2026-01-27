// src/functions/json-functions.ts
// XPath 3.1: JSON Parsing Functions (parse-json)
// Implements fn:parse-json($json-string as xs:string) as item()?
// and fn:parse-json($json-string as xs:string, $options as map(*)) as item()?
// Spec: https://www.w3.org/TR/xpath-functions-31/#func-parse-json

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

// Export for function registry
export const jsonFunctions = {
  'parse-json': parseJson
};
