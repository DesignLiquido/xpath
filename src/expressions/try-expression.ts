/**
 * Try-Catch Expression - XSLT 3.0 Error Handling
 *
 * Implements the try-catch expression for handling errors in XPath/XSLT.
 * Syntax: try { expression } catch (err) { handler }
 *
 * The try-catch expression evaluates an expression and catches any dynamic errors,
 * allowing graceful error recovery or alternative processing.
 *
 * Note: Currently a simplified implementation that provides the expression structure.
 * Full async evaluation would require updating the XPathExpression base class.
 */

import { XPathExpression } from './expression';
import { XPathContext } from '../context';

/**
 * Error information captured by catch block
 */
export interface CaughtError {
    /**
     * Error code as string (e.g., 'XPTY0004')
     */
    code: string;

    /**
     * Human-readable error description
     */
    description: string;

    /**
     * Error value (the original error object if available)
     */
    value?: any;

    /**
     * Stack trace if available
     */
    stack?: string;

    /**
     * Error type: 'static', 'dynamic', or 'type'
     */
    type: 'static' | 'dynamic' | 'type';
}

/**
 * Try-Catch Expression Implementation
 *
 * Evaluates a try expression and falls back to a catch expression on error.
 * The catch expression has access to the error information via error variables.
 */
export class TryExpression extends XPathExpression {
    /**
     * The expression to try
     */
    private tryExpr: XPathExpression;

    /**
     * Optional catch expression (evaluated if try fails)
     */
    private catchExpr: XPathExpression | null;

    /**
     * Optional error variable pattern to capture error info
     * Can match specific error codes or catch all
     */
    private errorPattern: string | null;

    /**
     * Variable name to bind error information
     */
    private errorVariableName: string | null;

    constructor(
        tryExpression: XPathExpression,
        catchExpression?: XPathExpression,
        errorPattern?: string,
        errorVariableName?: string
    ) {
        super();
        this.tryExpr = tryExpression;
        this.catchExpr = catchExpression || null;
        this.errorPattern = errorPattern || null;
        this.errorVariableName = errorVariableName || null;
    }

    /**
     * Evaluate the try-catch expression
     *
     * Note: This is a synchronous implementation for compatibility.
     * For full async support, the base XPathExpression class would need updating.
     */
    evaluate(context: XPathContext): any {
        try {
            // Attempt to evaluate the try expression
            const result = this.tryExpr.evaluate(context);

            // Handle promises if returned
            if (result && typeof result === 'object' && typeof (result as any).catch === 'function') {
                return (result as any).catch((error: any) => this.handleError(error, context));
            }

            return result;
        } catch (error) {
            // If catch expression not provided, suppress error and return empty sequence
            if (!this.catchExpr) {
                return undefined;
            }

            return this.handleError(error, context);
        }
    }

    /**
     * Handle caught error and evaluate catch expression
     */
    private handleError(error: any, context: XPathContext): any {
        // Create caught error information
        const caughtError = this.createCaughtError(error);

        // Check if error matches pattern
        if (this.errorPattern && !this.matchesErrorPattern(caughtError, this.errorPattern)) {
            // Error doesn't match pattern, re-throw
            throw error;
        }

        // Create new context with error information
        const catchContext: any = {
            node: (context as any).node,
            position: (context as any).position,
            size: (context as any).size,
            variables: (context as any).variables ? new Map((context as any).variables) : new Map(),
            functions: (context as any).functions || {},
        };

        // Bind error information to context if variable name specified
        if (this.errorVariableName) {
            catchContext.variables.set(this.errorVariableName, caughtError);
        }

        // Also provide error components as individual variables
        catchContext.variables.set('err:code', caughtError.code);
        catchContext.variables.set('err:description', caughtError.description);
        catchContext.variables.set('err:value', caughtError.value);

        // Evaluate catch expression
        return this.catchExpr!.evaluate(catchContext);
    }

    /**
     * Create caught error information from thrown error
     */
    private createCaughtError(error: any): CaughtError {
        let code = 'UNKNOWN';
        let description = 'Unknown error';
        let type: 'static' | 'dynamic' | 'type' = 'dynamic';

        if (typeof error === 'string') {
            description = error;
        } else if (error && typeof error === 'object') {
            if (error.message) {
                description = error.message;
            }
            if (error.code) {
                code = error.code;
            }
            if (error.type) {
                type = error.type;
            }
        }

        return {
            code,
            description,
            value: error,
            stack: error?.stack,
            type,
        };
    }

    /**
     * Check if caught error matches error pattern
     */
    private matchesErrorPattern(caughtError: CaughtError, pattern: string): boolean {
        // Pattern can be:
        // - "*" matches all errors
        // - "XPTY0004" matches specific error code
        // - "err:*" matches all err: namespace errors

        if (pattern === '*') {
            return true;
        }

        // Exact match
        return caughtError.code === pattern || caughtError.code.includes(pattern);
    }

    /**
     * Get string representation
     */
    override toString(): string {
        let result = `try { ${this.tryExpr.toString()} }`;
        if (this.catchExpr) {
            result += ` catch`;
            if (this.errorPattern) {
                result += ` (${this.errorPattern})`;
            }
            result += ` { ${this.catchExpr.toString()} }`;
        }
        return result;
    }
}

/**
 * Create a try-catch expression
 *
 * Usage:
 *   createTryExpression(tryExpr, catchExpr, "err:*", "error")
 */
export function createTryExpression(
    tryExpression: XPathExpression,
    catchExpression?: XPathExpression,
    errorPattern?: string,
    errorVariableName?: string
): TryExpression {
    return new TryExpression(tryExpression, catchExpression, errorPattern, errorVariableName);
}

/**
 * Helper to create simple try-catch (return empty on error)
 */
export function createTryOnly(tryExpression: XPathExpression): TryExpression {
    return new TryExpression(tryExpression, null);
}

/**
 * Helper to create try-catch with fallback value
 */
export function createTryWithFallback(
    tryExpression: XPathExpression,
    fallbackValue: any
): TryExpression {
    // Create literal expression for fallback
    const fallbackExpr = new (class extends XPathExpression {
        evaluate(): any {
            return fallbackValue;
        }
        toString(): string {
            return JSON.stringify(fallbackValue);
        }
    })();

    return new TryExpression(tryExpression, fallbackExpr);
}

/**
 * Common XSLT 3.0 Error Codes
 */
export const XSLT3ErrorCodes = {
    /**
     * Type error
     */
    XPTY0004: 'XPTY0004',

    /**
     * Division by zero
     */
    FOAR0001: 'FOAR0001',

    /**
     * Invalid argument
     */
    FORG0001: 'FORG0001',

    /**
     * Invalid QName
     */
    FONS0004: 'FONS0004',

    /**
     * Sequence is empty
     */
    FORG0004: 'FORG0004',

    /**
     * Sequence has more than one item
     */
    FORG0005: 'FORG0005',

    /**
     * Variable not defined
     */
    XPST0008: 'XPST0008',

    /**
     * Context item is not a node
     */
    XPTY0019: 'XPTY0019',

    /**
     * Invalid format-string
     */
    FODF1310: 'FODF1310',

    /**
     * Schema not available
     */
    XPST0051: 'XPST0051',
};

/**
 * Helper to safely evaluate expression without error propagation
 *
 * Returns empty sequence if any error occurs
 */
export function safeEvaluate(expr: XPathExpression, context: XPathContext): any {
    const tryExpr = createTryOnly(expr);
    return tryExpr.evaluate(context);
}
