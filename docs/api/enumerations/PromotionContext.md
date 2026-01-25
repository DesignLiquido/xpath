[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / PromotionContext

# Enumeration: PromotionContext

Defined in: [types/type-promotion.ts:216](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L216)

Promotion context enum
Different contexts apply different promotion rules

## Enumeration Members

### ARITHMETIC

> **ARITHMETIC**: `"arithmetic"`

Defined in: [types/type-promotion.ts:220](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L220)

Arithmetic context: untypedAtomic → double, numeric types promoted

***

### COMPARISON

> **COMPARISON**: `"comparison"`

Defined in: [types/type-promotion.ts:225](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L225)

Comparison context: untypedAtomic → string or double depending on comparison

***

### STRING

> **STRING**: `"string"`

Defined in: [types/type-promotion.ts:230](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L230)

String context: everything converts to string

***

### BOOLEAN

> **BOOLEAN**: `"boolean"`

Defined in: [types/type-promotion.ts:235](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/type-promotion.ts#L235)

Boolean context: Effective Boolean Value
