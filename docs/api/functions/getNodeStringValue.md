[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / getNodeStringValue

# Function: getNodeStringValue()

> **getNodeStringValue**(`node`): `string`

Defined in: [types/atomization.ts:133](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/atomization.ts#L133)

Get the string value of a node
For element/document nodes: concatenates all text nodes
For text/attribute/comment nodes: the text content
For processing instructions: the data part

## Parameters

### node

`XPathNode`

## Returns

`string`
