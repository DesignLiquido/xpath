# XPath 1.0 to 2.0 Incompatibilities

This document describes the incompatibilities between XPath 1.0 and XPath 2.0 expressions. It is based on [XPath 2.0 Specification Appendix I](https://www.w3.org/TR/xpath20/#id-incompat-in-false-branch).

## Overview

XPath 2.0 is largely backward compatible with XPath 1.0, but there are some important differences that may cause existing XPath 1.0 expressions to behave differently or fail when evaluated under XPath 2.0 semantics. This library provides an **XPath 1.0 compatibility mode** (`xpath10CompatibilityMode: true`) that enables most backward-compatible behaviors.

---

## Table of Contents

1. [Type System Differences](#1-type-system-differences)
2. [String Comparison Changes](#2-string-comparison-changes)
3. [Empty Sequence Handling](#3-empty-sequence-handling)
4. [Node-Set Operations](#4-node-set-operations)
5. [Arithmetic Expressions](#5-arithmetic-expressions)
6. [Comparison Operators](#6-comparison-operators)
7. [Boolean Expressions](#7-boolean-expressions)
8. [Deprecated Features](#8-deprecated-features)
9. [New Reserved Words](#9-new-reserved-words)
10. [Function Changes](#10-function-changes)

---

## 1. Type System Differences

### 1.1 Sequences vs Node-Sets

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| Four basic types: node-set, string, number, boolean | Rich type system with 19+ atomic types and sequences |
| Node-sets are unordered collections | Sequences are ordered and may contain duplicates |
| Implicit type coercion | Explicit type checking with optional compatibility mode |

**Example:**

```xpath
(: XPath 1.0: node-set comparison uses first node's string value :)
/books/book = 'XPath Guide'

(: XPath 2.0: general comparison with existential semantics :)
/books/book = 'XPath Guide'
```

### 1.2 Atomization

In XPath 2.0, many operations require **atomization** - extracting the typed value from nodes:

- Element nodes with simple content yield their typed value
- Element nodes with element-only content raise error `FOTY0012`
- Attribute nodes yield their typed value

**Migration:**

```xpath
(: XPath 1.0: implicit string extraction :)
string($node)

(: XPath 2.0: explicit atomization :)
data($node)
fn:string($node)
```

### 1.3 Type Promotion

XPath 2.0 has formal rules for numeric type promotion:

```
xs:integer → xs:decimal → xs:float → xs:double
```

Additionally, `xs:untypedAtomic` values are promoted based on context:
- To `xs:double` in arithmetic operations
- To `xs:string` in string comparisons

---

## 2. String Comparison Changes

### 2.1 Default Collation

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| Implementation-defined string comparison | Unicode codepoint collation by default |

**Impact:** String comparisons may produce different results for locale-sensitive text.

**Example:**

```xpath
(: May differ between versions :)
'cafe' < 'café'

(: XPath 2.0: explicitly use collation :)
compare('cafe', 'café', 'http://www.w3.org/2013/collation/UCA')
```

### 2.2 String Equality

In XPath 1.0, string comparison is straightforward. In XPath 2.0:

- Value comparison (`eq`) compares single values
- General comparison (`=`) uses existential quantification

```xpath
(: XPath 2.0: these are different! :)
$a eq $b  (: error if $a or $b has more than one item :)
$a = $b   (: true if any item in $a equals any item in $b :)
```

---

## 3. Empty Sequence Handling

This is one of the most significant incompatibilities.

### 3.1 Arithmetic Operations

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| Empty node-set → `NaN` | Empty sequence → empty sequence |

**Example:**

```xpath
(: XPath 1.0: returns NaN :)
/missing/path + 1

(: XPath 2.0: returns empty sequence () :)
/missing/path + 1
```

**Migration:**

```xpath
(: Handle empty sequence explicitly :)
if (fn:exists(/missing/path)) then /missing/path + 1 else 0

(: Or use default value :)
(if (fn:empty($x)) then 0 else $x) + 1
```

### 3.2 Value Comparisons

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| Empty node-set in comparison → `false` | Empty sequence → empty sequence |

**Example:**

```xpath
(: XPath 1.0: returns false :)
/missing/path = 'value'

(: XPath 2.0 with value comparison: returns empty sequence :)
/missing/path eq 'value'

(: XPath 2.0 with general comparison: returns false (existential semantics) :)
/missing/path = 'value'
```

### 3.3 Boolean Effective Value

In XPath 2.0, the **Effective Boolean Value (EBV)** of an empty sequence is `false`, maintaining compatibility:

```xpath
(: Both versions: returns false :)
boolean(/missing/path)

(: Both versions: returns true (because of else branch) :)
if (/missing/path) then 'found' else 'not found'
```

---

## 4. Node-Set Operations

### 4.1 Document Order

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| Union returns nodes in document order, duplicates removed | Same behavior for nodes; sequences may contain duplicates |

### 4.2 First Node Extraction

XPath 1.0 implicitly uses the first node in document order for many operations. XPath 2.0 is stricter:

```xpath
(: XPath 1.0: uses first node's string value :)
$nodeset = 'value'

(: XPath 2.0: compares all nodes (existential) :)
$sequence = 'value'

(: XPath 2.0: explicitly get first :)
$sequence[1] = 'value'
fn:head($sequence) = 'value'
```

---

## 5. Arithmetic Expressions

### 5.1 Division

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| `div` always returns IEEE double | `div` returns the most specific type possible |
| Division by zero → `Infinity` or `-Infinity` | `idiv` by zero raises `FOAR0001` |

**Example:**

```xpath
(: XPath 1.0: 5 div 2 = 2.5 (double) :)
5 div 2

(: XPath 2.0: 5 div 2 = 2.5 (decimal) :)
5 div 2

(: XPath 2.0: integer division :)
5 idiv 2  (: = 2 :)
```

### 5.2 Modulo

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| `mod` uses IEEE remainder | `mod` uses truncated division remainder |

For most cases, results are the same, but edge cases with negative numbers may differ.

---

## 6. Comparison Operators

### 6.1 New Value Comparisons

XPath 2.0 introduces value comparison operators that work on single values:

| General (XPath 1.0 style) | Value (XPath 2.0) |
|---------------------------|-------------------|
| `=` | `eq` |
| `!=` | `ne` |
| `<` | `lt` |
| `<=` | `le` |
| `>` | `gt` |
| `>=` | `ge` |

**Key Difference:**

```xpath
(: General comparison: true if ANY pair matches :)
(1, 2, 3) = (3, 4, 5)  (: true - 3 matches :)

(: Value comparison: error - multiple items :)
(1, 2, 3) eq (3, 4, 5)  (: XPTY0004 error :)
```

### 6.2 Node Comparisons

XPath 2.0 adds node comparison operators:

```xpath
(: Node identity :)
$a is $b  (: true if same node :)

(: Document order :)
$a << $b  (: true if $a precedes $b :)
$a >> $b  (: true if $a follows $b :)
```

### 6.3 Type Coercion in Comparisons

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| Implicit type coercion based on operand types | Strict typing; untypedAtomic promoted based on other operand |

**XPath 1.0 coercion rules:**
1. If either operand is boolean, convert both to boolean
2. If either operand is number, convert both to number
3. Otherwise, convert both to string

**XPath 2.0 (without compatibility mode):**
- Both operands must be comparable types
- `xs:untypedAtomic` is promoted to match the other operand's type

---

## 7. Boolean Expressions

### 7.1 Short-Circuit Evaluation

Both versions support short-circuit evaluation, but XPath 2.0 has stricter guarantees:

```xpath
(: Both versions: right side not evaluated if left is false :)
false() and error('never-called')

(: Both versions: right side not evaluated if left is true :)
true() or error('never-called')
```

### 7.2 Errors in False Branches

In XPath 1.0 compatibility mode, errors in non-evaluated branches are suppressed. In strict XPath 2.0, they may still be detected during static analysis.

---

## 8. Deprecated Features

### 8.1 Namespace Axis

The `namespace::` axis is deprecated in XPath 2.0:

| Status | Details |
|--------|---------|
| XPath 1.0 | Fully supported |
| XPath 2.0 | Deprecated; optional support |
| This Library | Disabled by default; enable with `enableNamespaceAxis: true` |

**Migration:**

```xpath
(: XPath 1.0: :)
namespace::*

(: XPath 2.0 replacement: :)
fn:in-scope-prefixes(.)
fn:namespace-uri-for-prefix($prefix, .)
```

### 8.2 Implicit Type Conversions

Many implicit conversions that worked in XPath 1.0 require explicit conversion in XPath 2.0:

```xpath
(: XPath 1.0: implicit :)
$node + 1

(: XPath 2.0: explicit :)
xs:decimal($node) + 1
number($node) + 1
```

---

## 9. New Reserved Words

XPath 2.0 introduces new reserved words that may conflict with element/attribute names used in XPath 1.0 expressions:

| New Reserved Words |
|--------------------|
| `if`, `then`, `else` |
| `for`, `in`, `return` |
| `some`, `every`, `satisfies` |
| `instance`, `of` |
| `cast`, `castable`, `as` |
| `treat` |
| `eq`, `ne`, `lt`, `le`, `gt`, `ge` |
| `is`, `<<`, `>>` |
| `intersect`, `except` |
| `to` |
| `idiv` |

**Impact:** If your XPath 1.0 expressions use these as element names without explicit child axis, they may be misinterpreted:

```xpath
(: XPath 1.0: selects <if> child elements :)
if

(: XPath 2.0: starts a conditional expression (syntax error without then/else) :)
if

(: XPath 2.0: explicitly select <if> elements :)
child::if
./if
```

---

## 10. Function Changes

### 10.1 Modified Functions

| Function | XPath 1.0 | XPath 2.0 |
|----------|-----------|-----------|
| `string()` | Node-set uses first node | Sequence must be single item or empty |
| `number()` | Node-set uses first node | Sequence must be single item or empty |
| `boolean()` | Node-set: empty = false | Empty sequence = false; multiple items = true |
| `sum()` | Returns 0 for empty node-set | Returns 0 for empty sequence |

### 10.2 New Functions

XPath 2.0 introduces many new functions. Using them in XPath 1.0 mode will raise errors:

- Sequence functions: `distinct-values()`, `index-of()`, `insert-before()`, etc.
- String functions: `matches()`, `replace()`, `tokenize()`, etc.
- Date/time functions: `current-dateTime()`, `year-from-date()`, etc.
- Type functions: `data()`, `exactly-one()`, `zero-or-one()`, etc.

### 10.3 Namespace Changes

| XPath 1.0 | XPath 2.0 |
|-----------|-----------|
| Functions have no namespace | Functions are in `http://www.w3.org/2005/xpath-functions` |
| No prefix needed | `fn:` prefix commonly used (but often implicit) |

---

## Using Compatibility Mode

This library provides XPath 1.0 compatibility mode to ease migration:

```typescript
import { evaluate } from '@designliquido/xpath';

// Enable XPath 1.0 compatibility mode
const result = evaluate(expression, context, {
    xpath10CompatibilityMode: true
});
```

### What Compatibility Mode Does

1. **Type Coercion**: Uses XPath 1.0 type coercion rules for comparisons
2. **Empty Sequences**: Converts empty sequences to NaN/false in appropriate contexts
3. **First Item**: Implicitly extracts first item from sequences where needed
4. **String Conversion**: Uses first node's string value for node-sets

### What Compatibility Mode Does NOT Do

1. **Reserved Words**: Does not allow using new reserved words as element names
2. **New Operators**: Does not disable new operators like `eq`, `ne`, `idiv`
3. **Static Errors**: Does not suppress static analysis errors

---

## Migration Checklist

When migrating from XPath 1.0 to XPath 2.0:

- [ ] Check for use of deprecated `namespace::` axis
- [ ] Review expressions that compare against empty results
- [ ] Look for implicit type conversions
- [ ] Identify use of new reserved words as element names
- [ ] Test arithmetic operations with potential empty sequences
- [ ] Verify string comparison behavior with non-ASCII characters
- [ ] Consider whether general (`=`) or value (`eq`) comparisons are appropriate
- [ ] Handle multi-item sequences explicitly where single items are expected

---

## Related Documentation

- [XPath 2.0 Implementation Plan](./XPATH-2.0-IMPLEMENTATION-PLAN.md)
- [XPath Version Infrastructure](./XPATH-VERSIONS.md)
- [XPath Migration Guide](./XPATH-MIGRATION-GUIDE.md)

---

## References

- [W3C XPath 2.0 Specification - Appendix I: Incompatibilities with XPath 1.0](https://www.w3.org/TR/xpath20/#id-incompat-in-false-branch)
- [W3C XPath 1.0 Specification](https://www.w3.org/TR/xpath/)
- [W3C XPath 2.0 Specification](https://www.w3.org/TR/xpath20/)

---

**Last Updated**: January 25, 2026
