import { createStaticContext } from '../src/static-context';
import {
    importSchema,
    applySchemaToStaticContext,
    createEmptyRegistry,
} from '../src/schema/import';
import { setNodeTypeAnnotation, getNodeTypeAnnotation } from '../src/schema/annotations';
import { XPathNode } from '../src/node';

describe('Schema Import (Phase 10.2)', () => {
    test('import from object and apply to static context', () => {
        const registry = importSchema({
            targetNamespace: 'http://example.com/ns',
            types: {
                '{http://www.w3.org/2001/XMLSchema}string': 'xs:string',
            },
            elements: {
                book: '{http://www.w3.org/2001/XMLSchema}string',
            },
            attributes: {
                isbn: '{http://www.w3.org/2001/XMLSchema}string',
            },
        });

        const ctx = createStaticContext();
        applySchemaToStaticContext(ctx, registry);

        expect(ctx.defaultTypeNamespace).toBe('http://example.com/ns');
        expect(ctx.elementDeclarations['book']).toBe('{http://www.w3.org/2001/XMLSchema}string');
        expect(ctx.attributeDeclarations['isbn']).toBe('{http://www.w3.org/2001/XMLSchema}string');
    });

    test('import minimal XSD string with targetNamespace and declarations', () => {
        const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="http://example.com/ns">
        <xs:element name="title" type="xs:string"/>
        <xs:attribute name="lang" type="xs:string"/>
      </xs:schema>
    `;
        const registry = importSchema(xsd);
        expect(registry.targetNamespace).toBe('http://example.com/ns');
        expect(registry.elements['title']).toBe('xs:string');
        expect(registry.attributes['lang']).toBe('xs:string');
    });

    test('node type annotations via WeakMap', () => {
        const node: XPathNode = {
            nodeType: 1,
            nodeName: 'book',
            localName: 'book',
        } as any;
        expect(getNodeTypeAnnotation(node)).toBeUndefined();
        setNodeTypeAnnotation(node, '{http://www.w3.org/2001/XMLSchema}string');
        expect(getNodeTypeAnnotation(node)).toBe('{http://www.w3.org/2001/XMLSchema}string');
    });
});
