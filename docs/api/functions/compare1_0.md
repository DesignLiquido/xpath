[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / compare1\_0

# Function: compare1\_0()

> **compare1\_0**(`left`, `right`, `operator`): `boolean`

Defined in: [compatibility.ts:348](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L348)

Compares two values using XPath 1.0 comparison rules.

In XPath 1.0, comparisons follow type conversion rules:
- If operand is a node-set, convert to string
- If operand is a number, convert to number
- If operand is a boolean, convert to boolean
- Then compare using appropriate comparison

## Parameters

### left

`any`

The left operand

### right

`any`

The right operand

### operator

`string`

The comparison operator ('==', '<', etc.)

## Returns

`boolean`

Boolean result of comparison
