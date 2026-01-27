# XPath Specification Support

This document outlines the preparations made in the codebase to support future XPath specifications (2.0, 3.0, 3.1) while maintaining full backward compatibility with XPath 1.0.

## Current Status

- **XPath 1.0**: ✅ Fully implemented and tested
- **XPath 2.0**: 🔧 Infrastructure prepared, awaiting implementation
- **XPath 3.0**: 🔧 Infrastructure prepared, awaiting implementation
- **XPath 3.1**: 🔧 Infrastructure prepared, awaiting implementation

## Version Support Infrastructure

### Version Configuration (`src/xpath-version.ts`)

A comprehensive version management system has been created:

```typescript
import { XPathVersion, getVersionConfig, isFeatureSupported } from '@designliquido/xpath';

// Check version configuration
const config = getVersionConfig('2.0');
console.log(config.features.sequences); // true

// Check feature support
if (isFeatureSupported('2.0', 'ifThenElse')) {
    // Use if-then-else expressions
}
```

#### Version-Specific Features

**XPath 2.0 Features:**

- Sequences (generalization of node-sets)
- Explicit type system (xs:string, xs:integer, etc.)
- `if-then-else` expressions
- `for` expressions (FLWOR - For/Let/Where/Order/Return)
- Quantified expressions (`some`/`every`)
- Range expressions (`1 to 10`)

**XPath 3.0 Features:**

- All XPath 2.0 features
- Higher-order functions (functions as first-class values)
- Map data type
- Array data type
- Arrow operator (`=>`)
- String templates

**XPath 3.1 Features:**

- All XPath 3.0 features
- Map and array constructors (`map{}`, `array{}`)
- Enhanced JSON support

### Parser Options

The parser now accepts version configuration:

```typescript
import { XPathBaseParser } from '@designliquido/xpath';

// XPath 1.0 (default)
const parser1 = new XPathBaseParser();

// XPath 2.0 (strict mode - will throw error until implemented)
const parser2 = new XPathBaseParser({ version: '2.0' });

// XPath 2.0 (non-strict mode - allows experimentation)
const parser3 = new XPathBaseParser({ version: '2.0', strict: false });
```

#### Parser Options Interface

```typescript
interface XPathBaseParserOptions {
    version?: '1.0' | '2.0' | '3.0' | '3.1'; // Default: '1.0'
    extensions?: XSLTExtensions; // XSLT function extensions
    cache?: boolean; // Expression caching
    strict?: boolean; // Strict version checking (default: true)
}
```

## Context Extensions

The `XPathContext` interface has been extended to support future versions:

### XPath 2.0+ Context Properties

```typescript
interface XPathContext {
    // ... existing XPath 1.0 properties ...

    // XPath version
    xpathVersion?: '1.0' | '2.0' | '3.0' | '3.1';

    // XPath 2.0+ properties
    defaultCollation?: string; // Default collation for string comparisons
    baseUri?: string; // Base URI for resolving relative URIs
    implicitTimezone?: string; // Timezone as duration (e.g., '-PT5H')

    // Extension data (for custom implementations)
    extensions?: Record<string, any>;
}
```

### Usage Example

```typescript
import { createContext } from '@designliquido/xpath';

const context = createContext(rootNode, {
    xpathVersion: '2.0',
    defaultCollation: 'http://www.w3.org/2005/xpath-functions/collation/codepoint',
    baseUri: 'http://example.com/docs/',
    implicitTimezone: '-PT5H', // US Eastern Time
    extensions: {
        // Custom extension data
        myCustomData: {
            /* ... */
        },
    },
});
```

## Result Type Extensions

The `XPathResult` type has been extended to support future XPath versions:

```typescript
type XPathResult =
    | XPathNode[] // Node set (XPath 1.0) / sequence of nodes (XPath 2.0+)
    | string // String
    | number // Number
    | boolean // Boolean
    | any[] // Sequence (XPath 2.0+)
    | Map<any, any> // Map (XPath 3.0+)
    | Function; // Function item (XPath 3.0+)
```

### Sequence Support

XPath 2.0+ uses sequences as the fundamental data structure:

```typescript
import { toSequence, fromSequence, isSequence } from '@designliquido/xpath';

// Convert XPath 1.0 result to sequence
const sequence = toSequence([node1, node2]);
console.log(sequence.items); // [node1, node2]

// Convert sequence back to XPath 1.0 result
const result = fromSequence(sequence);

// Check if value is a sequence
if (isSequence(value)) {
    console.log('Items:', value.items);
}
```

## Expression System Extensibility

The expression system is designed for extension:

### Current Expression Types (XPath 1.0)

- `XPathExpression` - Base abstract class
- `XPathLocationPath` - Location paths (`/book/title`)
- `XPathStep` - Path steps with axes
- `XPathPredicate` - Predicates (`[position() > 1]`)
- `XPathFunctionCall` - Function calls
- `XPathArithmeticExpression` - Arithmetic operators
- `XPathLogicalExpression` - Logical operators (and/or)
- `XPathBinaryExpression` - Comparison operators
- `XPathUnaryExpression` - Unary minus
- `XPathUnionExpression` - Union operator (`|`)
- `XPathFilterExpression` - Filter expressions
- `XPathLiteral` - String/number literals
- `XPathVariableReference` - Variable references

