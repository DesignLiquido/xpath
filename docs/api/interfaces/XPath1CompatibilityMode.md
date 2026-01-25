[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPath1CompatibilityMode

# Interface: XPath1CompatibilityMode

Defined in: [compatibility.ts:17](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L17)

Configuration for XPath 1.0 compatibility mode.
When enabled, XPath 2.0 expressions follow XPath 1.0 type conversion rules.

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [compatibility.ts:23](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L23)

Enable XPath 1.0 compatibility mode.
When true, type conversions and operator behavior follow XPath 1.0 rules.
Default: false (XPath 2.0 semantics)

***

### suppressErrorsInFalseBranches?

> `optional` **suppressErrorsInFalseBranches**: `boolean`

Defined in: [compatibility.ts:31](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L31)

When true, suppress errors in the false branch of logical operators.
This allows expressions like "false() and error()" to return false
instead of raising an error.
Default: true

***

### shortCircuitEvaluation?

> `optional` **shortCircuitEvaluation**: `boolean`

Defined in: [compatibility.ts:39](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/compatibility.ts#L39)

When true, guaranteed short-circuit evaluation is enforced.
This ensures the false branch is never evaluated in "and" expressions,
and the true branch is never evaluated in "or" expressions.
Default: true
