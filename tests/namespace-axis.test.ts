import { XPathLexer } from '../src/lexer';
import { XPath20Parser } from '../src/parser';
import { XPathLocationPath } from '../src/expressions';
import { XPathContext } from '../src/context';

const lexer = new XPathLexer('2.0');

function parse(expression: string, enableNamespaceAxis = false) {
    const parser = new XPath20Parser({ enableNamespaceAxis });
    const tokens = lexer.scan(expression);
    return parser.parse(tokens);
}

function createElementWithNamespaces() {
    const element: any = {
        nodeType: 1,
        nodeName: 'root',
        localName: 'root',
        childNodes: [],
        attributes: [],
        parentNode: null,
        ownerDocument: null,
    };

    const xmlnsDefault = {
        nodeType: 2,
        nodeName: 'xmlns',
        localName: 'xmlns',
        nodeValue: 'urn:default',
        textContent: 'urn:default',
    };
    const xmlnsFoo = {
        nodeType: 2,
        nodeName: 'xmlns:foo',
        localName: 'xmlns:foo',
        nodeValue: 'urn:foo',
        textContent: 'urn:foo',
    };

    element.attributes = [xmlnsFoo, xmlnsDefault];
    return element;
}

describe('Namespace axis (feature-flagged)', () => {
    it('throws XPST0010 when namespace axis is disabled', () => {
        expect(() => parse('namespace::*')).toThrow(/XPST0010/);
    });

    it('parses namespace axis when enabled', () => {
        const ast = parse('namespace::*', true);
        expect(ast).toBeInstanceOf(XPathLocationPath);
    });

    it('evaluates namespace axis and returns namespace nodes', () => {
        const element = createElementWithNamespaces();
        const ast = parse('namespace::*', true) as XPathLocationPath;
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        const prefixes = result.map((n) => n.localName || n.nodeName);
        expect(prefixes).toEqual(expect.arrayContaining(['foo', 'xml']));
    });

    it('filters namespace axis by prefix name test', () => {
        const element = createElementWithNamespaces();
        const ast = parse('namespace::foo', true) as XPathLocationPath;
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        expect(result.length).toBe(1);
        expect(result[0].localName).toBe('foo');
        expect(result[0].namespaceUri || result[0].namespaceURI).toBe('urn:foo');
    });

    it('includes default namespace (xmlns) declaration', () => {
        const element = createElementWithNamespaces();
        const ast = parse('namespace::*', true) as XPathLocationPath;
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        // Should include default namespace with empty string as prefix
        const defaultNs = result.find((n) => n.localName === '' || n.nodeName === '');
        expect(defaultNs).toBeDefined();
        expect(defaultNs.namespaceURI || defaultNs.namespaceUri).toBe('urn:default');
    });

    it('always includes xml namespace prefix', () => {
        const element: any = {
            nodeType: 1,
            nodeName: 'root',
            localName: 'root',
            childNodes: [],
            attributes: [],
            parentNode: null,
            ownerDocument: null,
        };

        const ast = parse('namespace::xml', true) as XPathLocationPath;
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        expect(result.length).toBe(1);
        expect(result[0].localName).toBe('xml');
        expect(result[0].namespaceURI || result[0].namespaceUri).toBe(
            'http://www.w3.org/XML/1998/namespace'
        );
    });

    it('collects in-scope namespaces from ancestor elements', () => {
        // Create nested elements with different namespace declarations
        const grandchild: any = {
            nodeType: 1,
            nodeName: 'grandchild',
            localName: 'grandchild',
            childNodes: [],
            attributes: [
                {
                    nodeName: 'xmlns:baz',
                    localName: 'xmlns:baz',
                    nodeValue: 'urn:baz',
                    textContent: 'urn:baz',
                },
            ],
            ownerDocument: null,
        };

        const child: any = {
            nodeType: 1,
            nodeName: 'child',
            localName: 'child',
            childNodes: [grandchild],
            attributes: [
                {
                    nodeName: 'xmlns:bar',
                    localName: 'xmlns:bar',
                    nodeValue: 'urn:bar',
                    textContent: 'urn:bar',
                },
            ],
            parentNode: null,
            ownerDocument: null,
        };

        const root: any = {
            nodeType: 1,
            nodeName: 'root',
            localName: 'root',
            childNodes: [child],
            attributes: [
                {
                    nodeName: 'xmlns:foo',
                    localName: 'xmlns:foo',
                    nodeValue: 'urn:foo',
                    textContent: 'urn:foo',
                },
            ],
            parentNode: null,
            ownerDocument: null,
        };

        // Set up parent relationships
        child.parentNode = root;
        grandchild.parentNode = child;

        const ast = parse('namespace::*', true) as XPathLocationPath;
        const context: XPathContext = { node: grandchild, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        const prefixes = result.map((n) => n.localName || n.nodeName);
        // Should include all three: baz (self), bar (parent), foo (grandparent), xml (always)
        expect(prefixes).toEqual(expect.arrayContaining(['baz', 'bar', 'foo', 'xml']));
        expect(result.length).toBeGreaterThanOrEqual(4);
    });

    it('handles namespace prefix shadowing correctly', () => {
        // Child redefines a namespace prefix from parent
        const child: any = {
            nodeType: 1,
            nodeName: 'child',
            localName: 'child',
            childNodes: [],
            attributes: [
                {
                    nodeName: 'xmlns:foo',
                    localName: 'xmlns:foo',
                    nodeValue: 'urn:foo-child',
                    textContent: 'urn:foo-child',
                },
            ],
            ownerDocument: null,
        };

        const root: any = {
            nodeType: 1,
            nodeName: 'root',
            localName: 'root',
            childNodes: [child],
            attributes: [
                {
                    nodeName: 'xmlns:foo',
                    localName: 'xmlns:foo',
                    nodeValue: 'urn:foo-parent',
                    textContent: 'urn:foo-parent',
                },
            ],
            parentNode: null,
            ownerDocument: null,
        };

        child.parentNode = root;

        const ast = parse('namespace::foo', true) as XPathLocationPath;
        const context: XPathContext = { node: child, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        // Should use child's definition, not parent's (shadowing)
        expect(result.length).toBe(1);
        expect(result[0].namespaceURI || result[0].namespaceUri).toBe('urn:foo-child');
    });

    it('handles undeclaring default namespace with xmlns=""', () => {
        // Child undeclares default namespace
        const child: any = {
            nodeType: 1,
            nodeName: 'child',
            localName: 'child',
            childNodes: [],
            attributes: [
                {
                    nodeName: 'xmlns',
                    localName: 'xmlns',
                    nodeValue: '',
                    textContent: '',
                },
            ],
            ownerDocument: null,
        };

        const root: any = {
            nodeType: 1,
            nodeName: 'root',
            localName: 'root',
            childNodes: [child],
            attributes: [
                {
                    nodeName: 'xmlns',
                    localName: 'xmlns',
                    nodeValue: 'urn:default',
                    textContent: 'urn:default',
                },
            ],
            parentNode: null,
            ownerDocument: null,
        };

        child.parentNode = root;

        const ast = parse('namespace::*', true) as XPathLocationPath;
        const context: XPathContext = { node: child, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        // Default namespace should be undeclared (empty string URI)
        const defaultNs = result.find((n) => n.localName === '' || n.nodeName === '');
        expect(defaultNs).toBeDefined();
        expect(defaultNs.namespaceURI || defaultNs.namespaceUri).toBe('');
    });

    it('returns empty array for non-element nodes', () => {
        const textNode: any = {
            nodeType: 3,
            nodeName: '#text',
            nodeValue: 'text content',
        };

        const ast = parse('namespace::*', true) as XPathLocationPath;
        const context: XPathContext = { node: textNode, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        expect(result).toEqual([]);
    });

    it('handles elements with no namespace declarations', () => {
        const element: any = {
            nodeType: 1,
            nodeName: 'root',
            localName: 'root',
            childNodes: [],
            attributes: [],
            parentNode: null,
            ownerDocument: null,
        };

        const ast = parse('namespace::*', true) as XPathLocationPath;
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        // Should only have the xml namespace
        expect(result.length).toBe(1);
        expect(result[0].localName).toBe('xml');
    });

    it('namespace nodes have correct properties', () => {
        const element = createElementWithNamespaces();
        const ast = parse('namespace::foo', true) as XPathLocationPath;
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        const nsNode = result[0];
        // Check all required namespace node properties
        expect(nsNode.nodeType).toBe(13); // Namespace node type
        expect(nsNode.nodeName).toBe('foo');
        expect(nsNode.localName).toBe('foo');
        expect(nsNode.prefix).toBe('foo');
        expect(nsNode.nodeValue).toBe('urn:foo');
        expect(nsNode.textContent).toBe('urn:foo');
        expect(nsNode.namespaceURI || nsNode.namespaceUri).toBe('urn:foo');
        expect(nsNode.parentNode).toBe(element);
    });

    it('applies predicates to namespace nodes', () => {
        const element = createElementWithNamespaces();
        const ast = parse('namespace::*[position() = 1]', true) as XPathLocationPath;
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context) as any[];

        // Should only return the first namespace node
        expect(result.length).toBe(1);
    });

    it('supports namespace axis with count() function', () => {
        const element = createElementWithNamespaces();
        const ast = parse('count(namespace::*)', true);
        const context: XPathContext = { node: element, position: 1, size: 1 };
        const result = ast.evaluate(context);

        // Should count all namespace nodes (foo, default, xml)
        expect(result).toBeGreaterThanOrEqual(2); // At least foo and xml
    });
});
