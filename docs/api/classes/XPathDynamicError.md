[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathDynamicError

# Class: XPathDynamicError

Defined in: [errors.ts:74](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L74)

Dynamic error - detected during expression evaluation
Can be caught by try-catch in XPath expressions

## Extends

- [`XPathError`](XPathError.md)

## Extended by

- [`XPathTypeError`](XPathTypeError.md)

## Constructors

### Constructor

> **new XPathDynamicError**(`code`, `message`): `XPathDynamicError`

Defined in: [errors.ts:75](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L75)

#### Parameters

##### code

`string`

##### message

`string`

#### Returns

`XPathDynamicError`

#### Overrides

[`XPathError`](XPathError.md).[`constructor`](XPathError.md#constructor)

## Properties

### code

> **code**: `string`

Defined in: [errors.ts:21](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L21)

#### Inherited from

[`XPathError`](XPathError.md).[`code`](XPathError.md#code)

***

### isStatic

> **isStatic**: `boolean`

Defined in: [errors.ts:22](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L22)

#### Inherited from

[`XPathError`](XPathError.md).[`isStatic`](XPathError.md#isstatic)

***

### isDynamic

> **isDynamic**: `boolean`

Defined in: [errors.ts:23](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L23)

#### Inherited from

[`XPathError`](XPathError.md).[`isDynamic`](XPathError.md#isdynamic)

## Methods

### getQName()

> **getQName**(): `string`

Defined in: [errors.ts:46](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L46)

Get qualified error QName (e.g., "err:XPST0001")

#### Returns

`string`

#### Inherited from

[`XPathError`](XPathError.md).[`getQName`](XPathError.md#getqname)

***

### getErrorURI()

> **getErrorURI**(): `string`

Defined in: [errors.ts:53](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L53)

Get error URI for namespace

#### Returns

`string`

#### Inherited from

[`XPathError`](XPathError.md).[`getErrorURI`](XPathError.md#geterroruri)
