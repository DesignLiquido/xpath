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

import { ItemType, SequenceType } from './sequence-type';

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
 * Function test item type (e.g., function(*)) for sequence type matching.
 */
export interface FunctionTestItemType extends ItemType {
    /** Marker to identify this as a function() test */
    readonly isFunctionTest: true;
    /** Parameter type constraints (undefined/null means wildcard) */
    readonly parameterTypes?: SequenceType[] | null;
    /** Return type constraint (undefined/null means wildcard) */
    readonly returnType?: SequenceType | null;
    /** Whether this is the wildcard function(*) test */
    readonly isWildcard: boolean;
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
 * Create a function() type test (supports function(*) wildcard).
 */
export function createFunctionTest(
    parameterTypes: SequenceType[] | null = null,
    returnType: SequenceType | null = null,
    opts?: { isWildcard?: boolean }
): FunctionTestItemType {
    const isWildcard = opts?.isWildcard ?? (parameterTypes === null && returnType === null);
    const paramCount = Array.isArray(parameterTypes) ? parameterTypes.length : undefined;

    const typeName = isWildcard
        ? 'function(*)'
        : `function(${parameterTypes?.map((p) => p.toString()).join(', ') ?? ''})` +
        (returnType ? ` as ${returnType.toString()}` : '');

    return {
        name: typeName,
        isFunctionTest: true,
        isWildcard,
        parameterTypes: parameterTypes ?? undefined,
        returnType: returnType ?? undefined,
        matches(value: any): boolean {
            if (value === null || value === undefined) {
                return false;
            }

            const isFunctionItemLike =
                (typeof value === 'object' && value.__isFunctionItem === true) ||
                typeof value === 'function';

            // Maps and arrays are function items in XPath 3.1
            const isTypedMap = typeof value === 'object' && value?.__isMap === true;
            const isTypedArray = typeof value === 'object' && value?.__isArray === true;

            if (!isFunctionItemLike && !isTypedMap && !isTypedArray) {
                return false;
            }

            if (isWildcard) {
                return true;
            }

            // If we have parameter types, enforce arity equality when we can observe it
            if (paramCount !== undefined) {
                const observedArity = isTypedMap || isTypedArray
                    ? 1
                    : typeof value === 'function'
                        ? value.length
                        : typeof value?.arity === 'number'
                            ? value.arity
                            : undefined;

                if (observedArity !== undefined && observedArity !== paramCount) {
                    return false;
                }
            }

            return true;
        },
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
    const params = type.parameterTypes.map((p) => String(p)).join(', ');
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
