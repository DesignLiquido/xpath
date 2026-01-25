[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / promoteUntypedToNumeric

# Function: promoteUntypedToNumeric()

> **promoteUntypedToNumeric**(`value`, `targetType`): `number`

Defined in: [types/type-promotion.ts:198](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L198)

Promote untypedAtomic to a numeric type
In numeric contexts, untypedAtomic is promoted to double

## Parameters

### value

`string`

The untyped value (as string)

### targetType

`string`

The target numeric type ('decimal', 'float', 'double', or 'integer')

## Returns

`number`

The promoted numeric value

## Throws

Error if the value cannot be converted to the target type
