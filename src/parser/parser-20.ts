import {
    XPathCastableExpression,
    XPathConditionalExpression,
    XPathExpression,
    XPathForExpression,
    XPathInstanceOfExpression,
    XPathQuantifiedExpression,
    XPathTreatExpression,
    XPathUnionExpression,
} from '../expressions';
import { XPathToken } from '../lexer/token';
import {
    ITEM_TYPE,
    OccurrenceIndicator,
    SequenceType,
    createAtomicSequenceType,
    createEmptySequenceType,
    createItemSequenceType,
    getAtomicType,
} from '../types';
import { XPathBaseParserOptions } from '../xslt-extensions';
import { XPathBaseParser } from './base-parser';

export class XPath20Parser extends XPathBaseParser {
    constructor(options?: XPathBaseParserOptions) {
        super(options);
        // Allow 3.0/3.1 to pass through for XPath30Parser subclass
        // XPath 2.0 features are a subset of 3.0/3.1
        this.ensureVersionSupport(['2.0', '3.0', '3.1'], '2.0');
    }

    protected parseExpr(): XPathExpression {
        if (this.checkReservedWord('for')) {
            return this.parseForExpr();
        }

        if (this.checkReservedWord('some') || this.checkReservedWord('every')) {
            return this.parseQuantifiedExpr();
        }

        return super.parseExpr();
    }

    protected parseUnionExpr(): XPathExpression {
        let left = this.parseInstanceOfExpr();

        while (this.match('PIPE')) {
            const right = this.parseInstanceOfExpr();
            left = new XPathUnionExpression(left, right);
        }

        return left;
    }

    protected parsePrimaryExpr(): XPathExpression {
        if (this.check('RESERVED_WORD') && this.peek().lexeme === 'if') {
            return this.parseIfExpr();
        }

        return super.parsePrimaryExpr();
    }

    private parseInstanceOfExpr(): XPathExpression {
        let expr = this.parseTreatExpr();

        if (this.checkReservedWord('instance')) {
            this.advance();
            this.consumeReservedWord('of', "Expected 'of' after 'instance'");
            const sequenceType = this.parseSequenceType();
            expr = new XPathInstanceOfExpression(expr, sequenceType);
        }

        return expr;
    }

    private parseTreatExpr(): XPathExpression {
        let expr = this.parseCastableExpr();

        if (this.checkReservedWord('treat')) {
            this.advance();
            this.consumeReservedWord('as', "Expected 'as' after 'treat'");
            const sequenceType = this.parseSequenceType();
            expr = new XPathTreatExpression(expr, sequenceType);
        }

        return expr;
    }

    private parseCastableExpr(): XPathExpression {
        let expr = this.parsePathExpr();

        if (this.checkReservedWord('castable')) {
            this.advance();
            this.consumeReservedWord('as', "Expected 'as' after 'castable'");
            const sequenceType = this.parseSequenceType();
            expr = new XPathCastableExpression(expr, sequenceType);
        }

        return expr;
    }

    private parseIfExpr(): XPathExpression {
        this.advance();
        this.consume('OPEN_PAREN', "Expected '(' after 'if'");
        const testExpr = this.parseExpr();
        this.consume('CLOSE_PAREN', "Expected ')' after if test expression");

        if (!(this.check('RESERVED_WORD') && this.peek().lexeme === 'then')) {
            throw new Error("Expected 'then' in conditional expression");
        }
        this.advance();
        const thenExpr = this.parseExpr();

        if (!(this.check('RESERVED_WORD') && this.peek().lexeme === 'else')) {
            throw new Error("Expected 'else' in conditional expression");
        }
        this.advance();
        const elseExpr = this.parseExpr();

        return new XPathConditionalExpression(testExpr, thenExpr, elseExpr);
    }

    private parseQuantifiedExpr(): XPathExpression {
        const quantifier = this.consumeReservedWordOneOf(
            ['some', 'every'],
            "Expected 'some' or 'every' at start of quantified expression"
        ) as 'some' | 'every';

        const bindings: { variable: string; expression: XPathExpression }[] = [];
        do {
            bindings.push(this.parseForBinding());
        } while (this.match('COMMA'));

        this.consumeReservedWord(
            'satisfies',
            "Expected 'satisfies' after quantified expression bindings"
        );
        const satisfiesExpr = this.parseExpr();

        return new XPathQuantifiedExpression(quantifier, bindings, satisfiesExpr);
    }

    private parseForExpr(): XPathExpression {
        this.consumeReservedWord('for', "Expected 'for' at start of for expression");

        const bindings: { variable: string; expression: XPathExpression }[] = [];
        do {
            bindings.push(this.parseForBinding());
        } while (this.match('COMMA'));

        this.consumeReservedWord('return', "Expected 'return' in for expression");
        const returnExpr = this.parseExpr();

        return new XPathForExpression(bindings, returnExpr);
    }

