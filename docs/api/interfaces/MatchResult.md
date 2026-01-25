[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / MatchResult

# Interface: MatchResult

Defined in: [types/sequence-type-matcher.ts:18](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type-matcher.ts#L18)

Result of a sequence type match operation

## Properties

### matches

> **matches**: `boolean`

Defined in: [types/sequence-type-matcher.ts:22](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type-matcher.ts#L22)

Whether the value matches the SequenceType

***

### reason?

> `optional` **reason**: `string`

Defined in: [types/sequence-type-matcher.ts:27](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type-matcher.ts#L27)

If doesn't match, reason why

***

### itemCount?

> `optional` **itemCount**: `number`

Defined in: [types/sequence-type-matcher.ts:32](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type-matcher.ts#L32)

Number of items that matched (useful for debugging)
