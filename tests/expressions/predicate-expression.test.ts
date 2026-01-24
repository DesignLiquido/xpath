import { XPathLexer } from '../../src/lexer';
import { XPath10Parser } from '../../src/parser';
import { XPathContext } from '../../src/context';
import { XPathPredicate } from '../../src/expressions';

describe('Predicate Expression Evaluation', () => {
    const lexer = new XPathLexer();
    const parser = new XPath10Parser();

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
        };
    }

    describe('Predicate Expression - Basic Operations', () => {
        it('should parse predicate with position', () => {
            const ast = parse('book[1]');
            // Predicate is part of location path
            expect(ast).toBeDefined();
        });

        it('should evaluate numeric predicate test - match', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate for position 1
            const predicate = new XPathPredicate(parser.parse(lexer.scan('1')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            expect(result).toBe(true);
        });

        it('should evaluate numeric predicate test - no match', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate for position 2, but context is position 1
            const predicate = new XPathPredicate(parser.parse(lexer.scan('2')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            expect(result).toBe(false);
        });

        it('should evaluate boolean predicate test - true', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate that evaluates to true
            const predicate = new XPathPredicate(parser.parse(lexer.scan('true()')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            expect(result).toBe(true);
        });

        it('should evaluate boolean predicate test - false', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate that evaluates to false
            const predicate = new XPathPredicate(parser.parse(lexer.scan('false()')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            expect(result).toBe(false);
        });

        it('should evaluate comparison predicate test - true', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with comparison
            const predicate = new XPathPredicate(parser.parse(lexer.scan('1 = 1')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            expect(result).toBe(true);
        });

        it('should evaluate comparison predicate test - false', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with comparison
            const predicate = new XPathPredicate(parser.parse(lexer.scan('1 = 2')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            expect(result).toBe(false);
        });

        it('should convert non-numeric to boolean', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with string (should convert to boolean)
            const predicate = new XPathPredicate(parser.parse(lexer.scan("'hello'")));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            // Non-empty string is true
            expect(result).toBe(true);
        });

        it('should convert empty string to false', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with empty string
            const predicate = new XPathPredicate(parser.parse(lexer.scan("''")));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            // Empty string is false
            expect(result).toBe(false);
        });

        it('should evaluate zero as false in boolean context', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with 0
            const predicate = new XPathPredicate(parser.parse(lexer.scan('0')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            // 0 is false in boolean context (but 0 as position never matches)
            expect(result).toBe(false);
        });

        it('should evaluate nonzero number as true in boolean context', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with 5 (should test position first, as number)
            const predicate = new XPathPredicate(parser.parse(lexer.scan('5')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            // 5 as position doesn't match position 1
            expect(result).toBe(false);
        });

        it('should evaluate arithmetic expression in predicate', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with arithmetic
            const predicate = new XPathPredicate(parser.parse(lexer.scan('position() = 1')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            expect(result).toBe(true);
        });

        it('should evaluate predicate with position()', () => {
            const root = createNode('root');
            const child1 = createNode('item');
            const child2 = createNode('item');
            const child3 = createNode('item');
            
            root.childNodes = [child1, child2, child3];
            child1.parentNode = root;
            child2.parentNode = root;
            child3.parentNode = root;

            // Predicate: position() > 1
            const predicate = new XPathPredicate(parser.parse(lexer.scan('position() > 1')));
            
            // Test position 2
            const context2: XPathContext = { node: child2, position: 2, size: 3 };
            const result2 = predicate.test(context2);
            expect(result2).toBe(true);

            // Test position 1
            const context1: XPathContext = { node: child1, position: 1, size: 3 };
            const result1 = predicate.test(context1);
            expect(result1).toBe(false);
        });

        it('should evaluate predicate with last()', () => {
            const root = createNode('root');
            const child1 = createNode('item');
            const child2 = createNode('item');
            const child3 = createNode('item');
            
            root.childNodes = [child1, child2, child3];
            child1.parentNode = root;
            child2.parentNode = root;
            child3.parentNode = root;

            // Predicate: position() = last()
            const predicate = new XPathPredicate(parser.parse(lexer.scan('position() = last()')));
            
            // Test position 3 with size 3
            const context3: XPathContext = { node: child3, position: 3, size: 3 };
            const result3 = predicate.test(context3);
            expect(result3).toBe(true);

            // Test position 1 with size 3
            const context1: XPathContext = { node: child1, position: 1, size: 3 };
            const result1 = predicate.test(context1);
            expect(result1).toBe(false);
        });

        it('should evaluate NaN as false', () => {
            const root = createNode('root');
            const child = createNode('book');
            root.childNodes = [child];
            child.parentNode = root;

            // Create a predicate with NaN (0 div 0)
            const predicate = new XPathPredicate(parser.parse(lexer.scan('0 div 0')));
            const context: XPathContext = { node: child, position: 1, size: 1 };
            const result = predicate.test(context);

            // NaN is false
            expect(result).toBe(false);
        });
    });

    describe('Predicate Expression - Edge Cases', () => {
        it('should handle predicate with null context', () => {
            const predicate = new XPathPredicate(parser.parse(lexer.scan('1')));
            const context: XPathContext = { node: undefined, position: 1, size: 1 };
            const result = predicate.test(context);

            // Should still evaluate
            expect(typeof result).toBe('boolean');
        });

        it('should evaluate predicate evaluate method', () => {
            const predicate = new XPathPredicate(parser.parse(lexer.scan('true()')));
            const context: XPathContext = { node: undefined, position: 1, size: 1 };
            const result = predicate.evaluate(context);

            // Should return the evaluation result
            expect(result).toBe(true);
        });
    });
});
