import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser';

// Helper to parse and evaluate an XPath expression
function parseXPath(xpath: string) {
    const lexer = new XPathLexer('3.1');
    const tokens = lexer.scan(xpath);
    const parser = new XPath31Parser();
    return parser.parse(tokens);
}

describe('Function type tests', () => {
    it('treats map as function(*)', () => {
        const expr = parseXPath('map { "a": 1 } instance of function(*)');
        const result = expr.evaluate({});
        expect(result).toBe(true);
    });

    it('treats array as function(*)', () => {
        const expr = parseXPath('[1, 2, 3] instance of function(*)');
        const result = expr.evaluate({});
        expect(result).toBe(true);
    });

    it('matches inline function with function(*)', () => {
        const expr = parseXPath('(function($x) { $x }) instance of function(*)');
        const result = expr.evaluate({});
        expect(result).toBe(true);
    });

    it('rejects non-function values for function(*)', () => {
        const expr = parseXPath('"not a function" instance of function(*)');
        const result = expr.evaluate({});
        expect(result).toBe(false);
    });

    it('checks arity when parameter types are provided', () => {
        const matchesTyped = parseXPath(
            '(function($x as xs:integer) { $x }) instance of function(xs:integer)'
        );
        expect(matchesTyped.evaluate({})).toBe(true);

        const mismatched = parseXPath(
            '(function($x) { $x }) instance of function(xs:integer, xs:integer)'
        );
        expect(mismatched.evaluate({})).toBe(false);
    });
});
