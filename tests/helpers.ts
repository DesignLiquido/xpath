/**
 * Test helpers for XPath expression testing
 */

import { XPathLexer } from '../src/lexer';
import { XPathContext, createContext } from '../src/context';

/**
 * Simple node structure for building test trees
 */
export interface SimpleNodeSpec {
    tag?: string;
    text?: string;
    attr?: string | Record<string, string>;
    nsuri?: string;
    children?: SimpleNodeSpec[];
    name?: string;
}

/**
 * Build a simple XML node tree for testing
 * Creates mock node objects that can be used in XPath evaluation
 */
export function buildNodeTree(specs: SimpleNodeSpec[]): any[] {
    return specs.map(spec => buildSingleNode(spec));
}

/**
 * Build a single node from a specification
 */
function buildSingleNode(spec: SimpleNodeSpec): any {
    const node: any = {
        nodeType: 2, // Element node type
        name: spec.tag || 'element',
        localName: spec.tag ? extractLocalName(spec.tag) : 'element',
        namespaceUri: spec.nsuri || null,
        stringValue: spec.text || '',
        children: spec.children ? spec.children.map(buildSingleNode) : [],
        parent: null,
        attributes: spec.attr ? buildAttributes(spec.attr) : [],
    };

    // Link children back to parent
    node.children?.forEach((child: any) => {
        child.parent = node;
    });

    return node;
}

/**
 * Extract local name from qualified name
 */
function extractLocalName(qname: string): string {
    const parts = qname.split(':');
    return parts[parts.length - 1];
}

/**
 * Build attributes from spec
 */
function buildAttributes(attrSpec: string | Record<string, string>): any[] {
    if (typeof attrSpec === 'string') {
        return [{
            nodeType: 3, // Attribute node type
            name: 'attr',
            localName: 'attr',
            namespaceUri: null,
            stringValue: attrSpec,
        }];
    }

    return Object.entries(attrSpec).map(([name, value]) => ({
        nodeType: 3,
        name,
        localName: name,
        namespaceUri: null,
        stringValue: value,
    }));
}

/**
 * Create a test context with optional nodes
 */
export function createTestContext(nodes?: any[], variables?: Record<string, any>) {
    const context = createContext(nodes?.[0] || {
        nodeType: 9, // Document node type
        name: '#document',
        localName: '#document',
        namespaceUri: null,
        stringValue: '',
        children: nodes || [],
    });

    const extendedContext = {
        ...context,
        variables: { ...context.variables, ...variables },
        withNodes(newNodes: any[]) {
            return createTestContext(newNodes, this.variables);
        },
        withVariables(vars: Record<string, any>) {
            return createTestContext(nodes, { ...this.variables, ...vars });
        },
    };

    return extendedContext;
}

/**
 * Helper to create an XPath context that supports method chaining
 */
export function createXPathContext() {
    return createTestContext();
}

/**
 * Create a lexer for tokenizing XPath expressions
 */
export function createXPathLexer() {
    return new XPathLexer();
}

/**
 * Tokenize an XPath expression string
 */
export function tokenizeXPath(expression: string): any[] {
    const lexer = new XPathLexer();
    return lexer.scan(expression);
}

/**
 * Create a parser wrapper that can parse strings directly
 */
export function createParserWrapper(parserInstance: any) {
    return {
        parse: (expression: string) => {
            const tokens = new XPathLexer().scan(expression);
            return parserInstance.parse(tokens);
        },
        // Expose the original parser for direct token-based parsing
        parseTokens: (tokens: any[]) => parserInstance.parse(tokens),
    };
}
