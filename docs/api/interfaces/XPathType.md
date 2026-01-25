[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathType

# Interface: XPathType

Defined in: [xpath-version.ts:143](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L143)

XPath 2.0+ type system support (placeholder for future implementation).

## Properties

### name

> **name**: `string`

Defined in: [xpath-version.ts:147](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L147)

Type name (e.g., 'xs:string', 'xs:integer', 'node()', 'item()')

***

### category

> **category**: `"function"` \| `"node"` \| `"atomic"` \| `"sequence"`

Defined in: [xpath-version.ts:152](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L152)

Type category

***

### optional?

> `optional` **optional**: `boolean`

Defined in: [xpath-version.ts:157](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L157)

Whether this type accepts empty sequences

***

### cardinality?

> `optional` **cardinality**: `"one"` \| `"zero-or-one"` \| `"zero-or-more"` \| `"one-or-more"`

Defined in: [xpath-version.ts:166](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L166)

Cardinality indicator
- 'one': exactly one
- 'zero-or-one': ? 
- 'zero-or-more': *
- 'one-or-more': +
