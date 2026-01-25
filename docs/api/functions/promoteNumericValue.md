[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / promoteNumericValue

# Function: promoteNumericValue()

> **promoteNumericValue**(`value`, `fromType`, `toType`): `any`

Defined in: [types/type-promotion.ts:99](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L99)

Promote a numeric value from one type to another
Follows XPath 2.0 type promotion rules

## Parameters

### value

`any`

The value to promote (should already be validated as fromType)

### fromType

`string`

The source type name

### toType

`string`

The target type name

## Returns

`any`

The promoted value (or the original value if types match)

## Throws

Error if promotion is not allowed
