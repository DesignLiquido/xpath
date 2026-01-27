import { XPathStaticContext } from '../static-context';

export interface SchemaRegistry {
    targetNamespace?: string;
    types: Record<string, string>;
    elements: Record<string, string>;
    attributes: Record<string, string>;
}

export function createEmptyRegistry(): SchemaRegistry {
    return { types: {}, elements: {}, attributes: {} };
}

export type SchemaInput = string | Partial<SchemaRegistry>;

// Minimal XSD parsing: extract targetNamespace, element/attribute declarations with name/type
function parseXsd(xsd: string): SchemaRegistry {
    const registry = createEmptyRegistry();
    const tnMatch = xsd.match(/targetNamespace\s*=\s*"([^"]+)"/i);
    if (tnMatch) registry.targetNamespace = tnMatch[1];

    const elementRegex =
        /<\w*:?element[^>]*name\s*=\s*"([^"]+)"[^>]*type\s*=\s*"([^"]+)"[^>]*\/>/gi;
    const attributeRegex =
        /<\w*:?attribute[^>]*name\s*=\s*"([^"]+)"[^>]*type\s*=\s*"([^"]+)"[^>]*\/>/gi;
    let m: RegExpExecArray | null;
    while ((m = elementRegex.exec(xsd)) !== null) {
        const [_, name, type] = m;
        registry.elements[name] = type;
    }
    while ((m = attributeRegex.exec(xsd)) !== null) {
        const [_, name, type] = m;
        registry.attributes[name] = type;
    }
    return registry;
}

export function importSchema(input: SchemaInput): SchemaRegistry {
    if (typeof input === 'string') {
        return parseXsd(input);
    }
    const reg = createEmptyRegistry();
    if (input.targetNamespace) reg.targetNamespace = input.targetNamespace;
    Object.assign(reg.types, input.types ?? {});
    Object.assign(reg.elements, input.elements ?? {});
    Object.assign(reg.attributes, input.attributes ?? {});
    return reg;
}

export function applySchemaToStaticContext(
    context: XPathStaticContext,
    registry: SchemaRegistry
): void {
    if (registry.targetNamespace) {
        context.defaultTypeNamespace = registry.targetNamespace;
    }
    Object.assign(context.schemaTypes, registry.types);
    Object.assign(context.elementDeclarations, registry.elements);
    Object.assign(context.attributeDeclarations, registry.attributes);
}
