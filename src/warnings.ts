/**
 * XPath Warning System (Phase 8.2)
 *
 * Provides runtime warnings for deprecated features, potential incompatibilities,
 * and migration guidance when using XPath expressions.
 *
 * Reference: XPath 2.0 Specification, Appendix I (Incompatibilities)
 */

/**
 * Warning severity levels
 */
export type WarningSeverity = 'info' | 'warning' | 'deprecation';

/**
 * Warning categories for grouping and filtering
 */
export type WarningCategory =
    | 'deprecation'
    | 'compatibility'
    | 'performance'
    | 'type-coercion'
    | 'behavior-change';

/**
 * Metadata for warning codes
 */
export interface WarningCodeMetadata {
    code: string;
    severity: WarningSeverity;
    category: WarningCategory;
    title: string;
    description: string;
    migration?: string;
    specReference?: string;
}

/**
 * Represents a single warning instance
 */
export interface XPathWarning {
    code: string;
    message: string;
    severity: WarningSeverity;
    category: WarningCategory;
    context?: string;
    expression?: string;
    line?: number;
    column?: number;
}

/**
 * All XPath warning codes with metadata
 */
export const WARNING_CODES: Record<string, WarningCodeMetadata> = {
    // ========================================================================
    // DEPRECATION WARNINGS
    // ========================================================================
    XPWD0001: {
        code: 'XPWD0001',
        severity: 'deprecation',
        category: 'deprecation',
        title: 'Namespace axis deprecated',
        description:
            'The namespace axis (namespace::) is deprecated in XPath 2.0 and may not be ' +
            'supported in all implementations. Consider using fn:namespace-uri-for-prefix() ' +
            'or fn:in-scope-prefixes() instead.',
        migration:
            'Replace namespace::* with fn:in-scope-prefixes(.) to get namespace prefixes, ' +
            'or use fn:namespace-uri-for-prefix($prefix, .) to get namespace URIs.',
        specReference: 'XPath 2.0 Section 3.2.1.1',
    },

    XPWD0002: {
        code: 'XPWD0002',
        severity: 'deprecation',
        category: 'deprecation',
        title: 'Implicit string conversion',
        description:
            'Implicit conversion of node-sets to strings using the first node is deprecated. ' +
            'In XPath 2.0, this requires explicit conversion using fn:string() or data().',
        migration:
            'Use fn:string($nodeset) or fn:data($nodeset) for explicit conversion.',
        specReference: 'XPath 2.0 Appendix I.2',
    },

    // ========================================================================
    // COMPATIBILITY WARNINGS
    // ========================================================================
    XPWC0001: {
        code: 'XPWC0001',
        severity: 'warning',
        category: 'compatibility',
        title: 'XPath 1.0 compatibility mode active',
        description:
            'XPath 1.0 compatibility mode is enabled. Some XPath 2.0 type safety features ' +
            'are relaxed to maintain backward compatibility.',
        migration:
            'Consider migrating to XPath 2.0 semantics for improved type safety.',
        specReference: 'XPath 2.0 Section 3.6',
    },

    XPWC0002: {
        code: 'XPWC0002',
        severity: 'warning',
        category: 'compatibility',
        title: 'String comparison in XPath 2.0',
        description:
            'String comparisons in XPath 2.0 are performed using Unicode codepoint collation ' +
            'by default, which may produce different results than XPath 1.0.',
        migration:
            'Use explicit collation specification if locale-specific comparison is needed.',
        specReference: 'XPath 2.0 Appendix I.4',
    },

    XPWC0003: {
        code: 'XPWC0003',
        severity: 'warning',
        category: 'compatibility',
        title: 'Empty sequence handling differs',
        description:
            'In XPath 2.0, operations on empty sequences may return empty sequences instead ' +
            'of NaN or false as in XPath 1.0.',
        migration:
            'Use explicit empty sequence handling with fn:empty() or default values.',
        specReference: 'XPath 2.0 Appendix I.3',
    },

    // ========================================================================
    // TYPE COERCION WARNINGS
    // ========================================================================
    XPWT0001: {
        code: 'XPWT0001',
        severity: 'warning',
        category: 'type-coercion',
        title: 'Implicit numeric conversion',
        description:
            'Value is being implicitly converted to a number. In XPath 2.0, this requires ' +
            'explicit conversion in strict mode.',
        migration: 'Use xs:decimal(), xs:double(), or number() for explicit conversion.',
        specReference: 'XPath 2.0 Appendix I.2',
    },

    XPWT0002: {
        code: 'XPWT0002',
        severity: 'warning',
        category: 'type-coercion',
        title: 'Implicit boolean conversion',
        description:
            'Value is being implicitly converted to boolean using XPath 1.0 rules. ' +
            'In XPath 2.0, this is called Effective Boolean Value (EBV).',
        migration: 'Use fn:boolean() for explicit conversion.',
        specReference: 'XPath 2.0 Section 2.4.3',
    },

    XPWT0003: {
        code: 'XPWT0003',
        severity: 'info',
        category: 'type-coercion',
        title: 'Numeric type promotion',
        description:
            'Numeric value is being promoted in the type hierarchy (integer → decimal → ' +
            'float → double). This may result in precision loss.',
        migration:
            'Consider using explicit casting if precision is important.',
        specReference: 'XPath 2.0 Appendix B.1',
    },

    // ========================================================================
    // BEHAVIOR CHANGE WARNINGS
    // ========================================================================
    XPWB0001: {
        code: 'XPWB0001',
        severity: 'warning',
        category: 'behavior-change',
        title: 'Arithmetic with empty sequence',
        description:
            'In XPath 2.0, arithmetic operations with empty sequences return empty sequences, ' +
            'not NaN as in XPath 1.0.',
        migration:
            'Handle empty sequences explicitly before arithmetic operations.',
        specReference: 'XPath 2.0 Appendix I.3',
    },

    XPWB0002: {
        code: 'XPWB0002',
        severity: 'warning',
        category: 'behavior-change',
        title: 'Comparison with empty sequence',
        description:
            'In XPath 2.0, value comparisons (eq, ne, etc.) with empty sequences return ' +
            'empty sequences, not false.',
        migration:
            'Use fn:empty() or fn:exists() to check for empty sequences before comparison.',
        specReference: 'XPath 2.0 Appendix I.3',
    },

    XPWB0003: {
        code: 'XPWB0003',
        severity: 'warning',
        category: 'behavior-change',
        title: 'Multiple values in singleton context',
        description:
            'A sequence with multiple items is being used where a single item is expected. ' +
            'In XPath 2.0, this may raise a type error.',
        migration:
            'Use predicates or fn:head() to select a single item.',
        specReference: 'XPath 2.0 Section 2.4.4',
    },

    XPWB0004: {
        code: 'XPWB0004',
        severity: 'warning',
        category: 'behavior-change',
        title: 'String value of nodes',
        description:
            'The string value of typed nodes in XPath 2.0 may differ from XPath 1.0 when ' +
            'schema type information is present.',
        migration:
            'Use fn:string() for consistent string conversion.',
        specReference: 'XPath 2.0 Appendix I.1',
    },

    // ========================================================================
    // PERFORMANCE WARNINGS
    // ========================================================================
    XPWP0001: {
        code: 'XPWP0001',
        severity: 'info',
        category: 'performance',
        title: 'Descendant axis on large document',
        description:
            'Using descendant or descendant-or-self axis on large documents may impact ' +
            'performance. Consider using more specific path expressions.',
        migration:
            'Use more specific paths or indexes if available.',
    },

    XPWP0002: {
        code: 'XPWP0002',
        severity: 'info',
        category: 'performance',
        title: 'General comparison on sequences',
        description:
            'General comparisons (=, !=, etc.) on sequences perform existential quantification, ' +
            'which may be slower than value comparisons on single items.',
        migration:
            'Use value comparisons (eq, ne, etc.) when comparing single values.',
        specReference: 'XPath 2.0 Section 3.5.2',
    },
};

