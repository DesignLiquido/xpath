/**
 * Union Types Tests (XPath 3.1 Extension)
 *
 * Tests union type declarations for more expressive type constraints.
 * A union type matches a value if it matches ANY of the member types.
 */

import { UnionItemType, createUnionType, isUnionType } from '../src/types/union-type';
import { getAtomicType } from '../src/types';
import { ItemType } from '../src/types/sequence-type';
import { XPath31Parser } from '../src/parser/parser-31';
import { XPathLexer } from '../src/lexer/lexer';
import { XPathContext } from '../src/context';

// Helper function to create ItemType from atomic type name
function createAtomicItemType(typeName: string): ItemType {
    const atomicType = getAtomicType(typeName);
    if (!atomicType) {
        throw new Error(`Unknown atomic type: ${typeName}`);
    }

    return {
        name: `xs:${atomicType.name}`,
        namespace: atomicType.namespace,
        atomicType: atomicType,
        matches: (value: any) => {
            if (value === null || value === undefined) return false;
            try {
                return atomicType.validate(value);
            } catch {
                return false;
            }
        },
    };
}

describe('Union Types - Core Functionality', () => {
    describe('UnionItemType Creation', () => {
        it('should create a union type with two members', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');

            const unionType = createUnionType(stringType, integerType);

            expect(unionType).toBeInstanceOf(UnionItemType);
            expect(unionType.name).toBe('xs:string | xs:integer');
            expect(unionType.getMemberTypes()).toHaveLength(2);
        });

        it('should create a union type with three members', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const booleanType = createAtomicItemType('boolean');

            const unionType = createUnionType(stringType, integerType, booleanType);

            expect(unionType.getMemberTypes()).toHaveLength(3);
            expect(unionType.name).toBe('xs:string | xs:integer | xs:boolean');
        });

        it('should throw error for empty union type', () => {
            expect(() => createUnionType()).toThrow('at least one member type');
        });

        it('should throw error for single-member union type', () => {
            const stringType = createAtomicItemType('string');
            expect(() => createUnionType(stringType)).toThrow('at least two member types');
        });

        it('should identify union types correctly', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            expect(isUnionType(unionType)).toBe(true);
            expect(isUnionType(stringType)).toBe(false);
        });
    });

    describe('UnionItemType Type Matching', () => {
        it('should match string values against string|integer union', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            expect(unionType.matches('hello')).toBe(true);
        });

        it('should match integer values against string|integer union', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            expect(unionType.matches(42)).toBe(true);
        });

        it('should not match boolean against string|integer union', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            expect(unionType.matches(true)).toBe(false);
        });

        it('should handle complex type matching', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const decimalType = createAtomicItemType('decimal');
            const unionType = createUnionType(stringType, integerType, decimalType);

            expect(unionType.matches('test')).toBe(true);
            expect(unionType.matches(123)).toBe(true);
            expect(unionType.matches(123.45)).toBe(true);
            expect(unionType.matches(true)).toBe(false);
        });
    });

    describe('UnionItemType Utility Methods', () => {
        it('should check if union contains a specific type', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            expect(unionType.containsType('xs:string')).toBe(true);
            expect(unionType.containsType('xs:integer')).toBe(true);
            expect(unionType.containsType('xs:boolean')).toBe(false);
        });

        it('should flatten nested unions', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const booleanType = createAtomicItemType('boolean');

            // Create (string | integer) | boolean
            const innerUnion = createUnionType(stringType, integerType);
            const outerUnion = createUnionType(innerUnion, booleanType);

            const flattened = outerUnion.flatten();

            expect(flattened.getMemberTypes()).toHaveLength(3);
            expect(flattened.containsType('xs:string')).toBe(true);
            expect(flattened.containsType('xs:integer')).toBe(true);
            expect(flattened.containsType('xs:boolean')).toBe(true);
        });

        it('should remove duplicate types when flattening', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const stringType2 = createAtomicItemType('string'); // Duplicate

            const union1 = createUnionType(stringType, integerType);
            const union2 = createUnionType(union1, stringType2);

            const flattened = union2.flatten();

            expect(flattened.getMemberTypes()).toHaveLength(2); // Only string and integer
        });

        it('should get most general atomic type', () => {
            const integerType = createAtomicItemType('integer');
            const decimalType = createAtomicItemType('decimal');
            const unionType = createUnionType(integerType, decimalType);

            const mostGeneral = unionType.getMostGeneralAtomicType();

            expect(mostGeneral).toBeDefined();
            expect(mostGeneral?.name).toBe('decimal'); // decimal is more general than integer
        });

        it('should return string as most general type when present', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            const mostGeneral = unionType.getMostGeneralAtomicType();

            expect(mostGeneral?.name).toBe('string');
        });
    });

    describe('UnionItemType String Representation', () => {
        it('should produce correct string representation', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            expect(unionType.toString()).toBe('xs:string | xs:integer');
        });
    });
});

describe('Union Types - Parser Integration', () => {
    const parser = new XPath31Parser();
    const lexer = new XPathLexer('3.1');

    // Note: Full integration with instance of expressions requires parser changes
    // for handling parenthesized union types. Current tests focus on core functionality.

    describe('Union Type Core Functionality', () => {
        it('should match values through union types directly', () => {
            const stringType = createAtomicItemType('string');
            const integerType = createAtomicItemType('integer');
            const unionType = createUnionType(stringType, integerType);

            expect(unionType.matches('hello')).toBe(true);
            expect(unionType.matches(42)).toBe(true);
            expect(unionType.matches(true)).toBe(false);
        });
    });
});

describe('Union Types - Type Promotion', () => {
    describe('Numeric Type Promotion in Unions', () => {
        it('should promote integer to decimal in union context', () => {
            const integerType = createAtomicItemType('integer');
            const decimalType = createAtomicItemType('decimal');
            const unionType = createUnionType(integerType, decimalType);

            // Integer value should match union
            expect(unionType.matches(42)).toBe(true);

            // Decimal value should match union
            expect(unionType.matches(42.5)).toBe(true);
        });

        it('should handle double in numeric unions', () => {
            const integerType = createAtomicItemType('integer');
            const doubleType = createAtomicItemType('double');
            const unionType = createUnionType(integerType, doubleType);

            expect(unionType.matches(42)).toBe(true);
            expect(unionType.matches(42.5)).toBe(true);
            expect(unionType.matches(Infinity)).toBe(true);
        });
    });
});

describe('Union Types - Error Handling', () => {
    describe('Invalid Union Type Constructions', () => {
        it('should reject empty-sequence in union types when created directly', () => {
            const { createEmptySequenceType } = require('../src/types/sequence-type');
            const emptySeq = createEmptySequenceType();

            // The union type constructor will receive the 'empty' ItemType
            expect(() => {
                createUnionType(emptySeq.getItemType() as any, createAtomicItemType('string'));
            }).toThrow();
        });
    });
});

