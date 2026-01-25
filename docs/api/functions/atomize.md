[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / atomize

# Function: atomize()

> **atomize**(`value`, `strict`): [`AtomizationResult`](../interfaces/AtomizationResult.md)

Defined in: [types/atomization.ts:175](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/atomization.ts#L175)

Atomize a value
Extracts atomic values from nodes or returns atomic values unchanged

## Parameters

### value

`any`

Single value or array of values

### strict

`boolean` = `false`

If true, raise error FOTY0012 for element-only content

## Returns

[`AtomizationResult`](../interfaces/AtomizationResult.md)

AtomizationResult
