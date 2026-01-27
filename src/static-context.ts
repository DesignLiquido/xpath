/**
 * XPath 2.0 Static Context (Section 2.1.1)
 *
 * Captures compile-time information such as in-scope schema types, function
 * signatures, collations, and variable types. This is separate from the
 * dynamic XPathContext used during evaluation.
 */

import { SequenceType } from './types/sequence-type';
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

export interface SchemaTypeMap extends Record<string, string> {}
export interface SchemaElementMap extends Record<string, string> {}
export interface SchemaAttributeMap extends Record<string, string> {}
export interface FunctionSignatureMap extends Record<string, FunctionSignature> {}
export interface VariableTypeMap extends Record<string, SequenceType> {}

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
