# XPath 1.0 to 2.0 Migration Guide

This guide helps you migrate XPath 1.0 expressions to XPath 2.0, taking advantage of new features while avoiding common pitfalls.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Differences](#understanding-the-differences)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Common Migration Patterns](#common-migration-patterns)
5. [Handling Empty Sequences](#handling-empty-sequences)
6. [Type Safety Improvements](#type-safety-improvements)
7. [Using New Features](#using-new-features)
8. [Testing Your Migration](#testing-your-migration)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option 1: Use Compatibility Mode (Recommended for Initial Migration)

If you want to run existing XPath 1.0 expressions with minimal changes:

```typescript
import { evaluate } from '@designliquido/xpath';

// Enable XPath 1.0 compatibility mode
const result = evaluate(expression, context, {
    version: '2.0',
    xpath10CompatibilityMode: true
});
```

This mode maintains XPath 1.0 behavior for:
- Type coercion in comparisons
- Empty sequence handling
- First-item extraction from sequences

### Option 2: Full XPath 2.0 Mode

For new code or complete migration:

```typescript
import { evaluate } from '@designliquido/xpath';

// Use full XPath 2.0 semantics
const result = evaluate(expression, context, {
    version: '2.0',
    xpath10CompatibilityMode: false  // default
});
```

---

## Understanding the Differences

### Key Conceptual Changes

| Concept | XPath 1.0 | XPath 2.0 |
|---------|-----------|-----------|
| Data Model | Node-sets, strings, numbers, booleans | Sequences of items (nodes and atomic values) |
| Type System | Implicit coercion | Strong typing with explicit conversions |
| Empty Results | Often converted to NaN or false | Empty sequence `()` |
| Comparisons | Always existential | Value (`eq`) vs General (`=`) |

### What Stays the Same

- Basic path expressions (`/a/b/c`)
- Axis specifiers (`child::`, `parent::`, etc.)
- Predicates (`[position() = 1]`)
- Most XPath 1.0 functions
- Union operator (`|`)
- Logical operators (`and`, `or`, `not()`)

---

## Step-by-Step Migration

### Step 1: Identify Compatibility Issues

Run your expressions with the warning collector enabled:

```typescript
import { evaluate, createWarningCollector } from '@designliquido/xpath';

const warnings = createWarningCollector({ logToConsole: true });

const result = evaluate(expression, context, {
    version: '2.0',
    warningCollector: warnings
});

console.log(warnings.formatReport());
```

### Step 2: Fix Reserved Word Conflicts

XPath 2.0 has new reserved words. If you use them as element names:

```xpath
# Before (XPath 1.0)
/order/if/then    # Works in 1.0 - selects <if> and <then> elements

# After (XPath 2.0)
/order/child::if/child::then    # Explicit child axis
```

**Common conflicts:**
- `if`, `then`, `else`
- `for`, `in`, `return`
- `some`, `every`, `satisfies`
- `instance`, `of`, `as`
- `cast`, `castable`, `treat`
- `eq`, `ne`, `lt`, `le`, `gt`, `ge`
- `is`, `to`, `idiv`
- `intersect`, `except`

### Step 3: Handle Empty Sequences

The biggest compatibility issue is empty sequence handling:

```xpath
# XPath 1.0: Returns NaN
/missing/path + 1

# XPath 2.0: Returns empty sequence
/missing/path + 1
```

**Migration patterns:**

```xpath
# Pattern 1: Provide default value
(if (fn:empty(/missing/path)) then 0 else /missing/path) + 1

# Pattern 2: Use fn:number() with compatibility
fn:number(/missing/path) + 1  # Returns NaN if empty

# Pattern 3: Use default value function (when available)
fn:head((/missing/path, 0)[1]) + 1
```

### Step 4: Update Comparisons (Optional)

Consider using value comparisons for single-item contexts:

```xpath
# General comparison (XPath 1.0 style - still works)
$price > 100

# Value comparison (XPath 2.0 - more explicit)
$price gt 100
```

**When to use value comparisons:**
- Comparing single values for clarity
- When you want an error if multiple items exist
- In typed contexts where type safety matters

### Step 5: Replace Deprecated Features

**Namespace axis:**

```xpath
# Before (deprecated)
namespace::*

# After
fn:in-scope-prefixes(.)
```

---

## Common Migration Patterns

### Pattern 1: Node-Set to String

```xpath
# XPath 1.0 (implicit - uses first node)
$nodes = 'value'

# XPath 2.0 (explicit)
fn:string($nodes[1]) eq 'value'
# or
fn:exists($nodes[. eq 'value'])
```

### Pattern 2: Arithmetic with Potential Empty

```xpath
# XPath 1.0
$quantity * $price

# XPath 2.0 (safe)
if (fn:exists($quantity) and fn:exists($price))
then $quantity * $price
else 0
```

### Pattern 3: Boolean Tests

```xpath
# XPath 1.0
$nodes

# XPath 2.0 (equivalent - EBV)
fn:boolean($nodes)
# or simply use in boolean context
if ($nodes) then 'yes' else 'no'
```

### Pattern 4: String Conversion

```xpath
# XPath 1.0
string($nodes)

# XPath 2.0 (when nodes might have multiple items)
fn:string(fn:head($nodes))
# or for all values
fn:string-join($nodes, '')
```

### Pattern 5: Numeric Conversion

```xpath
# XPath 1.0
number($node)

# XPath 2.0 (type-safe)
xs:decimal($node)
# or
xs:double($node)
```

### Pattern 6: Conditional Default Values

```xpath
# XPath 1.0 workaround
($value | 'default')[1]

# XPath 2.0
if (fn:exists($value)) then $value else 'default'
# or
($value, 'default')[1]
```

---

## Handling Empty Sequences

### The Problem

In XPath 1.0, operations on empty node-sets have defined fallback behaviors:
- Arithmetic: Returns NaN
- Comparison: Returns false
- String: Returns empty string

In XPath 2.0, operations on empty sequences typically return empty sequences, which can propagate through your expressions unexpectedly.

### Solution 1: Guard Clauses

```xpath
if (fn:exists($value))
then $value + 1
else 0
```

### Solution 2: Default Values with Sequence Construction

```xpath
# First non-empty value wins
($value, 0)[1] + 1
```

### Solution 3: The fn:head() Function

```xpath
fn:head(($value, 0)) + 1
```

### Solution 4: Using fn:zero-or-one() for Validation

```xpath
# Raises error if more than one item
fn:zero-or-one($value) + 1
```

---

## Type Safety Improvements

### Explicit Type Casting

XPath 2.0 provides explicit type constructors:

```xpath
# String to integer
xs:integer('42')

# String to decimal
xs:decimal('3.14')

# String to date
xs:date('2026-01-25')
```

### Type Checking with instance of

```xpath
# Check type before operation
if ($value instance of xs:decimal)
then $value * 2
else xs:decimal($value) * 2
```

### Sequence Type Assertions

```xpath
# Assert single item
$value treat as xs:string

# Assert sequence
$values treat as xs:string+
```

---

## Using New Features

### For Expressions

```xpath
# Process each item
for $book in /library/book
return $book/title
```

### Conditional Expressions

```xpath
if ($price > 100)
then 'expensive'
else 'affordable'
```

### Quantified Expressions

```xpath
# All items satisfy condition
every $x in $items satisfies $x > 0

# At least one item satisfies condition
some $x in $items satisfies $x > 100
```

### Range Expressions

```xpath
# Generate sequence 1 to 10
1 to 10

# Use in for
for $i in 1 to fn:count($items)
return $items[$i]
```

### New Comparison Operators

```xpath
# Value comparisons (single items)
$a eq $b    # equals
$a ne $b    # not equals
$a lt $b    # less than
$a le $b    # less than or equal
$a gt $b    # greater than
$a ge $b    # greater than or equal

# Node comparisons
$a is $b    # same node
$a << $b    # $a precedes $b in document order
$a >> $b    # $a follows $b in document order
```

### Sequence Operators

```xpath
# Intersection
$nodes1 intersect $nodes2

# Difference
$nodes1 except $nodes2
```

---

## Testing Your Migration

### Test Cases to Include

1. **Empty sequence cases:**
   ```xpath
   /nonexistent/path + 1
   /nonexistent/path = 'value'
   string(/nonexistent/path)
   ```

2. **Multiple item cases:**
   ```xpath
   /books/book = 'XPath Guide'  # Might have multiple matches
   ```

3. **Type conversion cases:**
   ```xpath
   /price + /quantity  # Both should be numbers
   ```

4. **Reserved word conflicts:**
   ```xpath
   /data/if/then  # Element names matching reserved words
   ```

### Regression Test Strategy

```typescript
import { evaluate } from '@designliquido/xpath';

function testBothModes(expr: string, doc: Document) {
    const xpath1Result = evaluate(expr, doc, {
        version: '1.0'
    });

    const xpath2CompatResult = evaluate(expr, doc, {
        version: '2.0',
        xpath10CompatibilityMode: true
    });

    const xpath2Result = evaluate(expr, doc, {
        version: '2.0',
        xpath10CompatibilityMode: false
    });

    console.log('XPath 1.0:', xpath1Result);
    console.log('XPath 2.0 (compat):', xpath2CompatResult);
    console.log('XPath 2.0 (strict):', xpath2Result);
}
```

---

## Troubleshooting

### Error: XPTY0004 - Type Mismatch

**Cause:** Operation requires specific type, but received different type.

**Solution:**
```xpath
# Add explicit type conversion
xs:decimal($value) + 1
```

### Error: XPDY0002 - Context Undefined

**Cause:** Context item required but not available.

**Solution:**
```xpath
# Ensure context is set, or use absolute paths
/root/element  # instead of just element
```

### Error: XPST0003 - Grammar Violation

**Cause:** Often due to reserved word conflicts.

**Solution:**
```xpath
# Use explicit child axis
child::if  # instead of just if
```

### Empty Result Instead of Expected Value

**Cause:** Empty sequence propagation.

**Solution:**
```xpath
# Add default value
($value, 'default')[1]
```

### Different Comparison Results

**Cause:** XPath 2.0 uses different comparison semantics.

**Solution:**
```xpath
# Use compatibility mode, or
# Update to use appropriate comparison operator
$a eq $b  # for single value comparison
$a = $b   # for existential comparison
```

---

## Best Practices

1. **Start with compatibility mode** for existing expressions
2. **Add explicit type conversions** where types are uncertain
3. **Handle empty sequences explicitly** in critical paths
4. **Use value comparisons** (`eq`, `ne`, etc.) for single-value contexts
5. **Test with edge cases**: empty sequences, multiple items, type mismatches
6. **Enable warnings** during development to catch potential issues
7. **Document type expectations** in complex expressions

---

## Related Documentation

- [XPath 1.0 to 2.0 Incompatibilities](./XPATH-INCOMPATIBILITIES.md)
- [XPath 2.0 Implementation Plan](./XPATH-2.0-IMPLEMENTATION-PLAN.md)
- [XPath Version Infrastructure](./XPATH-VERSIONS.md)

---

**Last Updated**: January 25, 2026
