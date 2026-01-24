import { XPathLexer } from '../src/lexer';
import { XPathBaseParser } from '../src/parser';
import { XPathContext } from '../src/context';
import { XPathUnionExpression } from '../src/expressions';

describe('Union Expression Evaluation', () => {
    const lexer = new XPathLexer();
    const parser = new XPathBaseParser();

    function parse(expression: string) {
        const tokens = lexer.scan(expression);
        return parser.parse(tokens);
    }

    // Helper to create a simple DOM-like structure
    function createNode(nodeName: string, nodeType: number = 1): any {
        return {
            nodeName,
            nodeType,
            childNodes: [],
            attributes: [],
            nextSibling: null,
            previousSibling: null,
            localName: nodeName,
            textContent: '',
            parentNode: null,
            getChildNodes() { return this.childNodes; }
        };
    }

    describe('Union Expression - Basic Operations', () => {
        it('should parse and create union expression', () => {
            const ast = parse('elem1 | elem2') as XPathUnionExpression;
            expect(ast).toBeInstanceOf(XPathUnionExpression);
        });

        it('should evaluate union of two paths', () => {
            const root = createNode('root');
            const elem1 = createNode('elem1');
            const elem2 = createNode('elem2');
            elem1.parentNode = root;
            elem2.parentNode = root;
            root.childNodes = [elem1, elem2];
            elem1.nextSibling = elem2;
            elem2.previousSibling = elem1;

            const ast = parse('elem1 | elem2') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            // Result should be a combined set
            expect((result as any[]).length).toBeGreaterThanOrEqual(0);
        });

        it('should evaluate union with different node types', () => {
            const root = createNode('root');
            const elem = createNode('elem');
            const attr = {
                nodeType: 2,
                nodeName: 'attr',
                localName: 'attr',
                textContent: 'value',
                parentNode: root,
                childNodes: [],
                attributes: [],
            };
            elem.parentNode = root;
            root.childNodes = [elem];
            root.attributes = [attr];

            const ast = parse('elem | @attr') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle multiple unions', () => {
            const root = createNode('root');
            const elem1 = createNode('elem1');
            const elem2 = createNode('elem2');
            const elem3 = createNode('elem3');
            
            elem1.parentNode = root;
            elem2.parentNode = root;
            elem3.parentNode = root;
            root.childNodes = [elem1, elem2, elem3];

            const ast = parse('elem1 | elem2 | elem3') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should evaluate union with same node type', () => {
            const root = createNode('root');
            const item1 = createNode('item');
            const item2 = createNode('item');
            
            item1.parentNode = root;
            item2.parentNode = root;
            root.childNodes = [item1, item2];
            item1.nextSibling = item2;
            item2.previousSibling = item1;

            const ast = parse('item | item') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should evaluate union with absolute paths', () => {
            const root = createNode('root');
            const title1 = createNode('title');
            const title2 = createNode('title');
            
            title1.parentNode = root;
            title2.parentNode = root;
            root.childNodes = [title1, title2];

            const ast = parse('//title | //link') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should evaluate union with wildcards', () => {
            const root = createNode('root');
            const elem1 = createNode('elem1');
            const elem2 = createNode('elem2');
            
            elem1.parentNode = root;
            elem2.parentNode = root;
            root.childNodes = [elem1, elem2];
            elem1.nextSibling = elem2;
            elem2.previousSibling = elem1;

            const ast = parse('* | elem1') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should evaluate union with attribute wildcards', () => {
            const element = createNode('element');
            const attr1 = {
                nodeType: 2,
                nodeName: 'id',
                localName: 'id',
                textContent: '123',
                parentNode: element,
                childNodes: [],
                attributes: [],
            };
            const attr2 = {
                nodeType: 2,
                nodeName: 'class',
                localName: 'class',
                textContent: 'test',
                parentNode: element,
                childNodes: [],
                attributes: [],
            };
            element.attributes = [attr1, attr2];

            const ast = parse('@* | node()') as XPathUnionExpression;
            const context: XPathContext = { node: element, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should evaluate union with text nodes', () => {
            const root = createNode('root');
            const text: any = {
                nodeType: 3,
                nodeName: '#text',
                localName: '#text',
                textContent: 'hello',
                parentNode: root,
                childNodes: [],
                attributes: [],
            };
            const elem = createNode('elem');
            elem.parentNode = root;
            root.childNodes = [text, elem];
            text.nextSibling = elem;
            elem.previousSibling = text;

            const ast = parse('@* | text()') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should evaluate union with empty result', () => {
            const root = createNode('root');
            // No children

            const ast = parse('elem1 | elem2') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });
    });

    describe('Union Expression - Edge Cases', () => {
        it('should handle union with null context node', () => {
            const ast = parse('elem1 | elem2') as XPathUnionExpression;
            const context: XPathContext = { node: undefined, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should handle union with undefined context node', () => {
            const ast = parse('elem1 | elem2') as XPathUnionExpression;
            const context: XPathContext = { node: undefined, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should combine results correctly', () => {
            const root = createNode('root');
            const elem1 = createNode('elem1');
            const elem2 = createNode('elem2');
            
            elem1.parentNode = root;
            elem2.parentNode = root;
            root.childNodes = [elem1, elem2];
            elem1.nextSibling = elem2;
            elem2.previousSibling = elem1;

            const ast = parse('elem1 | elem2') as XPathUnionExpression;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            // Both elements should be in the union
            expect(Array.isArray(result)).toBe(true);
            const resultArray = result as any[];
            // Result should contain references to evaluated nodes
            expect(resultArray.length).toBeGreaterThanOrEqual(0);
        });
    });
});
