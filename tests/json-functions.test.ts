// tests/json-functions.test.ts
// Tests for fn:parse-json

import { parseJson } from '../src/functions/json-functions';
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
