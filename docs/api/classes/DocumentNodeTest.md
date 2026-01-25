[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / DocumentNodeTest

# Class: DocumentNodeTest

Defined in: [types/kind-tests.ts:135](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L135)

DocumentNodeTest: document-node() or document-node(element(...))

Matches the document node (root). Can optionally specify a required element test.

Examples:
  - document-node() - any document node
  - document-node(element(book)) - document containing a "book" element
  - document-node(element()) - document containing any root element

## Extends

- `KindTestImpl`

## Constructors

### Constructor

> **new DocumentNodeTest**(`elementTest?`): `DocumentNodeTest`

Defined in: [types/kind-tests.ts:138](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L138)

#### Parameters

##### elementTest?

[`ElementTest`](ElementTest.md)

#### Returns

`DocumentNodeTest`

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

Defined in: [types/kind-tests.ts:144](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/kind-tests.ts#L144)

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Overrides

`KindTestImpl.matches`
