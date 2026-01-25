[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / promoteToString

# Function: promoteToString()

> **promoteToString**(`value`, `fromType`): `string`

Defined in: [types/type-promotion.ts:177](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L177)

Promote a value to string
Used for anyURI → string and untypedAtomic → string promotions

## Parameters

### value

`any`

The value to promote

### fromType

`string`

The source type name

## Returns

`string`

The string value

## Throws

Error if promotion is not allowed
