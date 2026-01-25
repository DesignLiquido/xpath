[**@designliquido/xpath**](../README.md)

***

[@designliquido/xpath](../globals.md) / XPathContext

# Interface: XPathContext

Defined in: [context.ts:51](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L51)

The evaluation context for XPath expressions.

This context is passed to all expression evaluate() methods and contains:
- The current context node
- Position information for predicates
- Variable bindings
- Custom function definitions
- Dynamic properties like current dateTime, available documents, etc.

## Properties

### node?

> `optional` **node**: [`XPathNode`](XPathNode.md)

Defined in: [context.ts:55](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L55)

The current context node being evaluated.

***

### position?

> `optional` **position**: `number`

Defined in: [context.ts:61](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L61)

The position of the context node within the current node set (1-based).
Used by position() function and numeric predicates.

***

### size?

> `optional` **size**: `number`

Defined in: [context.ts:67](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L67)

The size of the current node set.
Used by last() function.

***

### nodeList?

> `optional` **nodeList**: [`XPathNode`](XPathNode.md)[]

Defined in: [context.ts:73](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L73)

The full node list for the current context.
Used by the 'self-and-siblings' axis (XSLT-specific).

***

### variables?

> `optional` **variables**: [`XPathVariables`](../type-aliases/XPathVariables.md)

Defined in: [context.ts:79](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L79)

Variable bindings available during evaluation.
Variables are referenced in XPath as $variableName.

***

### functions?

> `optional` **functions**: [`XPathFunctions`](../type-aliases/XPathFunctions.md)

Defined in: [context.ts:85](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L85)

Custom functions available during evaluation.
These extend the built-in XPath 1.0 function library.

***

### namespaces?

> `optional` **namespaces**: [`XPathNamespaces`](../type-aliases/XPathNamespaces.md)

Defined in: [context.ts:92](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L92)

Namespace bindings for resolving prefixes in XPath expressions.
Maps namespace prefixes to namespace URIs.
Example: { "atom": "http://www.w3.org/2005/Atom" }

***

### xsltVersion?

> `optional` **xsltVersion**: `string`

Defined in: [context.ts:98](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L98)

XSLT version ('1.0', '2.0', '3.0') for version-specific behavior.
Used by functions like json-to-xml() which are only available in XSLT 3.0+

***

### xpathVersion?

> `optional` **xpathVersion**: `"1.0"` \| `"2.0"` \| `"3.0"` \| `"3.1"`

Defined in: [context.ts:109](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L109)

XPath specification version being used.
Default: '1.0'

This affects:
- Function library available
- Type system behavior
- Sequence vs node-set handling

***

### xpath10CompatibilityMode?

> `optional` **xpath10CompatibilityMode**: `boolean`

Defined in: [context.ts:121](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L121)

Enable XPath 1.0 backward compatibility mode (Phase 8.1).
When true, XPath 2.0+ expressions follow XPath 1.0 type conversion rules.
This enables:
- XPath 1.0 boolean conversion semantics
- XPath 1.0 numeric conversion (with NaN for empty sequences)
- XPath 1.0 comparison rules (node-set to string conversion)
- XPath 1.0 logical operator behavior (short-circuit, error suppression)
Default: false (XPath 2.0 semantics)

***

### defaultCollation?

> `optional` **defaultCollation**: `string`

Defined in: [context.ts:127](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L127)

Default collation for string comparisons (XPath 2.0+).
Default: Unicode codepoint collation

***

### baseUri?

> `optional` **baseUri**: `string`

Defined in: [context.ts:132](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L132)

Base URI for resolving relative URIs (XPath 2.0+).

***

### implicitTimezone?

> `optional` **implicitTimezone**: `string`

Defined in: [context.ts:138](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L138)

Implicit timezone as duration offset from UTC (XPath 2.0+).
Example: '-PT5H' for US Eastern Time (UTC-5)

***

### extensions?

> `optional` **extensions**: `Record`\<`string`, `any`\>

Defined in: [context.ts:145](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L145)

Extension data for XSLT or custom implementations.
This allows attaching arbitrary data to the context without
polluting the main interface.

***

### currentDateTime?

> `optional` **currentDateTime**: `Date`

Defined in: [context.ts:154](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L154)

Current dateTime in the dynamic context (XPath 2.0+).
Returned by fn:current-dateTime().
If not provided, defaults to system time when accessed.

***

### availableDocuments?

> `optional` **availableDocuments**: [`XPathDocuments`](../type-aliases/XPathDocuments.md)

Defined in: [context.ts:161](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L161)

Available documents mapping for fn:doc() function (XPath 2.0+).
Maps document URIs to their root document nodes.
Example: { "http://example.com/data.xml": rootNode }

***

### availableCollections?

> `optional` **availableCollections**: [`XPathCollections`](../type-aliases/XPathCollections.md)

Defined in: [context.ts:168](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L168)

Available collections mapping for fn:collection() function (XPath 2.0+).
Maps collection URIs to sequences of nodes.
Example: { "http://example.com/collection": [node1, node2, ...] }

***

### defaultCollection?

> `optional` **defaultCollection**: `string`

Defined in: [context.ts:174](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L174)

Default collection URI when fn:collection() is called without arguments (XPath 2.0+).
If provided, fn:collection() returns availableCollections[defaultCollection].

***

### functionRegistry?

> `optional` **functionRegistry**: [`XPathFunctionRegistry`](../type-aliases/XPathFunctionRegistry.md)

Defined in: [context.ts:182](https://github.com/DesignLiquido/xpath/blob/810609b643c511d0dc96802dee2af959b6764fc4/src/context.ts#L182)

Function implementations registry (XPath 2.0+).
Maps QName function names to their implementations.
Allows defining custom/XSLT functions at evaluation time.
Format: "localName" or "prefix:localName"
