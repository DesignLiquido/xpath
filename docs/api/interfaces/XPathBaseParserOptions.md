[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathBaseParserOptions

# Interface: XPathBaseParserOptions

Defined in: [xslt-extensions.ts:104](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L104)

Parser options that include XSLT extensions support.

## Properties

### version?

> `optional` **version**: `"1.0"` \| `"2.0"` \| `"3.0"` \| `"3.1"`

Defined in: [xslt-extensions.ts:112](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L112)

XPath specification version to use.
Default: '1.0'

Note: Only XPath 1.0 is currently implemented.
Versions 2.0, 3.0, and 3.1 are reserved for future implementation.

***

### extensions?

> `optional` **extensions**: [`XSLTExtensions`](XSLTExtensions.md)

Defined in: [xslt-extensions.ts:118](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L118)

Optional XSLT extensions to enable.
When provided, the parser will recognize and allow calling XSLT functions.

***

### cache?

> `optional` **cache**: `boolean`

Defined in: [xslt-extensions.ts:124](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L124)

Whether to cache parsed expressions for reuse.
Default: false

***

### strict?

> `optional` **strict**: `boolean`

Defined in: [xslt-extensions.ts:131](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L131)

Strict mode: throw errors for unsupported features.
When false, unsupported features may be silently ignored or cause warnings.
Default: true

***

### enableNamespaceAxis?

> `optional` **enableNamespaceAxis**: `boolean`

Defined in: [xslt-extensions.ts:137](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L137)

Enable support for the deprecated namespace axis (namespace::).
Default: false (raises XPST0010 when used).

***

### staticContext?

> `optional` **staticContext**: [`XPathStaticContext`](XPathStaticContext.md)

Defined in: [xslt-extensions.ts:143](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L143)

Static context configuration (in-scope types, functions, collations, variables).
Defaults to an empty static context with XPath-defined namespaces.

***

### xpath10CompatibilityMode?

> `optional` **xpath10CompatibilityMode**: `boolean`

Defined in: [xslt-extensions.ts:155](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L155)

Enable XPath 1.0 backward compatibility mode (Phase 8.1).
When true, XPath 2.0+ expressions follow XPath 1.0 type conversion rules.
This enables:
- XPath 1.0 boolean conversion semantics
- XPath 1.0 numeric conversion (with NaN for empty sequences)
- XPath 1.0 comparison rules (node-set to string conversion)
- XPath 1.0 logical operator behavior (short-circuit, error suppression)
Default: false (XPath 2.0 semantics)

***

### warningConfig?

> `optional` **warningConfig**: [`WarningConfiguration`](WarningConfiguration.md)

Defined in: [xslt-extensions.ts:162](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L162)

Warning configuration for deprecated features and migration guidance (Phase 8.2).
Configure how warnings are collected, filtered, and reported.
Default: warnings enabled with 'info' minimum severity

***

### warningCollector?

> `optional` **warningCollector**: [`WarningCollector`](../classes/WarningCollector.md)

Defined in: [xslt-extensions.ts:169](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/xslt-extensions.ts#L169)

Warning collector instance for gathering warnings during parsing.
If not provided, a new collector will be created based on warningConfig.
Passing an existing collector allows aggregating warnings across multiple parses.
