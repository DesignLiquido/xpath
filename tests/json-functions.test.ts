// tests/json-functions.test.ts
// Tests for fn:parse-json and fn:serialize

import { parseJson, serialize, jsonToXml, xmlToJson } from '../src/functions/json-functions';
import { XPathMap } from '../src/expressions/map-constructor-expression';
import { XPathArray, createXPathArray } from '../src/expressions/array-constructor-expression';
import { XPathError } from '../src/errors';
import { NodeType } from '../src/constants';
import { XPathNode } from '../src/node';

describe('parse-json', () => {
    it('parses a simple JSON object', () => {
        const json = '{"a":1, "b":true, "c":null, "d":[2,3]}';
        const result = parseJson(json);
        expect(result.__isMap).toBe(true);
        expect(Object.keys(result)).toEqual(
            expect.arrayContaining(['a', 'b', 'c', 'd', '__isMap'])
        );
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
            obj: { __isMap: true, x: 42 },
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

describe('json-to-xml', () => {
    it('converts a simple JSON object to XML', () => {
        const json = '{"name":"John","age":30}';
        const result = jsonToXml(json);
        expect(result).not.toBeNull();
        expect(result!.nodeType).toBe(NodeType.DOCUMENT_NODE);
        expect(result!.documentElement).toBeDefined();
        expect(result!.documentElement!.localName).toBe('root');
    });

    it('converts a JSON array to XML', () => {
        const json = '[1,2,3]';
        const result = jsonToXml(json);
        expect(result).not.toBeNull();
        expect(result!.nodeType).toBe(NodeType.DOCUMENT_NODE);
    });

    it('converts a JSON string to XML', () => {
        const json = '"hello"';
        const result = jsonToXml(json);
        expect(result).not.toBeNull();
        expect(result!.nodeType).toBe(NodeType.DOCUMENT_NODE);
    });

    it('converts a JSON number to XML', () => {
        const json = '42';
        const result = jsonToXml(json);
        expect(result).not.toBeNull();
        expect(result!.nodeType).toBe(NodeType.DOCUMENT_NODE);
    });

    it('converts a JSON boolean to XML', () => {
        const json = 'true';
        const result = jsonToXml(json);
        expect(result).not.toBeNull();
        expect(result!.nodeType).toBe(NodeType.DOCUMENT_NODE);
    });

    it('converts a JSON null to XML', () => {
        const json = 'null';
        const result = jsonToXml(json);
        expect(result).not.toBeNull();
    });

    it('handles null input gracefully', () => {
        const result = jsonToXml(null);
        expect(result).toBeNull();
    });

    it('handles empty string input gracefully', () => {
        const result = jsonToXml('');
        expect(result).toBeNull();
    });

    it('handles undefined input gracefully', () => {
        const result = jsonToXml(undefined);
        expect(result).toBeNull();
    });

    it('throws on non-string input', () => {
        expect(() => jsonToXml(42)).toThrow(XPathError);
    });

    it('supports options parameter', () => {
        const json = '{"a":1, "a":2}';
        const options = { __isMap: true, duplicates: 'use-first' };
        const result = jsonToXml(json, options);
        expect(result).not.toBeNull();
    });

    it('converts nested JSON structures', () => {
        const json = '{"person":{"name":"John","age":30}}';
        const result = jsonToXml(json);
        expect(result).not.toBeNull();
        expect(result!.documentElement).toBeDefined();
    });
});

describe('xml-to-json', () => {
    it('converts a simple XML element to JSON', () => {
        // Create a simple XML node
        const node: XPathNode = {
            nodeType: NodeType.ELEMENT_NODE,
            nodeName: 'root',
            localName: 'root',
            childNodes: [],
            attributes: [],
        };
        const result = xmlToJson(node);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
    });

    it('converts XML with text content', () => {
        const textNode: XPathNode = {
            nodeType: NodeType.TEXT_NODE,
            nodeName: '#text',
            localName: '#text',
            textContent: 'hello',
        };
        const element: XPathNode = {
            nodeType: NodeType.ELEMENT_NODE,
            nodeName: 'greeting',
            localName: 'greeting',
            childNodes: [textNode],
            attributes: [],
        };
        const result = xmlToJson(element);
        expect(result).not.toBeNull();
        if (result) {
            const parsed = JSON.parse(result);
            expect(parsed).toBe('hello');
        }
    });

    it('converts XML with nested elements', () => {
        const child: XPathNode = {
            nodeType: NodeType.ELEMENT_NODE,
            nodeName: 'name',
            localName: 'name',
            childNodes: [
                {
                    nodeType: NodeType.TEXT_NODE,
                    nodeName: '#text',
                    localName: '#text',
                    textContent: 'John',
                },
            ],
            attributes: [],
        };
        const parent: XPathNode = {
            nodeType: NodeType.ELEMENT_NODE,
            nodeName: 'person',
            localName: 'person',
            childNodes: [child],
            attributes: [],
        };
        const result = xmlToJson(parent);
        expect(result).not.toBeNull();
        if (result) {
            const parsed = JSON.parse(result);
            expect(parsed.name).toBe('John');
        }
    });

    it('handles null input gracefully', () => {
        const result = xmlToJson(null);
        expect(result).toBeNull();
    });

    it('handles undefined input gracefully', () => {
        const result = xmlToJson(undefined);
        expect(result).toBeNull();
    });

    it('handles empty sequence', () => {
        const result = xmlToJson([]);
        expect(result).toBeNull();
    });

    it('converts document nodes', () => {
        const root: XPathNode = {
            nodeType: NodeType.ELEMENT_NODE,
            nodeName: 'root',
            localName: 'root',
            childNodes: [],
            attributes: [],
        };
        const doc: XPathNode = {
            nodeType: NodeType.DOCUMENT_NODE,
            nodeName: '#document',
            localName: '#document',
            documentElement: root,
            childNodes: [root],
        };
        const result = xmlToJson(doc);
        expect(result).not.toBeNull();
    });
});
