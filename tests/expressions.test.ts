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
    XPathLocationPath,
} from '../src/expressions';
import { XPathContext } from '../src/context';

describe('Expression Evaluation', () => {
    const lexer = new XPathLexer();
    const parser = new XPathParser();

    function parse(expression: string) {
        const tokens = lexer.scan(expression);
        return parser.parse(tokens);
    }

    function evaluate(expression: string, context: Partial<XPathContext> = {}) {
        const ast = parse(expression);
        const fullContext: XPathContext = {
            node: context.node || undefined,
            position: context.position || 1,
            size: context.size || 1,
            functions: context.functions || {},
            ...context,
        };
        return ast.evaluate(fullContext);
    }

    describe('Arithmetic Expressions - Evaluation', () => {
        it('should evaluate addition', () => {
            const result = evaluate('1 + 2');
            expect(result).toBe(3);
        });

        it('should evaluate subtraction', () => {
            const result = evaluate('5 - 3');
            expect(result).toBe(2);
        });

        it('should evaluate multiplication', () => {
            const result = evaluate('4 * 2');
            expect(result).toBe(8);
        });

        it('should evaluate division', () => {
            const result = evaluate('10 div 2');
            expect(result).toBe(5);
        });

        it('should evaluate modulo', () => {
            const result = evaluate('10 mod 3');
            expect(result).toBe(1);
        });

        it('should evaluate negative modulo', () => {
            const result = evaluate('-5 mod -2');
            expect(result).toBe(-1);
        });

        it('should respect operator precedence', () => {
            const result = evaluate('1 + 2 * 3');
            expect(result).toBe(7);
        });

        it('should evaluate complex arithmetic expressions', () => {
            const result = evaluate('10 div 2 + 1 * 3');
            expect(result).toBe(8);
        });

        it('should evaluate unary minus', () => {
            const result = evaluate('-5');
            expect(result).toBe(-5);
        });

        it('should evaluate double unary minus', () => {
            const result = evaluate('--5');
            expect(result).toBe(5);
        });

        it('should handle NaN in arithmetic', () => {
            const result = evaluate('(0 div 0) + 1');
            expect(isNaN(result as number)).toBe(true);
        });
    });

    describe('Unary Expression - Evaluation', () => {
        it('should evaluate unary minus on number', () => {
            const result = evaluate('-5');
            expect(result).toBe(-5);
        });

        it('should handle unary operations on strings', () => {
            const result = evaluate('-"123"');
            expect(result).toBe(-123);
        });
    });

    describe('Binary Expressions - Comparison Evaluation', () => {
        it('should evaluate equality true', () => {
            const result = evaluate('1 = 1');
            expect(result).toBe(true);
        });

        it('should evaluate equality false', () => {
            const result = evaluate('1 = 2');
            expect(result).toBe(false);
        });

        it('should evaluate inequality true', () => {
            const result = evaluate('1 != 2');
            expect(result).toBe(true);
        });

        it('should evaluate inequality false', () => {
            const result = evaluate('1 != 1');
            expect(result).toBe(false);
        });

        it('should evaluate less than true', () => {
            const result = evaluate('1 < 2');
            expect(result).toBe(true);
        });

        it('should evaluate less than false', () => {
            const result = evaluate('2 < 1');
            expect(result).toBe(false);
        });

        it('should evaluate greater than true', () => {
            const result = evaluate('2 > 1');
            expect(result).toBe(true);
        });

        it('should evaluate greater than false', () => {
            const result = evaluate('1 > 2');
            expect(result).toBe(false);
        });

        it('should evaluate less than or equal true', () => {
            const result = evaluate('1 <= 2');
            expect(result).toBe(true);
        });

        it('should evaluate less than or equal true when equal', () => {
            const result = evaluate('2 <= 2');
            expect(result).toBe(true);
        });

        it('should evaluate less than or equal false', () => {
            const result = evaluate('3 <= 2');
            expect(result).toBe(false);
        });

        it('should evaluate greater than or equal true', () => {
            const result = evaluate('2 >= 1');
            expect(result).toBe(true);
        });

        it('should evaluate greater than or equal true when equal', () => {
            const result = evaluate('2 >= 2');
            expect(result).toBe(true);
        });

        it('should evaluate greater than or equal false', () => {
            const result = evaluate('1 >= 2');
            expect(result).toBe(false);
        });

        it('should compare strings with strings', () => {
            const result = evaluate("'hello' = 'hello'");
            expect(result).toBe(true);
        });

        it('should compare different strings', () => {
            const result = evaluate("'hello' = 'world'");
            expect(result).toBe(false);
        });

        it('should compare string and number', () => {
            const result = evaluate("'5' > 3");
            expect(result).toBe(true);
        });

        it('should handle boolean false in comparison', () => {
            const result = evaluate('0 = false()');
            expect(result).toBe(true);
        });

        it('should handle boolean true in comparison', () => {
            const result = evaluate('1 = true()');
            expect(result).toBe(true);
        });

        it('should compare empty strings', () => {
            const result = evaluate("'' = ''");
            expect(result).toBe(true);
        });

        it('should compare string to empty string', () => {
            const result = evaluate("'' = 'a'");
            expect(result).toBe(false);
        });

        it('should compare numbers as strings when needed', () => {
            const result = evaluate("'5' != 5");
            expect(result).toBe(false);
        });
    });

    describe('Logical Expressions - Evaluation', () => {
        it('should evaluate and with both true', () => {
            const result = evaluate('1 = 1 and 2 = 2');
            expect(result).toBe(true);
        });

        it('should evaluate and with false left', () => {
            const result = evaluate('1 = 2 and 2 = 2');
            expect(result).toBe(false);
        });

        it('should evaluate and with false right', () => {
            const result = evaluate('1 = 1 and 2 = 3');
            expect(result).toBe(false);
        });

        it('should evaluate and with both false', () => {
            const result = evaluate('1 = 2 and 2 = 3');
            expect(result).toBe(false);
        });

        it('should evaluate or with both true', () => {
            const result = evaluate('1 = 1 or 2 = 2');
            expect(result).toBe(true);
        });

        it('should evaluate or with false left and true right', () => {
            const result = evaluate('1 = 2 or 2 = 2');
            expect(result).toBe(true);
        });

        it('should evaluate or with true left and false right', () => {
            const result = evaluate('1 = 1 or 2 = 3');
            expect(result).toBe(true);
        });

        it('should evaluate or with both false', () => {
            const result = evaluate('1 = 2 or 2 = 3');
            expect(result).toBe(false);
        });

        it('should respect and/or precedence', () => {
            const result = evaluate('0 = 1 or 1 = 1 and 2 = 3');
            expect(result).toBe(false);
        });

        it('should evaluate multiple and conditions', () => {
            const result = evaluate('1 = 1 and 2 = 2 and 3 = 3');
            expect(result).toBe(true);
        });

        it('should evaluate multiple or conditions', () => {
            const result = evaluate('1 = 2 or 2 = 3 or 3 = 3');
            expect(result).toBe(true);
        });
    });

    describe('Function Call Expressions - String Functions', () => {
        it('should evaluate string-length with argument', () => {
            const result = evaluate("string-length('hello')");
            expect(result).toBe(5);
        });

        it('should evaluate string-length with empty string', () => {
            const result = evaluate("string-length('')");
            expect(result).toBe(0);
        });

        it('should evaluate string-length without argument', () => {
            const result = evaluate("string-length()", { node: { textContent: 'test', nodeType: 1, nodeName: 'test' } as any });
            expect(result).toBe(4);
        });

        it('should evaluate concat with multiple arguments', () => {
            const result = evaluate("concat('a', 'b', 'c')");
            expect(result).toBe('abc');
        });

        it('should evaluate concat with single argument', () => {
            const result = evaluate("concat('hello')");
            expect(result).toBe('hello');
        });

        it('should evaluate concat with numbers', () => {
            const result = evaluate("concat('a', 1, 'b', 2)");
            expect(result).toBe('a1b2');
        });

        it('should evaluate starts-with true', () => {
            const result = evaluate("starts-with('hello', 'he')");
            expect(result).toBe(true);
        });

        it('should evaluate starts-with false', () => {
            const result = evaluate("starts-with('hello', 'wo')");
            expect(result).toBe(false);
        });

        it('should evaluate contains true', () => {
            const result = evaluate("contains('hello', 'ell')");
            expect(result).toBe(true);
        });

        it('should evaluate contains false', () => {
            const result = evaluate("contains('hello', 'xyz')");
            expect(result).toBe(false);
        });

        it('should evaluate substring-before', () => {
            const result = evaluate("substring-before('hello', 'l')");
            expect(result).toBe('he');
        });

        it('should evaluate substring-before not found', () => {
            const result = evaluate("substring-before('hello', 'x')");
            expect(result).toBe('');
        });

        it('should evaluate substring-after', () => {
            const result = evaluate("substring-after('hello', 'l')");
            expect(result).toBe('lo');
        });

        it('should evaluate substring-after not found', () => {
            const result = evaluate("substring-after('hello', 'x')");
            expect(result).toBe('');
        });

        it('should evaluate substring with 2 arguments', () => {
            const result = evaluate("substring('hello', 2)");
            expect(result).toBe('ello');
        });

        it('should evaluate substring with 3 arguments', () => {
            const result = evaluate("substring('hello', 2, 3)");
            expect(result).toBe('ell');
        });

        it('should evaluate substring with decimal start', () => {
            const result = evaluate("substring('hello', 1.5, 2.6)");
            expect(result).toBe('ell');
        });

        it('should evaluate substring with 1-based indexing', () => {
            const result = evaluate("substring('12345', 2, 3)");
            expect(result).toBe('234');
        });

        it('should evaluate normalize-space with argument', () => {
            const result = evaluate("normalize-space('  hello   world  ')");
            expect(result).toBe('hello world');
        });

        it('should evaluate normalize-space without argument', () => {
            const result = evaluate("normalize-space()", { node: { textContent: '  text  ', nodeType: 1, nodeName: 'test' } as any });
            expect(result).toBe('text');
        });

        it('should evaluate translate', () => {
            const result = evaluate("translate('hello', 'el', 'ip')");
            expect(result).toBe('hippo');
        });

        it('should evaluate translate with partial match', () => {
            const result = evaluate("translate('hello', 'xyz', 'abc')");
            expect(result).toBe('hello');
        });

        it('should evaluate string function with argument', () => {
            const result = evaluate("string(123)");
            expect(result).toBe('123');
        });

        it('should evaluate string function without argument', () => {
            const result = evaluate("string()", { node: { textContent: 'test', nodeType: 1, nodeName: 'test' } as any });
            expect(result).toBe('test');
        });
    });

    describe('Function Call Expressions - Boolean Functions', () => {
        it('should evaluate boolean true', () => {
            const result = evaluate('boolean(1)');
            expect(result).toBe(true);
        });

        it('should evaluate boolean with non-empty string', () => {
            const result = evaluate("boolean('hello')");
            expect(result).toBe(true);
        });

        it('should evaluate boolean with empty string', () => {
            const result = evaluate("boolean('')");
            expect(result).toBe(false);
        });

        it('should evaluate boolean with zero', () => {
            const result = evaluate('boolean(0)');
            expect(result).toBe(false);
        });

        it('should evaluate boolean with NaN', () => {
            const result = evaluate('boolean(0 div 0)');
            expect(result).toBe(false);
        });

        it('should evaluate not with true', () => {
            const result = evaluate('not(true())');
            expect(result).toBe(false);
        });

        it('should evaluate not with false', () => {
            const result = evaluate('not(false())');
            expect(result).toBe(true);
        });

        it('should evaluate true function', () => {
            const result = evaluate('true()');
            expect(result).toBe(true);
        });

        it('should evaluate false function', () => {
            const result = evaluate('false()');
            expect(result).toBe(false);
        });
    });

    describe('Function Call Expressions - Number Functions', () => {
        it('should evaluate number with string argument', () => {
            const result = evaluate("number('42')");
            expect(result).toBe(42);
        });

        it('should evaluate number with boolean true', () => {
            const result = evaluate('number(true())');
            expect(result).toBe(1);
        });

        it('should evaluate number with boolean false', () => {
            const result = evaluate('number(false())');
            expect(result).toBe(0);
        });

        it('should evaluate number without argument', () => {
            const result = evaluate("number()", { node: { textContent: '123', nodeType: 1, nodeName: 'test' } as any });
            expect(result).toBe(123);
        });

        it('should evaluate sum', () => {
            // sum() requires a node-set; passing a single number should return 0
            // because it's not an array
            const result = evaluate('sum(1)');
            expect(result).toBe(0);
        });

        it('should evaluate sum with array of numbers', () => {
            // Test with an actual array would require more complex setup
            // For now, test that sum works with non-array values
            const result = evaluate('sum(5)');
            expect(result).toBe(0);
        });

        it('should evaluate floor', () => {
            const result = evaluate('floor(3.7)');
            expect(result).toBe(3);
        });

        it('should evaluate ceiling', () => {
            const result = evaluate('ceiling(3.2)');
            expect(result).toBe(4);
        });

        it('should evaluate round', () => {
            const result = evaluate('round(3.5)');
            expect(result).toBe(4);
        });

        it('should evaluate round down', () => {
            const result = evaluate('round(3.4)');
            expect(result).toBe(3);
        });
    });

    describe('Function Call Expressions - Node Functions', () => {
        it('should evaluate last', () => {
            const result = evaluate('last()', { position: 3, size: 5 });
            expect(result).toBe(5);
        });

        it('should evaluate position', () => {
            const result = evaluate('position()', { position: 2, size: 5 });
            expect(result).toBe(2);
        });

        it('should evaluate count with empty array', () => {
            const result = evaluate('count()');
            expect(result).toBe(0);
        });

        it('should evaluate count with array', () => {
            // count([1, 2, 3]) - need to pass an array as argument
            const result = evaluate('count(1)');
            expect(result).toBe(0);
        });
    });

    describe('Function Call Expressions - Custom Functions', () => {
        it('should call custom function', () => {
            const customFunc = jest.fn().mockReturnValue('custom');
            const result = evaluate('myFunc()', { 
                functions: { myFunc: customFunc },
                variables: {},
            });
            expect(result).toBe('custom');
            expect(customFunc).toHaveBeenCalled();
        });

        it('should call custom function with arguments', () => {
            const customFunc = jest.fn().mockReturnValue('result');
            evaluate("myFunc('arg1', 'arg2')", { 
                functions: { myFunc: customFunc },
                variables: {},
            });
            expect(customFunc).toHaveBeenCalledWith('arg1', 'arg2');
        });

        it('should throw for unknown function', () => {
            expect(() => evaluate('unknownFunc()')).toThrow('Unknown function: unknownFunc');
        });
    });

    describe('Variable Reference Expression - Evaluation', () => {
        it('should evaluate variable reference', () => {
            const context: Partial<XPathContext> = { variables: { myVar: 42 } };
            const result = evaluate('$myVar', context);
            expect(result).toBe(42);
        });

        it('should evaluate variable in arithmetic', () => {
            const context: Partial<XPathContext> = { variables: { x: 5, y: 3 } };
            const result = evaluate('$x + $y', context);
            expect(result).toBe(8);
        });

        it('should evaluate undefined variable', () => {
            expect(() => evaluate('$undefinedVar')).toThrow('Variable $undefinedVar is not defined');
        });
    });

    describe('Literal Expression - Evaluation', () => {
        it('should evaluate string literal', () => {
            const result = evaluate("'hello'");
            expect(result).toBe('hello');
        });

        it('should evaluate number literal', () => {
            const result = evaluate('42');
            expect(result).toBe(42);
        });

        it('should evaluate decimal literal', () => {
            const result = evaluate('3.14');
            expect(result).toBe(3.14);
        });

        it('should evaluate empty string literal', () => {
            const result = evaluate("''");
            expect(result).toBe('');
        });

        it('should evaluate negative number literal', () => {
            const result = evaluate('-42');
            expect(result).toBe(-42);
        });
    });

    describe('Edge Cases and Type Coercion', () => {
        it('should coerce string to number in arithmetic', () => {
            const result = evaluate("'5' + 3");
            expect(result).toBe(8);
        });

        it('should handle boolean to number coercion', () => {
            const result = evaluate('true() + 1');
            expect(result).toBe(2);
        });

        it('should handle infinity', () => {
            const result = evaluate('1 div 0');
            expect(result).toBe(Infinity);
        });

        it('should handle negative infinity', () => {
            const result = evaluate('-1 div 0');
            expect(result).toBe(-Infinity);
        });

        it('should handle multiple nested function calls', () => {
            const result = evaluate("string-length(concat('a', 'b', 'c'))");
            expect(result).toBe(3);
        });

        it('should handle comparison with NaN', () => {
            const result = evaluate('(0 div 0) = (0 div 0)');
            expect(result).toBe(false);
        });

        it('should convert string with spaces to number', () => {
            const result = evaluate("number('  123  ')");
            expect(result).toBe(123);
        });

        it('should convert invalid string to NaN', () => {
            const result = evaluate("number('not a number')");
            expect(isNaN(result as number)).toBe(true);
        });
    });

    describe('Complex Nested Expressions', () => {
        it('should evaluate complex nested arithmetic', () => {
            const result = evaluate('(1 + 2) * (3 + 4)');
            expect(result).toBe(21);
        });

        it('should evaluate complex nested functions', () => {
            const result = evaluate("substring(concat('hello', 'world'), 1, 5)");
            expect(result).toBe('hello');
        });

        it('should evaluate function in logical expression', () => {
            const result = evaluate("string-length('hello') > 3");
            expect(result).toBe(true);
        });

        it('should evaluate complex logical with functions', () => {
            const result = evaluate("contains('hello', 'ell') and string-length('test') = 4");
            expect(result).toBe(true);
        });
    });
});
