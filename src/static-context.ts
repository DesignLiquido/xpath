/**
 * XPath 2.0 Static Context (Section 2.1.1)
 *
 * Captures compile-time information such as in-scope schema types, function
 * signatures, collations, and variable types. This is separate from the
 * dynamic XPathContext used during evaluation.
 */

import { SequenceType, OccurrenceIndicator } from './types/sequence-type';
import {
    DEFAULT_FUNCTION_NAMESPACE,
    DEFAULT_COLLATION,
    RESERVED_FUNCTION_NAMES,
    XS_NAMESPACE,
} from './constants';

// Re-export constants from unified constants.ts
export { DEFAULT_FUNCTION_NAMESPACE, DEFAULT_COLLATION, RESERVED_FUNCTION_NAMES };

export interface FunctionSignature {
    /** QName (prefix:local or local) of the function. */
    name: string;
    /** Namespace for the function; defaults to DEFAULT_FUNCTION_NAMESPACE. */
    namespace?: string;
    /** Optional argument types for static checking. */
    argumentTypes?: SequenceType[];
    /** Optional return type for static checking. */
    returnType?: SequenceType;
    /** Minimum required arguments. */
    minArgs: number;
    /** Maximum allowed arguments (undefined = unbounded). */
    maxArgs?: number;
}

export interface SchemaTypeMap extends Record<string, string> { }
export interface SchemaElementMap extends Record<string, string> { }
export interface SchemaAttributeMap extends Record<string, string> { }
export interface FunctionSignatureMap extends Record<string, FunctionSignature> { }
export interface VariableTypeMap extends Record<string, SequenceType> { }

export interface XPathStaticContext {
    schemaTypes: SchemaTypeMap;
    elementDeclarations: SchemaElementMap;
    attributeDeclarations: SchemaAttributeMap;
    defaultElementNamespace: string;
    defaultTypeNamespace: string;
    functionSignatures: FunctionSignatureMap;
    defaultFunctionNamespace: string;
    reservedFunctionNames: Set<string>;
    collations: string[];
    defaultCollation: string;
    variableTypes: VariableTypeMap;
    contextItemType?: SequenceType;
}

const toLocalName = (name: string): string => {
    const parts = name.split(':');
    return parts[parts.length - 1];
};

const validateFunctionSignature = (signature: FunctionSignature): string[] => {
    const errors: string[] = [];
    if (signature.minArgs < 0) {
        errors.push(`Function ${signature.name}: minArgs cannot be negative`);
    }
    if (signature.maxArgs !== undefined && signature.maxArgs < signature.minArgs) {
        errors.push(`Function ${signature.name}: maxArgs cannot be less than minArgs`);
    }
    return errors;
};

const ensureDefaultCollationPresent = (
    collations: string[],
    defaultCollation: string
): string[] => {
    const set = new Set(collations);
    if (!set.has(defaultCollation)) {
        collations.push(defaultCollation);
    }
    return Array.from(new Set(collations));
};

export function createStaticContext(overrides?: Partial<XPathStaticContext>): XPathStaticContext {
    const reserved = overrides?.reservedFunctionNames
        ? new Set(overrides.reservedFunctionNames)
        : new Set(RESERVED_FUNCTION_NAMES);

    const defaultCollation = overrides?.defaultCollation ?? DEFAULT_COLLATION;
    const collations = ensureDefaultCollationPresent(
        overrides?.collations ?? [DEFAULT_COLLATION],
        defaultCollation
    );

    return {
        schemaTypes: overrides?.schemaTypes ?? {},
        elementDeclarations: overrides?.elementDeclarations ?? {},
        attributeDeclarations: overrides?.attributeDeclarations ?? {},
        defaultElementNamespace: overrides?.defaultElementNamespace ?? '',
        defaultTypeNamespace: overrides?.defaultTypeNamespace ?? XS_NAMESPACE,
        functionSignatures: overrides?.functionSignatures ?? {},
        defaultFunctionNamespace: overrides?.defaultFunctionNamespace ?? DEFAULT_FUNCTION_NAMESPACE,
        reservedFunctionNames: reserved,
        collations,
        defaultCollation,
        variableTypes: overrides?.variableTypes ?? {},
        contextItemType: overrides?.contextItemType,
    };
}

export function isReservedFunctionName(name: string, context?: XPathStaticContext): boolean {
    const local = toLocalName(name);
    const reserved = context?.reservedFunctionNames ?? new Set(RESERVED_FUNCTION_NAMES);
    return reserved.has(local);
}

