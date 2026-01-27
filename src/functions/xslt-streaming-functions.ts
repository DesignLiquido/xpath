/**
 * XSLT 3.0 Streaming Functions
 *
 * Provides streaming support for XSLT 3.0 transformations including:
 * - Accumulator functions
 * - Streaming-aware copy operations
 * - Performance-optimized sequential processing
 *
 * Note: These functions integrate with XSLT streaming mode to handle
 * large documents efficiently by processing them as streams rather than
 * building complete in-memory trees.
 */

import { XPathContext } from '../context';
import { XPathNode } from '../node';

/**
 * Accumulator state for streaming operations
 */
export interface AccumulatorState {
    /**
     * Current accumulator value
     */
    value: any;

    /**
     * Rules for accumulator updates (from xsl:accumulator-rule)
     */
    rules: AccumulatorRule[];

    /**
     * Snapshot of accumulator value before processing current node
     */
    preValue?: any;

    /**
     * Snapshot of accumulator value after processing current node
     */
    postValue?: any;
}

/**
 * Rule for updating accumulator during streaming
 */
export interface AccumulatorRule {
    /**
     * XPath pattern to match nodes
     */
    match: string;

    /**
     * Phase: 'pre' (before) or 'post' (after) node processing
     */
    phase: 'pre' | 'post';

    /**
     * Function to compute new accumulator value
     */
    select: (context: XPathContext, currentValue: any, node: XPathNode) => any;
}

/**
 * Registry of accumulator states during streaming
 */
class AccumulatorRegistry {
    private accumulators: Map<string, AccumulatorState> = new Map();

    /**
     * Register or update an accumulator
     */
    set(name: string, state: AccumulatorState): void {
        this.accumulators.set(name, state);
    }

    /**
     * Get accumulator state by name
     */
    get(name: string): AccumulatorState | undefined {
        return this.accumulators.get(name);
    }

    /**
     * Get all accumulators
     */
    getAll(): Map<string, AccumulatorState> {
        return new Map(this.accumulators);
    }

    /**
     * Clear all accumulators
     */
    clear(): void {
        this.accumulators.clear();
    }

    /**
     * Create a snapshot of current state
     */
    snapshot(): Map<string, any> {
        const snap = new Map<string, any>();
        Array.from(this.accumulators.entries()).forEach(([name, state]) => {
            snap.set(name, state.value);
        });
        return snap;
    }

    /**
     * Restore state from snapshot
     */
    restore(snapshot: Map<string, any>): void {
        Array.from(snapshot.entries()).forEach(([name, value]) => {
            const state = this.accumulators.get(name);
            if (state) {
                state.value = value;
                // Clear pre/post values when restoring
                state.preValue = undefined;
                state.postValue = undefined;
            }
        });
    }
}

/**
 * Accumulator before function - get accumulator value before processing node
 *
 * In streaming mode, accumulators are updated before and/or after processing
 * each node. This function returns the value before the current node is processed.
 *
 * @param context - XPath evaluation context
 * @param accumulatorName - Name of the accumulator
 * @returns The accumulator value before processing current node
 */
export function accumulatorBefore(context: XPathContext, accumulatorName: string): any {
    const registry = getAccumulatorRegistry(context);
    const state = registry.get(accumulatorName);

    if (!state) {
        throw new Error(`Accumulator not defined: ${accumulatorName}`);
    }

    if (state.preValue === undefined) {
        // If preValue not set, use current value
        return state.value;
    }

    return state.preValue;
}

/**
 * Accumulator after function - get accumulator value after processing node
 *
 * @param context - XPath evaluation context
 * @param accumulatorName - Name of the accumulator
 * @returns The accumulator value after processing current node
 */
export function accumulatorAfter(context: XPathContext, accumulatorName: string): any {
    const registry = getAccumulatorRegistry(context);
    const state = registry.get(accumulatorName);

    if (!state) {
        throw new Error(`Accumulator not defined: ${accumulatorName}`);
    }

    if (state.postValue === undefined) {
        // If postValue not set, use current value
        return state.value;
    }

    return state.postValue;
}

/**
 * Copy-of function with streaming support
 *
 * Creates a copy of nodes that is suitable for streaming mode.
 * In streaming mode, this may not create a complete deep copy but instead
 * create streaming-friendly references.
 *
 * @param context - XPath evaluation context
 * @param nodes - Nodes to copy
 * @param deepCopy - If true, perform deep copy (default: true)
 * @returns Copy of nodes
 */
