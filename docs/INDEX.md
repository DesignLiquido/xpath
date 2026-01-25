# XPath 2.0 Documentation Index

Welcome to the XPath 2.0 implementation documentation! This page helps you navigate all available documentation.

## 📚 Getting Started

**Start here if you're new to this project:**

1. **[Main README](./README.md)** - Overview of XPath 2.0 implementation with quick start examples
2. **[Documentation Guide](./DOCUMENTATION.md)** - How the documentation is organized and generated

## 🔍 Finding Information

### If you want to...

- **Understand what's implemented** → [Implementation Plan](./guides/XPATH-2.0-IMPLEMENTATION-PLAN.md)
  - All 10 phases with completion status
  - Test coverage metrics (1176 tests)
  - Feature list by category
  - Architecture overview

- **Migrate from XPath 1.0** → [Migration Guide](./guides/XPATH-MIGRATION-GUIDE.md)
  - Quick start with compatibility mode
  - Step-by-step migration process
  - Common patterns and examples
  - Troubleshooting section

- **Learn about incompatibilities** → [Incompatibilities Reference](./guides/XPATH-INCOMPATIBILITIES.md)
  - Detailed differences between 1.0 and 2.0
  - Type system changes
  - Operator changes
  - Function changes
  - Migration checklist

- **Use the API** → [API Reference](./api/modules.md)
  - Complete TypeScript API documentation
  - Class and interface definitions
  - Function signatures
  - Type definitions
  - Enumerations

## 📖 Documentation Structure

### Main Documentation
- `README.md` - Main entry point with features and examples
- `DOCUMENTATION.md` - Guide to documentation generation and structure

### Guides (in `guides/` subdirectory)
- `XPATH-2.0-IMPLEMENTATION-PLAN.md` - Feature roadmap and completion status
- `XPATH-MIGRATION-GUIDE.md` - XPath 1.0 to 2.0 migration guide
- `XPATH-INCOMPATIBILITIES.md` - XPath version incompatibilities reference

### API Reference (in `api/` subdirectory)
Generated from TypeScript source using TypeDoc:
- `modules.md` - Main modules index
- `classes/` - Class documentation
- `interfaces/` - Interface documentation
- `functions/` - Function documentation
- `type-aliases/` - Type alias documentation
- `enumerations/` - Enum documentation
- `variables/` - Variable documentation

## 🎯 Quick Navigation

### By Topic

**Type System**
- See: Implementation Plan → Phase 1: Type System & Data Model
- See: API Reference → classes/atomic types

**Expressions**
- See: Implementation Plan → Phase 2: Core Expression Types, Phase 3: Control Flow
- See: API Reference → classes/expression types

**Functions & Operators**
- See: Implementation Plan → Phase 9: Functions & Operators
- See: API Reference → functions/string functions, numeric functions, etc.

**Error Handling**
- See: Implementation Plan → Phase 7: Error Handling
- See: API Reference → classes/XPathError

**Compatibility Mode**
- See: Implementation Plan → Phase 8: XPath 1.0 Compatibility
- See: Migration Guide → Quick Start
- See: API Reference → functions/createCompatibilityMode

**Context & Scope**
- See: Implementation Plan → Phase 6: Static & Dynamic Context
- See: API Reference → classes/XPathContext

**Schema Support**
- See: Implementation Plan → Phase 10: Optional Features
- See: API Reference → classes/schema

## 📊 Key Statistics

- **Phases**: 10 (all complete)
- **Tests**: 1176 (all passing)
- **Test Suites**: 36
- **Code Coverage**: 77% statements, 79% lines
- **Functions**: 100+ built-in functions
- **Atomic Types**: 19+
- **Error Codes**: 79

## 🚀 Common Tasks

### Add TypeScript JSDoc comments
When modifying source code, keep comments synchronized:
```bash
npm run docs
```

### Update documentation during development
After significant changes:
1. Update JSDoc comments in source
2. Run `npm run docs` to regenerate API docs
3. Update guides/ if behavior changes
4. Commit both source and generated docs

### Watch for documentation changes
During development:
```bash
npm run docs:watch
```

## 🔗 External References

- [W3C XPath 2.0 Specification](https://www.w3.org/TR/xpath20/)
- [XPath 2.0 Functions and Operators](https://www.w3.org/TR/xpath-functions/)
- [XML Schema Part 2: Datatypes](https://www.w3.org/TR/xmlschema-2/)

## 📝 Documentation Format

All guides are written in **Markdown** for maximum compatibility and ease of reading. They include:

- Clear table of contents
- Code examples (XPath and TypeScript)
- Comparison tables
- Step-by-step instructions
- Troubleshooting sections
- Cross-references to other documentation

## 🎓 Learning Path

**For Beginners:**
1. Read: [Main README](./README.md)
2. Try: Basic examples from README
3. Reference: [API Reference](./api/modules.md) for specific functions

**For XPath 1.0 Users:**
1. Read: [Migration Guide](./guides/XPATH-MIGRATION-GUIDE.md) Quick Start section
2. Read: [Incompatibilities Reference](./guides/XPATH-INCOMPATIBILITIES.md) for detailed differences
3. Reference: [Implementation Plan](./guides/XPATH-2.0-IMPLEMENTATION-PLAN.md) for available features

**For Contributors:**
1. Read: [Implementation Plan](./guides/XPATH-2.0-IMPLEMENTATION-PLAN.md) for architecture
2. Reference: [API Reference](./api/modules.md) for existing code structure
3. See: [Documentation Guide](./DOCUMENTATION.md) for maintaining docs

## ❓ Frequently Encountered Sections

- **Empty sequence handling**: See Migration Guide → Handling Empty Sequences
- **Type errors (XPTY)**: See Implementation Plan → Phase 7: Error Handling
- **Comparison operators**: See Incompatibilities → Comparison Operators section
- **Function compatibility**: See Implementation Plan → Phase 9: Functions
- **Reserved words**: See Incompatibilities → New Reserved Words section

## 📮 Feedback

For questions or issues about the documentation:
- Check the [Incompatibilities Reference](./guides/XPATH-INCOMPATIBILITIES.md) FAQ section
- See [Migration Guide](./guides/XPATH-MIGRATION-GUIDE.md) Troubleshooting section
- File an issue on the GitHub repository

---

**Last Updated**: January 25, 2026  
**Documentation Generated**: TypeDoc + Markdown
