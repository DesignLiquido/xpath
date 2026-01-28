/**
 * Streaming Context Support
 *
 * Extends XPath context with streaming mode capabilities for
 * efficient processing of large XML documents.
 */

import { XPathContext } from '../context';
import { XPathNode } from '../node';

/**
 * Streaming mode configuration
 */
export interface StreamingConfig {
    /**
     * Enable streaming mode
     */
    enabled: boolean;

    /**
     * Maximum buffer size for grounded expressions (in nodes)
     */
    maxBufferSize: number;

    /**
     * Maximum memory footprint (0-1, where 1 = full document)
     */
    maxMemoryFootprint: number;

    /**
     * Warn when non-streamable expressions are encountered
     */
    warnOnNonStreamable: boolean;

    /**
     * Throw error on non-streamable expressions (strict mode)
     */
    strictMode: boolean;
}

/**
 * Streaming buffer for grounded expressions
 */
export class StreamingBuffer {
    private buffer: XPathNode[] = [];
    private maxSize: number;

    constructor(maxSize: number = 1000) {
        this.maxSize = maxSize;
    }

    /**
     * Add node to buffer
     */
    add(node: XPathNode): void {
        if (this.buffer.length >= this.maxSize) {
            // Remove oldest node to stay within limit
            this.buffer.shift();
        }
        this.buffer.push(node);
    }

    /**
     * Get all buffered nodes
     */
    getAll(): XPathNode[] {
        return [...this.buffer];
    }

    /**
     * Get last N nodes from buffer
     */
    getLast(n: number): XPathNode[] {
        return this.buffer.slice(-n);
    }

    /**
     * Check if buffer contains node
     */
    contains(node: XPathNode): boolean {
        return this.buffer.includes(node);
    }

    /**
     * Clear buffer
     */
    clear(): void {
        this.buffer = [];
    }

    /**
     * Get buffer size
     */
    size(): number {
        return this.buffer.length;
    }

    /**
     * Check if buffer is full
     */
    isFull(): boolean {
        return this.buffer.length >= this.maxSize;
    }
}

/**
 * Streaming evaluation statistics
 */
export interface StreamingStats {
    /**
     * Total nodes processed
     */
    nodesProcessed: number;

    /**
     * Peak buffer size
     */
    peakBufferSize: number;

    /**
     * Number of non-streamable expressions encountered
     */
    nonStreamableCount: number;

    /**
     * Total memory used (approximate, in bytes)
     */
    memoryUsed: number;

    /**
     * Streaming efficiency (0-1, where 1 = perfect streaming)
     */
    efficiency: number;
}

/**
 * Extended context for streaming evaluation
 */
export interface StreamingContext extends XPathContext {
    /**
     * Streaming configuration
     */
    streaming?: StreamingConfig;

    /**
     * Streaming buffer
     */
    streamingBuffer?: StreamingBuffer;

    /**
     * Streaming statistics
     */
    streamingStats?: StreamingStats;

    /**
     * Current streaming depth (how many ancestors buffered)
     */
    streamingDepth?: number;

    /**
     * Whether currently in streaming mode
     */
    isStreaming?: boolean;
}

/**
 * Default streaming configuration
 */
export const DEFAULT_STREAMING_CONFIG: StreamingConfig = {
    enabled: false,
    maxBufferSize: 1000,
    maxMemoryFootprint: 0.1, // 10% of document size
    warnOnNonStreamable: true,
    strictMode: false,
};

/**
 * Enable streaming mode on a context
 */
export function enableStreaming(
    context: XPathContext,
    config: Partial<StreamingConfig> = {}
): StreamingContext {
    const streamingContext = context as StreamingContext;

    streamingContext.streaming = {
        ...DEFAULT_STREAMING_CONFIG,
        ...config,
        enabled: true,
    };

    streamingContext.streamingBuffer = new StreamingBuffer(
        streamingContext.streaming.maxBufferSize
    );

    streamingContext.streamingStats = {
        nodesProcessed: 0,
        peakBufferSize: 0,
        nonStreamableCount: 0,
        memoryUsed: 0,
        efficiency: 1.0,
    };

    streamingContext.streamingDepth = 0;
    streamingContext.isStreaming = true;

    return streamingContext;
}

/**
 * Disable streaming mode on a context
 */
export function disableStreaming(context: StreamingContext): XPathContext {
    context.streaming = {
        ...DEFAULT_STREAMING_CONFIG,
        enabled: false,
    };
    context.streamingBuffer = undefined;
    context.streamingStats = undefined;
    context.streamingDepth = 0;
    context.isStreaming = false;

    return context;
}

/**
 * Check if context is in streaming mode
 */
export function isStreamingEnabled(context: XPathContext): boolean {
    const streamingContext = context as StreamingContext;
    return streamingContext.streaming?.enabled === true && streamingContext.isStreaming === true;
}

/**
 * Get streaming statistics from context
 */
export function getStreamingStats(context: StreamingContext): StreamingStats | undefined {
    return context.streamingStats;
}

/**
 * Reset streaming statistics
 */
export function resetStreamingStats(context: StreamingContext): void {
    if (context.streamingStats) {
        context.streamingStats.nodesProcessed = 0;
        context.streamingStats.peakBufferSize = 0;
        context.streamingStats.nonStreamableCount = 0;
        context.streamingStats.memoryUsed = 0;
        context.streamingStats.efficiency = 1.0;
    }
}

/**
 * Update streaming statistics after processing a node
 */
export function updateStreamingStats(context: StreamingContext, node: XPathNode): void {
    if (!context.streamingStats) return;

    context.streamingStats.nodesProcessed++;

    if (context.streamingBuffer) {
        const bufferSize = context.streamingBuffer.size();
        context.streamingStats.peakBufferSize = Math.max(
            context.streamingStats.peakBufferSize,
            bufferSize
        );

        // Estimate memory usage (rough approximation)
        context.streamingStats.memoryUsed = bufferSize * 1000; // ~1KB per node
    }

    // Calculate efficiency based on buffer usage
    if (context.streaming && context.streamingBuffer) {
        const bufferUsage =
            context.streamingBuffer.size() / context.streaming.maxBufferSize;
        context.streamingStats.efficiency = 1.0 - bufferUsage * 0.5;
    }
}

/**
 * Record non-streamable expression encountered
 */
export function recordNonStreamable(context: StreamingContext, reason: string): void {
    if (!context.streamingStats) return;

    context.streamingStats.nonStreamableCount++;

    if (context.streaming?.warnOnNonStreamable) {
        console.warn(`[Streaming] Non-streamable expression: ${reason}`);
    }

    if (context.streaming?.strictMode) {
        throw new Error(`Streaming error: ${reason}`);
    }
}
