/**
 * XPath 3.0 Environment Functions
 *
 * Implements environment variable access functions:
 * https://www.w3.org/TR/xpath-functions-30/#environment
 */

import { XPathContext, XPathResult } from '../context';

/**
 * fn:environment-variable($name as xs:string) as xs:string?
 * Returns the value of an environment variable, or empty if not found.
 */
export function environmentVariable(context: XPathContext, name: any): XPathResult {
    const varName = String(name);

    // In Node.js, access process.env
    if (typeof process !== 'undefined' && process.env) {
        const value = process.env[varName];
        return value !== undefined ? value : null;
    }

    // In browser environment, return null (no env vars available)
    return null;
}

/**
 * fn:available-environment-variables() as xs:string*
 * Returns a sequence of all available environment variable names.
 */
export function availableEnvironmentVariables(context: XPathContext): XPathResult {
    // In Node.js, return keys from process.env
    if (typeof process !== 'undefined' && process.env) {
        return Object.keys(process.env);
    }

    // In browser environment, return empty sequence
    return [];
}

// Export all environment functions
export const ENVIRONMENT_FUNCTIONS = {
    'environment-variable': environmentVariable,
    'available-environment-variables': availableEnvironmentVariables,
};
