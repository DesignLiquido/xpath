[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathNode

# Interface: XPathNode

Defined in: [node.ts:5](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L5)

Represents a DOM-like node interface for XPath evaluation.
This is compatible with browser DOM nodes and can be extended for other implementations.

## Properties

### nodeType

> **nodeType**: `number`

Defined in: [node.ts:6](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L6)

***

### nodeName

> **nodeName**: `string`

Defined in: [node.ts:7](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L7)

***

### localName?

> `optional` **localName**: `string`

Defined in: [node.ts:8](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L8)

***

### namespaceUri?

> `optional` **namespaceUri**: `string`

Defined in: [node.ts:9](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L9)

***

### textContent?

> `optional` **textContent**: `string`

Defined in: [node.ts:10](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L10)

***

### parentNode?

> `optional` **parentNode**: `XPathNode`

Defined in: [node.ts:11](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L11)

***

### childNodes?

> `optional` **childNodes**: `ArrayLike`\<`XPathNode`\>

Defined in: [node.ts:12](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L12)

***

### attributes?

> `optional` **attributes**: `ArrayLike`\<`XPathNode`\>

Defined in: [node.ts:13](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L13)

***

### nextSibling?

> `optional` **nextSibling**: `XPathNode`

Defined in: [node.ts:14](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L14)

***

### previousSibling?

> `optional` **previousSibling**: `XPathNode`

Defined in: [node.ts:15](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L15)

***

### ownerDocument?

> `optional` **ownerDocument**: `XPathNode`

Defined in: [node.ts:16](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L16)

***

### documentElement?

> `optional` **documentElement**: `XPathNode`

Defined in: [node.ts:17](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L17)

***

### target?

> `optional` **target**: `string`

Defined in: [node.ts:18](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L18)

## Methods

### getAttribute()?

> `optional` **getAttribute**(`name`): `string`

Defined in: [node.ts:21](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L21)

#### Parameters

##### name

`string`

#### Returns

`string`

***

### compareDocumentPosition()?

> `optional` **compareDocumentPosition**(`other`): `number`

Defined in: [node.ts:22](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/node.ts#L22)

#### Parameters

##### other

`XPathNode`

#### Returns

`number`
