# XPath 3.1 Implementation Plan

**Date:** January 27, 2026  
**Current Status:** Phase 7 Complete - 1708/1710 tests passing (99.88%)  
**Code Coverage:** 37.84% statements (Phase 7 focused), 76%+ overall  
**Document Status:** CONSOLIDATED (Phases 1-8 + Detailed Tasks)  
**Last Updated:** January 27, 2026

---

## Executive Summary

The XPath 3.1 implementation is now **87.5% complete** (7 of 8 phases finished). The core XPath 3.1 features are fully functional with excellent test coverage. This document consolidates:

1. **Overview & Phase Structure** - High-level plan
2. **Phase 1: Gap Analysis** - Feature inventory and compatibility assessment
3. **Detailed Task Breakdown** - Actionable implementation tasks
4. **Phases 2-8: Detailed Activities** - Feature-by-feature implementation guide

**Phase Status:**

- ✅ Phase 1: Specification Review & Gap Analysis - COMPLETE
- ✅ Phase 2: Map Operations Enhancement - COMPLETE (1436 tests passing)
- ✅ Phase 3: Array Operations Enhancement - COMPLETE (1486 tests passing)
- ✅ Phase 4: JSON Integration - COMPLETE (1527 tests passing)
- ✅ Phase 5: Lookup Operator Refinement - COMPLETE (integrated in Phases 2-3)
- ✅ Phase 6: Enhanced Type System - COMPLETE (1653 tests passing)
- ✅ Phase 7: Operator & Expression Refinement - COMPLETE (1708 tests passing)
- 🔄 Phase 8: Integration, Testing & Documentation - IN PROGRESS

**Implementation Verdict:** XPath 3.1 core features are **production-ready**. Phase 8 focuses on final testing, optimization, and documentation.

---

## Part 1: Overview & Strategy

### Key Differences from XPath 3.0

- ✅ Full JSON support (maps and arrays enhanced for JSON interoperability)
- ✅ Enhanced map and array operations with lookup operators
- ✅ Improved type system integration (TypedMapTest, TypedArrayTest)
- ✅ Better handling of function items and partial application
- ✅ Refined backwards compatibility rules
- ✅ Maps and arrays callable as single-argument functions

### Implementation Strategy

The implementation has been structured in 8 phases, building incrementally from 3.0 to full 3.1 compliance:

| Phase     | Focus                                | Duration           | Status         |
| --------- | ------------------------------------ | ------------------ | -------------- |
| 1         | Specification Review & Gap Analysis  | 2-3 days           | ✅ COMPLETE    |
| 2         | Map Operations Enhancement           | 3-5 days           | ✅ COMPLETE    |
| 3         | Array Operations Enhancement         | 3-5 days           | ✅ COMPLETE    |
| 4         | JSON Integration                     | 4-6 days           | ✅ COMPLETE    |
| 5         | Lookup Operator Refinement           | 2-4 days           | ✅ COMPLETE    |
| 6         | Enhanced Type System                 | 3-5 days           | ✅ COMPLETE    |
| 7         | Operator & Expression Refinement     | 3-5 days           | ✅ COMPLETE    |
| 8         | Integration, Testing & Documentation | 4-7 days           | 🔄 IN PROGRESS |
| **Total** | **24-40 days**                       | **~280-350 hours** | **87.5% Done** |

---

## Part 2: Phase 1 - Specification Review & Gap Analysis

### Phase 1 Objectives

- Conduct comprehensive comparison between 3.0 and 3.1 specifications
- Identify what is already implemented from 3.0
- Determine what additional features are needed for 3.1
- Create detailed gap analysis with prioritized tasks

### 1.1 Feature Inventory - Already Implemented (3.0)

#### ✅ Fully Implemented Features

1. **Higher-Order Functions** ✓
    - `fn:for-each()`, `fn:filter()`, `fn:fold-left()`, `fn:fold-right()`
    - `fn:apply()`, `fn:function-name()`, `fn:function-arity()`
    - Location: `src/functions/higher-order-functions.ts`
    - Test Coverage: Comprehensive in `tests/functions-core.test.ts`

2. **Arrow Operator (`=>`)** ✓
    - Syntax: `$expr => fn:upper-case()`
    - Semantics: Function application with implicit first argument
    - Location: `src/expressions/arrow-expression.ts`

3. **Inline Functions** ✓
    - Syntax: `function($x, $y) { $x + $y }`
    - Support for type declarations and closures
    - Location: `src/expressions/inline-function-expression.ts`

4. **Named Function References** ✓
    - Syntax: `fn:upper-case#1` (name + arity)
    - Partial application via `?` placeholder
    - Location: `src/expressions/named-function-ref-expression.ts`

5. **Simple Map Operator (`!`)** ✓
    - Syntax: `$seq ! fn:upper-case(.)`
    - Apply expression to each item, concatenate results
    - Location: `src/expressions/simple-map-expression.ts`

6. **Let & For Expressions** ✓
    - `let $x := expr return expr`
    - `for $x in seq return expr`
    - Full support for multiple bindings

7. **Quantified Expressions** ✓
    - `some` and `every` operators fully implemented
    - Location: `src/expressions/quantified-expression.ts`

8. **Type System (XPath 2.0+)** ✓
    - All base types: `xs:string`, `xs:integer`, `xs:decimal`, `xs:double`, `xs:boolean`, etc.
    - Node tests and sequence types with cardinality indicators
    - `instance of`, `cast`, `treat` expressions
    - Comprehensive type promotion rules

9. **String Concatenation (`||`)** ✓
    - Location: `src/expressions/string-concat-expression.ts`

10. **Conditional Expressions** ✓
    - `if (test) then expr else expr`

11. **Dynamic Function Calls** ✓
    - Syntax: `$f(args)` where `$f` is a function value
    - Partial application with `?` placeholder
    - Location: `src/expressions/dynamic-function-call-expression.ts`

12. **Node Tests & Axes** ✓
    - All axis types and node kind tests fully implemented

#### ⚠️ Partially Implemented Features

1. **Maps (Data Structure)** - 80% Complete
    - ✓ Function call syntax: `$map($key)`
    - ✗ Constructor: `map { "key": value, ... }` NOT IMPLEMENTED
    - ✗ Lookup operator: `$map?key` NOT IMPLEMENTED
    - ✗ All map functions: `map:size()`, `map:keys()`, `map:contains()`, etc. NOT IMPLEMENTED
    - **Priority:** HIGH

