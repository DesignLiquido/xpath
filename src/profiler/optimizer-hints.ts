/**
 * XPath Query Optimizer Hints
 *
 * Analyzes XPath expressions and provides optimization suggestions
 * based on query structure and complexity.
 */

import { XPathExpression } from '../expressions/expression';
import { XPathLocationPath } from '../expressions';
import { XPathFunctionCall } from '../expressions/function-call-expression';
import { ExpressionProfile } from './profiler';

/**
 * Optimization hint
 */
export interface OptimizationHint {
    severity: 'info' | 'warning' | 'error';
    category: string;
    message: string;
    suggestion: string;
    estimatedImprovement?: string;
}

/**
 * Expression complexity metrics
 */
export interface ComplexityMetrics {
    depth: number;
    breadth: number;
    predicateCount: number;
    functionCallCount: number;
    axisCount: number;
    complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
}

/**
 * Query Optimizer
 *
 * Analyzes expressions and profiles to provide optimization suggestions.
 */
export class QueryOptimizer {
    /**
     * Analyze expression for optimization opportunities
     */
    analyzeExpression(expression: XPathExpression, profile?: ExpressionProfile): OptimizationHint[] {
        const hints: OptimizationHint[] = [];

        // Check expression type
        hints.push(...this.checkAbsolutePaths(expression));
        hints.push(...this.checkPredicates(expression));
        hints.push(...this.checkFunctionCalls(expression));
        hints.push(...this.checkComplexity(expression));

        // Check performance profile if available
        if (profile) {
            hints.push(...this.checkPerformanceProfile(profile));
        }

        return hints;
    }

    /**
     * Check for absolute path inefficiencies
     */
    private checkAbsolutePaths(expression: XPathExpression): OptimizationHint[] {
        const hints: OptimizationHint[] = [];
        const expr = expression as any;

        // Check for absolute path using instanceof or property
        const isLocationPath = expression instanceof XPathLocationPath || expr.constructor?.name === 'XPathLocationPath';
        const isAbsolute = expr.absolute === true;

        if (isLocationPath && isAbsolute) {
            hints.push({
                severity: 'warning',
                category: 'Absolute Paths',
                message: 'Expression uses absolute path (/) which scans entire document',
                suggestion: 'Consider using relative paths or context nodes when possible',
                estimatedImprovement: '10-50% faster depending on document size',
            });
        }

        return hints;
    }