export function copyOf(context: XPathContext, nodes: any, deepCopy: boolean = true): any {
    // Handle empty sequence - preserve undefined vs null
    if (nodes === undefined) {
        return undefined;
    }
    if (nodes === null) {
        return null;
    }

    // Handle single node
    if (nodes && typeof nodes === 'object' && nodes.nodeType !== undefined) {
        return deepCopy ? deepCopyNode(nodes) : shallowCopyNode(nodes);
    }

    // Handle array of nodes
    if (Array.isArray(nodes)) {
        return deepCopy ? nodes.map(deepCopyNode) : nodes.map(shallowCopyNode);
    }

    // Handle atomic values (return as-is)
    return nodes;
}

/**
 * Create a deep copy of a node
 */
function deepCopyNode(node: XPathNode): XPathNode {
    const copy: any = {
        nodeName: node.nodeName,
        nodeType: node.nodeType,
        nodeValue: (node as any).nodeValue,
    };

    // Copy attributes
    if ((node as any).attributes) {
        copy.attributes = Array.from((node as any).attributes);
    }

    // Copy children
    if ((node as any).childNodes) {
        copy.childNodes = Array.from((node as any).childNodes).map((child: XPathNode) => deepCopyNode(child));
    }

    // Copy parent reference (to original parent, not copy)
    if ((node as any).parentNode) {
        copy.parentNode = (node as any).parentNode;
    }

    return copy as XPathNode;
}

/**
 * Create a shallow copy of a node
 */
function shallowCopyNode(node: XPathNode): XPathNode {
    const copy: any = {
        nodeName: node.nodeName,
        nodeType: node.nodeType,
        nodeValue: (node as any).nodeValue,
    };

    // Copy attributes reference (not deep)
    if ((node as any).attributes) {
        copy.attributes = (node as any).attributes;
    }

    // Copy children reference (not deep)
    if ((node as any).childNodes) {
        copy.childNodes = (node as any).childNodes;
    }

    // Copy parent reference
    if ((node as any).parentNode) {
        copy.parentNode = (node as any).parentNode;
    }

    return copy as XPathNode;
}

/**
 * Get or create accumulator registry in context
 */
function getAccumulatorRegistry(context: XPathContext): AccumulatorRegistry {
    const key = '__xslt_accumulator_registry';
    let registry = (context as any)[key] as AccumulatorRegistry;

    if (!registry) {
        registry = new AccumulatorRegistry();
        (context as any)[key] = registry;
    }

    return registry;
}

/**
 * Register accumulators in context
 *
 * Called by XSLT processor to initialize accumulators before streaming starts
 */
export function registerAccumulators(
    context: XPathContext,
    accumulators: Record<string, AccumulatorState>
): void {
    const registry = getAccumulatorRegistry(context);
    for (const [name, state] of Object.entries(accumulators)) {
        registry.set(name, state);
    }
}

/**
 * Update accumulator value during streaming
 */
export function updateAccumulator(
    context: XPathContext,
    accumulatorName: string,
    newValue: any,
    phase: 'pre' | 'post' = 'post'
): void {
    const registry = getAccumulatorRegistry(context);
    const state = registry.get(accumulatorName);

    if (!state) {
        // Initialize if not exists
        const newState: AccumulatorState = {
            value: newValue,
            rules: [],
        };
        registry.set(accumulatorName, newState);
    } else {
        // Store previous value and update current
        if (phase === 'pre') {
            state.preValue = newValue;
            state.value = newValue;
        } else {
            state.postValue = newValue;
            state.value = newValue;
        }
    }
}

/**
 * Create a streaming context snapshot
 *
 * Used to save/restore state during streaming operations
 */
export function createStreamingSnapshot(context: XPathContext): Map<string, any> {
    const registry = getAccumulatorRegistry(context);
    return registry.snapshot();
}

/**
 * Restore streaming context from snapshot
 */
export function restoreStreamingSnapshot(context: XPathContext, snapshot: Map<string, any>): void {
    const registry = getAccumulatorRegistry(context);
    registry.restore(snapshot);
}

/**
 * XSLT 3.0 Streaming Functions Registry
 *
 * Maps function names to their implementations for registration with the parser
 */
export const xslt30StreamingFunctions = {
    'accumulator-before': {
        name: 'accumulator-before',
        minArgs: 1,
        maxArgs: 1,
        implementation: accumulatorBefore,
        description: 'Returns the value of an accumulator before processing the current node in streaming mode',
    },

    'accumulator-after': {
        name: 'accumulator-after',
        minArgs: 1,
        maxArgs: 1,
        implementation: accumulatorAfter,
        description: 'Returns the value of an accumulator after processing the current node in streaming mode',
    },

    'copy-of': {
        name: 'copy-of',
        minArgs: 1,
        maxArgs: 2,
        implementation: copyOf,
        description: 'Creates a copy of nodes suitable for streaming mode',
    },
};

/**
 * Export accumulator registry class for external use
 */
export { AccumulatorRegistry };
