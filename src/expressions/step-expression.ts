import { XPathExpression } from './expression';

export type AxisType =
    | 'ancestor'
    | 'ancestor-or-self'
    | 'attribute'
    | 'child'
    | 'descendant'
    | 'descendant-or-self'
    | 'following'
    | 'following-sibling'
    | 'namespace'
    | 'parent'
    | 'preceding'
    | 'preceding-sibling'
    | 'self';

export interface NodeTest {
    type: 'name' | 'node-type' | 'wildcard' | 'processing-instruction';
    name?: string;
    nodeType?: 'node' | 'text' | 'comment' | 'processing-instruction';
}

export class XPathStep extends XPathExpression {
    axis: AxisType;
    nodeTest: NodeTest;
    predicates: XPathExpression[];

    constructor(axis: AxisType, nodeTest: NodeTest, predicates: XPathExpression[] = []) {
        super();
        this.axis = axis;
        this.nodeTest = nodeTest;
        this.predicates = predicates;
    }

    evaluate(context: any): any[] {
        const node = context?.node;
        if (!node) return [];

        // Get candidate nodes based on axis
        let candidates = this.getNodesByAxis(node);

        // Filter by node test
        candidates = candidates.filter(n => this.matchesNodeTest(n));

        // Apply predicates
        candidates = this.applyPredicates(candidates, context);

        return candidates;
    }

    private getNodesByAxis(node: any): any[] {
        switch (this.axis) {
            case 'child':
                return Array.from(node.childNodes || []);

            case 'parent':
                return node.parentNode ? [node.parentNode] : [];

            case 'self':
                return [node];

            case 'attribute':
                return node.attributes ? Array.from(node.attributes) : [];

            case 'descendant':
                return this.getDescendants(node, false);

            case 'descendant-or-self':
                return this.getDescendants(node, true);

            case 'ancestor':
                return this.getAncestors(node, false);

            case 'ancestor-or-self':
                return this.getAncestors(node, true);

            case 'following-sibling':
                return this.getFollowingSiblings(node);

            case 'preceding-sibling':
                return this.getPrecedingSiblings(node);

            case 'following':
                return this.getFollowing(node);

            case 'preceding':
                return this.getPreceding(node);

            case 'namespace':
                // Namespace axis is rarely used and implementation-specific
                return [];

            default:
                return [];
        }
    }

    private getDescendants(node: any, includeSelf: boolean): any[] {
        const result: any[] = [];
        if (includeSelf) result.push(node);

        const walk = (n: any) => {
            for (const child of Array.from(n.childNodes || [])) {
                result.push(child);
                walk(child);
            }
        };
        walk(node);
        return result;
    }

    private getAncestors(node: any, includeSelf: boolean): any[] {
        const result: any[] = [];
        if (includeSelf) result.push(node);

        let current = node.parentNode;
        while (current) {
            result.push(current);
            current = current.parentNode;
        }
        return result;
    }

    private getFollowingSiblings(node: any): any[] {
        const result: any[] = [];
        let sibling = node.nextSibling;
        while (sibling) {
            result.push(sibling);
            sibling = sibling.nextSibling;
        }
        return result;
    }

    private getPrecedingSiblings(node: any): any[] {
        const result: any[] = [];
        let sibling = node.previousSibling;
        while (sibling) {
            result.unshift(sibling);
            sibling = sibling.previousSibling;
        }
        return result;
    }

    private getFollowing(node: any): any[] {
        const result: any[] = [];

        // First, following siblings and their descendants
        let sibling = node.nextSibling;
        while (sibling) {
            result.push(sibling);
            result.push(...this.getDescendants(sibling, false));
            sibling = sibling.nextSibling;
        }

        // Then ancestors' following siblings
        let ancestor = node.parentNode;
        while (ancestor) {
            sibling = ancestor.nextSibling;
            while (sibling) {
                result.push(sibling);
                result.push(...this.getDescendants(sibling, false));
                sibling = sibling.nextSibling;
            }
            ancestor = ancestor.parentNode;
        }

        return result;
    }

    private getPreceding(node: any): any[] {
        const result: any[] = [];

        // Preceding siblings and their descendants (in reverse document order)
        let sibling = node.previousSibling;
        while (sibling) {
            result.unshift(sibling);
            const descendants = this.getDescendants(sibling, false);
            result.unshift(...descendants);
            sibling = sibling.previousSibling;
        }

        // Ancestors' preceding siblings
        let ancestor = node.parentNode;
        while (ancestor) {
            sibling = ancestor.previousSibling;
            while (sibling) {
                result.unshift(sibling);
                const descendants = this.getDescendants(sibling, false);
                result.unshift(...descendants);
                sibling = sibling.previousSibling;
            }
            ancestor = ancestor.parentNode;
        }

        return result;
    }

    private matchesNodeTest(node: any): boolean {
        const nodeType = node.nodeType;

        switch (this.nodeTest.type) {
            case 'wildcard':
                // * matches any element (nodeType 1) or attribute (nodeType 2)
                return nodeType === 1 || nodeType === 2;

            case 'name':
                // Match element or attribute by name
                if (nodeType !== 1 && nodeType !== 2) return false;
                const nodeName = node.localName || node.nodeName;
                return nodeName === this.nodeTest.name;

            case 'node-type':
                switch (this.nodeTest.nodeType) {
                    case 'node':
                        return true; // matches any node
                    case 'text':
                        return nodeType === 3; // text node
                    case 'comment':
                        return nodeType === 8; // comment node
                    case 'processing-instruction':
                        return nodeType === 7; // processing instruction
                    default:
                        return false;
                }

            case 'processing-instruction':
                if (nodeType !== 7) return false;
                if (this.nodeTest.name) {
                    return node.target === this.nodeTest.name;
                }
                return true;

            default:
                return false;
        }
    }

    private applyPredicates(nodes: any[], context: any): any[] {
        let result = nodes;

        for (const predicate of this.predicates) {
            const filtered: any[] = [];
            const size = result.length;

            for (let i = 0; i < result.length; i++) {
                const predicateContext = {
                    ...context,
                    node: result[i],
                    position: i + 1,
                    size: size,
                };

                const predicateResult = predicate.evaluate(predicateContext);

                // If predicate result is a number, it's a position test
                if (typeof predicateResult === 'number') {
                    if (predicateResult === i + 1) {
                        filtered.push(result[i]);
                    }
                } else if (this.toBoolean(predicateResult)) {
                    filtered.push(result[i]);
                }
            }

            result = filtered;
        }

        return result;
    }

    private toBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0 && !isNaN(value);
        if (typeof value === 'string') return value.length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
    }
}