/**
 * Warning handler function type
 */
export type WarningHandler = (warning: XPathWarning) => void;

/**
 * Configuration for warning behavior
 */
export interface WarningConfiguration {
    /**
     * Whether warnings are enabled. Default: true
     */
    enabled?: boolean;

    /**
     * Minimum severity level to report. Default: 'info'
     */
    minSeverity?: WarningSeverity;

    /**
     * Categories to suppress (not report)
     */
    suppressCategories?: WarningCategory[];

    /**
     * Specific warning codes to suppress
     */
    suppressCodes?: string[];

    /**
     * Custom warning handler. If not provided, warnings are collected internally.
     */
    handler?: WarningHandler;

    /**
     * Whether to also log warnings to console. Default: false
     */
    logToConsole?: boolean;

    /**
     * Maximum number of warnings to collect before stopping. Default: 100
     */
    maxWarnings?: number;

    /**
     * Whether to emit each warning only once per expression. Default: true
     */
    emitOnce?: boolean;
}

/**
 * Default warning configuration
 */
export const DEFAULT_WARNING_CONFIG: Required<WarningConfiguration> = {
    enabled: true,
    minSeverity: 'info',
    suppressCategories: [],
    suppressCodes: [],
    handler: () => { },
    logToConsole: false,
    maxWarnings: 100,
    emitOnce: true,
};

