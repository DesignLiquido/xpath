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

        const prefixes = result.map(n => n.localName || n.nodeName);
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
});