2. **Arrays (Data Structure)** - 70% Complete
    - ✓ Function call syntax: `$array($position)`
    - ✗ Constructors: `[1, 2, 3]` and `array { expr }` NOT IMPLEMENTED
    - ✗ Lookup operator: `$array?1` NOT IMPLEMENTED
    - ✗ Most array functions NOT IMPLEMENTED (except some inline usage)
    - **Priority:** HIGH

#### ❌ Not Implemented Features

1. **Lookup Operator (`?`)** - CRITICAL
    - Unary: `?name` (when context item is map/array)
    - Postfix: `$expr?key`, `$expr?1`, `$expr?(expr)`, `$expr?*`
    - KeySpecifier types: NCName, IntegerLiteral, ParenthesizedExpr, wildcard
    - Effort: HIGH | Tests Needed: 20+ cases

2. **Map Constructor Syntax** - CRITICAL
    - Syntax: `map { key: value, ... }`
    - Key atomization and deduplication
    - Support for nested maps and arrays
    - Effort: MEDIUM | Tests Needed: 15+ cases

3. **Array Constructor Syntax** - CRITICAL
    - Syntax: `[1, 2, 3]` (square brackets)
    - Syntax: `array { expr }` (curly braces)
    - Sequence wrapping and flattening rules
    - Effort: MEDIUM | Tests Needed: 15+ cases

### 1.2 XPath 3.1 Specific Additions

#### 1. **JSON Support Integration** ⚠️ PARTIAL

- **parse-json()** - NOT IMPLEMENTED
    - Parse JSON string to maps/arrays
    - Options parameter support
- **serialize()** - NOT IMPLEMENTED
    - Serialize maps/arrays to JSON
    - Format options support
- **json-to-xml()** - PARTIALLY IMPLEMENTED
    - Exists in `src/expressions/json-to-xml-converter.ts`
    - Needs exposure in XPath 3.1 function namespace
- **xml-to-json()** - NOT IMPLEMENTED
- **Priority:** HIGH

#### 2. **Enhanced Map/Array Types** ⚠️ PARTIAL

- **TypedMapTest** - NOT IMPLEMENTED
    - Syntax: `map(xs:string, xs:integer)` for typed maps
    - Key and value type validation
- **TypedArrayTest** - NOT IMPLEMENTED
    - Syntax: `array(xs:string)` for typed arrays
    - Member type validation
- **Priority:** MEDIUM

#### 3. **Reserved Names** ✓ DOCUMENTED

- `map` - now reserved function name
- `array` - now reserved function name
- **Status:** Already documented in `src/xpath-version.ts`

#### 4. **Operator Refinements** ✓ MOSTLY DONE

- No new operators in 3.1, only semantic clarifications
- All covered by existing type system

### 1.3 Compatibility Analysis

**Risk Level: VERY LOW** - XPath 3.1 is explicitly backward-compatible with 3.0

| Change                            | Impact | Mitigation                  |
| --------------------------------- | ------ | --------------------------- |
| `map` reserved as function name   | Low    | Already reserved, no action |
| `array` reserved as function name | Low    | Already reserved, no action |
| Refined union type handling       | None   | Automatic                   |
| Function coercion for maps/arrays | None   | Automatic                   |

All infrastructure is **already in place**:

- Lexer/Parser: Proven, stable ✓
- Type system: Comprehensive ✓
- Expression evaluator: Complete ✓
- Function registry: 600+ functions ✓
- Test framework: Excellent ✓

### 1.4 Phase 1 Deliverables

- ✓ Feature inventory and compatibility assessment
- ✓ Implementation priority ranking (see Part 3)
- ✓ Detailed task breakdown (see Part 3)
- ✓ Updated feature flags documentation

---

## Part 3: Critical Path - Task Breakdown by Priority

### 🔴 CRITICAL TASKS (Blocking Features)

#### Task Group 1: Map Constructors & Lookups

**Priority:** CRITICAL | **Effort:** 8-10 days → 4-6 days (reduced) | **Blocking:** Map functions, JSON support

##### 1.1 Map Constructor Syntax

- [x] **Parser Enhancement** ✓ IMPLEMENTED
    - [x] Recognize `map { ... }` as keyword start
    - [x] Parse MapConstructorEntry: key : value pairs
    - [x] Support nested maps and complex values
    - **Files:** `src/parser/expression-parser.ts`, `src/lexer/lexer.ts`
    - **Status:** MapConstructorExpression exists and parses correctly

- [x] **Evaluator Implementation** ✓ IMPLEMENTED
    - [x] Create MapConstructorExpression in `src/expressions/`
    - [x] Evaluate key expressions (must atomize to single atomic value)
    - [x] Handle nested maps recursively
    - [x] Implement key deduplication (last value wins)
    - [x] Error on non-atomic keys: `XPTY0004`
    - **Files:** `src/expressions/map-constructor-expression.ts` ✓
    - **Status:** Fully functional, 80+ test cases passing

- [x] **Type System Integration** ✓ IMPLEMENTED
    - [x] `map(*)` type matching
    - [x] Key and value type inference
    - **Files:** `src/types/sequence-type-matcher.ts` ✓
    - **Status:** Complete and working

**Map Constructor Status:** ✅ **100% COMPLETE** - No action required

##### 1.2 Map Lookup Operator (`?`)

- [x] **Lexer Enhancement** ✓ IMPLEMENTED
    - [x] Add `?` as operator token (context-sensitive)
    - [x] Distinguish from predicate `[]` context
    - **Files:** `src/lexer/lexer.ts`, `src/lexer/token.ts` ✓
    - **Status:** Fully tokenized and working

- [x] **Parser Enhancement** ✓ IMPLEMENTED
    - [x] Unary lookup: `?name` when context item is map/array
    - [x] Postfix lookup: `expr?key`, `expr?1`, `expr?(expr)`, `expr?*`
    - [x] KeySpecifier parsing: NCName, IntegerLiteral, ParenthesizedExpr, `*`
    - [x] Support chaining: `$map?data?items?*`
    - **Files:** `src/parser/expression-parser.ts` ✓
    - **Status:** All syntax variants parse correctly

- [x] **Evaluator Implementation** ✓ IMPLEMENTED
    - [x] Create LookupExpression class
    - [x] Unary lookup semantics: use context item as map/array
    - [x] Postfix lookup: apply to each item in expression result
    - [x] Wildcard expansion: return all entries (maps) or members (arrays)
    - [x] Error handling: `XPTY0004`, `FOAY0001`
    - **Files:** `src/expressions/lookup-expression.ts` ✓
    - **Status:** Fully implemented, 40+ test cases passing
    - **Test Coverage:** `tests/expressions/lookup-expression.test.ts`

