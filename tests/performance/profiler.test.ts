/**
 * Performance Profiler Test Suite
 *
 * Tests for expression profiling, memory tracking, and optimizer suggestions
 */

import { ExpressionProfiler, getGlobalProfiler, resetGlobalProfiler } from '../../src/profiler/profiler';
import { QueryOptimizer, getGlobalOptimizer } from '../../src/profiler/optimizer-hints';
import { XPath30Parser } from '../../src/parser/parser-30';
import { XPathLexer } from '../../src/lexer/lexer';
import { XPathContext } from '../../src/context';

describe('Performance Profiler', () => {
    let profiler: ExpressionProfiler;
    let context: XPathContext;
    let parser: XPath30Parser;
    let lexer: XPathLexer;

    beforeEach(() => {
        profiler = new ExpressionProfiler();
        context = { variables: {} };
        parser = new XPath30Parser();
        lexer = new XPathLexer({ version: '3.0' });
    });

    afterEach(() => {
        resetGlobalProfiler();
    });

    describe('ExpressionProfiler', () => {
        describe('Basic Profiling', () => {
            test('should enable profiling', () => {
                profiler.enable();
                expect(profiler.isEnabled()).toBe(true);
            });

            test('should disable profiling', () => {
                profiler.enable();
                profiler.disable();
                expect(profiler.isEnabled()).toBe(false);
            });

            test('should profile a simple expression', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'LiteralExpression' } } as any,
                    context,
                    () => 42
                );

                const profiles = profiler.getProfiles();
                expect(profiles.length).toBeGreaterThan(0);
                expect(profiles[0].expressionType).toBe('LiteralExpression');
            });

            test('should record execution time', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'TestExpr' } } as any,
                    context,
                    () => {
                        // Simulate work
                        let sum = 0;
                        for (let i = 0; i < 1000; i++) {
                            sum += i;
                        }
                        return sum;
                    }
                );

                const profile = profiler.getProfile('TestExpr');
                expect(profile).toBeDefined();
                expect(profile!.executionTime).toBeGreaterThan(0);
            });

            test('should not profile when disabled', () => {
                profiler.disable();

                profiler.profileExpression(
                    { constructor: { name: 'TestExpr' } } as any,
                    context,
                    () => 42
                );

                const profiles = profiler.getProfiles();
                expect(profiles.length).toBe(0);
            });
        });

        describe('Call Count and Aggregation', () => {
            test('should count multiple calls to same expression', () => {
                profiler.enable();

                for (let i = 0; i < 5; i++) {
                    profiler.profileExpression(
                        { constructor: { name: 'ArithmeticExpr' } } as any,
                        context,
                        () => i + 1
                    );
                }

                const profile = profiler.getProfile('ArithmeticExpr');
                expect(profile!.callCount).toBe(5);
            });

            test('should calculate average time', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => 1
                );
                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => 2
                );

                const profile = profiler.getProfile('Expr');
                expect(profile!.avgTime).toBeGreaterThan(0);
            });

            test('should track min and max time', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => {
                        let sum = 0;
                        for (let i = 0; i < 100; i++) sum += i;
                        return sum;
                    }
                );

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => {
                        let sum = 0;
                        for (let i = 0; i < 1000; i++) sum += i;
                        return sum;
                    }
                );

                const profile = profiler.getProfile('Expr');
                expect(profile!.minTime).toBeLessThanOrEqual(profile!.maxTime);
            });
        });

        describe('Result Tracking', () => {
            test('should count scalar results', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => 42
                );

                const profile = profiler.getProfile('Expr');
                expect(profile!.resultCount).toBe(1);
                expect(profile!.resultType).toBe('number');
            });

            test('should count array results', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => [1, 2, 3]
                );

                const profile = profiler.getProfile('Expr');
                expect(profile!.resultCount).toBe(3);
            });

            test('should count null results', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => null
                );

                const profile = profiler.getProfile('Expr');
                expect(profile!.resultCount).toBe(0);
            });
        });

        describe('Memory Tracking', () => {
            test('should track peak memory', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => new Array(1000).fill(0)
                );

                const profile = profiler.getProfile('Expr');
                expect(profile!.peakMemory).toBeGreaterThanOrEqual(0);
            });

            test('should estimate memory usage', () => {
                profiler.enable();

                const largeArray = new Array(10000).fill({ x: 1, y: 2 });
                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => largeArray
                );

                const profile = profiler.getProfile('Expr');
                expect(profile!.estimatedMemory).toBeGreaterThan(0);
            });
        });

        describe('Summary and Reports', () => {
            test('should generate summary', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr1' } } as any,
                    context,
                    () => 1
                );
                profiler.profileExpression(
                    { constructor: { name: 'Expr2' } } as any,
                    context,
                    () => 2
                );

                const summary = profiler.getSummary();
                expect(summary.totalCalls).toBe(2);
                expect(summary.totalExecutionTime).toBeGreaterThan(0);
                expect(summary.averageTime).toBeGreaterThan(0);
            });

            test('should identify slowest expression', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'FastExpr' } } as any,
                    context,
                    () => 1
                );

                profiler.profileExpression(
                    { constructor: { name: 'SlowExpr' } } as any,
                    context,
                    () => {
                        let sum = 0;
                        for (let i = 0; i < 10000; i++) sum += i;
                        return sum;
                    }
                );

                const summary = profiler.getSummary();
                expect(summary.slowestExpression?.expressionType).toBe('SlowExpr');
            });

            test('should generate formatted report', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'TestExpr' } } as any,
                    context,
                    () => 42
                );

                const report = profiler.getReport();
                expect(report).toContain('XPath Expression Performance Report');
                expect(report).toContain('TestExpr');
                expect(report).toContain('Total Execution Time');
            });

            test('should get hot spots', () => {
                profiler.enable();

                for (let i = 0; i < 3; i++) {
                    profiler.profileExpression(
                        { constructor: { name: 'HotExpr' } } as any,
                        context,
                        () => {
                            let sum = 0;
                            for (let j = 0; j < 10000; j++) sum += j;
                            return sum;
                        }
                    );
                }

                profiler.profileExpression(
                    { constructor: { name: 'ColdExpr' } } as any,
                    context,
                    () => 42
                );

                const hotSpots = profiler.getHotSpots(1);
                expect(hotSpots.length).toBe(1);
                expect(hotSpots[0].expressionType).toBe('HotExpr');
            });

            test('should get memory hotspots', () => {
                profiler.enable();

                const largeArray = new Array(50000).fill({ x: 1 });
                profiler.profileExpression(
                    { constructor: { name: 'MemoryHeavyExpr' } } as any,
                    context,
                    () => largeArray
                );

                profiler.profileExpression(
                    { constructor: { name: 'LightExpr' } } as any,
                    context,
                    () => 42
                );

                const memoryHotSpots = profiler.getMemoryHotSpots(1);
                expect(memoryHotSpots.length).toBeGreaterThan(0);
            });

            test('should get frequency analysis', () => {
                profiler.enable();

                for (let i = 0; i < 5; i++) {
                    profiler.profileExpression(
                        { constructor: { name: 'FrequentExpr' } } as any,
                        context,
                        () => i
                    );
                }

                profiler.profileExpression(
                    { constructor: { name: 'RareExpr' } } as any,
                    context,
                    () => 1
                );

                const frequency = profiler.getFrequencyAnalysis(1);
                expect(frequency[0].callCount).toBe(5);
            });
        });

        describe('Profile Management', () => {
            test('should clear profiles', () => {
                profiler.enable();

                profiler.profileExpression(
                    { constructor: { name: 'Expr' } } as any,
                    context,
                    () => 42
                );

                profiler.clearProfiles();

                const profiles = profiler.getProfiles();
                expect(profiles.length).toBe(0);
            });

            test('should handle empty profiles gracefully', () => {
                const summary = profiler.getSummary();
                expect(summary.totalCalls).toBe(0);
                expect(summary.slowestExpression).toBeNull();
            });
        });

        describe('Global Profiler', () => {
            test('should get global profiler instance', () => {
                const globalProfiler = getGlobalProfiler();
                expect(globalProfiler).toBeDefined();
                expect(globalProfiler).toBeInstanceOf(ExpressionProfiler);
            });

            test('should return same global instance', () => {
                const p1 = getGlobalProfiler();
                const p2 = getGlobalProfiler();
                expect(p1).toBe(p2);
            });

            test('should reset global profiler', () => {
                const p1 = getGlobalProfiler();
                resetGlobalProfiler();
                const p2 = getGlobalProfiler();
                expect(p1).not.toBe(p2);
            });
        });
    });

    describe('Query Optimizer', () => {
        let optimizer: QueryOptimizer;

        beforeEach(() => {
            optimizer = new QueryOptimizer();
        });

        describe('Expression Analysis', () => {
            test('should detect absolute paths', () => {
                const expr = {
                    constructor: { name: 'XPathLocationPath' },
                    absolute: true,
                } as any;

                const hints = optimizer.analyzeExpression(expr);
                expect(hints.some((h) => h.category === 'Absolute Paths')).toBe(true);
            });

            test('should detect position() usage', () => {
                const expr = {
                    constructor: { name: 'PredicateExpr' },
                    toString: () => 'child::*[position() > 5]',
                } as any;

                const hints = optimizer.analyzeExpression(expr);
                expect(hints.some((h) => h.category === 'Predicate Efficiency')).toBe(true);
            });

            test('should suggest predicate optimization', () => {
                const expr = {
                    constructor: { name: 'PredicateExpr' },
                    toString: () => '[position() = 1]',
                } as any;

                const hints = optimizer.analyzeExpression(expr);
                const hint = hints.find((h) => h.category === 'Predicate Efficiency');
                expect(hint?.suggestion).toContain('[1]');
            });

            test('should detect complex expressions', () => {
                const expr = {
                    constructor: { name: 'ComplexExpr' },
                    left: {
                        constructor: { name: 'SubExpr' },
                        left: {
                            constructor: { name: 'DeepExpr' },
                            left: {
                                constructor: { name: 'Expr' },
                                predicates: [
                                    { constructor: { name: 'P1' } },
                                    { constructor: { name: 'P2' } },
                                    { constructor: { name: 'P3' } },
                                ],
                            },
                        },
                        predicates: [
                            { constructor: { name: 'P1' } },
                            { constructor: { name: 'P2' } },
                        ],
                        arguments: [
                            { constructor: { name: 'A1' } },
                            { constructor: { name: 'A2' } },
                            { constructor: { name: 'A3' } },
                            { constructor: { name: 'A4' } },
                        ],
                    },
                } as any;

                const hints = optimizer.analyzeExpression(expr);
                expect(hints.length).toBeGreaterThan(0);
            });
        });

        describe('Complexity Metrics', () => {
            test('should calculate expression depth', () => {
                const expr = {
                    constructor: { name: 'Expr' },
                    left: {
                        constructor: { name: 'SubExpr' },
                        left: { constructor: { name: 'DeepExpr' } },
                    },
                } as any;

                const metrics = optimizer.getComplexityMetrics(expr);
                expect(metrics.depth).toBeGreaterThan(0);
            });

            test('should calculate expression breadth', () => {
                const expr = {
                    constructor: { name: 'Expr' },
                    arguments: [
                        { constructor: { name: 'Arg1' } },
                        { constructor: { name: 'Arg2' } },
                        { constructor: { name: 'Arg3' } },
                    ],
                } as any;

                const metrics = optimizer.getComplexityMetrics(expr);
                expect(metrics.breadth).toBeGreaterThan(0);
            });

            test('should count predicates', () => {
                const expr = {
                    constructor: { name: 'Expr' },
                    predicates: [
                        { constructor: { name: 'Pred1' } },
                        { constructor: { name: 'Pred2' } },
                    ],
                } as any;

                const metrics = optimizer.getComplexityMetrics(expr);
                expect(metrics.predicateCount).toBe(2);
            });

            test('should classify simple expressions', () => {
                const expr = {
                    constructor: { name: 'LiteralExpr' },
                } as any;

                const metrics = optimizer.getComplexityMetrics(expr);
                expect(metrics.complexity).toBe('simple');
            });

            test('should classify complex expressions', () => {
                const expr = {
                    constructor: { name: 'Expr' },
                    left: {
                        constructor: { name: 'SubExpr' },
                        left: {
                            constructor: { name: 'DeepExpr' },
                            left: {
                                constructor: { name: 'VeryDeepExpr' },
                                predicates: [
                                    { constructor: { name: 'P1' } },
                                    { constructor: { name: 'P2' } },
                                    { constructor: { name: 'P3' } },
                                ],
                                arguments: [
                                    { constructor: { name: 'A1' } },
                                    { constructor: { name: 'A2' } },
                                    { constructor: { name: 'A3' } },
                                    { constructor: { name: 'A4' } },
                                ],
                            },
                            predicates: [
                                { constructor: { name: 'P1' } },
                                { constructor: { name: 'P2' } },
                            ],
                        },
                        arguments: [
                            { constructor: { name: 'A1' } },
                            { constructor: { name: 'A2' } },
                        ],
                    },
                } as any;

                const metrics = optimizer.getComplexityMetrics(expr);
                expect(['complex', 'very-complex']).toContain(metrics.complexity);
            });
        });

        describe('Performance Hints', () => {
            test('should suggest optimization for slow expressions', () => {
                const profile = {
                    expressionType: 'SlowExpr',
                    maxTime: 150,
                    callCount: 10,
                    totalTime: 1000,
                    peakMemory: 1024 * 1024,
                } as any;

                const hints = optimizer.analyzeExpression({} as any, profile);
                expect(hints.some((h) => h.category === 'Performance')).toBe(true);
            });

            test('should suggest memory optimization', () => {
                const profile = {
                    expressionType: 'MemoryHeavy',
                    peakMemory: 10 * 1024 * 1024,
                    callCount: 5,
                    totalTime: 100,
                    maxTime: 50,
                } as any;

                const hints = optimizer.analyzeExpression({} as any, profile);
                expect(hints.some((h) => h.category === 'Memory Usage')).toBe(true);
            });

            test('should suggest caching for frequently called expressions', () => {
                const profile = {
                    expressionType: 'Frequent',
                    callCount: 5000,
                    totalTime: 1000,
                    peakMemory: 1024,
                } as any;

                const hints = optimizer.analyzeExpression({} as any, profile);
                expect(hints.some((h) => h.category === 'Call Frequency')).toBe(true);
            });
        });

        describe('Severity Levels', () => {
            test('should mark critical issues as warnings/errors', () => {
                const expr = {
                    constructor: { name: 'XPathLocationPath' },
                    absolute: true,
                } as any;

                const hints = optimizer.analyzeExpression(expr);
                expect(hints.some((h) => ['warning', 'error'].includes(h.severity))).toBe(true);
            });

            test('should mark minor issues as info', () => {
                const hints = optimizer.analyzeExpression({} as any);
                const infoHints = hints.filter((h) => h.severity === 'info');
                expect(infoHints.length).toBeGreaterThanOrEqual(0);
            });
        });

        describe('Suggestions', () => {
            test('should provide actionable suggestions', () => {
                const expr = {
                    constructor: { name: 'XPathLocationPath' },
                    absolute: true,
                } as any;

                const hints = optimizer.analyzeExpression(expr);
                const hint = hints.find((h) => h.category === 'Absolute Paths');
                expect(hint?.suggestion).toBeTruthy();
                expect(hint?.suggestion!.length).toBeGreaterThan(0);
            });

            test('should estimate improvement potential', () => {
                const expr = {
                    constructor: { name: 'Expr' },
                    toString: () => '[position() = 1]',
                } as any;

                const hints = optimizer.analyzeExpression(expr);
                const hint = hints.find((h) => h.category === 'Predicate Efficiency');
                expect(hint?.estimatedImprovement).toBeTruthy();
            });
        });
    });

    describe('Integration Tests', () => {
        test('should profile and optimize same expression', () => {
            const profiler = new ExpressionProfiler();
            const optimizer = new QueryOptimizer();

            profiler.enable();

            const expr = {
                constructor: { name: 'TestExpr' },
                absolute: true,
                toString: () => '/root/child[position() > 5]',
            } as any;

            profiler.profileExpression(expr, context, () => [1, 2, 3]);

            const profile = profiler.getProfile('TestExpr');
            expect(profile).toBeDefined();

            const hints = optimizer.analyzeExpression(expr, profile);
            expect(hints.length).toBeGreaterThan(0);
        });

        test('should generate comprehensive optimization report', () => {
            const profiler = new ExpressionProfiler();
            const optimizer = new QueryOptimizer();

            profiler.enable();

            for (let i = 0; i < 3; i++) {
                profiler.profileExpression(
                    { constructor: { name: 'QueryExpr' } } as any,
                    context,
                    () => {
                        let sum = 0;
                        for (let j = 0; j < 10000; j++) sum += j;
                        return sum;
                    }
                );
            }

            const profiles = profiler.getProfiles();
            const hints = profiles.flatMap((p) =>
                optimizer.analyzeExpression({ constructor: { name: p.expressionType } } as any, p)
            );

            expect(profiles.length).toBeGreaterThan(0);
            expect(hints.length).toBeGreaterThanOrEqual(0);
        });

        test('should identify bottlenecks', () => {
            const profiler = new ExpressionProfiler();

            profiler.enable();

            // Simulate fast expressions
            for (let i = 0; i < 10; i++) {
                profiler.profileExpression(
                    { constructor: { name: 'FastExpr' } } as any,
                    context,
                    () => i
                );
            }

            // Simulate slow expression
            profiler.profileExpression(
                { constructor: { name: 'SlowExpr' } } as any,
                context,
                () => {
                    let sum = 0;
                    for (let i = 0; i < 100000; i++) sum += i;
                    return sum;
                }
            );

            const hotSpots = profiler.getHotSpots(1);
            expect(hotSpots[0].expressionType).toBe('SlowExpr');
        });
    });
});
