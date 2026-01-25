[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / canPromoteNumeric

# Function: canPromoteNumeric()

> **canPromoteNumeric**(`fromType`, `toType`): `boolean`

Defined in: [types/type-promotion.ts:77](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L77)

Check if one numeric type can be promoted to another
Promotion only goes upward: integer → decimal → float → double

## Parameters

### fromType

[`AtomicType`](../interfaces/AtomicType.md)

The source type

### toType

[`AtomicType`](../interfaces/AtomicType.md)

The target type

## Returns

`boolean`

true if fromType can be promoted to toType
