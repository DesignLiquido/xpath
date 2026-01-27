/**
 * XPath 2.0 Error System (Phase 7.1)
 *
 * Implements error handling per W3C XPath 2.0 Recommendation Section 2.3:
 * - Static Errors (XPST*) - occur during static analysis
 * - Dynamic Errors (XPDY*) - occur during evaluation
 * - Type Errors (XPTY*) - type mismatch or type constraint violation
 *
 * Reference: https://www.w3.org/TR/xpath20/#errors
 */

import { XPATH_ERROR_NAMESPACE } from './constants';

// Re-export constant from unified constants.ts
export { XPATH_ERROR_NAMESPACE };

/**
 * Base error class for all XPath errors
 */
export class XPathError extends Error {
    declare code: string;
    declare isStatic: boolean;
    declare isDynamic: boolean;

    constructor(
        code: string,
        message: string,
        isStatic: boolean = false,
        isDynamic: boolean = false
    ) {
        super(`${code}: ${message}`);
        Object.setPrototypeOf(this, XPathError.prototype);
        this.code = code;
        this.isStatic = isStatic;
        this.isDynamic = isDynamic;
        this.name = 'XPathError';
        // Maintain proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Get qualified error QName (e.g., "err:XPST0001")
     */
    getQName(): string {
        return `err:${this.code}`;
    }

    /**
     * Get error URI for namespace
     */
    getErrorURI(): string {
        return `${XPATH_ERROR_NAMESPACE}#${this.code}`;
    }
}

/**
 * Static error - detected during static analysis (parsing, early binding)
 * Cannot be caught by try-catch in XPath expressions
 */
export class XPathStaticError extends XPathError {
    constructor(code: string, message: string) {
        super(code, message, true, false);
        Object.setPrototypeOf(this, XPathStaticError.prototype);
        this.name = 'XPathStaticError';
    }
}

/**
 * Dynamic error - detected during expression evaluation
 * Can be caught by try-catch in XPath expressions
 */
export class XPathDynamicError extends XPathError {
    constructor(code: string, message: string) {
        super(code, message, false, true);
        Object.setPrototypeOf(this, XPathDynamicError.prototype);
        this.name = 'XPathDynamicError';
    }
}

/**
 * Type error - type mismatch or type constraint violation
 * Subclass of dynamic error per spec
 */
export class XPathTypeError extends XPathDynamicError {
    constructor(code: string, message: string) {
        super(code, message);
        Object.setPrototypeOf(this, XPathTypeError.prototype);
        this.name = 'XPathTypeError';
    }
}

// ============================================================================
// STATIC ERRORS (XPST*)
// ============================================================================

/**
 * XPST0001: Static context component undefined
 */
export function staticContextComponentUndefined(component: string): XPathStaticError {
    return new XPathStaticError('XPST0001', `Static context component undefined: ${component}`);
}

/**
 * XPST0003: Grammar violation (syntax error)
 */
export function grammarViolation(message: string): XPathStaticError {
    return new XPathStaticError('XPST0003', `Grammar violation: ${message}`);
}

/**
 * XPST0005: Empty sequence used in required context
 */
export function emptySequenceNotAllowed(context: string): XPathStaticError {
    return new XPathStaticError('XPST0005', `Empty sequence is not allowed in ${context}`);
}

/**
 * XPST0008: Unresolved name reference
 */
export function unresolvedNameReference(name: string, type: string = 'name'): XPathStaticError {
    return new XPathStaticError('XPST0008', `Unresolved ${type} reference: ${name}`);
}

/**
 * XPST0010: Unsupported axis
 */
export function unsupportedAxis(axis: string): XPathStaticError {
    return new XPathStaticError('XPST0010', `Unsupported axis: ${axis}`);
}

/**
 * XPST0017: Function signature mismatch
 */
export function functionSignatureMismatch(
    functionName: string,
    expectedArgs: string,
    actualArgs: number
): XPathStaticError {
    return new XPathStaticError(
        'XPST0017',
        `Function ${functionName} expects ${expectedArgs}, got ${actualArgs} arguments`
    );
}

/**
 * XPST0051: Unknown atomic type or unsupported cast target
 */
export function unknownAtomicType(typeName: string): XPathStaticError {
    return new XPathStaticError('XPST0051', `Unknown atomic type: ${typeName}`);
}

/**
 * XPST0080: NOTATION or xs:anyAtomicType used in cast
 */
export function notationOrAnyAtomicInCast(typeName: string): XPathStaticError {
    return new XPathStaticError(
        'XPST0080',
        `NOTATION and xs:anyAtomicType cannot be used in cast: ${typeName}`
    );
}

// ============================================================================
// DYNAMIC ERRORS (XPDY*)
// ============================================================================

/**
 * XPDY0002: Dynamic context component undefined
 */
export function dynamicContextUndefined(component: string): XPathDynamicError {
    return new XPathDynamicError('XPDY0002', `Dynamic context component undefined: ${component}`);
}

/**
 * XPDY0050: Context item is not a node (or document in specific contexts)
 */
export function contextItemNotNode(context?: string): XPathDynamicError {
    const msg = context ? `Context item is not a ${context}` : 'Context item is not a node';
    return new XPathDynamicError('XPDY0050', msg);
}

// ============================================================================
// TYPE ERRORS (XPTY*)
// ============================================================================

/**
 * XPTY0004: Type mismatch
 */
export function typeMismatch(expected: string, actual: string, context?: string): XPathTypeError {
    const msg = context
        ? `Type mismatch in ${context}: expected ${expected}, got ${actual}`
        : `Type mismatch: expected ${expected}, got ${actual}`;
    return new XPathTypeError('XPTY0004', msg);
}

/**
 * XPTY0018: Mixed node-set and atomic values in path
 */
export function mixedPathContent(): XPathTypeError {
    return new XPathTypeError(
        'XPTY0018',
        'Cannot mix node-set and atomic values in path expression'
    );
}

/**
 * XPTY0019: Non-node in path step
 */
export function nonNodeInPath(actual: string): XPathTypeError {
    return new XPathTypeError('XPTY0019', `Path step requires node, got ${actual}`);
}

/**
 * XPTY0020: Context item is not a node
 */
export function contextItemNotNodeInPath(): XPathTypeError {
    return new XPathTypeError('XPTY0020', 'Context item is not a node for path evaluation');
}

// ============================================================================
// FUNCTION EXECUTION ERRORS (FORG, FOTY, FODT, etc.)
// ============================================================================

/**
 * FORG0001: Invalid casting/conversion argument
 */
export function invalidCastArgument(value: unknown, targetType: string): XPathDynamicError {
    return new XPathDynamicError(
        'FORG0001',
        `Cannot cast ${JSON.stringify(value)} to ${targetType}`
    );
}

/**
 * FOTY0012: String value of element with element-only content
 */
export function elementOnlyContent(): XPathDynamicError {
    return new XPathDynamicError(
        'FOTY0012',
        'Cannot extract string value from element with element-only content'
    );
}

/**
 * FODT0002: Invalid timezone specification
 */
export function invalidTimezone(timezone: string): XPathDynamicError {
    return new XPathDynamicError('FODT0002', `Invalid timezone specification: ${timezone}`);
}

/**
 * Division by zero error (special numeric error)
 */
export function divisionByZero(): XPathDynamicError {
    return new XPathDynamicError('FOAR0001', 'Division by zero');
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a value is not null/undefined
 */
export function validateNotUndefined<T>(value: T | null | undefined, context: string): T {
    if (value === null || value === undefined) {
        throw dynamicContextUndefined(context);
    }
    return value;
}

/**
 * Validate function argument count
 */
export function validateArgumentCount(
    functionName: string,
    actualCount: number,
    expectedMin: number,
    expectedMax: number = expectedMin
): void {
    if (actualCount < expectedMin || actualCount > expectedMax) {
        const expected =
            expectedMin === expectedMax
                ? expectedMin.toString()
                : `${expectedMin} to ${expectedMax}`;
        throw functionSignatureMismatch(functionName, expected, actualCount);
    }
}

/**
 * Validate that operands are compatible for arithmetic
 */
export function validateNumericOperands(left: unknown, right: unknown): void {
    if (left === null || left === undefined || right === null || right === undefined) {
        // Empty sequence in arithmetic is valid (returns null/NaN)
        return;
    }
    if (typeof left !== 'number' && typeof left !== 'string' && typeof left !== 'boolean') {
        throw typeMismatch('numeric type', typeof left, 'arithmetic operation');
    }
    if (typeof right !== 'number' && typeof right !== 'string' && typeof right !== 'boolean') {
        throw typeMismatch('numeric type', typeof right, 'arithmetic operation');
    }
}

/**
 * Check if error is a static error
 */
export function isStaticError(error: unknown): error is XPathStaticError {
    return error instanceof XPathStaticError;
}

/**
 * Check if error is a dynamic error
 */
export function isDynamicError(error: unknown): error is XPathDynamicError {
    return error instanceof XPathDynamicError;
}

/**
 * Check if error is an XPath error
 */
export function isXPathError(error: unknown): error is XPathError {
    return error instanceof XPathError;
}

/**
 * Extract XPath error code from error
 */
export function getErrorCode(error: unknown): string | null {
    if (isXPathError(error)) {
        return error.code;
    }
    return null;
}

/**
 * Format error for display (includes code and message)
 */
export function formatError(error: unknown): string {
    if (isXPathError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
