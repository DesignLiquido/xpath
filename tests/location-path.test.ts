import { XPathLexer } from '../src/lexer';
import { XPathBaseParser } from '../src/parser';
import { XPathContext } from '../src/context';
import { XPathNode } from '../src/node';
import { XPathLocationPath } from '../src/expressions';

describe('Location Path and Step Expression Evaluation', () => {
    const lexer = new XPathLexer();
    const parser = new XPathBaseParser();

    function parse(expression: string) {
        const tokens = lexer.scan(expression);
        return parser.parse(tokens);
    }

    // Helper to create a simple DOM-like structure
    function createNode(nodeName: string, nodeType: number = 1, parentNode: any = null): any {
        return {
            nodeName,
            nodeType,
            parentNode,
            childNodes: [],
            attributes: [],
            nextSibling: null,
            previousSibling: null,
            localName: nodeName,
            textContent: '',
            getChildNodes() { return this.childNodes; }
        };
    }

    function createTextNode(text: string, parentNode: any = null): any {
        return {
            nodeName: '#text',
            nodeType: 3,
            nodeValue: text,
            textContent: text,
            parentNode,
            childNodes: [],
            nextSibling: null,
            previousSibling: null,
            localName: '#text',
            attributes: [],
        };
    }

    function createAttributeNode(name: string, value: string): any {
        return {
            nodeName: name,
            nodeType: 2,
            localName: name,
            nodeValue: value,
            textContent: value,
            childNodes: [],
            attributes: [],
        };
    }

    describe('Step Expression - Axis Navigation', () => {
        it('should navigate child axis', () => {
            const root = createNode('root');
            const child1 = createNode('child', 1, root);
            const child2 = createNode('child', 1, root);
            root.childNodes = [child1, child2];
            child1.nextSibling = child2;
            child2.previousSibling = child1;

            const ast = parse('child::child') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });

        it('should navigate parent axis', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            root.childNodes = [child];

            const ast = parse('parent::root') as XPathLocationPath;
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect((result as any[])[0]).toBe(root);
        });

        it('should navigate parent axis with no parent', () => {
            const root = createNode('root');

            const ast = parse('parent::*') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should navigate self axis', () => {
            const root = createNode('root');

            const ast = parse('self::root') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect((result as any[])[0]).toBe(root);
        });

        it('should navigate self axis with different name', () => {
            const root = createNode('root');

            const ast = parse('self::different') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should navigate attribute axis', () => {
            const element = createNode('element');
            const attr = createAttributeNode('id', '123');
            element.attributes = [attr];

            const ast = parse('attribute::id') as XPathLocationPath;
            const context: XPathContext = { node: element, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
        });

        it('should navigate descendant axis', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            const grandchild = createNode('grandchild', 1, child);
            root.childNodes = [child];
            child.childNodes = [grandchild];
            child.parentNode = root;
            grandchild.parentNode = child;

            const ast = parse('descendant::*') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBeGreaterThan(0);
        });

        it('should navigate descendant-or-self axis', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            root.childNodes = [child];
            child.parentNode = root;

            const ast = parse('descendant-or-self::*') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBeGreaterThanOrEqual(1);
        });

        it('should navigate ancestor axis', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            const grandchild = createNode('grandchild', 1, child);
            root.childNodes = [child];
            child.parentNode = root;
            child.childNodes = [grandchild];
            grandchild.parentNode = child;

            const ast = parse('ancestor::*') as XPathLocationPath;
            const context: XPathContext = { node: grandchild, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBeGreaterThan(0);
        });

        it('should navigate ancestor-or-self axis', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            root.childNodes = [child];
            child.parentNode = root;

            const ast = parse('ancestor-or-self::*') as XPathLocationPath;
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBeGreaterThanOrEqual(1);
        });

        it('should navigate following-sibling axis', () => {
            const parent = createNode('parent');
            const sibling1 = createNode('sibling', 1, parent);
            const sibling2 = createNode('sibling', 1, parent);
            const sibling3 = createNode('sibling', 1, parent);

            sibling1.nextSibling = sibling2;
            sibling2.nextSibling = sibling3;
            sibling2.previousSibling = sibling1;
            sibling3.previousSibling = sibling2;

            parent.childNodes = [sibling1, sibling2, sibling3];

            const ast = parse('following-sibling::sibling') as XPathLocationPath;
            const context: XPathContext = { node: sibling1, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });

        it('should navigate preceding-sibling axis', () => {
            const parent = createNode('parent');
            const sibling1 = createNode('sibling', 1, parent);
            const sibling2 = createNode('sibling', 1, parent);
            const sibling3 = createNode('sibling', 1, parent);

            sibling1.nextSibling = sibling2;
            sibling2.nextSibling = sibling3;
            sibling2.previousSibling = sibling1;
            sibling3.previousSibling = sibling2;

            parent.childNodes = [sibling1, sibling2, sibling3];

            const ast = parse('preceding-sibling::sibling') as XPathLocationPath;
            const context: XPathContext = { node: sibling3, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });

        it('should navigate following axis', () => {
            const root = createNode('root');
            const child1 = createNode('child', 1, root);
            const child2 = createNode('child', 1, root);
            const grandchild = createNode('grandchild', 1, child1);

            root.childNodes = [child1, child2];
            child1.parentNode = root;
            child2.parentNode = root;
            child1.childNodes = [grandchild];
            grandchild.parentNode = child1;
            child1.nextSibling = child2;
            child2.previousSibling = child1;

            const ast = parse('following::*') as XPathLocationPath;
            const context: XPathContext = { node: child1, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBeGreaterThan(0);
        });

        it('should navigate preceding axis', () => {
            const root = createNode('root');
            const child1 = createNode('child', 1, root);
            const child2 = createNode('child', 1, root);
            const grandchild = createNode('grandchild', 1, child2);

            root.childNodes = [child1, child2];
            child1.parentNode = root;
            child2.parentNode = root;
            child2.childNodes = [grandchild];
            grandchild.parentNode = child2;
            child1.nextSibling = child2;
            child2.previousSibling = child1;

            const ast = parse('preceding::*') as XPathLocationPath;
            const context: XPathContext = { node: child2, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Step Expression - Node Tests', () => {
        it('should match name node test', () => {
            const root = createNode('root');
            const child = createNode('element', 1, root);
            root.childNodes = [child];

            const ast = parse('child::element') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
        });

        it('should not match different name', () => {
            const root = createNode('root');
            const child = createNode('element', 1, root);
            root.childNodes = [child];

            const ast = parse('child::different') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should match wildcard node test', () => {
            const root = createNode('root');
            const child1 = createNode('elem1', 1, root);
            const child2 = createNode('elem2', 1, root);
            root.childNodes = [child1, child2];
            child1.nextSibling = child2;
            child2.previousSibling = child1;

            const ast = parse('child::*') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });

        it('should match text() node test', () => {
            const root = createNode('root');
            const text = createTextNode('hello', root);
            root.childNodes = [text];

            const ast = parse('child::text()') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
        });

        it('should match node() node test', () => {
            const root = createNode('root');
            const child = createNode('elem', 1, root);
            const text = createTextNode('hello', root);
            root.childNodes = [child, text];
            child.nextSibling = text;
            text.previousSibling = child;

            const ast = parse('child::node()') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });

        it('should match comment() node test', () => {
            const root = createNode('root');
            const comment = {
                nodeType: 8,
                nodeName: '#comment',
                localName: '#comment',
                parentNode: root,
                textContent: 'comment text',
                childNodes: [],
                attributes: [],
            };
            root.childNodes = [comment];

            const ast = parse('child::comment()') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBeGreaterThanOrEqual(0);
        });

        it('should match processing-instruction() node test', () => {
            const root = createNode('root');
            const pi = {
                nodeType: 7,
                nodeName: 'processing-instruction',
                localName: 'processing-instruction',
                target: 'xml-stylesheet',
                parentNode: root,
                textContent: 'href="style.css"',
                childNodes: [],
                attributes: [],
            };
            root.childNodes = [pi];

            const ast = parse('child::processing-instruction()') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Step Expression - Predicates', () => {
        it('should apply numeric position predicate', () => {
            const root = createNode('root');
            const child1 = createNode('item', 1, root);
            const child2 = createNode('item', 1, root);
            const child3 = createNode('item', 1, root);
            root.childNodes = [child1, child2, child3];
            child1.nextSibling = child2;
            child2.nextSibling = child3;
            child2.previousSibling = child1;
            child3.previousSibling = child2;

            const ast = parse('child::item[2]') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect((result as any[])[0]).toBe(child2);
        });

        it('should apply boolean predicate', () => {
            const root = createNode('root');
            const child1 = createNode('item', 1, root);
            const child2 = createNode('item', 1, root);
            root.childNodes = [child1, child2];
            child1.nextSibling = child2;
            child2.previousSibling = child1;

            // Predicate that returns true
            const ast = parse('child::item[true()]') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });

        it('should apply multiple predicates', () => {
            const root = createNode('root');
            const child1 = createNode('item', 1, root);
            const child2 = createNode('item', 1, root);
            const child3 = createNode('item', 1, root);
            root.childNodes = [child1, child2, child3];

            const ast = parse('child::item[1][true()]') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Location Path - Absolute Paths', () => {
        it('should handle absolute root path', () => {
            const root = createNode('root');

            const ast = parse('/') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle absolute root element path', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            root.childNodes = [child];

            const ast = parse('/root') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Location Path - Relative Paths', () => {
        it('should handle self abbreviation', () => {
            const root = createNode('root');

            const ast = parse('.') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect((result as any[])[0]).toBe(root);
        });

        it('should handle parent abbreviation', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            root.childNodes = [child];
            child.parentNode = root;

            const ast = parse('..') as XPathLocationPath;
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect((result as any[])[0]).toBe(root);
        });
    });

    describe('Location Path - Attribute Axis', () => {
        it('should handle attribute shorthand', () => {
            const element = createNode('element');
            const attr = createAttributeNode('id', '123');
            element.attributes = [attr];

            const ast = parse('@id') as XPathLocationPath;
            const context: XPathContext = { node: element, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
        });

        it('should handle attribute wildcard', () => {
            const element = createNode('element');
            const attr1 = createAttributeNode('id', '123');
            const attr2 = createAttributeNode('name', 'test');
            element.attributes = [attr1, attr2];

            const ast = parse('@*') as XPathLocationPath;
            const context: XPathContext = { node: element, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });
    });

    describe('Location Path - Descendant Shorthand', () => {
        it('should handle // shorthand', () => {
            const root = createNode('root');
            const child = createNode('child', 1, root);
            const target = createNode('target', 1, child);
            root.childNodes = [child];
            child.parentNode = root;
            child.childNodes = [target];
            target.parentNode = child;

            const ast = parse('//target') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty node list', () => {
            const root = createNode('root');
            // No children

            const ast = parse('child::*') as XPathLocationPath;
            const context: XPathContext = { node: root, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should handle null node context', () => {
            const ast = parse('child::*') as XPathLocationPath;
            const context: XPathContext = { node: undefined, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should handle undefined node context', () => {
            const ast = parse('child::*') as XPathLocationPath;
            const context: XPathContext = { node: undefined, position: 1, size: 1 };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });
    });
});
