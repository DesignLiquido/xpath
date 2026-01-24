# TODO

## XSLT Extensions (Future Enhancement)

Currently, this library is a pure **XPath 1.0** implementation. However, it now provides a clean integration point for XSLT 1.0-specific functions through the **XSLT Extensions API**.

The XSLT function implementations will live in a separate `xslt-processor` package, while this package provides the interface definitions and integration hooks.

### XSLT Extensions API

The XPath library now supports registering XSLT extension functions via:

1. **Type Definitions**: `XSLTExtensions`, `XSLTExtensionFunction`, `XSLTFunctionMetadata` interfaces
2. **Parser Integration**: `XPathBaseParser` accepts `options.extensions` parameter
3. **Lexer Support**: `XPathLexer.registerFunctions()` for dynamic function registration
4. **Context Integration**: Extension functions receive `XPathContext` as first parameter

#### Usage Example (for xslt-processor implementers)

```typescript
import { 
  XPathBaseParser, 
  XPathLexer,
  XSLTExtensions, 
  XSLTFunctionMetadata,
  getExtensionFunctionNames 
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
    description: 'Generate unique identifier for a node'
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
        'xsl:vendor-url': 'https://github.com/designliquido/xpath'
      };
      return properties[String(propertyName)] || '';
    },
    description: 'Query XSLT processor properties'
  }
];

// Create extensions bundle
const extensions: XSLTExtensions = {
  functions: xsltFunctions,
  version: '1.0'
};

// Create parser with extensions
const parser = new XPathBaseParser({ extensions });

// Create lexer and register extension functions
const lexer = new XPathLexer();
lexer.registerFunctions(getExtensionFunctionNames(extensions));

// Parse and evaluate
const tokens = lexer.scan("generate-id()");
const expression = parser.parse(tokens);
const result = expression.evaluate(context);
```

### XSLT-Specific Functions (Section 12 of XSLT 1.0 Specification)

The following functions should be implemented in the `xslt-processor` package:

#### 1. `document()` - Multiple Source Documents (Section 12.1)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Load and process multiple source documents for cross-document transformations
- **Requirements**:
  - Fragment identifier handling
  - URI resolution (relative to stylesheet)
  - Document caching (same URI = same document)
  - Support for node-set arguments
- **Use Case**: `document('external.xml')`, `document(@href)`

#### 2. `key()` - Key-based Lookup (Section 12.2)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Efficient node lookup using keys declared with `<xsl:key>` elements
- **Requirements**:
  - Integration with `<xsl:key>` declarations
  - Key indexing mechanism
  - Support for cross-document keys
- **Use Case**: `key('product-id', @ref)`, `key('employee', 'E1234')`

#### 3. `format-number()` - Number Formatting (Section 12.3)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Format numbers according to patterns and locales
- **Requirements**:
  - JDK 1.1 DecimalFormat pattern syntax
  - Integration with `<xsl:decimal-format>` elements
  - Locale-specific formatting
  - Grouping separators, decimal symbols, etc.
- **Use Case**: `format-number(1234.5, '#,##0.00')`, `format-number($price, '€#,##0.00', 'euro')`

#### 4. `generate-id()` - Unique Identifier Generation (Section 12.4)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Generate unique, consistent identifiers for nodes
- **Requirements**:
  - ASCII alphanumeric characters only
  - Must start with alphabetic character
  - Same node = same ID within transformation
  - Different nodes = different IDs
  - Valid XML name syntax
- **Use Case**: `generate-id(.)`, `generate-id(//chapter[1])`

#### 5. `unparsed-entity-uri()` - Entity URI Lookup (Section 12.4)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Return URI of unparsed entity declared in DTD
- **Requirements**:
  - DTD parsing support
  - Unparsed entity handling
  - Returns empty string if entity doesn't exist
- **Use Case**: `unparsed-entity-uri('company-logo')`

#### 6. `system-property()` - Processor Properties (Section 12.4)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Query XSLT processor information
- **Requirements**:
  - Required properties:
    - `xsl:version` (should return "1.0")
    - `xsl:vendor` (e.g., "Design Liquido XPath")
    - `xsl:vendor-url` (e.g., project homepage)
  - QName expansion support
- **Use Case**: `system-property('xsl:version')`, `system-property('xsl:vendor')`

