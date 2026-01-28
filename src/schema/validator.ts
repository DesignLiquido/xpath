/**
 * XPath Schema Validator
 *
 * Validates XML nodes and values against imported schemas
 * Implements XPath 2.0 schema-aware processing
 */

import { XPathNode } from '../types/index';

/**
 * Schema type definition
 */
export interface SchemaType {
    name: string;
    namespace?: string;
    baseType?: string;
    restriction?: {
        enumeration?: string[];
        minInclusive?: string | number;
        maxInclusive?: string | number;
        minExclusive?: string | number;
        maxExclusive?: string | number;
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        fractionDigits?: number;
    };
    extension?: {
        baseType: string;
        attributes?: Record<string, SchemaType>;
        elements?: Record<string, SchemaType>;
    };
}

/**
 * Element declaration from schema
 */
export interface ElementDeclaration {
    name: string;
    namespace?: string;
    type: SchemaType;
    minOccurs?: number;
    maxOccurs?: number;
    nillable?: boolean;
    substitutionGroup?: string;
}

/**
 * Attribute declaration from schema
 */
export interface AttributeDeclaration {
    name: string;
    namespace?: string;
    type: SchemaType;
    required?: boolean;
    default?: string;
}

/**
 * Complex type definition
 */
export interface ComplexType extends SchemaType {
    attributes: Map<string, AttributeDeclaration>;
    elements: Map<string, ElementDeclaration>;
    mixed?: boolean;
    content?: 'empty' | 'simple' | 'complex';
}

/**
 * Schema structure
 */
export interface Schema {
    targetNamespace?: string;
    elementDeclarations: Map<string, ElementDeclaration>;
    attributeDeclarations: Map<string, AttributeDeclaration>;
    types: Map<string, SchemaType>;
    complexTypes: Map<string, ComplexType>;
}

/**
 * Validation error
 */
export class SchemaValidationError extends Error {
    constructor(
        message: string,
        public code: string = 'XPST0051',
        public node?: XPathNode
    ) {
        super(message);
        this.name = 'SchemaValidationError';
    }
}

/**
 * Schema Validator
 *
 * Validates XML nodes and values against imported schemas
 */
export class SchemaValidator {
    private schemas: Map<string, Schema> = new Map();
    private globalTypes: Map<string, SchemaType> = new Map();
    private elementDeclarations: Map<string, ElementDeclaration> = new Map();
    private attributeDeclarations: Map<string, AttributeDeclaration> = new Map();

    /**
     * Register a schema
     */
    registerSchema(schema: Schema): void {
        const namespace = schema.targetNamespace || '';
        this.schemas.set(namespace, schema);

        // Register types, elements, attributes from schema
        const typesArray = Array.from(schema.types || []);
        for (const [name, type] of typesArray) {
            this.globalTypes.set(this.makeQName(namespace, name), type);
        }

        const elementsArray = Array.from(schema.elementDeclarations || []);
        for (const [name, decl] of elementsArray) {
            this.elementDeclarations.set(this.makeQName(namespace, name), decl);
        }

        const attributesArray = Array.from(schema.attributeDeclarations || []);
        for (const [name, decl] of attributesArray) {
            this.attributeDeclarations.set(this.makeQName(namespace, name), decl);
        }
    }

    /**
     * Get schema for namespace
     */
    getSchema(namespace?: string): Schema | undefined {
        return this.schemas.get(namespace || '');
    }

    /**
     * Get type by QName
     */
    getType(qname: string): SchemaType | undefined {
        return this.globalTypes.get(qname);
    }

    /**
     * Get element declaration by QName
     */
    getElementDeclaration(qname: string): ElementDeclaration | undefined {
        return this.elementDeclarations.get(qname);
    }

    /**
     * Get attribute declaration by QName
     */
    getAttributeDeclaration(qname: string): AttributeDeclaration | undefined {
        return this.attributeDeclarations.get(qname);
    }

