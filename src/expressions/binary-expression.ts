import { XPathContext } from '../context';
import { XPathExpression } from './expression';

export class XPathBinaryExpression extends XPathExpression {
    left: XPathExpression;
    right: XPathExpression;
    operator: string;

    constructor(left: XPathExpression, right: XPathExpression, operator: string) {
        super();
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    evaluate(context: XPathContext): boolean {
        const leftValue = this.left.evaluate(context);
        const rightValue = this.right.evaluate(context);

        return this.compare(leftValue, rightValue, this.operator);
    }

    /**
     * XPath comparison rules:
     * - If both are node-sets: compare each node in left with each node in right
     * - If one is node-set and other is string: convert node-set to strings and compare
     * - If one is node-set and other is number: convert node-set to numbers and compare
     * - If one is node-set and other is boolean: convert node-set to boolean and compare
     * - Otherwise, convert both to numbers for numeric comparison, or strings for equality
     */
    private compare(left: any, right: any, operator: string): boolean {
        const leftIsNodeSet = Array.isArray(left);
        const rightIsNodeSet = Array.isArray(right);

        // Both are node-sets
        if (leftIsNodeSet && rightIsNodeSet) {
            return this.compareNodeSets(left, right, operator);
        }

        // Left is node-set
        if (leftIsNodeSet) {
            return this.compareNodeSetToValue(left, right, operator);
        }

        // Right is node-set
        if (rightIsNodeSet) {
            return this.compareValueToNodeSet(left, right, operator);
        }

        // Neither is a node-set
        return this.comparePrimitives(left, right, operator);
    }

    private compareNodeSets(left: any[], right: any[], operator: string): boolean {
        // For each node in left, compare with each node in right
        for (const leftNode of left) {
            const leftStr = this.getStringValue(leftNode);
            for (const rightNode of right) {
                const rightStr = this.getStringValue(rightNode);
                if (this.comparePrimitives(leftStr, rightStr, operator)) {
                    return true;
                }
            }
        }
        return false;
    }

    private compareNodeSetToValue(nodeSet: any[], value: any, operator: string): boolean {
        // Compare each node in the set to the value
        for (const node of nodeSet) {
            const nodeValue = typeof value === 'number'
                ? Number(this.getStringValue(node))
                : this.getStringValue(node);
            if (this.comparePrimitives(nodeValue, value, operator)) {
                return true;
            }
        }
        return false;
    }

    private compareValueToNodeSet(value: any, nodeSet: any[], operator: string): boolean {
        // Compare value to each node in the set
        for (const node of nodeSet) {
            const nodeValue = typeof value === 'number'
                ? Number(this.getStringValue(node))
                : this.getStringValue(node);
            if (this.comparePrimitives(value, nodeValue, operator)) {
                return true;
            }
        }
        return false;
    }

    private comparePrimitives(left: any, right: any, operator: string): boolean {
        // For equality operators, compare as-is (after node-set conversion)
        // For relational operators, convert to numbers
        switch (operator) {
            case '=':
                return left == right; // Use loose equality for type coercion
            case '!=':
                return left != right;
            case '<':
                return Number(left) < Number(right);
            case '>':
                return Number(left) > Number(right);
            case '<=':
                return Number(left) <= Number(right);
            case '>=':
                return Number(left) >= Number(right);
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }

    private getStringValue(node: any): string {
        if (!node) return '';

        // Text node or attribute
        if (node.nodeType === 3 || node.nodeType === 2) {
            return node.nodeValue || node.textContent || '';
        }

        // Element node - get text content
        if (node.textContent !== undefined) {
            return node.textContent;
        }

        // Fallback: recursively get text content
        if (node.childNodes) {
            let text = '';
            for (const child of Array.from(node.childNodes as ArrayLike<any>)) {
                if (child.nodeType === 3) {
                    text += child.nodeValue || '';
                } else if (child.nodeType === 1) {
                    text += this.getStringValue(child);
                }
            }
            return text;
        }

        return String(node);
    }
}