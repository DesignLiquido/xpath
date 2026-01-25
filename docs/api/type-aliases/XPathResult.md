[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathResult

# Type Alias: XPathResult

> **XPathResult** = [`XPathNode`](../interfaces/XPathNode.md)[] \| `string` \| `number` \| `boolean` \| `any`[] \| `Map`\<`any`, `any`\> \| `null` \| `Function`

Defined in: [context.ts:191](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L191)

Result types that can be returned from XPath evaluation.

XPath 1.0: node-set, string, number, boolean
XPath 2.0+: sequences (which subsume node-sets), atomic values, functions