export function registerFunctionSignature(
    context: XPathStaticContext,
    signature: FunctionSignature,
    options?: { allowReserved?: boolean }
): void {
    const errors = validateFunctionSignature(signature);
    const allowReserved = options?.allowReserved ?? false;
    if (!allowReserved && isReservedFunctionName(signature.name, context)) {
        errors.push(`Function ${signature.name} is reserved and cannot be overridden`);
    }
    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }

    context.functionSignatures[signature.name] = {
        ...signature,
        namespace: signature.namespace ?? context.defaultFunctionNamespace,
    };
}

export function registerVariableType(
    context: XPathStaticContext,
    name: string,
    type: SequenceType
): void {
    context.variableTypes[name] = type;
}

export function validateStaticContext(context: XPathStaticContext): string[] {
    const errors: string[] = [];

    if (!context.collations.includes(context.defaultCollation)) {
        errors.push(
            `Default collation ${context.defaultCollation} is not in the in-scope collations`
        );
    }

    for (const signature of Object.values(context.functionSignatures)) {
        errors.push(...validateFunctionSignature(signature));
        if (isReservedFunctionName(signature.name, context)) {
            errors.push(`Function ${signature.name} is reserved and cannot be overridden`);
        }
    }

    return errors;
}

/**
 * Static Error Detection for XPath 3.1 (Phase 9.5)
 *
 * Provides compile-time type checking and error detection capabilities
 */