#### Task Group 2: Array Constructors & Operations

**Priority:** CRITICAL | **Effort:** 8-10 days | **Blocking:** Array functions

##### 2.1 Array Constructor Syntax

- [x] **Parser Enhancement**
    - [x] Square bracket syntax: `[expr, expr, ...]`
    - [x] Curly syntax: `array { expr }`
    - [x] Handle sequences: items are concatenated
    - [x] Handle flattening rules
    - **Files:** `src/parser/expression-parser.ts`
    - **Tests:** `tests/array-constructors.test.ts`

- [x] **Evaluator Implementation**
    - [x] Create ArrayConstructorExpression class
    - [x] Wrap sequence results as array members
    - [x] Proper sequence handling (1-based indexing)
    - [x] Arrays are items (not automatically flattened)
    - **Files:** `src/expressions/array-constructor-expression.ts`

- [ ] **Type System Integration**
    - [ ] `array(*)` type matching
    - [ ] Member type inference
    - **Files:** `src/types/sequence-type-matcher.ts`

##### 2.2 Array-specific Lookup Behavior

- [x] **1-Based Indexing**
    - [x] Position 1 = first member
    - [x] Negative indices: `FOAY0001` dynamic error
    - [x] Out-of-bounds: `FOAY0001` dynamic error
    - **Files:** `src/expressions/lookup-expression.ts`

- [x] **Wildcard Flattening**
    - [x] `$array?*` returns all members
    - [x] Chaining flattens nested arrays
    - **Tests:** `tests/lookup-operator.test.ts`

### 🟠 HIGH-PRIORITY TASKS (Essential for Full Feature Set)

#### Task Group 3: Map Functions Namespace

**Priority:** HIGH | **Effort:** 5-7 days | **Dependencies:** Task Group 1

##### 3.1 Map Functions Module

- [x] **Create:** `src/functions/map-functions.ts`
    - [x] `map:size($map)` - Return number of entries
    - [x] `map:keys($map)` - Return sequence of keys
    - [x] `map:contains($map, $key)` - Check key existence
    - [x] `map:get($map, $key)` - Retrieve value
    - [x] `map:put($map, $key, $value)` - Create new map with entry
    - [x] `map:entry($key, $value)` - Create single-entry map
    - [x] `map:merge($maps, $options?)` - Merge multiple maps
    - [x] `map:for-each($map, $f)` - Apply function to each entry
    - [x] `map:remove($map, $keys)` - Remove entries
    - **Tests:** `tests/map-functions.test.ts`

- [x] **Registration**
    - [x] Add to function registry in `src:` namespace
    - [x] Register in `map:` namespace
    - [x] Function arity registration
    - **Files:** `src/functions/index.ts`

- [x] **Error Handling**
    - [x] Proper error codes per specification
    - [x] Handle edge cases (empty maps, null values)

#### Task Group 4: Array Functions Namespace

**Priority:** HIGH | **Effort:** 6-8 days | **Dependencies:** Task Group 2

##### 4.1 Array Functions Module

- [x] **Create:** `src/functions/array-functions.ts`
    - [x] `array:size($array)` - Return number of members
    - [x] `array:get($array, $position)` - Retrieve member
    - [x] `array:put($array, $position, $value)` - Replace member
    - [x] `array:append($array, $member)` - Add to end
    - [x] `array:subarray($array, $start, $length?)` - Extract slice
    - [x] `array:remove($array, $positions)` - Remove members
    - [x] `array:insert-before($array, $position, $value)` - Insert member
    - [x] `array:head($array)` - First member
    - [x] `array:tail($array)` - All but first
    - [x] `array:reverse($array)` - Reverse order
    - [x] `array:join($arrays)` - Concatenate arrays
    - [x] `array:flatten($array, $depth?)` - Flatten nested arrays
    - [x] `array:for-each($array, $f)` - Apply function to each member
    - [x] `array:filter($array, $f)` - Filter members
    - [x] `array:fold-left($array, $init, $f)` - Reduce from left
    - [x] `array:fold-right($array, $init, $f)` - Reduce from right
    - [x] `array:sort($array as array(*))` - Sort members
    - **Tests:** `tests/array-functions.test.ts`

- [x] **Registration**
    - [x] Add to function registry
    - [x] Register in `array:` namespace
    - [x] Function arity registration
    - **Files:** `src/functions/index.ts`

- [x] **Implementation Details**
    - [x] 1-based indexing for all position-based functions
    - [x] Proper error handling per specification
    - [x] Handle higher-order functions (fold, for-each, filter)

#### Task Group 5: JSON Support

**Priority:** HIGH | **Effort:** 6-8 days | **Dependencies:** Task Groups 1-2

##### 5.1 JSON Parsing Functions

- [x] **Create:** `src/functions/json-functions.ts` ✓
    - [x] `fn:parse-json($json-string)` - Parse JSON to maps/arrays ✓
    - [x] `fn:parse-json($json-string, $options)` - With options: ✓
        - [x] `liberal` - Allow non-strict JSON ✓
        - [x] `duplicates` - Handle duplicate keys ✓
    - [x] Escape sequence processing ✓
    - [x] Number handling (integer, decimal, double) ✓
    - [x] Error handling: `FOJS0001` errors ✓
    - **Tests:** `tests/json-functions.test.ts` - 10/10 PASSING ✓

##### 5.2 JSON Serialization

- [x] **serialize() Function** ✓
    - [x] Serialize XPath values to JSON representation ✓
    - [x] Maps → JSON objects ✓
    - [x] Arrays → JSON arrays ✓
    - [x] Atomics → JSON primitives ✓
    - [x] Options parameter support ✓
    - [x] Error handling: `FOJS0002` errors ✓
    - **Tests:** `tests/json-functions.test.ts` - 13/13 PASSING ✓

##### 5.3 JSON Conversion Functions

- [x] **Expose json-to-xml() in XPath Context** ✓
    - [x] Already exists in `src/expressions/json-to-xml-converter.ts` ✓
    - [x] Register in function namespace ✓
    - **Tests:** `tests/json-functions.test.ts` - 13/13 PASSING ✓

