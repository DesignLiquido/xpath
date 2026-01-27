/**
 * Gregorian date types: gYearMonth, gYear, gMonthDay, gDay, gMonth
 */

import { AtomicType, AtomicTypeImpl, XS_NAMESPACE } from './base';

/**
 * xs:gYearMonth - gregorian year and month
 */
export class GYearMonthTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('gYearMonth', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        return typeof value === 'object' && value !== null && 'year' in value && 'month' in value;
    }

    cast(value: any): any {
        if (this.validate(value)) return value;
        if (typeof value === 'string') {
            // Format: YYYY-MM
            const match = value.match(/^(-?\d{4})-(\d{2})$/);
            if (!match) {
                throw new Error(`Invalid gYearMonth format: "${value}"`);
            }
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            if (month < 1 || month > 12) {
                throw new Error(`Invalid month value: ${month}`);
            }
            return { year, month };
        }
        throw new Error(`Cannot cast ${typeof value} to xs:gYearMonth`);
    }
}

/**
 * xs:gYear - gregorian year
 */
export class GYearTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('gYear', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        return typeof value === 'object' && value !== null && 'year' in value;
    }

    cast(value: any): any {
        if (this.validate(value)) return value;
        if (typeof value === 'string') {
            // Format: YYYY
            const match = value.match(/^(-?\d{4})$/);
            if (!match) {
                throw new Error(`Invalid gYear format: "${value}"`);
            }
            return { year: parseInt(match[1], 10) };
        }
        throw new Error(`Cannot cast ${typeof value} to xs:gYear`);
    }
}

/**
 * xs:gMonthDay - gregorian month and day
 */
export class GMonthDayTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('gMonthDay', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        return typeof value === 'object' && value !== null && 'month' in value && 'day' in value;
    }

    cast(value: any): any {
        if (this.validate(value)) return value;
        if (typeof value === 'string') {
            // Format: --MM-DD
            const match = value.match(/^--(\d{2})-(\d{2})$/);
            if (!match) {
                throw new Error(`Invalid gMonthDay format: "${value}"`);
            }
            const month = parseInt(match[1], 10);
            const day = parseInt(match[2], 10);
            if (month < 1 || month > 12) {
                throw new Error(`Invalid month value: ${month}`);
            }
            if (day < 1 || day > 31) {
                throw new Error(`Invalid day value: ${day}`);
            }
            return { month, day };
        }
        throw new Error(`Cannot cast ${typeof value} to xs:gMonthDay`);
    }
}

/**
 * xs:gDay - gregorian day
 */
export class GDayTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('gDay', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        return typeof value === 'object' && value !== null && 'day' in value;
    }

    cast(value: any): any {
        if (this.validate(value)) return value;
        if (typeof value === 'string') {
            // Format: ---DD
            const match = value.match(/^---(\d{2})$/);
            if (!match) {
                throw new Error(`Invalid gDay format: "${value}"`);
            }
            const day = parseInt(match[1], 10);
            if (day < 1 || day > 31) {
                throw new Error(`Invalid day value: ${day}`);
            }
            return { day };
        }
        throw new Error(`Cannot cast ${typeof value} to xs:gDay`);
    }
}

/**
 * xs:gMonth - gregorian month
 */
export class GMonthTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('gMonth', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        return typeof value === 'object' && value !== null && 'month' in value;
    }

    cast(value: any): any {
        if (this.validate(value)) return value;
        if (typeof value === 'string') {
            // Format: --MM
            const match = value.match(/^--(\d{2})$/);
            if (!match) {
                throw new Error(`Invalid gMonth format: "${value}"`);
            }
            const month = parseInt(match[1], 10);
            if (month < 1 || month > 12) {
                throw new Error(`Invalid month value: ${month}`);
            }
            return { month };
        }
        throw new Error(`Cannot cast ${typeof value} to xs:gMonth`);
    }
}
