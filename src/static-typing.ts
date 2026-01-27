/**
 * Static Typing (Appendix F) — Minimal Infrastructure
 *
 * Provides lightweight static type inference helpers for XPath expressions.
 * This module is optional and does not affect runtime evaluation.
 */

// Sequence cardinality indicators
export type SequenceCardinality = 'zero-or-one' | 'exactly-one' | 'zero-or-more' | 'one-or-more';

// Static type description (simplified)
export interface StaticType {
    // QName of type, e.g., {http://www.w3.org/2001/XMLSchema}string
    name: string;
    // Sequence cardinality
    cardinality: SequenceCardinality;
}

// Predefined atomic type names (using XS namespace)
export const XS = {
    string: '{http://www.w3.org/2001/XMLSchema}string',
    boolean: '{http://www.w3.org/2001/XMLSchema}boolean',
    double: '{http://www.w3.org/2001/XMLSchema}double',
    decimal: '{http://www.w3.org/2001/XMLSchema}decimal',
    integer: '{http://www.w3.org/2001/XMLSchema}integer',
    anyURI: '{http://www.w3.org/2001/XMLSchema}anyURI',
    QName: '{http://www.w3.org/2001/XMLSchema}QName',
    anyAtomic: '{http://www.w3.org/2001/XMLSchema}anyAtomicType',
    item: 'item()',
};

// Inference environment (placeholder for variable types, function signatures, etc.)
export interface TypeEnv {
    variables?: Record<string, StaticType>;
    functions?: Record<string, { params: StaticType[]; result: StaticType }>;
}

// Helpers to construct StaticType
export function exactlyOne(name: string): StaticType {
    return { name, cardinality: 'exactly-one' };
}
export function zeroOrOne(name: string): StaticType {
    return { name, cardinality: 'zero-or-one' };
}
export function oneOrMore(name: string): StaticType {
    return { name, cardinality: 'one-or-more' };
}
export function zeroOrMore(name: string): StaticType {
    return { name, cardinality: 'zero-or-more' };
}

// Cardinality combinators for common ops
export function concatCardinality(
    a: SequenceCardinality,
    b: SequenceCardinality
): SequenceCardinality {
    if (a === 'zero-or-one' && b === 'zero-or-one') return 'zero-or-more';
    if (a === 'exactly-one' && b === 'exactly-one') return 'one-or-more';
    if (a === 'zero-or-more' || b === 'zero-or-more') return 'zero-or-more';
    return 'one-or-more';
}

// Minimal inference for literals
export function inferLiteral(value: unknown): StaticType {
    switch (typeof value) {
        case 'string':
            return exactlyOne(XS.string);
        case 'number':
            // Use double as common numeric supertype
            return exactlyOne(XS.double);
        case 'boolean':
            return exactlyOne(XS.boolean);
        default:
            return exactlyOne(XS.item);
    }
}

// Minimal inference for arithmetic: double
export function inferArithmetic(left: StaticType, right: StaticType): StaticType {
    // Numeric promotion simplified to double
    return exactlyOne(XS.double);
}

// Minimal inference for comparisons: boolean
export function inferComparison(): StaticType {
    return exactlyOne(XS.boolean);
}

// Minimal inference for sequence construction
export function inferSequence(items: StaticType[]): StaticType {
    if (items.length === 0) return zeroOrMore(XS.item);
    // Result item type is the least common supertype — simplified to item()
    const card = items.some((i) => i.cardinality !== 'exactly-one')
        ? 'zero-or-more'
        : 'one-or-more';
    return { name: XS.item, cardinality: card };
}

// Entry point (placeholder): infer type for a node in an expression tree
export function inferType(node: any, env: TypeEnv): StaticType {
    if (!node) return exactlyOne(XS.item);
    switch (node.kind) {
        case 'StringLiteral':
            return inferLiteral(String(node.value));
        case 'NumericLiteral':
            return inferLiteral(Number(node.value));
        case 'BooleanLiteral':
            return inferLiteral(Boolean(node.value));
        case 'BinaryExpression': {
            const left = inferType(node.left, env);
            const right = inferType(node.right, env);
            if (['+', '-', '*', 'div', 'idiv', 'mod'].includes(node.operator)) {
                return inferArithmetic(left, right);
            }
            if (
                ['eq', 'ne', 'lt', 'le', 'gt', 'ge', '=', '!=', '<', '<=', '>', '>='].includes(
                    node.operator
                )
            ) {
                return inferComparison();
            }
            return exactlyOne(XS.item);
        }
        case 'SequenceExpression': {
            const inferred = (node.items || []).map((it: any) => inferType(it, env));
            return inferSequence(inferred);
        }
        default:
            return exactlyOne(XS.item);
    }
}
