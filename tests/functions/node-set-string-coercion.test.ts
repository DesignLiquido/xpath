/**
 * Regression tests for issue #182:
 * String functions (substring, contains, starts-with, etc.) must correctly
 * convert node-set arguments to strings rather than calling toString() on
 * XNode objects, which would produce debug output like "1, id, null".
 *
 * These tests simulate nodes WITHOUT textContent (matching XNode behaviour
 * from the XSLT processor's own DOM), relying on childNodes + nodeValue
 * for text extraction.
 */

import { XPathLexer } from '../../src/lexer';
import { XPath10Parser } from '../../src/parser';
import { XPathContext } from '../../src/context';

const lexer = new XPathLexer();
const parser = new XPath10Parser();

function parse(expression: string) {
    const tokens = lexer.scan(expression);
    return parser.parse(tokens);
}

/**
 * Creates an element node WITHOUT textContent, mirroring XNode from xslt-processor.
 * Text content lives in text-node children with nodeValue.
 */
function createElement(name: string, parentNode: any = null): any {
    return {
        nodeName: name,
        localName: name,
        nodeType: 1,
        nodeValue: null,
        // textContent intentionally omitted to simulate XNode
        parentNode,
        childNodes: [],
        attributes: [],
        nextSibling: null,
        previousSibling: null,
    };
}

function createTextNode(value: string, parentNode: any = null): any {
    return {
        nodeName: '#text',
        localName: '#text',
        nodeType: 3,
        nodeValue: value,
        textContent: value,
        parentNode,
        childNodes: [],
        attributes: [],
        nextSibling: null,
        previousSibling: null,
    };
}

function createAttributeNode(name: string, value: string): any {
    return {
        nodeName: name,
        localName: name,
        nodeType: 2,
        nodeValue: value,
        // textContent intentionally omitted to simulate XNode attribute
        childNodes: [],
        attributes: [],
    };
}

/**
 * Builds a product document matching the issue's example:
 *   <product>
 *     <id>45689</id>
 *     <name>Widget</name>
 *   </product>
 * with a @url attribute on product.
 */
function buildProductDoc() {
    const root = createElement('root');

    const product = createElement('product', root);
    const urlAttr = createAttributeNode('url', 'http://example.com');
    product.attributes = [urlAttr];

    const id = createElement('id', product);
    const idText = createTextNode('45689', id);
    id.childNodes = [idText];

    const nameEl = createElement('name', product);
    const nameText = createTextNode('Widget', nameEl);
    nameEl.childNodes = [nameText];

    product.childNodes = [id, nameEl];
    root.childNodes = [product];

    return root;
}

describe('Issue #182 — string functions with node-set arguments (no textContent)', () => {
    const root = buildProductDoc();
    const context: XPathContext = { node: root, position: 1, size: 1 };

    describe('substring()', () => {
        it('should return node text when passed an element node-set (child path)', () => {
            const ast = parse('substring(product/id, 1, 30)');
            const result = ast.evaluate(context);
            expect(result).toBe('45689');
        });

        it('should return the full value when length exceeds string length', () => {
            const ast = parse('substring(product/name, 1, 30)');
            const result = ast.evaluate(context);
            expect(result).toBe('Widget');
        });

        it('should still work correctly with a string literal (regression guard)', () => {
            const ast = parse("substring('01234567890', 1, 5)");
            const result = ast.evaluate(context);
            expect(result).toBe('01234');
        });

        it('should handle attribute node-sets', () => {
            const productContext: XPathContext = {
                node: root.childNodes[0], // product element
                position: 1,
                size: 1,
            };
            const ast = parse('substring(@url, 1, 30)');
            const result = ast.evaluate(productContext);
            expect(result).toBe('http://example.com');
        });
    });

    describe('contains()', () => {
        it('should return true when node text contains substring', () => {
            const ast = parse("contains(product/id, '456')");
            const result = ast.evaluate(context);
            expect(result).toBe(true);
        });

        it('should return false when node text does not contain substring', () => {
            const ast = parse("contains(product/id, 'xyz')");
            const result = ast.evaluate(context);
            expect(result).toBe(false);
        });
    });

    describe('starts-with()', () => {
        it('should return true when node text starts with prefix', () => {
            const ast = parse("starts-with(product/id, '456')");
            const result = ast.evaluate(context);
            expect(result).toBe(true);
        });

        it('should return false when node text does not start with prefix', () => {
            const ast = parse("starts-with(product/id, '999')");
            const result = ast.evaluate(context);
            expect(result).toBe(false);
        });

        it('should work with attribute node-sets', () => {
            const productContext: XPathContext = {
                node: root.childNodes[0],
                position: 1,
                size: 1,
            };
            const ast = parse("starts-with(@url, 'http')");
            const result = ast.evaluate(productContext);
            expect(result).toBe(true);
        });
    });

    describe('string-length()', () => {
        it('should return the character count of a node text value', () => {
            const ast = parse('string-length(product/id)');
            const result = ast.evaluate(context);
            expect(result).toBe(5);
        });
    });

    describe('normalize-space()', () => {
        it('should return trimmed node text', () => {
            const ast = parse('normalize-space(product/name)');
            const result = ast.evaluate(context);
            expect(result).toBe('Widget');
        });
    });

    describe('substring-before()', () => {
        it('should return the part before the search string', () => {
            const productContext: XPathContext = {
                node: root.childNodes[0],
                position: 1,
                size: 1,
            };
            const ast = parse("substring-before(@url, '://')");
            const result = ast.evaluate(productContext);
            expect(result).toBe('http');
        });
    });

    describe('substring-after()', () => {
        it('should return the part after the search string', () => {
            const productContext: XPathContext = {
                node: root.childNodes[0],
                position: 1,
                size: 1,
            };
            const ast = parse("substring-after(@url, '://')");
            const result = ast.evaluate(productContext);
            expect(result).toBe('example.com');
        });
    });

    describe('translate()', () => {
        it('should apply character mapping on node text', () => {
            const ast = parse("translate(product/id, '456', 'XYZ')");
            const result = ast.evaluate(context);
            expect(result).toBe('XYZ89');
        });
    });

    describe('string()', () => {
        it('should convert a node-set to string using text content', () => {
            const ast = parse('string(product/id)');
            const result = ast.evaluate(context);
            expect(result).toBe('45689');
        });
    });
});
