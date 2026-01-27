import { XPathContext, XPathResult } from '../context';
import { XPathNode } from '../node';
import { XPathExpression } from './expression';
import { JsonToXmlConverter, JsonToXmlOptions } from './json-to-xml-converter';
import { AtomicType, castAs, getAtomicType } from '../types';
import {
    functionSignatureMismatch,
    unresolvedNameReference,
    typeMismatch,
    invalidCastArgument,
} from '../errors';
import * as HOF from '../functions/higher-order-functions';
import * as MATH from '../functions/math-functions';
import * as SEQ30 from '../functions/sequence-functions-30';
import * as SEQ from '../functions/sequence-functions';
import * as ENV from '../functions/environment-functions';
import * as STR30 from '../functions/string-functions-30';
import * as ARRAY from '../functions/array-functions';

import * as MAP from '../functions/map-functions';
import * as JSONF from '../functions/json-functions';

/**
 * Built-in function registry for XPath 3.0 function references.
 * Maps function names to their implementations.
 */
const BUILT_IN_FUNCTIONS: Record<string, (context: XPathContext, ...args: any[]) => any> = {
    // String functions
    'upper-case': (_ctx, arg) => String(arg).toUpperCase(),
    'lower-case': (_ctx, arg) => String(arg).toLowerCase(),
    'concat': (_ctx, ...args) => args.map(a => String(a)).join(''),
    'string-join': (_ctx, seq, sep = '') => {
        if (Array.isArray(seq)) {
            return seq.map(s => String(s)).join(String(sep));
        }
        return String(seq);
    },
    'substring': (_ctx, str, start, len?) => {
        const s = String(str);
        const startIdx = Math.round(Number(start)) - 1;
        if (len === undefined) {
            return s.substring(Math.max(0, startIdx));
        }
        const length = Math.round(Number(len));
        const adjustedStart = Math.max(0, startIdx);
        return s.substring(adjustedStart, adjustedStart + length);
    },
    'string-length': (_ctx, arg) => String(arg).length,
    'normalize-space': (_ctx, arg) => String(arg).trim().replace(/\s+/g, ' '),
    'contains': (_ctx, str, sub) => String(str).includes(String(sub)),
    'starts-with': (_ctx, str, sub) => String(str).startsWith(String(sub)),
    'ends-with': (_ctx, str, sub) => String(str).endsWith(String(sub)),
    'translate': (_ctx, str, from, to) => {
        const s = String(str);
        const f = String(from);
        const t = String(to);
        let result = '';
        for (const char of s) {
            const idx = f.indexOf(char);
            if (idx === -1) result += char;
            else if (idx < t.length) result += t[idx];
        }
        return result;
    },
    'replace': (_ctx, input, pattern, replacement) => {
        const regex = new RegExp(String(pattern), 'g');
        return String(input).replace(regex, String(replacement));
    },
    'matches': (_ctx, input, pattern) => {
        const regex = new RegExp(String(pattern));
        return regex.test(String(input));
    },
    'tokenize': (_ctx, input, pattern = '\\s+') => {
        const regex = new RegExp(String(pattern));
        return String(input).split(regex).filter(s => s.length > 0);
    },

    // Numeric functions
    'abs': (_ctx, arg) => Math.abs(Number(arg)),
    'ceiling': (_ctx, arg) => Math.ceil(Number(arg)),
    'floor': (_ctx, arg) => Math.floor(Number(arg)),
    'round': (_ctx, arg) => Math.round(Number(arg)),
    'round-half-to-even': (_ctx, arg, precision = 0) => {
        const p = Math.pow(10, Number(precision));
        const n = Number(arg) * p;
        const floor = Math.floor(n);
        const decimal = n - floor;
        if (decimal === 0.5) {
            return (floor % 2 === 0 ? floor : floor + 1) / p;
        }
        return Math.round(n) / p;
    },
    'number': (_ctx, arg) => Number(arg),

    // Boolean functions
    'true': () => true,
    'false': () => false,
    'not': (_ctx, arg) => !arg,
    'boolean': (_ctx, arg) => {
        if (typeof arg === 'boolean') return arg;
        if (typeof arg === 'number') return arg !== 0 && !isNaN(arg);
        if (typeof arg === 'string') return arg.length > 0;
        if (Array.isArray(arg)) return arg.length > 0;
        return !!arg;
    },

    // Sequence functions
    'count': (_ctx, seq) => Array.isArray(seq) ? seq.length : (seq === null || seq === undefined ? 0 : 1),
    'sum': (_ctx, seq) => {
        if (!Array.isArray(seq)) return Number(seq) || 0;
        return seq.reduce((acc, val) => acc + (Number(val) || 0), 0);
    },
    'avg': (_ctx, seq) => {
        if (!Array.isArray(seq)) return Number(seq);
        if (seq.length === 0) return null;
        const sum = seq.reduce((acc, val) => acc + (Number(val) || 0), 0);
        return sum / seq.length;
    },
    'min': (_ctx, seq) => {
        if (!Array.isArray(seq)) return Number(seq);
        if (seq.length === 0) return null;
        return Math.min(...seq.map(v => Number(v)));
    },
    'max': (_ctx, seq) => {
        if (!Array.isArray(seq)) return Number(seq);
        if (seq.length === 0) return null;
        return Math.max(...seq.map(v => Number(v)));
    },
    'empty': (_ctx, seq) => {
        if (seq === null || seq === undefined) return true;
        if (Array.isArray(seq)) return seq.length === 0;
        return false;
    },
    'exists': (_ctx, seq) => {
        if (seq === null || seq === undefined) return false;
        if (Array.isArray(seq)) return seq.length > 0;
        return true;
    },
    'reverse': (_ctx, seq) => {
        if (!Array.isArray(seq)) return [seq];
        return [...seq].reverse();
    },
    'distinct-values': (_ctx, seq) => {
        if (!Array.isArray(seq)) return [seq];
        return Array.from(new Set(seq));
    },
    'subsequence': (_ctx, seq, start, length?) => {
        if (!Array.isArray(seq)) seq = [seq];
        const startIdx = Math.round(Number(start)) - 1;
        if (length === undefined) {
            return seq.slice(Math.max(0, startIdx));
        }
        const len = Math.round(Number(length));
        return seq.slice(Math.max(0, startIdx), Math.max(0, startIdx) + len);
    },
    'insert-before': (_ctx, seq, pos, inserts) => {
        if (!Array.isArray(seq)) seq = seq === null ? [] : [seq];
        if (!Array.isArray(inserts)) inserts = [inserts];
        const position = Math.max(0, Math.round(Number(pos)) - 1);
        return [...seq.slice(0, position), ...inserts, ...seq.slice(position)];
    },
    'remove': (_ctx, seq, pos) => {
        if (!Array.isArray(seq)) seq = [seq];
        const position = Math.round(Number(pos)) - 1;
        if (position < 0 || position >= seq.length) return seq;
        return [...seq.slice(0, position), ...seq.slice(position + 1)];
    },

    // Node functions
    'position': (ctx) => ctx.position ?? 0,
    'last': (ctx) => ctx.size ?? 0,
    'string': (ctx, arg?) => {
        if (arg === undefined) {
            return ctx.node?.textContent ?? '';
        }
        if (Array.isArray(arg) && arg.length > 0) {
            return arg[0]?.textContent ?? String(arg[0]);
        }
        return String(arg);
    },
    'local-name': (ctx, arg?) => {
        const node = arg ? (Array.isArray(arg) ? arg[0] : arg) : ctx.node;
        return node?.localName ?? '';
    },
    'namespace-uri': (ctx, arg?) => {
        const node = arg ? (Array.isArray(arg) ? arg[0] : arg) : ctx.node;
        return node?.namespaceUri ?? '';
    },
    'name': (ctx, arg?) => {
        const node = arg ? (Array.isArray(arg) ? arg[0] : arg) : ctx.node;
        return node?.nodeName ?? '';
    },

    // Higher-order functions (XPath 3.0)
    'for-each': HOF.forEach,
    'filter': HOF.filter,
    'fold-left': HOF.foldLeft,
    'fold-right': HOF.foldRight,
    'for-each-pair': HOF.forEachPair,
    'sort': SEQ30.sort,
    'apply': HOF.apply,
    'function-name': HOF.functionName,
    'function-arity': HOF.functionArity,

    // Math functions (XPath 3.0 math namespace)
    'math:pi': MATH.pi,
    'math:exp': MATH.exp,
    'math:exp10': MATH.exp10,
    'math:log': MATH.log,
    'math:log10': MATH.log10,
    'math:pow': MATH.pow,
    'math:sqrt': MATH.sqrt,
    'math:sin': MATH.sin,
    'math:cos': MATH.cos,
    'math:tan': MATH.tan,
    'math:asin': MATH.asin,
    'math:acos': MATH.acos,
    'math:atan': MATH.atan,
    'math:atan2': MATH.atan2,

    // Sequence functions (XPath 3.0)
    'head': (_ctx, seq) => SEQ.head(seq),
    'tail': (_ctx, seq) => SEQ.tail(seq),
    'innermost': SEQ30.innermost,
    'outermost': SEQ30.outermost,

    // Environment functions (XPath 3.0)
    'environment-variable': ENV.environmentVariable,
    'available-environment-variables': ENV.availableEnvironmentVariables,

    // Array functions (XPath 3.1)
    'array:size': ARRAY.arraySize,
    'array:get': ARRAY.arrayGet,
    'array:put': ARRAY.arrayPut,
    'array:append': ARRAY.arrayAppend,
    'array:subarray': ARRAY.arraySubarray,
    'array:remove': ARRAY.arrayRemove,
    'array:insert-before': ARRAY.arrayInsertBefore,
    'array:head': ARRAY.arrayHead,
    'array:tail': ARRAY.arrayTail,
    'array:reverse': ARRAY.arrayReverse,
    'array:join': ARRAY.arrayJoin,
    'array:flatten': ARRAY.arrayFlatten,
    'array:for-each': ARRAY.arrayForEach,
    'array:filter': ARRAY.arrayFilter,
    'array:fold-left': ARRAY.arrayFoldLeft,
    'array:fold-right': ARRAY.arrayFoldRight,
    'array:sort': ARRAY.arraySort,

    // Map functions (XPath 3.1)
    'map:size': MAP.mapSize,
    'map:keys': MAP.mapKeys,
    'map:contains': MAP.mapContains,
    'map:get': MAP.mapGet,
    'map:put': MAP.mapPut,
    'map:entry': MAP.mapEntry,
    'map:merge': MAP.mapMerge,
    'map:for-each': MAP.mapForEach,
    'map:remove': MAP.mapRemove,

    // JSON functions (XPath 3.1)
    'parse-json': JSONF.parseJson,
    'serialize': JSONF.serialize,

    // String functions (XPath 3.0 additions)
    'analyze-string': STR30.analyzeString,
    'format-integer': STR30.formatInteger,
    'format-number': STR30.formatNumber,
};

