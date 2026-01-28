/**
 * Streaming Expression Analyzer
 *
 * Implements XSLT 3.0 Section 18 (Streaming) analysis rules to determine
 * which XPath expressions can be evaluated in streaming mode.
 *
 * Reference: https://www.w3.org/TR/xslt-30/#streaming
 */

import { XPathExpression } from '../expressions/expression';
import { XPathFunctionCall } from '../expressions/function-call-expression';
import { XPathLocationPath, XPathStep } from '../expressions';
import { XPathBinaryExpression } from '../expressions/binary-expression';
import { XPathArithmeticExpression } from '../expressions/arithmetic-expression';
import { XPathFilterExpression } from '../expressions/filter-expression';
import { XPathVariableReference } from '../expressions/variable-reference-expression';
import { XPathNumberLiteral, XPathStringLiteral } from '../expressions/literal-expression';

/**
 * Streaming posture of an expression
 *
 * - **grounded**: Expression accesses nodes within a bounded region (streamable)
 * - **roaming**: Expression can access any part of the document (not streamable)
 * - **consuming**: Expression must buffer its input (limited streaming)
 * - **motionless**: Expression doesn't navigate from context (fully streamable)
 */
export type StreamingPosture = 'grounded' | 'roaming' | 'consuming' | 'motionless';

/**
 * Sweep of an expression (how it moves through the tree)
 */
export type StreamingSweep =
    | 'motionless' // Doesn't navigate
    | 'downward' // Only moves to descendants
    | 'upward' // Moves to ancestors
    | 'free'; // Can move anywhere

/**
 * Analysis result for a streaming expression
 */
export interface StreamingAnalysis {
    /**
     * Whether the expression is streamable
     */
    streamable: boolean;

    /**
     * Streaming posture
     */
    posture: StreamingPosture;

    /**
     * Sweep direction
     */
    sweep: StreamingSweep;

    /**
     * Reason why expression is not streamable (if applicable)
     */
    reason?: string;

    /**
     * Whether expression requires buffering
     */
    requiresBuffering: boolean;

    /**
     * Estimated memory usage (0 = no buffering, 1 = full document)
     */
    memoryFootprint: number;
}

/**
 * Streaming Expression Analyzer
 *
 * Analyzes XPath expressions to determine streaming characteristics
 * according to XSLT 3.0 specification.
 */
export class StreamingAnalyzer {
    /**
     * Analyze an expression for streaming compatibility
     */
    analyze(expr: XPathExpression): StreamingAnalysis {
        // Default analysis for unknown expression types
        const analysis: StreamingAnalysis = {
            streamable: false,
            posture: 'roaming',
            sweep: 'free',
            requiresBuffering: true,
            memoryFootprint: 1.0,
        };

        // Literal expressions are motionless
        if (this.isLiteral(expr)) {
            return {
                streamable: true,
                posture: 'motionless',
                sweep: 'motionless',
                requiresBuffering: false,
                memoryFootprint: 0,
            };
        }

        // Variable references are motionless
        if (expr instanceof XPathVariableReference) {
            return {
                streamable: true,
                posture: 'motionless',
                sweep: 'motionless',
                requiresBuffering: false,
                memoryFootprint: 0,
            };
        }

        // Function calls - analyze based on function name
        if (expr instanceof XPathFunctionCall) {
            return this.analyzeFunctionCall(expr);
        }

        // Location paths - analyze axis usage
        if (expr instanceof XPathLocationPath) {
            return this.analyzeLocationPath(expr);
        }

        // Step expressions
        if (expr instanceof XPathStep) {
            return this.analyzeStep(expr as XPathStep);
        }

        // Filter expressions
        if (expr instanceof XPathFilterExpression) {
            return this.analyzeFilter(expr);
        }

        // Binary expressions
        if (expr instanceof XPathBinaryExpression || expr instanceof XPathArithmeticExpression) {
            return this.analyzeBinaryExpr(expr);
        }

        return analysis;
    }

