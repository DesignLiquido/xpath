import { XPathExpression } from './expression';

export class XPathFunctionCall extends XPathExpression {
    name: string;
    args: XPathExpression[];

    constructor(name: string, args: XPathExpression[]) {
        super();
        this.name = name;
        this.args = args;
    }

    evaluate(context: any): any {
        const evaluatedArgs = this.args.map(arg => arg.evaluate(context));

        // Built-in XPath 1.0 functions
        switch (this.name) {
            // Node set functions
            case 'last':
                return context?.size ?? 0;
            case 'position':
                return context?.position ?? 0;
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
                return evaluatedArgs.map(String).join('');
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

            default:
                // Check for custom functions in context
                if (context?.functions && typeof context.functions[this.name] === 'function') {
                    return context.functions[this.name](...evaluatedArgs);
                }
                throw new Error(`Unknown function: ${this.name}`);
        }
    }

    private toBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
    }

    private toNumber(args: any[], context: any): number {
        if (args.length === 0) {
            return Number(this.stringValue([], context));
        }
        return Number(args[0]);
    }

    private stringValue(args: any[], context: any): string {
        if (args.length === 0) {
            return context?.node?.textContent ?? '';
        }
        const value = args[0];
        if (Array.isArray(value) && value.length > 0) {
            return value[0]?.textContent ?? String(value[0]);
        }
        return String(value);
    }

    private stringLength(args: any[], context: any): number {
        if (args.length === 0) {
            return this.stringValue([], context).length;
        }
        return String(args[0]).length;
    }

    private normalizeSpace(args: any[], context: any): string {
        const str = args.length === 0 ? this.stringValue([], context) : String(args[0]);
        return str.trim().replace(/\s+/g, ' ');
    }

    private substringBefore(args: any[]): string {
        const str = String(args[0]);
        const search = String(args[1]);
        const index = str.indexOf(search);
        return index === -1 ? '' : str.substring(0, index);
    }

    private substringAfter(args: any[]): string {
        const str = String(args[0]);
        const search = String(args[1]);
        const index = str.indexOf(search);
        return index === -1 ? '' : str.substring(index + search.length);
    }

    private substring(args: any[]): string {
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

    private translate(args: any[]): string {
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

    private localName(args: any[], context: any): string {
        const node = args.length > 0 && Array.isArray(args[0]) && args[0].length > 0
            ? args[0][0]
            : context?.node;
        return node?.localName ?? '';
    }

    private namespaceUri(args: any[], context: any): string {
        const node = args.length > 0 && Array.isArray(args[0]) && args[0].length > 0
            ? args[0][0]
            : context?.node;
        return node?.namespaceURI ?? '';
    }

    private nodeName(args: any[], context: any): string {
        const node = args.length > 0 && Array.isArray(args[0]) && args[0].length > 0
            ? args[0][0]
            : context?.node;
        return node?.nodeName ?? '';
    }

    private sum(args: any[]): number {
        const nodeSet = args[0];
        if (!Array.isArray(nodeSet)) return 0;
        return nodeSet.reduce((acc, node) => {
            const value = Number(node?.textContent ?? node);
            return acc + (isNaN(value) ? 0 : value);
        }, 0);
    }

    private lang(args: any[], context: any): boolean {
        const targetLang = String(args[0]).toLowerCase();
        let node = context?.node;
        while (node) {
            const lang = node.getAttribute?.('xml:lang') || node.getAttribute?.('lang');
            if (lang) {
                const nodeLang = lang.toLowerCase();
                return nodeLang === targetLang || nodeLang.startsWith(targetLang + '-');
            }
            node = node.parentNode;
        }
        return false;
    }
}
