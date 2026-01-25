[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XSLTExtensions

# Interface: XSLTExtensions

Defined in: [xslt-extensions.ts:61](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L61)

XSLT Extensions bundle that can be passed to the XPath parser.

This interface allows the xslt-processor package to provide XSLT-specific
functions while keeping the xpath library pure XPath 1.0.

## Properties

### functions

> **functions**: [`XSLTFunctionMetadata`](XSLTFunctionMetadata.md)[]

Defined in: [xslt-extensions.ts:65](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L65)

List of XSLT extension functions to register.

***

### version

> **version**: `"1.0"` \| `"2.0"` \| `"3.0"`

Defined in: [xslt-extensions.ts:70](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L70)

XSLT version these extensions implement.

***

### contextExtensions?

> `optional` **contextExtensions**: `object`

Defined in: [xslt-extensions.ts:76](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L76)

Optional: Additional context properties needed by XSLT functions.
For example, key definitions for key() function, or document cache for document().

#### keys?

> `optional` **keys**: `Record`\<`string`, \{ `match`: `string`; `use`: `string`; \}\>

Key definitions from <xsl:key> elements.
Format: { keyName: { match: string, use: string } }

#### documentLoader()?

> `optional` **documentLoader**: (`uri`, `baseUri?`) => [`XPathNode`](XPathNode.md)

Document loader for document() function.

##### Parameters

###### uri

`string`

###### baseUri?

`string`

##### Returns

[`XPathNode`](XPathNode.md)

#### decimalFormats?

> `optional` **decimalFormats**: `Record`\<`string`, `any`\>

Decimal format definitions from <xsl:decimal-format> elements.
Used by format-number() function.

#### systemProperties?

> `optional` **systemProperties**: `Record`\<`string`, `string`\>

System properties for system-property() function.
