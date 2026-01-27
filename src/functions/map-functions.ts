/**
 * XPath 3.1 Map Functions
 *
 * Functions for working with XPath maps.
 * All functions are in the "map:" namespace.
 *
 * Reference: https://www.w3.org/TR/xpath-functions-31/#map-functions
 */

import { XPathContext } from "../context";
import { isXPathMap } from "../expressions/map-constructor-expression";

function requireMap(value: any, funcName: string): any {
    // Unwrap single-item sequences (e.g., from . expression)
    if (Array.isArray(value) && !isXPathMap(value)) {
        if (value.length === 1) {
            value = value[0];
        } else if (value.length === 0) {
            throw new Error(`XPTY0004: ${funcName} requires a map, got empty sequence`);
        } else {
            throw new Error(`XPTY0004: ${funcName} requires a single map, got sequence of ${value.length} items`);
        }
    }

    if (!isXPathMap(value)) {
        throw new Error(`XPTY0004: ${funcName} requires a map, got ${typeof value}`);
    }
    return value;
}

function cloneMap(map: any): any {
    const newMap = Object.create(null);
    newMap.__isMap = true;
    Object.assign(newMap, map);
    return newMap;
}

export function mapSize(context: XPathContext, map: any): number {
    const m = requireMap(map, 'map:size');
    return Object.keys(m).filter(k => !k.startsWith('__')).length;
}

export function mapKeys(context: XPathContext, map: any): string[] {
    const m = requireMap(map, 'map:keys');
    return Object.keys(m).filter(k => !k.startsWith('__'));
}

export function mapContains(context: XPathContext, map: any, key: any): boolean {
    const m = requireMap(map, 'map:contains');
    const k = String(key);
    return Object.prototype.hasOwnProperty.call(m, k);
}

export function mapGet(context: XPathContext, map: any, key: any): any {
    const m = requireMap(map, 'map:get');
    const k = String(key);
    if (Object.prototype.hasOwnProperty.call(m, k)) {
        return m[k];
    }
    // Missing key -> empty sequence (undefined in JS)
    return undefined;
}

export function mapPut(context: XPathContext, map: any, key: any, value: any): any {
    const m = requireMap(map, 'map:put');
    const k = String(key);
    const newMap = cloneMap(m);
    newMap[k] = value;
    return newMap;
}

export function mapEntry(context: XPathContext, key: any, value: any): any {
    const k = String(key);
    const newMap = Object.create(null);
    newMap.__isMap = true;
    newMap[k] = value;
    return newMap;
}

export function mapMerge(context: XPathContext, maps: any | any[], options?: any): any {
    // Normalize to array of maps
    const mapList = Array.isArray(maps) ? maps : [maps];
    const result = Object.create(null);
    result.__isMap = true;

    for (const m of mapList) {
        const mm = requireMap(m, 'map:merge');
        for (const k of Object.keys(mm)) {
            if (k.startsWith('__')) continue;
            // Later maps win
            result[k] = mm[k];
        }
    }

    // TODO: implement options handling (e.g., duplicates) per spec
    return result;
}

export function mapForEach(context: XPathContext, map: any, fn: any): any {
    const m = requireMap(map, 'map:for-each');

    if (!fn || (typeof fn !== 'function' && !fn.__isFunctionItem)) {
        throw new Error(`XPTY0004: map:for-each requires a function as second argument`);
    }

    const impl = fn.__isFunctionItem ? fn.implementation : fn;

    const result = Object.create(null);
    result.__isMap = true;

    for (const k of Object.keys(m)) {
        if (k.startsWith('__')) continue;
        const v = m[k];
        // Inline function implementations don't expect context as first arg
        // Call with key and value
        result[k] = impl(k, v);
    }

    return result;
}

export function mapRemove(context: XPathContext, map: any, keys: any | any[]): any {
    const m = requireMap(map, 'map:remove');
    const keyList = Array.isArray(keys) ? keys : [keys];

    const toRemove = new Set(keyList.map(k => String(k)));

    const result = cloneMap(m);
    // Iterate over array of keys for compatibility with TS downlevel iteration
    for (const k of Array.from(toRemove)) {
        if (Object.prototype.hasOwnProperty.call(result, k)) {
            delete result[k];
        }
    }

    return result;
}
