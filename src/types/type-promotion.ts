/**
 * XPath 2.0 Type Promotion (Appendix B.1)
 * https://www.w3.org/TR/xpath20/#promotion
 *
 * Type promotion rules:
 * 1. Numeric type promotion: integer → decimal → float → double
 * 2. URI to string promotion: anyURI → string
 * 3. Untyped atomic to string: untypedAtomic → string
 * 4. Untyped atomic to numeric: untypedAtomic → double (in numeric contexts)
 *
 * These rules allow implicit type conversions in certain contexts.
 */

import { AtomicType, XS_NAMESPACE } from './base';
import { getAtomicType } from './index';

/**
 * XPath 2.0 Type Promotion Hierarchy
 * Lower types promote to higher types in numeric operations
 */
export enum NumericTypeHierarchy {
  INTEGER = 0,
  DECIMAL = 1,
  FLOAT = 2,
  DOUBLE = 3
}

/**
 * Get the numeric type hierarchy level for a type
 * Returns -1 if the type is not in the numeric hierarchy
 */
export function getNumericHierarchyLevel(type: AtomicType): NumericTypeHierarchy | -1 {
  const name = type.name;

  // All integer-derived types are at INTEGER level
  if (
    name === 'integer' ||
    name === 'long' ||
    name === 'int' ||
    name === 'short' ||
    name === 'byte' ||
    name === 'nonPositiveInteger' ||
    name === 'negativeInteger' ||
    name === 'nonNegativeInteger' ||
    name === 'positiveInteger' ||
    name === 'unsignedLong' ||
    name === 'unsignedInt' ||
    name === 'unsignedShort' ||
    name === 'unsignedByte'
  ) {
    return NumericTypeHierarchy.INTEGER;
  }

  if (name === 'decimal') {
    return NumericTypeHierarchy.DECIMAL;
  }

  if (name === 'float') {
    return NumericTypeHierarchy.FLOAT;
  }

  if (name === 'double') {
    return NumericTypeHierarchy.DOUBLE;
  }

  return -1;
}

/**
 * Check if one numeric type can be promoted to another
 * Promotion only goes upward: integer → decimal → float → double
 *
 * @param fromType - The source type
 * @param toType - The target type
 * @returns true if fromType can be promoted to toType
 */
export function canPromoteNumeric(fromType: AtomicType, toType: AtomicType): boolean {
  const fromLevel = getNumericHierarchyLevel(fromType);
  const toLevel = getNumericHierarchyLevel(toType);

  if (fromLevel === -1 || toLevel === -1) {
    return false;
  }

  // Can always promote to the same level or higher
  return fromLevel <= toLevel;
}

/**
 * Promote a numeric value from one type to another
 * Follows XPath 2.0 type promotion rules
 *
 * @param value - The value to promote (should already be validated as fromType)
 * @param fromType - The source type name
 * @param toType - The target type name
 * @returns The promoted value (or the original value if types match)
 * @throws Error if promotion is not allowed
 */
export function promoteNumericValue(
  value: any,
  fromType: string,
  toType: string
): any {
  // If same type, no promotion needed
  if (fromType === toType) {
    return value;
  }

  // Get the actual type objects
  const sourceType = getAtomicType(fromType);
  const targetType = getAtomicType(toType);

  if (!sourceType || !targetType) {
    throw new Error(
      `Cannot promote unknown types: ${fromType} to ${toType}`
    );
  }

  // Check if promotion is allowed
  if (!canPromoteNumeric(sourceType, targetType)) {
    throw new Error(
      `Cannot promote numeric type ${fromType} to ${toType}`
    );
  }

  // Numeric values are already in JavaScript number format
  // The value itself doesn't change, just the semantic type interpretation
  return value;
}

/**
 * Get the common type for two numeric types
 * Returns the higher type in the hierarchy
 *
 * @param type1 - First type
 * @param type2 - Second type
 * @returns The common type, or undefined if not both numeric
 */
export function getCommonNumericType(
  type1: AtomicType,
  type2: AtomicType
): AtomicType | undefined {
  const level1 = getNumericHierarchyLevel(type1);
  const level2 = getNumericHierarchyLevel(type2);

  if (level1 === -1 || level2 === -1) {
    return undefined;
  }

  if (level1 > level2) {
    return type1;
  } else if (level2 > level1) {
    return type2;
  } else {
    // Same level
    return type1;
  }
}

/**
 * Check if a type can be promoted to string
 * According to XPath 2.0, anyURI can be promoted to string
 */