    /**
     * Check if expression is a literal
     */
    private isLiteral(expr: XPathExpression): boolean {
        return expr instanceof XPathNumberLiteral || expr instanceof XPathStringLiteral;
    }

    /**
     * Analyze function call for streaming
     */
    private analyzeFunctionCall(expr: XPathFunctionCall): StreamingAnalysis {
        const streamableFunctions = new Set([
            'string',
            'number',
            'boolean',
            'not',
            'true',
            'false',
            'count',
            'empty',
            'exists',
            'head',
            'tail',
            'snapshot',
            'copy-of',
            'string-join',
            'concat',
            'contains',
            'starts-with',
            'ends-with',
            'substring',
            'string-length',
            'normalize-space',
            'upper-case',
            'lower-case',
        ]);

        const functionName = (expr as any).name?.toLowerCase() || '';

        if (streamableFunctions.has(functionName)) {
            // Streaming functions - motionless
            return {
                streamable: true,
                posture: 'motionless',
                sweep: 'motionless',
                requiresBuffering: false,
                memoryFootprint: 0,
            };
        }

        // Aggregate functions require buffering
        const aggregateFunctions = new Set(['sum', 'avg', 'min', 'max']);
        if (aggregateFunctions.has(functionName)) {
            return {
                streamable: true,
                posture: 'consuming',
                sweep: 'downward',
                requiresBuffering: true,
                memoryFootprint: 0.5,
                reason: 'Aggregate function requires buffering all input values',
            };
        }

        // Default: not streamable
        return {
            streamable: false,
            posture: 'roaming',
            sweep: 'free',
            requiresBuffering: true,
            memoryFootprint: 1.0,
            reason: `Function '${functionName}' is not streamable`,
        };
    }

    /**
     * Analyze location path for streaming
     */
    private analyzeLocationPath(expr: XPathLocationPath): StreamingAnalysis {
        // Absolute paths starting from root are not streamable
        if (expr.absolute) {
            return {
                streamable: false,
                posture: 'roaming',
                sweep: 'free',
                requiresBuffering: true,
                memoryFootprint: 1.0,
                reason: 'Absolute path from root requires full document',
            };
        }

        // Analyze steps
        const steps = expr.steps || [];
        let overallPosture: StreamingPosture = 'motionless';
        let overallSweep: StreamingSweep = 'motionless';
        let maxMemory = 0;

        for (const step of steps) {
            const stepAnalysis = this.analyzeStep(step);

            // If any step is not streamable, the whole path is not streamable
            if (!stepAnalysis.streamable) {
                return stepAnalysis;
            }

            // Combine postures (worst case)
            if (stepAnalysis.posture === 'roaming') {
                overallPosture = 'roaming';
            } else if (
                stepAnalysis.posture === 'consuming' &&
                overallPosture !== 'roaming'
            ) {
                overallPosture = 'consuming';
            } else if (
                stepAnalysis.posture === 'grounded' &&
                overallPosture === 'motionless'
            ) {
                overallPosture = 'grounded';
            }

            // Combine sweeps
            if (stepAnalysis.sweep === 'free') {
                overallSweep = 'free';
            } else if (stepAnalysis.sweep === 'upward' && overallSweep !== 'free') {
                overallSweep = 'upward';
            } else if (stepAnalysis.sweep === 'downward' && overallSweep === 'motionless') {
                overallSweep = 'downward';
            }

            maxMemory = Math.max(maxMemory, stepAnalysis.memoryFootprint);
        }

        return {
            streamable: overallPosture !== 'roaming',
            posture: overallPosture,
            sweep: overallSweep,
            requiresBuffering: overallPosture === 'consuming',
            memoryFootprint: maxMemory,
        };
    }

