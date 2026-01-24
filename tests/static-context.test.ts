import {
    DEFAULT_COLLATION,
    DEFAULT_FUNCTION_NAMESPACE,
    RESERVED_FUNCTION_NAMES,
    createStaticContext,
    isReservedFunctionName,
    registerFunctionSignature,
    registerVariableType,
    validateStaticContext,
} from '../src/static-context';
import { XS_NAMESPACE, createAtomicSequenceType, getAtomicType } from '../src/types';

describe('XPath Static Context', () => {
    it('applies defaults for namespaces and collations', () => {
        const ctx = createStaticContext();

        expect(ctx.defaultFunctionNamespace).toBe(DEFAULT_FUNCTION_NAMESPACE);
        expect(ctx.defaultTypeNamespace).toBe(XS_NAMESPACE);
        expect(ctx.collations).toContain(DEFAULT_COLLATION);
        expect(ctx.defaultCollation).toBe(DEFAULT_COLLATION);
        expect(ctx.schemaTypes).toEqual({});
        expect(ctx.elementDeclarations).toEqual({});
        expect(ctx.attributeDeclarations).toEqual({});
    });

    it('registers function signatures and blocks reserved names', () => {
        const ctx = createStaticContext();

        registerFunctionSignature(ctx, { name: 'custom-fn', minArgs: 1, maxArgs: 2 });
        expect(ctx.functionSignatures['custom-fn'].namespace).toBe(DEFAULT_FUNCTION_NAMESPACE);

        expect(isReservedFunctionName(RESERVED_FUNCTION_NAMES[0], ctx)).toBe(true);
        expect(() => registerFunctionSignature(ctx, { name: RESERVED_FUNCTION_NAMES[0], minArgs: 0 })).toThrow('reserved');
    });

    it('validates collations and function signatures', () => {
        const ctx = createStaticContext({
            collations: ['http://example.com/collation'],
            defaultCollation: 'http://example.com/other',
            functionSignatures: {
                bad: { name: 'bad', minArgs: 2, maxArgs: 1 },
            },
        });

        expect(ctx.collations).toContain(ctx.defaultCollation);
        const errors = validateStaticContext(ctx);
        expect(errors.some(e => e.includes('maxArgs'))).toBe(true);
    });

    it('tracks variable and context item types', () => {
        const ctx = createStaticContext();
        const intType = getAtomicType('integer');
        const seqType = createAtomicSequenceType(intType!);

        registerVariableType(ctx, 'price', seqType);
        ctx.contextItemType = seqType;

        expect(ctx.variableTypes.price).toBe(seqType);
        expect(ctx.contextItemType).toBe(seqType);
    });
});
