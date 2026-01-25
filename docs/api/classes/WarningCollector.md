[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / WarningCollector

# Class: WarningCollector

Defined in: [warnings.ts:329](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L329)

Warning collector class for managing warnings during expression evaluation

## Constructors

### Constructor

> **new WarningCollector**(`config?`): `WarningCollector`

Defined in: [warnings.ts:334](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L334)

#### Parameters

##### config?

[`WarningConfiguration`](../interfaces/WarningConfiguration.md)

#### Returns

`WarningCollector`

## Methods

### emit()

> **emit**(`code`, `context?`, `expression?`): `void`

Defined in: [warnings.ts:341](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L341)

Emit a warning by code

#### Parameters

##### code

`string`

##### context?

`string`

##### expression?

`string`

#### Returns

`void`

***

### emitCustom()

> **emitCustom**(`warning`): `void`

Defined in: [warnings.ts:391](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L391)

Emit a custom warning

#### Parameters

##### warning

[`XPathWarning`](../interfaces/XPathWarning.md)

#### Returns

`void`

***

### getWarnings()

> **getWarnings**(): readonly [`XPathWarning`](../interfaces/XPathWarning.md)[]

Defined in: [warnings.ts:420](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L420)

Get all collected warnings

#### Returns

readonly [`XPathWarning`](../interfaces/XPathWarning.md)[]

***

### getWarningsBySeverity()

> **getWarningsBySeverity**(`severity`): [`XPathWarning`](../interfaces/XPathWarning.md)[]

Defined in: [warnings.ts:427](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L427)

Get warnings filtered by severity

#### Parameters

##### severity

[`WarningSeverity`](../type-aliases/WarningSeverity.md)

#### Returns

[`XPathWarning`](../interfaces/XPathWarning.md)[]

***

### getWarningsByCategory()

> **getWarningsByCategory**(`category`): [`XPathWarning`](../interfaces/XPathWarning.md)[]

Defined in: [warnings.ts:434](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L434)

Get warnings filtered by category

#### Parameters

##### category

[`WarningCategory`](../type-aliases/WarningCategory.md)

#### Returns

[`XPathWarning`](../interfaces/XPathWarning.md)[]

***

### hasWarnings()

> **hasWarnings**(): `boolean`

Defined in: [warnings.ts:441](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L441)

Check if any warnings were collected

#### Returns

`boolean`

***

### count()

> **count**(): `number`

Defined in: [warnings.ts:448](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L448)

Get count of warnings

#### Returns

`number`

***

### clear()

> **clear**(): `void`

Defined in: [warnings.ts:455](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L455)

Clear all collected warnings

#### Returns

`void`

***

### formatReport()

> **formatReport**(): `string`

Defined in: [warnings.ts:463](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L463)

Format warnings as a report string

#### Returns

`string`
