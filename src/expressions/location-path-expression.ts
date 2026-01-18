import { XPathExpression } from './expression';
import { XPathStep } from './step-expression';

export class XPathLocationPath extends XPathExpression {
    steps: XPathStep[];
    absolute: boolean;

    constructor(steps: XPathStep[], absolute: boolean = false) {
        super();
        this.steps = steps;
        this.absolute = absolute;
    }

    evaluate(context: any): any[] {
        let nodes: any[];

        if (this.absolute) {
            // Start from document root
            const root = this.getDocumentRoot(context?.node);
            nodes = root ? [root] : [];
        } else {
            // Start from context node
            nodes = context?.node ? [context.node] : [];
        }

        // Apply each step
        for (const step of this.steps) {
            const nextNodes: any[] = [];

            for (const node of nodes) {
                const stepContext = { ...context, node };
                const result = step.evaluate(stepContext);
                nextNodes.push(...result);
            }

            // Remove duplicates while preserving document order
            nodes = this.uniqueNodes(nextNodes);
        }

        return nodes;
    }

    private getDocumentRoot(node: any): any {
        if (!node) return null;

        let root = node;
        while (root.parentNode) {
            root = root.parentNode;
        }

        // If it's a document node, return the document element
        if (root.documentElement) {
            return root.documentElement;
        }

        return root;
    }

    private uniqueNodes(nodes: any[]): any[] {
        const seen = new Set();
        const result: any[] = [];

        for (const node of nodes) {
            if (!seen.has(node)) {
                seen.add(node);
                result.push(node);
            }
        }

        return result;
    }
}