/**
 * Severity level numeric values for comparison
 */
const SEVERITY_LEVELS: Record<WarningSeverity, number> = {
    info: 0,
    warning: 1,
    deprecation: 2,
};

/**
 * Warning collector class for managing warnings during expression evaluation
 */
export class WarningCollector {
    private warnings: XPathWarning[] = [];
    private config: Required<WarningConfiguration>;
    private emittedCodes: Set<string> = new Set();

    constructor(config?: WarningConfiguration) {
        this.config = { ...DEFAULT_WARNING_CONFIG, ...config };
    }

    /**
     * Emit a warning by code
     */
    emit(code: string, context?: string, expression?: string): void {
        if (!this.config.enabled) return;

        const metadata = WARNING_CODES[code];
        if (!metadata) {
            // Unknown warning code - still emit but with minimal info
            this.addWarning({
                code,
                message: `Unknown warning: ${code}`,
                severity: 'warning',
                category: 'compatibility',
                context,
                expression,
            });
            return;
        }

        // Check if this code should be suppressed
        if (this.config.suppressCodes.includes(code)) return;

        // Check if this category should be suppressed
        if (this.config.suppressCategories.includes(metadata.category)) return;

        // Check severity threshold
        if (SEVERITY_LEVELS[metadata.severity] < SEVERITY_LEVELS[this.config.minSeverity]) {
            return;
        }

        // Check emitOnce
        if (this.config.emitOnce && this.emittedCodes.has(code)) return;

        // Check max warnings
        if (this.warnings.length >= this.config.maxWarnings) return;

        const warning: XPathWarning = {
            code: metadata.code,
            message: metadata.description,
            severity: metadata.severity,
            category: metadata.category,
            context,
            expression,
        };

        this.addWarning(warning);
        this.emittedCodes.add(code);
    }

    /**
     * Emit a custom warning
     */
    emitCustom(warning: XPathWarning): void {
        if (!this.config.enabled) return;
        if (this.warnings.length >= this.config.maxWarnings) return;
        if (this.config.emitOnce && this.emittedCodes.has(warning.code)) return;

        this.addWarning(warning);
        this.emittedCodes.add(warning.code);
    }

    private addWarning(warning: XPathWarning): void {
        this.warnings.push(warning);

        // Call custom handler
        if (this.config.handler) {
            this.config.handler(warning);
        }

        // Log to console if enabled
        if (this.config.logToConsole) {
            const prefix = warning.severity === 'deprecation' ? '[DEPRECATED]' :
                warning.severity === 'warning' ? '[WARNING]' : '[INFO]';
            // eslint-disable-next-line no-console
            console.warn(`${prefix} ${warning.code}: ${warning.message}`);
        }
    }

    /**
     * Get all collected warnings
     */
    getWarnings(): readonly XPathWarning[] {
        return this.warnings;
    }

    /**
     * Get warnings filtered by severity
     */
    getWarningsBySeverity(severity: WarningSeverity): XPathWarning[] {
        return this.warnings.filter(w => w.severity === severity);
    }

