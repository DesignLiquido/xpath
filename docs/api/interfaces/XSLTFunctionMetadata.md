[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XSLTFunctionMetadata

# Interface: XSLTFunctionMetadata

Defined in: [xslt-extensions.ts:27](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L27)

Metadata for an XSLT extension function.

## Properties

### name

> **name**: `string`

Defined in: [xslt-extensions.ts:32](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L32)

Function name as it appears in XPath expressions.
Examples: 'document', 'key', 'format-number'

***

### minArgs

> **minArgs**: `number`

Defined in: [xslt-extensions.ts:37](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L37)

Minimum number of required arguments.

***

### maxArgs?

> `optional` **maxArgs**: `number`

Defined in: [xslt-extensions.ts:42](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L42)

Maximum number of arguments (undefined for unlimited).

***

### implementation

> **implementation**: [`XSLTExtensionFunction`](../type-aliases/XSLTExtensionFunction.md)

Defined in: [xslt-extensions.ts:47](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L47)

Function implementation.

***

### description?

> `optional` **description**: `string`

Defined in: [xslt-extensions.ts:52](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L52)

Brief description for documentation.
