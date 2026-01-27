import { sum } from '../src/functions/sequence-functions';
import { avg, min, max } from '../src/functions/numeric-functions';

describe('Aggregate Functions (Phase 9.2)', () => {
    it('sum: empty -> 0', () => {
        expect(sum([])).toBe(0);
        expect(sum(null as any)).toBe(0);
    });

    it('sum: numbers', () => {
        expect(sum([1, 2, 3])).toBe(6);
        expect(sum([1, '2', true])).toBe(4);
    });

    it('sum: NaN propagation', () => {
        expect(Number.isNaN(sum([1, NaN]))).toBe(true);
    });

    it('avg: empty -> null', () => {
        expect(avg([])).toBeNull();
    });

    it('avg: numbers', () => {
        expect(avg([1, 2, 3])).toBe(2);
        expect(avg([1, '3'])).toBe(2);
    });

    it('min/max: numeric', () => {
        expect(min([3, 1, 2])).toBe(1);
        expect(max([3, 1, 2])).toBe(3);
    });

    it('min/max: strings default collation (codepoint)', () => {
        expect(min(['b', 'a', 'c'])).toBe('a');
        expect(max(['b', 'a', 'c'])).toBe('c');
    });

    it('min/max: strings with collation param', () => {
        const coll = 'http://www.w3.org/2005/xpath-functions/collation/codepoint';
        expect(min(['b', 'a', 'c'], coll)).toBe('a');
        expect(max(['b', 'a', 'c'], coll)).toBe('c');
    });
});
