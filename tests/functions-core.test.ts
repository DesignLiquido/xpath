/**
 * Core function category smoke tests (Phase 9.1)
 */

import {
    upperCase,
    lowerCase,
    endsWith,
    matches,
    replace,
    tokenize,
    normalizeUnicode,
    codepointsToString,
    stringToCodepoints,
    abs,
    roundHalfToEven,
    avg,
    min,
    max,
    empty,
    exists,
    head,
    tail,
    reverse,
    subsequence,
    distinctValues,
    indexOf,
    currentDateTime,
    currentDate,
    currentTime,
    implicitTimezone,
    nodeName,
    name,
    localName,
    namespaceUri,
    QName,
    resolveQName,
    prefixFromQName,
    localNameFromQName,
    namespaceUriFromQName,
    inScopePrefixes,
    resolveUri,
    encodeForUri,
    iriToUri,
    escapeHtmlUri,
    booleanFn,
    notFn,
    trueFn,
    falseFn,
} from '../src/functions';
import { createContext } from '../src/context';

const sampleElement = {
    nodeType: 1,
    nodeName: 'ns:elem',
    localName: 'elem',
    namespaceUri: 'http://example.com/ns',
    textContent: 'hello',
    parentNode: null,
    attributes: [
        { name: 'xmlns:ns', value: 'http://example.com/ns' },
        { name: 'xml:lang', value: 'en-US' },
    ],
    getAttribute(name: string) {
        const attr = (this.attributes as any[]).find(a => a.name === name);
        return attr ? attr.value : null;
    },
    childNodes: [],
} as any;

const context = createContext(sampleElement as any, {
    currentDateTime: new Date('2024-01-01T12:34:56Z'),
    implicitTimezone: '+00:00',
    baseUri: 'http://example.com/base/',
});

describe('Core function smoke tests (Phase 9.1)', () => {
    it('string functions', () => {
        expect(upperCase('abc')).toBe('ABC');
        expect(lowerCase('ABC')).toBe('abc');
        expect(endsWith('hello', 'lo')).toBe(true);
        expect(matches('abc', 'a.c')).toBe(true);
        expect(replace('abc', 'b', 'd')).toBe('adc');
        expect(tokenize('a b c', ' ')).toEqual(['a', 'b', 'c']);
        expect(normalizeUnicode('á', 'NFD')).toBe('á');
        expect(codepointsToString([97, 98, 99])).toBe('abc');
        expect(stringToCodepoints('abc')).toEqual([97, 98, 99]);
    });

    it('numeric functions', () => {
        expect(abs(-5)).toBe(5);
        expect(roundHalfToEven(2.5)).toBe(2);
        expect(roundHalfToEven(3.5)).toBe(4);
        expect(avg([1, 2, 3])).toBe(2);
        expect(min([3, 1, 2])).toBe(1);
        expect(max([3, 1, 2])).toBe(3);
    });

    it('sequence functions', () => {
        expect(empty([])).toBe(true);
        expect(exists([1])).toBe(true);
        expect(head([1, 2, 3])).toBe(1);
        expect(tail([1, 2, 3])).toEqual([2, 3]);
        expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
        expect(subsequence([1, 2, 3, 4, 5], 2, 2)).toEqual([2, 3]);
        expect(distinctValues([1, 1, 2, '2'])).toEqual([1, 2, '2']);
        expect(indexOf([1, 2, 3, 2], 2)).toEqual([2, 4]);
    });

    it('datetime functions', () => {
        expect(currentDateTime(context)).toBe('2024-01-01T12:34:56Z');
        expect(currentDate(context)).toBe('2024-01-01Z');
        expect(currentTime(context)).toBe('12:34:56Z');
        expect(implicitTimezone(context)).toBe('PT0S');
    });

    it('node functions', () => {
        expect(nodeName(sampleElement, context)).toBe('ns:elem');
        expect(name(sampleElement, context)).toBe('ns:elem');
        expect(localName(sampleElement, context)).toBe('elem');
        expect(namespaceUri(sampleElement, context)).toBe('http://example.com/ns');
    });

    it('QName functions', () => {
        expect(QName('http://example.com/ns', 'ns:elem')).toBe('{http://example.com/ns}ns:elem');
        expect(resolveQName('ns:elem', sampleElement)).toBe('{http://example.com/ns}ns:elem');
        expect(prefixFromQName('ns:elem')).toBe('ns');
        expect(localNameFromQName('ns:elem')).toBe('elem');
        expect(namespaceUriFromQName('{http://example.com/ns}ns:elem')).toBe('http://example.com/ns');
        expect(inScopePrefixes(sampleElement)).toContain('ns');
    });

    it('URI functions', () => {
        expect(resolveUri('path', undefined, context)).toBe('http://example.com/base/path');
        expect(encodeForUri('a b')).toBe('a%20b');
        expect(iriToUri('https://exámple.com/ñ')).toBe('https://ex%C3%A1mple.com/%C3%B1');
        expect(escapeHtmlUri("https://example.com/a b"))
            .toBe('https://example.com/a%20b');
    });

    it('Boolean functions', () => {
        expect(booleanFn(1)).toBe(true);
        expect(booleanFn(0)).toBe(false);
        expect(notFn(1)).toBe(false);
        expect(trueFn()).toBe(true);
        expect(falseFn()).toBe(false);
    });
});
