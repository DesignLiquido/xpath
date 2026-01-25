[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / parseTime

# Function: parseTime()

> **parseTime**(`value`): `object`

Defined in: [types/datetime-types.ts:42](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/datetime-types.ts#L42)

Parse ISO 8601 time format
Format: HH:MM:SS[.SSS][Z|±HH:MM]

## Parameters

### value

`string`

## Returns

`object`

### hours

> **hours**: `number`

### minutes

> **minutes**: `number`

### seconds

> **seconds**: `number`

### timezone?

> `optional` **timezone**: `object`

#### timezone.sign

> **sign**: `string`

#### timezone.hours

> **hours**: `number`

#### timezone.minutes

> **minutes**: `number`
