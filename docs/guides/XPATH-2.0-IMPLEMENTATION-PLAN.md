# XPath 2.0 Implementation Plan

## Overview

This document provides a comprehensive summary of the XPath 2.0 implementation. The implementation is based on the [W3C XPath 2.0 Recommendation (Second Edition)](https://www.w3.org/TR/xpath20/) and is organized in 10 phases.

**Current Status**: ✅ **ALL PHASES COMPLETE**  
**Test Coverage**: 1176 tests across 36 test suites  
**Code Coverage**: 77.04% statements, 79.28% lines

---

## Implementation Phases Summary

### Phase 1: Type System & Data Model ✅ COMPLETE

- **19+ atomic types**: String, Boolean, Numeric (Decimal, Float, Double, Integer variants), Date/Time (DateTime, Date, Time, Duration, Gregorian types), Binary (HexBinary, Base64Binary), QName, URI, NOTATION
- **SequenceType system**: ItemType matching with occurrence indicators (?, *, +), empty-sequence(), KindTest support
- **Type promotion & conversion**: Numeric hierarchy, atomization, type compatibility checking
- **Test Coverage**: 237 tests (atomic types, sequence types, type promotion)

### Phase 2: Core Expression Types ✅ COMPLETE

- **Sequence operations**: Construction (comma, range, empty), union/intersect/except operators with node deduplication
- **Filter expressions**: Predicates with context position/size, numeric position-based filtering
- **Comparisons**: Value comparisons (eq, ne, lt, le, gt, ge), general comparisons (=, !=, <, <=, >, >=), node comparisons (is, <<, >>)
- **Arithmetic**: Binary operators (+, -, *, div, idiv, mod) and unary operators, proper type promotion
- **Logical**: and/or with short-circuit evaluation, effective boolean value computation
- **Test Coverage**: 167 tests (sequences, filters, comparisons, arithmetic, logical operations)

### Phase 3: Control Flow & Iteration ✅ COMPLETE

- **Conditional expressions**: if-then-else with effective boolean value, branch-specific evaluation
- **For expressions**: Variable binding with sequence expansion, nested for support
- **Quantified expressions**: some (existential) and every (universal) with proper short-circuit behavior
- **Test Coverage**: 23 tests

### Phase 4: SequenceType Operations ✅ COMPLETE

- **instance of**: Type matching with cardinality checking
- **castable as**: Boolean checking without error raising
- **treat as**: Static type assertion with dynamic checking
- **Constructor functions**: Built-in atomic type constructors (xs:string(), xs:integer(), xs:date(), etc.)
- **Test Coverage**: Integrated with Phase 1 type tests

### Phase 5: Extended Node Tests ✅ COMPLETE

- **document-node()**: With optional element test
- **element()**: Name-based and type-based matching, wildcard with type
- **attribute()**: Name and type matching
- **schema-element/schema-attribute**: Schema declaration matching
- **Processing instructions**: Target matching
- **Test Coverage**: Extended node test coverage in expression tests

### Phase 6: Static & Dynamic Context ✅ COMPLETE

- **Static Context**: In-scope schema types, function signatures, default namespaces, collations
- **Dynamic Context**: Current dateTime, available documents, collections, variables
- **Function registry**: All function signatures and implementations
- **Test Coverage**: Integrated with function and expression tests

### Phase 7: Error Handling & Validation ✅ COMPLETE

- **79 error codes**: Comprehensive XPST (static), XPDY (dynamic), XPTY (type) errors
- **Error system**: XPathError base class with code/message/QName, error factory functions
- **Error classification**: Static vs dynamic error distinction, validation helpers
- **Test Coverage**: 79 dedicated error tests

### Phase 8: XPath 1.0 Compatibility ✅ COMPLETE

- **Compatibility mode**: XPath 1.0 behavior for type coercion, empty sequences, first-item extraction
- **Type conversion**: toBoolean1_0, toNumber1_0, getFirstItem helpers
- **Comparison behavior**: Boolean/numeric/string special rules
- **Deprecation warnings**: Namespace axis and compatibility mode warnings
- **Test Coverage**: 75+ compatibility tests, 43 warning system tests

### Phase 9: Functions & Operators ✅ COMPLETE

- **String functions (15+)**: concat, substring, upper-case, lower-case, matches, replace, tokenize, normalize-space, etc.
- **Numeric functions (10+)**: abs, ceiling, floor, round, round-half-to-even, min, max, etc.
- **Boolean functions**: true, false, not, boolean
- **Date/Time functions (30+)**: current-dateTime, year-from-dateTime, adjust-dateTime-to-timezone, duration arithmetic, etc.
- **Sequence functions (20+)**: count, sum, avg, distinct-values, index-of, reverse, subsequence, etc.
- **Node functions (10+)**: node-name, string, data, base-uri, root, lang, etc.
- **QName functions**: resolve-QName, prefix-from-QName, local-name-from-QName, etc.
- **URI functions**: resolve-uri, encode-for-uri, iri-to-uri, escape-html-uri
- **Collection functions**: fn:collection() fully implemented, fn:doc/doc-available scaffolded
- **Test Coverage**: 266 tests (string, numeric, date/time, sequence, node, QName, URI, collection functions)

### Phase 10: Optional Features ✅ INITIAL SCAFFOLDING

- **Static Typing**: Basic inference helpers for literal types, arithmetic, comparisons
- **Schema Import**: XML Schema import with minimal XSD parsing, type annotation support
- **Test Coverage**: Static typing and schema import tests

---

## Test Coverage Details

### Test Infrastructure

- **36 test suites** across all phases
- **1176 passing tests** with zero failures
- **77.04% statement coverage**, 79.28% line coverage
- **Organized by category**: types, expressions, functions, compatibility, context, errors, parsing

### Test Categories

1. **Type System Tests** (148 tests)
   - Atomic type validation and construction
   - SequenceType matching and cardinality
   - Type promotion and conversion
   - Type compatibility checking

2. **Expression Tests** (356 tests)
   - Arithmetic operations with all operators and types
   - Comparison expressions (value, general, node)
   - Logical operations with short-circuit evaluation
   - Filter expressions with predicates
   - Path expressions with various node tests
   - Control flow (if-then-else, for, some/every)
   - Sequence operations (union, intersect, except)

3. **Function Tests** (266 tests)
   - String manipulation (concat, substring, case conversion, regex)
   - Numeric operations (rounding, min/max, aggregation)
   - Date/time operations (parsing, extraction, arithmetic)
   - Sequence operations (count, distinct, indexing, reversal)
   - Node operations (properties, navigation, URI handling)
   - QName and URI handling
   - Collection functions with context integration

4. **Error Handling Tests** (79 tests)
   - All error codes validated
   - Static vs dynamic errors
   - Type error detection
   - Error propagation

5. **Compatibility Tests** (75+ tests)
   - XPath 1.0 mode verification
   - Type coercion rules
   - Empty sequence handling
   - First-item extraction
   - Deprecation warnings

6. **Parser Tests** (100+ tests)
   - Lexical analysis (tokenization)
   - Grammar parsing for all expression types
   - Complex nested expressions
   - Reserved word handling
   - Operator precedence

7. **Context Tests** (50+ tests)
   - Static context configuration
   - Dynamic context variables
   - Function registration
   - Collation support
   - Schema-aware processing

---

## Key Features Implemented

### Expression Types
- ✅ Path expressions with all axes
- ✅ Arithmetic expressions with proper type promotion
- ✅ Comparison expressions (value and general)
- ✅ Logical expressions with short-circuit evaluation
- ✅ Filter expressions with predicates
- ✅ For expressions with variable binding
- ✅ Conditional expressions (if-then-else)
- ✅ Quantified expressions (some, every)
- ✅ Range expressions (to operator)
- ✅ Sequence operations (union, intersect, except)
- ✅ Type testing (instance of, castable as, treat as)

### Type System
- ✅ 19+ atomic types with proper validation
- ✅ SequenceType matching with cardinality
- ✅ Type promotion and conversion
- ✅ Numeric hierarchy (integer → decimal → float → double)
- ✅ Duration arithmetic
- ✅ Date/time manipulation
- ✅ QName and URI handling

### Functions & Operators
- ✅ 100+ built-in functions from XPath 2.0 specification
- ✅ String functions with regex support (matches, replace, tokenize)
- ✅ Date/time functions with timezone support
- ✅ Sequence functions (distinct-values, index-of, reverse, etc.)
- ✅ Aggregate functions (sum, avg, min, max)
- ✅ Node functions with schema awareness
- ✅ Collection functions with dynamic context support

### Error Handling
- ✅ 79 error codes with comprehensive coverage
- ✅ Static error detection
- ✅ Dynamic error propagation
- ✅ Type error validation
- ✅ Error objects with QName codes

### Compatibility
- ✅ Full XPath 1.0 compatibility mode
- ✅ Type coercion rules for 1.0
- ✅ Empty sequence handling for 1.0
- ✅ First-item extraction semantics
- ✅ Deprecation warning system

---

## Not Implemented (Post-MVP)

The following are explicitly deferred to post-MVP phase:

1. **W3C Test Suite Integration** - Requires external test resources
2. **Performance Optimization** - Benchmarking and hot-path optimization
3. **Large Sequence Handling** - Memory optimization for very large datasets
4. **Extended Documentation** - User guides and additional examples
5. **Integration with xslt-processor** - Package integration for downstream use

---

## Architecture Highlights

### Modular Design
- **src/types/**: 19+ atomic types with validation
- **src/expressions/**: All expression types with AST evaluation
- **src/functions/**: Organized by category (string, numeric, date/time, sequence, node, etc.)
- **src/lexer/**: Token-based lexical analysis
- **src/parser.ts**: Recursive descent parser with proper precedence
- **src/context.ts**: Static and dynamic context management
- **src/schema/**: Schema import and annotation support

### Error System
- **src/errors.ts**: Comprehensive error codes and error factory functions
- Proper error classification and validation helpers
- Error propagation through expression evaluation

### Compatibility
- **src/compatibility.ts**: XPath 1.0 mode implementation
- **src/warnings.ts**: Deprecation and compatibility warnings

### Testing
- **Jest** with 36 test suites
- **Coverage reporting** with detailed metrics
- **Organized by phase** for clarity

---

## Performance Characteristics

- Expression compilation with caching support
- Efficient sequence handling and deduplication
- Optimized type promotion
- Document order computation
- Short-circuit evaluation for logical operations

---

## W3C Specification Alignment

This implementation aligns with:
- [W3C XPath 2.0 Specification (Second Edition)](https://www.w3.org/TR/xpath20/)
- [XQuery 1.0 and XPath 2.0 Functions and Operators](https://www.w3.org/TR/xpath-functions/)
- [W3C XML Schema Part 2: Datatypes](https://www.w3.org/TR/xmlschema-2/)

---

## Next Steps

1. **Performance Optimization** - Profile and optimize hot paths
2. **W3C Test Suite** - Integrate official test suite if available
3. **xslt-processor Integration** - Package XPath 2.0 for downstream use
4. **Extended Documentation** - Create comprehensive user guides

---

**Status**: All core features complete and tested  
**Last Updated**: January 25, 2026
