[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / ItemType

# Interface: ItemType

Defined in: [types/sequence-type.ts:52](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L52)

ItemType represents the type of individual items in a sequence
Can be: atomic types, node types, or item()

## Extended by

- [`KindTest`](KindTest.md)

## Properties

### name

> `readonly` **name**: `string`

Defined in: [types/sequence-type.ts:56](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L56)

Human-readable name of the item type

***

### namespace?

> `readonly` `optional` **namespace**: `string`

Defined in: [types/sequence-type.ts:66](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L66)

Get the type's namespace URI (if applicable)

***

### isWildcard?

> `readonly` `optional` **isWildcard**: `boolean`

Defined in: [types/sequence-type.ts:71](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L71)

Indicates if this is a wildcard match (matches any item)

***

### atomicType?

> `readonly` `optional` **atomicType**: [`AtomicType`](AtomicType.md)

Defined in: [types/sequence-type.ts:76](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L76)

For atomic types, reference to the AtomicType

## Methods

### matches()

> **matches**(`value`): `boolean`

Defined in: [types/sequence-type.ts:61](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L61)

Check if a value matches this ItemType

#### Parameters

##### value

`any`

#### Returns

`boolean`
