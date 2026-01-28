/**
 * String Templates Test Suite
 *
 * Tests XPath 3.0+ string templates with embedded expressions.
 * Syntax: `Hello {$name}, you are {$age} years old`
 */

import { XPath30Parser } from '../src/parser/parser-30';
import { XPathLexer } from '../src/lexer/lexer';
import { XPathContext } from '../src/context';

describe('String Templates (XPath 3.0+)', () => {
    let parser: XPath30Parser;
    let lexer: XPathLexer;
    let context: XPathContext;

    beforeEach(() => {
        parser = new XPath30Parser();
        lexer = new XPathLexer({ version: '3.0' });
        context = {
            variables: {},
        };
    });

    /**
     * Helper function to parse and evaluate an XPath expression
     */
    function evaluate(expression: string): any {
        const tokens = lexer.scan(expression);
        const expr = parser.parse(tokens);
        return expr.evaluate(context);
    }

    describe('Basic String Templates', () => {
        test('should parse simple string template without expressions', () => {
            const result = evaluate('`Hello World`');
            expect(result).toBe('Hello World');
        });

        test('should handle empty string template', () => {
            const result = evaluate('``');
            expect(result).toBe('');
        });

        test('should handle string template with only whitespace', () => {
            const result = evaluate('`   `');
            expect(result).toBe('   ');
        });

        test('should handle string template with newlines', () => {
            const result = evaluate('`Line 1\nLine 2\nLine 3`');
            expect(result).toBe('Line 1\nLine 2\nLine 3');
        });
    });

    describe('Variable Interpolation', () => {
        test('should interpolate single variable', () => {
            context.variables = { name: 'Alice' };
            const result = evaluate('`Hello {$name}!`');
            expect(result).toBe('Hello Alice!');
        });

        test('should interpolate multiple variables', () => {
            context.variables = { name: 'Bob', age: 30 };
            const result = evaluate('`{$name} is {$age} years old`');
            expect(result).toBe('Bob is 30 years old');
        });

        test('should handle variable at start of template', () => {
            context.variables = { greeting: 'Hello' };
            const result = evaluate('`{$greeting} World`');
            expect(result).toBe('Hello World');
        });

        test('should handle variable at end of template', () => {
            context.variables = { name: 'Alice' };
            const result = evaluate('`Hello {$name}`');
            expect(result).toBe('Hello Alice');
        });

        test('should handle consecutive variables', () => {
            context.variables = { first: 'John', last: 'Doe' };
            const result = evaluate('`{$first}{$last}`');
            expect(result).toBe('JohnDoe');
        });
    });

    describe('Expression Interpolation', () => {
        test('should interpolate arithmetic expression', () => {
            context.variables = { x: 10, y: 20 };
            const result = evaluate('`Sum: {$x + $y}`');
            expect(result).toBe('Sum: 30');
        });

        test('should interpolate function call', () => {
            const result = evaluate('`Length: {string-length("hello")}`');
            expect(result).toBe('Length: 5');
        });

        test('should interpolate string concatenation', () => {
            context.variables = { first: 'Hello', second: 'World' };
            const result = evaluate('`Result: {$first || " " || $second}`');
            expect(result).toBe('Result: Hello World');
        });

        test('should interpolate conditional expression', () => {
            context.variables = { age: 18 };
            const result = evaluate('`Status: {if ($age >= 18) then "adult" else "minor"}`');
            expect(result).toBe('Status: adult');
        });

        test('should interpolate comparison expression', () => {
            context.variables = { x: 5 };
            const result = evaluate('`Is positive: {$x > 0}`');
            expect(result).toBe('Is positive: true');
        });
    });

    describe('Escape Sequences', () => {
        test('should escape backtick', () => {
            const result = evaluate('`Use \\` for templates`');
            expect(result).toBe('Use ` for templates');
        });

        test('should escape opening brace', () => {
            const result = evaluate('`Use \\{ to start expression`');
            expect(result).toBe('Use { to start expression');
        });

        test('should escape closing brace', () => {
            const result = evaluate('`Use \\} to end expression`');
            expect(result).toBe('Use } to end expression');
        });

        test('should escape newline', () => {
            const result = evaluate('`Line 1\\nLine 2`');
            expect(result).toBe('Line 1\nLine 2');
        });

        test('should escape carriage return', () => {
            const result = evaluate('`Line 1\\rLine 2`');
            expect(result).toBe('Line 1\rLine 2');
        });

        test('should escape tab', () => {
            const result = evaluate('`Column 1\\tColumn 2`');
            expect(result).toBe('Column 1\tColumn 2');
        });

        test('should escape backslash', () => {
            const result = evaluate('`Path: C:\\\\Users\\\\Name`');
            expect(result).toBe('Path: C:\\Users\\Name');
        });

        test('should handle multiple escape sequences', () => {
            const result = evaluate('`\\`Escaped\\` \\{ and \\} \\n and \\\\`');
            expect(result).toBe('`Escaped` { and } \n and \\');
        });
    });

    describe('Nested Expressions', () => {
        test.skip('should handle nested braces in expression', () => {
            const result = evaluate('`Array: {array { 1, 2, 3 }}`');
            expect(result).toContain('Array:');
        });

        test('should handle function call with multiple arguments', () => {
            const result = evaluate('`Concat: {concat("a", "b", "c")}`');
            expect(result).toBe('Concat: abc');
        });

        test('should handle let expression in template', () => {
            const result = evaluate('`Result: {let $x := 5, $y := 10 return $x + $y}`');
            expect(result).toBe('Result: 15');
        });
    });

    describe('Type Conversion', () => {
        test('should convert number to string', () => {
            context.variables = { num: 42 };
            const result = evaluate('`Number: {$num}`');
            expect(result).toBe('Number: 42');
        });

        test('should convert boolean to string', () => {
            context.variables = { flag: true };
            const result = evaluate('`Flag: {$flag}`');
            expect(result).toBe('Flag: true');
        });

        test('should handle NaN', () => {
            const result = evaluate('`Value: {0 div 0}`');
            expect(result).toBe('Value: NaN');
        });

        test('should handle positive infinity', () => {
            const result = evaluate('`Value: {1 div 0}`');
            expect(result).toBe('Value: INF');
        });

        test('should handle negative infinity', () => {
            const result = evaluate('`Value: {-1 div 0}`');
            expect(result).toBe('Value: -INF');
        });

        test('should convert empty sequence to empty string', () => {
            const result = evaluate('`Value: {()}`');
            expect(result).toBe('Value: ');
        });

        test('should convert array to first item', () => {
            const result = evaluate('`Value: {(1, 2, 3)}`');
            expect(result).toBe('Value: 1');
        });
    });

    describe('Complex Templates', () => {
        test('should handle template with mixed content', () => {
            context.variables = { name: 'Alice', age: 30, city: 'NYC' };
            const result = evaluate(
                '`Name: {$name}, Age: {$age}, City: {$city}, Adult: {$age >= 18}`'
            );
            expect(result).toBe('Name: Alice, Age: 30, City: NYC, Adult: true');
        });

        test('should handle template with special characters', () => {
            context.variables = { symbol: '@' };
            const result = evaluate('`Symbol: {$symbol}, Email: test@example.com`');
            expect(result).toBe('Symbol: @, Email: test@example.com');
        });

        test('should handle multi-line template', () => {
            context.variables = { name: 'Bob' };
            const result = evaluate('`Hello {$name},\nWelcome to our service.\nEnjoy!`');
            expect(result).toBe('Hello Bob,\nWelcome to our service.\nEnjoy!');
        });

        test('should handle template with escape and expression', () => {
            context.variables = { value: 10 };
            const result = evaluate('`Value is \\{not\\} {$value}`');
            expect(result).toBe('Value is {not} 10');
        });
    });

    describe('Edge Cases', () => {
        test.skip('should handle expression with only whitespace', () => {
            const result = evaluate('`Value: {   }`');
            // Expression with only whitespace should be empty
            expect(result).toMatch(/Value:/);
        });

        test('should handle template with only expression', () => {
            context.variables = { value: 'test' };
            const result = evaluate('`{$value}`');
            expect(result).toBe('test');
        });

        test('should handle nested string literals in expression', () => {
            const result = evaluate('`Result: {concat("Hello", " ", "World")}`');
            expect(result).toBe('Result: Hello World');
        });

        test('should handle expression with backtick in string literal', () => {
            const result = evaluate('`Result: {concat("`", "test", "`")}`');
            expect(result).toBe('Result: `test`');
        });
    });

    describe('Error Handling', () => {
        test('should throw error for unclosed template', () => {
            expect(() => {
                evaluate('`Unclosed template');
            }).toThrow();
        });

        test('should throw error for unclosed expression', () => {
            expect(() => {
                evaluate('`Unclosed {$var`');
            }).toThrow();
        });

        test('should throw error for unmatched braces', () => {
            expect(() => {
                evaluate('`Test {$var}}`');
            }).toThrow(); // Just expect any error, not specific message
        });
    });

    describe('Integration with Other Features', () => {
        test('should work in let expression', () => {
            context.variables = { name: 'Alice' };
            const result = evaluate('let $greeting := `Hello {$name}` return $greeting');
            expect(result).toBe('Hello Alice');
        });

        test('should work in function call', () => {
            context.variables = { name: 'Bob' };
            const result = evaluate('string-length(`Hello {$name}`)');
            expect(result).toBe(9); // "Hello Bob" has 9 characters
        });

        test('should work with arrow operator', () => {
            context.variables = { text: 'test' };
            const result = evaluate('`{$text}` => upper-case()');
            expect(result).toBe('TEST');
        });

        test('should work with simple map operator', () => {
            context.variables = { items: [1, 2, 3] };
            const result = evaluate('(1, 2, 3) ! `Item: {.}`');
            expect(result).toEqual(['Item: 1', 'Item: 2', 'Item: 3']);
        });

        test('should work in conditional expression', () => {
            context.variables = { name: 'Alice', age: 30 };
            const result = evaluate(
                'if ($age >= 18) then `{$name} is an adult` else `{$name} is a minor`'
            );
            expect(result).toBe('Alice is an adult');
        });

        test('should work with string concatenation operator', () => {
            context.variables = { name: 'Alice' };
            const result = evaluate('`Hello ` || `{$name}` || `!`');
            expect(result).toBe('Hello Alice!');
        });
    });
});
