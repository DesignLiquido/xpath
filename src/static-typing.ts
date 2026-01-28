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
    // Basic inference based on node type
    if (!node || typeof node !== 'object') {
        return exactlyOne(XS.item);
    }

    // Handle expression nodes with 'kind' property
    if (node.kind) {
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

    // Handle expression nodes with 'type' property
    if (node.type === 'literal') {
        return inferLiteral(node.value);
    }

    if (node.type === 'variable') {
        return env.variables?.[node.name] ?? zeroOrMore(XS.item);
    }

    return exactlyOne(XS.item);
}

/**
 * Enhanced Type Inference for XPath 3.1 (Phase 9.5)
 *
 * Provides advanced static type inference capabilities including:
 * - Type narrowing for conditional expressions
 * - Function return type inference
 * - Complex expression type deduction
 */

/**
 * Infer type for conditional expression (if-then-else)
 */
export function inferConditional(
    conditionType: StaticType,
    thenType: StaticType,
    elseType: StaticType
): StaticType {
    // Result type is the union of then and else branches
    // Cardinality is the max of the two branches
    const cardinality = unionCardinality(thenType.cardinality, elseType.cardinality);

    // Type is the common supertype (simplified to item() if different)
    const typeName = thenType.name === elseType.name ? thenType.name : XS.item;

    return { name: typeName, cardinality };
}

/**
 * Combine cardinalities for union types
 */
function unionCardinality(a: SequenceCardinality, b: SequenceCardinality): SequenceCardinality {
    // If either can be empty, result can be empty
    if (a === 'zero-or-one' || b === 'zero-or-one') {
        if (a === 'one-or-more' || b === 'one-or-more' || a === 'zero-or-more' || b === 'zero-or-more') {
            return 'zero-or-more';
        }
        return 'zero-or-one';
    }

    // If either is multiple, result is multiple
    if (a === 'zero-or-more' || b === 'zero-or-more' || a === 'one-or-more' || b === 'one-or-more') {
        return 'zero-or-more';
    }

    return 'exactly-one';
}

/**
 * Infer type for function call
 */
export function inferFunctionCall(
    functionName: string,
    argTypes: StaticType[],
    env: TypeEnv
): StaticType {
    const functionSig = env.functions?.[functionName];

    if (functionSig) {
        return functionSig.result;
    }

    // Unknown function - return item()*
    return zeroOrMore(XS.item);
}

/**
 * Type narrowing for instance-of expressions
 *
 * When we check `$x instance of xs:string`, we can narrow the type of $x
 * in the true branch
 */
export function narrowType(
    originalType: StaticType,
    targetType: StaticType,
    matches: boolean
): StaticType {
    if (matches) {
        // In the true branch, the type is narrowed to the target
        return targetType;
    } else {
        // In the false branch, we can't really narrow without full type algebra
        return originalType;
    }
}

/**
 * Infer type for path expression
 */
export function inferPath(contextType: StaticType, stepTypes: StaticType[]): StaticType {
    // Each step potentially multiplies cardinality
    let cardinality: SequenceCardinality = contextType.cardinality;

    for (const stepType of stepTypes) {
        cardinality = concatCardinality(cardinality, stepType.cardinality);
    }

    // Result type is typically node (simplified)
    return { name: XS.item, cardinality };
}

/**
 * Infer type for map constructor
 */
export function inferMapConstructor(entries: Array<{ key: StaticType; value: StaticType }>): StaticType {
    // Map is always exactly one
    return exactlyOne('map(*)');
}

/**
 * Infer type for array constructor
 */
export function inferArrayConstructor(members: StaticType[]): StaticType {
    // Array is always exactly one
    return exactlyOne('array(*)');
}

/**
 * Type promotion rules
 *
 * Determines if a value of sourceType can be promoted to targetType
 */
export function canPromote(sourceType: StaticType, targetType: StaticType): boolean {
    // Exact match
    if (sourceType.name === targetType.name) {
        return canPromoteCardinality(sourceType.cardinality, targetType.cardinality);
    }

    // Numeric promotions: integer -> decimal -> double
    const numericHierarchy = [XS.integer, XS.decimal, XS.double];
    const sourceIndex = numericHierarchy.indexOf(sourceType.name);
    const targetIndex = numericHierarchy.indexOf(targetType.name);

    if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex <= targetIndex) {
        return canPromoteCardinality(sourceType.cardinality, targetType.cardinality);
    }

    // item() is the universal supertype
    if (targetType.name === XS.item) {
        return canPromoteCardinality(sourceType.cardinality, targetType.cardinality);
    }

    return false;
}

/**
 * Check if source cardinality can be promoted to target cardinality
 */
function canPromoteCardinality(source: SequenceCardinality, target: SequenceCardinality): boolean {
    if (source === target) return true;

    // exactly-one can be promoted to any
    if (source === 'exactly-one') return true;

    // zero-or-one can be promoted to zero-or-more or one-or-more if target allows empty
    if (source === 'zero-or-one') {
        return target === 'zero-or-more' || target === 'zero-or-one';
    }

    // one-or-more can be promoted to zero-or-more
    if (source === 'one-or-more' && target === 'zero-or-more') {
        return true;
    }

    return false;
}

/**
 * Get the most specific common supertype
 */
export function leastCommonSupertype(...types: StaticType[]): StaticType {
    if (types.length === 0) {
        return zeroOrMore(XS.item);
    }

    if (types.length === 1) {
        return types[0];
    }

    // Find common type name
    let commonName = types[0].name;
    for (let i = 1; i < types.length; i++) {
        if (types[i].name !== commonName) {
            commonName = XS.item; // Fallback to item()
            break;
        }
    }

    // Combine cardinalities
    let cardinality: SequenceCardinality = types[0].cardinality;
    for (let i = 1; i < types.length; i++) {
        cardinality = unionCardinality(cardinality, types[i].cardinality);
    }

    return { name: commonName, cardinality };
}

/**
 * Format a StaticType as a string for display
 */
export function formatStaticType(type: StaticType): string {
    const cardinalitySymbol: Record<SequenceCardinality, string> = {
        'exactly-one': '',
        'zero-or-one': '?',
        'one-or-more': '+',
        'zero-or-more': '*',
    };

    return `${type.name}${cardinalitySymbol[type.cardinality]}`;
}
