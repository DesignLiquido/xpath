/**
 * Unified Constants File for XPath Implementation
 * 
 * Consolidates all export const declarations from throughout the codebase
 * for improved maintainability and easier discovery.
 */

// ============================================================================
// DOM Node Type Constants (matching W3C DOM specification)
// ============================================================================

export const NodeType = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_FRAGMENT_NODE: 11,
    NAMESPACE_NODE: 13,
} as const;

// ============================================================================
// XML Schema & Namespace Constants
// ============================================================================

/** XML Schema namespace URI per W3C XML Schema specification */
export const XS_NAMESPACE = 'http://www.w3.org/2001/XMLSchema';

/** XPath error namespace per W3C XPath 2.0 specification */
export const XPATH_ERROR_NAMESPACE = 'http://www.w3.org/2005/xqt-errors';

/** Default function namespace for XPath/XQuery Functions and Operators library */
export const DEFAULT_FUNCTION_NAMESPACE = 'http://www.w3.org/2005/xpath-functions';

/** Unicode codepoint collation URI (default per W3C specification) */
export const DEFAULT_COLLATION = 'http://www.w3.org/2005/xpath-functions/collation/codepoint';

// ============================================================================
// Reserved Function Names (Appendix A.3)
// ============================================================================

/**
 * Reserved function names per XPath specification.
 * These should not be overridden by user-defined function signatures.
 */
export const RESERVED_FUNCTION_NAMES: ReadonlyArray<string> = [
    'last',
    'position',
    'count',
    'id',
    'local-name',
    'namespace-uri',
    'name',
    'string',
    'concat',
    'starts-with',
    'contains',
    'substring-before',
    'substring-after',
    'substring',
    'string-length',
    'normalize-space',
    'translate',
    'boolean',
    'not',
    'true',
    'false',
    'lang',
    'number',
    'sum',
    'floor',
    'ceiling',
    'round',
];
