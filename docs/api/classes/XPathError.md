[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathError

# Class: XPathError

Defined in: [errors.ts:20](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L20)

Base error class for all XPath errors

## Extends

- `Error`

## Extended by

- [`XPathStaticError`](XPathStaticError.md)
- [`XPathDynamicError`](XPathDynamicError.md)

## Constructors

### Constructor

> **new XPathError**(`code`, `message`, `isStatic`, `isDynamic`): `XPathError`

Defined in: [errors.ts:25](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L25)

#### Parameters

##### code

`string`

##### message

`string`

##### isStatic

`boolean` = `false`

##### isDynamic

`boolean` = `false`

#### Returns

`XPathError`

#### Overrides

`Error.constructor`

## Properties

### code

> **code**: `string`

Defined in: [errors.ts:21](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L21)

***

### isStatic

> **isStatic**: `boolean`

Defined in: [errors.ts:22](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L22)

***

### isDynamic

> **isDynamic**: `boolean`

Defined in: [errors.ts:23](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L23)

## Methods

### getQName()

> **getQName**(): `string`

Defined in: [errors.ts:46](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L46)

Get qualified error QName (e.g., "err:XPST0001")

#### Returns

`string`

***

### getErrorURI()

> **getErrorURI**(): `string`

Defined in: [errors.ts:53](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/errors.ts#L53)

Get error URI for namespace

#### Returns

`string`
