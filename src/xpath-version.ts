/**
 * XPath version support and configuration.
 *
 * This module defines version-specific behavior and prepares for future XPath 2.0/3.0 support.
 */

/**
 * Supported XPath specification versions.
 */
export type XPathVersion = '1.0' | '2.0' | '3.0' | '3.1';

/**
 * Default XPath version used by the library.
 */
export const DEFAULT_XPATH_VERSION: XPathVersion = '1.0';

/**
 * XPath version configuration and feature flags.
 */
export interface XPathVersionConfig {
    /**
     * XPath specification version.
     */
    version: XPathVersion;

    /**
     * Feature flags for version-specific behavior.
     */
    features: {
        /**
         * XPath 2.0+ features
         */
        sequences?: boolean; // Sequences instead of node-sets
        typeSystem?: boolean; // Explicit type system (xs:string, xs:integer, etc.)
        ifThenElse?: boolean; // if-then-else expressions
        forExpressions?: boolean; // for/let/return (FLWOR)
        quantifiedExpressions?: boolean; // some/every expressions
        rangeExpressions?: boolean; // 1 to 10

        /**
         * XPath 3.0+ features
         */
        higherOrderFunctions?: boolean; // Functions as first-class values
        mapSupport?: boolean; // Map data type
        arraySupport?: boolean; // Array data type
        arrowOperator?: boolean; // => operator
        stringTemplates?: boolean; // String templates

        /**
         * XPath 3.1+ features
         */
        mapArrayConstructors?: boolean; // map{} and array{} constructors
        jsonSupport?: boolean; // JSON parsing functions
    };

    /**
     * Backward compatibility mode.
     * When true, allows XPath 1.0 expressions in higher versions.
     */
    backwardCompatible?: boolean;
}

/**
 * Predefined version configurations.
 */
export const XPATH_VERSION_CONFIGS: Record<XPathVersion, XPathVersionConfig> = {
    '1.0': {
        version: '1.0',
        features: {},
        backwardCompatible: true,
    },
    '2.0': {
        version: '2.0',
        features: {
            sequences: true,
            typeSystem: true,
            ifThenElse: true,
            forExpressions: true,
            quantifiedExpressions: true,
            rangeExpressions: true,
        },
        backwardCompatible: true,
    },
    '3.0': {
        version: '3.0',
        features: {
            sequences: true,
            typeSystem: true,
            ifThenElse: true,
            forExpressions: true,
            quantifiedExpressions: true,
            rangeExpressions: true,
            higherOrderFunctions: true,
            mapSupport: true,
            arraySupport: true,
            arrowOperator: true,
            stringTemplates: true,
        },
        backwardCompatible: true,
    },
    '3.1': {
        version: '3.1',
        features: {
            sequences: true,
            typeSystem: true,
            ifThenElse: true,
            forExpressions: true,
            quantifiedExpressions: true,
            rangeExpressions: true,
            higherOrderFunctions: true,
            mapSupport: true,
            arraySupport: true,
            arrowOperator: true,
            stringTemplates: true,
            mapArrayConstructors: true,
            jsonSupport: true,
        },
        backwardCompatible: true,
    },
};

/**
 * Get configuration for a specific XPath version.
 */
export function getVersionConfig(version: XPathVersion): XPathVersionConfig {
    return XPATH_VERSION_CONFIGS[version];
}

/**
 * Check if a feature is supported in a given version.
 */
export function isFeatureSupported(
    version: XPathVersion,
    feature: keyof XPathVersionConfig['features']
): boolean {
    const config = getVersionConfig(version);
    return config.features[feature] === true;
}

/**
 * XPath 2.0+ type system support (placeholder for future implementation).
 */
export interface XPathType {
    /**
     * Type name (e.g., 'xs:string', 'xs:integer', 'node()', 'item()')
     */
    name: string;

    /**
     * Type category
     */
    category: 'atomic' | 'node' | 'function' | 'sequence';

    /**
     * Whether this type accepts empty sequences
     */
    optional?: boolean;

    /**
     * Cardinality indicator
     * - 'one': exactly one
     * - 'zero-or-one': ?
     * - 'zero-or-more': *
     * - 'one-or-more': +
     */
    cardinality?: 'one' | 'zero-or-one' | 'zero-or-more' | 'one-or-more';
}

/**
 * XPath sequence type (XPath 2.0+).
 * In XPath 2.0+, all values are sequences (even single items are sequences of length 1).
 */
export interface XPathSequence {
    items: any[];
    type?: XPathType;
}

/**
 * Check if a value is an XPath sequence.
 */
export function isSequence(value: any): value is XPathSequence {
    return value && typeof value === 'object' && 'items' in value && Array.isArray(value.items);
}

/**
 * Convert XPath 1.0 result to XPath 2.0+ sequence.
 */
export function toSequence(value: any): XPathSequence {
    if (isSequence(value)) {
        return value;
    }

    if (Array.isArray(value)) {
        return { items: value };
    }

    // Single item becomes sequence of length 1
    return { items: [value] };
}

/**
 * Convert XPath 2.0+ sequence to XPath 1.0 result.
 */
export function fromSequence(sequence: XPathSequence): any {
    const items = sequence.items;

    // Empty sequence -> empty array for node-sets, undefined otherwise
    if (items.length === 0) {
        return [];
    }

    // Single item -> unwrap
    if (items.length === 1) {
        return items[0];
    }

    // Multiple items -> return array
    return items;
}
