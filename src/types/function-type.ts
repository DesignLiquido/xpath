/**
 * XPath 3.0 Function Type System
 *
 * In XPath 3.0, functions are first-class values that can be:
 * - Passed as arguments to other functions
 * - Returned from functions
 * - Stored in variables
 * - Created as anonymous inline functions
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-function-item-types
 */

import { SequenceType } from './sequence-type';

/**
 * Represents the type signature of a function.
 */
export interface FunctionType {
    kind: 'function';
    /** Types of the function parameters */
    parameterTypes: SequenceType[];
    /** Return type of the function */
    returnType: SequenceType;
    /** Number of parameters (arity) */
    arity: number;
}

/**
 * Represents a function item - a first-class function value in XPath 3.0.
 *
 * Function items can be:
 * - Named functions obtained via function references (fn:upper-case#1)
 * - Anonymous inline functions (function($x) { $x + 1 })
 * - Partially applied functions
 *
 * This interface extends XPathFunctionItem from context.ts to ensure
 * FunctionItem values are valid XPathResult values.
 */
export interface FunctionItem {
    /** Marker to identify this as a function item */
    __isFunctionItem: true;
    /** The type signature of the function */
    type?: FunctionType;
    /** The actual implementation */
    implementation: (...args: any[]) => any;
    /** Function name (undefined for anonymous functions) */
    name?: string;
    /** Namespace URI for named functions */
    namespace?: string;
    /** Number of parameters */
    arity: number;
    /** Captured closure context for inline functions */
    closureContext?: Record<string, any>;
}

/**
 * Create a function item from an implementation.
 */
export function createFunctionItem(
    implementation: (...args: any[]) => any,
    arity: number,
    name?: string,
    namespace?: string,
    type?: FunctionType
): FunctionItem {
    return {
        __isFunctionItem: true,
        implementation,
        arity,
        name,
        namespace,
        type,
    };
}

/**
 * Check if a value is a function item.
 */
export function isFunctionItem(value: any): value is FunctionItem {
    return value && typeof value === 'object' && value.__isFunctionItem === true;
}

/**
 * Create a function type from parameter and return types.
 */
export function createFunctionType(
    parameterTypes: SequenceType[],
    returnType: SequenceType
): FunctionType {
    return {
        kind: 'function',
        parameterTypes,
        returnType,
        arity: parameterTypes.length,
    };
}

/**
 * Get a string representation of a function type.
 */
export function describeFunctionType(type: FunctionType): string {
    const params = type.parameterTypes.map(p => String(p)).join(', ');
    return `function(${params}) as ${type.returnType}`;
}

/**
 * Default function namespace (fn)
 */
export const FN_NAMESPACE = 'http://www.w3.org/2005/xpath-functions';

/**
 * Math function namespace
 */
export const MATH_NAMESPACE = 'http://www.w3.org/2005/xpath-functions/math';

/**
 * Map function namespace (XPath 3.1)
 */
export const MAP_NAMESPACE = 'http://www.w3.org/2005/xpath-functions/map';

/**
 * Array function namespace (XPath 3.1)
 */
export const ARRAY_NAMESPACE = 'http://www.w3.org/2005/xpath-functions/array';
