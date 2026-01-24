# xpath

Our XPath implementation in TypeScript.

## Motivation

We maintain another open source package called [`xslt-processor`](https://github.com/DesignLiquido/xslt-processor). The XPath component the project had became impossible to maintain due to a variety of reasons. `xslt-processor` uses this project as a submodule since version 4.

This repository is intended to solve a particular problem in our packages, but it can be used by any other NPM package.

## Custom Selectors

You can implement custom selectors by wrapping the XPath parser and lexer. This is useful when you need to integrate XPath with your own DOM implementation.

### Basic Implementation

Here's how to create a custom selector class:

```typescript
import { XPathLexer } from './lexer';
import { XPathParser } from './parser';
import { createContext } from './context';
import { XPathNode } from './node';

export class CustomXPathSelector {
    private lexer: XPathLexer;
    private parser: XPathParser;
    private nodeCache: WeakMap<YourNodeType, XPathNode> = new WeakMap();

    constructor() {
        this.lexer = new XPathLexer();
        this.parser = new XPathParser();
    }

    public select(expression: string, contextNode: YourNodeType): YourNodeType[] {
        // 1. Tokenize the XPath expression
        const tokens = this.lexer.scan(expression);
        
        // 2. Parse tokens into an AST
        const ast = this.parser.parse(tokens);
        
        // 3. Clear cache for each selection
        this.nodeCache = new WeakMap();
        
        // 4. Convert your node to XPathNode
        const xpathNode = this.convertToXPathNode(contextNode);
        
        // 5. Create context and evaluate
        const context = createContext(xpathNode);
        const result = ast.evaluate(context);
        
        // 6. Convert results back to your node type
        return this.convertResult(result);
    }
}
```

### Node Conversion

The key to custom selectors is converting between your DOM nodes and XPathNode format:

```typescript
private convertToXPathNode(node: YourNodeType): XPathNode {
    // Check cache to avoid infinite recursion
    const cached = this.nodeCache.get(node);
    if (cached) return cached;

    // Filter out attribute nodes (nodeType = 2) from children
    const childNodes = node.childNodes || [];
    const attributes = childNodes.filter(n => n.nodeType === 2);
    const elementChildren = childNodes.filter(n => n.nodeType !== 2);

    // Create XPathNode BEFORE converting children to prevent infinite recursion
    const xpathNode: XPathNode = {
        nodeType: this.getNodeType(node),
        nodeName: node.nodeName || '#document',
        localName: node.localName || node.nodeName,
        namespaceUri: node.namespaceUri || null,
        textContent: node.nodeValue,
        parentNode: null, // Avoid cycles
        childNodes: [], // Will be populated
        attributes: [], // Will be populated
        nextSibling: null,
        previousSibling: null,
        ownerDocument: null
    };

    // Cache BEFORE converting children
    this.nodeCache.set(node, xpathNode);

    // NOW convert children and attributes
    xpathNode.childNodes = elementChildren.map(child => 
        this.convertToXPathNode(child)
    );
    xpathNode.attributes = attributes.map(attr => 
        this.convertToXPathNode(attr)
    );

    return xpathNode;
}
```

### Node Type Mapping

Map your node types to standard DOM node types:

```typescript
private getNodeType(node: YourNodeType): number {
    if (node.nodeType !== undefined) return node.nodeType;
    
    // Map node names to standard node types
    switch (node.nodeName?.toLowerCase()) {
        case '#text':
            return 3; // TEXT_NODE
        case '#comment':
            return 8; // COMMENT_NODE
        case '#document':
            return 9; // DOCUMENT_NODE
        case '#document-fragment':
            return 11; // DOCUMENT_FRAGMENT_NODE
        default:
            return 1; // ELEMENT_NODE
    }
}
```

### Result Conversion

Convert XPath results back to your node type:

```typescript
private convertResult(result: any): YourNodeType[] {
    if (Array.isArray(result)) {
        return result.map(node => this.convertFromXPathNode(node));
    }
    
    if (result && typeof result === 'object' && 'nodeType' in result) {
        return [this.convertFromXPathNode(result)];
    }
    
    return [];
}

private convertFromXPathNode(xpathNode: XPathNode): YourNodeType {
    return {
        nodeType: xpathNode.nodeType,
        nodeName: xpathNode.nodeName,
        localName: xpathNode.localName,
        namespaceUri: xpathNode.namespaceUri,
        nodeValue: xpathNode.textContent,
        parent: xpathNode.parentNode ? 
            this.convertFromXPathNode(xpathNode.parentNode) : undefined,
        children: xpathNode.childNodes ?
            Array.from(xpathNode.childNodes).map(child => 
                this.convertFromXPathNode(child)) : undefined,
        attributes: xpathNode.attributes ?
            Array.from(xpathNode.attributes).map(attr => 
                this.convertFromXPathNode(attr)) : undefined,
        nextSibling: xpathNode.nextSibling ?
            this.convertFromXPathNode(xpathNode.nextSibling) : undefined,
        previousSibling: xpathNode.previousSibling ?
            this.convertFromXPathNode(xpathNode.previousSibling) : undefined
    } as YourNodeType;
}
```

### Usage Example

```typescript
const selector = new CustomXPathSelector();

// Select all book elements
const books = selector.select('//book', documentNode);

// Select books with price > 30
const expensiveBooks = selector.select('//book[price > 30]', documentNode);

// Select first book title
const firstTitle = selector.select('//book[1]/title', documentNode);
```

### Key Considerations

1. **Caching**: Use WeakMap to cache node conversions and prevent memory leaks
2. **Recursion**: Cache nodes BEFORE converting children to avoid infinite loops
3. **Attributes**: Filter attributes (nodeType = 2) separately from element children
4. **Null Safety**: Handle null/undefined values when converting between node types
5. **Performance**: Clear the cache between selections to avoid stale references

For a complete working example, see the [XPathSelector implementation in xslt-processor](https://github.com/DesignLiquido/xslt-processor/blob/main/src/xpath/selector.ts). 
## XSLT Extensions API

This library provides a pure **XPath 1.0** implementation. However, it also includes a clean integration API for XSLT-specific functions, allowing the `xslt-processor` package (or any other XSLT implementation) to extend XPath with XSLT 1.0 functions like `document()`, `key()`, `format-number()`, `generate-id()`, and others.

### Architecture

The XSLT Extensions API follows a **separation of concerns** pattern:

- **This package (`@designliquido/xpath`)**: Provides type definitions, interfaces, and integration hooks
- **XSLT processor packages**: Implement the actual XSLT function logic

This approach keeps the XPath library pure while enabling XSLT functionality through a well-defined extension mechanism.

### Key Features

1. **Type Definitions**: `XSLTExtensions`, `XSLTExtensionFunction`, `XSLTFunctionMetadata` interfaces
2. **Parser Integration**: `XPathParser` accepts `options.extensions` parameter
3. **Lexer Support**: `XPathLexer.registerFunctions()` for dynamic function registration
4. **Context Integration**: Extension functions receive `XPathContext` as first parameter

### Basic Usage

Here's how to use XSLT extensions (typically done by the `xslt-processor` package):

```typescript
import { 
  XPathParser, 
  XPathLexer,
  XSLTExtensions, 
  XSLTFunctionMetadata,
  getExtensionFunctionNames,
  XPathContext
} from '@designliquido/xpath';

// Define XSLT extension functions
const xsltFunctions: XSLTFunctionMetadata[] = [
  {
    name: 'generate-id',
    minArgs: 0,
    maxArgs: 1,
    implementation: (context: XPathContext, nodeSet?: any[]) => {
      const node = nodeSet?.[0] || context.node;
      return `id-${generateUniqueId(node)}`;
    },
    description: 'Generate unique identifier for a node'
  },
  {
    name: 'system-property',
    minArgs: 1,
    maxArgs: 1,
    implementation: (context: XPathContext, propertyName: string) => {
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
const parser = new XPathParser({ extensions });

// Create lexer and register extension functions
const lexer = new XPathLexer();
lexer.registerFunctions(getExtensionFunctionNames(extensions));

// Parse expression
const tokens = lexer.scan("generate-id()");
const expression = parser.parse(tokens);

// Create context with extension functions
const context: XPathContext = {
  node: rootNode,
  functions: {
    'generate-id': xsltFunctions[0].implementation,
    'system-property': xsltFunctions[1].implementation
  }
};

// Evaluate
const result = expression.evaluate(context);
```

### Extension Function Signature

XSLT extension functions receive the evaluation context as their first parameter:

```typescript
type XSLTExtensionFunction = (
  context: XPathContext,
  ...args: any[]
) => any;
```

This allows extension functions to access:
- `context.node` - current context node
- `context.position` - position in node-set (1-based)
- `context.size` - size of current node-set
- `context.variables` - XPath variables
- `context.functions` - other registered functions

### Available Helper Functions

```typescript
// Validate extensions bundle for errors
const errors = validateExtensions(extensions);
if (errors.length > 0) {
  console.error('Extension validation errors:', errors);
}

// Extract function names for lexer registration
const functionNames = getExtensionFunctionNames(extensions);
lexer.registerFunctions(functionNames);

// Create empty extensions bundle
const emptyExtensions = createEmptyExtensions('1.0');
```

### XSLT 1.0 Functions

The following XSLT 1.0 functions are designed to be implemented via this extension API:

1. **`document()`** - Load external XML documents
2. **`key()`** - Efficient node lookup using keys
3. **`format-number()`** - Number formatting with patterns
4. **`generate-id()`** - Generate unique node identifiers
5. **`unparsed-entity-uri()`** - Get URI of unparsed entities
6. **`system-property()`** - Query processor properties
7. **`element-available()`** - Check XSLT element availability
8. **`function-available()`** - Check function availability

For detailed implementation guidance, see [TODO.md](TODO.md).

### Context Extensions

XSLT functions may require additional context data beyond standard XPath context:

```typescript
const context: XPathContext = {
  node: rootNode,
  functions: {
    'generate-id': generateIdImpl,
    'key': keyImpl,
    'format-number': formatNumberImpl
  },
  // XSLT-specific context extensions
  xsltVersion: '1.0',
  // For key() function
  keys: {
    'employee-id': { match: 'employee', use: '@id' }
  },
  // For document() function
  documentLoader: (uri: string) => loadXmlDocument(uri),
  // For format-number() function
  decimalFormats: {
    'euro': { decimalSeparator: ',', groupingSeparator: '.' }
  },
  // For system-property() function
  systemProperties: {
    'xsl:version': '1.0',
    'xsl:vendor': 'Design Liquido'
  }
};
```

### Complete Example

For a complete implementation example, see the test suite at [tests/xslt-extensions.test.ts](tests/xslt-extensions.test.ts), which demonstrates:

- Creating and validating extension bundles
- Registering extensions with parser and lexer
- Implementing sample XSLT functions (`generate-id`, `system-property`)
- End-to-end evaluation with extension functions