/**
 * Represents a DOM-like node interface for XPath evaluation.
 * This is compatible with browser DOM nodes and can be extended for other implementations.
 */
export interface XPathNode {
    nodeType: number;
    nodeName: string;
    localName?: string;
    namespaceURI?: string | null;
    textContent?: string | null;
    parentNode?: XPathNode | null;
    childNodes?: ArrayLike<XPathNode>;
    attributes?: ArrayLike<XPathNode>;
    nextSibling?: XPathNode | null;
    previousSibling?: XPathNode | null;
    ownerDocument?: XPathNode | null;
    documentElement?: XPathNode;
    target?: string; // For processing instructions

    // Optional methods for DOM compatibility
    getAttribute?(name: string): string | null;
    compareDocumentPosition?(other: XPathNode): number;
}
