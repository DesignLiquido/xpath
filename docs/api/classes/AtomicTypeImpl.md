[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / AtomicTypeImpl

# Abstract Class: AtomicTypeImpl

Defined in: [types/base.ts:33](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L33)

Abstract base implementation for atomic types

## Extended by

- [`AnyAtomicTypeImpl`](AnyAtomicTypeImpl.md)
- [`UntypedAtomicImpl`](UntypedAtomicImpl.md)
- [`StringTypeImpl`](StringTypeImpl.md)
- [`BooleanTypeImpl`](BooleanTypeImpl.md)
- [`DecimalTypeImpl`](DecimalTypeImpl.md)
- [`FloatTypeImpl`](FloatTypeImpl.md)
- [`DoubleTypeImpl`](DoubleTypeImpl.md)
- [`IntegerTypeImpl`](IntegerTypeImpl.md)
- [`DurationTypeImpl`](DurationTypeImpl.md)
- [`DateTimeTypeImpl`](DateTimeTypeImpl.md)
- [`DateTypeImpl`](DateTypeImpl.md)
- [`TimeTypeImpl`](TimeTypeImpl.md)
- [`GYearMonthTypeImpl`](GYearMonthTypeImpl.md)
- [`GYearTypeImpl`](GYearTypeImpl.md)
- [`GMonthDayTypeImpl`](GMonthDayTypeImpl.md)
- [`GDayTypeImpl`](GDayTypeImpl.md)
- [`GMonthTypeImpl`](GMonthTypeImpl.md)
- [`HexBinaryTypeImpl`](HexBinaryTypeImpl.md)
- [`Base64BinaryTypeImpl`](Base64BinaryTypeImpl.md)

## Implements

- [`AtomicType`](../interfaces/AtomicType.md)

## Constructors

### Constructor

> **new AtomicTypeImpl**(`name`, `namespace`, `baseType?`, `primitive?`): `AtomicTypeImpl`

Defined in: [types/base.ts:34](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L34)

#### Parameters

##### name

`string`

##### namespace

`string` = `XS_NAMESPACE`

##### baseType?

[`AtomicType`](../interfaces/AtomicType.md)

##### primitive?

[`AtomicType`](../interfaces/AtomicType.md)

#### Returns

`AtomicTypeImpl`

## Properties

### name

> `readonly` **name**: `string`

Defined in: [types/base.ts:35](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L35)

#### Implementation of

[`AtomicType`](../interfaces/AtomicType.md).[`name`](../interfaces/AtomicType.md#name)

***

### namespace

> `readonly` **namespace**: `string` = `XS_NAMESPACE`

Defined in: [types/base.ts:36](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L36)

#### Implementation of

[`AtomicType`](../interfaces/AtomicType.md).[`namespace`](../interfaces/AtomicType.md#namespace)

***

### baseType?

> `readonly` `optional` **baseType**: [`AtomicType`](../interfaces/AtomicType.md)

Defined in: [types/base.ts:37](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L37)

#### Implementation of

[`AtomicType`](../interfaces/AtomicType.md).[`baseType`](../interfaces/AtomicType.md#basetype)

***

### primitive?

> `readonly` `optional` **primitive**: [`AtomicType`](../interfaces/AtomicType.md)

Defined in: [types/base.ts:38](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L38)

#### Implementation of

[`AtomicType`](../interfaces/AtomicType.md).[`primitive`](../interfaces/AtomicType.md#primitive)

## Accessors

### qualifiedName

#### Get Signature

> **get** **qualifiedName**(): `string`

Defined in: [types/base.ts:44](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L44)

##### Returns

`string`

## Methods

### validate()

> `abstract` **validate**(`value`): `boolean`

Defined in: [types/base.ts:41](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L41)

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Implementation of

[`AtomicType`](../interfaces/AtomicType.md).[`validate`](../interfaces/AtomicType.md#validate)

***

### cast()

> `abstract` **cast**(`value`): `any`

Defined in: [types/base.ts:42](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/base.ts#L42)

#### Parameters

##### value

`any`

#### Returns

`any`

#### Implementation of

[`AtomicType`](../interfaces/AtomicType.md).[`cast`](../interfaces/AtomicType.md#cast)
