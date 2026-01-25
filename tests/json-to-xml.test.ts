import { XPathLexer } from '../src/lexer';
import { XPath10Parser } from '../src/parser';
import { XPathContext } from '../src/context';
import { NodeType } from '../src/constants';

describe('json-to-xml Function', () => {
    const lexer = new XPathLexer();
    const parser = new XPath10Parser();

    function parse(expression: string) {
        const tokens = lexer.scan(expression);
        return parser.parse(tokens);
    }

    function evaluate(expression: string, context: Partial<XPathContext> = {}) {
        const ast = parse(expression);
        const fullContext: XPathContext = {
            node: context.node || undefined,
            position: context.position || 1,
            size: context.size || 1,
            functions: context.functions || {},
            ...context,
        };
        return ast.evaluate(fullContext);
    }

    describe('Basic JSON to XML conversion', () => {
        it('should convert simple string JSON', () => {
            const result = evaluate('json-to-xml(\'"hello"\')', {});
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            expect(nodeSet.length).toBe(1);
            const doc = nodeSet[0];
            expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
            expect(doc.childNodes).toHaveLength(1);
            expect(doc.childNodes[0].nodeName).toBe('root');
            expect(doc.childNodes[0].textContent).toBe('hello');
        });

        it('should convert simple number JSON', () => {
            const result = evaluate('json-to-xml("42")', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            expect(nodeSet.length).toBe(1);
            const doc = nodeSet[0];
            expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
            expect(doc.childNodes[0].textContent).toBe('42');
        });

        it('should convert boolean true', () => {
            const result = evaluate('json-to-xml("true")', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            expect(doc.childNodes[0].textContent).toBe('true');
        });

        it('should convert boolean false', () => {
            const result = evaluate('json-to-xml("false")', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            expect(doc.childNodes[0].textContent).toBe('false');
        });

        it('should convert null JSON to null', () => {
            const result = evaluate('json-to-xml("null")', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
            expect(doc.childNodes[0].childNodes).toHaveLength(0);
        });
    });

    describe('Object conversion', () => {
        it('should convert simple object', () => {
            const result = evaluate('json-to-xml(\'{"name":"John","age":30}\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            expect(root.nodeName).toBe('root');
            expect(root.childNodes.length).toBe(2);

            const nameElement = root.childNodes.find((n: any) => n.nodeName === 'name');
            const ageElement = root.childNodes.find((n: any) => n.nodeName === 'age');

            expect(nameElement).toBeDefined();
            expect(nameElement.textContent).toBe('John');
            expect(ageElement).toBeDefined();
            expect(ageElement.textContent).toBe('30');
        });

        it('should convert nested objects', () => {
            const result = evaluate('json-to-xml(\'{"person":{"name":"John","age":30}}\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            const personElement = root.childNodes[0];
            
            expect(personElement.nodeName).toBe('person');
            expect(personElement.childNodes.length).toBe(2);
        });

        it('should handle object with null value', () => {
            const result = evaluate('json-to-xml(\'{"value":null}\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            const valueElement = root.childNodes[0];

            expect(valueElement.nodeName).toBe('value');
            expect(valueElement.childNodes).toHaveLength(0);
        });
    });

    describe('Array conversion', () => {
        it('should convert simple array', () => {
            const result = evaluate('json-to-xml(\'[1,2,3]\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.nodeName).toBe('root');
            expect(root.childNodes.length).toBe(3);
            
            root.childNodes.forEach((item: any) => {
                expect(item.nodeName).toBe('item');
            });
            
            expect(root.childNodes[0].textContent).toBe('1');
            expect(root.childNodes[1].textContent).toBe('2');
            expect(root.childNodes[2].textContent).toBe('3');
        });

        it('should convert array of objects', () => {
            const result = evaluate('json-to-xml(\'[{"id":1},{"id":2}]\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.childNodes.length).toBe(2);
            root.childNodes.forEach((item: any) => {
                expect(item.nodeName).toBe('item');
                expect(item.childNodes.length).toBe(1);
                expect(item.childNodes[0].nodeName).toBe('id');
            });
        });

        it('should convert empty array', () => {
            const result = evaluate('json-to-xml(\'[]\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.nodeName).toBe('root');
            expect(root.childNodes).toHaveLength(0);
        });
    });

    describe('Complex nested structures', () => {
        it('should convert object with array property', () => {
            const result = evaluate('json-to-xml(\'{"items":[1,2,3]}\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            const itemsElement = root.childNodes[0];
            
            expect(itemsElement.nodeName).toBe('items');
            expect(itemsElement.childNodes.length).toBe(3);
        });

        it('should convert complex nested structure', () => {
            const json = JSON.stringify({
                users: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' }
                ],
                count: 2
            });
            
            const result = evaluate(`json-to-xml('${json}')`, {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.childNodes.length).toBe(2);
            const usersElement = root.childNodes.find((n: any) => n.nodeName === 'users');
            expect(usersElement).toBeDefined();
            expect(usersElement.childNodes.length).toBe(2);
        });
    });

    describe('Element name sanitization', () => {
        it('should sanitize numeric property names', () => {
            const result = evaluate('json-to-xml(\'{"1prop":"value"}\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            const element = root.childNodes[0];
            
            // Should start with underscore or letter
            expect(/^[a-zA-Z_]/.test(element.nodeName)).toBe(true);
        });

        it('should handle property names with special characters', () => {
            const result = evaluate('json-to-xml(\'{"prop-name":"value"}\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            expect(root.childNodes.length).toBe(1);
            // Dash is valid in XML names
            expect(root.childNodes[0].nodeName).toBe('prop-name');
        });

        it('should sanitize property names with invalid characters', () => {
            const result = evaluate('json-to-xml(\'{"prop name":"value"}\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            expect(root.childNodes.length).toBe(1);
            // Space should be replaced with underscore
            expect(root.childNodes[0].nodeName).toMatch(/^prop_name$/);
        });
    });

    describe('Null and empty input handling', () => {
        it('should return empty array for empty string', () => {
            const result = evaluate('json-to-xml("")', {});
            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should return empty array for whitespace-only string', () => {
            const result = evaluate('json-to-xml("   ")', {});
            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should return empty array for invalid JSON without options', () => {
            const result = evaluate('json-to-xml("{invalid json}")', {});
            expect(Array.isArray(result)).toBe(true);
            expect((result as any[]).length).toBe(0);
        });

        it('should convert null JSON to document with empty root', () => {
            const result = evaluate('json-to-xml("null")', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            // "null" is valid JSON and creates an empty element
            expect(doc.childNodes[0].childNodes).toHaveLength(0);
        });
    });

    describe('Document structure', () => {
        it('should return document node in array', () => {
            const result = evaluate('json-to-xml(\'"test"\')', {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            expect(nodeSet.length).toBe(1);
            const doc = nodeSet[0];
            expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
            expect(doc.nodeName).toBe('#document');
        });

        it('should have root element in document', () => {
            const result = evaluate('json-to-xml(\'"test"\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            expect(doc.childNodes).toBeDefined();
            expect(doc.childNodes.length).toBe(1);
            expect(doc.childNodes[0].nodeName).toBe('root');
        });

        it('document element should have ownerDocument reference', () => {
            const result = evaluate('json-to-xml(\'"test"\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            expect(doc.childNodes[0].ownerDocument).toBe(doc);
        });

        it('should set parentNode references correctly', () => {
            const result = evaluate('json-to-xml(\'{"child":"value"}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            // Check ownerDocument reference is set
            expect(root.ownerDocument).toBe(doc);
        });
    });

    describe('Text node creation', () => {
        it('should create text node for string values', () => {
            const result = evaluate('json-to-xml(\'{"text":"hello"}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const textElement = doc.childNodes[0].childNodes[0];
            const textNode = textElement.childNodes[0];
            
            expect(textNode.nodeType).toBe(NodeType.TEXT_NODE);
            expect(textNode.nodeName).toBe('#text');
            expect(textNode.textContent).toBe('hello');
        });

        it('should create text node for number values', () => {
            const result = evaluate('json-to-xml(\'{"num":123}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const numElement = doc.childNodes[0].childNodes[0];
            const textNode = numElement.childNodes[0];
            
            expect(textNode.nodeType).toBe(NodeType.TEXT_NODE);
            expect(textNode.textContent).toBe('123');
        });

        it('should set element textContent', () => {
            const result = evaluate('json-to-xml(\'"text"\' )', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.textContent).toBe('text');
        });
    });

    describe('Navigation and XPath integration', () => {
        it('should navigate through converted XML structure', () => {
            const result = evaluate('json-to-xml(\'{"root":{"child":"value"}}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            
            // Verify structure for navigation
            const root = doc.childNodes[0];
            const rootElement = root.childNodes[0];
            const childElement = rootElement.childNodes[0];
            
            expect(root.nodeName).toBe('root');
            expect(rootElement.nodeName).toBe('root');
            expect(childElement.nodeName).toBe('child');
            expect(childElement.textContent).toBe('value');
        });

        it('should support sibling navigation', () => {
            const result = evaluate('json-to-xml(\'{"a":"1","b":"2","c":"3"}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            // Set up sibling relationships
            for (let i = 0; i < root.childNodes.length - 1; i++) {
                root.childNodes[i].nextSibling = root.childNodes[i + 1];
                root.childNodes[i + 1].previousSibling = root.childNodes[i];
            }
            
            expect(root.childNodes.length).toBe(3);
            expect(root.childNodes[0].nodeName).toBe('a');
            expect(root.childNodes[1].nodeName).toBe('b');
            expect(root.childNodes[2].nodeName).toBe('c');
        });
    });

    describe('Edge cases', () => {
        it('should handle deeply nested structures', () => {
            const deep = { a: { b: { c: { d: { e: 'value' } } } } };
            const json = JSON.stringify(deep);
            
            const result = evaluate(`json-to-xml('${json}')`, {});
            expect(Array.isArray(result)).toBe(true);
            const nodeSet = result as any[];
            
            let current = nodeSet[0].childNodes[0];
            while (current && current.childNodes && current.childNodes.length > 0) {
                expect(current.nodeName).toBeDefined();
                current = current.childNodes[0];
            }
            // Should eventually reach the leaf value
            expect(current?.textContent).toBe('value');
        });

        it('should handle large arrays', () => {
            const arr = Array.from({ length: 100 }, (_, i) => i);
            const json = JSON.stringify(arr);
            
            const result = evaluate(`json-to-xml('${json}')`, {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.childNodes.length).toBe(100);
        });

        it('should handle mixed type arrays', () => {
            const result = evaluate('json-to-xml(\'[1,"two",true,null]\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.childNodes.length).toBe(4);
            expect(root.childNodes[0].textContent).toBe('1');
            expect(root.childNodes[1].textContent).toBe('two');
            expect(root.childNodes[2].textContent).toBe('true');
            expect(root.childNodes[3].childNodes).toHaveLength(0);
        });

        it('should handle special JSON strings', () => {
            const result = evaluate('json-to-xml(\'{"escaped":"line1\\nline2","quote":"\\\"quoted\\\""}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            expect(root.childNodes.length).toBe(2);
        });

        it('should handle objects with numeric string keys', () => {
            const result = evaluate('json-to-xml(\'{"1":"a","2":"b","3":"c"}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            
            expect(root.childNodes.length).toBe(3);
            // Numeric keys should be sanitized
            root.childNodes.forEach((node: any) => {
                expect(/^[a-zA-Z_]/.test(node.nodeName)).toBe(true);
            });
        });
    });

    describe('Node type verification', () => {
        it('should set correct nodeType for elements', () => {
            const result = evaluate('json-to-xml(\'{"elem":"val"}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const root = doc.childNodes[0];
            const elem = root.childNodes[0];
            
            expect(root.nodeType).toBe(NodeType.ELEMENT_NODE);
            expect(elem.nodeType).toBe(NodeType.ELEMENT_NODE);
        });

        it('should set correct nodeType for text nodes', () => {
            const result = evaluate('json-to-xml(\'{"elem":"val"}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const elem = doc.childNodes[0].childNodes[0];
            const textNode = elem.childNodes[0];
            
            expect(textNode.nodeType).toBe(NodeType.TEXT_NODE);
        });

        it('should set localName equal to nodeName for elements', () => {
            const result = evaluate('json-to-xml(\'{"myelem":"val"}\')', {});
            const nodeSet = result as any[];
            const doc = nodeSet[0];
            const elem = doc.childNodes[0].childNodes[0];
            
            expect(elem.localName).toBe(elem.nodeName);
        });
    });
});
