/**
 * XPath Expression Profiler
 *
 * Provides execution time, memory usage, and performance analysis for XPath expressions.
 * Helps identify performance bottlenecks and optimization opportunities.
 */

import { XPathExpression } from '../expressions/expression';
import { XPathContext } from '../context';

/**
 * Profile data for a single expression execution
 */
export interface ExpressionProfile {
    // Identification
    expressionType: string;
    expressionString?: string;

    // Timing (in milliseconds)
    executionTime: number;
    minTime: number;
    maxTime: number;
    avgTime: number;

    // Call count
    callCount: number;
    totalTime: number;

    // Memory (rough estimates in bytes)
    estimatedMemory: number;
    peakMemory: number;

    // Results
    resultCount: number;
    resultType: string;

    // Child expressions
    children?: Map<string, ExpressionProfile>;
}

/**
 * Global profiling context
 */
interface ProfilingContext {
    enabled: boolean;
    profiles: Map<string, ExpressionProfile>;
    currentStack: ExpressionProfile[];
    startMemory: number;
}

/**
 * Expression Profiler
 *
 * Tracks execution time, memory usage, and call frequencies for XPath expressions.
 */
export class ExpressionProfiler {
    private profiling: ProfilingContext;
    private warmupRuns: number;

    constructor(warmupRuns: number = 0) {
        this.profiling = {
            enabled: false,
            profiles: new Map(),
            currentStack: [],
            startMemory: 0,
        };
        this.warmupRuns = warmupRuns;
    }

    /**
     * Enable profiling
     */
    enable(): void {
        this.profiling.enabled = true;
        this.profiling.profiles.clear();
        this.profiling.currentStack = [];
        this.profiling.startMemory = this.getEstimatedMemory();
    }

    /**
     * Disable profiling
     */
    disable(): void {
        this.profiling.enabled = false;
    }

    /**
     * Check if profiling is enabled
     */
    isEnabled(): boolean {
        return this.profiling.enabled;
    }

