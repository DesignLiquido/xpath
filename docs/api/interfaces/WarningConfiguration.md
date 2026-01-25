[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / WarningConfiguration

# Interface: WarningConfiguration

Defined in: [warnings.ts:261](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L261)

Configuration for warning behavior

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [warnings.ts:265](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L265)

Whether warnings are enabled. Default: true

***

### minSeverity?

> `optional` **minSeverity**: [`WarningSeverity`](../type-aliases/WarningSeverity.md)

Defined in: [warnings.ts:270](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L270)

Minimum severity level to report. Default: 'info'

***

### suppressCategories?

> `optional` **suppressCategories**: [`WarningCategory`](../type-aliases/WarningCategory.md)[]

Defined in: [warnings.ts:275](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L275)

Categories to suppress (not report)

***

### suppressCodes?

> `optional` **suppressCodes**: `string`[]

Defined in: [warnings.ts:280](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L280)

Specific warning codes to suppress

***

### handler?

> `optional` **handler**: [`WarningHandler`](../type-aliases/WarningHandler.md)

Defined in: [warnings.ts:285](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L285)

Custom warning handler. If not provided, warnings are collected internally.

***

### logToConsole?

> `optional` **logToConsole**: `boolean`

Defined in: [warnings.ts:290](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L290)

Whether to also log warnings to console. Default: false

***

### maxWarnings?

> `optional` **maxWarnings**: `number`

Defined in: [warnings.ts:295](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L295)

Maximum number of warnings to collect before stopping. Default: 100

***

### emitOnce?

> `optional` **emitOnce**: `boolean`

Defined in: [warnings.ts:300](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/warnings.ts#L300)

Whether to emit each warning only once per expression. Default: true
