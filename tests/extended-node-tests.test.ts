/**
 * Tests for XPath 2.0 Extended Node Tests (Phase 5.1)
 *
 * Tests the enhanced KindTest syntax:
 * - element(name) - element with specific name
 * - element(name, type) - element with name and type constraint
 * - element(*, type) - any element with type constraint
 * - attribute(name) - attribute with specific name
 * - attribute(name, type) - attribute with name and type constraint
 * - attribute(*, type) - any attribute with type constraint
 * - schema-element(name) - element declared in schema
 * - schema-attribute(name) - attribute declared in schema
 * - document-node() - document node (root)
 * - document-node(element(...)) - document with specific root element
 * - processing-instruction(target) - processing instruction with target
 */

import { XPathLexer } from '../src/lexer';
import { XPath20Parser } from '../src/parser';
import { XPathLocationPath } from '../src/expressions';

const parse = (expr: string) => {
    const lexer = new XPathLexer('2.0');
    const tokens = lexer.scan(expr);
    const parser = new XPath20Parser();
    return parser.parse(tokens);
};

describe('XPath 2.0 Extended Node Tests (Phase 5.1)', () => {
    describe('element() tests', () => {
        it('parses element() - any element', () => {
            const ast = parse('element()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('element');
            expect(path.steps[0].nodeTest.name).toBeUndefined();
            expect(path.steps[0].nodeTest.elementType).toBeUndefined();
        });

        it('parses element(name) - element with specific name', () => {
            const ast = parse('element(book)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('element');
            expect(path.steps[0].nodeTest.name).toBe('book');
            expect(path.steps[0].nodeTest.elementType).toBeUndefined();
        });

        it('parses element(prefix:name) - element with namespace prefix', () => {
            const ast = parse('element(html:div)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('element');
            expect(path.steps[0].nodeTest.name).toBe('html:div');
        });

        it('parses element(name, type) - element with name and type', () => {
            const ast = parse('element(book, xs:string)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('element');
            expect(path.steps[0].nodeTest.name).toBe('book');
            expect(path.steps[0].nodeTest.elementType).toBe('xs:string');
        });

        it('parses element(*, type) - any element with type constraint', () => {
            const ast = parse('element(*, xs:integer)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('element');
            expect(path.steps[0].nodeTest.name).toBeUndefined();
            expect(path.steps[0].nodeTest.isWildcardName).toBe(true);
            expect(path.steps[0].nodeTest.elementType).toBe('xs:integer');
        });

        it('parses element with namespaced type', () => {
            const ast = parse('element(book, myns:bookType)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.name).toBe('book');
            expect(path.steps[0].nodeTest.elementType).toBe('myns:bookType');
        });
    });

    describe('attribute() tests', () => {
        it('parses attribute() - any attribute', () => {
            const ast = parse('attribute()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('attribute');
            expect(path.steps[0].nodeTest.name).toBeUndefined();
            expect(path.steps[0].nodeTest.elementType).toBeUndefined();
        });

        it('parses attribute(name) - attribute with specific name', () => {
            const ast = parse('attribute(id)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('attribute');
            expect(path.steps[0].nodeTest.name).toBe('id');
            expect(path.steps[0].nodeTest.elementType).toBeUndefined();
        });

        it('parses attribute(prefix:name) - attribute with namespace prefix', () => {
            const ast = parse('attribute(xml:lang)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('attribute');
            expect(path.steps[0].nodeTest.name).toBe('xml:lang');
        });

        it('parses attribute(name, type) - attribute with name and type', () => {
            const ast = parse('attribute(lang, xs:language)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('attribute');
            expect(path.steps[0].nodeTest.name).toBe('lang');
            expect(path.steps[0].nodeTest.elementType).toBe('xs:language');
        });

        it('parses attribute(*, type) - any attribute with type constraint', () => {
            const ast = parse('attribute(*, xs:ID)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('attribute');
            expect(path.steps[0].nodeTest.name).toBeUndefined();
            expect(path.steps[0].nodeTest.isWildcardName).toBe(true);
            expect(path.steps[0].nodeTest.elementType).toBe('xs:ID');
        });
    });

    describe('schema-element() tests', () => {
        it('parses schema-element(name) - schema-declared element', () => {
            const ast = parse('schema-element(book)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('schema-element');
            expect(path.steps[0].nodeTest.name).toBe('book');
        });

        it('parses schema-element(prefix:name) - schema-declared element with prefix', () => {
            const ast = parse('schema-element(doc:chapter)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('schema-element');
            expect(path.steps[0].nodeTest.name).toBe('doc:chapter');
        });
    });

    describe('schema-attribute() tests', () => {
        it('parses schema-attribute(name) - schema-declared attribute', () => {
            const ast = parse('schema-attribute(id)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('schema-attribute');
            expect(path.steps[0].nodeTest.name).toBe('id');
        });

        it('parses schema-attribute(prefix:name) - schema-declared attribute with prefix', () => {
            const ast = parse('schema-attribute(xml:lang)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('schema-attribute');
            expect(path.steps[0].nodeTest.name).toBe('xml:lang');
        });
    });

    describe('document-node() tests', () => {
        it('parses document-node() - any document node', () => {
            const ast = parse('document-node()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('document-node');
            expect(path.steps[0].nodeTest.elementTest).toBeUndefined();
        });

        it('parses document-node(element()) - document with any root element', () => {
            const ast = parse('document-node(element())');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('document-node');
            expect(path.steps[0].nodeTest.elementTest).toBeDefined();
            expect(path.steps[0].nodeTest.elementTest?.type).toBe('element');
        });

        it('parses document-node(element(name)) - document with specific root element', () => {
            const ast = parse('document-node(element(html))');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('document-node');
            expect(path.steps[0].nodeTest.elementTest).toBeDefined();
            expect(path.steps[0].nodeTest.elementTest?.type).toBe('element');
            expect(path.steps[0].nodeTest.elementTest?.name).toBe('html');
        });

        it('parses document-node(element(name, type)) - document with typed root element', () => {
            const ast = parse('document-node(element(book, xs:string))');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('document-node');
            expect(path.steps[0].nodeTest.elementTest?.name).toBe('book');
            expect(path.steps[0].nodeTest.elementTest?.elementType).toBe('xs:string');
        });

        it('parses document-node(schema-element(name)) - document with schema-declared root', () => {
            const ast = parse('document-node(schema-element(doc))');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('document-node');
            expect(path.steps[0].nodeTest.elementTest?.type).toBe('schema-element');
            expect(path.steps[0].nodeTest.elementTest?.name).toBe('doc');
        });
    });

    describe('processing-instruction() tests', () => {
        it('parses processing-instruction() - any PI', () => {
            const ast = parse('processing-instruction()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('node-type');
            expect(path.steps[0].nodeTest.nodeType).toBe('processing-instruction');
        });

        it('parses processing-instruction(target) - PI with specific target', () => {
            const ast = parse('processing-instruction("php")');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('processing-instruction');
            expect(path.steps[0].nodeTest.target).toBe('php');
        });

        it('parses processing-instruction with single-quoted target', () => {
            const ast = parse("processing-instruction('xml-stylesheet')");
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('processing-instruction');
            expect(path.steps[0].nodeTest.target).toBe('xml-stylesheet');
        });
    });

    describe('Complex path expressions with extended node tests', () => {
        it('combines element test with predicates', () => {
            const ast = parse('element(book)[position() = 1]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('element');
            expect(path.steps[0].nodeTest.name).toBe('book');
            expect(path.steps[0].predicates.length).toBe(1);
        });

        it('combines attribute test with predicates', () => {
            const ast = parse('attribute(id)[@type="primary"]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('attribute');
            expect(path.steps[0].nodeTest.name).toBe('id');
            expect(path.steps[0].predicates.length).toBe(1);
        });

        it('chains multiple step expressions with element tests', () => {
            const ast = parse('element(html)/element(body)/element(div)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps.length).toBe(3);
            expect(path.steps[0].nodeTest.name).toBe('html');
            expect(path.steps[1].nodeTest.name).toBe('body');
            expect(path.steps[2].nodeTest.name).toBe('div');
        });

        it('uses attribute axis with attribute test', () => {
            const ast = parse('element(div)/@attribute(id)');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps.length).toBe(2);
            expect(path.steps[1].axis).toBe('attribute');
            expect(path.steps[1].nodeTest.type).toBe('attribute');
            expect(path.steps[1].nodeTest.name).toBe('id');
        });

        it('nests node tests in document-node', () => {
            const ast = parse('document-node(element(root, xs:anyType))');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('document-node');
            const nested = path.steps[0].nodeTest.elementTest;
            expect(nested?.name).toBe('root');
            expect(nested?.elementType).toBe('xs:anyType');
        });
    });

    describe('Backward compatibility with existing node tests', () => {
        it('still supports node() test', () => {
            const ast = parse('node()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('node-type');
            expect(path.steps[0].nodeTest.nodeType).toBe('node');
        });

        it('still supports text() test', () => {
            const ast = parse('text()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('node-type');
            expect(path.steps[0].nodeTest.nodeType).toBe('text');
        });

        it('still supports comment() test', () => {
            const ast = parse('comment()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('node-type');
            expect(path.steps[0].nodeTest.nodeType).toBe('comment');
        });

        it('still supports wildcard test', () => {
            const ast = parse('*');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('wildcard');
        });

        it('still supports name test', () => {
            const ast = parse('div');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('name');
            expect(path.steps[0].nodeTest.name).toBe('div');
        });
    });
});
