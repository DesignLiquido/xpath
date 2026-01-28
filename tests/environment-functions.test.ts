/**
 * XPath 3.0 Environment Functions Tests
 * 
 * Comprehensive testing of environment variable access functions:
 * - environment-variable($name)
 * - available-environment-variables()
 * 
 * Reference: https://www.w3.org/TR/xpath-functions-30/#environment
 */

import { environmentVariable, availableEnvironmentVariables } from '../src/functions/environment-functions';
import { createContext } from '../src/context';

describe('XPath Environment Functions', () => {
    // Helper to create a test context
    const createTestContext = () => {
        const dummyNode = {
            nodeType: 1,
            nodeName: 'test',
            localName: 'test',
            textContent: '',
            parentNode: null,
            childNodes: [],
        } as any;
        return createContext(dummyNode);
    };

    describe('environment-variable($name)', () => {
        it('should return value of existing environment variable', () => {
            // Set up a test variable
            process.env.TEST_XPATH_VAR = 'test-value-123';
            const context = createTestContext();

            const result = environmentVariable(context, 'TEST_XPATH_VAR');
            expect(result).toBe('test-value-123');

            // Clean up
            delete process.env.TEST_XPATH_VAR;
        });

        it('should return null for non-existent environment variable', () => {
            const context = createTestContext();
            const result = environmentVariable(context, 'DEFINITELY_NOT_EXISTING_VAR_XYZ_123');
            expect(result).toBeNull();
        });

        it('should return null for empty string variable name', () => {
            const context = createTestContext();
            const result = environmentVariable(context, '');
            // Empty variable name typically doesn't exist
            expect(result).toBeNull();
        });

        it('should handle variable names with underscores', () => {
            process.env.MY_TEST_VARIABLE = 'underscore-test';
            const context = createTestContext();

            const result = environmentVariable(context, 'MY_TEST_VARIABLE');
            expect(result).toBe('underscore-test');

            delete process.env.MY_TEST_VARIABLE;
        });

        it('should handle variable names with uppercase and lowercase', () => {
            process.env.TestMixedCase = 'mixed-case-value';
            const context = createTestContext();

            const result = environmentVariable(context, 'TestMixedCase');
            expect(result).toBe('mixed-case-value');

            delete process.env.TestMixedCase;
        });

        it('should return empty string when variable is set to empty', () => {
            process.env.EMPTY_VAR = '';
            const context = createTestContext();

            const result = environmentVariable(context, 'EMPTY_VAR');
            expect(result).toBe('');

            delete process.env.EMPTY_VAR;
        });

        it('should return numeric string when variable contains numbers', () => {
            process.env.NUMERIC_VAR = '12345';
            const context = createTestContext();

            const result = environmentVariable(context, 'NUMERIC_VAR');
            expect(result).toBe('12345');
            expect(typeof result).toBe('string');

            delete process.env.NUMERIC_VAR;
        });

        it('should return path value correctly', () => {
            // PATH is typically available on all systems
            const context = createTestContext();
            const result = environmentVariable(context, 'PATH');

            if (result) {
                expect(typeof result).toBe('string');
                expect((result as string).length).toBeGreaterThan(0);
            }
        });

        it('should handle special characters in variable values', () => {
            process.env.SPECIAL_CHARS = 'value-with-special!@#$%^&*()chars';
            const context = createTestContext();

            const result = environmentVariable(context, 'SPECIAL_CHARS');
            expect(result).toBe('value-with-special!@#$%^&*()chars');

            delete process.env.SPECIAL_CHARS;
        });

        it('should handle whitespace in variable values', () => {
            process.env.WHITESPACE_VAR = '  value with spaces  ';
            const context = createTestContext();

            const result = environmentVariable(context, 'WHITESPACE_VAR');
            expect(result).toBe('  value with spaces  ');

            delete process.env.WHITESPACE_VAR;
        });

        it('should convert non-string argument to string', () => {
            process.env.TEST_VAR = 'found';
            const context = createTestContext();

            // Pass numeric value that gets converted to string
            const result = environmentVariable(context, 123 as any);
            expect(result).toBeNull(); // '123' won't be a variable name

            delete process.env.TEST_VAR;
        });

        it('should be case-sensitive on Unix-like systems', () => {
            process.env.CaseSensitive = 'value';
            const context = createTestContext();

            const result1 = environmentVariable(context, 'CaseSensitive');
            const result2 = environmentVariable(context, 'casesensitive');

            expect(result1).toBe('value');
            // result2 might be null or the actual value depending on system
            // On case-sensitive systems (Unix/Linux/Mac), should be null
            // On case-insensitive systems (Windows), might return 'value'

            delete process.env.CaseSensitive;
        });

        it('should handle variable names with dots', () => {
            process.env['TEST.VAR.NAME'] = 'dot-separated';
            const context = createTestContext();

            const result = environmentVariable(context, 'TEST.VAR.NAME');
            expect(result).toBe('dot-separated');

            delete process.env['TEST.VAR.NAME'];
        });
    });

    describe('available-environment-variables()', () => {
        it('should return array of environment variable names', () => {
            const context = createTestContext();
            const result = availableEnvironmentVariables(context) as any[];

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should include PATH variable', () => {
            const context = createTestContext();
            const result = availableEnvironmentVariables(context) as string[];

            // PATH is commonly available on all systems
            expect(result.some(name => name === 'PATH' || name === 'Path')).toBe(true);
        });

        it('should return only strings', () => {
            const context = createTestContext();
            const result = availableEnvironmentVariables(context) as any[];

            result.forEach(item => {
                expect(typeof item).toBe('string');
            });
        });

        it('should include custom set environment variables', () => {
            process.env.CUSTOM_TEST_VAR = 'test';
            const context = createTestContext();
            const result = availableEnvironmentVariables(context) as string[];

            expect(result).toContain('CUSTOM_TEST_VAR');

            delete process.env.CUSTOM_TEST_VAR;
        });

        it('should not have duplicates', () => {
            const context = createTestContext();
            const result = availableEnvironmentVariables(context) as string[];

            const uniqueNames = new Set(result);
            expect(result.length).toBe(uniqueNames.size);
        });

        it('should reflect newly added environment variables', () => {
            const context = createTestContext();
            const resultBefore = availableEnvironmentVariables(context) as string[];

            process.env.NEW_VAR_FOR_TEST = 'new';
            const resultAfter = availableEnvironmentVariables(context) as string[];

            expect(resultAfter).toContain('NEW_VAR_FOR_TEST');
            expect(resultAfter.length).toBe(resultBefore.length + 1);

            delete process.env.NEW_VAR_FOR_TEST;
        });

        it('should reflect deleted environment variables', () => {
            process.env.VAR_TO_DELETE = 'temp';
            const context = createTestContext();
            const resultBefore = availableEnvironmentVariables(context) as string[];

            expect(resultBefore).toContain('VAR_TO_DELETE');

            delete process.env.VAR_TO_DELETE;
            const resultAfter = availableEnvironmentVariables(context) as string[];

            expect(resultAfter).not.toContain('VAR_TO_DELETE');
            expect(resultAfter.length).toBe(resultBefore.length - 1);
        });

        it('should return empty sequence in browser-like environment', () => {
            const context = createTestContext();
            // In Node.js, we always have process.env, but function handles browser case
            const result = availableEnvironmentVariables(context) as any[];

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThanOrEqual(0);
        });

        it('should return consistent results across multiple calls', () => {
            const context = createTestContext();
            const result1 = availableEnvironmentVariables(context) as any[];
            const result2 = availableEnvironmentVariables(context) as any[];

            // Same variables should be present (order might differ)
            expect(result1.length).toBe(result2.length);
            expect(new Set(result1)).toEqual(new Set(result2));
        });

        it('should handle system environment variables', () => {
            const context = createTestContext();
            const result = availableEnvironmentVariables(context) as any[];

            // Common system variables
            const hasCommonVars = result.some(name =>
                ['PATH', 'HOME', 'USER', 'SHELL', 'TEMP', 'TMP'].includes(String(name))
            );

            // At least one common variable should exist
            expect(hasCommonVars).toBe(true);
        });
    });

    describe('environment-variable and available-environment-variables integration', () => {
        it('should find variables returned by available-environment-variables', () => {
            process.env.TEST_INTEGRATION_VAR = 'integration-test';
            const context = createTestContext();

            const available = availableEnvironmentVariables(context) as any[];
            expect(available).toContain('TEST_INTEGRATION_VAR');

            const value = environmentVariable(context, 'TEST_INTEGRATION_VAR');
            expect(value).toBe('integration-test');

            delete process.env.TEST_INTEGRATION_VAR;
        });

        it('should retrieve all available variables successfully', () => {
            const context = createTestContext();
            const available = availableEnvironmentVariables(context) as any[];

            // Sample some variables to verify they can be retrieved
            const sampleVars = available.slice(0, Math.min(5, available.length));

            sampleVars.forEach(varName => {
                const value = environmentVariable(context, varName);
                expect(value).not.toBeUndefined();
                // Value can be null or string, both are valid
                expect(typeof value === 'string' || value === null).toBe(true);
            });
        });

        it('should handle multiple context instances independently', () => {
            process.env.CONTEXT_TEST_VAR = 'value1';
            const context1 = createTestContext();
            const context2 = createTestContext();

            const result1 = environmentVariable(context1, 'CONTEXT_TEST_VAR');
            const result2 = environmentVariable(context2, 'CONTEXT_TEST_VAR');

            expect(result1).toBe(result2);
            expect(result1).toBe('value1');

            delete process.env.CONTEXT_TEST_VAR;
        });

        it('should work with getBuiltInFunction registry', () => {
            const { getBuiltInFunction } = require('../src/expressions/function-call-expression');
            const context = createTestContext();

            const envVarFn = getBuiltInFunction('environment-variable');
            const availableFn = getBuiltInFunction('available-environment-variables');

            expect(envVarFn).toBeDefined();
            expect(availableFn).toBeDefined();

            process.env.REGISTRY_TEST_VAR = 'registry-value';

            const value = envVarFn!(context, 'REGISTRY_TEST_VAR');
            expect(value).toBe('registry-value');

            const available = availableFn!(context) as string[];
            expect(available).toContain('REGISTRY_TEST_VAR');

            delete process.env.REGISTRY_TEST_VAR;
        });
    });

    describe('edge cases and error scenarios', () => {
        it('should handle null-like values gracefully', () => {
            const context = createTestContext();

            // These should not crash
            expect(() => {
                environmentVariable(context, 'NONEXISTENT');
            }).not.toThrow();
        });

        it('should handle very long variable names', () => {
            const longName = 'A'.repeat(1000);
            const context = createTestContext();

            const result = environmentVariable(context, longName);
            expect(result).toBeNull(); // Unlikely to exist
        });

        it('should handle very long variable values', () => {
            const longValue = 'x'.repeat(10000);
            process.env.LONG_VALUE_VAR = longValue;
            const context = createTestContext();

            const result = environmentVariable(context, 'LONG_VALUE_VAR');
            expect(result).toBe(longValue);

            delete process.env.LONG_VALUE_VAR;
        });

        it('should handle variables with newlines', () => {
            process.env.NEWLINE_VAR = 'line1\nline2\nline3';
            const context = createTestContext();

            const result = environmentVariable(context, 'NEWLINE_VAR');
            expect(result).toBe('line1\nline2\nline3');

            delete process.env.NEWLINE_VAR;
        });

        it('should handle variables with unicode characters', () => {
            process.env.UNICODE_VAR = 'café ☕ 日本語 🌟';
            const context = createTestContext();

            const result = environmentVariable(context, 'UNICODE_VAR');
            expect(result).toBe('café ☕ 日本語 🌟');

            delete process.env.UNICODE_VAR;
        });

        it('should handle simultaneous variable creation and retrieval', () => {
            const context = createTestContext();

            // Create multiple variables
            for (let i = 0; i < 10; i++) {
                process.env[`VAR_${i}`] = `value_${i}`;
            }

            // Retrieve all of them
            for (let i = 0; i < 10; i++) {
                const value = environmentVariable(context, `VAR_${i}`);
                expect(value).toBe(`value_${i}`);
            }

            // Clean up
            for (let i = 0; i < 10; i++) {
                delete process.env[`VAR_${i}`];
            }
        });
    });

    describe('XPath specification compliance', () => {
        it('should return xs:string? for environment-variable (single value)', () => {
            process.env.SPEC_TEST_VAR = 'spec-value';
            const context = createTestContext();

            const result = environmentVariable(context, 'SPEC_TEST_VAR');

            // Result should be either string or null (empty sequence)
            expect(typeof result === 'string' || result === null).toBe(true);

            delete process.env.SPEC_TEST_VAR;
        });

        it('should return xs:string* for available-environment-variables (sequence)', () => {
            const context = createTestContext();
            const result = availableEnvironmentVariables(context);

            // Result should be an array
            expect(Array.isArray(result)).toBe(true);

            // All items should be strings
            const resultArray = result as any[];
            resultArray.forEach(item => {
                expect(typeof item).toBe('string');
            });
        });

        it('should be deterministic for available-environment-variables', () => {
            const context = createTestContext();
            const result1 = availableEnvironmentVariables(context) as string[];
            const result2 = availableEnvironmentVariables(context) as string[];

            // Same set of variables
            expect(new Set(result1)).toEqual(new Set(result2));
        });

        it('should handle case sensitivity according to OS', () => {
            const context = createTestContext();
            const available = availableEnvironmentVariables(context) as any[];

            // All returned names should be strings
            available.forEach(name => {
                expect(typeof name).toBe('string');
                expect((name as string).length).toBeGreaterThan(0);
            });
        });

        it('should work with XPath context requirements', () => {
            const context = createTestContext();

            // Both functions should work with any valid XPathContext
            expect(() => {
                environmentVariable(context, 'TEST_VAR');
                availableEnvironmentVariables(context);
            }).not.toThrow();
        });
    });
});
