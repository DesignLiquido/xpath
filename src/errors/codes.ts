/**
 * XPath Error Code Reference (Phase 7.1)
 *
 * Comprehensive listing of all error codes and their meanings per W3C specs.
 * Reference: https://www.w3.org/TR/xpath20/#errors
 */

export interface ErrorCodeMetadata {
    code: string;
    namespace: 'err' | 'fn';
    type: 'static' | 'dynamic' | 'type';
    section: string;
    title: string;
    description: string;
    example?: string;
}

/**
 * All XPath 2.0 error codes with metadata
 */
export const ERROR_CODES: Record<string, ErrorCodeMetadata> = {
    // ========================================================================
    // STATIC ERRORS (XPST*) - Section 2.3.1
    // ========================================================================
    XPST0001: {
        code: 'XPST0001',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'Static context component undefined',
        description:
            'A static context component required for correct processing is not available. ' +
            'For example: a namespace prefix used in the expression is not declared.',
        example: 'Namespace prefix "xyz" not in scope',
    },

    XPST0003: {
        code: 'XPST0003',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'Grammar violation',
        description:
            'The expression does not conform to the XPath grammar. This is a syntax error ' +
            'detected during parsing.',
        example: 'Unexpected token "=" in expression',
    },

    XPST0005: {
        code: 'XPST0005',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'Empty sequence not allowed',
        description:
            'An empty sequence is used in a context that requires a sequence containing ' +
            'at least one item.',
        example: 'Empty sequence in cast target',
    },

    XPST0008: {
        code: 'XPST0008',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'Unresolved name reference',
        description:
            'A name reference (variable, function, etc.) cannot be resolved in the static context.',
        example: 'Undefined variable "$x" used in expression',
    },

    XPST0010: {
        code: 'XPST0010',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'Unsupported axis',
        description:
            'An axis is not supported by the implementation. For example: the namespace axis ' +
            'may not be supported in all implementations.',
        example: 'namespace:: axis not supported',
    },

    XPST0017: {
        code: 'XPST0017',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'Function signature mismatch',
        description:
            'A function call has an incorrect number of arguments or the argument types do not match.',
        example: 'fn:concat() expects at least 2 arguments, got 0',
    },

    XPST0051: {
        code: 'XPST0051',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'Unknown atomic type',
        description:
            'A type name used in cast or instance of is not recognized as a valid atomic type.',
        example: 'Unknown type "xs:unknownType"',
    },

    XPST0080: {
        code: 'XPST0080',
        namespace: 'err',
        type: 'static',
        section: '2.3.1',
        title: 'NOTATION or xs:anyAtomicType in cast',
        description:
            'NOTATION or xs:anyAtomicType cannot be used as the target type of a cast expression.',
        example: 'Cannot cast to xs:NOTATION',
    },

    // ========================================================================
    // DYNAMIC ERRORS (XPDY*) - Section 2.3.2
    // ========================================================================
    XPDY0002: {
        code: 'XPDY0002',
        namespace: 'err',
        type: 'dynamic',
        section: '2.3.2',
        title: 'Dynamic context component undefined',
        description:
            'A dynamic context component required for evaluation is not available or is undefined.',
        example: 'Current dateTime is undefined',
    },

    XPDY0050: {
        code: 'XPDY0050',
        namespace: 'err',
        type: 'dynamic',
        section: '2.3.2',
        title: 'Context item is not a document node',
        description:
            'In certain contexts, the context item must be a document node. This error occurs ' +
            'when it is something else.',
        example: 'fn:root() requires document node context',
    },

    // ========================================================================
    // TYPE ERRORS (XPTY*) - Section 2.3.3
    // ========================================================================
    XPTY0004: {
        code: 'XPTY0004',
        namespace: 'err',
        type: 'type',
        section: '2.3.3',
        title: 'Type mismatch',
        description:
            'The result of an expression or operand does not match the required type. ' +
            'For example: arithmetic on non-numeric operands.',
        example: 'Cannot add string and number',
    },

    XPTY0018: {
        code: 'XPTY0018',
        namespace: 'err',
        type: 'type',
        section: '2.3.3',
        title: 'Mixed node-set and atomic values',
        description:
            'A step in a path expression returns a mix of node-set results and atomic value results, ' +
            'which is not allowed.',
        example: 'Path expression mixed nodes and atomics',
    },

    XPTY0019: {
        code: 'XPTY0019',
        namespace: 'err',
        type: 'type',
        section: '2.3.3',
        title: 'Non-node in path step',
        description:
            'A step in a path expression requires a node, but an atomic value was provided.',
        example: 'Cannot apply step to non-node value',
    },

    XPTY0020: {
        code: 'XPTY0020',
        namespace: 'err',
        type: 'type',
        section: '2.3.3',
        title: 'Context item is not a node',
        description: 'A path expression was evaluated with a non-node context item.',
        example: 'Path expression requires node context',
    },

    // ========================================================================
    // FUNCTION EXECUTION ERRORS (per Functions & Operators spec)
    // ========================================================================
    FORG0001: {
        code: 'FORG0001',
        namespace: 'fn',
        type: 'dynamic',
        section: 'F&O',
        title: 'Invalid argument to function',
        description:
            'An invalid argument was passed to a function. Typically used for invalid cast values.',
        example: 'Cannot cast "abc" to xs:integer',
    },

    FORG0003: {
        code: 'FORG0003',
        namespace: 'fn',
        type: 'dynamic',
        section: 'F&O',
        title: 'Regular expression not compiled',
        description: 'A regular expression could not be compiled.',
        example: 'Invalid regex pattern "[invalid"',
    },

    FORG0004: {
        code: 'FORG0004',
        namespace: 'fn',
        type: 'dynamic',
        section: 'F&O',
        title: 'String not valid base64',
        description: 'A string is not a valid base64Binary value.',
        example: 'Invalid base64 string "!!!"',
    },

    FORG0005: {
        code: 'FORG0005',
        namespace: 'fn',
        type: 'dynamic',
        section: 'F&O',
        title: 'String not valid hexBinary',
        description: 'A string is not a valid hexBinary value.',
        example: 'Invalid hex string "ZZ"',
    },

    FOTY0012: {
        code: 'FOTY0012',
        namespace: 'fn',
        type: 'dynamic',
        section: 'F&O',
        title: 'Element has element-only content',
        description: 'String value of an element with element-only content cannot be extracted.',
        example: 'string() on element with only child elements',
    },

    FODT0002: {
        code: 'FODT0002',
        namespace: 'fn',
        type: 'dynamic',
        section: 'F&O',
        title: 'Invalid timezone specification',
        description: 'The timezone specification in a date/time value is invalid.',
        example: 'Invalid timezone "UTC+25:00"',
    },

    FOAR0001: {
        code: 'FOAR0001',
        namespace: 'fn',
        type: 'dynamic',
        section: 'F&O',
        title: 'Division by zero',
        description: 'Integer division by zero was attempted.',
        example: '5 idiv 0',
    },
};

/**
 * Get error metadata by code
 */
export function getErrorMetadata(code: string): ErrorCodeMetadata | undefined {
    return ERROR_CODES[code];
}

/**
 * Check if code is a static error
 */
export function isStaticErrorCode(code: string): boolean {
    const meta = getErrorMetadata(code);
    return meta?.type === 'static';
}

/**
 * Check if code is a dynamic error
 */
export function isDynamicErrorCode(code: string): boolean {
    const meta = getErrorMetadata(code);
    return meta?.type === 'dynamic';
}

/**
 * Check if code is a type error
 */
export function isTypeErrorCode(code: string): boolean {
    const meta = getErrorMetadata(code);
    return meta?.type === 'type';
}

/**
 * Get all error codes of a specific type
 */
export function getErrorCodesByType(type: 'static' | 'dynamic' | 'type'): string[] {
    return Object.keys(ERROR_CODES).filter((code) => ERROR_CODES[code].type === type);
}

/**
 * Format error code with description
 */
export function formatErrorCodeDescription(code: string): string {
    const meta = getErrorMetadata(code);
    if (!meta) {
        return `Unknown error: ${code}`;
    }
    return `${code}: ${meta.title} - ${meta.description}`;
}
