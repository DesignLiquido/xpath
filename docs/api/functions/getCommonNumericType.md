[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / getCommonNumericType

# Function: getCommonNumericType()

> **getCommonNumericType**(`type1`, `type2`): [`AtomicType`](../interfaces/AtomicType.md)

Defined in: [types/type-promotion.ts:139](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L139)

Get the common type for two numeric types
Returns the higher type in the hierarchy

## Parameters

### type1

[`AtomicType`](../interfaces/AtomicType.md)

First type

### type2

[`AtomicType`](../interfaces/AtomicType.md)

Second type

## Returns

[`AtomicType`](../interfaces/AtomicType.md)

The common type, or undefined if not both numeric
