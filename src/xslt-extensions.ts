/**
 * XSLT Extension Function specification for integration with xslt-processor.
 * 
 * This file defines the interface and types for XSLT 1.0 extension functions.
 * The actual implementations live in the xslt-processor package.
 */

import { XPathContext } from './context';
import { XPathStaticContext } from './static-context';
import { XPathNode } from './node';
import { WarningConfiguration, WarningCollector } from './warnings';

/**
 * Signature for an XSLT extension function.
 * 
 * Extension functions receive arguments that have already been evaluated
 * by the XPath parser and must return a valid XPath result type.
 */
export type XSLTExtensionFunction = (
    context: XPathContext,
    ...args: any[]
) => any;

/**
 * Metadata for an XSLT extension function.
 */
export interface XSLTFunctionMetadata {
    /**
     * Function name as it appears in XPath expressions.
     * Examples: 'document', 'key', 'format-number'
     */
    name: string;

    /**
     * Minimum number of required arguments.
     */
    minArgs: number;

    /**
     * Maximum number of arguments (undefined for unlimited).
     */
    maxArgs?: number;

    /**
     * Function implementation.
     */
    implementation: XSLTExtensionFunction;

    /**
     * Brief description for documentation.
     */
    description?: string;
}

/**
 * XSLT Extensions bundle that can be passed to the XPath parser.
 * 
 * This interface allows the xslt-processor package to provide XSLT-specific
 * functions while keeping the xpath library pure XPath 1.0.
 */
export interface XSLTExtensions {
    /**
     * List of XSLT extension functions to register.
     */
    functions: XSLTFunctionMetadata[];

    /**
     * XSLT version these extensions implement.
     */
    version: '1.0' | '2.0' | '3.0';

    /**
     * Optional: Additional context properties needed by XSLT functions.
     * For example, key definitions for key() function, or document cache for document().
     */
    contextExtensions?: {
        /**
         * Key definitions from <xsl:key> elements.
         * Format: { keyName: { match: string, use: string } }
         */
        keys?: Record<string, { match: string; use: string }>;

        /**
         * Document loader for document() function.
         */
        documentLoader?: (uri: string, baseUri?: string) => XPathNode | null;

        /**
         * Decimal format definitions from <xsl:decimal-format> elements.
         * Used by format-number() function.
         */
        decimalFormats?: Record<string, any>;

        /**
         * System properties for system-property() function.
         */
        systemProperties?: Record<string, string>;
    };
}

/**
 * Parser options that include XSLT extensions support.
 */
export interface XPathBaseParserOptions {
    /**
     * XPath specification version to use.
     *
     * - '1.0': XPath 1.0 (default, fully implemented)
     * - '2.0': XPath 2.0 (adds if-then-else, for, quantified expressions, type system)
     * - '3.0': XPath 3.0 (not yet implemented, falls back to 2.0 parser)
     * - '3.1': XPath 3.1 (not yet implemented, falls back to 2.0 parser)
     *
     * When using XPath10Parser, only '1.0' is valid.
     * When using XPath20Parser, only '2.0' is valid (in strict mode).
     * Use createXPathParser() factory for automatic version selection.
     *
     * Default: '1.0'
     */
    version?: '1.0' | '2.0' | '3.0' | '3.1';

    /**
     * Optional XSLT extensions to enable.
     * When provided, the parser will recognize and allow calling XSLT functions.
     */
    extensions?: XSLTExtensions;

    /**
     * Whether to cache parsed expressions for reuse.
     * Default: false
     */
    cache?: boolean;

    /**
     * Strict mode: throw errors for unsupported features.
     * When false, unsupported features may be silently ignored or cause warnings.
     * Default: true
     */
    strict?: boolean;

    /**
     * Enable support for the deprecated namespace axis (namespace::).
     * Default: false (raises XPST0010 when used).
     */
    enableNamespaceAxis?: boolean;

    /**
     * Static context configuration (in-scope types, functions, collations, variables).
     * Defaults to an empty static context with XPath-defined namespaces.
     */
    staticContext?: XPathStaticContext;

    /**
     * Enable XPath 1.0 backward compatibility mode.
     *
     * When true, XPath 2.0+ expressions follow XPath 1.0 type conversion rules.
     * This enables:
     * - XPath 1.0 boolean conversion semantics
     * - XPath 1.0 numeric conversion (with NaN for empty sequences)
     * - XPath 1.0 comparison rules (node-set to string conversion)
     * - XPath 1.0 logical operator behavior (short-circuit, error suppression)
     *
     * This option is only meaningful when version is '2.0' or higher.
     * When version is '1.0', this option is ignored (1.0 semantics are used).
     *
     * Default: false (XPath 2.0 semantics when using 2.0+ parser)
     */
    xpath10CompatibilityMode?: boolean;

    /**
     * Warning configuration for deprecated features and migration guidance (Phase 8.2).
     * Configure how warnings are collected, filtered, and reported.
     * Default: warnings enabled with 'info' minimum severity
     */
    warningConfig?: WarningConfiguration;

    /**
     * Warning collector instance for gathering warnings during parsing.
     * If not provided, a new collector will be created based on warningConfig.
     * Passing an existing collector allows aggregating warnings across multiple parses.
     */
    warningCollector?: WarningCollector;
}

/**
 * Helper to create an empty XSLT extensions bundle.
 * Useful for testing or as a starting point.
 */
export function createEmptyExtensions(version: '1.0' | '2.0' | '3.0' = '1.0'): XSLTExtensions {
    return {
        functions: [],
        version,
    };
}

/**
 * Helper to validate XSLT extensions bundle.
 * Checks for duplicate function names and invalid configurations.
 */
export function validateExtensions(extensions: XSLTExtensions): string[] {
    const errors: string[] = [];
    const functionNames = new Set<string>();

    for (const func of extensions.functions) {
        // Check for duplicate function names
        if (functionNames.has(func.name)) {
            errors.push(`Duplicate function name: ${func.name}`);
        }
        functionNames.add(func.name);

        // Validate argument counts
        if (func.minArgs < 0) {
            errors.push(`Function ${func.name}: minArgs cannot be negative`);
        }
        if (func.maxArgs !== undefined && func.maxArgs < func.minArgs) {
            errors.push(`Function ${func.name}: maxArgs cannot be less than minArgs`);
        }

        // Check implementation exists
        if (typeof func.implementation !== 'function') {
            errors.push(`Function ${func.name}: implementation must be a function`);
        }
    }

    return errors;
}

/**
 * Extract function names from XSLT extensions.
 * Useful for registering extension functions with the lexer.
 */
export function getExtensionFunctionNames(extensions: XSLTExtensions): string[] {
    return extensions.functions.map(f => f.name);
}
