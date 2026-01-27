/**
 * Expression Cache Module
 *
 * Implements an LRU (Least Recently Used) cache for compiled XPath expressions.
 * This improves performance when the same expression is executed multiple times.
 *
 * Features:
 * - Configurable cache size (default: 1000 entries)
 * - Automatic eviction of least recently used items
 * - Cache statistics tracking
 * - Thread-safe operations
 * - Configurable TTL (time-to-live) for entries
 */

import { XPathExpression } from '../expressions/index';

export interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: number;
    hits: number;
    lastAccessed: number;
}

export interface CacheStatistics {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    totalEntries: number;
    maxSize: number;
}

export class ExpressionCache {
    private cache: Map<string, CacheEntry<XPathExpression>>;
    private maxSize: number;
    private ttl: number | null; // milliseconds, null = no TTL
    private hits: number = 0;
    private misses: number = 0;
    private evictionPolicy: 'LRU' | 'LFU' | 'FIFO' = 'LRU';

    /**
     * Create a new expression cache
     *
     * @param maxSize - Maximum number of entries (default: 1000)
     * @param ttl - Time to live in milliseconds (default: null = no expiration)
     * @param evictionPolicy - Eviction policy: 'LRU', 'LFU', or 'FIFO' (default: 'LRU')
     */
    constructor(maxSize: number = 1000, ttl: number | null = null, evictionPolicy: 'LRU' | 'LFU' | 'FIFO' = 'LRU') {
        if (maxSize <= 0) {
            throw new Error('Cache size must be greater than 0');
        }
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.evictionPolicy = evictionPolicy;
    }

    /**
     * Get a cached expression by key
     *
     * @param key - Cache key (typically the expression string)
     * @returns The cached expression, or undefined if not found or expired
     */
    get(key: string): XPathExpression | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses++;
            return undefined;
        }

        // Check if entry has expired
        if (this.ttl !== null && Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            this.misses++;
            return undefined;
        }

        // Update access metrics
        entry.hits++;
        entry.lastAccessed = Date.now();
        this.hits++;

        return entry.value;
    }

    /**
     * Set a cached expression
     *
     * @param key - Cache key (typically the expression string)
     * @param value - The compiled expression to cache
     */
    set(key: string, value: XPathExpression): void {
        // Check if we need to evict an entry
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evict();
        }

        const entry: CacheEntry<XPathExpression> = {
            key,
            value,
            timestamp: Date.now(),
            hits: 0,
            lastAccessed: Date.now(),
        };

        this.cache.set(key, entry);
    }

    /**
     * Check if a key exists in the cache
     *
     * @param key - Cache key
     * @returns true if the key exists and hasn't expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Check if entry has expired
        if (this.ttl !== null && Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Clear the cache
     */
    clear(): void {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Delete a specific cache entry
     *
     * @param key - Cache key
     * @returns true if the entry was deleted, false if it didn't exist
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Get cache statistics
     *
     * @returns Current cache statistics
     */
    getStatistics(): CacheStatistics {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? this.hits / total : 0,
            totalEntries: this.cache.size,
            maxSize: this.maxSize,
        };
    }

    /**
     * Get the size of the cache
     *
     * @returns Number of entries in the cache
     */
    getSize(): number {
        return this.cache.size;
    }

    /**
     * Resize the cache
     *
     * @param newSize - New maximum size
     */
    resize(newSize: number): void {
        if (newSize <= 0) {
            throw new Error('Cache size must be greater than 0');
        }

        this.maxSize = newSize;

        // Evict entries if necessary
        while (this.cache.size > this.maxSize) {
            this.evict();
        }
    }

    /**
     * Clean up expired entries
     */
    cleanUp(): void {
        if (this.ttl === null) {
            return; // No TTL, nothing to clean
        }

        const now = Date.now();
        const keysToDelete: string[] = [];

        Array.from(this.cache.entries()).forEach(([key, entry]) => {
            if (now - entry.timestamp > this.ttl!) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach((key) => this.cache.delete(key));
    }

    /**
     * Evict an entry based on the eviction policy
     * @private
     */
    private evict(): void {
        if (this.cache.size === 0) {
            return;
        }

        let keyToEvict: string | undefined;

        switch (this.evictionPolicy) {
            case 'LRU':
                // Evict least recently used
                keyToEvict = this.findLRUKey();
                break;
            case 'LFU':
                // Evict least frequently used
                keyToEvict = this.findLFUKey();
                break;
            case 'FIFO':
                // Evict first inserted
                keyToEvict = this.findFIFOKey();
                break;
        }

        if (keyToEvict) {
            this.cache.delete(keyToEvict);
        }
    }

    /**
     * Find the least recently used key
     * @private
     */
    private findLRUKey(): string | undefined {
        let lruKey: string | undefined;
        let lruTime = Infinity;

        Array.from(this.cache.entries()).forEach(([key, entry]) => {
            if (entry.lastAccessed < lruTime) {
                lruTime = entry.lastAccessed;
                lruKey = key;
            }
        });

        return lruKey;
    }

    /**
     * Find the least frequently used key
     * @private
     */
    private findLFUKey(): string | undefined {
        let lfuKey: string | undefined;
        let lfuHits = Infinity;

        Array.from(this.cache.entries()).forEach(([key, entry]) => {
            if (entry.hits < lfuHits) {
                lfuHits = entry.hits;
                lfuKey = key;
            }
        });

        return lfuKey;
    }

    /**
     * Find the first inserted key (FIFO)
     * @private
     */
    private findFIFOKey(): string | undefined {
        let fifoKey: string | undefined;
        let fifoTime = Infinity;

        Array.from(this.cache.entries()).forEach(([key, entry]) => {
            if (entry.timestamp < fifoTime) {
                fifoTime = entry.timestamp;
                fifoKey = key;
            }
        });

        return fifoKey;
    }
}

/**
 * Global expression cache instance
 * Shared across all parser instances for maximum efficiency
 */
export const globalExpressionCache = new ExpressionCache(1000, null, 'LRU');

/**
 * Generate a cache key from an expression string and optional context
 *
 * @param expressionString - The XPath expression
 * @param context - Optional context data (version, static context, etc.)
 * @returns A unique cache key
 */
export function generateCacheKey(expressionString: string, context?: { version?: string;[key: string]: any }): string {
    if (!context || Object.keys(context).length === 0) {
        return expressionString;
    }

    const contextStr = Object.entries(context)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join('|');

    return `${expressionString}#${contextStr}`;
}

/**
 * Cache decorator for parser methods
 * Caches the result of expression parsing
 */
export function cachedParse(cacheKeyPrefix: string = '') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (expressionString: string, ...args: any[]) {
            const cacheKey = cacheKeyPrefix ? `${cacheKeyPrefix}:${expressionString}` : expressionString;

            // Check cache first
            const cached = globalExpressionCache.get(cacheKey);
            if (cached) {
                return cached;
            }

            // Call original method
            const result = originalMethod.apply(this, [expressionString, ...args]);

            // Cache the result
            globalExpressionCache.set(cacheKey, result);

            return result;
        };

        return descriptor;
    };
}
