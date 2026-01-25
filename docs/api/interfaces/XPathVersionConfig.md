[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathVersionConfig

# Interface: XPathVersionConfig

Defined in: [xpath-version.ts:20](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L20)

XPath version configuration and feature flags.

## Properties

### version

> **version**: [`XPathVersion`](../type-aliases/XPathVersion.md)

Defined in: [xpath-version.ts:24](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L24)

XPath specification version.

***

### features

> **features**: `object`

Defined in: [xpath-version.ts:29](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L29)

Feature flags for version-specific behavior.

#### sequences?

> `optional` **sequences**: `boolean`

XPath 2.0+ features

#### typeSystem?

> `optional` **typeSystem**: `boolean`

#### ifThenElse?

> `optional` **ifThenElse**: `boolean`

#### forExpressions?

> `optional` **forExpressions**: `boolean`

#### quantifiedExpressions?

> `optional` **quantifiedExpressions**: `boolean`

#### rangeExpressions?

> `optional` **rangeExpressions**: `boolean`

#### higherOrderFunctions?

> `optional` **higherOrderFunctions**: `boolean`

XPath 3.0+ features

#### mapSupport?

> `optional` **mapSupport**: `boolean`

#### arraySupport?

> `optional` **arraySupport**: `boolean`

#### arrowOperator?

> `optional` **arrowOperator**: `boolean`

#### stringTemplates?

> `optional` **stringTemplates**: `boolean`

#### mapArrayConstructors?

> `optional` **mapArrayConstructors**: `boolean`

XPath 3.1+ features

#### jsonSupport?

> `optional` **jsonSupport**: `boolean`

***

### backwardCompatible?

> `optional` **backwardCompatible**: `boolean`

Defined in: [xpath-version.ts:60](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xpath-version.ts#L60)

Backward compatibility mode.
When true, allows XPath 1.0 expressions in higher versions.
