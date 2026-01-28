/**
 * Static Type Analysis Tests (Phase 9.5)
 *
 * Tests for enhanced type inference, static error detection, and type annotations
 */

import {
    StaticType,
    TypeEnv,
    exactlyOne,
    zeroOrOne,
    oneOrMore,
    zeroOrMore,
    XS,
    inferLiteral,
    inferConditional,
    inferFunctionCall,
    narrowType,
    inferPath,
    inferMapConstructor,
    inferArrayConstructor,
    canPromote,
    leastCommonSupertype,
    formatStaticType,
} from '../src/static-typing';

import {
    XPathStaticContext,
    createStaticContext,
    registerFunctionSignature,
    registerVariableType,
    checkFunctionCall,
    checkVariableReference,
    checkTypeCast,
    checkDivision,
    StaticErrorSeverity,
    analyzeExpression,
    formatStaticErrors,
} from '../src/static-context';

import { SequenceType } from '../src/types/sequence-type';

describe('Static Type Analysis - Phase 9.5', () => {
    describe('Enhanced Type Inference', () => {
        describe('Literal Inference', () => {
            it('should infer string type', () => {
                const type = inferLiteral('hello');

                expect(type.name).toBe(XS.string);
                expect(type.cardinality).toBe('exactly-one');
            });

            it('should infer number type', () => {
                const type = inferLiteral(42);

                expect(type.name).toBe(XS.double);
                expect(type.cardinality).toBe('exactly-one');
            });

            it('should infer boolean type', () => {
                const type = inferLiteral(true);

                expect(type.name).toBe(XS.boolean);
                expect(type.cardinality).toBe('exactly-one');
            });
        });

        describe('Conditional Expression Inference', () => {
            it('should infer type for if-then-else with same types', () => {
                const thenType = exactlyOne(XS.string);
                const elseType = exactlyOne(XS.string);
                const condType = exactlyOne(XS.boolean);

                const result = inferConditional(condType, thenType, elseType);

                expect(result.name).toBe(XS.string);
                expect(result.cardinality).toBe('exactly-one');
            });

            it('should infer type for if-then-else with different types', () => {
                const thenType = exactlyOne(XS.string);
                const elseType = exactlyOne(XS.integer);
                const condType = exactlyOne(XS.boolean);

                const result = inferConditional(condType, thenType, elseType);

                expect(result.name).toBe(XS.item);
            });

            it('should handle optional values', () => {
                const thenType = exactlyOne(XS.string);
                const elseType = zeroOrOne(XS.string);
                const condType = exactlyOne(XS.boolean);

                const result = inferConditional(condType, thenType, elseType);

                expect(result.cardinality).toBe('zero-or-one');
            });
        });

        describe('Function Call Inference', () => {
            it('should infer type from function signature', () => {
                const env: TypeEnv = {
                    functions: {
                        'string-length': {
                            params: [exactlyOne(XS.string)],
                            result: exactlyOne(XS.integer),
                        },
                    },
                };

                const result = inferFunctionCall('string-length', [exactlyOne(XS.string)], env);

                expect(result.name).toBe(XS.integer);
            });

            it('should return item()* for unknown functions', () => {
                const env: TypeEnv = {};

                const result = inferFunctionCall('unknown-function', [], env);

                expect(result.name).toBe(XS.item);
                expect(result.cardinality).toBe('zero-or-more');
            });
        });

        describe('Type Narrowing', () => {
            it('should narrow type in true branch', () => {
                const original = zeroOrMore(XS.item);
                const target = exactlyOne(XS.string);

                const narrowed = narrowType(original, target, true);

                expect(narrowed.name).toBe(XS.string);
                expect(narrowed.cardinality).toBe('exactly-one');
            });

            it('should preserve type in false branch', () => {
                const original = zeroOrMore(XS.item);
                const target = exactlyOne(XS.string);

                const narrowed = narrowType(original, target, false);

                expect(narrowed).toEqual(original);
            });
        });

        describe('Collection Inference', () => {
            it('should infer map constructor type', () => {
                const entries = [
                    { key: exactlyOne(XS.string), value: exactlyOne(XS.integer) },
                ];

                const result = inferMapConstructor(entries);

                expect(result.name).toBe('map(*)');
                expect(result.cardinality).toBe('exactly-one');
            });

            it('should infer array constructor type', () => {
                const members = [exactlyOne(XS.string), exactlyOne(XS.integer)];

                const result = inferArrayConstructor(members);

                expect(result.name).toBe('array(*)');
                expect(result.cardinality).toBe('exactly-one');
            });
        });

        describe('Type Promotion', () => {
            it('should allow numeric promotion: integer -> double', () => {
                const source = exactlyOne(XS.integer);
                const target = exactlyOne(XS.double);

                expect(canPromote(source, target)).toBe(true);
            });

            it('should allow promotion to item()', () => {
                const source = exactlyOne(XS.string);
                const target = exactlyOne(XS.item);

                expect(canPromote(source, target)).toBe(true);
            });

            it('should reject incompatible promotion', () => {
                const source = exactlyOne(XS.string);
                const target = exactlyOne(XS.integer);

                expect(canPromote(source, target)).toBe(false);
            });

            it('should handle cardinality promotion', () => {
                const source = exactlyOne(XS.string);
                const target = zeroOrMore(XS.string);

                expect(canPromote(source, target)).toBe(true);
            });
        });

        describe('Least Common Supertype', () => {
            it('should find common type for same types', () => {
                const types = [exactlyOne(XS.string), exactlyOne(XS.string)];

                const result = leastCommonSupertype(...types);

                expect(result.name).toBe(XS.string);
            });

            it('should fallback to item() for different types', () => {
                const types = [exactlyOne(XS.string), exactlyOne(XS.integer)];

                const result = leastCommonSupertype(...types);

                expect(result.name).toBe(XS.item);
            });

            it('should combine cardinalities', () => {
                const types = [exactlyOne(XS.string), zeroOrOne(XS.string)];

                const result = leastCommonSupertype(...types);

                expect(result.cardinality).toBe('zero-or-one');
            });
        });

        describe('Type Formatting', () => {
            it('should format exactly-one', () => {
                const type = exactlyOne(XS.string);
                expect(formatStaticType(type)).toBe(XS.string);
            });

            it('should format zero-or-one', () => {
                const type = zeroOrOne(XS.string);
                expect(formatStaticType(type)).toBe(`${XS.string}?`);
            });

            it('should format one-or-more', () => {
                const type = oneOrMore(XS.string);
                expect(formatStaticType(type)).toBe(`${XS.string}+`);
            });

            it('should format zero-or-more', () => {
                const type = zeroOrMore(XS.string);
                expect(formatStaticType(type)).toBe(`${XS.string}*`);
            });
        });
    });

    describe('Static Error Detection', () => {
        let context: XPathStaticContext;

        beforeEach(() => {
            context = createStaticContext();
        });

        describe('Function Call Validation', () => {
            it('should detect unknown functions', () => {
                const errors = checkFunctionCall(context, 'unknown-fn', []);

                expect(errors).toHaveLength(1);
                expect(errors[0].code).toBe('XPST0017');
                expect(errors[0].severity).toBe(StaticErrorSeverity.ERROR);
            });

            it('should detect too few arguments', () => {
                registerFunctionSignature(context, {
                    name: 'test-fn',
                    minArgs: 2,
                    maxArgs: 3,
                });

                const errors = checkFunctionCall(context, 'test-fn', []);

                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].code).toBe('XPST0017');
            });

            it('should detect too many arguments', () => {
                registerFunctionSignature(context, {
                    name: 'test-fn',
                    minArgs: 1,
                    maxArgs: 2,
                });

                const errors = checkFunctionCall(context, 'test-fn', [
                    {} as SequenceType,
                    {} as SequenceType,
                    {} as SequenceType,
                ]);

                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].code).toBe('XPST0017');
            });

            it('should pass validation for correct function call', () => {
                registerFunctionSignature(context, {
                    name: 'test-fn',
                    minArgs: 1,
                    maxArgs: 2,
                });

                const errors = checkFunctionCall(context, 'test-fn', [{} as SequenceType]);

                expect(errors).toHaveLength(0);
            });
        });

        describe('Variable Reference Validation', () => {
            it('should detect undefined variables', () => {
                const errors = checkVariableReference(context, 'undefined-var');

                expect(errors).toHaveLength(1);
                expect(errors[0].code).toBe('XPST0008');
                expect(errors[0].severity).toBe(StaticErrorSeverity.ERROR);
            });

            it('should pass validation for defined variables', () => {
                registerVariableType(context, 'my-var', {} as SequenceType);

                const errors = checkVariableReference(context, 'my-var');

                expect(errors).toHaveLength(0);
            });
        });

        describe('Division by Zero Detection', () => {
            it('should detect literal zero division', () => {
                const errors = checkDivision({} as SequenceType, {} as SequenceType, 0);

                expect(errors).toHaveLength(1);
                expect(errors[0].code).toBe('FOAR0001');
                expect(errors[0].severity).toBe(StaticErrorSeverity.ERROR);
            });

            it('should warn about potential division by zero', () => {
                const errors = checkDivision({} as SequenceType, {} as SequenceType);

                expect(errors).toHaveLength(1);
                expect(errors[0].severity).toBe(StaticErrorSeverity.WARNING);
            });
        });

        describe('Expression Analysis', () => {
            it('should analyze function call expressions', () => {
                const expression = {
                    type: 'function-call',
                    name: 'unknown-function',
                    args: [],
                };

                const errors = analyzeExpression(context, expression);

                expect(errors.length).toBeGreaterThan(0);
            });

            it('should analyze variable reference expressions', () => {
                const expression = {
                    type: 'variable',
                    name: 'undefined-var',
                };

                const errors = analyzeExpression(context, expression);

                expect(errors.length).toBeGreaterThan(0);
            });

            it('should analyze nested expressions', () => {
                const expression = {
                    type: 'parent',
                    children: [
                        { type: 'variable', name: 'var1' },
                        { type: 'variable', name: 'var2' },
                    ],
                };

                const errors = analyzeExpression(context, expression);

                expect(errors.length).toBe(2); // Both variables undefined
            });

            it('should return empty errors for null expression', () => {
                const errors = analyzeExpression(context, null);

                expect(errors).toHaveLength(0);
            });
        });

        describe('Error Formatting', () => {
            it('should format single error', () => {
                const errors = [
                    {
                        severity: StaticErrorSeverity.ERROR,
                        code: 'XPST0017',
                        message: 'Unknown function',
                    },
                ];

                const formatted = formatStaticErrors(errors);

                expect(formatted).toContain('[ERROR]');
                expect(formatted).toContain('XPST0017');
                expect(formatted).toContain('Unknown function');
            });

            it('should format multiple errors', () => {
                const errors = [
                    {
                        severity: StaticErrorSeverity.ERROR,
                        code: 'XPST0017',
                        message: 'Error 1',
                    },
                    {
                        severity: StaticErrorSeverity.WARNING,
                        code: 'XPTY0004',
                        message: 'Warning 1',
                    },
                ];

                const formatted = formatStaticErrors(errors);

                expect(formatted).toContain('Error 1');
                expect(formatted).toContain('Warning 1');
            });

            it('should format empty errors', () => {
                const formatted = formatStaticErrors([]);

                expect(formatted).toBe('No static errors found');
            });

            it('should include suggestions when present', () => {
                const errors = [
                    {
                        severity: StaticErrorSeverity.ERROR,
                        code: 'XPST0017',
                        message: 'Unknown function',
                        suggestion: 'Check the function name',
                    },
                ];

                const formatted = formatStaticErrors(errors);

                expect(formatted).toContain('Suggestion:');
                expect(formatted).toContain('Check the function name');
            });
        });
    });
});
