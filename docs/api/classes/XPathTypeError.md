[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathTypeError

# Class: XPathTypeError

Defined in: [errors.ts:86](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L86)

Type error - type mismatch or type constraint violation
Subclass of dynamic error per spec

## Extends

- [`XPathDynamicError`](XPathDynamicError.md)

## Constructors

### Constructor

> **new XPathTypeError**(`code`, `message`): `XPathTypeError`

Defined in: [errors.ts:87](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L87)

#### Parameters

##### code

`string`

##### message

`string`

#### Returns

`XPathTypeError`

#### Overrides

[`XPathDynamicError`](XPathDynamicError.md).[`constructor`](XPathDynamicError.md#constructor)

## Properties

### code

> **code**: `string`

Defined in: [errors.ts:21](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L21)

#### Inherited from

[`XPathDynamicError`](XPathDynamicError.md).[`code`](XPathDynamicError.md#code)

***

### isStatic

> **isStatic**: `boolean`

Defined in: [errors.ts:22](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L22)

#### Inherited from

[`XPathDynamicError`](XPathDynamicError.md).[`isStatic`](XPathDynamicError.md#isstatic)

***

### isDynamic

> **isDynamic**: `boolean`

Defined in: [errors.ts:23](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L23)

#### Inherited from

[`XPathDynamicError`](XPathDynamicError.md).[`isDynamic`](XPathDynamicError.md#isdynamic)

## Methods

### getQName()

> **getQName**(): `string`

Defined in: [errors.ts:46](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L46)

Get qualified error QName (e.g., "err:XPST0001")

#### Returns

`string`

#### Inherited from

[`XPathDynamicError`](XPathDynamicError.md).[`getQName`](XPathDynamicError.md#getqname)

***

### getErrorURI()

> **getErrorURI**(): `string`

Defined in: [errors.ts:53](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L53)

Get error URI for namespace

#### Returns

`string`

#### Inherited from

[`XPathDynamicError`](XPathDynamicError.md).[`getErrorURI`](XPathDynamicError.md#geterroruri)