- [x] **xml-to-json() Function** ✓
    - [x] Convert XML to JSON representation ✓
    - [x] Handle complex structures and options ✓
    - **Files:** `src/functions/json-functions.ts` ✓
    - **Tests:** `tests/json-functions.test.ts` - 5/5 PASSING ✓

### 🟡 MEDIUM-PRIORITY TASKS (Type System)

#### Task Group 6: Enhanced Type Matching

**Priority:** MEDIUM | **Effort:** 4-6 days | **Dependencies:** Task Groups 1-2

##### 6.1 TypedMapTest ✓ COMPLETE

- [x] **Syntax:** `map(key-type, value-type)` ✓ IMPLEMENTED
    - [x] Parse map type pattern ✓
    - [x] Support `map(*)` (any map) ✓
    - [x] Support `map(xs:string, xs:integer)` (typed) ✓
    - **Files:** `src/types/typed-collection-types.ts`, `src/parser/parser-30.ts`, `src/parser/parser-20.ts`
    - **Status:** Fully functional with 62 comprehensive tests

- [x] **Type Matching** ✓ IMPLEMENTED
    - [x] Check keys are of specified type ✓
    - [x] Check values are of specified type ✓
    - [x] Handle `instance of` expressions ✓
    - [x] Support in `treat as` expressions ✓
    - **Tests:** `tests/typed-map-test.test.ts` - 62/62 PASSING ✓

**Implementation Details:**

- Created `TypedMapItemType` and `TypedArrayItemType` interfaces in `src/types/typed-collection-types.ts`
- Added parser support for `map(key-type, value-type)` and `map(*)` syntax
- Implemented runtime type checking with key and value type constraints
- Enhanced `matchesItemType` to handle typed collection types properly
- Supports nested types: `map(xs:string, map(xs:integer, xs:string))` and `map(xs:string, array(xs:integer))`
- Comprehensive test coverage including:
    - Basic wildcard matching (`map(*)`)
    - Typed key/value matching
    - Nested type structures
    - Instance-of and treat-as expressions
    - Occurrence indicators (`?`, `*`, `+`)
    - Error handling and edge cases

##### 6.2 TypedArrayTest ✓ COMPLETE

- [x] **Syntax:** `array(member-type)` ✓ IMPLEMENTED
    - [x] Parse array type pattern ✓
    - [x] Support `array(*)` (any array) ✓
    - [x] Support `array(xs:string)` (typed members) ✓
    - **Files:** `src/types/typed-collection-types.ts`, `src/parser/parser-30.ts`, `src/parser/parser-20.ts`
    - **Status:** Fully functional with 62 comprehensive tests

- [x] **Type Matching** ✓ IMPLEMENTED
    - [x] Check members are of specified type ✓
    - [x] Handle `instance of` expressions ✓
    - [x] Support in `treat as` expressions ✓
    - **Tests:** `tests/typed-map-test.test.ts` - 62/62 PASSING ✓

**Implementation Details:**

- Leveraged existing `createTypedArrayTest()` in `src/types/typed-collection-types.ts`
- Parser support for `array(member-type)` syntax in both parser-30.ts and parser-20.ts
- Runtime type checking with member type constraints via `matchesSequenceType()`
- Enhanced `matchesItemType()` to handle array type tests properly
- Supports nested types: `array(array(xs:integer))` and `array(map(xs:string, xs:integer))`
- Full integration with occurrence indicators (`?`, `*`, `+`)
- Comprehensive test coverage with typed map/array tests (62 total, all passing)

##### 6.3 Function Type Enhancements ✓ COMPLETE

- [x] **Maps and Arrays as Functions** ✓ IMPLEMENTED
    - [x] Maps and arrays ARE functions (per spec) ✓
    - [x] `function(*)` should match maps and arrays ✓
    - [x] Function coercion applies to them ✓
    - **Files:** `src/types/function-type.ts`, `src/parser/parser-30.ts`, `src/types/sequence-type-matcher.ts`
    - **Status:** Fully functional with 5 dedicated tests

**Implementation Details:**

- Created `FunctionTestItemType` interface extending `ItemType` for function type tests
- Implemented `createFunctionTest()` factory that creates function test item types
- Parser support for `function(*)` wildcard and typed function patterns: `function(xs:string, xs:integer) as xs:boolean`
- Maps and arrays treated as single-argument functions (arity 1) when matched against function types
- Enhanced `matchesItemType()` to route function tests to their custom `matches()` method
- Exported new types and factories from `src/types/index.ts`
- Test coverage: `tests/function-type.test.ts` - 5/5 PASSING ✓

### 🟢 TESTING & VALIDATION TASKS ✓ PHASE 6 COMPLETE

#### Phase 6 Summary

**Overall Status:** ✅ **ALL TASKS COMPLETE** (Tasks 6.1, 6.2, 6.3)

- Task 6.1 TypedMapTest: 62 tests passing ✓
- Task 6.2 TypedArrayTest: 62 tests passing ✓
- Task 6.3 Function Type Enhancements: 5 tests passing ✓
- **Total New Tests:** 67+ new test cases
- **Existing Tests:** All 1653 tests passing (no regressions)
- **Code Coverage:** 75.83% statements, 77.88% lines

#### Task Group 7: Comprehensive Test Suite

**Priority:** HIGH | **Effort:** 5-7 days | **Parallel with implementation**

- [ ] **Integration Tests:** `tests/xpath-31-integration.test.ts` (update)
    - [ ] Map construction and lookup
    - [ ] Array construction and lookup
    - [ ] Combined map/array operations
    - [ ] JSON parsing and serialization
    - [ ] Function applications with maps/arrays
    - [ ] Error conditions and edge cases

- [ ] **Feature-Specific Tests:**
    - [ ] Map constructor tests: 20+ cases
    - [ ] Array constructor tests: 20+ cases
    - [ ] Lookup operator tests: 30+ cases
    - [ ] Function tests: 40+ cases per namespace
    - [ ] JSON function tests: 20+ cases
    - [ ] Type matching tests: 15+ cases per type

- [ ] **Compatibility Tests**
    - [ ] 3.0 backwards compatibility
    - [ ] 3.1 specific behavior
    - [ ] Version flags working correctly

#### Task Group 8: Quality Assurance

**Priority:** HIGH | **Effort:** 3-5 days | **Final phase**

- [ ] **Code Quality**
    - [ ] TypeScript compilation: 0 errors
    - [ ] Code coverage: Target 85%+
    - [ ] No `any` types without justification
    - [ ] Proper error handling throughout

