[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / DurationTypeImpl

# Class: DurationTypeImpl

Defined in: [types/datetime-types.ts:79](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L79)

xs:duration - duration values

## Extends

- [`AtomicTypeImpl`](AtomicTypeImpl.md)

## Constructors

### Constructor

> **new DurationTypeImpl**(`baseType`): `DurationTypeImpl`

Defined in: [types/datetime-types.ts:80](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L80)

#### Parameters

##### baseType

[`AtomicType`](../interfaces/AtomicType.md)

#### Returns

`DurationTypeImpl`

#### Overrides

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`constructor`](AtomicTypeImpl.md#constructor)

## Properties

### name

> `readonly` **name**: `string`

Defined in: [types/base.ts:35](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L35)

#### Inherited from

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`name`](AtomicTypeImpl.md#name)

***

### namespace

> `readonly` **namespace**: `string` = `XS_NAMESPACE`

Defined in: [types/base.ts:36](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L36)

#### Inherited from

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`namespace`](AtomicTypeImpl.md#namespace)

***

### baseType?

> `readonly` `optional` **baseType**: [`AtomicType`](../interfaces/AtomicType.md)

Defined in: [types/base.ts:37](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L37)

#### Inherited from

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`baseType`](AtomicTypeImpl.md#basetype)

***

### primitive?

> `readonly` `optional` **primitive**: [`AtomicType`](../interfaces/AtomicType.md)

Defined in: [types/base.ts:38](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L38)

#### Inherited from

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`primitive`](AtomicTypeImpl.md#primitive)

## Accessors

### qualifiedName

#### Get Signature

> **get** **qualifiedName**(): `string`

Defined in: [types/base.ts:44](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L44)

##### Returns

`string`

#### Inherited from

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`qualifiedName`](AtomicTypeImpl.md#qualifiedname)

## Methods

### validate()

> **validate**(`value`): `boolean`

Defined in: [types/datetime-types.ts:84](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L84)

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Overrides

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`validate`](AtomicTypeImpl.md#validate)

***

### cast()

> **cast**(`value`): `any`

Defined in: [types/datetime-types.ts:91](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L91)

#### Parameters

##### value

`any`

#### Returns

`any`

#### Overrides

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`cast`](AtomicTypeImpl.md#cast)