    /**
     * Get warnings filtered by category
     */
    getWarningsByCategory(category: WarningCategory): XPathWarning[] {
        return this.warnings.filter(w => w.category === category);
    }

    /**
     * Check if any warnings were collected
     */
    hasWarnings(): boolean {
        return this.warnings.length > 0;
    }

    /**
     * Get count of warnings
     */
    count(): number {
        return this.warnings.length;
    }

    /**
     * Clear all collected warnings
     */
    clear(): void {
        this.warnings = [];
        this.emittedCodes.clear();
    }

    /**
     * Format warnings as a report string
     */
    formatReport(): string {
        if (this.warnings.length === 0) {
            return 'No warnings.';
        }

        const lines: string[] = [];
        lines.push(`XPath Warnings Report (${this.warnings.length} warning${this.warnings.length === 1 ? '' : 's'}):`);
        lines.push('');

        // Group by category
        const byCategory: Record<string, XPathWarning[]> = {};
        for (const warning of this.warnings) {
            const category = warning.category;
            if (!byCategory[category]) {
                byCategory[category] = [];
            }
            byCategory[category].push(warning);
        }

        for (const category of Object.keys(byCategory)) {
            const warnings = byCategory[category];
            lines.push(`## ${formatCategoryName(category as WarningCategory)}`);
            for (const warning of warnings) {
                const metadata = WARNING_CODES[warning.code];
                lines.push(`  ${warning.code}: ${metadata?.title || warning.message}`);
                if (warning.context) {
                    lines.push(`    Context: ${warning.context}`);
                }
                if (metadata?.migration) {
                    lines.push(`    Migration: ${metadata.migration}`);
                }
            }
            lines.push('');
        }

        return lines.join('\n');
    }
}

/**
 * Format category name for display
 */
function formatCategoryName(category: WarningCategory): string {
    switch (category) {
        case 'deprecation':
            return 'Deprecated Features';
        case 'compatibility':
            return 'Compatibility Issues';
        case 'performance':
            return 'Performance Considerations';
        case 'type-coercion':
            return 'Type Coercion';
        case 'behavior-change':
            return 'Behavior Changes';
        default:
            return category;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get warning metadata by code
 */
export function getWarningMetadata(code: string): WarningCodeMetadata | undefined {
    return WARNING_CODES[code];
}

/**
 * Create a warning collector with default configuration
 */
export function createWarningCollector(config?: WarningConfiguration): WarningCollector {
    return new WarningCollector(config);
}

/**
 * Create a no-op warning collector (for when warnings are disabled)
 */
export function createNoOpWarningCollector(): WarningCollector {
    return new WarningCollector({ enabled: false });
}

/**
 * Check if a code is a valid warning code
 */
export function isValidWarningCode(code: string): boolean {
    return code in WARNING_CODES;
}

/**
 * Get all warning codes
 */
export function getAllWarningCodes(): string[] {
    return Object.keys(WARNING_CODES);
}

/**
 * Get warning codes by category
 */
export function getWarningCodesByCategory(category: WarningCategory): string[] {
    return Object.entries(WARNING_CODES)
        .filter(([, meta]) => meta.category === category)
        .map(([code]) => code);
}

/**
 * Get warning codes by severity
 */
export function getWarningCodesBySeverity(severity: WarningSeverity): string[] {
    return Object.entries(WARNING_CODES)
        .filter(([, meta]) => meta.severity === severity)
        .map(([code]) => code);
}

/**
 * Format a single warning for display
 */
export function formatWarning(warning: XPathWarning): string {
    const metadata = WARNING_CODES[warning.code];
    let result = `${warning.code}: ${metadata?.title || 'Unknown warning'}`;

    if (warning.context) {
        result += ` (${warning.context})`;
    }

    result += '\n  ' + warning.message;

    if (metadata?.migration) {
        result += '\n  Migration: ' + metadata.migration;
    }

    return result;
}

/**
 * Format warning code description
 */
export function formatWarningCodeDescription(code: string): string {
    const meta = getWarningMetadata(code);
    if (!meta) {
        return `Unknown warning: ${code}`;
    }
    return `${code}: ${meta.title} - ${meta.description}`;
}
