/**
 * Indexed Collections Module
 *
 * Provides index-based optimization for maps and arrays in XPath.
 * Uses strategic indexing to improve lookup performance.
 *
 * Features:
 * - Key-based indexing for maps (O(1) lookup)
 * - Position-based indexing for arrays (O(1) access)
 * - Composite key indexing for nested lookups
 * - Index statistics and analysis
 */

/**
 * Index statistics for performance analysis
 */
export interface IndexStatistics {
    totalKeys: number;
    totalLookups: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
    averageKeyLength: number;
}

/**
 * IndexedMap provides O(1) lookup for map keys
 * Wrapper around native Map with performance metrics
 */
export class IndexedMap<K, V> {
    private map: Map<K, V>;
    private lookups: number = 0;
    private hits: number = 0;

    constructor(entries?: [K, V][]) {
        this.map = new Map(entries);
    }

    /**
     * Get value by key with metrics tracking
     *
     * @param key - The key to look up
     * @returns The value, or undefined if not found
     */
    get(key: K): V | undefined {
        this.lookups++;
        const value = this.map.get(key);

        if (value !== undefined) {
            this.hits++;
        }

        return value;
    }

    /**
     * Set a key-value pair
     *
     * @param key - The key
     * @param value - The value
     */
    set(key: K, value: V): this {
        this.map.set(key, value);
        return this;
    }

    /**
     * Check if key exists
     *
     * @param key - The key
     * @returns true if key exists
     */
    has(key: K): boolean {
        return this.map.has(key);
    }

    /**
     * Delete a key
     *
     * @param key - The key to delete
     * @returns true if key existed and was deleted
     */
    delete(key: K): boolean {
        return this.map.delete(key);
    }

    /**
     * Clear all entries
     */
    clear(): void {
        this.map.clear();
        this.lookups = 0;
        this.hits = 0;
    }

    /**
     * Get the size of the map
     *
     * @returns Number of entries
     */
    get size(): number {
        return this.map.size;
    }

    /**
     * Iterate over entries
     */
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.map[Symbol.iterator]();
    }

    /**
     * Get iterator over keys
     */
    keys(): IterableIterator<K> {
        return this.map.keys();
    }

    /**
     * Get iterator over values
     */
    values(): IterableIterator<V> {
        return this.map.values();
    }

    /**
     * Get iterator over entries
     */
    entries(): IterableIterator<[K, V]> {
        return this.map.entries();
    }

    /**
     * Get lookup statistics
     *
     * @returns Performance metrics
     */
    getStatistics(): IndexStatistics {
        const totalKeys = this.map.size;
        const totalLookups = this.lookups;
        const cacheHits = this.hits;
        const cacheMisses = totalLookups - cacheHits;
        const hitRate = totalLookups > 0 ? cacheHits / totalLookups : 0;

        return {
            totalKeys,
            totalLookups,
            cacheHits,
            cacheMisses,
            hitRate,
            averageKeyLength: 0, // Not applicable for general keys
        };
    }

    /**
     * Reset statistics
     */
    resetStatistics(): void {
        this.lookups = 0;
        this.hits = 0;
    }
}

/**
 * IndexedArray provides O(1) access and efficient range operations
 */
export class IndexedArray<T> {
    private array: T[];
    private accesses: number = 0;
    private totalAccesses: number = 0;

    constructor(items?: T[]) {
        this.array = items ? [...items] : [];
    }

    /**
     * Get item by index with bounds checking
     *
     * @param index - Zero-based index
     * @returns The item, or undefined if index out of bounds
     */
    get(index: number): T | undefined {
        this.totalAccesses++;

        if (index >= 0 && index < this.array.length) {
            this.accesses++;
            return this.array[index];
        }

        return undefined;
    }

    /**
     * Get item by 1-based position (XPath convention)
     *
     * @param position - One-based position
     * @returns The item, or undefined if position out of bounds
     */
    getByPosition(position: number): T | undefined {
        return this.get(position - 1);
    }

    /**
     * Set item at index
     *
     * @param index - Zero-based index
     * @param item - The item to set
     * @throws Error if index out of bounds
     */
    set(index: number, item: T): void {
        if (index < 0 || index >= this.array.length) {
            throw new Error(`Index ${index} out of bounds [0, ${this.array.length})`);
        }
        this.array[index] = item;
    }

    /**
     * Add item to end
     *
     * @param item - The item to add
     */
    push(item: T): void {
        this.array.push(item);
    }

    /**
     * Remove item from end
     *
     * @returns The removed item, or undefined if empty
     */
    pop(): T | undefined {
        return this.array.pop();
    }

    /**
     * Get length
     *
     * @returns Number of items
     */
    get length(): number {
        return this.array.length;
    }

    /**
     * Check if array is empty
     *
     * @returns true if length is 0
     */
    isEmpty(): boolean {
        return this.array.length === 0;
    }

    /**
     * Get slice of array (creates new array)
     *
     * @param start - Start index (inclusive)
     * @param end - End index (exclusive)
     * @returns New array with slice
     */
    slice(start?: number, end?: number): IndexedArray<T> {
        return new IndexedArray(this.array.slice(start, end));
    }