/**
 * Function arity information for variadic functions.
 * Format: [minArgs, maxArgs]
 */
const FUNCTION_ARITY: Record<string, [number, number]> = {
    'concat': [2, Infinity],
    'substring': [2, 3],
    'string-join': [1, 2],
    'normalize-space': [0, 1],
    'string-length': [0, 1],
    'local-name': [0, 1],
    'namespace-uri': [0, 1],
    'name': [0, 1],
    'round': [1, 2],
    'round-half-to-even': [1, 2],
    'string': [0, 1],
    'number': [0, 1],
    'replace': [3, 4],
    'matches': [2, 3],
    'tokenize': [1, 3],
    'subsequence': [2, 3],
    'insert-before': [3, 3],
    'remove': [2, 2],
    // Higher-order functions
    'for-each': [2, 2],
    'filter': [2, 2],
    'fold-left': [3, 3],
    'fold-right': [3, 3],
    'for-each-pair': [3, 3],
    'sort': [1, 3],
    'apply': [2, 2],
    'function-name': [1, 1],
    'function-arity': [1, 1],
    // Math functions
    'math:pi': [0, 0],
    'math:exp': [1, 1],
    'math:exp10': [1, 1],
    'math:log': [1, 1],
    'math:log10': [1, 1],
    'math:pow': [2, 2],
    'math:sqrt': [1, 1],
    'math:sin': [1, 1],
    'math:cos': [1, 1],
    'math:tan': [1, 1],
    'math:asin': [1, 1],
    'math:acos': [1, 1],
    'math:atan': [1, 1],
    'math:atan2': [2, 2],
    // Sequence functions (XPath 3.0)
    'head': [1, 1],
    'tail': [1, 1],
    'innermost': [1, 1],
    'outermost': [1, 1],
    // Environment functions (XPath 3.0)
    'environment-variable': [1, 1],
    'available-environment-variables': [0, 0],
    // Array functions (XPath 3.1)
    'array:size': [1, 1],
    'array:get': [2, 2],
    'array:put': [3, 3],
    'array:append': [2, 2],
    'array:subarray': [2, 3],
    'array:remove': [2, 2],
    'array:insert-before': [3, 3],
    'array:head': [1, 1],
    'array:tail': [1, 1],
    'array:reverse': [1, 1],
    'array:join': [1, 1],
    'array:flatten': [1, 1],
    'array:for-each': [2, 2],
    'array:filter': [2, 2],
    'array:fold-left': [3, 3],
    'array:fold-right': [3, 3],
    'array:sort': [1, 3],

    // Map functions (XPath 3.1)
    'map:size': [1, 1],
    'map:keys': [1, 1],
    'map:contains': [2, 2],
    'map:get': [2, 2],
    'map:put': [3, 3],
    'map:entry': [2, 2],
    'map:merge': [1, 2],
    'map:for-each': [2, 2],
    'map:remove': [2, 2],

    // JSON functions (XPath 3.1)
    'parse-json': [1, 2],
    'serialize': [1, 2],

    // String functions (XPath 3.0 additions)
    'analyze-string': [2, 3],
    'format-integer': [2, 3],
    'format-number': [2, 3],
};

