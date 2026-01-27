# TODO

## XSLT Extensions

This library is a pure **XPath 1.0/2.0/3.0** implementation that provides a clean integration point for XSLT-specific functions through the **XSLT Extensions API**.

The XSLT function implementations live in the `xslt-processor` package, while this package provides the interface definitions and integration hooks.

### XSLT Extensions API

The XPath library supports registering XSLT extension functions via:

1. **Type Definitions**: `XSLTExtensions`, `XSLTExtensionFunction`, `XSLTFunctionMetadata` interfaces
2. **Parser Integration**: `XPath10Parser`/`XPath20Parser` accept `options.extensions` parameter
3. **Lexer Support**: `XPathLexer.registerFunctions()` for dynamic function registration
4. **Context Integration**: Extension functions receive `XPathContext` as first parameter

#### Usage Example (for xslt-processor implementers)

```typescript
import {
    XPath10Parser,
    XPathLexer,
    XSLTExtensions,
    XSLTFunctionMetadata,
    getExtensionFunctionNames,
} from '@designliquido/xpath';

// Define XSLT extension functions
const xsltFunctions: XSLTFunctionMetadata[] = [
    {
        name: 'generate-id',
        minArgs: 0,
        maxArgs: 1,
        implementation: (context, nodeSet) => {
            // Implementation here
            const node = nodeSet?.[0] || context.node;
            return `id-${generateUniqueId(node)}`;
        },
        description: 'Generate unique identifier for a node',
    },
    {
        name: 'system-property',
        minArgs: 1,
        maxArgs: 1,
        implementation: (context, propertyName) => {
            // Implementation here
            const properties = {
                'xsl:version': '1.0',
                'xsl:vendor': 'Design Liquido XPath',
                'xsl:vendor-url': 'https://github.com/designliquido/xpath',
            };
            return properties[String(propertyName)] || '';
        },
        description: 'Query XSLT processor properties',
    },
];

// Create extensions bundle
const extensions: XSLTExtensions = {
    functions: xsltFunctions,
    version: '1.0',
};

// Create parser with extensions
const parser = new XPath10Parser({ extensions });

// Create lexer and register extension functions
const lexer = new XPathLexer('1.0');
lexer.registerFunctions(getExtensionFunctionNames(extensions));

// Parse and evaluate
const tokens = lexer.scan('generate-id()');
const expression = parser.parse(tokens);
const result = expression.evaluate(context);
```

### XSLT-Specific Functions (Section 12 of XSLT 1.0 Specification)

The following functions are implemented in the `xslt-processor` package:

#### 1. `document()` - Multiple Source Documents (Section 12.1)

- **Status**: ✅ Implemented (basic) in xslt-processor
- **Purpose**: Load and process multiple source documents for cross-document transformations
- **Implementation Notes**:
    - Requires `documentLoader` callback in context
    - Empty URI returns current document
    - Returns empty node-set if loading fails
- **Use Case**: `document('external.xml')`, `document(@href)`

#### 2. `key()` - Key-based Lookup (Section 12.2)

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Efficient node lookup using keys declared with `<xsl:key>` elements
- **Implementation Notes**:
    - Integrated with `<xsl:key>` declarations
    - Key indexing via context.keys map
- **Use Case**: `key('product-id', @ref)`, `key('employee', 'E1234')`

#### 3. `format-number()` - Number Formatting (Section 12.3)

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Format numbers according to patterns and locales
- **Implementation Notes**:
    - JDK 1.1 DecimalFormat pattern syntax supported
    - Integration with `<xsl:decimal-format>` elements
    - Grouping separators, decimal symbols, etc.
- **Use Case**: `format-number(1234.5, '#,##0.00')`, `format-number($price, '€#,##0.00', 'euro')`

#### 4. `generate-id()` - Unique Identifier Generation (Section 12.4)

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Generate unique, consistent identifiers for nodes
- **Implementation Notes**:
    - Uses hash-based ID generation
    - Same node = same ID within transformation
    - Starts with alphabetic character
- **Use Case**: `generate-id(.)`, `generate-id(//chapter[1])`

