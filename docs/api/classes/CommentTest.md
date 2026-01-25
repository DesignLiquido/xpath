[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / CommentTest

# Class: CommentTest

Defined in: [types/kind-tests.ts:170](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L170)

CommentTest: comment() - matches comment nodes

## Extends

- `KindTestImpl`

## Constructors

### Constructor

> **new CommentTest**(): `CommentTest`

Defined in: [types/kind-tests.ts:171](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L171)

#### Returns

`CommentTest`

#### Overrides

`KindTestImpl.constructor`

## Properties

### name

> `readonly` **name**: `string`

Defined in: [types/kind-tests.ts:23](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L23)

Human-readable name of the item type

#### Inherited from

`KindTestImpl.name`

***

### nodeKind

> `readonly` **nodeKind**: `string`

Defined in: [types/kind-tests.ts:24](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L24)

The node kind being tested
Possible values: 'element', 'attribute', 'text', 'comment', 'processing-instruction', 'document-node'

#### Inherited from

`KindTestImpl.nodeKind`

***

### nodeName?

> `readonly` `optional` **nodeName**: `string`

Defined in: [types/kind-tests.ts:25](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L25)

Optional name constraint for the node

#### Inherited from

`KindTestImpl.nodeName`

***

### nodeType?

> `readonly` `optional` **nodeType**: `string`

Defined in: [types/kind-tests.ts:26](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L26)

Optional type constraint for the node

#### Inherited from

`KindTestImpl.nodeType`

***

### isWildcardName?

> `readonly` `optional` **isWildcardName**: `boolean`

Defined in: [types/kind-tests.ts:27](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L27)

Indicates if name is a wildcard (*)

#### Inherited from

`KindTestImpl.isWildcardName`

## Methods

### matches()

> **matches**(`value`): `boolean`

Defined in: [types/kind-tests.ts:43](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L43)

Check if a value matches this ItemType

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Inherited from

`KindTestImpl.matches`