    /**
     * Validate value against type
     */
    validateValue(value: any, type: SchemaType | string): boolean {
        // Handle type name string
        if (typeof type === 'string') {
            const schemaType = this.getType(type);
            if (!schemaType) {
                return false;
            }
            type = schemaType;
        }

        if (!type.restriction && !type.extension) {
            // No restrictions, value is valid
            return true;
        }

        const restriction = type.restriction as any;
        if (!restriction) return true;

        // Check enumeration
        if (restriction.enumeration && !restriction.enumeration.includes(String(value))) {
            return false;
        }

        // Check numeric constraints
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            if (
                restriction.minInclusive !== undefined &&
                numValue < Number(restriction.minInclusive)
            ) {
                return false;
            }
            if (
                restriction.maxInclusive !== undefined &&
                numValue > Number(restriction.maxInclusive)
            ) {
                return false;
            }
            if (
                restriction.minExclusive !== undefined &&
                numValue <= Number(restriction.minExclusive)
            ) {
                return false;
            }
            if (
                restriction.maxExclusive !== undefined &&
                numValue >= Number(restriction.maxExclusive)
            ) {
                return false;
            }
        }

        // Check string constraints
        const strValue = String(value);
        if (restriction.minLength !== undefined && strValue.length < restriction.minLength) {
            return false;
        }
        if (restriction.maxLength !== undefined && strValue.length > restriction.maxLength) {
            return false;
        }