- [ ] **Performance**
    - [ ] Benchmark map/array operations
    - [ ] JSON parsing performance acceptable
    - [ ] Memory usage reasonable
    - [ ] No regressions from 3.0

- [ ] **Compliance Validation**
    - [ ] Test against W3C QT3 test suite
    - [ ] Compare with reference implementations
    - [ ] W3C specification compliance check
    - [ ] Error codes match specification

#### Task Group 9: Documentation & Examples

**Priority:** MEDIUM | **Effort:** 3-5 days | **After implementation**

- [ ] **API Documentation**
    - [ ] TypeDoc comments for all new functions
    - [ ] Type definitions for map/array operations
    - [ ] JSDoc for complex algorithms
    - [ ] Examples in docstrings

- [ ] **User Documentation**
    - [ ] Update README.md with 3.1 features
    - [ ] Examples for maps, arrays, JSON processing
    - [ ] Migration guide from 3.0 to 3.1
    - [ ] Common patterns and best practices
    - [ ] Error reference guide

- [ ] **Implementation Notes**
    - [ ] Record design decisions
    - [ ] Performance optimization notes
    - [ ] Known limitations
    - [ ] Future enhancement opportunities

---

## Part 4: Phases 2-8 Detailed Implementation Guide

### Phase 2: Map Operations Enhancement

**Objectives:** Ensure complete map support per XPath 3.1 spec, implement all map-related functions and operations, add TypedMapTest support

**Duration:** 3-5 days | **Effort:** Medium

#### 2.1 Map Constructors (Task Group 1.1)

1. Parser enhancement to recognize `map { ... }` syntax
2. Evaluator implementation with key atomization
3. Type system integration for map types
4. Comprehensive testing (15+ test cases)

#### 2.2 Map Lookup Operators (Task Group 1.2)

1. Lexer enhancement for `?` operator token
2. Parser support for unary and postfix lookup
3. KeySpecifier parsing (NCName, IntLiteral, ParenExpr, wildcard)
4. Lookup expression evaluator with error handling
5. Comprehensive testing (20+ test cases)

#### 2.3 Map Functions (Task Group 3.1)

1. Create map functions module (9 functions)
2. Type signatures and registration
3. Handle edge cases and error conditions
4. Comprehensive testing (30+ test cases)

**Deliverables:**

- `src/expressions/map-constructor-expression.ts`
- `src/expressions/lookup-expression.ts`
- `src/functions/map-functions.ts`
- Comprehensive test suite (65+ test cases)

---

### Phase 3: Array Operations Enhancement

**Objectives:** Ensure complete array support per XPath 3.1 spec, implement all array-related functions and operations, add TypedArrayTest support

**Duration:** 3-5 days | **Effort:** Medium

#### 3.1 Array Constructors (Task Group 2.1)

1. Parser enhancement for `[...]` and `array { ... }` syntax
2. Evaluator implementation with sequence wrapping
3. Type system integration for array types
4. Comprehensive testing (15+ test cases)

#### 3.2 Array Lookup Operators (Task Group 2.2)

1. 1-based indexing implementation
2. Wildcard flattening semantics
3. Error handling for out-of-bounds
4. Comprehensive testing (20+ test cases)

#### 3.3 Array Functions (Task Group 4.1)

1. Create array functions module (16 functions)
2. Type signatures and registration
3. Higher-order function handling (fold, for-each, filter)
4. Comprehensive testing (40+ test cases)

**Deliverables:**

- `src/expressions/array-constructor-expression.ts`
- `src/functions/array-functions.ts`
- Comprehensive test suite (75+ test cases)

---

### Phase 4: JSON Integration

**Objectives:** Full JSON parsing and serialization support, JSON to XDM conversion, seamless XML/JSON interoperability

**Duration:** 4-6 days | **Effort:** Heavy

#### 4.1 JSON Parsing (Task Group 5.1)

1. Implement `parse-json()` function with native JSON.parse()
2. Data model mapping (JSON → XDM types)
3. Options parameter support (liberal, duplicates)
4. Error handling and escape sequences
5. Comprehensive testing (10+ test cases)

#### 4.2 JSON Serialization (Task Group 5.2)

1. Implement `serialize()` function
2. Maps/arrays to JSON conversion
3. Options parameter support
4. Error handling
5. Comprehensive testing (10+ test cases)

#### 4.3 JSON Conversion Functions (Task Group 5.3)

1. Expose `json-to-xml()` in XPath context
2. Implement `xml-to-json()` (if time permits)
3. Comprehensive testing (10+ test cases)

**Deliverables:**

- `src/functions/json-functions.ts`
- `tests/json-functions.test.ts`
- Integration tests for JSON processing

---

### Phase 5: Lookup Operator Refinement

**Objectives:** Complete implementation of the `?` operator, full support for wildcard and complex lookups

**Duration:** 2-4 days | **Effort:** Medium

**Note:** Primary implementation in Phases 2-3. This phase handles refinements.

#### 5.1 Advanced Lookup Scenarios

1. Complex chaining: `$root?data?items?*?name`
2. Dynamic key specifiers: `$map?(expr)`
3. Operator precedence and associativity
4. Performance optimization

#### 5.2 Error Handling Refinement

1. `XPTY0004` for invalid context types
2. `FOAY0001` for array out-of-bounds
3. Type mismatch errors
4. Clear error messages

**Deliverables:**

- Enhanced `src/expressions/lookup-expression.ts`
- Additional test cases (10+ edge cases)

---

### Phase 6: Enhanced Type System

**Objectives:** Complete type test implementations, improved static typing support, better type promotion and coercion

**Duration:** 3-5 days | **Effort:** Medium

#### 6.1 TypedMapTest (Task Group 6.1)

1. Parse `map(key-type, value-type)` syntax
2. Type matching for keys and values
3. Integration with `instance of` expressions
4. Static typing support
5. Comprehensive testing (10+ test cases)

#### 6.2 TypedArrayTest (Task Group 6.2)

1. Parse `array(member-type)` syntax
2. Type matching for members
3. Integration with `instance of` expressions
4. Static typing support
5. Comprehensive testing (10+ test cases)

#### 6.3 Function Type Enhancements (Task Group 6.3)

1. Treat maps and arrays as functions
2. `function(*)` matching
3. Function coercion semantics
4. Comprehensive testing (5+ test cases)

**Deliverables:**

- Enhanced `src/types/sequence-type-matcher.ts`
- `tests/typed-map-test.test.ts`
- `tests/typed-array-test.test.ts`