/**
 * Get a built-in function implementation by name.
 */
export function getBuiltInFunction(name: string): ((context: XPathContext, ...args: any[]) => any) | undefined {
    return BUILT_IN_FUNCTIONS[name];
}

/**
 * Get the arity range for a built-in function.
 */
export function getBuiltInFunctionArity(name: string): [number, number] | undefined {
    return FUNCTION_ARITY[name];
}

export class XPathFunctionCall extends XPathExpression {
    name: string;
    args: XPathExpression[];
    private jsonConverter: JsonToXmlConverter = new JsonToXmlConverter();

    constructor(name: string, args: XPathExpression[]) {
        super();
        this.name = name;
        this.args = args;
    }

    evaluate(context: XPathContext): XPathResult {
        const evaluatedArgs = this.args.map(arg => arg.evaluate(context));

        // XPath 2.0 constructor functions: QName(...) delegates to atomic type cast
        const constructorType = this.getConstructorType();
        if (constructorType) {
            if (evaluatedArgs.length !== 1) {
                throw functionSignatureMismatch(this.name, '1', evaluatedArgs.length);
            }

            const raw = evaluatedArgs[0];
            if (Array.isArray(raw)) {
                if (raw.length === 0) {
                    throw typeMismatch('single item', 'empty sequence', `constructor function ${this.name}`);
                }
                if (raw.length !== 1) {
                    throw typeMismatch('single item', `sequence of ${raw.length} items`, `constructor function ${this.name}`);
                }
                return this.castConstructorValue(constructorType, raw[0]);
            }

            if (raw === undefined || raw === null) {
                throw typeMismatch('single item', 'empty sequence', `constructor function ${this.name}`);
            }

            return this.castConstructorValue(constructorType, raw);
        }

        // Built-in XPath 1.0 functions
        switch (this.name) {
            // Node set functions
            case 'last':
                return context.size ?? 0;
            case 'position':
                return context.position ?? 0;
            case 'count':
                return Array.isArray(evaluatedArgs[0]) ? evaluatedArgs[0].length : 0;
            case 'local-name':
                return this.localName(evaluatedArgs, context);
            case 'namespace-uri':
                return this.namespaceUri(evaluatedArgs, context);
            case 'name':
                return this.nodeName(evaluatedArgs, context);

            // String functions
            case 'string':
                return this.stringValue(evaluatedArgs, context);
            case 'concat':
                return evaluatedArgs.map(arg => this.convertToString(arg)).join('');
            case 'starts-with':
                return String(evaluatedArgs[0]).startsWith(String(evaluatedArgs[1]));
            case 'contains':
                return String(evaluatedArgs[0]).includes(String(evaluatedArgs[1]));
            case 'substring-before':
                return this.substringBefore(evaluatedArgs);
            case 'substring-after':
                return this.substringAfter(evaluatedArgs);
            case 'substring':
                return this.substring(evaluatedArgs);
            case 'string-length':
                return this.stringLength(evaluatedArgs, context);
            case 'normalize-space':
                return this.normalizeSpace(evaluatedArgs, context);
            case 'translate':
                return this.translate(evaluatedArgs);

            // Boolean functions
            case 'boolean':
                return this.toBoolean(evaluatedArgs[0]);
            case 'not':
                return !this.toBoolean(evaluatedArgs[0]);
            case 'true':
                return true;
            case 'false':
                return false;
            case 'lang':
                return this.lang(evaluatedArgs, context);

            // Number functions
            case 'number':
                return this.toNumber(evaluatedArgs, context);
            case 'sum':
                return this.sum(evaluatedArgs);
            case 'floor':
                return Math.floor(Number(evaluatedArgs[0]));
            case 'ceiling':
                return Math.ceil(Number(evaluatedArgs[0]));
            case 'round':
                return Math.round(Number(evaluatedArgs[0]));

            // JSON functions (XPath 3.1)
            case 'json-to-xml':
                return this.jsonToXml(evaluatedArgs, context);

            default:
                // Check built-in XPath 2.0/3.0 functions from the BUILT_IN_FUNCTIONS map
                let builtInFunc = BUILT_IN_FUNCTIONS[this.name];
                
                // If not found and name is an EQName, try to resolve it
                if (!builtInFunc && this.name.startsWith('Q{')) {
                    const { namespace, localName } = this.parseEQName(this.name);
                    
                    // Try local name first
                    builtInFunc = BUILT_IN_FUNCTIONS[localName];
                    
                    // If still not found and namespace is math, try with math: prefix
                    if (!builtInFunc && namespace === 'http://www.w3.org/2005/xpath-functions/math') {
                        builtInFunc = BUILT_IN_FUNCTIONS['math:' + localName];
                    }

                    // If still not found and namespace is array, try with array: prefix
                    if (!builtInFunc && namespace === 'http://www.w3.org/2005/xpath-functions/array') {
                        builtInFunc = BUILT_IN_FUNCTIONS['array:' + localName];
                    }
                }
                
                if (builtInFunc) {
                    return builtInFunc(context, ...evaluatedArgs);
                }

                // Check for custom functions in context (including XSLT extension functions)
                if (context.functions && typeof context.functions[this.name] === 'function') {
                    // Call custom function with context as first argument, followed by evaluated args
                    // This allows XSLT functions to access context.node, context.variables, etc.
                    return context.functions[this.name](context, ...evaluatedArgs);
                }
                throw unresolvedNameReference(this.name, 'function');
        }
    }