export enum StaticErrorSeverity {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

export interface StaticError {
    severity: StaticErrorSeverity;
    code: string;
    message: string;
    location?: {
        line?: number;
        column?: number;
        offset?: number;
    };
    suggestion?: string;
}

/**
 * Check for type mismatches in function calls
 */
export function checkFunctionCall(
    context: XPathStaticContext,
    functionName: string,
    argTypes: SequenceType[]
): StaticError[] {
    const errors: StaticError[] = [];
    const signature = context.functionSignatures[functionName];

    if (!signature) {
        errors.push({
            severity: StaticErrorSeverity.ERROR,
            code: 'XPST0017',
            message: `Unknown function: ${functionName}`,
            suggestion: `Check if the function name is spelled correctly and is in scope`,
        });
        return errors;
    }

    // Check argument count
    if (argTypes.length < signature.minArgs) {
        errors.push({
            severity: StaticErrorSeverity.ERROR,
            code: 'XPST0017',
            message: `Function ${functionName} requires at least ${signature.minArgs} arguments, got ${argTypes.length}`,
        });
    }

    if (signature.maxArgs !== undefined && argTypes.length > signature.maxArgs) {
        errors.push({
            severity: StaticErrorSeverity.ERROR,
            code: 'XPST0017',
            message: `Function ${functionName} accepts at most ${signature.maxArgs} arguments, got ${argTypes.length}`,
        });
    }

    // Check argument types if available
    if (signature.argumentTypes) {
        for (let i = 0; i < Math.min(argTypes.length, signature.argumentTypes.length); i++) {
            const expectedType = signature.argumentTypes[i];
            const actualType = argTypes[i];

            if (!typesCompatible(actualType, expectedType)) {
                errors.push({
                    severity: StaticErrorSeverity.ERROR,
                    code: 'XPTY0004',
                    message: `Type mismatch in argument ${i + 1} of ${functionName}: expected ${formatSequenceType(expectedType)}, got ${formatSequenceType(actualType)}`,
                    suggestion: `Consider casting the argument to the expected type`,
                });
            }
        }
    }

    return errors;
}

/**
 * Check for undefined variables
 */
export function checkVariableReference(
    context: XPathStaticContext,
    variableName: string
): StaticError[] {
    const errors: StaticError[] = [];

    if (!context.variableTypes[variableName]) {
        errors.push({
            severity: StaticErrorSeverity.ERROR,
            code: 'XPST0008',
            message: `Undefined variable: $${variableName}`,
            suggestion: `Check if the variable is declared in the current scope`,
        });
    }

    return errors;
}

/**
 * Check for type compatibility in assignments or casts
 */
export function checkTypeCast(
    sourceType: SequenceType,
    targetType: SequenceType
): StaticError[] {
    const errors: StaticError[] = [];

    if (!typesCompatible(sourceType, targetType)) {
        // Check if cast might fail at runtime
        errors.push({
            severity: StaticErrorSeverity.WARNING,
            code: 'XPTY0004',
            message: `Potentially unsafe cast from ${formatSequenceType(sourceType)} to ${formatSequenceType(targetType)}`,
            suggestion: `Verify that the cast is valid at runtime`,
        });
    }

    return errors;
}

/**
 * Detect potential division by zero
 */
export function checkDivision(
    dividendType: SequenceType,
    divisorType: SequenceType,
    divisorValue?: any
): StaticError[] {
    const errors: StaticError[] = [];

    // If divisor is a literal zero, this is definitely an error
    if (divisorValue === 0) {
        errors.push({
            severity: StaticErrorSeverity.ERROR,
            code: 'FOAR0001',
            message: `Division by zero`,
        });
    } else if (divisorValue === undefined) {
        // Runtime check needed
        errors.push({
            severity: StaticErrorSeverity.WARNING,
            code: 'FOAR0001',
            message: `Potential division by zero - ensure divisor is non-zero at runtime`,
        });
    }

    return errors;
}

/**
 * Check sequence type compatibility
 */
function typesCompatible(actual: SequenceType, expected: SequenceType): boolean {
    // Simplified compatibility check
    // In a full implementation, this would use the type hierarchy

    // Check cardinality compatibility
    if (!cardinalityCompatible(actual, expected)) {
        return false;
    }

    // Get item types using the getter method
    const expectedItem = expected.getItemType();
    const actualItem = actual.getItemType();

    // item() is compatible with everything
    if (expectedItem !== 'empty' && expectedItem.name === 'item') {
        return true;
    }

    // Check item type compatibility (simplified)
    if (actualItem !== 'empty' && expectedItem !== 'empty' && actualItem.name === expectedItem.name) {
        return true;
    }

    return false;
}

/**
 * Check cardinality compatibility
 */
function cardinalityCompatible(actual: SequenceType, expected: SequenceType): boolean {
    const actualOccurs = actual.getOccurrence();
    const expectedOccurs = expected.getOccurrence();

    // exactly-one matches all
    if (actualOccurs === OccurrenceIndicator.EXACTLY_ONE) {
        return true;
    }

    // zero-or-one matches zero-or-one and zero-or-more
    if (actualOccurs === OccurrenceIndicator.ZERO_OR_ONE) {
        return expectedOccurs === OccurrenceIndicator.ZERO_OR_ONE || expectedOccurs === OccurrenceIndicator.ZERO_OR_MORE;
    }

    // one-or-more matches one-or-more and zero-or-more
    if (actualOccurs === OccurrenceIndicator.ONE_OR_MORE) {
        return expectedOccurs === OccurrenceIndicator.ONE_OR_MORE || expectedOccurs === OccurrenceIndicator.ZERO_OR_MORE;
    }

    // zero-or-more only matches zero-or-more
    if (actualOccurs === OccurrenceIndicator.ZERO_OR_MORE) {
        return expectedOccurs === OccurrenceIndicator.ZERO_OR_MORE;
    }

    return actualOccurs === expectedOccurs;
}

/**
 * Format a SequenceType for display
 */
function formatSequenceType(type: SequenceType): string {
    const itemType = type.getItemType();
    const itemName = itemType === 'empty' ? 'empty-sequence()' : itemType.name;
    const occurs = type.getOccurrence();

    const occursSymbol: Record<string, string> = {
        [OccurrenceIndicator.EXACTLY_ONE]: '',
        [OccurrenceIndicator.ZERO_OR_ONE]: '?',
        [OccurrenceIndicator.ONE_OR_MORE]: '+',
        [OccurrenceIndicator.ZERO_OR_MORE]: '*',
    };

    return `${itemName}${occursSymbol[occurs] || ''}`;
}

/**
 * Collect all static errors for an expression tree
 */
export function analyzeExpression(
    context: XPathStaticContext,
    expression: any
): StaticError[] {
    const errors: StaticError[] = [];

    // Recursively analyze the expression tree
    // This is a placeholder for full static analysis
    if (!expression) {
        return errors;
    }

    if (typeof expression !== 'object') {
        return errors;
    }

    // Check function calls
    if (expression.type === 'function-call') {
        errors.push(...checkFunctionCall(context, expression.name, expression.args || []));
    }

    // Check variable references
    if (expression.type === 'variable') {
        errors.push(...checkVariableReference(context, expression.name));
    }

    // Recursively analyze child expressions
    if (Array.isArray(expression.children)) {
        for (const child of expression.children) {
            errors.push(...analyzeExpression(context, child));
        }
    }

    return errors;
}

/**
 * Format errors for display
 */
export function formatStaticErrors(errors: StaticError[]): string {
    if (errors.length === 0) {
        return 'No static errors found';
    }

    return errors
        .map((error) => {
            const location = error.location
                ? ` at line ${error.location.line}, column ${error.location.column}`
                : '';
            const suggestion = error.suggestion ? `\n  Suggestion: ${error.suggestion}` : '';
            return `[${error.severity.toUpperCase()}] ${error.code}: ${error.message}${location}${suggestion}`;
        })
        .join('\n');
}
