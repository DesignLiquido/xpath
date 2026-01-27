/**
 * Tests for XPath 2.0 SequenceType System
 * Covers: SequenceType, ItemType, KindTest, and matching algorithm
 */

import {
    SequenceType,
    OccurrenceIndicator,
    ITEM_TYPE,
    createEmptySequenceType,
    createItemSequenceType,
    createAtomicSequenceType,
} from '../../src/types/sequence-type';

import {
    ElementTest,
    AttributeTest,
    DocumentNodeTest,
    TextTest,
    CommentTest,
    ProcessingInstructionTest,
    NodeKindTest,
    SchemaElementTest,
    SchemaAttributeTest,
    KIND_TESTS,
    createElement,
    createAttribute,
    createDocumentNode,
    createProcessingInstruction,
    createSchemaElement,
    createSchemaAttribute,
} from '../../src/types/kind-tests';

import {
    matchesSequenceType,
    matchesItemType,
    matches,
    findMismatch,
    countMatches,
    atomicTypeSatisfies,
    describeSequenceType,
    toSequence,
    itemTypesEquivalent,
    sequenceTypesEquivalent,
} from '../../src/types/sequence-type-matcher';

import { getAtomicType } from '../../src/types';

describe('SequenceType System', () => {
    describe('OccurrenceIndicator', () => {
        it('should have correct occurrence indicator values', () => {
            expect(OccurrenceIndicator.EXACTLY_ONE).toBe('ONE');
            expect(OccurrenceIndicator.ZERO_OR_ONE).toBe('?');
            expect(OccurrenceIndicator.ZERO_OR_MORE).toBe('*');
            expect(OccurrenceIndicator.ONE_OR_MORE).toBe('+');
        });
    });

    describe('ITEM_TYPE Wildcard', () => {
        it('should match any single item', () => {
            expect(ITEM_TYPE.isWildcard).toBe(true);
            expect(ITEM_TYPE.name).toBe('item()');
            expect(ITEM_TYPE.matches(42)).toBe(true);
            expect(ITEM_TYPE.matches('hello')).toBe(true);
            expect(ITEM_TYPE.matches(true)).toBe(true);
            expect(ITEM_TYPE.matches(null)).toBe(true);
        });
    });

    describe('Empty Sequence', () => {
        it('should create empty-sequence() type', () => {
            const emptySeq = createEmptySequenceType();
            expect(emptySeq.isEmptySequence()).toBe(true);
            expect(emptySeq.toString()).toBe('empty-sequence()');
            expect(emptySeq.allowsZeroItems()).toBe(true);
            expect(emptySeq.requiresItems()).toBe(false);
        });

        it('should not allow occurrence indicators for empty-sequence', () => {
            expect(() => {
                new SequenceType('empty', OccurrenceIndicator.ZERO_OR_ONE);
            }).toThrow();
        });

        it('should have zero cardinality', () => {
            const emptySeq = createEmptySequenceType();
            expect(emptySeq.getMinCardinality()).toBe(0);
            expect(emptySeq.getMaxCardinality()).toBe(1);
        });
    });

    describe('Item Type Sequences', () => {
        it('should create item() ? - zero or one item', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_ONE);
            expect(seq.toString()).toBe('item()?');
            expect(seq.allowsZeroItems()).toBe(true);
            expect(seq.allowsMultipleItems()).toBe(false);
        });

        it('should create item() * - zero or more items', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_MORE);
            expect(seq.toString()).toBe('item()*');
            expect(seq.allowsZeroItems()).toBe(true);
            expect(seq.allowsMultipleItems()).toBe(true);
        });

        it('should create item() + - one or more items', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ONE_OR_MORE);
            expect(seq.toString()).toBe('item()+');
            expect(seq.allowsZeroItems()).toBe(false);
            expect(seq.allowsMultipleItems()).toBe(true);
        });

        it('should create item() - exactly one item', () => {
            const seq = createItemSequenceType(ITEM_TYPE);
            expect(seq.toString()).toBe('item()');
            expect(seq.allowsZeroItems()).toBe(false);
            expect(seq.allowsMultipleItems()).toBe(false);
            expect(seq.requiresItems()).toBe(true);
        });
    });

    describe('Atomic Type Sequences', () => {
        it('should create xs:integer sequence type', () => {
            const intType = getAtomicType('integer');
            const seq = createAtomicSequenceType(intType!);
            expect(seq.toString()).toMatch('integer');
            expect(seq.allowsZeroItems()).toBe(false);
        });

        it('should create xs:string+ sequence type', () => {
            const strType = getAtomicType('string');
            const seq = createAtomicSequenceType(strType!, OccurrenceIndicator.ONE_OR_MORE);
            expect(seq.toString()).toMatch(/string\+/);
            expect(seq.allowsMultipleItems()).toBe(true);
        });

        it('should create xs:decimal? sequence type', () => {
            const decType = getAtomicType('decimal');
            const seq = createAtomicSequenceType(decType!, OccurrenceIndicator.ZERO_OR_ONE);
            expect(seq.toString()).toMatch(/decimal\?/);
            expect(seq.allowsZeroItems()).toBe(true);
        });
    });

    describe('Cardinality', () => {
        it('should report correct cardinality for exactly one', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.EXACTLY_ONE);
            expect(seq.getMinCardinality()).toBe(1);
            expect(seq.getMaxCardinality()).toBe(1);
        });

        it('should report correct cardinality for zero or one', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_ONE);
            expect(seq.getMinCardinality()).toBe(0);
            expect(seq.getMaxCardinality()).toBe(1);
        });

        it('should report correct cardinality for zero or more', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_MORE);
            expect(seq.getMinCardinality()).toBe(0);
            expect(seq.getMaxCardinality()).toBe(Infinity);
        });

        it('should report correct cardinality for one or more', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ONE_OR_MORE);
            expect(seq.getMinCardinality()).toBe(1);
            expect(seq.getMaxCardinality()).toBe(Infinity);
        });
    });

    describe('KindTest: ElementTest', () => {
        it('should create element() - any element', () => {
            const test = new ElementTest();
            expect(test.name).toBe('element()');
            expect(test.nodeKind).toBe('element');
            expect(test.isWildcardName).toBe(true);
        });

        it('should create element(name) - specific element', () => {
            const test = new ElementTest('book');
            expect(test.name).toBe('element(book)');
            expect(test.nodeName).toBe('book');
        });

        it('should create element(name, type)', () => {
            const test = new ElementTest('book', 'xs:string');
            expect(test.name).toBe('element(book, xs:string)');
            expect(test.nodeName).toBe('book');
            expect(test.nodeType).toBe('xs:string');
        });

        it('should use factory function', () => {
            const test = createElement('title');
            expect(test.nodeName).toBe('title');
        });
    });

    describe('KindTest: AttributeTest', () => {
        it('should create attribute() - any attribute', () => {
            const test = new AttributeTest();
            expect(test.name).toBe('attribute()');
            expect(test.nodeKind).toBe('attribute');
        });

        it('should create attribute(name, type)', () => {
            const test = new AttributeTest('id', 'xs:ID');
            expect(test.name).toBe('attribute(id, xs:ID)');
            expect(test.nodeName).toBe('id');
            expect(test.nodeType).toBe('xs:ID');
        });

        it('should use factory function', () => {
            const test = createAttribute('lang', 'xs:language');
            expect(test.nodeName).toBe('lang');
            expect(test.nodeType).toBe('xs:language');
        });
    });

    describe('KindTest: DocumentNodeTest', () => {
        it('should create document-node()', () => {
            const test = new DocumentNodeTest();
            expect(test.name).toBe('document-node()');
            expect(test.nodeKind).toBe('document');
        });

        it('should create document-node(element(...))', () => {
            const elemTest = new ElementTest('book');
            const test = new DocumentNodeTest(elemTest);
            expect(test.name).toBe('document-node(element(book))');
        });

        it('should use factory function', () => {
            const test = createDocumentNode();
            expect(test.nodeKind).toBe('document');
        });
    });

    describe('KindTest: Other Node Types', () => {
        it('should create text()', () => {
            const test = new TextTest();
            expect(test.name).toBe('text()');
            expect(test.nodeKind).toBe('text');
        });

        it('should create comment()', () => {
            const test = new CommentTest();
            expect(test.name).toBe('comment()');
            expect(test.nodeKind).toBe('comment');
        });

        it('should create processing-instruction()', () => {
            const test = new ProcessingInstructionTest();
            expect(test.name).toBe('processing-instruction()');
        });

        it('should create processing-instruction(target)', () => {
            const test = new ProcessingInstructionTest('php');
            expect(test.name).toBe('processing-instruction(php)');
            expect(test.nodeName).toBe('php');
        });

        it('should use factory for processing-instruction', () => {
            const test = createProcessingInstruction('xml');
            expect(test.nodeName).toBe('xml');
        });
    });

    describe('KindTest: Pre-defined instances', () => {
        it('should have pre-defined KIND_TESTS', () => {
            expect(KIND_TESTS.node).toBeDefined();
            expect(KIND_TESTS.element).toBeDefined();
            expect(KIND_TESTS.attribute).toBeDefined();
            expect(KIND_TESTS.documentNode).toBeDefined();
            expect(KIND_TESTS.text).toBeDefined();
            expect(KIND_TESTS.comment).toBeDefined();
            expect(KIND_TESTS.processingInstruction).toBeDefined();
        });

        it('should use pre-defined tests', () => {
            expect(KIND_TESTS.element.name).toBe('element()');
            expect(KIND_TESTS.attribute.name).toBe('attribute()');
        });
    });

    describe('KindTest: Schema Tests', () => {
        it('should create schema-element(name)', () => {
            const test = new SchemaElementTest('book');
            expect(test.name).toBe('schema-element(book)');
            expect(test.nodeKind).toBe('element');
            expect(test.nodeName).toBe('book');
        });

        it('should create schema-attribute(name)', () => {
            const test = new SchemaAttributeTest('id');
            expect(test.name).toBe('schema-attribute(id)');
            expect(test.nodeKind).toBe('attribute');
            expect(test.nodeName).toBe('id');
        });

        it('should use factory functions', () => {
            const elemTest = createSchemaElement('title');
            const attrTest = createSchemaAttribute('lang');
            expect(elemTest.nodeName).toBe('title');
            expect(attrTest.nodeName).toBe('lang');
        });
    });

    describe('Sequence Matching', () => {
        it('should match empty sequence to empty-sequence()', () => {
            const seq = createEmptySequenceType();
            const result = matchesSequenceType([], seq);
            expect(result.matches).toBe(true);
            expect(result.itemCount).toBe(0);
        });

        it('should not match non-empty to empty-sequence()', () => {
            const seq = createEmptySequenceType();
            const result = matchesSequenceType([42], seq);
            expect(result.matches).toBe(false);
        });

        it('should match single item to item()', () => {
            const seq = createItemSequenceType(ITEM_TYPE);
            expect(matchesSequenceType(42, seq).matches).toBe(true);
            expect(matchesSequenceType('hello', seq).matches).toBe(true);
        });

        it('should not match multiple items to item()', () => {
            const seq = createItemSequenceType(ITEM_TYPE);
            const result = matchesSequenceType([1, 2, 3], seq);
            expect(result.matches).toBe(false);
        });

        it('should match zero or one item to item()?', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_ONE);
            expect(matchesSequenceType([], seq).matches).toBe(true);
            expect(matchesSequenceType(42, seq).matches).toBe(true);
            expect(matchesSequenceType([1, 2], seq).matches).toBe(false);
        });

        it('should match zero or more items to item()*', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_MORE);
            expect(matchesSequenceType([], seq).matches).toBe(true);
            expect(matchesSequenceType(42, seq).matches).toBe(true);
            expect(matchesSequenceType([1, 2, 3], seq).matches).toBe(true);
        });

        it('should match one or more items to item()+', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ONE_OR_MORE);
            expect(matchesSequenceType([], seq).matches).toBe(false);
            expect(matchesSequenceType(42, seq).matches).toBe(true);
            expect(matchesSequenceType([1, 2, 3], seq).matches).toBe(true);
        });

        it('should match undefined as empty sequence', () => {
            const seq = createEmptySequenceType();
            expect(matchesSequenceType(undefined, seq).matches).toBe(true);
        });
    });

    describe('Atomic Type Matching', () => {
        it('should match integer values to xs:integer', () => {
            const intType = getAtomicType('integer');
            const seq = createAtomicSequenceType(intType!);
            expect(matchesSequenceType(42, seq).matches).toBe(true);
        });

        it('should not match string to xs:integer', () => {
            const intType = getAtomicType('integer');
            const seq = createAtomicSequenceType(intType!);
            const result = matchesSequenceType('hello', seq);
            expect(result.matches).toBe(false);
        });

        it('should match multiple integers to xs:integer+', () => {
            const intType = getAtomicType('integer');
            const seq = createAtomicSequenceType(intType!, OccurrenceIndicator.ONE_OR_MORE);
            expect(matchesSequenceType([1, 2, 3], seq).matches).toBe(true);
        });
    });

    describe('Helper Functions', () => {
        it('matchesItemType should check item matching', () => {
            expect(matchesItemType(42, ITEM_TYPE)).toBe(true);
            expect(matchesItemType(undefined, ITEM_TYPE)).toBe(false);
        });

        it('matches should be a boolean shorthand', () => {
            const seq = createEmptySequenceType();
            expect(matches([], seq)).toBe(true);
            expect(matches([1], seq)).toBe(false);
        });

        it('describeSequenceType should create human-readable text', () => {
            const seq1 = createEmptySequenceType();
            expect(describeSequenceType(seq1)).toBe('an empty sequence');

            const seq2 = createItemSequenceType(ITEM_TYPE);
            expect(describeSequenceType(seq2)).toContain('exactly one');

            const seq3 = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_MORE);
            expect(describeSequenceType(seq3)).toContain('zero or more');
        });

        it('toSequence should normalize to array', () => {
            expect(toSequence(42)).toEqual([42]);
            expect(toSequence([1, 2])).toEqual([1, 2]);
            expect(toSequence(undefined)).toEqual([]);
        });

        it('countMatches should count matching items', () => {
            const seq = [1, 'hello', 2, true, 3];
            expect(countMatches(seq, ITEM_TYPE)).toBe(5);
        });

        it('findMismatch should find non-matching item', () => {
            const seq = [1, 2, 3];
            expect(findMismatch(seq, ITEM_TYPE)).toBe(-1); // All match
        });
    });

    describe('Type Compatibility', () => {
        it('should check compatible sequence types', () => {
            // Empty sequence can be assigned to any type that allows zero items
            const seq1 = createEmptySequenceType();
            const seq2 = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_MORE);
            expect(seq2.isCompatibleWith(seq1)).toBe(true);
        });

        it('should compare item types for equivalence', () => {
            const item1 = ITEM_TYPE;
            const item2 = ITEM_TYPE;
            expect(itemTypesEquivalent(item1, item2)).toBe(true);
        });

        it('should compare sequence types for equivalence', () => {
            const seq1 = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_MORE);
            const seq2 = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ZERO_OR_MORE);
            expect(sequenceTypesEquivalent(seq1, seq2)).toBe(true);

            const seq3 = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.ONE_OR_MORE);
            expect(sequenceTypesEquivalent(seq1, seq3)).toBe(false);
        });
    });

    describe('Integration with Atomic Types', () => {
        it('should work with all built-in atomic types', () => {
            const types = ['string', 'boolean', 'integer', 'decimal', 'double'];

            for (const typeName of types) {
                const atomicType = getAtomicType(typeName);
                expect(atomicType).toBeDefined();

                const seq = createAtomicSequenceType(atomicType!);
                expect(seq.toString()).toContain(typeName);
            }
        });

        it('should validate atomic type sequence matching', () => {
            const strType = getAtomicType('string')!;
            const seq = createAtomicSequenceType(strType);

            expect(matchesSequenceType('hello', seq).matches).toBe(true);
            expect(matchesSequenceType(['a', 'b'], seq).matches).toBe(false); // Only one allowed
            expect(matchesSequenceType(42, seq).matches).toBe(false); // Wrong type
        });
    });

    describe('Error Cases', () => {
        it('should provide helpful error messages', () => {
            const seq = createItemSequenceType(ITEM_TYPE, OccurrenceIndicator.EXACTLY_ONE);
            const result = matchesSequenceType([1, 2], seq);
            expect(result.reason).toContain('Expected exactly one');
        });

        it('should handle undefined correctly', () => {
            const seq = createEmptySequenceType();
            const result = matchesSequenceType(undefined, seq);
            expect(result.matches).toBe(true);
        });

        it('should report item count in results', () => {
            const seq = createEmptySequenceType();
            const result = matchesSequenceType([1, 2, 3], seq);
            expect(result.itemCount).toBe(3);
        });
    });
});
