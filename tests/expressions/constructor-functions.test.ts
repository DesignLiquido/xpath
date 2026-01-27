import { XPathContext } from '../../src/context';
import { XPathFunctionCall } from '../../src/expressions/function-call-expression';
import { XPathExpression } from '../../src/expressions/expression';
import { XPathLexer } from '../../src/lexer';
import { XPath20Parser } from '../../src/parser';

class LiteralExpression extends XPathExpression {
    constructor(private readonly value: any) {
        super();
    }
    evaluate(_ctx: XPathContext): any {
        return this.value;
    }
}

describe('XPath 2.0 Constructor Functions (Phase 4.5)', () => {
    const ctx: XPathContext = {};

    it('casts using QName constructor (direct expression)', () => {
        const expr = new XPathFunctionCall('xs:int', [new LiteralExpression('42')]);
        expect(expr.evaluate(ctx)).toBe(42);
    });

    it('throws on invalid value for constructor', () => {
        const expr = new XPathFunctionCall('xs:int', [new LiteralExpression('abc')]);
        expect(() => expr.evaluate(ctx)).toThrow('FORG0001');
    });

    it('throws on empty sequence input', () => {
        const expr = new XPathFunctionCall('xs:int', [new LiteralExpression([])]);
        expect(() => expr.evaluate(ctx)).toThrow('XPTY0004');
    });

    it('throws on multiple items', () => {
        const expr = new XPathFunctionCall('xs:int', [new LiteralExpression([1, 2])]);
        expect(() => expr.evaluate(ctx)).toThrow('XPTY0004');
    });

    it('parses constructor function via parser', () => {
        const lexer = new XPathLexer('2.0');
        const parser = new XPath20Parser();
        const tokens = lexer.scan('xs:int("7")');
        const ast = parser.parse(tokens);
        expect(ast.evaluate(ctx)).toBe(7);
    });
});
