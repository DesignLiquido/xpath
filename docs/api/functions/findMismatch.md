[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / findMismatch

# Function: findMismatch()

> **findMismatch**(`sequence`, `itemType`): `number`

Defined in: [types/sequence-type-matcher.ts:181](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type-matcher.ts#L181)

Find the first item in a sequence that doesn't match an ItemType

## Parameters

### sequence

`any`[]

Array of values

### itemType

[`ItemType`](../interfaces/ItemType.md)

The ItemType to match against

## Returns

`number`

Index of non-matching item, or -1 if all match
