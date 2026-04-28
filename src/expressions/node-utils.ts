/**
 * Utility for extracting string values from DOM nodes (XNode / XPathNode objects).
 *
 * XNode element nodes store `nodeValue` as the literal string `"null"` because
 * their constructor coerces the value via template literals. Actual text content
 * lives in child text nodes (nodeType 3). This helper traverses the child tree
 * to produce the correct string value.
 */

/**
 * Extract the string value from a DOM node object.
 *
 * Returns `null` if `node` is not a recognizable node object (e.g. a plain
 * number, boolean, or string), so callers can fall through to other logic.
 */
export function getStringValueFromNode(node: any): string | null {
    if (node === null || node === undefined) return null;
    if (typeof node !== 'object') return null;
    if (typeof node.nodeType !== 'number') return null;

    // Text node or attribute node — value is stored directly in nodeValue
    if (node.nodeType === 3 || node.nodeType === 2) {
        const v = node.nodeValue;
        return (v !== null && v !== undefined && v !== 'null') ? String(v) : '';
    }

    // Element node (or document node) — text content is in descendant text nodes
    if (node.nodeType === 1 || node.nodeType === 9) {
        const children: any[] = node.childNodes;
        if (!children || children.length === 0) return '';

        let text = '';
        for (const child of children) {
            if (child.nodeType === 3) {
                // Text node
                const v = child.nodeValue;
                if (v !== null && v !== undefined && v !== 'null') {
                    text += String(v);
                }
            } else if (child.nodeType === 1) {
                // Recurse into child elements
                text += getStringValueFromNode(child) ?? '';
            }
            // Skip attribute nodes (nodeType 2) and others
        }
        return text;
    }

    return null;
}
