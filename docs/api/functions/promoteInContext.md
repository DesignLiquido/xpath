[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / promoteInContext

# Function: promoteInContext()

> **promoteInContext**(`value`, `fromType`, `context`, `targetType?`): `object`

Defined in: [types/type-promotion.ts:248](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L248)

Apply type promotion in a specific context
Used by operators to normalize operand types

## Parameters

### value

`any`

The value to promote

### fromType

`string`

Current type name

### context

[`PromotionContext`](../enumerations/PromotionContext.md)

The promotion context

### targetType?

`string`

Optional explicit target type

## Returns

`object`

- The promoted value and resulting type

### value

> **value**: `any`

### type

> **type**: `string`
