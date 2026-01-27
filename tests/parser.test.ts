import { XPathLexer } from '../src/lexer';
import { XPath10Parser } from '../src/parser';
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
    const parser = new XPath10Parser();

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

        it('should parse empty string literals', () => {
            const ast = parse("''");
            expect(ast).toBeInstanceOf(XPathStringLiteral);
            expect((ast as XPathStringLiteral).value).toBe('');
        });

        it('should parse strings with special characters', () => {
            const ast = parse("'Hello World!'");
            expect(ast).toBeInstanceOf(XPathStringLiteral);
            expect((ast as XPathStringLiteral).value).toBe('Hello World!');
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

        it('should parse numbers starting with decimal point', () => {
            const ast = parse('.5');
            expect(ast).toBeInstanceOf(XPathNumberLiteral);
            expect((ast as XPathNumberLiteral).value).toBe(0.5);
        });

        it('should parse single digit numbers', () => {
            const ast = parse('4');
            expect(ast).toBeInstanceOf(XPathNumberLiteral);
            expect((ast as XPathNumberLiteral).value).toBe(4);
        });
    });

    describe('Variable References', () => {
        it('should parse variable reference', () => {
            const ast = parse('$myVar');
            expect(ast).toBeInstanceOf(XPathVariableReference);
            expect((ast as XPathVariableReference).name).toBe('myVar');
        });

        it('should parse variable reference with underscores', () => {
            const ast = parse('$my_var');
            expect(ast).toBeInstanceOf(XPathVariableReference);
            expect((ast as XPathVariableReference).name).toBe('my_var');
        });

        it('should parse variable reference with numbers', () => {
            const ast = parse('$var123');
            expect(ast).toBeInstanceOf(XPathVariableReference);
            expect((ast as XPathVariableReference).name).toBe('var123');
        });

        it('should parse simple variable reference', () => {
            const ast = parse('$x');
            expect(ast).toBeInstanceOf(XPathVariableReference);
            expect((ast as XPathVariableReference).name).toBe('x');
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

        it('should parse unary minus on decimal', () => {
            const ast = parse('-3.1415');
            expect(ast).toBeInstanceOf(XPathUnaryExpression);
            const expr = ast as XPathUnaryExpression;
            expect(expr.operator).toBe('-');
            expect((expr.operand as XPathNumberLiteral).value).toBe(3.1415);
        });

        it('should parse multiple unary minus operators', () => {
            const ast = parse('--5');
            expect(ast).toBeInstanceOf(XPathUnaryExpression);
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

        it('should parse complex arithmetic with multiple operators', () => {
            const ast = parse('10 div 2 + 1');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
        });

        it('should parse modulo in expressions', () => {
            const ast = parse('-5 mod -2');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            expect((ast as XPathArithmeticExpression).operator).toBe('mod');
        });

        it('should parse arithmetic with variables', () => {
            const ast = parse('$i + 1');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            const expr = ast as XPathArithmeticExpression;
            expect(expr.left).toBeInstanceOf(XPathVariableReference);
        });

        it('should parse subtraction with variables', () => {
            const ast = parse('$r - 0');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
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

        it('should parse string equality', () => {
            const ast = parse("'hello' = 'hello'");
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('=');
        });

        it('should parse variable comparison', () => {
            const ast = parse("$page = 'from'");
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
            expect((ast as XPathBinaryExpression).operator).toBe('=');
        });

        it('should parse multiple comparisons', () => {
            const ast = parse('$i > $page and $i < $page + $range');
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
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

        it('should parse complex logical expressions with variables', () => {
            const ast = parse("$page != 'to' and $page != 'from'");
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
        });

        it('should parse negation in logical expressions', () => {
            const ast = parse("not($form = 'from')");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            const func = ast as XPathFunctionCall;
            expect(func.name).toBe('not');
        });

        it('should parse multiple or conditions', () => {
            const ast = parse("$page = 'from' or $page = 'to'");
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
            expect((ast as XPathLogicalExpression).operator).toBe('or');
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

        it('should parse false() function', () => {
            const ast = parse('false()');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('false');
        });

        it('should parse position() function', () => {
            const ast = parse('position()');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('position');
        });

        it('should parse last() function', () => {
            const ast = parse('last()');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('last');
        });

        it('should parse count() function', () => {
            const ast = parse('count(//element)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('count');
        });

        it('should parse contains() function', () => {
            const ast = parse("contains('1234567890','9')");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('contains');
            expect((ast as XPathFunctionCall).args).toHaveLength(2);
        });

        it('should parse substring() function', () => {
            const ast = parse("substring('12345', 0, 3)");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('substring');
            expect((ast as XPathFunctionCall).args).toHaveLength(3);
        });

        it('should parse substring-before() function', () => {
            const ast = parse('substring-before($str, $c)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('substring-before');
        });

        it('should parse substring-after() function', () => {
            const ast = parse("substring-after(icon/@image, '/mapfiles/marker')");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('substring-after');
        });

        it('should parse normalize-space() function', () => {
            const ast = parse("normalize-space('  text  ')");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('normalize-space');
        });

        it('should parse number() function', () => {
            const ast = parse('number(../@items)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('number');
        });

        it('should parse string() function', () => {
            const ast = parse('string(../@daddr)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
            expect((ast as XPathFunctionCall).name).toBe('string');
        });

        it('should parse function in arithmetic expression', () => {
            const ast = parse('position() - 1');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
            expect((ast as XPathArithmeticExpression).operator).toBe('-');
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

        it('should parse following-sibling axis', () => {
            const ast = parse('following-sibling::chapter');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('following-sibling');
        });

        it('should parse preceding-sibling axis', () => {
            const ast = parse('preceding-sibling::chapter');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('preceding-sibling');
        });

        it('should parse following axis', () => {
            const ast = parse('following::element');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('following');
        });

        it('should parse preceding axis', () => {
            const ast = parse('preceding::element');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('preceding');
        });

        it('should parse attribute axis with explicit axis', () => {
            const ast = parse('attribute::name');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('attribute');
        });

        it('should parse attribute wildcard', () => {
            const ast = parse('attribute::*');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].axis).toBe('attribute');
            expect(path.steps[0].nodeTest.type).toBe('wildcard');
        });

        it('should parse node type test', () => {
            const ast = parse('text()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('node-type');
            expect(path.steps[0].nodeTest.nodeType).toBe('text');
        });

        it('should parse node() function', () => {
            const ast = parse('node()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps[0].nodeTest.type).toBe('node-type');
            expect(path.steps[0].nodeTest.nodeType).toBe('node');
        });

        it('should parse processing-instruction() node test', () => {
            const ast = parse('processing-instruction()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse comment() node test', () => {
            const ast = parse('comment()');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse relative path with multiple steps', () => {
            const ast = parse('child::para/child::*');
            expect(ast).toBeInstanceOf(XPathLocationPath);
            const path = ast as XPathLocationPath;
            expect(path.steps.length).toBeGreaterThan(1);
        });

        it('should parse path with parent navigation', () => {
            const ast = parse('../@arg0');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse attribute path', () => {
            const ast = parse('/page/@filterpng');
            expect(ast).toBeInstanceOf(XPathLocationPath);
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

        it('should parse predicate with position equals', () => {
            const ast = parse('child::para[position()=1]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse predicate with last function', () => {
            const ast = parse('child::para[position()=last()]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse predicate with last minus offset', () => {
            const ast = parse('child::para[position()=last()-1]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse predicate with comparison', () => {
            const ast = parse("child::para[attribute::type='warning']");
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse predicate with logical operators', () => {
            const ast = parse("child::para[attribute::type='warning'][position()=5]");
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse predicate with child element', () => {
            const ast = parse("child::chapter[child::title='Introduction']");
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse predicate with existence check', () => {
            const ast = parse('child::chapter[child::title]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse predicate with or expression', () => {
            const ast = parse('child::*[self::chapter or self::appendix]');
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

        it('should parse union with @ notation', () => {
            const ast = parse('@*|node()');
            expect(ast).toBeInstanceOf(XPathUnionExpression);
        });

        it('should parse union of absolute paths', () => {
            const ast = parse('//title | //link');
            expect(ast).toBeInstanceOf(XPathUnionExpression);
        });

        it('should parse union in location path', () => {
            const ast = parse('source|destination');
            expect(ast).toBeInstanceOf(XPathUnionExpression);
        });

        it('should parse union with text nodes', () => {
            const ast = parse('@*|text()');
            expect(ast).toBeInstanceOf(XPathUnionExpression);
        });

        it('should parse union with wildcard and root', () => {
            const ast = parse('*|/');
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

        it('should parse parenthesized predicate', () => {
            const ast = parse('//a[(@foo or position()=2)]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse nested parentheses', () => {
            const ast = parse('((1 + 2) * 3)');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
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

        it('should parse /descendant::para', () => {
            const ast = parse('/descendant::para');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it("should parse substring('12345', 0, 3)", () => {
            const ast = parse("substring('12345', 0, 3)");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it('should parse //*[@about]', () => {
            const ast = parse('//*[@about]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse count(descendant::*)', () => {
            const ast = parse('count(descendant::*)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it('should parse count(descendant::*) + count(ancestor::*)', () => {
            const ast = parse('count(descendant::*) + count(ancestor::*)');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
        });

        it("should parse concat(substring-before(@image,'marker'),'icon',substring-after(@image,'marker'))", () => {
            const ast = parse(
                "concat(substring-before(@image,'marker'),'icon',substring-after(@image,'marker'))"
            );
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it("should parse location[@id!='near']", () => {
            const ast = parse("location[@id!='near']");
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse location[position() > $numlocations div 2]', () => {
            const ast = parse('location[position() > $numlocations div 2]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse complex string comparison', () => {
            const ast = parse("string(page/request/canonicalnear) != ''");
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
        });

        it('should parse arithmetic on attributes', () => {
            const ast = parse('@start div @num + 1');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
        });

        it('should parse string-length with variable', () => {
            const ast = parse('string-length($address) > $linewidth');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
        });

        it('should parse complex path with multiple predicates', () => {
            const ast = parse('//a[position() > 1][position() < 5]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse reviews expression', () => {
            const ast = parse('reviews/@positive div (reviews/@positive + reviews/@negative) * 5');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
        });
    });

    describe('Additional XPath Expressions', () => {
        it('should parse @*', () => {
            const ast = parse('@*');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse segment/@time', () => {
            const ast = parse('segments/@time');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse info/distance', () => {
            const ast = parse('info/distance');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse info/distance and info/phone and $near-point', () => {
            const ast = parse('info/distance and info/phone and $near-point');
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
        });

        it('should parse info/distance or info/phone', () => {
            const ast = parse('info/distance or info/phone');
            expect(ast).toBeInstanceOf(XPathLogicalExpression);
        });

        it("should parse boolean(location[@id='near'][icon/@image])", () => {
            const ast = parse("boolean(location[@id='near'][icon/@image])");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it('should parse reviews/@positive div (reviews/@positive + reviews/@negative) * (5)', () => {
            const ast = parse(
                'reviews/@positive div (reviews/@positive + reviews/@negative) * (5)'
            );
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
        });

        it('should parse @meters > 16093', () => {
            const ast = parse('@meters > 16093');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
        });

        it('should parse position() != last()', () => {
            const ast = parse('position() != last()');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
        });

        it('should parse position() != 1', () => {
            const ast = parse('position() != 1');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
        });

        it('should parse not(../@page)', () => {
            const ast = parse('not(../@page)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it('should parse not(structured/source)', () => {
            const ast = parse('not(structured/source)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it("should parse icon/@class != 'noicon'", () => {
            const ast = parse("icon/@class != 'noicon'");
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
        });

        it('should parse structured/@total - $details', () => {
            const ast = parse('structured/@total - $details');
            expect(ast).toBeInstanceOf(XPathArithmeticExpression);
        });

        it('should parse page/ads', () => {
            const ast = parse('page/ads');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse $address=string(/page/user/defaultlocation)', () => {
            const ast = parse('$address=string(/page/user/defaultlocation)');
            expect(ast).toBeInstanceOf(XPathBinaryExpression);
        });

        it('should parse substring($address, 1, $linewidth - 3)', () => {
            const ast = parse('substring($address, 1, $linewidth - 3)');
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it('should parse matches function', () => {
            const ast = parse("matches('ajaxslt', 'xsl')");
            expect(ast).toBeInstanceOf(XPathFunctionCall);
        });

        it('should parse following::element', () => {
            const ast = parse('following::element');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse preceding::element', () => {
            const ast = parse('preceding::element');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse child::chapter/descendant::para', () => {
            const ast = parse('child::chapter/descendant::para');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse child::*/child::para', () => {
            const ast = parse('child::*/child::para');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse self::para', () => {
            const ast = parse('self::para');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse /descendant::olist/child::item', () => {
            const ast = parse('/descendant::olist/child::item');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });

        it('should parse /descendant::figure[position()=42]', () => {
            const ast = parse('/descendant::figure[position()=42]');
            expect(ast).toBeInstanceOf(XPathLocationPath);
        });
    });
});
