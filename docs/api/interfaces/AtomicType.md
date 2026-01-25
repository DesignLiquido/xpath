[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / AtomicType

# Interface: AtomicType

Defined in: [types/base.ts:11](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L11)

Base interface for all atomic types

## Properties

### name

> `readonly` **name**: `string`

Defined in: [types/base.ts:12](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L12)

***

### namespace

> `readonly` **namespace**: `string`

Defined in: [types/base.ts:13](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L13)

***

### baseType?

> `readonly` `optional` **baseType**: `AtomicType`

Defined in: [types/base.ts:14](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L14)

***

### primitive?

> `readonly` `optional` **primitive**: `AtomicType`

Defined in: [types/base.ts:15](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L15)

## Methods

### validate()

> **validate**(`value`): `boolean`

Defined in: [types/base.ts:16](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L16)

#### Parameters

##### value

`any`

#### Returns

`boolean`

***

### cast()

> **cast**(`value`): `any`

Defined in: [types/base.ts:17](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L17)

#### Parameters

##### value

`any`

#### Returns

`any`
