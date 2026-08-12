# TODO

Documentation of already-implemented features (XSLT Extensions API, XPath version support, usage guides) has moved to [README.md](README.md). This file tracks only what's genuinely **not** implemented yet.

## Open Items

- **Optimizer is advisory-only**: `QueryOptimizer` (`src/profiler/optimizer-hints.ts`) analyzes expressions and *suggests* improvements (absolute-path usage, predicate placement, complexity) but does not automatically rewrite/reorder predicates or short-circuit axis traversal at evaluation time. Turning suggestions into actual runtime query optimization (predicate pushdown, axis traversal shortcuts) is still open.
- **`unparsed-entity-uri()` is a stub by necessity**: DTD parsing isn't available in JS environments, so this XSLT function (implemented in `xslt-processor`) can only resolve entities the caller pre-populates via `context.unparsedEntities`. No real DTD-backed resolution is planned unless a DTD parser dependency is added.

## Notes

As of 2026-08-12, the full test suite passes (75 suites / 2794 tests, 0 skipped), and XPath 1.0/2.0/3.0/3.1 — including maps, arrays, lookup operator, JSON functions (`parse-json`, `json-to-xml`, `xml-to-json`), and typed collection tests (`TypedMapTest`, `TypedArrayTest`) — are implemented. See [README.md](README.md) for the current feature list.