        // Check pattern
        if (restriction.pattern) {
            const pattern = new RegExp(restriction.pattern);
            if (!pattern.test(strValue)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate element against schema
     */
    validateElement(element: XPathNode, declaration?: ElementDeclaration | string): boolean {
        // Handle type name string
        if (typeof declaration === 'string') {
            const typeNameString = declaration;
            const schemaType = this.getType(typeNameString);
            if (!schemaType) {
                return false;
            }
            // Create a synthetic element declaration
            declaration = {
                name: element.localName || element.nodeName || '',
                type: schemaType,
                namespace: (element as any).namespaceURI || (element as any).namespace,
                nillable: false,
                required: true,
            } as ElementDeclaration;
        }

        if (!declaration) {
            // Try to find declaration from schema
            const namespace = this.getNamespace(element);
            const localName = this.getLocalName(element);
            declaration = this.getElementDeclaration(this.makeQName(namespace, localName));
        }

        if (!declaration) {
            // No schema declaration found
            return true;
        }

        // Check element type
        if (!this.validateNodeAgainstType(element, declaration.type)) {
            return false;
        }

        // Check nillable
        if (!declaration.nillable && this.isNil(element)) {
            return false;
        }

        return true;
    }

    /**
     * Validate attribute against schema
     */
    validateAttribute(attr: XPathNode, declaration?: AttributeDeclaration | string, typeString?: string): boolean {
        // Handle type name string parameters
        if (typeof declaration === 'string' && typeString) {
            const schemaType = this.getType(typeString);
            if (!schemaType) {
                return false;
            }
            const value = attr.value || (attr as any).nodeValue || '';
            return this.validateValue(value, schemaType);
        }

        if (!declaration) {
            const namespace = this.getNamespace(attr);
            const localName = this.getLocalName(attr);
            declaration = this.getAttributeDeclaration(
                this.makeQName(namespace, localName)
            );
        }

        if (!declaration) {
            return true;
        }

        const value = attr.value || (attr as any).nodeValue || '';
        return this.validateValue(value, (declaration as AttributeDeclaration).type);
    }

    /**
     * Validate node against type
     */
    private validateNodeAgainstType(node: XPathNode, type: SchemaType): boolean {
        const contentType = (type as any).content;

        if (contentType === 'empty') {
            // Element must have no content
            if (node.childNodes && node.childNodes.length > 0) {
                return false;
            }
        } else if (contentType === 'simple') {
            // Element content must be simple (text only)
            const textContent = this.getTextContent(node);
            return this.validateValue(textContent, type);
        } else if (contentType === 'complex') {
            // Complex content - validate children according to schema
            return this.validateComplexContent(node, type as ComplexType);
        }

        return true;
    }

    /**
     * Validate complex content
     */
    validateComplexContent(node: XPathNode, type: ComplexType | string): boolean {
        // Handle type name string
        if (typeof type === 'string') {
            const schemaType = this.getType(type);
            if (!schemaType) {
                return false;
            }
            type = schemaType as ComplexType;
        }

        if (!type.elements) {
            return true;
        }

        // Get child elements
        const childElements = this.getChildElements(node);

        // Validate child elements against schema
        for (const child of childElements) {
            const namespace = this.getNamespace(child);
            const localName = this.getLocalName(child);
            const qname = this.makeQName(namespace, localName);

            const elementDecl = type.elements.get(localName);
            if (elementDecl && !this.validateElement(child, elementDecl)) {
                return false;
            }
        }

        // Validate attributes
        const attrs = this.getAttributes(node);
        for (const attr of attrs) {
            const localName = this.getLocalName(attr);
            const attrDecl = type.attributes && type.attributes.get(localName);
            if (attrDecl && !this.validateAttribute(attr, attrDecl)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get namespace of node
     */
    private getNamespace(node: XPathNode): string {
        const namespaceURI = (node as any).namespaceURI || (node as any).namespace;
        return namespaceURI || '';
    }

    /**
     * Get local name of node
     */
    private getLocalName(node: XPathNode): string {
        if (node.localName) {
            return node.localName;
        }
        const name = (node as any).name || node.nodeName || '';
        const colonIndex = name.indexOf(':');
        return colonIndex >= 0 ? name.substring(colonIndex + 1) : name;
    }

    /**
     * Make QName
     */
    private makeQName(namespace: string, localName: string): string {
        return namespace ? `{${namespace}}${localName}` : localName;
    }

    /**
     * Get text content of node
     */
    private getTextContent(node: XPathNode): string {
        if (node.textContent) {
            return node.textContent;
        }
        if ((node as any).nodeValue) {
            return (node as any).nodeValue;
        }

        // Collect text from child text nodes
        if (node.childNodes) {
            return node.childNodes
                .filter((child) => child.nodeType === 'text' || child.nodeType === '3')
                .map((child) => child.value || (child as any).nodeValue || '')
                .join('');
        }

        return '';
    }

    /**
     * Get child elements
     */
    private getChildElements(node: XPathNode): XPathNode[] {
        if (!node.childNodes) {
            return [];
        }
        return node.childNodes.filter((child) => child.nodeType === 'element' || child.nodeType === '1');
    }

    /**
     * Get attributes
     */
    private getAttributes(node: XPathNode): XPathNode[] {
        if ((node.nodeType === 'element' || node.nodeType === '1') && node.attributes) {
            return Object.entries(node.attributes).map(([name, value]) => ({
                nodeType: 'attribute',
                nodeName: name,
                value,
            } as any));
        }
        return [];
    }

    /**
     * Check if node is nilled
     */
    private isNil(node: XPathNode): boolean {
        if (!node.attributes) {
            return false;
        }
        const nilAttr = Object.entries(node.attributes).find(
            ([name]) => name.endsWith('}nil') || name === 'xsi:nil' || name === 'nil'
        );
        if (!nilAttr) {
            return false;
        }
        const nilValue = nilAttr[1];
        return String(nilValue).toLowerCase() === 'true';
    }
}

/**
 * Create a basic schema from parsed XSD
 */
export function createSchemaFromXSD(xsdContent: string, targetNamespace?: string): Schema {
    // Simple XSD parser - creates basic schema structure
    // In production, this would use a full XSD parser
    const schema: Schema = {
        targetNamespace,
        elementDeclarations: new Map(),
        attributeDeclarations: new Map(),
        types: new Map(),
        complexTypes: new Map(),
    };

    // Parse element declarations
    const elementRegex = /<xs:element\s+name="([^"]+)"[^>]*type="([^"]+)"[^>]*>/g;
    let match;
    while ((match = elementRegex.exec(xsdContent)) !== null) {
        const [, name, typeName] = match;
        schema.elementDeclarations.set(name, {
            name,
            namespace: targetNamespace,
            type: {
                name: typeName,
                namespace: targetNamespace,
            },
        });
    }

    // Parse attribute declarations
    const attrRegex = /<xs:attribute\s+name="([^"]+)"[^>]*type="([^"]+)"[^>]*>/g;
    while ((match = attrRegex.exec(xsdContent)) !== null) {
        const [, name, typeName] = match;
        schema.attributeDeclarations.set(name, {
            name,
            namespace: targetNamespace,
            type: {
                name: typeName,
                namespace: targetNamespace,
            },
        });
    }

    return schema;
}
