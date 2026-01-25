import { XPathNode } from '../node';

const nodeTypeMap = new WeakMap<XPathNode, string>();

export function setNodeTypeAnnotation(node: XPathNode, schemaTypeName: string): void {
  nodeTypeMap.set(node, schemaTypeName);
}

export function getNodeTypeAnnotation(node: XPathNode): string | undefined {
  return nodeTypeMap.get(node);
}
