/**
 * XPath 3.0 Named Function Reference (Section 3.1.6)
 *
 * Syntax: fn:name#arity
 *
 * A named function reference returns a function item that refers to
 * a named function with the specified arity.
 *
 * Reference: https://www.w3.org/TR/xpath-30/#id-named-function-ref
 */

import { XPathContext, XPathResult, XPathFunctionItem } from '../context';
import { FN_NAMESPACE, MATH_NAMESPACE } from '../types/function-type';
import { XPathExpression } from './expression';
import { getBuiltInFunction, getBuiltInFunctionArity } from './function-call-expression';

/**
 * XPath 3.0 Named Function Reference
 *
 * Examples:
 *   fn:upper-case#1       → function item for upper-case with arity 1
 *   fn:concat#2           → function item for concat with arity 2
 *   fn:substring#2        → function item for substring(string, start)
 *   fn:substring#3        → function item for substring(string, start, length)
 *   math:sqrt#1           → function item for math:sqrt
 */
export class XPathNamedFunctionRef extends XPathExpression {
    /** Function name (may include namespace prefix) */
    name: string;
    /** Function arity (number of parameters) */
    arity: number;

    constructor(name: string, arity: number) {
        super();
        this.name = name;
        this.arity = arity;
    }

    evaluate(context: XPathContext): XPathFunctionItem {
        // Resolve the function by name and arity
        const funcItem = this.resolveFunction(context);
        if (!funcItem) {
            throw new Error(`Unknown function: ${this.name}#${this.arity}`);
        }
        return funcItem;
    }

    /**
     * Resolve the named function to a function item.
     */
    private resolveFunction(context: XPathContext): XPathFunctionItem | null {
        // Parse the name to get namespace and local name
        const { namespace: parsedNamespace, localName } = this.parseNameWithNamespace(this.name, context);

        // Use the parsed namespace
        const namespace = parsedNamespace;

        // Try to get built-in function - first try local name, then with namespace prefix
        let builtIn = getBuiltInFunction(localName);
        let lookupName = localName;
        
        // If not found and namespace is math, try with math: prefix
        if (!builtIn && namespace === MATH_NAMESPACE) {
            builtIn = getBuiltInFunction('math:' + localName);
            lookupName = 'math:' + localName;
        }
        
        if (builtIn) {
            // Verify arity matches
            const expectedArity = getBuiltInFunctionArity(lookupName);
            if (expectedArity !== undefined && !this.arityMatches(lookupName, this.arity)) {
                throw new Error(`Function ${this.name} does not accept ${this.arity} arguments`);
            }

            // Create a function item that wraps the built-in
            const implementation = (...args: any[]) => {
                // Build a minimal context for function evaluation
                return builtIn(context, ...args);
            };

            return {
                __isFunctionItem: true as const,
                implementation,
                arity: this.arity,
                name: localName,
                namespace,
            };
        }

        // Check context's function registry
        if (context.functionRegistry) {
            // Try looking up by local name or full name
            const registeredFunc = context.functionRegistry[localName] || context.functionRegistry[this.name];
            if (registeredFunc) {
                return {
                    __isFunctionItem: true as const,
                    implementation: registeredFunc,
                    arity: this.arity,
                    name: localName,
                    namespace,
                };
            }
        }

        // Check custom functions
        if (context.functions) {
            const customFunc = context.functions[this.name] || context.functions[localName];
            if (customFunc) {
                return {
                    __isFunctionItem: true as const,
                    implementation: customFunc,
                    arity: this.arity,
                    name: localName,
                    namespace,
                };
            }
        }

        return null;
    }

    /**
     * Check if the given arity is valid for the function.
     */
    private arityMatches(funcName: string, arity: number): boolean {
        // Some functions have variable arity
        const variableArityFuncs: Record<string, [number, number]> = {
            'concat': [2, Infinity],
            'substring': [2, 3],
            'string-join': [1, 2],
            'normalize-space': [0, 1],
            'string-length': [0, 1],
            'local-name': [0, 1],
            'namespace-uri': [0, 1],
            'name': [0, 1],
            'round': [1, 2],
            'format-number': [2, 3],
        };

        const range = variableArityFuncs[funcName];
        if (range) {
            return arity >= range[0] && arity <= range[1];
        }

        // For functions not in the variable arity list, accept any reasonable arity
        return arity >= 0 && arity <= 10;
    }

    /**
     * Parse a QName or EQName into namespace and local name.
     * Handles both prefix:local format and Q{uri}local format.
     */
    private parseNameWithNamespace(name: string, context: XPathContext): { namespace?: string; localName: string } {
        // Check if it's an EQName (Q{uri}local)
        if (name.startsWith('Q{')) {
            const match = name.match(/^Q\{([^}]*)\}(.+)$/);
            if (match) {
                const [, uri, localName] = match;
                return {
                    namespace: uri || undefined,
                    localName,
                };
            }
        }

        // Parse as traditional QName (prefix:local)
        const colonIndex = name.indexOf(':');
        if (colonIndex > 0) {
            const prefix = name.substring(0, colonIndex);
            const localName = name.substring(colonIndex + 1);
            
            // Resolve prefix to namespace
            let namespace: string | undefined;
            if (prefix === 'fn') {
                namespace = FN_NAMESPACE;
            } else if (prefix === 'math') {
                namespace = MATH_NAMESPACE;
            } else if (context.namespaces && context.namespaces[prefix]) {
                namespace = context.namespaces[prefix];
            }
            
            return { namespace, localName };
        }
        
        // No prefix, use default function namespace
        return { namespace: FN_NAMESPACE, localName: name };
    }

    toString(): string {
        return `${this.name}#${this.arity}`;
    }
}