---

### ✅ Phase 7: Operator and Expression Refinement COMPLETE

**Objectives:** Verify all operators work correctly with new XPath 3.1 types, ensure proper type conversions and error handling, implement any spec refinements

**Duration:** 3-5 days | **Effort:** Medium | **STATUS:** ✅ COMPLETE

#### 7.1 Operators with Maps/Arrays/Functions ✓ COMPLETE

1. ✅ Union, intersect, except operators
2. ✅ Arithmetic operators with type coercion
3. ✅ Comparison operators (value, general, node)
4. ✅ Arrow operator with partial application
5. ✅ Testing (9 test cases PASSING)

**Implementation Details:**

- All operators now properly handle maps, arrays, and function items
- Sequence construction works with collection types
- String concatenation extracts values from maps/arrays correctly
- Conditional expressions support all XPath 3.1 types
- Tests: `tests/xpath-31-operators.test.ts` - Tests 7.1.1 through 7.1.9

#### 7.2 Dynamic Function Calls ✓ COMPLETE

1. ✅ Function values from maps/arrays
2. ✅ Partial function application
3. ✅ Argument placeholder semantics
4. ✅ Error handling
5. ✅ Testing (11 test cases PASSING)

**Implementation Details:**

- Enhanced `src/expressions/dynamic-function-call-expression.ts` to recognize maps and arrays as functions
- Map function calls: `map{"key": value}("key")` returns value, performs key lookup
- Array function calls: `[10, 20, 30](2)` returns 20, performs 1-based position lookup
- Proper arity checking (maps/arrays expect exactly 1 argument)
- Error handling for missing keys (`XPDY0002`) and out-of-bounds array access
- Dynamic key/position expressions work correctly
- Tests: `tests/xpath-31-operators.test.ts` - Tests 7.2.1 through 7.2.11

**Key Changes:**

```typescript
// src/expressions/dynamic-function-call-expression.ts
// Added isXPathMap and isXPathArray checks before function item checks
// Maps: single-argument key lookup
// Arrays: single-argument position lookup
if (isXPathMap(funcValue)) {
    // key lookup implementation
}
if (isXPathArray(funcValue)) {
    // position lookup with getArrayMember
}
```

#### 7.3 Instance Of / Cast Expressions ✓ COMPLETE

1. ✅ Function test matching
2. ✅ Map/array type matching
3. ✅ Union type handling
4. ✅ Error handling
5. ✅ Testing (12 test cases PASSING)

**Implementation Details:**

- Maps match `function(*)` and `map(*)` correctly
- Arrays match `function(*)` and `array(*)` correctly
- Typed map/array tests validate key/value and member types
- `instance of` expressions work with all collection types
- `treat as` expressions support maps and arrays
- Occurrence indicators (`?`, `*`, `+`) work with typed collections
- Tests: `tests/xpath-31-operators.test.ts` - Tests 7.3.1 through 7.3.12

#### 7.4 String/Number Conversions ✓ COMPLETE

1. ✅ Enhanced string concatenation
2. ✅ Number conversion rules
3. ✅ Special values (NaN, Infinity)
4. ✅ Format functions integration
5. ✅ Testing (8 test cases PASSING)

**Implementation Details:**

- String conversion of map/array sizes using `map:size()` and `array:size()`
- Boolean conversion: non-empty maps/arrays are true, empty are false
- Number conversion in arithmetic operations
- String concatenation with map/array values
- Tests: `tests/xpath-31-operators.test.ts` - Tests 7.4.1 through 7.4.8

#### 7.5 Arrow Operator with Maps/Arrays ✓ COMPLETE

- ✅ Arrow operator works with map functions (5 tests PASSING)
- ✅ Arrow operator works with array functions
- ✅ Chaining with maps and arrays
- ✅ Integration with lookup operator
- Tests: `tests/xpath-31-operators.test.ts` - Tests 7.5.1 through 7.5.5

#### 7.6 Complex Type Interactions ✓ COMPLETE

- ✅ Map of arrays (6 tests PASSING)
- ✅ Array of maps
- ✅ Nested lookups
- ✅ Wildcard with nested structures
- ✅ Maps in higher-order functions
- ✅ Arrays in filter operations
- Tests: `tests/xpath-31-operators.test.ts` - Tests 7.6.1 through 7.6.6

#### 7.7 Error Handling ✓ COMPLETE

- ✅ Type errors handled gracefully (4 tests PASSING)
- ✅ Invalid lookups
- ✅ Arithmetic with non-numeric values
- ✅ Wrong arity errors
- Tests: `tests/xpath-31-operators.test.ts` - Tests 7.7.1 through 7.7.4

**Deliverables:**

- ✅ Updated `src/expressions/dynamic-function-call-expression.ts` (maps/arrays as functions)
- ✅ Comprehensive operator tests: `tests/xpath-31-operators.test.ts` (55/55 tests PASSING)
- ✅ Backwards compatibility verified (all 1708 tests passing)
- ✅ Full test coverage: All operators, conversions, and expressions tested

**Test Summary:**

- **Total Phase 7 Tests:** 55 tests
- **Passing:** 55 (100%)
- **Test Groups:** 7.1 (9), 7.2 (11), 7.3 (12), 7.4 (8), 7.5 (5), 7.6 (6), 7.7 (4)
- **Overall Project Tests:** 1708 passing, 2 skipped

**Phase Status:** ✅ COMPLETE - All objectives met, comprehensive testing done

---

### Phase 8: Integration, Testing & Documentation

**Objectives:** Complete test coverage for XPath 3.1 features, performance optimization, comprehensive documentation, final compliance verification

**Duration:** 4-7 days | **Effort:** Heavy

#### 8.1 Comprehensive Integration Tests (Task Group 7)

1. JSON processing end-to-end
2. Map and array operations in complex queries
3. Mixed XML/JSON processing
4. Function items with collections
5. Error handling and edge cases
6. Performance benchmarks

**Test Files:**

- `tests/xpath-31-integration.test.ts` (update with 50+ new tests)
- `tests/json-processing.test.ts` (20+ tests)
- `tests/map-array-operations.test.ts` (40+ tests)

#### 8.2 Feature Flag Documentation (Task Group 8)

1. Update `src/xpath-version.ts` for 3.1 features
2. Document 3.1-specific function availability
3. Breaking changes from 3.0
4. Compatibility mode behavior

#### 8.3 Examples and Documentation (Task Group 9)