export function canPromoteToString(type: AtomicType): boolean {
  return type.name === 'anyURI' || type.name === 'untypedAtomic';
}

/**
 * Promote a value to string
 * Used for anyURI → string and untypedAtomic → string promotions
 *
 * @param value - The value to promote
 * @param fromType - The source type name
 * @returns The string value
 * @throws Error if promotion is not allowed
 */
export function promoteToString(value: any, fromType: string): string {
  if (!['anyURI', 'untypedAtomic', 'string'].includes(fromType)) {
    throw new Error(`Cannot promote type ${fromType} to string`);
  }

  if (typeof value === 'string') {
    return value;
  }

  return String(value);
}

/**
 * Promote untypedAtomic to a numeric type
 * In numeric contexts, untypedAtomic is promoted to double
 *
 * @param value - The untyped value (as string)
 * @param targetType - The target numeric type ('decimal', 'float', 'double', or 'integer')
 * @returns The promoted numeric value
 * @throws Error if the value cannot be converted to the target type
 */
export function promoteUntypedToNumeric(value: string, targetType: string): number {
  if (!['integer', 'decimal', 'float', 'double'].includes(targetType)) {
    throw new Error(`Cannot promote untypedAtomic to non-numeric type ${targetType}`);
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    throw new Error(`Cannot convert "${value}" to numeric type ${targetType}`);
  }

  return num;
}

/**
 * Promotion context enum
 * Different contexts apply different promotion rules
 */
export enum PromotionContext {
  /**
   * Arithmetic context: untypedAtomic → double, numeric types promoted
   */
  ARITHMETIC = 'arithmetic',

  /**
   * Comparison context: untypedAtomic → string or double depending on comparison
   */
  COMPARISON = 'comparison',

  /**
   * String context: everything converts to string
   */
  STRING = 'string',

  /**
   * Boolean context: Effective Boolean Value
   */
  BOOLEAN = 'boolean'
}

/**
 * Apply type promotion in a specific context
 * Used by operators to normalize operand types
 *
 * @param value - The value to promote
 * @param fromType - Current type name
 * @param context - The promotion context
 * @param targetType - Optional explicit target type
 * @returns { value, type } - The promoted value and resulting type
 */
export function promoteInContext(
  value: any,
  fromType: string,
  context: PromotionContext,
  targetType?: string
): { value: any; type: string } {
  if (fromType === 'untypedAtomic') {
    switch (context) {
      case PromotionContext.ARITHMETIC:
        // Promote to double
        return {
          value: promoteUntypedToNumeric(value, 'double'),
          type: 'double'
        };

      case PromotionContext.STRING:
        return {
          value: promoteToString(value, fromType),
          type: 'string'
        };

      case PromotionContext.COMPARISON:
        if (targetType) {
          const targetAtomicType = getAtomicType(targetType);
          if (targetAtomicType && getNumericHierarchyLevel(targetAtomicType) !== -1) {
            return {
              value: promoteUntypedToNumeric(value, targetType),
              type: targetType
            };
          }
        }
        return {
          value: promoteToString(value, fromType),
          type: 'string'
        };

      case PromotionContext.BOOLEAN:
        // In boolean context, untyped atomic is treated as string
        return {
          value: promoteToString(value, fromType),
          type: 'string'
        };

      default:
        return { value, type: fromType };
    }
  }

  if (fromType === 'anyURI' && context === PromotionContext.STRING) {
    return {
      value: promoteToString(value, fromType),
      type: 'string'
    };
  }

  return { value, type: fromType };
}

/**
 * Get a human-readable description of type promotion rules
 */
export function describePromotion(fromType: string, toType: string): string {
  if (fromType === toType) {
    return `No promotion needed (same type)`;
  }

  if (fromType === 'untypedAtomic') {
    if (toType === 'double') {
      return 'Promote untypedAtomic to double (numeric context)';
    }
    if (toType === 'string') {
      return 'Promote untypedAtomic to string (string context)';
    }
  }

  if (fromType === 'anyURI' && toType === 'string') {
    return 'Promote anyURI to string';
  }

  const fromAtomicType = getAtomicType(fromType);
  const toAtomicType = getAtomicType(toType);

  if (
    fromAtomicType &&
    toAtomicType &&
    canPromoteNumeric(fromAtomicType, toAtomicType)
  ) {
    return `Promote numeric type ${fromType} to ${toType}`;
  }

  return `Cannot promote ${fromType} to ${toType}`;
}
