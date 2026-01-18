import { XPathExpression } from './expression';

export class XPathVariableReference extends XPathExpression {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    evaluate(context: any): any {
        if (!context || !context.variables) {
            throw new Error(`Variable $${this.name} is not defined`);
        }

        if (!(this.name in context.variables)) {
            throw new Error(`Variable $${this.name} is not defined`);
        }

        return context.variables[this.name];
    }
}
