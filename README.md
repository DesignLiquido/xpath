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
