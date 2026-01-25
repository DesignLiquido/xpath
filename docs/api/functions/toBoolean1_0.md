[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / toBoolean1\_0

# Function: toBoolean1\_0()

> **toBoolean1\_0**(`value`): `boolean`

Defined in: [compatibility.ts:54](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L54)

Converts a value to a boolean using XPath 1.0 rules (Appendix I.2).

XPath 1.0 boolean conversion rules:
- Number: false if 0 or NaN, true otherwise
- String: false if empty, true otherwise
- Node-set: false if empty, true otherwise
- Other types: apply fn:boolean() rules

## Parameters

### value

`any`

The value to convert

## Returns

`boolean`

Boolean result