    private parseForBinding(): { variable: string; expression: XPathExpression } {
        this.consume('DOLLAR', "Expected '$' after 'for'");
        const name = this.consume('IDENTIFIER', 'Expected variable name in for binding').lexeme;
        this.consumeReservedWord('in', "Expected 'in' after variable name in for clause");
        const expression = this.parseExpr();
        return { variable: name, expression };
    }

    protected parseSequenceType(): SequenceType {
        if (this.checkName('empty-sequence')) {
            this.advance();
            this.consume('OPEN_PAREN', "Expected '(' after empty-sequence");
            this.consume('CLOSE_PAREN', "Expected ')' after empty-sequence");
            return createEmptySequenceType();
        }

        if (this.checkName('item')) {
            this.advance();
            this.consume('OPEN_PAREN', "Expected '(' after item");
            this.consume('CLOSE_PAREN', "Expected ')' after item()");
            const occurrence = this.parseOccurrenceIndicator();
            return createItemSequenceType(ITEM_TYPE, occurrence);
        }

        // map(key-type, value-type) - XPath 3.1 support in 2.0 parser
        if (this.checkName('map')) {
            this.advance();
            this.consume('OPEN_PAREN', "Expected '(' after map");

            let keyType: SequenceType | null = null;
            let valueType: SequenceType | null = null;

            if (this.match('ASTERISK')) {
                // map(*)
                this.consume('CLOSE_PAREN', "Expected ')' after map(*)");
            } else {
                // map(key-type, value-type)
                keyType = this.parseSequenceType();
                this.consume('COMMA', "Expected ',' after key type in map()");
                valueType = this.parseSequenceType();
                this.consume('CLOSE_PAREN', "Expected ')' after map type");
            }

            const occurrence = this.parseOccurrenceIndicator();

            // Create typed map test
            const { createTypedMapTest } = require('../types/typed-collection-types');
            const mapItemType = createTypedMapTest(keyType, valueType);
            return createItemSequenceType(mapItemType, occurrence);
        }

        // array(member-type) - XPath 3.1 support in 2.0 parser
        if (this.checkName('array')) {
            this.advance();
            this.consume('OPEN_PAREN', "Expected '(' after array");

            let memberType: SequenceType | null = null;

            if (this.match('ASTERISK')) {
                // array(*)
                this.consume('CLOSE_PAREN', "Expected ')' after array(*)");
            } else {
                // array(member-type)
                memberType = this.parseSequenceType();
                this.consume('CLOSE_PAREN', "Expected ')' after array type");
            }

            const occurrence = this.parseOccurrenceIndicator();

            // Create typed array test
            const { createTypedArrayTest } = require('../types/typed-collection-types');
            const arrayItemType = createTypedArrayTest(memberType);
            return createItemSequenceType(arrayItemType, occurrence);
        }

        const qname = this.parseQName();
        const occurrence = this.parseOccurrenceIndicator();

        const localName = this.stripPrefix(qname);
        const atomicType = getAtomicType(localName);
        if (!atomicType) {
            throw new Error(`Unknown atomic type: ${qname}`);
        }

        return createAtomicSequenceType(atomicType, occurrence);
    }

    private parseOccurrenceIndicator(): OccurrenceIndicator {
        if (this.match('QUESTION')) return OccurrenceIndicator.ZERO_OR_ONE;
        if (this.match('ASTERISK')) return OccurrenceIndicator.ZERO_OR_MORE;
        if (this.match('PLUS')) return OccurrenceIndicator.ONE_OR_MORE;
        return OccurrenceIndicator.EXACTLY_ONE;
    }

    private parseQName(): string {
        const first = this.consumeNameToken('Expected type name in SequenceType');
        if (this.match('COLON')) {
            const local = this.consumeNameToken(
                'Expected local name after : in SequenceType'
            ).lexeme;
            return `${first.lexeme}:${local}`;
        }
        return first.lexeme;
    }

    private stripPrefix(qname: string): string {
        const parts = qname.split(':');
        return parts.length === 2 ? parts[1] : parts[0];
    }

    private consumeNameToken(message: string): XPathToken {
        if (this.isNameToken()) {
            return this.advance();
        }
        throw new Error(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    private isNameToken(): boolean {
        if (this.isAtEnd()) return false;
        const type = this.peek().type;
        return (
            type === 'IDENTIFIER' ||
            type === 'FUNCTION' ||
            type === 'NODE_TYPE' ||
            type === 'OPERATOR' ||
            type === 'LOCATION' ||
            type === 'RESERVED_WORD'
        );
    }

    private checkName(name: string): boolean {
        return this.isNameToken() && this.peek().lexeme === name;
    }

    private checkReservedWord(word: string): boolean {
        return this.check('RESERVED_WORD') && this.peek().lexeme === word;
    }

    private consumeReservedWord(word: string, message: string): void {
        if (this.checkReservedWord(word)) {
            this.advance();
            return;
        }
        throw new Error(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }

    private consumeReservedWordOneOf(words: string[], message: string): string {
        for (const word of words) {
            if (this.checkReservedWord(word)) {
                this.advance();
                return word;
            }
        }
        throw new Error(`${message}. Got: ${this.peek()?.lexeme ?? 'EOF'}`);
    }
}
