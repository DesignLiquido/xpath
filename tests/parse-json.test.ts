import { XPathLexer } from '../src/lexer/lexer';
import { XPath31Parser } from '../src/parser';

function parseAndEval(xpath: string, context: any = {}) {
    const lexer = new XPathLexer('3.1');
    const tokens = lexer.scan(xpath);
    console.log('Tokens:', tokens.map((t: any) => `${t.type}:'${t.lexeme}'`));
    const parser = new XPath31Parser();
    const expr = parser.parse(tokens);
    console.log('Expression:', expr.constructor.name);
    try {
        const result = expr.evaluate(context);
        console.log('Result type:', typeof result, 'Value:', result);
        return result;
    } catch (error: any) {
        console.log('Error during evaluation:', error.message);
        throw error;
    }
}

describe('parse-json', () => {
    it('should parse a simple JSON string', () => {
        try {
            const result = parseAndEval(`parse-json('{"a":1}')`);
            console.log('Result:', result);
            expect(result).toBeDefined();
        } catch (error: any) {
            console.log('Error:', error.message);
            throw error;
        }
    });

    it('should parse JSON with map accessor', () => {
        try {
            const result = parseAndEval(`parse-json('{"a":1}')?a`);
            console.log('Result:', result);
            expect(result).toBe(1);
        } catch (error: any) {
            console.log('Error:', error.message);
            throw error;
        }
    });

    it('should map from let binding', () => {
        try {
            const result = parseAndEval(`let $json := '{"a":1}' return parse-json($json)?a`);
            console.log('Result:', result);
            expect(result).toBe(1);
        } catch (error: any) {
            console.log('Error:', error.message);
            throw error;
        }
    });
});
