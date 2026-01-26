/**
 * XPath 3.0 Math Functions
 * 
 * Implements functions from the math namespace:
 * http://www.w3.org/2005/xpath-functions/math
 * 
 * Reference: https://www.w3.org/TR/xpath-functions-30/#math-functions
 */

import { XPathContext } from '../context';

const MATH_NAMESPACE = 'http://www.w3.org/2005/xpath-functions/math';

/**
 * math:pi() - Returns the mathematical constant π
 * @returns The value of π (approximately 3.141592653589793)
 */
export function pi(context: XPathContext): number {
    return Math.PI;
}

/**
 * math:exp($arg) - Returns e raised to the power of $arg
 * @param context XPath context
 * @param arg The exponent
 * @returns e^arg
 */
export function exp(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.exp(value);
}

/**
 * math:exp10($arg) - Returns 10 raised to the power of $arg
 * @param context XPath context
 * @param arg The exponent
 * @returns 10^arg
 */
export function exp10(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.pow(10, value);
}

/**
 * math:log($arg) - Returns the natural logarithm of $arg
 * @param context XPath context
 * @param arg The value
 * @returns Natural logarithm (base e) of arg
 */
export function log(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.log(value);
}

/**
 * math:log10($arg) - Returns the base-10 logarithm of $arg
 * @param context XPath context
 * @param arg The value
 * @returns Base-10 logarithm of arg
 */
export function log10(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.log10(value);
}

/**
 * math:pow($x, $y) - Returns $x raised to the power of $y
 * @param context XPath context
 * @param x The base
 * @param y The exponent
 * @returns x^y
 */
export function pow(context: XPathContext, x: any, y: any): number {
    const base = toNumber(x);
    const exponent = toNumber(y);
    return Math.pow(base, exponent);
}

/**
 * math:sqrt($arg) - Returns the square root of $arg
 * @param context XPath context
 * @param arg The value
 * @returns Square root of arg
 */
export function sqrt(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.sqrt(value);
}

/**
 * math:sin($arg) - Returns the sine of $arg (in radians)
 * @param context XPath context
 * @param arg The angle in radians
 * @returns Sine of arg
 */
export function sin(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.sin(value);
}

/**
 * math:cos($arg) - Returns the cosine of $arg (in radians)
 * @param context XPath context
 * @param arg The angle in radians
 * @returns Cosine of arg
 */
export function cos(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.cos(value);
}

/**
 * math:tan($arg) - Returns the tangent of $arg (in radians)
 * @param context XPath context
 * @param arg The angle in radians
 * @returns Tangent of arg
 */
export function tan(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.tan(value);
}

/**
 * math:asin($arg) - Returns the arc sine of $arg
 * @param context XPath context
 * @param arg The value (must be in range [-1, 1])
 * @returns Arc sine of arg in radians
 */
export function asin(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.asin(value);
}

/**
 * math:acos($arg) - Returns the arc cosine of $arg
 * @param context XPath context
 * @param arg The value (must be in range [-1, 1])
 * @returns Arc cosine of arg in radians
 */
export function acos(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.acos(value);
}

/**
 * math:atan($arg) - Returns the arc tangent of $arg
 * @param context XPath context
 * @param arg The value
 * @returns Arc tangent of arg in radians
 */
export function atan(context: XPathContext, arg: any): number {
    const value = toNumber(arg);
    return Math.atan(value);
}

/**
 * math:atan2($y, $x) - Returns the angle (in radians) from the X axis to the point (x,y)
 * @param context XPath context
 * @param y The y-coordinate
 * @param x The x-coordinate
 * @returns Arc tangent of y/x in radians, range [-π, π]
 */
export function atan2(context: XPathContext, y: any, x: any): number {
    const yValue = toNumber(y);
    const xValue = toNumber(x);
    return Math.atan2(yValue, xValue);
}

/**
 * Helper function to convert a value to a number
 * Handles empty sequences and converts basic values
 */
function toNumber(value: any): number {
    // Handle null/undefined/empty sequence
    if (value === null || value === undefined) {
        return NaN;
    }

    // Handle arrays (take first item or return NaN for empty)
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return NaN;
        }
        return toNumber(value[0]);
    }

    // Convert to number directly
    const num = Number(value);
    return num;
}

// Export all math functions
export const MATH_FUNCTIONS = {
    pi,
    exp,
    exp10,
    log,
    log10,
    pow,
    sqrt,
    sin,
    cos,
    tan,
    asin,
    acos,
    atan,
    atan2,
};
