[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / toString1\_0

# Function: toString1\_0()

> **toString1\_0**(`value`): `string`

Defined in: [compatibility.ts:161](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L161)

Converts a value to a string using XPath 1.0 rules (Appendix I.2).

XPath 1.0 string conversion rules:
- String: as-is
- Number: use fn:string() rules (format as string)
- Boolean: 'true' or 'false'
- Node-set: string value of first node in document order
- Empty sequence: empty string

## Parameters

### value

`any`

The value to convert

## Returns

`string`

String result