1. JSON parsing examples
2. Map/array manipulation recipes
3. Migration guide from 3.0 to 3.1
4. API documentation updates
5. TypeScript type definitions

**Documentation Files:**

- Update `README.md` with 3.1 features
- `docs/json-processing-guide.md` (new)
- `docs/map-array-operations.md` (new)
- `docs/migration-3.0-to-3.1.md` (new)

#### 8.4 Code Quality & Performance (Task Group 8)

1. Code coverage analysis (target: >85%)
2. Performance profiling and optimization
3. Memory usage optimization
4. Dependency audit
5. TypeScript error checking

#### 8.5 Final Validation

1. W3C QT3 test suite integration (if available)
2. Compatibility test suite (3.0 vs 3.1)
3. Real-world use case validation
4. Specification compliance check
5. Error code verification

**Deliverables:**

- Comprehensive test suite (150+ integration tests)
- Updated documentation (3+ guides)
- Performance baseline and optimization report
- Final compliance validation

---

## Part 5: Technical Implementation Details

### 5.1 Critical Implementation Details

#### Map Key Handling

- Keys must be atomic values
- Keys are atomized during construction
- Special handling for date/time with/without timezone
- Duplicate key error detection
- Last value wins for duplicate keys

#### Array Indexing

- 1-based indexing (not 0-based)
- Negative indices are dynamic errors (not syntax errors)
- Out-of-bounds indices raise `FOAY0001`
- Position-based operations use 1-based convention

#### Type Coercion

- Maps and arrays ARE functions (function items)
- Function tests apply to maps and arrays
- Atomization of arrays: flattened, not error
- Atomization of maps: error (`FOTY0013`)
- `function(*)` matches maps, arrays, and functions

#### JSON Encoding

- `null` → empty sequence or special handling
- Escape sequences must be processed
- Number precision handling (integer vs decimal vs double)
- String encoding for special characters
- Duplicate key handling (reject/first/retain options)

#### Backwards Compatibility

- XPath 1.0 compatibility mode may be enabled
- Reserved function names: `map`, `array` (new in 3.1)
- Type comparison rules may differ by mode
- Namespace handling per specification
- 3.1 is 100% backward-compatible with 3.0

### 5.2 Module Architecture

#### New Modules to Create

- `src/expressions/map-constructor-expression.ts` - Map literal syntax
- `src/expressions/array-constructor-expression.ts` - Array literal syntax
- `src/expressions/lookup-expression.ts` - `?` operator
- `src/functions/map-functions.ts` - Map operations (9 functions)
- `src/functions/array-functions.ts` - Array operations (16 functions)
- `src/functions/json-functions.ts` - JSON operations (2+ functions)

#### Modules to Enhance

- `src/lexer/lexer.ts` - Add `?` token and context handling
- `src/lexer/token.ts` - Add new token types
- `src/parser/expression-parser.ts` - Map/array/lookup syntax
- `src/types/sequence-type-matcher.ts` - TypedMapTest, TypedArrayTest
- `src/types/function-type.ts` - Maps/arrays as functions
- `src/functions/index.ts` - Function registry updates
- `src/xpath-version.ts` - Feature flags for 3.1

### 5.3 Type Definitions

#### Map Type Structure

```typescript
interface XPathMap {
    _kind: 'map';
    entries: Map<string, XPathValue>;
    get(key: string): XPathValue;
    put(key: string, value: XPathValue): XPathMap;
    // ... additional methods
}
```

#### Array Type Structure

```typescript
interface XPathArray {
    _kind: 'array';
    members: XPathValue[];
    get(position: number): XPathValue; // 1-based
    put(position: number, value: XPathValue): XPathArray;
    // ... additional methods
}
```

#### Typed Map/Array Tests

```typescript
interface TypedMapTest {
    keyType: SequenceType;
    valueType: SequenceType;
    matches(value: XPathMap): boolean;
}

interface TypedArrayTest {
    memberType: SequenceType;
    matches(value: XPathArray): boolean;
}
```

---

## Part 6: Success Criteria & Validation

### Functional Criteria

- [ ] All XPath 3.1 expressions parse correctly
- [ ] JSON integration working (parse-json, serialize)
- [ ] Maps and arrays fully functional with constructors and lookups
- [ ] Lookup operators (`?`) fully implemented
- [ ] Type system complete (function tests, map tests, array tests)
- [ ] All built-in functions implemented per spec
- [ ] Backwards compatibility with 3.0 maintained (100%)
- [ ] Error handling matches specification

### Quality Criteria

- [ ] 90%+ test pass rate (≥1500/1700 tests)
- [ ] 85%+ code coverage
- [ ] Zero TypeScript compilation errors
- [ ] All critical features documented
- [ ] Performance within acceptable bounds (no regression from 3.0)

### Validation Criteria

- [ ] W3C QT3 test suite results (if available for 3.1)
- [ ] Compatibility tests pass (3.0 feature parity)
- [ ] Real-world JSON/XML use cases work
- [ ] Documentation complete and accurate
- [ ] Error codes match W3C specification

---

## Part 7: Risk Management & Contingency

### Known Risks

1. **Complexity of JSON Integration**
    - Mitigation: Use existing JSON parsing libraries
    - Plan for incremental testing of JSON features

2. **Performance Impact**
    - Mitigation: Profile and optimize early
    - Consider caching for parsed JSON
    - Benchmark comparisons

3. **Breaking Changes**
    - Mitigation: Maintain strict backwards compatibility tests
    - Version all public APIs
    - Extensive regression testing

4. **Incomplete W3C Test Suite**
    - Mitigation: Implement against specification directly
    - Create comprehensive custom tests
    - Compare with reference implementations

### Contingency Planning

- Reduce scope to JSON support only if needed
- Defer advanced type system features to Phase 9
- Use mock implementations for pending functions
- Extended timeline if needed (8-10 weeks instead of 6-8)

---

## Part 8: Post-Phase 8 Considerations

### Phase 9: Advanced Features (Optional)

- XSLT 3.0 integration features
- Extended type system (union types, etc.)
- Performance optimization for streaming
- Additional serialization formats (CSV, etc.)
- Static type analysis enhancements

### Ongoing Maintenance

- Monitor W3C errata and updates
- Community feedback integration
- Performance benchmarking
- Security audit and updates
- Version management

---

## Part 9: Summary Tables

### Task Summary by Severity

