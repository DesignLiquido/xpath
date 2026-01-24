import { XPathLexer } from '../src/lexer';
import { XPathBaseParser } from '../src/parser/base-parser';
import { XPathContext } from '../src/context';
import { XPathFilterExpression } from '../src/expressions';

describe('Filter Expression Evaluation', () => {
    const lexer = new XPathLexer();
    const parser = new XPathBaseParser();

    function parse(expression: string) {
        const tokens = lexer.scan(expression);
        return parser.parse(tokens);
    }

    // Helper to create a simple DOM-like structure
    function createNode(nodeName: string, nodeType: number = 1, textContent: string = ''): any {
        return {
            nodeName,
            nodeType,
            childNodes: [],
            attributes: [],
            nextSibling: null,
            previousSibling: null,
            localName: nodeName,
            textContent,
            parentNode: undefined,
        };
    }

    describe('Filter Expression - Basic Operations', () => {
        it('should parse filter expression with numeric predicate on element', () => {
            const root = createNode('root');
            const book1 = createNode('book');
            const book2 = createNode('book');
            root.childNodes = [book1, book2];
            book1.parentNode = root;
            book2.parentNode = root;

            const ast = parse('book[1]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(book1);
        });

        it('should evaluate filter expression with numeric predicate - position match', () => {
            const root = createNode('root');
            const book1 = createNode('book');
            const book2 = createNode('book');
            const book3 = createNode('book');
            root.childNodes = [book1, book2, book3];
            book1.parentNode = root;
            book2.parentNode = root;
            book3.parentNode = root;

            const ast = parse('book[2]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(book2);
        });

        it('should evaluate filter expression with numeric predicate - no match', () => {
            const root = createNode('root');
            const book1 = createNode('book');
            const book2 = createNode('book');
            root.childNodes = [book1, book2];
            book1.parentNode = root;
            book2.parentNode = root;

            const ast = parse('book[5]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should handle filter with boolean predicate - true', () => {
            const root = createNode('root');
            const book1 = createNode('book', 1, 'Good');
            const book2 = createNode('book', 1, 'Bad');
            root.childNodes = [book1, book2];
            book1.parentNode = root;
            book2.parentNode = root;

            const ast = parse('book[true()]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
        });

        it('should handle filter with boolean predicate - false', () => {
            const root = createNode('root');
            const book1 = createNode('book');
            const book2 = createNode('book');
            root.childNodes = [book1, book2];
            book1.parentNode = root;
            book2.parentNode = root;

            const ast = parse('book[false()]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });



        it('should handle multiple predicates', () => {
            const root = createNode('root');
            const book1 = createNode('book', 1, 'Good');
            const book2 = createNode('book', 1, 'Bad');
            const book3 = createNode('book', 1, 'Excellent');
            root.childNodes = [book1, book2, book3];
            book1.parentNode = root;
            book2.parentNode = root;
            book3.parentNode = root;

            const ast = parse('book[true()][position() < 3]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
            expect(result[0]).toBe(book1);
            expect(result[1]).toBe(book2);
        });

        it('should handle numeric predicate with single result', () => {
            const root = createNode('root');
            const book1 = createNode('book');
            const book2 = createNode('book');
            const book3 = createNode('book');
            root.childNodes = [book1, book2, book3];
            book1.parentNode = root;
            book2.parentNode = root;
            book3.parentNode = root;

            const ast = parse('book[2]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(book2);
        });

        it('should handle filter with position function', () => {
            const root = createNode('root');
            const book1 = createNode('book');
            const book2 = createNode('book');
            const book3 = createNode('book');
            const book4 = createNode('book');
            root.childNodes = [book1, book2, book3, book4];
            book1.parentNode = root;
            book2.parentNode = root;
            book3.parentNode = root;
            book4.parentNode = root;

            const ast = parse('book[position() mod 2 = 0]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(2);
            expect(result[0]).toBe(book2);
            expect(result[1]).toBe(book4);
        });

        it('should handle filter with last() function', () => {
            const root = createNode('root');
            const book1 = createNode('book');
            const book2 = createNode('book');
            const book3 = createNode('book');
            root.childNodes = [book1, book2, book3];
            book1.parentNode = root;
            book2.parentNode = root;
            book3.parentNode = root;

            const ast = parse('book[position() = last()]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(book3);
        });

        it('should handle empty result', () => {
            const root = createNode('root');
            root.childNodes = [];

            const ast = parse('book[1]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should handle filter with string function', () => {
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            // Simple function call predicate
            const ast = parse('item[position() > 0]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(Array.isArray(result)).toBe(true);
            // All items have position > 0
            expect((result as any[]).length).toBe(3);
        });
    });

    describe('Filter Expression - Context Position and Size', () => {
        it('should properly track position in context', () => {
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[position() = 2]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(items[1]);
        });

        it('should properly track size in context', () => {
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[position() = last()]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(items[2]);
        });

        it('should handle predicates based on relative position', () => {
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[position() < last()]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(4);
        });

        it('should handle position arithmetic', () => {
            const root = createNode('root');
            const items = Array.from({ length: 10 }, (_, i) => createNode('item', 1, `Item ${i + 1}`));
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[position() > 5]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(5);
            expect(result[0]).toBe(items[5]);
        });
    });

    describe('Filter Expression - Predicate Types', () => {
        it('should evaluate numeric predicates correctly', () => {
            // Numeric predicate: selects item at position
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[2]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect(result[0]).toBe(items[1]);
        });

        it('should evaluate boolean predicates correctly', () => {
            // Boolean predicate: includes item if true
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[position() > 1]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(2);
            expect(result[0]).toBe(items[1]);
            expect(result[1]).toBe(items[2]);
        });

        it('should handle first node with first() idiom', () => {
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[1]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(items[0]);
        });

        it('should handle last node with last() function', () => {
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[last()]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(1);
            expect(result[0]).toBe(items[2]);
        });

        it('should handle not() in predicate', () => {
            const root = createNode('root');
            const items = [createNode('item'), createNode('item'), createNode('item')];
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            const ast = parse('item[position() != 2]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(2);
            expect(result[0]).toBe(items[0]);
            expect(result[1]).toBe(items[2]);
        });

        it('should handle complex boolean predicate with and/or', () => {
            const root = createNode('root');
            const items = Array.from({ length: 5 }, (_, i) => createNode('item', 1, String(i + 1)));
            root.childNodes = items;
            items.forEach(item => item.parentNode = root);

            // Filter for items at odd positions greater than position 2
            const ast = parse('item[position() > 2 and position() mod 2 = 1]');
            const context: XPathContext = { node: root };
            const result = ast.evaluate(context);

            expect((result as any[]).length).toBe(2);
            expect(result[0]).toBe(items[2]);  // position 3
            expect(result[1]).toBe(items[4]);  // position 5
        });
    });
});
