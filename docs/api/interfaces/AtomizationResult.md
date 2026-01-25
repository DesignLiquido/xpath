[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / AtomizationResult

# Interface: AtomizationResult

Defined in: [types/atomization.ts:22](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/atomization.ts#L22)

Result of atomization

## Properties

### values

> **values**: `any`[]

Defined in: [types/atomization.ts:26](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/atomization.ts#L26)

The atomized value(s) - always an array

***

### type

> **type**: [`AtomicType`](AtomicType.md)

Defined in: [types/atomization.ts:31](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/atomization.ts#L31)

The type of the atomized value(s)

***

### isEmpty

> **isEmpty**: `boolean`

Defined in: [types/atomization.ts:36](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/atomization.ts#L36)

Whether this is an empty sequence

***

### error?

> `optional` **error**: `string`

Defined in: [types/atomization.ts:41](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/atomization.ts#L41)

Error code if atomization failed (e.g., 'FOTY0012')
