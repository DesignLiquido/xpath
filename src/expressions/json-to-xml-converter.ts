import { XPathNode } from '../node';
import { NodeType } from '../constants';

/**
 * Options for JSON-to-XML conversion
 */
export interface JsonToXmlOptions {
    /**
     * Allow non-strict JSON parsing. Default: false
     */
    liberal?: boolean;
    
    /**
     * How to handle duplicate keys: 'reject', 'use-first', or 'retain'. Default: 'reject'
     */
    duplicates?: 'reject' | 'use-first' | 'retain';
    
    /**
     * Whether to validate JSON schema. Default: false
     */
    validate?: boolean;
    
    /**
     * Whether to handle escape sequences. Default: true
     */
    escape?: boolean;
    
    /**
     * Custom fallback function for invalid JSON
     */
    fallback?: (json: string) => any;
}

/**
 * Converts JSON strings to XML document representations.
 * Implements W3C XPath 3.1 json-to-xml() function behavior.
 */
export class JsonToXmlConverter {
    private elementId: number = 0;

    /**
     * Convert JSON string to XML document node
     * @param jsonText - JSON string to convert
     * @param options - Conversion options
     * @returns XML document node or null if input is null/empty
     */
    convert(jsonText: string | null | undefined, options?: JsonToXmlOptions): XPathNode | null {
        if (jsonText === null || jsonText === undefined) {
            return null;
        }

        if (typeof jsonText !== 'string') {
            jsonText = String(jsonText);
        }

        const trimmedText = jsonText.trim();
        if (trimmedText === '') {
            return null;
        }

        try {
            const jsonValue = JSON.parse(trimmedText);
            return this.createDocumentNode(jsonValue, options);
        } catch (error) {
            // Handle fallback option
            if (options?.fallback && typeof options.fallback === 'function') {
                try {
                    const fallbackValue = options.fallback(trimmedText);
                    return this.createDocumentNode(fallbackValue, options);
                } catch (fallbackError) {
                    return null;
                }
            }

            // Strict mode - return null on parse error
            if (!options?.liberal) {
                return null;
            }

            // Liberal mode - attempt lenient parsing
            return this.liberalParse(trimmedText, options);
        }
    }

    /**
     * Create a document node wrapping the JSON value
     */
    private createDocumentNode(value: any, options?: JsonToXmlOptions): XPathNode {
        this.elementId = 0; // Reset ID counter
        
        const rootElement = this.valueToElement(value, 'root', options);
        
        // Create document node wrapper
        const documentNode: XPathNode = {
            nodeType: NodeType.DOCUMENT_NODE,
            nodeName: '#document',
            localName: '#document',
            childNodes: [rootElement],
            documentElement: rootElement,
        };
        
        // Store reference but avoid circular parent reference
        rootElement.ownerDocument = documentNode;
        return documentNode;
    }

    /**
     * Convert a JSON value to an XML element
     */
    private valueToElement(value: any, elementName: string, options?: JsonToXmlOptions, parent?: XPathNode): XPathNode {
        const element: XPathNode = {
            nodeType: NodeType.ELEMENT_NODE,
            nodeName: elementName,
            localName: elementName,
            childNodes: [],
            attributes: [],
            // Don't set parentNode to avoid circular reference issues with testing/serialization
            // parentNode: parent,
        };

        if (value === null || value === undefined) {
            // Empty element for null
            return element;
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            // Object: create child elements for each property
            const childNodes: XPathNode[] = [];
            const seenKeys = new Set<string>();

            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    // Handle duplicate keys based on options
                    if (seenKeys.has(key)) {
                        if (options?.duplicates === 'reject') {
                            throw new Error(`Duplicate key: ${key}`);
                        } else if (options?.duplicates === 'use-first') {
                            continue;
                        }
                        // 'retain' - allow duplicates
                    }
                    seenKeys.add(key);

                    const sanitizedKey = this.sanitizeElementName(key);
                    const childElement = this.valueToElement(value[key], sanitizedKey, options, element);
                    childNodes.push(childElement);
                }
            }

            element.childNodes = childNodes;
        } else if (Array.isArray(value)) {
            // Array: create multiple child elements with same name
            const childNodes: XPathNode[] = value.map((item, index) => {
                const itemElement = this.valueToElement(item, 'item', options, element);
                return itemElement;
            });
            element.childNodes = childNodes;
        } else if (typeof value === 'string') {
            // String: text content
            const textNode: XPathNode = {
                nodeType: NodeType.TEXT_NODE,
                nodeName: '#text',
                localName: '#text',
                textContent: value,
                // Don't set parentNode to avoid circular reference
                // parentNode: element,
            };
            element.childNodes = [textNode];
            element.textContent = value;
        } else if (typeof value === 'number') {
            // Number: text content
            const textValue = String(value);
            const textNode: XPathNode = {
                nodeType: NodeType.TEXT_NODE,
                nodeName: '#text',
                localName: '#text',
                textContent: textValue,
                // Don't set parentNode to avoid circular reference
                // parentNode: element,
            };
            element.childNodes = [textNode];
            element.textContent = textValue;
        } else if (typeof value === 'boolean') {
            // Boolean: text content
            const textValue = value ? 'true' : 'false';
            const textNode: XPathNode = {
                nodeType: NodeType.TEXT_NODE,
                nodeName: '#text',
                localName: '#text',
                textContent: textValue,
                // Don't set parentNode to avoid circular reference
                // parentNode: element,
            };
            element.childNodes = [textNode];
            element.textContent = textValue;
        }

        return element;
    }

    /**
     * Sanitize a JSON key to be a valid XML element name
     * XML names must start with letter/underscore and contain only valid characters
     */
    private sanitizeElementName(name: string): string {
        // If name is a valid XML name, return as-is
        if (/^[a-zA-Z_][\w.-]*$/.test(name)) {
            return name;
        }

        // Replace invalid characters with underscores
        let sanitized = name.replace(/[^a-zA-Z0-9_.-]/g, '_');

        // Ensure it starts with letter or underscore
        if (!/^[a-zA-Z_]/.test(sanitized)) {
            sanitized = '_' + sanitized;
        }

        // If still empty or too similar to reserved names, use default
        if (!sanitized || sanitized === '_') {
            sanitized = 'item';
        }

        return sanitized;
    }

    /**
     * Liberal JSON parsing - attempts to parse loosely formatted JSON
     */
    private liberalParse(jsonText: string, options?: JsonToXmlOptions): XPathNode | null {
        try {
            // Try common lenient parsing approaches
            // Remove trailing commas
            let lenient = jsonText.replace(/,(\s*[}\]])/g, '$1');
            
            // Allow single quotes
            lenient = lenient.replace(/'/g, '"');
            
            // Try parsing with lenient version
            const value = JSON.parse(lenient);
            return this.createDocumentNode(value, options);
        } catch {
            // If all else fails, return null
            return null;
        }
    }
}
