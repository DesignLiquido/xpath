export * from './constants';
export * from './context';
export {
    // Export new dynamic context types
    type XPathDocuments,
    type XPathCollections,
    type XPathFunctionRegistry,
} from './context';
export * from './compatibility';
export * from './errors';
export * from './errors/codes';
export * from './warnings';
export * from './lexer';
export * from './node';
export * from './parser/base-parser';
export { XPath10Parser } from './parser/parser-10';
export { XPath20Parser } from './parser/parser-20';
export { XPath30Parser } from './parser/parser-30';
export { XPath31Parser } from './parser/parser-31';
export { createXPathParser, XPathParser } from './parser';
export * from './static-context';
export * from './xslt-extensions';
export * from './xpath-version';
export * from './static-typing';
export * from './schema';
// Re-export types but exclude XPathNode (from ./node) and toSequence (from ./xpath-version)
export {
    AtomicType,
    XS_NAMESPACE,
    xsType,
    AtomicTypeImpl,
    SequenceType,
    OccurrenceIndicator,
    ItemType,
    KindTest,
    ITEM_TYPE,
    createEmptySequenceType,
    createItemSequenceType,
    createAtomicSequenceType,
    NodeKindTest,
    ElementTest,
    AttributeTest,
    DocumentNodeTest,
    TextTest,
    CommentTest,
    ProcessingInstructionTest,
    SchemaElementTest,
    SchemaAttributeTest,
    KIND_TESTS,
    createElement,
    createAttribute,
    createDocumentNode,
    createProcessingInstruction,
    createSchemaElement,
    createSchemaAttribute,
    matchesSequenceType,
    matchesItemType,
    matches,
    findMismatch,
    countMatches,
    atomicTypeSatisfies,
    describeSequenceType,
    isSingleItem,
    isValidSequence,
    itemTypesEquivalent,
    sequenceTypesEquivalent,
    MatchResult,
    NumericTypeHierarchy,
    getNumericHierarchyLevel,
    canPromoteNumeric,
    promoteNumericValue,
    getCommonNumericType,
    canPromoteToString,
    promoteToString,
    promoteUntypedToNumeric,
    PromotionContext,
    promoteInContext,
    describePromotion,
    atomize,
    atomizeToSingleValue,
    extractStringValues,
    atomizationToSequence,
    isAtomizationSuccess,
    getAtomizationErrorDescription,
    isNode,
    hasElementOnlyContent,
    getNodeTypedValue,
    getNodeStringValue,
    createTestNode,
    createElementWithText,
    createElementWithChildren,
    AtomizationResult,
    AnyAtomicTypeImpl,
    UntypedAtomicImpl,
    StringTypeImpl,
    BooleanTypeImpl,
    DecimalTypeImpl,
    FloatTypeImpl,
    DoubleTypeImpl,
    IntegerTypeImpl,
    DurationTypeImpl,
    DateTimeTypeImpl,
    DateTypeImpl,
    TimeTypeImpl,
    parseDuration,
    parseTime,
    GYearMonthTypeImpl,
    GYearTypeImpl,
    GMonthDayTypeImpl,
    GDayTypeImpl,
    GMonthTypeImpl,
    HexBinaryTypeImpl,
    Base64BinaryTypeImpl,
    // XPath 3.0 Function Type System
    FunctionType,
    FunctionItem,
    createFunctionItem,
    isFunctionItem,
    createFunctionType,
    describeFunctionType,
    FN_NAMESPACE,
    MATH_NAMESPACE,
    MAP_NAMESPACE,
    ARRAY_NAMESPACE,
} from './types';
