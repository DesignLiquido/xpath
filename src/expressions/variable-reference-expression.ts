import { XPathContext, XPathResult } from '../context';
import { XPathExpression } from './expression';
import { unresolvedNameReference } from '../errors';

export class XPathVariableReference extends XPathExpression {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    evaluate(context: XPathContext): XPathResult {
        if (!context.variables) {
            throw unresolvedNameReference(`$${this.name}`, 'variable');
        }

        if (!(this.name in context.variables)) {
            throw unresolvedNameReference(`$${this.name}`, 'variable');
        }

        return context.variables[this.name];
    }

    toString(): string {
        return `$${this.name}`;
    }
}