### Future Expression Types (XPath 2.0+)

To be implemented:

- `XPathIfExpression` - `if-then-else` expressions
- `XPathForExpression` - FLWOR expressions
- `XPathQuantifiedExpression` - `some`/`every` expressions
- `XPathRangeExpression` - Range expressions (`1 to 10`)
- `XPathSequenceExpression` - Explicit sequences
- `XPathCastExpression` - Type casting
- `XPathInstanceOfExpression` - Type checking
- `XPathArrowExpression` - Arrow operator (XPath 3.0+)
- `XPathMapConstructor` - Map constructors (XPath 3.0+)
- `XPathArrayConstructor` - Array constructors (XPath 3.0+)

## Type System (XPath 2.0+)

A type system infrastructure has been prepared:

```typescript
interface XPathType {
    name: string; // 'xs:string', 'xs:integer', etc.
    category: 'atomic' | 'node' | 'function' | 'sequence';
    optional?: boolean; // Accepts empty sequence
    cardinality?: 'one' | 'zero-or-one' | 'zero-or-more' | 'one-or-more';
}
```

### Type Categories

1. **Atomic Types**: `xs:string`, `xs:integer`, `xs:decimal`, `xs:boolean`, `xs:date`, etc.
2. **Node Types**: `node()`, `element()`, `attribute()`, `text()`, `document-node()`, etc.
3. **Function Types**: `function(*)` (XPath 3.0+)
4. **Sequence Types**: Combinations of the above with cardinality indicators

## Implementation Roadmap

### Phase 1: XPath 2.0 Core (Priority)

1. **Sequences**
    - Replace node-set with sequence throughout
    - Implement sequence operators and functions
    - Update all existing functions to work with sequences

2. **Type System**
    - Atomic type definitions
    - Type casting (`cast as`, `castable as`)
    - Type checking (`instance of`)
    - Schema-aware type system (optional)

3. **New Expressions**
    - `if-then-else` expressions
    - Range expressions (`1 to 10`)
    - Quantified expressions (`some $x in ... satisfies ...`)

4. **FLWOR Expressions**
    - `for` clause
    - `let` clause
    - `where` clause
    - `order by` clause
    - `return` clause

5. **Function Library**
    - Add 100+ XPath 2.0 functions
    - Categorize by: String, Numeric, Date/Time, Sequence, etc.

### Phase 2: XPath 3.0 Extensions

1. **Higher-Order Functions**
    - Functions as values
    - Function items
    - Inline function expressions
    - Partial function application

2. **Map and Array**
    - Map data structure
    - Array data structure
    - Map/array functions

3. **Arrow Operator**
    - Pipeline-style function application

### Phase 3: XPath 3.1 Enhancements

1. **Map/Array Constructors**
    - `map{}` syntax
    - `array{}` syntax

2. **JSON Support**
    - `json-doc()` function
    - `parse-json()` function
    - JSON serialization

## Backward Compatibility

All versions maintain backward compatibility:

- XPath 1.0 expressions work in all versions
- Version detection is automatic
- Strict mode prevents accidental use of unimplemented features
- Non-strict mode allows experimentation

## Testing Strategy

### Current Tests (XPath 1.0)

- ✅ 390 tests covering all XPath 1.0 features
- ✅ 100% coverage of core expression types
- ✅ XSLT extensions integration tests

### Future Tests (XPath 2.0+)

- Version-specific test suites
- Feature flag tests
- Cross-version compatibility tests
- Performance benchmarks for new features

## Extension Mechanism

The architecture supports three types of extensions:

1. **XSLT Extensions** - Already implemented
    - XSLT-specific functions
    - Clean separation from XPath core

2. **Custom Functions** - Already supported
    - User-defined functions via context
    - Full access to evaluation context

3. **Version Extensions** - Prepared
    - Version-specific expression types
    - Version-specific function libraries
    - Feature flags for gradual rollout

## Development Guidelines

When implementing XPath 2.0+ features:

1. **Check version configuration** before parsing new syntax
2. **Use feature flags** to enable/disable functionality
3. **Maintain backward compatibility** - XPath 1.0 must always work
4. **Add comprehensive tests** for new features
5. **Update documentation** with version-specific behavior
6. **Consider performance** - sequences should be efficient

## Contributing

To contribute XPath 2.0+ features:

1. Review this document and the version infrastructure
2. Pick a feature from the implementation roadmap
3. Implement with version checks and feature flags
4. Add tests demonstrating the feature
5. Update documentation
6. Ensure all existing tests pass

## References

- [XPath 1.0 Specification](https://www.w3.org/TR/xpath-10/)
- [XPath 2.0 Specification](https://www.w3.org/TR/xpath20/)
- [XPath 3.0 Specification](https://www.w3.org/TR/xpath-30/)
- [XPath 3.1 Specification](https://www.w3.org/TR/xpath-31/)
- [XPath and XQuery Functions 3.1](https://www.w3.org/TR/xpath-functions-31/)
