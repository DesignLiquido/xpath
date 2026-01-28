/**
 * Schema-Aware Type System
 *
 * Type annotations and checking that consider schema information
 * Implements XPath 2.0 schema-aware processing
 */

import { SchemaType, ElementDeclaration, AttributeDeclaration } from '../schema/validator';
import { XPathNode } from './index';
import { getPSVI, getSchemaType, getTypedValue } from '../schema/psvi';

/**
 * Schema-aware type representation
 */
export interface SchemaAwareType {
    // Base type information
    name: string;
    namespace?: string;

    // Type hierarchy
    baseType?: SchemaAwareType;
    derivedTypes?: SchemaAwareType[];

    // Type properties
    isAtomic: boolean;
    isUnion: boolean;
    isList: boolean;
    isBuiltIn: boolean;

    // Restriction facets
    enumeration?: string[];
    minInclusive?: number | string;
    maxInclusive?: number | string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;

    // Element/attribute declarations
    elementDeclarations?: Map<string, ElementDeclaration>;
    attributeDeclarations?: Map<string, AttributeDeclaration>;
}

/**
 * Schema-aware type information for expression result
 */
export interface SchemaAwareTypeInfo {
    type: SchemaAwareType;
    occurrence: 'one' | 'zero_or_one' | 'zero_or_more' | 'one_or_more';
    isNilled: boolean;
}

/**
 * Map of built-in types
 */
const BUILTIN_TYPES: Map<string, SchemaAwareType> = new Map([
    [
        'string',
        {
            name: 'string',
            namespace: 'http://www.w3.org/2001/XMLSchema',
            isAtomic: true,
            isUnion: false,
            isList: false,
            isBuiltIn: true,
        },
    ],
    [
        'integer',
        {
            name: 'integer',
            namespace: 'http://www.w3.org/2001/XMLSchema',
            isAtomic: true,
            isUnion: false,
            isList: false,
            isBuiltIn: true,
        },
    ],
    [
        'decimal',
        {
            name: 'decimal',
            namespace: 'http://www.w3.org/2001/XMLSchema',
            isAtomic: true,
            isUnion: false,
            isList: false,
            isBuiltIn: true,
        },
    ],
    [
        'boolean',
        {
            name: 'boolean',
            namespace: 'http://www.w3.org/2001/XMLSchema',
            isAtomic: true,
            isUnion: false,
            isList: false,
            isBuiltIn: true,
        },
    ],
    [
        'date',
        {
            name: 'date',
            namespace: 'http://www.w3.org/2001/XMLSchema',
            isAtomic: true,
            isUnion: false,
            isList: false,
            isBuiltIn: true,
        },
    ],
    [
        'dateTime',
        {
            name: 'dateTime',
            namespace: 'http://www.w3.org/2001/XMLSchema',
            isAtomic: true,
            isUnion: false,
            isList: false,
            isBuiltIn: true,
        },
    ],
]);

/**
 * Get schema-aware type for a value
 */
export function getSchemaAwareType(value: any): SchemaAwareType | null {
    // If value is a schema-validated node, get its type
    if (value && typeof value === 'object' && 'nodeType' in value) {
        const node = value as XPathNode;
        const schemaType = getSchemaType(node);
        if (schemaType) {
            return schemaTypeToSchemaAwareType(schemaType);
        }
    }

    // Otherwise infer from value
    if (typeof value === 'string') {
        return BUILTIN_TYPES.get('string') || null;
    }
    if (typeof value === 'number') {
        return Number.isInteger(value)
            ? BUILTIN_TYPES.get('integer') || null
            : BUILTIN_TYPES.get('decimal') || null;
    }
    if (typeof value === 'boolean') {
        return BUILTIN_TYPES.get('boolean') || null;
    }
    if (value instanceof Date) {
        return BUILTIN_TYPES.get('dateTime') || null;
    }

    return null;
}

/**
 * Convert schema type to schema-aware type
 */
function schemaTypeToSchemaAwareType(schemaType: SchemaType): SchemaAwareType {
    return {
        name: schemaType.name,
        namespace: schemaType.namespace,
        isAtomic: !schemaType.extension,
        isUnion: false,
        isList: false,
        isBuiltIn: false,
        enumeration: schemaType.restriction?.enumeration,
        minInclusive: schemaType.restriction?.minInclusive,
        maxInclusive: schemaType.restriction?.maxInclusive,
        pattern: schemaType.restriction?.pattern,
        minLength: schemaType.restriction?.minLength,
        maxLength: schemaType.restriction?.maxLength,
    };
}

