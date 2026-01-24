import { XPathNode } from "./node";

/**
 * Node type constants (matching DOM specification)
 */
export const NodeType = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_FRAGMENT_NODE: 11,
} as const;

/**
 * Type for custom XPath functions that can be registered in the context.
 */
export type XPathFunction = (...args: any[]) => any;

/**
 * Type for the variables map in the context.
 */
export type XPathVariables = Record<string, any>;

/**
 * Type for the custom functions map in the context.
 */
export type XPathFunctions = Record<string, XPathFunction>;

/**
 * Type for namespace bindings (prefix -> namespace URI).
 */
export type XPathNamespaces = Record<string, string>;

/**
 * The evaluation context for XPath expressions.
 *
 * This context is passed to all expression evaluate() methods and contains:
 * - The current context node
 * - Position information for predicates
 * - Variable bindings
 * - Custom function definitions
 */
export interface XPathContext {
    /**
     * The current context node being evaluated.
     */
    node?: XPathNode;

    /**
     * The position of the context node within the current node set (1-based).
     * Used by position() function and numeric predicates.
     */
    position?: number;

    /**
     * The size of the current node set.
     * Used by last() function.
     */
    size?: number;

    /**
     * The full node list for the current context.
     * Used by the 'self-and-siblings' axis (XSLT-specific).
     */
    nodeList?: XPathNode[];

    /**
     * Variable bindings available during evaluation.
     * Variables are referenced in XPath as $variableName.
     */
    variables?: XPathVariables;

    /**
     * Custom functions available during evaluation.
     * These extend the built-in XPath 1.0 function library.
     */
    functions?: XPathFunctions;

    /**
     * Namespace bindings for resolving prefixes in XPath expressions.
     * Maps namespace prefixes to namespace URIs.
     * Example: { "atom": "http://www.w3.org/2005/Atom" }
     */
    namespaces?: XPathNamespaces;

    /**
     * XSLT version ('1.0', '2.0', '3.0') for version-specific behavior.
     * Used by functions like json-to-xml() which are only available in XSLT 3.0+
     */
    xsltVersion?: string;

    /**
     * XPath specification version being used.
     * Default: '1.0'
     * 
     * This affects:
     * - Function library available
     * - Type system behavior
     * - Sequence vs node-set handling
     */
    xpathVersion?: '1.0' | '2.0' | '3.0' | '3.1';

    /**
     * Default collation for string comparisons (XPath 2.0+).
     * Default: Unicode codepoint collation
     */
    defaultCollation?: string;

    /**
     * Base URI for resolving relative URIs (XPath 2.0+).
     */
    baseUri?: string;

    /**
     * Implicit timezone as duration offset from UTC (XPath 2.0+).
     * Example: '-PT5H' for US Eastern Time (UTC-5)
     */
    implicitTimezone?: string;

    /**
     * Extension data for XSLT or custom implementations.
     * This allows attaching arbitrary data to the context without
     * polluting the main interface.
     */
    extensions?: Record<string, any>;
}

/**
 * Result types that can be returned from XPath evaluation.
 * 
 * XPath 1.0: node-set, string, number, boolean
 * XPath 2.0+: sequences (which subsume node-sets), atomic values, functions
 */
export type XPathResult =
    | XPathNode[]      // Node set (XPath 1.0) or sequence of nodes (XPath 2.0+)
    | string           // String
    | number           // Number
    | boolean          // Boolean
    | any[]            // Sequence (XPath 2.0+)
    | Map<any, any>    // Map (XPath 3.0+)
    | null             // Empty sequence (XPath 2.0+)
    // eslint-disable-next-line @typescript-eslint/ban-types
    | Function;        // Function item (XPath 3.0+)

/**
 * Creates a new XPath context with the given node as the context node.
 */
export function createContext(node: XPathNode, options?: Partial<XPathContext>): XPathContext {
    return {
        node,
        position: 1,
        size: 1,
        ...options,
    };
}

/**
 * Creates a child context for predicate evaluation.
 * Preserves variables and functions from parent context.
 */
export function createPredicateContext(
    parent: XPathContext,
    node: XPathNode,
    position: number,
    size: number
): XPathContext {
    return {
        ...parent,
        node,
        position,
        size,
    };
}
