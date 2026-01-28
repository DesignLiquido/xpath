/**
 * XPath Profiler Module
 *
 * Export all profiler-related classes and utilities
 */

export { ExpressionProfiler, getGlobalProfiler, resetGlobalProfiler } from './profiler';
export type { ExpressionProfile } from './profiler';

export { QueryOptimizer, getGlobalOptimizer, resetGlobalOptimizer } from './optimizer-hints';
export type { OptimizationHint, ComplexityMetrics } from './optimizer-hints';
