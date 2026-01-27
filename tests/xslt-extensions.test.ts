import { XPathLexer } from '../src/lexer';
import { XPath10Parser } from '../src/parser';
import {
    XSLTExtensions,
    XSLTFunctionMetadata,
    getExtensionFunctionNames,
    validateExtensions,
    createEmptyExtensions,
} from '../src/xslt-extensions';
import { XPathContext } from '../src/context';

describe('XSLT Extensions', () => {
    describe('Extension Helper Functions', () => {
        it('should create empty extensions bundle', () => {
            const extensions = createEmptyExtensions('1.0');
            expect(extensions.version).toBe('1.0');
            expect(extensions.functions).toEqual([]);
        });

        it('should extract function names from extensions', () => {
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'generate-id',
                        minArgs: 0,
                        maxArgs: 1,
                        implementation: (context) => 'id-123',
                    },
                    {
                        name: 'system-property',
                        minArgs: 1,
                        maxArgs: 1,
                        implementation: (context, name) => '1.0',
                    },
                ],
            };

            const names = getExtensionFunctionNames(extensions);
            expect(names).toEqual(['generate-id', 'system-property']);
        });

        it('should validate valid extensions', () => {
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'test-func',
                        minArgs: 0,
                        maxArgs: 2,
                        implementation: (context) => 'result',
                    },
                ],
            };

            const errors = validateExtensions(extensions);
            expect(errors).toEqual([]);
        });

        it('should detect duplicate function names', () => {
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'duplicate',
                        minArgs: 0,
                        implementation: (context) => 'first',
                    },
                    {
                        name: 'duplicate',
                        minArgs: 0,
                        implementation: (context) => 'second',
                    },
                ],
            };

            const errors = validateExtensions(extensions);
            expect(errors).toContain('Duplicate function name: duplicate');
        });

        it('should detect invalid argument counts', () => {
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'bad-func',
                        minArgs: -1,
                        implementation: (context) => 'result',
                    },
                ],
            };

            const errors = validateExtensions(extensions);
            expect(errors).toContain('Function bad-func: minArgs cannot be negative');
        });

        it('should detect maxArgs less than minArgs', () => {
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'bad-func',
                        minArgs: 3,
                        maxArgs: 1,
                        implementation: (context) => 'result',
                    },
                ],
            };

            const errors = validateExtensions(extensions);
            expect(errors).toContain('Function bad-func: maxArgs cannot be less than minArgs');
        });
    });

    describe('Parser Integration', () => {
        it('should accept extensions in parser options', () => {
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [],
            };

            expect(() => new XPath10Parser({ extensions })).not.toThrow();
        });

        it('should reject invalid extensions', () => {
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'dup',
                        minArgs: 0,
                        implementation: (context) => 'one',
                    },
                    {
                        name: 'dup',
                        minArgs: 0,
                        implementation: (context) => 'two',
                    },
                ],
            };

            expect(() => new XPath10Parser({ extensions })).toThrow(
                'Invalid XSLT extensions: Duplicate function name: dup'
            );
        });
    });

    describe('Lexer Integration', () => {
        it('should register extension function names', () => {
            const lexer = new XPathLexer();
            lexer.registerFunctions(['generate-id', 'system-property']);

            const tokens = lexer.scan('generate-id()');
            expect(tokens[0].type).toBe('FUNCTION');
            expect(tokens[0].lexeme).toBe('generate-id');
        });

        it('should recognize hyphenated extension functions', () => {
            const lexer = new XPathLexer();
            lexer.registerFunctions(['format-number']);

            const tokens = lexer.scan('format-number(123, "#,##0.00")');
            expect(tokens[0].type).toBe('FUNCTION');
            expect(tokens[0].lexeme).toBe('format-number');
        });
    });

    describe('End-to-End XSLT Function Example', () => {
        it('should execute XSLT extension function', () => {
            // Define a simple generate-id() implementation
            const generateIdImpl = (context: XPathContext, nodeSet?: any[]) => {
                const node = nodeSet?.[0] || context.node;
                // Simple implementation: return node name with a fake id
                return `id-${node?.nodeName || 'unknown'}`;
            };

            // Create extensions bundle
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'generate-id',
                        minArgs: 0,
                        maxArgs: 1,
                        implementation: generateIdImpl,
                        description: 'Generate unique identifier for a node',
                    },
                ],
            };

            // Create parser with extensions
            const parser = new XPath10Parser({ extensions });

            // Create lexer and register extension functions
            const lexer = new XPathLexer();
            lexer.registerFunctions(getExtensionFunctionNames(extensions));

            // Parse expression
            const tokens = lexer.scan('generate-id()');
            const expression = parser.parse(tokens);

            // Create context with extension function registered
            const mockNode = {
                nodeName: 'book',
                nodeType: 1,
                textContent: 'Test Book',
            };

            const context: XPathContext = {
                node: mockNode as any,
                position: 1,
                size: 1,
                functions: {
                    'generate-id': generateIdImpl,
                },
            };

            // Evaluate
            const result = expression.evaluate(context);
            expect(result).toBe('id-book');
        });

        it('should execute system-property() XSLT function', () => {
            // Define system-property() implementation
            const systemPropertyImpl = (context: XPathContext, propertyName: string) => {
                const properties: Record<string, string> = {
                    'xsl:version': '1.0',
                    'xsl:vendor': 'Design Liquido XPath',
                    'xsl:vendor-url': 'https://github.com/designliquido/xpath',
                };
                return properties[String(propertyName)] || '';
            };

            // Create extensions bundle
            const extensions: XSLTExtensions = {
                version: '1.0',
                functions: [
                    {
                        name: 'system-property',
                        minArgs: 1,
                        maxArgs: 1,
                        implementation: systemPropertyImpl,
                        description: 'Query XSLT processor properties',
                    },
                ],
            };

            // Create parser and lexer
            const parser = new XPath10Parser({ extensions });
            const lexer = new XPathLexer();
            lexer.registerFunctions(getExtensionFunctionNames(extensions));

            // Parse expression
            const tokens = lexer.scan("system-property('xsl:version')");
            const expression = parser.parse(tokens);

            // Create context
            const context: XPathContext = {
                position: 1,
                size: 1,
                functions: {
                    'system-property': systemPropertyImpl,
                },
            };

            // Evaluate
            const result = expression.evaluate(context);
            expect(result).toBe('1.0');
        });
    });
});
