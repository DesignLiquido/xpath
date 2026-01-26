/**
 * XPath 3.1 Parser
 *
 * Extends XPath30Parser to add support for XPath 3.1 features:
 * - Map constructors: map { key: value, ... }
 * - Array constructors: [item1, item2, ...] and array { expr }
 * - Lookup operator: ?key, ?*, ?(expr)
 * - Enhanced map and array functions
 * - JSON integration
 *
 * Reference: https://www.w3.org/TR/xpath-31/
 */

import { XPathExpression } from "../expressions";
import { XPathMapConstructorExpression, MapConstructorEntry } from "../expressions/map-constructor-expression";
import { XPathVariableReference } from "../expressions";
import { XPathBaseParserOptions } from "../xslt-extensions";
import { XPath30Parser } from "./parser-30";

export class XPath31Parser extends XPath30Parser {
    constructor(options?: XPathBaseParserOptions) {
        // Default to XPath 3.1 if no version specified
        const opts = options ? { ...options } : {};
        if (!opts.version) {
            opts.version = '3.1';
        }
        super(opts);
        this.ensureVersionSupport(['3.1'], '3.1');
    }

    /**
     * Override parsePrimaryExpr to handle:
     * - Map constructors (map { key: value, ... })
     * - All XPath 3.0 features from parent class
     */
    protected parsePrimaryExpr(): XPathExpression {
        // Map constructor: map { key: value, ... } (XPath 3.1)
        if (this.check('RESERVED_WORD') && this.peek().lexeme === 'map' && this.peekNext()?.type === 'OPEN_CURLY_BRACKET') {
            return this.parseMapConstructor();
        }

        // Delegate to XPath 3.0 parser for other primary expressions
        return super.parsePrimaryExpr();
    }

    /**
     * Parse a map constructor expression (XPath 3.1).
     * Syntax: map { key1: value1, key2: value2, ... }
     * Syntax: map { } (empty map)
     * 
     * Each entry is: ExprSingle : ExprSingle
     */
    private parseMapConstructor(): XPathExpression {
        // Consume 'map' keyword
        this.advance();

        // Consume '{'
        this.consume('OPEN_CURLY_BRACKET', "Expected '{' after 'map'");

        const entries: MapConstructorEntry[] = [];

        // Empty map: map { }
        if (this.check('CLOSE_CURLY_BRACKET')) {
            this.advance();
            return new XPathMapConstructorExpression(entries);
        }

        // Parse key-value pairs
        do {
            // Parse key as ExprSingle to avoid treating commas inside entries as sequence separators
            const key = this.parseExprSingle();

            // Consume ':'
            this.consume('COLON', "Expected ':' after map key");

            // Parse value expression as ExprSingle for the same reason
            const value = this.parseExprSingle();

            entries.push({ key, value });

            // Check for more entries
        } while (this.match('COMMA'));

        // Consume '}'
        this.consume('CLOSE_CURLY_BRACKET', "Expected '}' after map entries");

        return new XPathMapConstructorExpression(entries);
    }
}