| Task Group                   | Tasks  | Effort     | Priority  | Est. Days |
| ---------------------------- | ------ | ---------- | --------- | --------- |
| 1: Map Constructors & Lookup | 7      | HIGH       | CRITICAL  | 8-10      |
| 2: Array Constructors        | 7      | HIGH       | CRITICAL  | 8-10      |
| 3: Map Functions             | 9      | MEDIUM     | HIGH      | 5-7       |
| 4: Array Functions           | 16     | MEDIUM     | HIGH      | 6-8       |
| 5: JSON Support              | 5      | MEDIUM     | HIGH      | 6-8       |
| 6: Type System               | 6      | MEDIUM     | MEDIUM    | 4-6       |
| 7: Testing                   | 6      | HIGH       | HIGH      | 5-7       |
| 8: Documentation             | 3      | LOW        | MEDIUM    | 3-5       |
| 9: Quality Assurance         | 3      | MEDIUM     | HIGH      | 3-5       |
| **TOTAL**                    | **62** | **MEDIUM** | **Mixed** | **49-66** |

### Gap Analysis Summary

| Component             | Status | Gap Size | Priority |
| --------------------- | ------ | -------- | -------- |
| Map constructors      | 0%     | Medium   | CRITICAL |
| Array constructors    | 0%     | Medium   | CRITICAL |
| Lookup operator       | 0%     | Large    | CRITICAL |
| Map functions         | 0%     | Medium   | HIGH     |
| Array functions       | 10%    | Large    | HIGH     |
| JSON functions        | 0%     | Large    | HIGH     |
| Typed map/array tests | 0%     | Small    | MEDIUM   |
| Type coercion         | 80%    | Small    | MEDIUM   |
| Everything else       | 100%   | None     | ✓        |

### Phase Timeline

| Phase     | Duration       | Effort    | Est. Days | Cumulative |
| --------- | -------------- | --------- | --------- | ---------- |
| Phase 1   | 2-3 days       | Light     | 2-3       | 2-3        |
| Phase 2   | 3-5 days       | Medium    | 3-5       | 5-8        |
| Phase 3   | 3-5 days       | Medium    | 3-5       | 8-13       |
| Phase 4   | 4-6 days       | Heavy     | 4-6       | 12-19      |
| Phase 5   | 2-4 days       | Medium    | 2-4       | 14-23      |
| Phase 6   | 3-5 days       | Medium    | 3-5       | 17-28      |
| Phase 7   | 3-5 days       | Medium    | 3-5       | 20-33      |
| Phase 8   | 4-7 days       | Heavy     | 4-7       | 24-40      |
| **TOTAL** | **24-40 days** | **Mixed** | **24-40** | **24-40**  |

**Realistic Timeline:** 6-8 weeks working incrementally (allowing for overlap and testing)

---

## Part 10: Resources & References

### W3C Specifications

- [XPath 3.1 Specification](https://www.w3.org/TR/xpath-31/) - Full specification
- [XPath 3.0 Specification](https://www.w3.org/TR/xpath-30/) - Previous version
- [XPath Data Model 3.1](https://www.w3.org/TR/xpath-datamodel-31/) - Data types
- [XPath Functions and Operators 3.1](https://www.w3.org/TR/xpath-functions-31/) - Function definitions

### Test Resources

- [W3C QT3 Test Suite](https://dev.w3.org/2011/QT3-test-suite/) - Comprehensive tests
- [XQuery 3.1 Implementation Report](https://dev.w3.org/2011/QT3-test-suite/ReportingResults31/report.html) - Reference implementations

### Key Specification Sections

- **Change Log (Appendix I):** Migration from 3.0 to 3.1
- **Backwards Compatibility (Appendix H):** Compatibility modes
- **Type Promotion (Appendix B):** Operator mapping rules
- **Maps (Section 8.7):** Map operations
- **Arrays (Section 8.8):** Array operations
- **JSON (Section 13):** JSON support

---

## Implementation Sequence (Week-by-Week)

### Week 1-2: Critical Path - Maps

1. Task 1.1: Map constructor syntax (1-1.5 days)
2. Task 1.2: Map lookup operator (2-2.5 days)
3. Tests for maps (1 day)
4. **Total:** 4-5 days of 10-day week

### Week 2-3: Critical Path - Arrays

1. Task 2.1: Array constructor syntax (1-1.5 days)
2. Task 2.2: Array-specific lookups (1 day)
3. Tests for arrays (1 day)
4. **Total:** 3-3.5 days of 10-day week

### Week 4: Functions Phase 1

1. Task 3.1: Map functions module (2-3 days)
2. Task 4.1: Array functions module (2-3 days)
3. Tests for functions (1 day)
4. **Total:** 5-7 days

### Week 5: JSON & Types

1. Task 5.1-5.3: JSON support (3-4 days)
2. Task 6.1-6.3: Type system enhancements (2-3 days)
3. Tests for JSON and types (1 day)
4. **Total:** 6-8 days

### Week 6: Operators & Expressions

1. Task 7.1-7.4: Operator refinement (2-3 days)
2. Tests for operators (1 day)
3. **Total:** 3-4 days

### Week 7: Integration & Quality

1. Task 7: Comprehensive integration testing (2-3 days)
2. Task 8: Quality assurance (1-2 days)
3. **Total:** 3-5 days

### Week 8: Documentation & Final

1. Task 9: Documentation (2-3 days)
2. Final validation and fixes (1-2 days)
3. **Total:** 3-5 days

---

## Appendix A: Implementation Checklist for Next Phases

- [ ] Create feature branches for each phase
- [ ] Update TODO.md with detailed task list
- [ ] Create test files for each new feature
- [ ] Update TypeScript type definitions
- [ ] Update feature flags in xpath-version.ts
- [ ] Document API changes
- [ ] Create migration guide (3.0 → 3.1)
- [ ] Performance benchmark baseline
- [ ] Final W3C compliance validation
- [ ] Code review procedures
- [ ] Release notes preparation

---

**Document Status:** COMPLETE & CONSOLIDATED  
**Consolidation Date:** January 26, 2026  
**Previous Documents Merged:**

- XPATH-31-IMPLEMENTATION-PLAN.md (Overview)
- XPATH-31-PHASE1-GAP-ANALYSIS.md (Gap Analysis)
- XPATH-31-PHASE1-DETAILED-TASKS.md (Task Breakdown)

**Next Step:** Begin Phase 2 implementation - Map Operations Enhancement  
**Ready for:** Phase 2 task assignment and execution
