import { XPathLexer } from '../src/lexer';
import { XPathParser } from '../src/parser';
import {
    XPathStringLiteral,
    XPathNumberLiteral,
    XPathVariableReference,
    XPathUnaryExpression,
    XPathArithmeticExpression,
    XPathBinaryExpression,
    XPathLogicalExpression,
    XPathFunctionCall,
    XPathStep,
    XPathLocationPath,
    XPathUnionExpression,
    XPathFilterExpression,
} from '../src/expressions';

describe('Parser', () => {
    const lexer = new XPathLexer();
    const parser = new XPathParser();

    function parse(expression: string) {
        const tokens = lexer.scan(expression);
        return parser.parse(tokens);
    }

    describe('Literals', () => {
        it('should parse string literals with single quotes', () => {
            const ast = parse("'hello'");
            expect(ast).toBeInstanceOf(XPathStringLiteral);
            expect((ast as XPathStringLiteral).value).toBe('hello');
        });

        it('should parse string literals with double quotes', () => {
            const ast = parse('"world"');
            expect(ast).toBeInstanceOf(XPathStringLiteral);
            expect((ast as XPathStringLiteral).value).toBe('world');
        });

        it('should parse integer numbers', () => {
            const ast = parse('42');
            expect(ast).toBeInstanceOf(XPathNumberLiteral);
            expect((ast as XPathNumberLiteral).value).toBe(42);
        });

        it('should parse decimal numbers', () => {
            const ast = parse('3.14');
            expect(ast).toBeInstanceOf(XPathNumberLiteral);
            expect((ast as XPathNumberLiteral).value).toBe(3.14);
        });
    });

    describe('Variable References', () => {
        it('should parse variable reference', () => {
            const ast = parse('$myVar');
            expect(ast).toBeInstanceOf(XPathVariableReference);
            expect((ast as XPathVariableReference).name).toBe('myVar');
        });
    });

    describe('Arithmetic Expressions', () => {
        it('should parse addition', () => {
            const ast = parse('1 + 2');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            const expr = ast as XPathArithmeticExpression;
            expect(expr.operator).toBe('+');
            expect((expr.left as XPathNumberLiteral).value).toBe(1);
            expect((expr.right as XPathNumberLiteral).value).toBe(2);
        });

        it('should parse subtraction', () => {
            const ast = parse('5 - 3');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            expect((ast as XPathArithmeticExpression).operator).toBe('-');
        });

        it('should parse multiplication', () => {
            const ast = parse('4 * 2');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            expect((ast as XPathArithmeticExpression).operator).toBe('*');
        });

        it('should parse division', () => {
            const ast = parse('10 div 2');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            expect((ast as XPathArithmeticExpression).operator).toBe('div');
        });

        it('should parse modulo', () => {
            const ast = parse('10 mod 3');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            expect((ast as XPathArithmeticExpression).operator).toBe('mod');
        });

        it('should parse unary minus', () => {
            const ast = parse('-5');
            expect(ast).toBeInstanceOf(XPathUnaryExpression);
            const expr = ast as XPathUnaryExpression;
            expect(expr.operator).toBe('-');
            expect((expr.operand as XPathNumberLiteral).value).toBe(5);
        });

        it('should respect operator precedence', () => {
            const ast = parse('1 + 2 * 3');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            const expr = ast as XPathArithmeticExpression;
            expect(expr.operator).toBe('+');
            expect((expr.left as XPathNumberLiteral).value).toBe(1);
            expect(expr.right).toBeInstanceOf(XPathArithmeticExpression);
            expect((expr.right as XPathArithmeticExpression).operator).toBe('*');
        });
    });

    describe('Comparison Expressions', () => {
        it('should parse equality', () => {
            const ast = parse('1 = 1');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('=');
        });

        it('should parse inequality', () => {
            const ast = parse('1 != 2');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('!=');
        });

        it('should parse less than', () => {
            const ast = parse('1 < 2');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('<');
        });

        it('should parse greater than', () => {
            const ast = parse('2 > 1');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('>');
        });

        it('should parse less than or equal', () => {
            const ast = parse('1 <= 2');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('<=');
        });

        it('should parse greater than or equal', () => {
            const ast = parse('2 >= 1');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('>=');
        });
    });

    describe('Logical Expressions', () => {
        it('should parse and', () => {
            const ast = parse('1 = 1 and 2 = 2');
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
            expect((ast as XPathLogicalExpression).operator).toBe('and');
        });

        it('should parse or', () => {
            const ast = parse('1 = 2 or 2 = 2');
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
            expect((ast as XPathLogicalExpression).operator).toBe('or');
        });

        it('should respect and/or precedence', () => {
            const ast = parse('1 = 1 or 2 = 2 and 3 = 3');
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
            const expr = ast as XPathLogicalExpression;
            expect(expr.operator).toBe('or');
            expect(expr.right).toBeInstanceOf(XPathLogicalExpression);
            expect((expr.right as XPathLogicalExpression).operator).toBe('and');
        });
    });

    describe('Function Calls', () => {
        it('should parse function with no arguments', () => {
            const ast = parse('true()');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            const func = ast as XPathFunctionCall;
            expect(func.name).toBe('true');
            expect(func.args).toHaveLength(0);
        });

        it('should parse function with one argument', () => {
            const ast = parse("string-length('hello')");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            const func = ast as XPathFunctionCall;
            expect(func.name).toBe('string-length');
            expect(func.args).toHaveLength(1);
        });

        it('should parse function with multiple arguments', () => {
            const ast = parse("concat('a', 'b', 'c')");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            const func = ast as XPathFunctionCall;
            expect(func.name).toBe('concat');
            expect(func.args).toHaveLength(3);
        });

        it('should parse nested function calls', () => {
            const ast = parse("string-length(concat('a', 'b'))");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            const outer = ast as XPathFunctionCall;
            expect(outer.name).toBe('string-length');
            expect(outer.args[0]).toBeInstanceOf(XPathFunctionCall);
            expect((outer.args[0] as XPathFunctionCall).name).toBe('concat');
        });
    });

    describe('Location Paths', () => {
        it('should parse simple element name', () => {
            const ast = parse('book');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.absolute).toBe(false);
            expect(path.steps).toHaveLength(1);
            expect(path.steps[0].axis).toBe('child');
            expect(path.steps[0].nodeTest.name).toBe('book');
        });

        it('should parse absolute path', () => {
            const ast = parse('/root');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.absolute).toBe(true);
            expect(path.steps).toHaveLength(1);
        });

        it('should parse root only', () => {
            const ast = parse('/');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.absolute).toBe(true);
            expect(path.steps).toHaveLength(0);
        });

        it('should parse multi-step path', () => {
            const ast = parse('/root/child/grandchild');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.absolute).toBe(true);
            expect(path.steps).toHaveLength(3);
        });

        it('should parse descendant shorthand //', () => {
            const ast = parse('//element');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.absolute).toBe(true);
            expect(path.steps).toHaveLength(2);
            expect(path.steps[0].axis).toBe('descendant-or-self');
            expect(path.steps[1].nodeTest.name).toBe('element');
        });

        it('should parse attribute axis with @', () => {
            const ast = parse('@id');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('attribute');
            expect(path.steps[0].nodeTest.name).toBe('id');
        });

        it('should parse wildcard', () => {
            const ast = parse('*');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('wildcard');
        });

        it('should parse self axis abbreviation .', () => {
            const ast = parse('.');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('self');
        });

        it('should parse parent axis abbreviation ..', () => {
            const ast = parse('..');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('parent');
        });

        it('should parse explicit axis', () => {
            const ast = parse('child::element');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('child');
        });

        it('should parse descendant axis', () => {
            const ast = parse('descendant::element');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('descendant');
        });

        it('should parse node type test', () => {
            const ast = parse('text()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('node-type');
            expect(path.steps[0].nodeTest.nodeType).toBe('text');
        });
    });

    describe('Predicates', () => {
        it('should parse position predicate', () => {
            const ast = parse('item[1]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].predicates).toHaveLength(1);
        });

        it('should parse attribute predicate', () => {
            const ast = parse("book[@id='123']");
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].predicates).toHaveLength(1);
        });

        it('should parse multiple predicates', () => {
            const ast = parse('item[1][@type]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].predicates).toHaveLength(2);
        });

        it('should parse complex predicate expression', () => {
            const ast = parse('item[position() > 1 and position() < 5]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });
    });

    describe('Union Expressions', () => {
        it('should parse union of two paths', () => {
            const ast = parse('book | article');
            expect(ast).toBeInstanceOf(XPathUnionExpression);
            const union = ast as XPathUnionExpression;
            expect(union.left).toBeInstanceOf(XPathLocationPath);
            expect(union.right).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse union of multiple paths', () => {
            const ast = parse('a | b | c');
            expect(ast).toBeInstanceOf(XPathUnionExpression);
        });
    });

    describe('Parenthesized Expressions', () => {
        it('should parse parenthesized expression', () => {
            const ast = parse('(1 + 2) * 3');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            const expr = ast as XPathArithmeticExpression;
            expect(expr.operator).toBe('*');
            expect(expr.left).toBeInstanceOf(XPathArithmeticExpression);
        });
    });

    describe('Complex Expressions', () => {
        it('should parse //book[@price > 10]/title', () => {
            const ast = parse('//book[@price > 10]/title');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse /root/element[position() = last()]', () => {
            const ast = parse('/root/element[position() = last()]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it("should parse //item[@category='books' or @category='music']", () => {
            const ast = parse("//item[@category='books' or @category='music']");
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse count(//book) > 5', () => {
            const ast = parse('count(//book) > 5');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            const expr = ast as XPathBinaryExpression;
            expect(expr.left).toBeInstanceOf(XPathFunctionCall);
        });
    });
});
