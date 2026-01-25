[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / getFirstItem

# Function: getFirstItem()

> **getFirstItem**(`sequence`): `any`

Defined in: [compatibility.ts:286](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L286)

Extracts the first item from a sequence (XPath 1.0 first-item-only semantics).

When XPath 1.0 compatibility mode is enabled, sequences are treated as
node-sets containing only the first node. This function extracts that first item.

## Parameters

### sequence

`any`

The sequence or single value

## Returns

`any`

The first item, or null if empty sequence
