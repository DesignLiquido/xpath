// tests/json-functions.test.ts
// Tests for fn:parse-json and fn:serialize

import { parseJson, serialize } from '../src/functions/json-functions';
import { XPathMap } from '../src/expressions/map-constructor-expression';
import { XPathArray, createXPathArray } from '../src/expressions/array-constructor-expression';
import { XPathError } from '../src/errors';

describe('parse-json', () => {
  it('parses a simple JSON object', () => {
    const json = '{"a":1, "b":true, "c":null, "d":[2,3]}';
    const result = parseJson(json);
    expect(result.__isMap).toBe(true);
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', '__isMap']));
    expect(result['a']).toBe(1);
    expect(result['b']).toBe(true);
    expect(result['c']).toBeNull();
    expect(result['d'].__isArray).toBe(true);
    expect(result['d'].members).toEqual([2, 3]);
  });

  it('parses a JSON array', () => {
    const json = '[1,2,3]';
    const result = parseJson(json);
    expect(result.__isArray).toBe(true);
    expect(result.members.length).toBe(3);
    expect(result.members).toEqual([1, 2, 3]);
  });

  it('parses a JSON string', () => {
    const json = '"hello"';
    const result = parseJson(json);
    expect(result).toBe('hello');
  });

  it('parses a JSON number', () => {
    const json = '42';
    const result = parseJson(json);
    expect(result).toBe(42);
  });

  it('parses a JSON boolean', () => {
    const json = 'true';
    const result = parseJson(json);
    expect(result).toBe(true);
  });

  it('parses a JSON null', () => {
    const json = 'null';
    const result = parseJson(json);
    expect(result).toBeNull();
  });

  it('throws on invalid JSON', () => {
    const json = '{foo: 1';
    expect(() => parseJson(json)).toThrow(XPathError);
  });

  it('throws on non-string input', () => {
    expect(() => parseJson(42)).toThrow(XPathError);
  });

  it('supports options: duplicates=use-last', () => {
    const json = '{"a":1, "a":2}';
    const options = { __isMap: true, duplicates: 'use-last' };
    const result = parseJson(json, options);
    expect(result['a']).toBe(2);
  });

  it('throws on unsupported duplicates option', () => {
    const json = '{"a":1, "a":2}';
    const options = { __isMap: true, duplicates: 'reject' };
    expect(() => parseJson(json, options)).toThrow(XPathError);
  });
});

describe('serialize', () => {
  it('serializes a simple JSON object (map)', () => {
    const map = { __isMap: true, a: 1, b: true, c: null };
    const result = serialize(map);
    expect(result).toBe('{"a":1,"b":true,"c":null}');
    expect(JSON.parse(result)).toEqual({ a: 1, b: true, c: null });
  });

  it('serializes a JSON array', () => {
    const arr = createXPathArray([1, 2, 3]);
    const result = serialize(arr);
    expect(result).toBe('[1,2,3]');
    expect(JSON.parse(result)).toEqual([1, 2, 3]);
  });

  it('serializes nested structures', () => {
    const nested = {
      __isMap: true,
      arr: createXPathArray([1, 2, createXPathArray([3, 4])]),
      obj: { __isMap: true, x: 42 }
    };
    const result = serialize(nested);
    const parsed = JSON.parse(result);
    expect(parsed.arr).toEqual([1, 2, [3, 4]]);
    expect(parsed.obj).toEqual({ x: 42 });
  });

  it('serializes a JSON string', () => {
    const str = 'hello';
    const result = serialize(str);
    expect(result).toBe('"hello"');
  });

  it('serializes a JSON number', () => {
    const num = 42;
    const result = serialize(num);
    expect(result).toBe('42');
  });

  it('serializes a JSON boolean', () => {
    const bool = true;
    const result = serialize(bool);
    expect(result).toBe('true');
  });

  it('serializes a JSON null', () => {
    const nul = null;
    const result = serialize(nul);
    expect(result).toBe('null');
  });

  it('serializes empty sequences as null', () => {
    const empty: any = [];
    const result = serialize(empty);
    expect(result).toBe('null');
  });

  it('serializes single-item sequences', () => {
    const seq = [42];
    const result = serialize(seq);
    expect(result).toBe('42');
  });

  it('serializes multi-item sequences as arrays', () => {
    const seq = [1, 2, 3];
    const result = serialize(seq);
    expect(result).toBe('[1,2,3]');
  });

  it('supports options: indent', () => {
    const map = { __isMap: true, a: 1, b: { __isMap: true, c: 2 } };
    const options = { __isMap: true, indent: 2 };
    const result = serialize(map, options);
    expect(result).toContain('\n');
    expect(result).toContain('  ');
  });

  it('throws on non-serializable values', () => {
    const badValue = { regular: 'object', notXPath: true };
    expect(() => serialize(badValue)).toThrow(XPathError);
  });
});
