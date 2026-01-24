# TODO

## XSLT Extensions (Future Enhancement)

Currently, this library is a pure **XPath 1.0** implementation. The following XSLT 1.0-specific functions have been removed from the lexer to maintain strict XPath 1.0 compliance. They could be added as optional XSLT extensions in the future.

### XSLT-Specific Functions (Section 12 of XSLT 1.0 Specification)

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

### Implementation Considerations

#### Architecture Options

1. **Optional Module**: Create a separate `xslt-extensions` module
   ```typescript
   import { XPathParser } from '@designliquido/xpath';
   import { XSLTExtensions } from '@designliquido/xpath/xslt-extensions';
   
   const parser = new XPathParser({ extensions: XSLTExtensions });
   ```

2. **Context-Based**: Add XSLT functions through context
   ```typescript
   const context = {
     node: rootNode,
     functions: {
       'generate-id': (nodeSet) => { /* implementation */ },
       'system-property': (name) => { /* implementation */ }
     },
     xsltVersion: '1.0'
   };
   ```

3. **Feature Flag**: Enable XSLT mode
   ```typescript
   const parser = new XPathParser({ mode: 'xslt' });
   ```

#### Dependencies

- `document()` would require:
  - XML parser/loader
  - URI resolution library
  - Document cache mechanism

- `key()` would require:
  - Key declaration storage
  - Indexing mechanism
  - Fast lookup structure

- `format-number()` would require:
  - Number formatting library
  - Locale data
  - Pattern parsing

#### Testing Requirements

Each XSLT function would need:
- Unit tests for core functionality
- Integration tests with XSLT context
- Edge case handling
- Performance benchmarks (especially for `key()` and `document()`)

### Lexer Cleanup

Current lexer includes these XSLT tokens that should be documented or removed if staying pure XPath:

```typescript
// src/lexer/lexer.ts lines 67-73
"document": { type: "FUNCTION", value: "document" },
"key": { type: "FUNCTION", value: "key" },
"format-number": { type: "FUNCTION", value: "format-number" },
"generate-id": { type: "FUNCTION", value: "generate-id" },
"unparsed-entity-uri": { type: "FUNCTION", value: "unparsed-entity-uri" },
"system-property": { type: "FUNCTION", value: "system-property" },
```

**Decision needed**: Keep for future XSLT support or remove to keep library purely XPath 1.0?

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
