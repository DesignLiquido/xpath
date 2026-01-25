[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / KindTest

# Interface: KindTest

Defined in: [types/sequence-type.ts:83](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L83)

KindTest represents tests for specific node kinds
Used in path expressions and sequence types

## Extends

- [`ItemType`](ItemType.md)

## Properties

### name

> `readonly` **name**: `string`

Defined in: [types/sequence-type.ts:56](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L56)

Human-readable name of the item type

#### Inherited from

[`ItemType`](ItemType.md).[`name`](ItemType.md#name)

***

### namespace?

> `readonly` `optional` **namespace**: `string`

Defined in: [types/sequence-type.ts:66](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L66)

Get the type's namespace URI (if applicable)

#### Inherited from

[`ItemType`](ItemType.md).[`namespace`](ItemType.md#namespace)

***

### isWildcard?

> `readonly` `optional` **isWildcard**: `boolean`

Defined in: [types/sequence-type.ts:71](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L71)

Indicates if this is a wildcard match (matches any item)

#### Inherited from

[`ItemType`](ItemType.md).[`isWildcard`](ItemType.md#iswildcard)

***

### atomicType?

> `readonly` `optional` **atomicType**: [`AtomicType`](AtomicType.md)

Defined in: [types/sequence-type.ts:76](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L76)

For atomic types, reference to the AtomicType

#### Inherited from

[`ItemType`](ItemType.md).[`atomicType`](ItemType.md#atomictype)

***

### nodeKind

> `readonly` **nodeKind**: `string`

Defined in: [types/sequence-type.ts:88](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L88)

The node kind being tested
Possible values: 'element', 'attribute', 'text', 'comment', 'processing-instruction', 'document-node'

***

### nodeName?

> `readonly` `optional` **nodeName**: `string`

Defined in: [types/sequence-type.ts:93](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L93)

Optional name constraint for the node

***

### nodeType?

> `readonly` `optional` **nodeType**: `string`

Defined in: [types/sequence-type.ts:98](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L98)

Optional type constraint for the node

***

### isWildcardName?

> `readonly` `optional` **isWildcardName**: `boolean`

Defined in: [types/sequence-type.ts:103](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L103)

Indicates if name is a wildcard (*)

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

#### Inherited from

[`ItemType`](ItemType.md).[`matches`](ItemType.md#matches)
