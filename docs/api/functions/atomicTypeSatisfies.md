[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / atomicTypeSatisfies

# Function: atomicTypeSatisfies()

> **atomicTypeSatisfies**(`atomicType`, `sequenceType`): `boolean`

Defined in: [types/sequence-type-matcher.ts:200](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type-matcher.ts#L200)

Check if an AtomicType satisfies a SequenceType's ItemType
(useful for static type checking)

## Parameters

### atomicType

[`AtomicType`](../interfaces/AtomicType.md)

The atomic type to check

### sequenceType

[`SequenceType`](../classes/SequenceType.md)

The sequence type to match against

## Returns

`boolean`

true if the atomic type satisfies the sequence type's item type
