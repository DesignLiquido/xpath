/**
 * Streaming Evaluation Test Suite
 *
 * Tests XSLT 3.0 streaming evaluation features including:
 * - Expression streamability analysis
 * - Grounded vs. roaming expressions
 * - Motionless expression detection
 * - Streaming context and buffering
 * - Memory footprint estimation
 */

import { StreamingAnalyzer, streamingAnalyzer } from '../src/streaming/analyzer';
import {
    StreamingContext,
    enableStreaming,
    disableStreaming,
    isStreamingEnabled,
    getStreamingStats,
    resetStreamingStats,
    updateStreamingStats,
    recordNonStreamable,
} from '../src/streaming/context';
import { XPath30Parser } from '../src/parser/parser-30';
import { XPathLexer } from '../src/lexer/lexer';
import { XPathContext } from '../src/context';

describe('Streaming Evaluation (XSLT 3.0)', () => {
    let parser: XPath30Parser;
    let lexer: XPathLexer;
    let analyzer: StreamingAnalyzer;

    beforeEach(() => {
        parser = new XPath30Parser();
        lexer = new XPathLexer({ version: '3.0' });
        analyzer = new StreamingAnalyzer();
    });

    /**
     * Helper to parse an expression
     */
    function parseExpr(xpath: string) {
        const tokens = lexer.scan(xpath);
        return parser.parse(tokens);
    }

    describe('Streamability Analysis', () => {
        describe('Motionless Expressions', () => {
            test('should classify literals as motionless', () => {
                const expr = parseExpr('42');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('motionless');
                expect(analysis.sweep).toBe('motionless');
                expect(analysis.requiresBuffering).toBe(false);
                expect(analysis.memoryFootprint).toBe(0);
            });

            test('should classify string literals as motionless', () => {
                const expr = parseExpr('"hello"');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('motionless');
            });

            test('should classify variable references as motionless', () => {
                const expr = parseExpr('$myVar');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('motionless');
                expect(analysis.memoryFootprint).toBe(0);
            });

            test('should classify binary expressions as motionless', () => {
                const expr = parseExpr('1 + 2');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('motionless');
            });
        });

        describe('Grounded Expressions (Streamable)', () => {
            test('should classify child axis as grounded', () => {
                const expr = parseExpr('child::element');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('grounded');
                expect(analysis.sweep).toBe('downward');
                expect(analysis.requiresBuffering).toBe(false);
                expect(analysis.memoryFootprint).toBeLessThan(0.5);
            });

            test('should classify descendant axis as grounded', () => {
                const expr = parseExpr('descendant::node()');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('grounded');
                expect(analysis.sweep).toBe('downward');
            });

            test('should classify attribute axis as grounded', () => {
                const expr = parseExpr('attribute::name');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('grounded');
            });

            test('should classify self axis as motionless', () => {
                const expr = parseExpr('self::node()');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('motionless');
            });
        });

        describe('Consuming Expressions (Limited Streaming)', () => {
            test('should classify parent axis as consuming', () => {
                const expr = parseExpr('parent::element');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('consuming');
                expect(analysis.sweep).toBe('upward');
                expect(analysis.requiresBuffering).toBe(true);
                expect(analysis.memoryFootprint).toBeGreaterThan(0);
            });

            test('should classify ancestor axis as consuming', () => {
                const expr = parseExpr('ancestor::div');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('consuming');
                expect(analysis.sweep).toBe('upward');
            });

            test('should classify filter expressions as consuming', () => {
                const expr = parseExpr('child::*[position() > 5]');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('consuming');
                expect(analysis.requiresBuffering).toBe(true);
            });

            test('should classify aggregate functions as consuming', () => {
                const expr = parseExpr('sum(//item)');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(true);
                expect(analysis.posture).toBe('consuming');
                expect(analysis.requiresBuffering).toBe(true);
            });
        });

        describe('Roaming Expressions (Non-Streamable)', () => {
            test('should classify following axis as roaming', () => {
                const expr = parseExpr('following::node()');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(false);
                expect(analysis.posture).toBe('roaming');
                expect(analysis.sweep).toBe('free');
                expect(analysis.memoryFootprint).toBe(1.0);
            });

            test('should classify preceding axis as roaming', () => {
                const expr = parseExpr('preceding::element');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(false);
                expect(analysis.posture).toBe('roaming');
            });

            test('should classify following-sibling axis as roaming', () => {
                const expr = parseExpr('following-sibling::*');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(false);
                expect(analysis.posture).toBe('roaming');
            });

            test('should classify preceding-sibling axis as roaming', () => {
                const expr = parseExpr('preceding-sibling::div');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(false);
                expect(analysis.posture).toBe('roaming');
            });

            test('should classify absolute paths as roaming', () => {
                const expr = parseExpr('/root/child');
                const analysis = analyzer.analyze(expr);

                expect(analysis.streamable).toBe(false);
                expect(analysis.posture).toBe('roaming');
                expect(analysis.reason).toContain('Absolute path');
            });
        });

        describe('Streamable Functions', () => {
            test('should classify string functions as streamable', () => {
                const functions = ['string()', 'concat("a", "b")', 'contains("test", "t")'];

                functions.forEach((fn) => {
                    const expr = parseExpr(fn);
                    const analysis = analyzer.analyze(expr);
                    expect(analysis.streamable).toBe(true);
                });
            });

            test('should classify boolean functions as streamable', () => {
                const functions = ['boolean(1)', 'not(false())', 'true()', 'false()'];

                functions.forEach((fn) => {
                    const expr = parseExpr(fn);
                    const analysis = analyzer.analyze(expr);
                    expect(analysis.streamable).toBe(true);
                });
            });

            test('should classify count/empty/exists as streamable', () => {
                const functions = ['count(//item)', 'empty(())', 'exists($var)'];

                functions.forEach((fn) => {
                    const expr = parseExpr(fn);
                    const analysis = analyzer.analyze(expr);
                    expect(analysis.streamable).toBe(true);
                });
            });
        });
    });

    describe('Streaming Context', () => {
        let context: XPathContext;

        beforeEach(() => {
            context = {
                variables: {},
            };
        });

        test('should enable streaming mode', () => {
            const streamingCtx = enableStreaming(context);

            expect(streamingCtx.isStreaming).toBe(true);
            expect(streamingCtx.streaming?.enabled).toBe(true);
            expect(streamingCtx.streamingBuffer).toBeDefined();
            expect(streamingCtx.streamingStats).toBeDefined();
        });

        test('should disable streaming mode', () => {
            const streamingCtx = enableStreaming(context);
            disableStreaming(streamingCtx);

            expect(streamingCtx.isStreaming).toBe(false);
            expect(streamingCtx.streaming?.enabled).toBe(false);
        });

        test('should check if streaming is enabled', () => {
            expect(isStreamingEnabled(context)).toBe(false);

            enableStreaming(context);
            expect(isStreamingEnabled(context)).toBe(true);
        });

        test('should initialize streaming statistics', () => {
            const streamingCtx = enableStreaming(context);
            const stats = getStreamingStats(streamingCtx);

            expect(stats).toBeDefined();
            expect(stats?.nodesProcessed).toBe(0);
            expect(stats?.peakBufferSize).toBe(0);
            expect(stats?.nonStreamableCount).toBe(0);
            expect(stats?.efficiency).toBe(1.0);
        });

        test('should allow custom streaming configuration', () => {
            const streamingCtx = enableStreaming(context, {
                maxBufferSize: 500,
                maxMemoryFootprint: 0.2,
                strictMode: true,
            });

            expect(streamingCtx.streaming?.maxBufferSize).toBe(500);
            expect(streamingCtx.streaming?.maxMemoryFootprint).toBe(0.2);
            expect(streamingCtx.streaming?.strictMode).toBe(true);
        });

        test('should reset streaming statistics', () => {
            const streamingCtx = enableStreaming(context) as StreamingContext;

            // Simulate some processing
            streamingCtx.streamingStats!.nodesProcessed = 100;
            streamingCtx.streamingStats!.nonStreamableCount = 5;

            resetStreamingStats(streamingCtx);

            expect(streamingCtx.streamingStats!.nodesProcessed).toBe(0);
            expect(streamingCtx.streamingStats!.nonStreamableCount).toBe(0);
        });
    });

    describe('Streaming Buffer', () => {
        let context: StreamingContext;

        beforeEach(() => {
            context = enableStreaming({}, { maxBufferSize: 10 });
        });

        test('should buffer nodes during streaming', () => {
            const mockNode: any = { nodeType: 1, nodeName: 'test' };

            context.streamingBuffer!.add(mockNode);

            expect(context.streamingBuffer!.size()).toBe(1);
            expect(context.streamingBuffer!.contains(mockNode)).toBe(true);
        });

        test('should respect max buffer size', () => {
            for (let i = 0; i < 15; i++) {
                context.streamingBuffer!.add({ nodeType: 1, nodeName: `node${i}` } as any);
            }

            expect(context.streamingBuffer!.size()).toBe(10);
            expect(context.streamingBuffer!.isFull()).toBe(true);
        });

        test('should get last N nodes from buffer', () => {
            for (let i = 0; i < 5; i++) {
                context.streamingBuffer!.add({ nodeType: 1, nodeName: `node${i}` } as any);
            }

            const lastTwo = context.streamingBuffer!.getLast(2);
            expect(lastTwo.length).toBe(2);
            expect(lastTwo[0].nodeName).toBe('node3');
            expect(lastTwo[1].nodeName).toBe('node4');
        });

        test('should clear buffer', () => {
            context.streamingBuffer!.add({ nodeType: 1 } as any);
            context.streamingBuffer!.clear();

            expect(context.streamingBuffer!.size()).toBe(0);
        });
    });

    describe('Streaming Statistics', () => {
        let context: StreamingContext;

        beforeEach(() => {
            context = enableStreaming({});
        });

        test('should track nodes processed', () => {
            const mockNode: any = { nodeType: 1 };

            updateStreamingStats(context, mockNode);
            updateStreamingStats(context, mockNode);
            updateStreamingStats(context, mockNode);

            expect(context.streamingStats!.nodesProcessed).toBe(3);
        });

        test('should track peak buffer size', () => {
            for (let i = 0; i < 5; i++) {
                context.streamingBuffer!.add({ nodeType: 1 } as any);
                updateStreamingStats(context, { nodeType: 1 } as any);
            }

            expect(context.streamingStats!.peakBufferSize).toBeGreaterThan(0);
        });

        test('should estimate memory usage', () => {
            for (let i = 0; i < 10; i++) {
                context.streamingBuffer!.add({ nodeType: 1 } as any);
                updateStreamingStats(context, { nodeType: 1 } as any);
            }

            expect(context.streamingStats!.memoryUsed).toBeGreaterThan(0);
        });

        test('should calculate streaming efficiency', () => {
            updateStreamingStats(context, { nodeType: 1 } as any);

            expect(context.streamingStats!.efficiency).toBeGreaterThan(0);
            expect(context.streamingStats!.efficiency).toBeLessThanOrEqual(1.0);
        });

        test('should record non-streamable expressions', () => {
            recordNonStreamable(context, 'Test reason');

            expect(context.streamingStats!.nonStreamableCount).toBe(1);
        });

        test('should throw error in strict mode', () => {
            context.streaming!.strictMode = true;

            expect(() => {
                recordNonStreamable(context, 'Non-streamable expression');
            }).toThrow('Streaming error');
        });
    });

    describe('Helper Methods', () => {
        test('isMotionless should identify motionless expressions', () => {
            const motionless = parseExpr('42');
            const notMotionless = parseExpr('child::*');

            expect(analyzer.isMotionless(motionless)).toBe(true);
            expect(analyzer.isMotionless(notMotionless)).toBe(false);
        });

        test('isGrounded should identify grounded expressions', () => {
            const grounded = parseExpr('child::element');
            const roaming = parseExpr('following::*');

            expect(analyzer.isGrounded(grounded)).toBe(true);
            expect(analyzer.isGrounded(roaming)).toBe(false);
        });

        test('isStreamable should identify streamable expressions', () => {
            const streamable = parseExpr('descendant::node()');
            const nonStreamable = parseExpr('preceding::*');

            expect(analyzer.isStreamable(streamable)).toBe(true);
            expect(analyzer.isStreamable(nonStreamable)).toBe(false);
        });

        test('getMemoryFootprint should return estimated footprint', () => {
            const literal = parseExpr('42');
            const consuming = parseExpr('ancestor::*');
            const roaming = parseExpr('following::*');

            expect(analyzer.getMemoryFootprint(literal)).toBe(0);
            expect(analyzer.getMemoryFootprint(consuming)).toBeGreaterThan(0);
            expect(analyzer.getMemoryFootprint(roaming)).toBe(1.0);
        });
    });

    describe('Complex Streaming Scenarios', () => {
        test('should analyze complex path with multiple steps', () => {
            const expr = parseExpr('child::div/child::p/child::span');
            const analysis = analyzer.analyze(expr);

            expect(analysis.streamable).toBe(true);
            expect(analysis.posture).toBe('grounded');
            expect(analysis.sweep).toBe('downward');
        });

        test('should detect mixed streamability in path', () => {
            // This would fail if we could parse it: child::div/preceding::span
            // For now, test individual axes
            const streamable = parseExpr('child::div');
            const nonStreamable = parseExpr('preceding::span');

            expect(analyzer.isStreamable(streamable)).toBe(true);
            expect(analyzer.isStreamable(nonStreamable)).toBe(false);
        });

        test('should handle nested function calls', () => {
            const expr = parseExpr('string(concat("a", "b"))');
            const analysis = analyzer.analyze(expr);

            expect(analysis.streamable).toBe(true);
            expect(analysis.posture).toBe('motionless');
        });
    });

    describe('Specification Compliance', () => {
        test('should follow XSLT 3.0 streaming rules', () => {
            // Per XSLT 3.0 Section 18:
            // - child, descendant, attribute axes are streamable
            // - parent, ancestor axes require buffering (consuming)
            // - following, preceding axes are not streamable (roaming)

            const child = parseExpr('child::*');
            const parent = parseExpr('parent::*');
            const following = parseExpr('following::*');

            expect(analyzer.analyze(child).posture).toBe('grounded');
            expect(analyzer.analyze(parent).posture).toBe('consuming');
            expect(analyzer.analyze(following).posture).toBe('roaming');
        });

        test('should classify postures correctly per spec', () => {
            // Motionless: no navigation
            // Grounded: bounded navigation (downward)
            // Consuming: requires buffering (upward)
            // Roaming: unbounded navigation

            expect(analyzer.analyze(parseExpr('42')).posture).toBe('motionless');
            expect(analyzer.analyze(parseExpr('child::*')).posture).toBe('grounded');
            expect(analyzer.analyze(parseExpr('ancestor::*')).posture).toBe('consuming');
            expect(analyzer.analyze(parseExpr('following::*')).posture).toBe('roaming');
        });

        test('should follow sweep direction rules', () => {
            expect(analyzer.analyze(parseExpr('42')).sweep).toBe('motionless');
            expect(analyzer.analyze(parseExpr('child::*')).sweep).toBe('downward');
            expect(analyzer.analyze(parseExpr('parent::*')).sweep).toBe('upward');
            expect(analyzer.analyze(parseExpr('following::*')).sweep).toBe('free');
        });
    });
});
