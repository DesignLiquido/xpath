[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / createPredicateContext

# Function: createPredicateContext()

> **createPredicateContext**(`parent`, `node`, `position`, `size`): [`XPathContext`](../interfaces/XPathContext.md)

Defined in: [context.ts:218](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L218)

Creates a child context for predicate evaluation.
Preserves variables and functions from parent context.

## Parameters

### parent

[`XPathContext`](../interfaces/XPathContext.md)

### node

[`XPathNode`](../interfaces/XPathNode.md)

### position

`number`

### size

`number`

## Returns

[`XPathContext`](../interfaces/XPathContext.md)
