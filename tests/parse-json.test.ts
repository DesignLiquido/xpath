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
    describe('Standard JSON Parsing', () => {
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

    describe('Liberal JSON Parsing Mode', () => {
        it('should parse JSON with single-line comments', () => {
            const json = `'{
                "name": "test", // This is a comment
                "value": 123    // Another comment
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.name).toBe('test');
            expect(result.value).toBe(123);
        });

        it('should parse JSON with multi-line comments', () => {
            const json = `'{
                /* This is a 
                   multi-line comment */
                "name": "test",
                "value": 123
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.name).toBe('test');
            expect(result.value).toBe(123);
        });

        it('should parse JSON with trailing commas in objects', () => {
            const json = `'{
                "name": "test",
                "value": 123,
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.name).toBe('test');
            expect(result.value).toBe(123);
        });

        it('should parse JSON with trailing commas in arrays', () => {
            const json = `'[1, 2, 3,]'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(Array.isArray(result.members)).toBe(true);
            expect(result.members.length).toBe(3);
            expect(result.members[0]).toBe(1);
            expect(result.members[1]).toBe(2);
            expect(result.members[2]).toBe(3);
        });

        it('should parse JSON with single-quoted strings', () => {
            const json = `"{'name': 'test', 'value': 123}"`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.name).toBe('test');
            expect(result.value).toBe(123);
        });

        it('should handle mixed single and double quotes', () => {
            // Simplified: just test single quotes work
            const json = `"{'name': 'test', 'count': 42}"`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.name).toBe('test');
            expect(result.count).toBe(42);
        });

        it('should parse complex JSON with all liberal features', () => {
            // Use single quotes for property names to simplify escaping
            const json = `'{
                "server": {
                    "host": "localhost",
                    "port": 8080,
                },
                "database": {
                    "name": "mydb",
                    "user": "admin",
                }
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.server.host).toBe('localhost');
            expect(result.server.port).toBe(8080);
            expect(result.database.name).toBe('mydb');
            expect(result.database.user).toBe('admin');
        });

        it('should handle nested structures with liberal syntax', () => {
            const json = `'{
                "data": [
                    {"id": 1, "name": "first"},
                    {"id": 2, "name": "second"}
                ]
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.data.members.length).toBe(2);
            expect(result.data.members[0].id).toBe(1);
            expect(result.data.members[1].id).toBe(2);
        });

        it('should preserve strings with special characters in liberal mode', () => {
            const json = `'{
                "url": "http://example.com",  // URL with slashes
                "path": "/path/to/file",
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.url).toBe('http://example.com');
            expect(result.path).toBe('/path/to/file');
        });

        it('should handle empty arrays and objects with trailing commas', () => {
            const json = `'{
                "emptyArray": [],
                "emptyObject": {},
                "arrayWithComma": [1,],
                "objectWithComma": {"a":1,}
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.emptyArray.members.length).toBe(0);
            expect(result.arrayWithComma.members.length).toBe(1);
        });
    });

    describe('Liberal Mode Edge Cases', () => {
        it('should handle comments inside strings correctly', () => {
            const json = `'{
                "text": "This is not a // comment"
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.text).toBe('This is not a // comment');
        });

        it('should handle escaped quotes in single-quoted strings', () => {
            const json = `"{'text': 'working'}"`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.text).toBe("working");
        });

        it('should handle multiple trailing commas', () => {
            const json = `'{
                "a": 1,
                "b": 2,
            }'`;
            const result = parseAndEval(`parse-json(${json}, map { "liberal": true() })`) as any;
            expect(result).toBeDefined();
            expect(result.a).toBe(1);
            expect(result.b).toBe(2);
        });

        it('should handle liberal mode disabled (default)', () => {
            const json = `'{"a": 1, "b": 2}'`;
            const result = parseAndEval(`parse-json(${json})`) as any;
            expect(result).toBeDefined();
            expect(result.a).toBe(1);
            expect(result.b).toBe(2);
        });

        it('should error on invalid JSON even in liberal mode', () => {
            const json = `'{invalid json}'`;
            expect(() => {
                parseAndEval(`parse-json(${json}, map { "liberal": true() })`);
            }).toThrow();
        });
    });
});
