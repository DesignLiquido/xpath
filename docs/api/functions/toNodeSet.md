[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / toNodeSet

# Function: toNodeSet()

> **toNodeSet**(`sequence`): [`XPathNode`](../interfaces/XPathNode.md)[]

Defined in: [compatibility.ts:306](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L306)

Extracts all nodes from a sequence, preserving document order and removing duplicates.

This is used when a sequence must be treated as a node-set in XPath 1.0 mode.

## Parameters

### sequence

`any`

The sequence or single value

## Returns

[`XPathNode`](../interfaces/XPathNode.md)[]

Array of unique nodes in document order, or empty array