    private parseEQName(name: string): { namespace: string; localName: string } {
        // Parse EQName format: Q{namespace}localName
        const match = name.match(/^Q\{([^}]*)\}(.+)$/);
        if (match) {
            return {
                namespace: match[1],
                localName: match[2],
            };
        }
        // Fallback if not a valid EQName
        return { namespace: '', localName: name };
    }

    private getConstructorType(): AtomicType | undefined {
        // Only treat QName function names as constructor functions to avoid clobbering built-ins like string()
        if (!this.name.includes(':')) {
            return undefined;
        }

        const [, localName] = this.name.split(':');
        if (!localName) {
            return undefined;
        }

        return getAtomicType(localName);
    }

    private castConstructorValue(constructorType: AtomicType, value: unknown): XPathResult {
        try {
            return constructorType.cast(value);
        } catch (err) {
            throw invalidCastArgument(value, this.name);
        }
    }

    private toBoolean(value: XPathResult): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
    }

    private toNumber(args: XPathResult[], context: XPathContext): number {
        if (args.length === 0) {
            return Number(this.stringValue([], context));
        }
        return Number(args[0]);
    }

    private stringValue(args: XPathResult[], context: XPathContext): string {
        if (args.length === 0) {
            return context.node?.textContent ?? '';
        }
        const value = args[0];
        if (Array.isArray(value) && value.length > 0) {
            return value[0]?.textContent ?? String(value[0]);
        }
        return String(value);
    }

    /**
     * Converts an XPath result to a string according to XPath 1.0 specification.
     * - Node-set: Returns the string-value of the first node in document order
     * - Number: Converts to string representation
     * - Boolean: Converts to 'true' or 'false'
     * - String: Returns as-is
     */
    private convertToString(value: XPathResult): string {
        // If it's a node-set (array), get the string-value of the first node
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '';
            }
            const firstNode = value[0];
            // Return the text content of the first node
            return firstNode?.textContent ?? String(firstNode);
        }
        
        // For primitive values, use JavaScript's String conversion
        return String(value);
    }

    private stringLength(args: XPathResult[], context: XPathContext): number {
        if (args.length === 0) {
            return this.stringValue([], context).length;
        }
        return String(args[0]).length;
    }

    private normalizeSpace(args: XPathResult[], context: XPathContext): string {
        const str = args.length === 0 ? this.stringValue([], context) : String(args[0]);
        return str.trim().replace(/\s+/g, ' ');
    }

    private substringBefore(args: XPathResult[]): string {
        const str = String(args[0]);
        const search = String(args[1]);
        const index = str.indexOf(search);
        return index === -1 ? '' : str.substring(0, index);
    }

    private substringAfter(args: XPathResult[]): string {
        const str = String(args[0]);
        const search = String(args[1]);
        const index = str.indexOf(search);
        return index === -1 ? '' : str.substring(index + search.length);
    }

    private substring(args: XPathResult[]): string {
        const str = String(args[0]);
        // XPath uses 1-based indexing and rounds
        const start = Math.round(Number(args[1])) - 1;
        if (args.length === 2) {
            return str.substring(Math.max(0, start));
        }
        const length = Math.round(Number(args[2]));
        const adjustedStart = Math.max(0, start);
        const adjustedLength = Math.min(length - (adjustedStart - start), str.length - adjustedStart);
        return str.substring(adjustedStart, adjustedStart + adjustedLength);
    }

    private translate(args: XPathResult[]): string {
        const str = String(args[0]);
        const from = String(args[1]);
        const to = String(args[2]);
        let result = '';
        for (const char of str) {
            const index = from.indexOf(char);
            if (index === -1) {
                result += char;
            } else if (index < to.length) {
                result += to[index];
            }
            // If index >= to.length, character is removed
        }
        return result;
    }

    private localName(args: XPathResult[], context: XPathContext): string {
        const node = this.getNodeArg(args, context);
        return node?.localName ?? '';
    }

    private namespaceUri(args: XPathResult[], context: XPathContext): string {
        const node = this.getNodeArg(args, context);
        return node?.namespaceUri ?? '';
    }

    private nodeName(args: XPathResult[], context: XPathContext): string {
        const node = this.getNodeArg(args, context);
        return node?.nodeName ?? '';
    }

    private getNodeArg(args: XPathResult[], context: XPathContext): XPathNode | undefined {
        if (args.length > 0 && Array.isArray(args[0]) && args[0].length > 0) {
            return args[0][0];
        }
        return context.node;
    }

    private sum(args: XPathResult[]): number {
        const nodeSet = args[0];
        if (!Array.isArray(nodeSet)) return 0;
        return (nodeSet as any[]).reduce((acc: number, node: XPathNode) => {
            const value = Number(node?.textContent ?? node);
            return acc + (isNaN(value) ? 0 : value);
        }, 0);
    }

    private lang(args: XPathResult[], context: XPathContext): boolean {
        const targetLang = String(args[0]).toLowerCase();
        let node = context.node;
        while (node) {
            const lang = node.getAttribute?.('xml:lang') || node.getAttribute?.('lang');
            if (lang) {
                const nodeLang = lang.toLowerCase();
                return nodeLang === targetLang || nodeLang.startsWith(targetLang + '-');
            }
            node = node.parentNode as XPathNode | undefined;
        }
        return false;
    }

    private jsonToXml(args: XPathResult[], context: XPathContext): XPathResult {
        // Check XSLT version - json-to-xml is only supported in XSLT 3.0+
        // If xsltVersion is not set (in xpath lib tests), allow it for now
        if (context.xsltVersion && context.xsltVersion !== '3.0') {
            throw new Error('json-to-xml() is only supported in XSLT 3.0. Use version="3.0" in your stylesheet.');
        }

        // Get JSON text (first argument)
        const jsonText = args.length > 0 ? String(args[0]) : null;

        // Get options (second argument) if provided
        let options: JsonToXmlOptions | undefined;
        if (args.length > 1 && typeof args[1] === 'object' && args[1] !== null) {
            options = this.mapToOptions(args[1] as Record<string, any>);
        }

        const documentNode = this.jsonConverter.convert(jsonText, options);
        
        // Return as node set (array) with single document node, or empty array if null
        return documentNode ? [documentNode] : [];
    }

    private mapToOptions(optionsMap: Record<string, any>): JsonToXmlOptions {
        const options: JsonToXmlOptions = {};

        if (optionsMap['liberal'] !== undefined) {
            options.liberal = Boolean(optionsMap['liberal']);
        }

        if (optionsMap['duplicates'] !== undefined) {
            const dup = String(optionsMap['duplicates']).toLowerCase();
            if (dup === 'reject' || dup === 'use-first' || dup === 'retain') {
                options.duplicates = dup as 'reject' | 'use-first' | 'retain';
            }
        }

        if (optionsMap['validate'] !== undefined) {
            options.validate = Boolean(optionsMap['validate']);
        }

        if (optionsMap['escape'] !== undefined) {
            options.escape = Boolean(optionsMap['escape']);
        }

        if (optionsMap['fallback'] !== undefined && typeof optionsMap['fallback'] === 'function') {
            options.fallback = optionsMap['fallback'];
        }

        return options;
    }
}