#### 5. `unparsed-entity-uri()` - Entity URI Lookup (Section 12.4)

- **Status**: ✅ Implemented (stub) in xslt-processor
- **Purpose**: Return URI of unparsed entity declared in DTD
- **Implementation Notes**:
    - Requires `unparsedEntities` map in context
    - Returns empty string if entity doesn't exist
    - DTD parsing not available in JavaScript environments
- **Use Case**: `unparsed-entity-uri('company-logo')`

#### 6. `system-property()` - Processor Properties (Section 12.4)

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Query XSLT processor information
- **Implementation Notes**:
    - Required properties: `xsl:version`, `xsl:vendor`, `xsl:vendor-url`
    - Custom properties via `systemProperties` in context
- **Use Case**: `system-property('xsl:version')`, `system-property('xsl:vendor')`

#### 7. `element-available()` - Element Availability Check (Section 15)

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Check if an XSLT instruction element is available
- **Implementation Notes**:
    - All 34 XSLT 1.0 elements supported
    - Works with or without `xsl:` prefix
- **Use Case**: `element-available('xsl:sort')`, used with `<xsl:choose>` for fallback

#### 8. `function-available()` - Function Availability Check (Section 15)

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Check if a function is available in the processor
- **Implementation Notes**:
    - Core XPath 1.0 functions (26 functions)
    - XSLT 1.0 additional functions (9 functions)
    - Custom functions (matches, ends-with, xml-to-json, json-to-xml)
- **Use Case**: `function-available('document')`, used with `<xsl:choose>` for fallback

#### 9. `current()` - Current Node (XSLT 1.0)

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Returns the current node being processed
- **Use Case**: `current()`, `key('index', current()/@id)`

### Additional Functions (XSLT 3.0)

#### `xml-to-json()` - XML to JSON Conversion

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Convert XML nodes to JSON string representation
- **Implementation Notes**:
    - Only available when `xsltVersion` is '3.0'
    - Throws error in XSLT 1.0/2.0 mode

#### `json-to-xml()` - JSON to XML Conversion

- **Status**: ✅ Implemented in xslt-processor
- **Purpose**: Convert JSON string to XML document
- **Implementation Notes**:
    - Only available when `xsltVersion` is '3.0'
    - Returns XNode tree compatible with XSLT processing

### Architecture

The XSLT extensions are **externalized** to the `xslt-processor` package:

#### Benefits

1. **Pure XPath Core**: This package remains a pure XPath implementation
2. **Clean Separation**: XSLT-specific logic lives in xslt-processor
3. **Type Safety**: Strong TypeScript interfaces ensure correct integration
4. **Extensibility**: Same API can support other extension functions (XPath 2.0+, custom functions)
5. **Tree Shaking**: Users who don't need XSLT won't bundle those functions

#### Context Extensions

XSLT functions use additional context data:

```typescript
const context: XPathContext = {
    node: rootNode,
    functions: {
        // Extension functions registered here
        'generate-id': generateIdImpl,
        'system-property': systemPropertyImpl,
        key: keyImpl,
        // ... other XSLT functions
    },
    // Additional XSLT-specific context
    xsltVersion: '1.0',
    // For key() function:
    keys: {
        'employee-id': { E1234: nodeSetValue },
    },
    // For document() function:
    documentLoader: (uri) => {
        /* load and return document */
    },
    // For system-property() function:
    systemProperties: {
        'xsl:version': '1.0',
        'xsl:vendor': 'Design Liquido',
    },
    // For unparsed-entity-uri() function:
    unparsedEntities: {
        logo: 'http://example.com/logo.png',
    },
};
```

### API Surface

The xpath library exposes these types for XSLT integration:

```typescript
// From '@designliquido/xpath'
export interface XSLTExtensions {
    functions: XSLTFunctionMetadata[];
    version: '1.0' | '2.0' | '3.0';
    contextExtensions?: {
        /* ... */
    };
}

export interface XSLTFunctionMetadata {
    name: string;
    minArgs: number;
    maxArgs?: number;
    implementation: XSLTExtensionFunction;
    description?: string;
}

export type XSLTExtensionFunction = (context: XPathContext, ...args: any[]) => any;

export interface XPathBaseParserOptions {
    extensions?: XSLTExtensions;
    cache?: boolean;
}

// Helper functions
export function validateExtensions(extensions: XSLTExtensions): string[];
export function getExtensionFunctionNames(extensions: XSLTExtensions): string[];
export function createEmptyExtensions(version?: '1.0' | '2.0' | '3.0'): XSLTExtensions;
```

