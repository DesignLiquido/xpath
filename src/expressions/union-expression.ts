import { XPathExpression } from './expression';

export class XPathUnionExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;

    constructor(left: XPathExpression, right: XPathExpression) {
        super();
        this.left = left;
        this.right = right;
    }

    evaluate(context: any): any[] {
        const leftResult = this.left.evaluate(context);
        const rightResult = this.right.evaluate(context);

        // Both operands must be node-sets
        const leftNodes = Array.isArray(leftResult) ? leftResult : [];
        const rightNodes = Array.isArray(rightResult) ? rightResult : [];

        // Combine and remove duplicates, preserving document order
        return this.unionNodes(leftNodes, rightNodes);
    }

    private unionNodes(left: any[], right: any[]): any[] {
        const seen = new Set();
        const result: any[] = [];

        // Add left nodes
        for (const node of left) {
            if (!seen.has(node)) {
                seen.add(node);
                result.push(node);
            }
        }

        // Add right nodes not already in result
        for (const node of right) {
            if (!seen.has(node)) {
                seen.add(node);
                result.push(node);
            }
        }

        // Sort by document order
        return this.sortByDocumentOrder(result);
    }

    private sortByDocumentOrder(nodes: any[]): any[] {
        return nodes.sort((a, b) => {
            if (a === b) return 0;

            // Use compareDocumentPosition if available (DOM Level 3)
            if (typeof a.compareDocumentPosition === 'function') {
                const position = a.compareDocumentPosition(b);
                if (position & 4) return -1; // b follows a
                if (position & 2) return 1;  // a follows b
            }

            return 0;
        });
    }
}