/**
 * Check type compatibility
 */
export function isTypeCompatible(
    valueType: SchemaAwareType | null,
    expectedType: SchemaAwareType
): boolean {
    if (!valueType) {
        return false;
    }

    // Same type
    if (valueType.name === expectedType.name && valueType.namespace === expectedType.namespace) {
        return true;
    }

    // Check base types
    let current = valueType.baseType;
    while (current) {
        if (current.name === expectedType.name && current.namespace === expectedType.namespace) {
            return true;
        }
        current = current.baseType;
    }

    // Type promotion rules
    if (isNumericType(valueType) && isNumericType(expectedType)) {
        return true;
    }

    return false;
}

/**
 * Check if type is numeric
 */
function isNumericType(type: SchemaAwareType): boolean {
    const numericTypes = ['decimal', 'integer', 'float', 'double', 'long', 'int', 'short'];
    return numericTypes.includes(type.name);
}

/**
 * Validate value against schema-aware type
 */
export function validateValueAgainstType(value: any, type: SchemaAwareType): boolean {
    // Check enumeration
    if (type.enumeration && !type.enumeration.includes(String(value))) {
        return false;
    }

    // Check numeric constraints
    if (type.minInclusive !== undefined && Number(value) < Number(type.minInclusive)) {
        return false;
    }
    if (type.maxInclusive !== undefined && Number(value) > Number(type.maxInclusive)) {
        return false;
    }

    // Check string constraints
    const strValue = String(value);
    if (type.minLength !== undefined && strValue.length < type.minLength) {
        return false;
    }
    if (type.maxLength !== undefined && strValue.length > type.maxLength) {
        return false;
    }

    // Check pattern
    if (type.pattern) {
        const pattern = new RegExp(type.pattern);
        if (!pattern.test(strValue)) {
            return false;
        }
    }

    return true;
}

/**
 * Get typed value of node
 */
export function getNodeTypedValue(node: XPathNode): any {
    const psvi = getPSVI(node);
    if (psvi?.typedValue !== undefined) {
        return psvi.typedValue;
    }

    // Get default typed value based on schema type
    const schemaType = getSchemaType(node);
    if (schemaType) {
        const stringValue = getNodeStringValue(node);

        // Convert to appropriate type
        if (schemaType.name === 'boolean') {
            return stringValue.toLowerCase() === 'true';
        }
        if (schemaType.name === 'integer') {
            return parseInt(stringValue, 10);
        }
        if (schemaType.name === 'decimal' || schemaType.name === 'float' || schemaType.name === 'double') {
            return parseFloat(stringValue);
        }
    }

    return getTypedValue(node);
}

/**
 * Get string value of node
 */
function getNodeStringValue(node: XPathNode): string {
    if (node.nodeType === 'text' || node.nodeType === '3') {
        return node.value || (node as any).nodeValue || '';
    }
    if ((node.nodeType === 'element' || node.nodeType === '1') && node.childNodes) {
        return node.childNodes
            .map((child) => getNodeStringValue(child))
            .join('');
    }
    return '';
}

/**
 * Create union type
 */
export function createUnionType(memberTypes: SchemaAwareType[]): SchemaAwareType {
    return {
        name: 'union',
        isAtomic: false,
        isUnion: true,
        isList: false,
        isBuiltIn: false,
    };
}

/**
 * Create list type
 */
export function createListType(itemType: SchemaAwareType): SchemaAwareType {
    return {
        name: `list_of_${itemType.name}`,
        isAtomic: false,
        isUnion: false,
        isList: true,
        isBuiltIn: false,
    };
}

/**
 * Get built-in type by name
 */
export function getBuiltInType(name: string): SchemaAwareType | null {
    return BUILTIN_TYPES.get(name) || null;
}

/**
 * Register custom type
 */
export function registerType(type: SchemaAwareType): void {
    const key = type.namespace ? `{${type.namespace}}${type.name}` : type.name;
    // Store in custom types (would be a separate map in production)
}
