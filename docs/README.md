# XPath 2.0 Implementation Documentation

A comprehensive TypeScript implementation of XPath 2.0, fully compatible with XPath 1.0 when needed.

## Quick Links

- **[API Reference](./api/modules.md)** - Complete API documentation generated from TypeScript source
- **[Implementation Plan](./guides/XPATH-2.0-IMPLEMENTATION-PLAN.md)** - Full feature roadmap and completion status
- **[Migration Guide](./guides/XPATH-MIGRATION-GUIDE.md)** - Migrate from XPath 1.0 to 2.0
- **[Incompatibilities](./guides/XPATH-INCOMPATIBILITIES.md)** - Detailed incompatibilities between versions

## What is XPath?

XPath is a query language for selecting nodes in XML documents. This implementation provides:

- **Full XPath 2.0 support** including sequences, advanced types, and 100+ functions
- **XPath 1.0 compatibility mode** for backward compatibility
- **Strong type system** with 19+ atomic types
- **Comprehensive error handling** with 79+ error codes
- **Schema-aware processing** with optional schema import
- **1176+ passing tests** across 36 test suites with 77% code coverage

## Getting Started

### Installation

```bash
npm install @designliquido/xpath
```

### Basic Usage

```typescript
import { evaluate } from '@designliquido/xpath';

// Simple path expression
const result = evaluate('/library/book', document);

// XPath 2.0 features - for expressions
const titles = evaluate('for $b in /library/book return $b/title', document);

// With context
const priceCtx = { price: 50 };
const expensive = evaluate('$price > 100', priceCtx);

// Enable XPath 1.0 compatibility mode
const xpath1Compatible = evaluate(expression, doc, {
    xpath10CompatibilityMode: true
});
```

## Core Features

### Phase 1: Type System ✅
- Atomic types (string, number, boolean, date, time, duration, QName, URI, etc.)
- Sequence types and cardinality operators
- Type promotion and conversion rules
- Full atomization support

### Phase 2: Expressions ✅
- Arithmetic, logical, and comparison expressions
- Value comparisons (eq, ne, lt, le, gt, ge)
- General comparisons (=, !=, <, <=, >, >=)
- Node comparisons (is, <<, >>)
- Path expressions with extended node tests

### Phase 3: Control Flow ✅
- Conditional expressions (if-then-else)
- For expressions with variable binding
- Quantified expressions (some, every)
- Proper short-circuit evaluation

### Phase 4: SequenceType Operations ✅
- `instance of` operator
- `castable as` operator
- `treat as` operator
- Constructor functions for atomic types

### Phase 5: Extended Node Tests ✅
- `document-node()` with optional element tests
- Element tests with name and type matching
- Attribute tests with name and type matching
- Schema-aware kind tests
- Processing instruction tests

### Phase 6: Context ✅
- Static context with schema types and function signatures
- Dynamic context with dates, collections, and documents
- Variable binding and scope management
- Default namespaces and collations

### Phase 7: Error Handling ✅
- 79+ error codes (XPST, XPDY, XPTY families)
- Static and dynamic error distinction
- Proper error propagation
- Error objects with QName codes and descriptions

### Phase 8: XPath 1.0 Compatibility ✅
- Full backward compatibility mode
- Type coercion rules
- Empty sequence handling
- First-item extraction semantics
- 75+ compatibility tests

### Phase 9: Functions & Operators ✅
- String functions (15+): concat, substring, upper-case, matches, replace, tokenize...
- Numeric functions (10+): abs, ceiling, floor, round, min, max...
- Boolean functions: true, false, not, boolean...
- Date/time functions (30+): current-dateTime, year-from-date, adjust-dateTime-to-timezone...
- Sequence functions (20+): count, sum, avg, distinct-values, index-of, reverse...
- Node functions (10+): node-name, string, data, base-uri, root, lang...
- QName functions: resolve-QName, prefix-from-QName, local-name-from-QName...
- URI functions: resolve-uri, encode-for-uri, iri-to-uri...
- Collection functions: fn:collection, fn:doc (scaffolded), fn:doc-available (scaffolded)

### Phase 10: Optional Features ✅
- Static typing infrastructure (minimal scaffold)
- Schema import with minimal XSD parsing
- Node type annotations

## Documentation

- **[Full Implementation Plan](./guides/XPATH-2.0-IMPLEMENTATION-PLAN.md)** - 10-phase development roadmap with all 1176 tests documented
- **[Migration Guide](./guides/XPATH-MIGRATION-GUIDE.md)** - Step-by-step guide for migrating from XPath 1.0
- **[Incompatibilities](./guides/XPATH-INCOMPATIBILITIES.md)** - Detailed reference of XPath 1.0 to 2.0 differences
- **[API Reference](./api/modules.md)** - Complete TypeScript API documentation

## Test Coverage

The implementation includes comprehensive test coverage:

- **36 test suites** covering all 10 implementation phases
- **1176 passing tests** with detailed coverage for each feature
- **77% statement coverage** and **79% line coverage**
- Tests for all error codes, edge cases, and compatibility scenarios

### Test Categories

- Unit tests for all expression types
- Type system and conversion tests
- Error handling tests (all 79 error codes)
- XPath 1.0 compatibility tests
- Expression parser tests
- Context and scope tests
- Extended node test coverage
- Collection function tests
- Static typing tests
- Schema import tests

## Performance

- Expression compilation with caching
- Efficient sequence handling
- Optimized type promotion
- Document order computation

## Browser & Node.js Support

Works in both Node.js and browser environments with full TypeScript support.

## License

MIT

## Contributing

Contributions welcome! Please check the [Implementation Plan](./guides/XPATH-2.0-IMPLEMENTATION-PLAN.md) for areas that need work.

---

**Version**: 0.0.0  
**Last Updated**: January 25, 2026