#### 7. `element-available()` - Element Availability Check (Section 15)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Check if an XSLT instruction element is available
- **Requirements**:
  - Element name resolution
  - XSLT namespace awareness
  - Extension element detection
- **Use Case**: `element-available('xsl:sort')`, used with `<xsl:choose>` for fallback

#### 8. `function-available()` - Function Availability Check (Section 15)
- **Status**: Not implemented (lexer token removed)
- **Purpose**: Check if a function is available in the processor
- **Requirements**:
  - Function name resolution
  - Core XPath function detection
  - XSLT function detection
  - Extension function detection
- **Use Case**: `function-available('document')`, used with `<xsl:choose>` for fallback

### Implementation Approach

The XSLT extensions are now **externalized** to the `xslt-processor` package:

#### Benefits of This Architecture

1. **Pure XPath Core**: This package remains a pure XPath 1.0 implementation
2. **Clean Separation**: XSLT-specific logic lives in xslt-processor
3. **Type Safety**: Strong TypeScript interfaces ensure correct integration
4. **Extensibility**: Same API can support other extension functions (XPath 2.0+, custom functions)
5. **Tree Shaking**: Users who don't need XSLT won't bundle those functions

#### Implementation Checklist for xslt-processor

When implementing XSLT functions in the separate package:

- [ ] Create `xslt-processor` package
- [ ] Import types from `@designliquido/xpath`:
  - `XSLTExtensions`
  - `XSLTExtensionFunction`
  - `XSLTFunctionMetadata`
  - `getExtensionFunctionNames`
  - `validateExtensions`
- [ ] Implement each XSLT function according to spec
- [ ] Export a configured `XSLTExtensions` bundle
- [ ] Provide helper to create context with XSLT extensions registered
- [ ] Add integration tests using real XPath parser from this package

#### Required Context Extensions

XSLT functions may need additional context data:

```typescript
const context: XPathContext = {
  node: rootNode,
  functions: {
    // Extension functions registered here
    'generate-id': xsltExtensions.functions.find(f => f.name === 'generate-id')!.implementation,
    'system-property': xsltExtensions.functions.find(f => f.name === 'system-property')!.implementation,
    // ... other XSLT functions
  },
  // Additional XSLT-specific context (defined in XSLTExtensions.contextExtensions)
  xsltVersion: '1.0',
  // For key() function:
  keys: {
    'employee-id': { match: 'employee', use: '@id' }
  },
  // For document() function:
  documentLoader: (uri, baseUri) => { /* load document */ },
  // For format-number() function:
  decimalFormats: {
    'euro': { /* format spec */ }
  },
  // For system-property() function:
  systemProperties: {
    'xsl:version': '1.0',
    'xsl:vendor': 'Design Liquido XPath'
  }
};
```

#### Dependencies for xslt-processor

- `document()` will require:
  - XML parser/loader
  - URI resolution library
  - Document cache mechanism

- `key()` will require:
  - Key declaration storage
  - Indexing mechanism
  - Fast lookup structure

- `format-number()` will require:
  - Number formatting library
  - Locale data
  - Pattern parsing

#### Testing Requirements

Each XSLT function will need:
- Unit tests for core functionality in xslt-processor
- Integration tests with XPath parser
- Edge case handling
- Performance benchmarks (especially for `key()` and `document()`)

### API Surface

The xpath library exposes these types for XSLT integration:

```typescript
// From '@designliquido/xpath'
export interface XSLTExtensions {
  functions: XSLTFunctionMetadata[];
  version: '1.0' | '2.0' | '3.0';
  contextExtensions?: { /* ... */ };
}

export interface XSLTFunctionMetadata {
  name: string;
  minArgs: number;
  maxArgs?: number;
  implementation: XSLTExtensionFunction;
  description?: string;
}

export type XSLTExtensionFunction = (
  context: XPathContext,
  ...args: any[]
) => any;

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

## Other Future Enhancements

### XPath 2.0+ Features
Consider implementing XPath 2.0 or 3.1 features in the future:
- Sequences
- Regular expressions
- Date/time functions
- Additional string functions
- Type system

### Performance Optimizations
- Expression compilation/caching
- Predicate optimization
- Axis traversal optimization
