/**
 * KindTest implementations for XPath 2.0 node tests
 * (Section 2.5.3, Section 5.2)
 * 
 * KindTests are used in path expressions to filter nodes by their kind:
 * - element() - any element
 * - element(QName) - element with specific name
 * - element(QName, type) - element with specific name and type
 * - attribute() - any attribute
 * - document-node() - document node (root)
 * - text() - text node
 * - comment() - comment node
 * - processing-instruction() - processing instruction
 * - node() - any node
 */

import { KindTest, ItemType } from './sequence-type';

/**
 * Base implementation of KindTest
 */
abstract class KindTestImpl implements KindTest {
  readonly name: string;
  readonly nodeKind: string;
  readonly nodeName?: string;
  readonly nodeType?: string;
  readonly isWildcardName?: boolean;

  constructor(
    name: string,
    nodeKind: string,
    nodeName?: string,
    nodeType?: string,
    isWildcardName?: boolean
  ) {
    this.name = name;
    this.nodeKind = nodeKind;
    this.nodeName = nodeName;
    this.nodeType = nodeType;
    this.isWildcardName = isWildcardName;
  }

  matches(value: any): boolean {
    // Check if value is a node-like object
    if (!value || typeof value !== 'object') {
      return false;
    }

    // Check node kind
    if (value.nodeType !== this.nodeKind) {
      return false;
    }

    // Check node name if specified
    if (this.nodeName && !this.isWildcardName) {
      if (value.localName !== this.nodeName && value.nodeName !== this.nodeName) {
        return false;
      }
    }

    // Check node type if specified
    if (this.nodeType && value.type !== this.nodeType) {
      return false;
    }

    return true;
  }
}

/**
 * NodeKindTest: node() - matches any node
 */
export class NodeKindTest extends KindTestImpl {
  constructor() {
    super('node()', 'node');
  }

  matches(): boolean {
    return true; // Matches any node
  }
}

/**
 * ElementTest: element() or element(name) or element(name, type)
 * 
 * Examples:
 *   - element() - any element
 *   - element(book) - element with local name "book"
 *   - element(*, xs:integer) - any element with xs:integer type
 *   - element(book, xs:date) - element "book" with xs:date type
 */
export class ElementTest extends KindTestImpl {
  constructor(elementName?: string, elementType?: string) {
    const name = elementName
      ? elementType
        ? `element(${elementName}, ${elementType})`
        : `element(${elementName})`
      : 'element()';

    super(name, 'element', elementName, elementType, !elementName);
  }
}

/**
 * AttributeTest: attribute() or attribute(name) or attribute(name, type)
 * 
 * Examples:
 *   - attribute() - any attribute
 *   - attribute(id) - attribute with local name "id"
 *   - attribute(*, xs:IDREF) - any attribute with xs:IDREF type
 *   - attribute(lang, xs:language) - attribute "lang" with xs:language type
 */
export class AttributeTest extends KindTestImpl {
  constructor(attributeName?: string, attributeType?: string) {
    const name = attributeName
      ? attributeType
        ? `attribute(${attributeName}, ${attributeType})`
        : `attribute(${attributeName})`
      : 'attribute()';

    super(name, 'attribute', attributeName, attributeType, !attributeName);
  }
}

/**
 * DocumentNodeTest: document-node() or document-node(element(...))
 * 
 * Matches the document node (root). Can optionally specify a required element test.
 * 
 * Examples:
 *   - document-node() - any document node
 *   - document-node(element(book)) - document containing a "book" element
 *   - document-node(element()) - document containing any root element
 */
export class DocumentNodeTest extends KindTestImpl {
  private readonly elementTest?: ElementTest;

  constructor(elementTest?: ElementTest) {
    const name = elementTest ? `document-node(${elementTest.name})` : 'document-node()';
    super(name, 'document', undefined, undefined, true);
    this.elementTest = elementTest;
  }

  matches(value: any): boolean {
    if (!super.matches(value)) {
      return false;
    }

    // If element test specified, check the document element
    if (this.elementTest && value.documentElement) {
      return this.elementTest.matches(value.documentElement);
    }

    return true;
  }
}

/**
 * TextTest: text() - matches text nodes
 */
export class TextTest extends KindTestImpl {
  constructor() {
    super('text()', 'text');
  }
}

/**
 * CommentTest: comment() - matches comment nodes
 */
export class CommentTest extends KindTestImpl {
  constructor() {
    super('comment()', 'comment');
  }
}

/**
 * ProcessingInstructionTest: processing-instruction() or processing-instruction(target)
 * 
 * Examples:
 *   - processing-instruction() - any processing instruction
 *   - processing-instruction(php) - processing instruction with target "php"
 */
export class ProcessingInstructionTest extends KindTestImpl {
  constructor(target?: string) {
    const name = target ? `processing-instruction(${target})` : 'processing-instruction()';
    super(name, 'processing-instruction', target, undefined, !target);
  }
}

/**
 * SchemaElementTest: schema-element(name)
 * 
 * Matches elements declared in the schema with the given name.
 * Requires schema information to be available.
 * 
 * Example:
 *   - schema-element(book) - element declared as <xs:element name="book"> in schema
 */
export class SchemaElementTest extends KindTestImpl {
  constructor(elementName: string) {
    super(`schema-element(${elementName})`, 'element', elementName, undefined, false);
  }

  matches(value: any): boolean {
    if (!super.matches(value)) {
      return false;
    }

    // Schema matching would require schema information
    // For now, just check the name
    return true;
  }
}

/**
 * SchemaAttributeTest: schema-attribute(name)
 * 
 * Matches attributes declared in the schema with the given name.
 * Requires schema information to be available.
 * 
 * Example:
 *   - schema-attribute(lang) - attribute declared as <xs:attribute name="lang"> in schema
 */
export class SchemaAttributeTest extends KindTestImpl {
  constructor(attributeName: string) {
    super(`schema-attribute(${attributeName})`, 'attribute', attributeName, undefined, false);
  }

  matches(value: any): boolean {
    if (!super.matches(value)) {
      return false;
    }

    // Schema matching would require schema information
    // For now, just check the name
    return true;
  }
}

/**
 * Pre-defined KindTest instances for common cases
 */
export const KIND_TESTS = {
  node: new NodeKindTest(),
  element: new ElementTest(),
  attribute: new AttributeTest(),
  documentNode: new DocumentNodeTest(),
  text: new TextTest(),
  comment: new CommentTest(),
  processingInstruction: new ProcessingInstructionTest()
};

/**
 * Create an ElementTest with the given name and optional type
 */
export function createElement(name?: string, type?: string): ElementTest {
  return new ElementTest(name, type);
}

/**
 * Create an AttributeTest with the given name and optional type
 */
export function createAttribute(name?: string, type?: string): AttributeTest {
  return new AttributeTest(name, type);
}

/**
 * Create a DocumentNodeTest with optional element test
 */
export function createDocumentNode(elementTest?: ElementTest): DocumentNodeTest {
  return new DocumentNodeTest(elementTest);
}

/**
 * Create a ProcessingInstructionTest with optional target
 */
export function createProcessingInstruction(target?: string): ProcessingInstructionTest {
  return new ProcessingInstructionTest(target);
}

/**
 * Create a SchemaElementTest with the given name
 */
export function createSchemaElement(name: string): SchemaElementTest {
  return new SchemaElementTest(name);
}

/**
 * Create a SchemaAttributeTest with the given name
 */
export function createSchemaAttribute(name: string): SchemaAttributeTest {
  return new SchemaAttributeTest(name);
}