    /**
     * Profile an expression execution
     */
    profileExpression<T>(
        expression: XPathExpression,
        context: XPathContext,
        execute: () => T
    ): T {
        if (!this.profiling.enabled) {
            return execute();
        }

        const startTime = performance.now();
        const startMem = this.getEstimatedMemory();

        try {
            // Run warmup iterations (not counted in profile)
            for (let i = 0; i < this.warmupRuns; i++) {
                execute();
            }

            // Run actual execution (counted)
            const result = execute();

            // Calculate metrics
            const endTime = performance.now();
            const endMem = this.getEstimatedMemory();
            const executionTime = endTime - startTime;
            const memoryUsed = Math.max(0, endMem - startMem);

            // Record profile
            const exprType = expression.constructor.name;
            const profileKey = this.getProfileKey(expression);

            this.recordProfile(
                profileKey,
                exprType,
                executionTime,
                memoryUsed,
                Array.isArray(result) ? result.length : result ? 1 : 0,
                typeof result
            );

            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get profile key for an expression
     */
    private getProfileKey(expression: XPathExpression): string {
        const type = expression.constructor.name;
        const existing = this.profiling.profiles.get(type) || {
            expressionType: type,
            executionTime: 0,
            minTime: Infinity,
            maxTime: 0,
            avgTime: 0,
            callCount: 0,
            totalTime: 0,
            estimatedMemory: 0,
            peakMemory: 0,
            resultCount: 0,
            resultType: 'unknown',
        };

        return type;
    }

    /**
     * Record expression profile
     */
    private recordProfile(
        key: string,
        exprType: string,
        executionTime: number,
        memory: number,
        resultCount: number,
        resultType: string
    ): void {
        let profile = this.profiling.profiles.get(key);

        if (!profile) {
            profile = {
                expressionType: exprType,
                executionTime,
                minTime: executionTime,
                maxTime: executionTime,
                avgTime: executionTime,
                callCount: 1,
                totalTime: executionTime,
                estimatedMemory: memory,
                peakMemory: memory,
                resultCount,
                resultType,
            };
        } else {
            profile.callCount++;
            profile.totalTime += executionTime;
            profile.avgTime = profile.totalTime / profile.callCount;
            profile.minTime = Math.min(profile.minTime, executionTime);
            profile.maxTime = Math.max(profile.maxTime, executionTime);
            profile.peakMemory = Math.max(profile.peakMemory, memory);
            profile.estimatedMemory += memory;
            profile.resultCount += resultCount;
        }

        this.profiling.profiles.set(key, profile);
    }

    /**
     * Get all recorded profiles
     */
    getProfiles(): ExpressionProfile[] {
        return Array.from(this.profiling.profiles.values());
    }

    /**
     * Get profile for a specific expression type
     */
    getProfile(exprType: string): ExpressionProfile | undefined {
        return this.profiling.profiles.get(exprType);
    }

    /**
     * Clear all profiles
     */
    clearProfiles(): void {
        this.profiling.profiles.clear();
    }

    /**
     * Get profile summary
     */
    getSummary(): {
        totalExecutionTime: number;
        totalCalls: number;
        slowestExpression: ExpressionProfile | null;
        fastestExpression: ExpressionProfile | null;
        heaviestMemory: ExpressionProfile | null;
        averageTime: number;
    } {
        const profiles = this.getProfiles();

        if (profiles.length === 0) {
            return {
                totalExecutionTime: 0,
                totalCalls: 0,
                slowestExpression: null,
                fastestExpression: null,
                heaviestMemory: null,
                averageTime: 0,
            };
        }

        const totalTime = profiles.reduce((sum, p) => sum + p.totalTime, 0);
        const totalCalls = profiles.reduce((sum, p) => sum + p.callCount, 0);
        const slowest = profiles.reduce((prev, curr) =>
            (curr.maxTime || 0) > (prev.maxTime || 0) ? curr : prev
        );
        const fastest = profiles.reduce((prev, curr) =>
            (curr.minTime || Infinity) < (prev.minTime || Infinity) ? curr : prev
        );
        const heaviest = profiles.reduce((prev, curr) =>
            (curr.peakMemory || 0) > (prev.peakMemory || 0) ? curr : prev
        );

        return {
            totalExecutionTime: totalTime,
            totalCalls,
            slowestExpression: slowest,
            fastestExpression: fastest,
            heaviestMemory: heaviest,
            averageTime: totalTime / totalCalls,
        };
    }

    /**
     * Get formatted profile report
     */
    getReport(): string {
        const profiles = this.getProfiles();
        const summary = this.getSummary();

        let report = '=== XPath Expression Performance Report ===\n\n';

        report += 'Summary:\n';
        report += `  Total Execution Time: ${summary.totalExecutionTime.toFixed(3)}ms\n`;
        report += `  Total Calls: ${summary.totalCalls}\n`;
        report += `  Average Time per Call: ${summary.averageTime.toFixed(3)}ms\n`;
        report += `  Slowest Expression: ${summary.slowestExpression?.expressionType} (${summary.slowestExpression?.maxTime.toFixed(3)}ms)\n`;
        report += `  Heaviest Memory: ${summary.heaviestMemory?.expressionType} (${this.formatBytes(summary.heaviestMemory?.peakMemory || 0)})\n\n`;

        // Sort by total time
        const sorted = profiles.sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0));

        report += 'Detailed Profiles (sorted by total time):\n';
        report += '─'.repeat(100) + '\n';
        report +=
            'Expression Type                  | Calls | Total Time | Avg Time | Min Time | Max Time | Memory\n';
        report += '─'.repeat(100) + '\n';

        for (const profile of sorted) {
            const exprType = profile.expressionType.padEnd(30);
            const calls = String(profile.callCount).padStart(5);
            const totalTime = `${profile.totalTime.toFixed(2)}ms`.padStart(10);
            const avgTime = `${profile.avgTime.toFixed(3)}ms`.padStart(8);
            const minTime = `${profile.minTime.toFixed(3)}ms`.padStart(8);
            const maxTime = `${profile.maxTime.toFixed(3)}ms`.padStart(8);
            const memory = this.formatBytes(profile.peakMemory || 0).padStart(8);

            report += `${exprType} | ${calls} | ${totalTime} | ${avgTime} | ${minTime} | ${maxTime} | ${memory}\n`;
        }

        return report;
    }

    /**
     * Get hot spots (slowest expressions)
     */
    getHotSpots(topN: number = 5): ExpressionProfile[] {
        return this.getProfiles()
            .sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
            .slice(0, topN);
    }

    /**
     * Get memory hotspots
     */
    getMemoryHotSpots(topN: number = 5): ExpressionProfile[] {
        return this.getProfiles()
            .sort((a, b) => (b.peakMemory || 0) - (a.peakMemory || 0))
            .slice(0, topN);
    }

    /**
     * Get frequency analysis (most called expressions)
     */
    getFrequencyAnalysis(topN: number = 5): ExpressionProfile[] {
        return this.getProfiles()
            .sort((a, b) => b.callCount - a.callCount)
            .slice(0, topN);
    }

    /**
     * Estimate memory usage (rough approximation)
     */
    private getEstimatedMemory(): number {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            return process.memoryUsage().heapUsed;
        }
        // Browser environment - use performance API if available
        if (typeof performance !== 'undefined' && (performance as any).memory) {
            return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
    }

    /**
     * Format bytes to human-readable size
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

/**
 * Global profiler instance
 */
let globalProfiler: ExpressionProfiler | null = null;

/**
 * Get or create global profiler
 */
export function getGlobalProfiler(): ExpressionProfiler {
    if (!globalProfiler) {
        globalProfiler = new ExpressionProfiler();
    }
    return globalProfiler;
}

/**
 * Reset global profiler
 */
export function resetGlobalProfiler(): void {
    globalProfiler = null;
}
