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
    | 'self'
    | 'self-and-siblings'; // Custom axis for XSLT template matching

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
        let candidates = this.getNodesByAxis(node, context);

        // Filter by node test (pass context for namespace resolution)
        candidates = candidates.filter(n => this.matchesNodeTest(n, context));

        // Apply predicates
        candidates = this.applyPredicates(candidates, context);

        return candidates;
    }

    private getNodesByAxis(node: any, context?: any): any[] {
        switch (this.axis) {
            case 'child':
                // Filter out attribute nodes (nodeType 2) from childNodes
                return this.getChildNodes(node);

            case 'parent':
                return node.parentNode ? [node.parentNode] : [];

            case 'self':
                return [node];

            case 'attribute':
                // Attributes can be in a separate 'attributes' property or mixed in childNodes
                if (node.attributes) {
                    return Array.from(node.attributes);
                }
                // Fallback: filter childNodes for attribute nodes
                return Array.from(node.childNodes || []).filter((n: any) => n.nodeType === 2);

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

            case 'self-and-siblings':
                // Custom axis for XSLT template matching
                // Returns all nodes in the context's nodeList (excluding attributes)
                if (context?.nodeList) {
                    return context.nodeList.filter((n: any) => n.nodeType !== 2);
                }
                // Fallback: just return self
                return [node];

            default:
                return [];
        }
    }

    /**
     * Get child nodes excluding attribute nodes.
     * XNode stores attributes in childNodes, but XPath child axis doesn't include them.
     */
    private getChildNodes(node: any): any[] {
        const children = Array.from(node.childNodes || []);
        // Filter out attribute nodes (nodeType 2)
        return children.filter((n: any) => n.nodeType !== 2);
    }

    private getDescendants(node: any, includeSelf: boolean): any[] {
        const result: any[] = [];
        if (includeSelf) result.push(node);

        const walk = (n: any) => {
            // Use getChildNodes to exclude attribute nodes
            for (const child of this.getChildNodes(n)) {
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

    private matchesNodeTest(node: any, context?: any): boolean {
        const nodeType = node.nodeType;

        switch (this.nodeTest.type) {
            case 'wildcard':
                // Check if it's a namespaced wildcard like "ns:*"
                if (this.nodeTest.name && this.nodeTest.name.endsWith(':*')) {
                    const prefix = this.nodeTest.name.slice(0, -2);
                    const nsUri = context?.namespaces?.[prefix];
                    if (!nsUri) return false;  // Unknown prefix - no match

                    const nodeNsUri = node.namespaceURI || node.namespaceUri || '';
                    return (nodeType === 1 || nodeType === 2) && nodeNsUri === nsUri;
                }
                // Regular wildcard - matches any element (nodeType 1) or attribute (nodeType 2)
                return nodeType === 1 || nodeType === 2;

            case 'name':
                // Match element or attribute by name
                if (nodeType !== 1 && nodeType !== 2) return false;

                const testName = this.nodeTest.name!;
                const colonIndex = testName.indexOf(':');

                if (colonIndex > 0) {
                    // Prefixed name like "xhtml:root" or "atom:title" or "ns:attr"
                    const prefix = testName.substring(0, colonIndex);
                    const localName = testName.substring(colonIndex + 1);
                    const nsUri = context?.namespaces?.[prefix];

                    if (!nsUri) {
                        // Unknown prefix - no match
                        return false;
                    }

                    // Match both local name AND namespace URI
                    // For attributes and elements, we compare their localName with the test's local name
                    const nodeLocalName = node.localName || (node.nodeName && this.extractLocalName(node.nodeName));
                    const nodeNsUri = node.namespaceURI || node.namespaceUri || '';

                    return nodeLocalName === localName && nodeNsUri === nsUri;
                }

                // Unprefixed name - match by local name only
                // For attributes without a namespace prefix, the nodeName is the full qualified name
                // We need to check both the localName property and the actual nodeName
                const nodeLocalName = node.localName || this.extractLocalName(node.nodeName);
                return nodeLocalName === testName;

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

    /**
     * Extract the local name from a qualified name (e.g., "ns:name" -> "name", "name" -> "name")
     */
    private extractLocalName(qname: string): string {
        if (!qname) return '';
        const colonIndex = qname.indexOf(':');
        if (colonIndex > 0) {
            return qname.substring(colonIndex + 1);
        }
        return qname;
    }
}
