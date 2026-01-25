[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / SequenceType

# Class: SequenceType

Defined in: [types/sequence-type.ts:114](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L114)

SequenceType specifies the expected type and cardinality of a sequence

Special cases:
- empty-sequence() : represents a sequence with no items
- item() : matches any single item
- xs:integer+ : one or more integers

## Constructors

### Constructor

> **new SequenceType**(`itemType`, `occurrence`): `SequenceType`

Defined in: [types/sequence-type.ts:124](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L124)

Create a SequenceType

#### Parameters

##### itemType

The ItemType (or 'empty' for empty-sequence())

[`ItemType`](../interfaces/ItemType.md) | `"empty"`

##### occurrence

[`OccurrenceIndicator`](../enumerations/OccurrenceIndicator.md) = `OccurrenceIndicator.EXACTLY_ONE`

The occurrence indicator (default: EXACTLY_ONE)

#### Returns

`SequenceType`

## Methods

### getItemType()

> **getItemType**(): [`ItemType`](../interfaces/ItemType.md) \| `"empty"`

Defined in: [types/sequence-type.ts:135](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L135)

Get the ItemType

#### Returns

[`ItemType`](../interfaces/ItemType.md) \| `"empty"`

***

### getOccurrence()

> **getOccurrence**(): [`OccurrenceIndicator`](../enumerations/OccurrenceIndicator.md)

Defined in: [types/sequence-type.ts:142](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L142)

Get the OccurrenceIndicator

#### Returns

[`OccurrenceIndicator`](../enumerations/OccurrenceIndicator.md)

***

### isEmptySequence()

> **isEmptySequence**(): `boolean`

Defined in: [types/sequence-type.ts:149](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L149)

Check if this is empty-sequence()

#### Returns

`boolean`

***

### allowsZeroItems()

> **allowsZeroItems**(): `boolean`

Defined in: [types/sequence-type.ts:156](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L156)

Check if this type allows zero items

#### Returns

`boolean`

***

### allowsMultipleItems()

> **allowsMultipleItems**(): `boolean`

Defined in: [types/sequence-type.ts:167](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L167)

Check if this type allows multiple items

#### Returns

`boolean`

***

### requiresItems()

> **requiresItems**(): `boolean`

Defined in: [types/sequence-type.ts:177](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L177)

Check if this type requires at least one item

#### Returns

`boolean`

***

### toString()

> **toString**(): `string`

Defined in: [types/sequence-type.ts:185](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L185)

Get a string representation of this SequenceType
Examples: "empty-sequence()", "xs:integer", "xs:integer?", "element(*)"

#### Returns

`string`

***

### getMinCardinality()

> **getMinCardinality**(): `number`

Defined in: [types/sequence-type.ts:201](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L201)

Get the minimum cardinality allowed by this type
0 = allows empty, 1 = requires at least one item

#### Returns

`number`

***

### getMaxCardinality()

> **getMaxCardinality**(): `number`

Defined in: [types/sequence-type.ts:212](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L212)

Get the maximum cardinality allowed by this type
1 = exactly one item, Infinity = unbounded

#### Returns

`number`

***

### isCompatibleWith()

> **isCompatibleWith**(`other`): `boolean`

Defined in: [types/sequence-type.ts:226](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/types/sequence-type.ts#L226)

Check if another SequenceType is compatible with this one
(i.e., can values of that type be assigned to this type)

This is a simple compatibility check. Full implementation would require
schema information and type hierarchy checking.

#### Parameters

##### other

`SequenceType`

#### Returns

`boolean`
