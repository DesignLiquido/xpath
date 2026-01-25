[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / OccurrenceIndicator

# Enumeration: OccurrenceIndicator

Defined in: [types/sequence-type.ts:22](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L22)

OccurrenceIndicator specifies cardinality of items in a sequence

## Enumeration Members

### EXACTLY\_ONE

> **EXACTLY\_ONE**: `"ONE"`

Defined in: [types/sequence-type.ts:27](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L27)

Exactly one item (no indicator)
Cardinality: exactly 1

***

### ZERO\_OR\_ONE

> **ZERO\_OR\_ONE**: `"?"`

Defined in: [types/sequence-type.ts:33](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L33)

Zero or one item (?)
Cardinality: 0 or 1

***

### ZERO\_OR\_MORE

> **ZERO\_OR\_MORE**: `"*"`

Defined in: [types/sequence-type.ts:39](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L39)

Zero or more items (*)
Cardinality: 0 or more

***

### ONE\_OR\_MORE

> **ONE\_OR\_MORE**: `"+"`

Defined in: [types/sequence-type.ts:45](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L45)

One or more items (+)
Cardinality: 1 or more