    /**
     * Check for inefficient predicates
     */
    private checkPredicates(expression: XPathExpression): OptimizationHint[] {
        const hints: OptimizationHint[] = [];
        const exprStr = (expression as any).toString?.();

        // Check for position() in predicates which can be slow
        if (exprStr && exprStr.includes('position()')) {
            hints.push({
                severity: 'warning',
                category: 'Predicate Efficiency',
                message: 'Using position() in predicate requires re-evaluation for each node',
                suggestion: 'Consider using [1], [last()], or numeric predicates instead',
                estimatedImprovement: '20-100% faster for large node sets',
            });
        }

        // Check for complex predicates
        if (exprStr && exprStr.includes('[') && exprStr.match(/\[[^\]]*\[[^\]]*\]\]/)) {
            hints.push({
                severity: 'warning',
                category: 'Predicate Complexity',
                message: 'Nested predicates can be inefficient',
                suggestion: 'Consider breaking into multiple steps or using different axes',
                estimatedImprovement: '5-20% faster',
            });
        }

        return hints;
    }

    /**
     * Check for inefficient function calls
     */
    private checkFunctionCalls(expression: XPathExpression): OptimizationHint[] {
        const hints: OptimizationHint[] = [];

        if (expression instanceof XPathFunctionCall) {
            const funcName = (expression as any).name || '';

            // Check for expensive functions
            const expensiveFunctions = [
                'normalize-space',
                'translate',
                'regex-based functions',
                '//path',
                'ancestor::',
                'preceding::',
                'following::',
            ];

            for (const expensive of expensiveFunctions) {
                if (funcName.includes(expensive) || funcName.toLowerCase() === expensive) {
                    hints.push({
                        severity: 'info',
                        category: 'Function Performance',
                        message: `Function '${funcName}' can be expensive for large inputs`,
                        suggestion: 'Consider if this operation is necessary or can be optimized',
                        estimatedImprovement: '5-15% faster with optimization',
                    });
                }
            }

            // Check for string functions on large sequences
            const stringFunctions = ['string-length', 'substring', 'concat', 'matches'];
            if (stringFunctions.includes(funcName)) {
                hints.push({
                    severity: 'info',
                    category: 'Function Performance',
                    message: `String function '${funcName}' can be slow when called repeatedly`,
                    suggestion: 'Consider caching results or reducing function call frequency',
                    estimatedImprovement: '10-30% faster with optimization',
                });
            }
        }

        return hints;
    }

    /**
     * Check expression complexity
     */
    private checkComplexity(expression: XPathExpression): OptimizationHint[] {
        const hints: OptimizationHint[] = [];
        const metrics = this.getComplexityMetrics(expression);

        if (metrics.complexity === 'very-complex') {
            hints.push({
                severity: 'warning',
                category: 'Expression Complexity',
                message: 'Expression is very complex with high depth/breadth',
                suggestion: 'Consider breaking into multiple simpler expressions',
                estimatedImprovement: '10-40% faster with simplification',
            });
        } else if (metrics.complexity === 'complex') {
            hints.push({
                severity: 'info',
                category: 'Expression Complexity',
                message: 'Expression is complex with multiple levels of nesting',
                suggestion: 'Review if all parts are necessary',
                estimatedImprovement: '5-20% faster with optimization',
            });
        } else if (metrics.complexity === 'moderate') {
            hints.push({
                severity: 'info',
                category: 'Expression Complexity',
                message: 'Expression has moderate complexity',
                suggestion: 'Consider simplifying if not needed',
                estimatedImprovement: '2-10% faster with simplification',
            });
        }

        if (metrics.predicateCount >= 3) {
            hints.push({
                severity: 'warning',
                category: 'Predicate Filtering',
                message: `Expression has ${metrics.predicateCount} predicates which compounds filtering cost`,
                suggestion: 'Consider combining predicates where possible',
                estimatedImprovement: '15-50% faster',
            });
        }

        return hints;
    }

    /**
     * Check performance profile for bottlenecks
     */
    private checkPerformanceProfile(profile: ExpressionProfile): OptimizationHint[] {
        const hints: OptimizationHint[] = [];

        // Check if execution time is high
        if ((profile.maxTime || 0) > 100) {
            hints.push({
                severity: 'warning',
                category: 'Performance',
                message: `Expression type '${profile.expressionType}' is taking >100ms per execution`,
                suggestion: 'Consider profiling to find bottlenecks within this expression',
                estimatedImprovement: 'Varies - depends on specific implementation',
            });
        }

        // Check if memory usage is high
        if ((profile.peakMemory || 0) > 1024 * 1024) {
            hints.push({
                severity: 'warning',
                category: 'Memory Usage',
                message: `Expression type '${profile.expressionType}' uses >1MB of memory`,
                suggestion: 'Consider optimizing for memory usage (streaming, lazy evaluation)',
                estimatedImprovement: '20-60% less memory with optimization',
            });
        }

        // Check if called frequently
        if (profile.callCount > 1000) {
            hints.push({
                severity: 'info',
                category: 'Call Frequency',
                message: `Expression type '${profile.expressionType}' is called ${profile.callCount} times`,
                suggestion: 'Consider caching results or using memoization',
                estimatedImprovement: '30-80% faster with caching',
            });
        }

        return hints;
    }

    /**
     * Get expression complexity metrics
     */
    getComplexityMetrics(expression: XPathExpression): ComplexityMetrics {
        const metrics: ComplexityMetrics = {
            depth: this.getExpressionDepth(expression),
            breadth: this.getExpressionBreadth(expression),
            predicateCount: this.countPredicates(expression),
            functionCallCount: this.countFunctionCalls(expression),
            axisCount: this.countAxes(expression),
            complexity: 'simple',
        };

        // Determine complexity level
        const score = metrics.depth * 2 + metrics.breadth + metrics.predicateCount * 3 + metrics.functionCallCount;

        if (score > 50) {
            metrics.complexity = 'very-complex';
        } else if (score > 20) {
            metrics.complexity = 'complex';
        } else if (score > 5) {
            metrics.complexity = 'moderate';
        }

        return metrics;
    }

    /**
     * Get expression tree depth
     */
    private getExpressionDepth(expression: XPathExpression, depth: number = 0): number {
        let maxDepth = depth;

        // Check common expression properties for child expressions
        const childExpressions: XPathExpression[] = [];

        if ((expression as any).left) childExpressions.push((expression as any).left);
        if ((expression as any).right) childExpressions.push((expression as any).right);
        if ((expression as any).test) childExpressions.push((expression as any).test);
        if ((expression as any).expression) childExpressions.push((expression as any).expression);
        if ((expression as any).operand) childExpressions.push((expression as any).operand);
        if ((expression as any).expressions && Array.isArray((expression as any).expressions)) {
            childExpressions.push(...(expression as any).expressions);
        }
        if ((expression as any).arguments && Array.isArray((expression as any).arguments)) {
            childExpressions.push(...(expression as any).arguments);
        }

        for (const child of childExpressions) {
            // Works with both real XPathExpression and mock test objects
            if (child && typeof child === 'object') {
                maxDepth = Math.max(maxDepth, this.getExpressionDepth(child as any, depth + 1));
            }
        }

        return maxDepth;
    }

    /**
     * Get expression tree breadth (max children at any level)
     */
    private getExpressionBreadth(expression: XPathExpression): number {
        let maxBreadth = 0;

        const getChildCount = (expr: XPathExpression): number => {
            let count = 0;
            if ((expr as any).left) count++;
            if ((expr as any).right) count++;
            if ((expr as any).test) count++;
            if ((expr as any).expression) count++;
            if ((expr as any).operand) count++;
            if ((expr as any).expressions && Array.isArray((expr as any).expressions)) {
                count += (expr as any).expressions.length;
            }
            if ((expr as any).arguments && Array.isArray((expr as any).arguments)) {
                count += (expr as any).arguments.length;
            }
            return count;
        };

        const traverse = (expr: XPathExpression) => {
            const childCount = getChildCount(expr);
            maxBreadth = Math.max(maxBreadth, childCount);

            const childExpressions: XPathExpression[] = [];
            if ((expr as any).left) childExpressions.push((expr as any).left);
            if ((expr as any).right) childExpressions.push((expr as any).right);
            if ((expr as any).expressions && Array.isArray((expr as any).expressions)) {
                childExpressions.push(...(expr as any).expressions);
            }
            if ((expr as any).arguments && Array.isArray((expr as any).arguments)) {
                childExpressions.push(...(expr as any).arguments);
            }

            for (const child of childExpressions) {
                if (child && typeof child === 'object') {
                    traverse(child as any);
                }
            }
        };

        traverse(expression);
        return maxBreadth;
    }

    /**
     * Count predicates in expression tree
     */
    private countPredicates(expression: XPathExpression): number {
        let count = 0;

        if ((expression as any).predicates && Array.isArray((expression as any).predicates)) {
            count += (expression as any).predicates.length;
        }

        // Traverse child expressions
        const childExpressions: XPathExpression[] = [];
        if ((expression as any).left) childExpressions.push((expression as any).left);
        if ((expression as any).right) childExpressions.push((expression as any).right);
        if ((expression as any).expressions && Array.isArray((expression as any).expressions)) {
            childExpressions.push(...(expression as any).expressions);
        }
        if ((expression as any).arguments && Array.isArray((expression as any).arguments)) {
            childExpressions.push(...(expression as any).arguments);
        }

        for (const child of childExpressions) {
            if (child && typeof child === 'object') {
                count += this.countPredicates(child as any);
            }
        }

        return count;
    }

    /**
     * Count function calls in expression tree
     */
    private countFunctionCalls(expression: XPathExpression): number {
        let count = 0;

        if (expression instanceof XPathFunctionCall || (expression as any).constructor?.name === 'XPathFunctionCall') {
            count++;
        }

        // Traverse child expressions
        const childExpressions: XPathExpression[] = [];
        if ((expression as any).left) childExpressions.push((expression as any).left);
        if ((expression as any).right) childExpressions.push((expression as any).right);
        if ((expression as any).arguments && Array.isArray((expression as any).arguments)) {
            childExpressions.push(...(expression as any).arguments);
        }

        for (const child of childExpressions) {
            if (child && typeof child === 'object') {
                count += this.countFunctionCalls(child as any);
            }
        }

        return count;
    }

    /**
     * Count axes in expression tree
     */
    private countAxes(expression: XPathExpression): number {
        let count = 0;

        if ((expression as any).axis) {
            count++;
        }

        // Traverse child expressions
        const childExpressions: XPathExpression[] = [];
        if ((expression as any).left) childExpressions.push((expression as any).left);
        if ((expression as any).right) childExpressions.push((expression as any).right);
        if ((expression as any).steps && Array.isArray((expression as any).steps)) {
            childExpressions.push(...(expression as any).steps);
        }

        for (const child of childExpressions) {
            if (child && typeof child === 'object') {
                count += this.countAxes(child as any);
            }
        }

        return count;
    }
}

/**
 * Global optimizer instance
 */
let globalOptimizer: QueryOptimizer | null = null;

/**
 * Get or create global optimizer
 */
export function getGlobalOptimizer(): QueryOptimizer {
    if (!globalOptimizer) {
        globalOptimizer = new QueryOptimizer();
    }
    return globalOptimizer;
}

/**
 * Reset global optimizer
 */
export function resetGlobalOptimizer(): void {
    globalOptimizer = null;
}
