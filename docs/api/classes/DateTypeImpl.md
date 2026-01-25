[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / DateTypeImpl

# Class: DateTypeImpl

Defined in: [types/datetime-types.ts:128](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L128)

xs:date - date values (year-month-day)

## Extends

- [`AtomicTypeImpl`](AtomicTypeImpl.md)

## Constructors

### Constructor

> **new DateTypeImpl**(`baseType`, `primitive`): `DateTypeImpl`

Defined in: [types/datetime-types.ts:129](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L129)

#### Parameters

##### baseType

[`AtomicType`](../interfaces/AtomicType.md)

##### primitive

[`AtomicType`](../interfaces/AtomicType.md)

#### Returns

`DateTypeImpl`

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

Defined in: [types/datetime-types.ts:133](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L133)

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Overrides

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`validate`](AtomicTypeImpl.md#validate)

***

### cast()

> **cast**(`value`): `Date`

Defined in: [types/datetime-types.ts:137](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L137)

#### Parameters

##### value

`any`

#### Returns

`Date`

#### Overrides

[`AtomicTypeImpl`](AtomicTypeImpl.md).[`cast`](AtomicTypeImpl.md#cast)