### References

- [XPath 1.0 Specification](https://www.w3.org/TR/xpath-10/)
- [XSLT 1.0 Specification](https://www.w3.org/TR/xslt-10/)
- [XSLT 1.0 Section 12: Additional Functions](https://www.w3.org/TR/xslt-10/#section-Additional-Functions)
- [XSLT 1.0 Section 15: Fallback](https://www.w3.org/TR/xslt-10/#section-Fallback)

---

## XPath 3.1 Implementation Status

### Phase 1: Specification Review & Gap Analysis ✅ COMPLETE

**Completed:** January 26, 2026
**Status:** Ready for Phase 2 implementation

#### Phase 1 Deliverables:

- ✅ [XPATH-31-IMPLEMENTATION-PLAN.md](XPATH-31-IMPLEMENTATION-PLAN.md) - 8-phase implementation roadmap
- ✅ [XPATH-31-PHASE1-GAP-ANALYSIS.md](XPATH-31-PHASE1-GAP-ANALYSIS.md) - Comprehensive gap analysis
- ✅ [XPATH-31-PHASE1-DETAILED-TASKS.md](XPATH-31-PHASE1-DETAILED-TASKS.md) - Task breakdown (62 tasks)

### Phase 2: Map Operations Enhancement ✅ COMPLETE

**Completed:** January 26, 2026

#### Phase 2 Deliverables:

- ✅ Map constructors: `map { key: value, ... }`
- ✅ Map functions (9 functions in `map:` namespace)
    - `map:size`, `map:keys`, `map:contains`, `map:get`
    - `map:put`, `map:entry`, `map:merge`
    - `map:for-each`, `map:remove`
- ✅ XPath31Parser with map constructor parsing

### Phase 3: Array Operations Enhancement ✅ COMPLETE

**Completed:** January 26, 2026

#### Phase 3 Deliverables:

- ✅ Array constructors:
    - Square bracket syntax: `[item1, item2, ...]`
    - Curly brace syntax: `array { expr }`
- ✅ Array functions (17 functions in `array:` namespace):
    - `array:size`, `array:get`, `array:put`, `array:append`
    - `array:subarray`, `array:remove`, `array:insert-before`
    - `array:head`, `array:tail`, `array:reverse`
    - `array:join`, `array:flatten`
    - `array:for-each`, `array:filter`
    - `array:fold-left`, `array:fold-right`, `array:sort`
- ✅ Parser support for `array:*` and `map:*` namespaced function calls
- ✅ Single-item sequence unwrapping for function arguments
- ✅ Comprehensive test coverage (56 array function tests, 40 array constructor tests)

**Test Status:** 1509 tests passing (2 skipped for `to` range operator)

#### Next Steps:

👉 **Begin Phase 4: JSON Integration** or **Phase 5: Lookup Operator Refinement**

**Remaining Critical Gaps:**

1. Lookup Operator (`?` unary and postfix) - Phase 5
2. JSON Support (parse-json, serialize) - Phase 4
3. Type System Enhancements (TypedMapTest, TypedArrayTest) - Phase 6

---

## Other Future Enhancements

### XPath 2.0+ Features

Consider implementing additional XPath 2.0 or 3.1 features:

- Sequences (partially implemented)
- Regular expressions (partially implemented via `matches()`)
- Date/time functions
- Additional string functions
- Type system (partially implemented)

### Performance Optimizations

- Expression compilation/caching
- Predicate optimization
- Axis traversal optimization

### Documentation

- ✅ TypeDoc API documentation configured and published
- ✅ GitHub Pages automated deployment workflow
- ✅ Comprehensive guides integrated (implementation plan, migration guide, incompatibilities)
- Documentation automatically updates on every push to main branch
