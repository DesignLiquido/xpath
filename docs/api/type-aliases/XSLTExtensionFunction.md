[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XSLTExtensionFunction

# Type Alias: XSLTExtensionFunction()

> **XSLTExtensionFunction** = (`context`, ...`args`) => `any`

Defined in: [xslt-extensions.ts:19](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L19)

Signature for an XSLT extension function.

Extension functions receive arguments that have already been evaluated
by the XPath parser and must return a valid XPath result type.

## Parameters

### context

[`XPathContext`](../interfaces/XPathContext.md)

### args

...`any`[]

## Returns

`any`
