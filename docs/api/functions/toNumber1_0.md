[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / toNumber1\_0

# Function: toNumber1\_0()

> **toNumber1\_0**(`value`): `number`

Defined in: [compatibility.ts:97](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L97)

Converts a value to a number using XPath 1.0 rules (Appendix I.2).

XPath 1.0 numeric conversion rules:
- Number: as-is
- String: use fn:number() rules (parse as number, NaN if not parseable)
- Boolean: true = 1, false = 0
- Node-set: convert to string, then to number
- Empty sequence: NaN

## Parameters

### value

`any`

The value to convert

## Returns

`number`

Numeric result (may be NaN)
