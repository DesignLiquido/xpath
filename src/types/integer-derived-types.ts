/**
 * Integer-derived types: long, int, short, byte, unsigned*, nonPositiveInteger, etc.
 */

import { AtomicType, AtomicTypeImpl, XS_NAMESPACE } from './base';

/**
 * Integer-derived type with range validation
 */
export class IntegerDerivedTypeImpl extends AtomicTypeImpl {
    constructor(
        name: string,
        baseType: AtomicType,
        primitive: AtomicType,
        private min?: number,
        private max?: number
    ) {
        super(name, XS_NAMESPACE, baseType, primitive);
    }

    validate(value: any): boolean {
        if (
            typeof value !== 'number' ||
            !Number.isInteger(value) ||
            !isFinite(value) ||
            !Number.isSafeInteger(value)
        ) {
            return false;
        }
        if (this.min !== undefined && value < this.min) return false;
        if (this.max !== undefined && value > this.max) return false;
        return true;
    }

    cast(value: any): number {
        const num = this.baseType!.cast(value);
        if (!Number.isSafeInteger(num)) {
            throw new Error(`Value ${num} is not a safe integer for ${this.name}`);
        }
        if (this.min !== undefined && num < this.min) {
            throw new Error(`Value ${num} is below minimum ${this.min} for ${this.name}`);
        }
        if (this.max !== undefined && num > this.max) {
            throw new Error(`Value ${num} is above maximum ${this.max} for ${this.name}`);
        }
        return num;
    }
}
