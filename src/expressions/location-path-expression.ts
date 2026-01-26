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
            // Start from context node or context item (XPath 3.0)
            if (context?.node) {
                nodes = [context.node];
            } else if (context?.contextItem !== undefined) {
                // XPath 3.0: atomic context item - only valid for self axis (.)
                // For location paths starting with '.', the first step will handle atomic items
                // We use a special marker to indicate we're starting with an atomic context
                nodes = [{ __atomicContextItem: context.contextItem }];
            } else {
                nodes = [];
            }
        }

        // Apply each step
        for (const step of this.steps) {
            const nextNodes: any[] = [];

            for (const node of nodes) {
                // Handle atomic context item marker
                if (node && node.__atomicContextItem !== undefined) {
                    // Pass the atomic item through the step context
                    const stepContext = { ...context, contextItem: node.__atomicContextItem };
                    const result = step.evaluate(stepContext);
                    nextNodes.push(...result);
                } else {
                    const stepContext = { ...context, node };
                    const result = step.evaluate(stepContext);
                    nextNodes.push(...result);
                }
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

        // Return the document node itself (not the document element)
        // In XPath, "/" represents the document node, and "/test" selects
        // children of the document node named "test"
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