    /**
     * Analyze step expression for streaming
     */
    private analyzeStep(expr: XPathStep): StreamingAnalysis {
        const axis = expr.axis || 'child';
        const hasPredicates = expr.predicates && expr.predicates.length > 0;

        // Streamable axes (downward only)
        const streamableAxes = new Set(['child', 'descendant', 'descendant-or-self', 'attribute']);

        // Upward axes (require buffering)
        const upwardAxes = new Set(['parent', 'ancestor', 'ancestor-or-self']);

        // Non-streamable axes (require full document)
        const roamingAxes = new Set([
            'following',
            'following-sibling',
            'preceding',
            'preceding-sibling',
        ]);

        if (streamableAxes.has(axis)) {
            // Steps with predicates require buffering (consuming)
            if (hasPredicates) {
                return {
                    streamable: true,
                    posture: 'consuming',
                    sweep: 'downward',
                    requiresBuffering: true,
                    memoryFootprint: 0.4,
                    reason: 'Predicates require buffering',
                };
            }

            return {
                streamable: true,
                posture: 'grounded',
                sweep: 'downward',
                requiresBuffering: false,
                memoryFootprint: 0.1,
            };
        }

        if (upwardAxes.has(axis)) {
            return {
                streamable: true,
                posture: 'consuming',
                sweep: 'upward',
                requiresBuffering: true,
                memoryFootprint: 0.3,
                reason: `Axis '${axis}' requires buffering ancestor nodes`,
            };
        }

        if (roamingAxes.has(axis)) {
            return {
                streamable: false,
                posture: 'roaming',
                sweep: 'free',
                requiresBuffering: true,
                memoryFootprint: 1.0,
                reason: `Axis '${axis}' requires access to document order`,
            };
        }

        // Self axis is motionless
        if (axis === 'self') {
            return {
                streamable: true,
                posture: 'motionless',
                sweep: 'motionless',
                requiresBuffering: false,
                memoryFootprint: 0,
            };
        }

        // Default: not streamable
        return {
            streamable: false,
            posture: 'roaming',
            sweep: 'free',
            requiresBuffering: true,
            memoryFootprint: 1.0,
            reason: `Unknown axis: ${axis}`,
        };
    }

    /**
     * Analyze filter expression for streaming
     */
    private analyzeFilter(expr: XPathFilterExpression): StreamingAnalysis {
        // Filter expressions require buffering to apply predicates
        return {
            streamable: true,
            posture: 'consuming',
            sweep: 'downward',
            requiresBuffering: true,
            memoryFootprint: 0.5,
            reason: 'Filter expressions require buffering to apply predicates',
        };
    }

    /**
     * Analyze binary expression for streaming
     */
    private analyzeBinaryExpr(expr: XPathBinaryExpression | XPathArithmeticExpression): StreamingAnalysis {
        // Binary expressions are motionless if both operands are motionless
        // For simplicity, assume streamable with low memory footprint
        return {
            streamable: true,
            posture: 'motionless',
            sweep: 'motionless',
            requiresBuffering: false,
            memoryFootprint: 0,
        };
    }

    /**
     * Check if expression is motionless
     */
    isMotionless(expr: XPathExpression): boolean {
        const analysis = this.analyze(expr);
        return analysis.posture === 'motionless';
    }

    /**
     * Check if expression is grounded
     */
    isGrounded(expr: XPathExpression): boolean {
        const analysis = this.analyze(expr);
        return analysis.posture === 'grounded' || analysis.posture === 'motionless';
    }

    /**
     * Check if expression is streamable
     */
    isStreamable(expr: XPathExpression): boolean {
        const analysis = this.analyze(expr);
        return analysis.streamable;
    }

    /**
     * Get estimated memory footprint for expression
     */
    getMemoryFootprint(expr: XPathExpression): number {
        const analysis = this.analyze(expr);
        return analysis.memoryFootprint;
    }
}

/**
 * Global streaming analyzer instance
 */
export const streamingAnalyzer = new StreamingAnalyzer();
