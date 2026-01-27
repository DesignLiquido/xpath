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

import { XPathExpression } from '../expressions';
import {
    XPathMapConstructorExpression,
    MapConstructorEntry,
} from '../expressions/map-constructor-expression';
import {
    XPathSquareBracketArrayConstructor,
    XPathCurlyBraceArrayConstructor,
} from '../expressions/array-constructor-expression';
import {
    XPathLookupExpression,
    KeySpecifier,
    KeySpecifierType,
} from '../expressions/lookup-expression';
import { XPathVariableReference } from '../expressions';
import { XPathBaseParserOptions } from '../xslt-extensions';
import { XPath30Parser } from './parser-30';

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
     * - Array constructors ([item, ...] and array { expr })
     * - All XPath 3.0 features from parent class
     */
    protected parsePrimaryExpr(): XPathExpression {
        // Map constructor: map { key: value, ... } (XPath 3.1)
        // Note: map:* function calls (e.g., map:size) are handled by parent class
        if (
            this.check('RESERVED_WORD') &&
            this.peek().lexeme === 'map' &&
            this.peekNext()?.type === 'OPEN_CURLY_BRACKET'
        ) {
            return this.parseMapConstructor();
        }

        // Array constructor: array { expr } (XPath 3.1)
        // Note: array:* function calls (e.g., array:size) are handled by parent class
        if (
            this.check('RESERVED_WORD') &&
            this.peek().lexeme === 'array' &&
            this.peekNext()?.type === 'OPEN_CURLY_BRACKET'
        ) {
            return this.parseCurlyArrayConstructor();
        }

        // Handle map:* and array:* function calls (e.g., map:size, array:size)
        // These look like reserved words followed by colon and function name
        if (
            this.check('RESERVED_WORD') &&
            (this.peek().lexeme === 'map' || this.peek().lexeme === 'array') &&
            this.peekNext()?.type === 'COLON'
        ) {
            return this.parseNamespacedFunctionCall();
        }

        // Square bracket array constructor: [item, item, ...] (XPath 3.1)
        if (this.check('OPEN_SQUARE_BRACKET')) {
            return this.parseSquareBracketArrayConstructor();
        }

        // Unary lookup operator: ?key (when context item is map/array) (XPath 3.1)
        if (this.check('QUESTION')) {
            return this.parseLookupExpr(null);
        }

        // Delegate to XPath 3.0 parser for other primary expressions
        return super.parsePrimaryExpr();
    }

    /**
     * Parse a namespaced function call like map:size or array:get.
     * These start with a reserved word (map/array) followed by colon.
     */
    private parseNamespacedFunctionCall(): XPathExpression {
        // Get the namespace prefix (map or array)
        const prefix = this.advance().lexeme;

        // Consume the colon
        this.consume('COLON', `Expected ':' after '${prefix}'`);

        // Get the function local name (can be IDENTIFIER or FUNCTION token)
        if (!this.check('IDENTIFIER') && !this.check('FUNCTION')) {
            throw new Error(`Expected function name after '${prefix}:'`);
        }
        const localName = this.advance().lexeme;

        // Build the full function name
        const fullName = `${prefix}:${localName}`;

        // Now we need to parse the function arguments
        // This is handled by the parent parser's function call logic
        // We need to create a function call expression

        // Consume the opening parenthesis
        this.consume('OPEN_PAREN', `Expected '(' after '${fullName}'`);

        // Parse arguments
        const args: XPathExpression[] = [];
        if (!this.check('CLOSE_PAREN')) {
            do {
                args.push(this.parseExprSingle());
            } while (this.match('COMMA'));
        }

        // Consume the closing parenthesis
        this.consume('CLOSE_PAREN', `Expected ')' after function arguments`);

        // Import and use the function call expression
        const { XPathFunctionCall } = require('../expressions/function-call-expression');
        return new XPathFunctionCall(fullName, args);
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

    /**
     * Parse a square bracket array constructor (XPath 3.1).
     * Syntax: [item1, item2, ...]
     * Syntax: [] (empty array)
     *
     * Each comma-separated expression becomes a separate array member.
     */
    private parseSquareBracketArrayConstructor(): XPathExpression {
        // Consume '['
        this.advance();

        const items: XPathExpression[] = [];

        // Empty array: []
        if (this.check('CLOSE_SQUARE_BRACKET')) {
            this.advance();
            return new XPathSquareBracketArrayConstructor(items);
        }

        // Parse items
        do {
            // Parse each item as ExprSingle to avoid treating commas as sequence separators
            const item = this.parseExprSingle();
            items.push(item);
        } while (this.match('COMMA'));

        // Consume ']'
        this.consume('CLOSE_SQUARE_BRACKET', "Expected ']' after array items");

        return new XPathSquareBracketArrayConstructor(items);
    }

    /**
     * Parse a curly brace array constructor (XPath 3.1).
     * Syntax: array { expr }
     * Syntax: array { } (empty array)
     *
     * The expression result is evaluated and each item in the
     * resulting sequence becomes a separate array member.
     */
    private parseCurlyArrayConstructor(): XPathExpression {
        // Consume 'array' keyword
        this.advance();

        // Consume '{'
        this.consume('OPEN_CURLY_BRACKET', "Expected '{' after 'array'");

        // Empty array: array { }
        if (this.check('CLOSE_CURLY_BRACKET')) {
            this.advance();
            // Return an array with an empty sequence expression
            return new XPathCurlyBraceArrayConstructor({
                evaluate: () => [],
                toString: () => '()',
            } as XPathExpression);
        }

        // Parse the expression (can be any expression, including sequences)
        const expr = this.parseExpr();

        // Consume '}'
        this.consume('CLOSE_CURLY_BRACKET', "Expected '}' after array expression");

        return new XPathCurlyBraceArrayConstructor(expr);
    }

    /**
     * Override parseFilterExpr to handle lookup operators after predicates.
     * Lookup operators have lower precedence than predicates.
     */
    protected parseFilterExpr(): XPathExpression {
        // First parse the base expression (which may include dynamic function calls and predicates)
        let expr = super.parseFilterExpr();

        // Check for lookup operators: expr?key (can be chained)
        while (this.check('QUESTION')) {
            expr = this.parseLookupExpr(expr);
        }

        return expr;
    }

    /**
     * Parse a lookup expression: ?key, ?1, ?(expr), ?*
     */
    private parseLookupExpr(baseExpr: XPathExpression): XPathExpression {
        this.consume('QUESTION', 'Expected ? for lookup operator');

        let keySpecifier: KeySpecifier;

        if (this.match('ASTERISK')) {
            // Wildcard: ?*
            keySpecifier = { type: KeySpecifierType.WILDCARD };
        } else if (this.check('OPEN_PAREN')) {
            // Parenthesized expression: ?(expr)
            this.advance(); // consume '('
            const expr = this.parseExpr();
            this.consume('CLOSE_PAREN', "Expected ')' after lookup expression");
            keySpecifier = { type: KeySpecifierType.PARENTHESIZED_EXPR, value: expr };
        } else if (this.check('NUMBER')) {
            // Integer literal: ?1, ?2, etc.
            const numToken = this.advance();
            const position = parseInt(numToken.lexeme, 10);
            keySpecifier = { type: KeySpecifierType.INTEGER_LITERAL, value: position };
        } else if (
            this.peek()?.type === 'IDENTIFIER' ||
            this.peek()?.type === 'FUNCTION' ||
            this.peek()?.type === 'OPERATOR' ||
            this.peek()?.type === 'LOCATION' ||
            this.peek()?.type === 'NODE_TYPE'
        ) {
            // NCName: ?key
            const name = this.advance().lexeme;
            keySpecifier = { type: KeySpecifierType.NCNAME, value: name };
        } else {
            throw new Error('Expected key specifier after ?');
        }

        return new XPathLookupExpression(baseExpr, keySpecifier);
    }

    /**
     * Override parseSequenceType to support union types (XPath 3.1 Extension)
     * Syntax: type1 | type2 | ... | typeN
     *
     * Examples:
     *   xs:string | xs:integer
     *   (xs:integer | xs:decimal) | xs:double
     */
    protected parseSequenceType(): any {
        // Parse the first type
        let firstType = super.parseSequenceType();

        // Check for union operator |
        if (this.check('PIPE')) {
            const memberTypes: any[] = [firstType];

            // Parse additional types in the union
            while (this.match('PIPE')) {
                const nextType = super.parseSequenceType();
                memberTypes.push(nextType);
            }

            // Create union type from all member types
            const { createUnionType } = require('../types/union-type');
            const { createItemSequenceType } = require('../types/sequence-type');

            // Extract ItemTypes from SequenceTypes (they all should have same occurrence)
            const itemTypes = memberTypes.map((st) => {
                if (st.getItemType && typeof st.getItemType === 'function') {
                    const itemType = st.getItemType();
                    if (itemType === 'empty') {
                        throw new Error('empty-sequence() cannot be used in union types');
                    }
                    return itemType;
                }
                return st;
            });

            // Get the occurrence indicator (use the first one, all should be compatible)
            const occurrence = firstType.getOccurrence ? firstType.getOccurrence() : 'ONE';

            // Create union ItemType
            const unionItemType = createUnionType(...itemTypes);

            // Wrap in SequenceType with the occurrence indicator
            return createItemSequenceType(unionItemType, occurrence);
        }

        return firstType;
    }

    /**
     * Override parseSequenceTypeInternal to support union types in type annotations
     * This is called from instance of, treat as, cast as, etc.
     */
    protected parseSequenceTypeInternal(): any {
        // Parse the first type using parent's internal method
        let firstType = super['parseSequenceTypeInternal']();

        // Check for union operator |
        if (this.check('PIPE')) {
            const memberTypes: any[] = [firstType];

            // Parse additional types in the union
            while (this.match('PIPE')) {
                const nextType = super['parseSequenceTypeInternal']();
                memberTypes.push(nextType);
            }

            // Create union type from all member types
            const { createUnionType } = require('../types/union-type');
            const { createItemSequenceType } = require('../types/sequence-type');

            // Extract ItemTypes from SequenceTypes
            const itemTypes = memberTypes.map((st) => {
                if (st.getItemType && typeof st.getItemType === 'function') {
                    const itemType = st.getItemType();
                    if (itemType === 'empty') {
                        throw new Error('empty-sequence() cannot be used in union types');
                    }
                    return itemType;
                }
                return st;
            });

            // Get the occurrence indicator
            const occurrence = firstType.getOccurrence ? firstType.getOccurrence() : 'ONE';

            // Create union ItemType
            const unionItemType = createUnionType(...itemTypes);

            // Wrap in SequenceType
            return createItemSequenceType(unionItemType, occurrence);
        }

        return firstType;
    }
}
