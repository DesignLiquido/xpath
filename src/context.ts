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
}

/**
 * Result types that can be returned from XPath evaluation.
 */
export type XPathResult =
    | XPathNode[]      // Node set
    | string           // String
    | number           // Number
    | boolean;         // Boolean

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