    /**
     * Get subarray by range (1-based, inclusive on both ends - XPath convention)
     *
     * @param start - Start position (1-based)
     * @param end - End position (1-based)
     * @returns New array with items in range
     */
    range(start: number, end: number): IndexedArray<T> {
        return new IndexedArray(this.array.slice(start - 1, end));
    }

    /**
     * Iterate over items
     */
    [Symbol.iterator](): IterableIterator<T> {
        return this.array[Symbol.iterator]();
    }

    /**
     * Map over items
     *
     * @param fn - Function to apply
     * @returns New array with mapped items
     */
    map<U>(fn: (item: T, index: number) => U): IndexedArray<U> {
        return new IndexedArray(this.array.map(fn));
    }

    /**
     * Filter items
     *
     * @param predicate - Function to test items
     * @returns New array with filtered items
     */
    filter(predicate: (item: T, index: number) => boolean): IndexedArray<T> {
        return new IndexedArray(this.array.filter(predicate));
    }

    /**
     * Find first item matching predicate
     *
     * @param predicate - Function to test items
     * @returns The found item, or undefined
     */
    find(predicate: (item: T, index: number) => boolean): T | undefined {
        return this.array.find(predicate);
    }

    /**
     * Get access statistics
     *
     * @returns Performance metrics
     */
    getStatistics(): IndexStatistics {
        const hitRate = this.totalAccesses > 0 ? this.accesses / this.totalAccesses : 0;

        return {
            totalKeys: this.array.length,
            totalLookups: this.totalAccesses,
            cacheHits: this.accesses,
            cacheMisses: this.totalAccesses - this.accesses,
            hitRate,
            averageKeyLength: 0,
        };
    }

    /**
     * Reset statistics
     */
    resetStatistics(): void {
        this.accesses = 0;
        this.totalAccesses = 0;
    }

    /**
     * Convert to regular array
     *
     * @returns A copy as regular array
     */
    toArray(): T[] {
        return [...this.array];
    }
}

/**
 * CompositeKeyIndex for nested lookups
 * Optimizes lookups on composite keys like [key1][key2]
 */
export class CompositeKeyIndex<V> {
    private index: Map<string, V>;

    constructor() {
        this.index = new Map();
    }

    /**
     * Create a composite key from parts
     *
     * @param parts - Key parts
     * @returns A composite key string
     */
    private createKey(...parts: any[]): string {
        return parts.map((p) => String(p)).join('|');
    }

    /**
     * Set value for composite key
     *
     * @param parts - Key parts
     * @param value - Value to store
     */
    set(...parts: [...any[], V]): void {
        const value = parts.pop() as V;
        const key = this.createKey(...parts);
        this.index.set(key, value);
    }

    /**
     * Get value for composite key
     *
     * @param parts - Key parts
     * @returns The value, or undefined if not found
     */
    get(...parts: any[]): V | undefined {
        const key = this.createKey(...parts);
        return this.index.get(key);
    }

    /**
     * Check if composite key exists
     *
     * @param parts - Key parts
     * @returns true if key exists
     */
    has(...parts: any[]): boolean {
        const key = this.createKey(...parts);
        return this.index.has(key);
    }

    /**
     * Delete composite key
     *
     * @param parts - Key parts
     * @returns true if key existed and was deleted
     */
    delete(...parts: any[]): boolean {
        const key = this.createKey(...parts);
        return this.index.delete(key);
    }

    /**
     * Clear all entries
     */
    clear(): void {
        this.index.clear();
    }

    /**
     * Get number of entries
     *
     * @returns Size of index
     */
    get size(): number {
        return this.index.size;
    }
}

/**
 * Range index for efficient range queries
 * Optimizes queries on ordered sequences
 */
export class RangeIndex<T> {
    private sortedArray: T[];
    private compareFn: (a: T, b: T) => number;

    /**
     * Create a range index
     *
     * @param items - Items to index
     * @param compareFn - Comparison function
     */
    constructor(items: T[], compareFn: (a: T, b: T) => number) {
        this.sortedArray = [...items].sort(compareFn);
        this.compareFn = compareFn;
    }

    /**
     * Find items in range
     *
     * @param start - Start value
     * @param end - End value
     * @returns Items within range
     */
    range(start: T, end: T): T[] {
        const result: T[] = [];

        for (const item of this.sortedArray) {
            if (this.compareFn(item, start) >= 0 && this.compareFn(item, end) <= 0) {
                result.push(item);
            }
        }

        return result;
    }

    /**
     * Find items greater than value
     *
     * @param value - Comparison value
     * @returns Items greater than value
     */
    greaterThan(value: T): T[] {
        return this.sortedArray.filter((item) => this.compareFn(item, value) > 0);
    }

    /**
     * Find items less than value
     *
     * @param value - Comparison value
     * @returns Items less than value
     */
    lessThan(value: T): T[] {
        return this.sortedArray.filter((item) => this.compareFn(item, value) < 0);
    }

    /**
     * Find items equal to value
     *
     * @param value - Comparison value
     * @returns Items equal to value
     */
    equals(value: T): T[] {
        return this.sortedArray.filter((item) => this.compareFn(item, value) === 0);
    }
}
