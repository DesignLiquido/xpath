/**
 * Date and time types: duration, dateTime, date, time
 */

import { AtomicType, AtomicTypeImpl, XS_NAMESPACE } from './base';

/**
 * Parse ISO 8601 duration format
 * Format: [-]P[nY][nM][nD][T[nH][nM][nS]]
 */
export function parseDuration(value: string): {
    negative: boolean;
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
} {
    const match = value.match(
        /^(-)?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
    );

    if (!match) {
        throw new Error(`Invalid duration format: "${value}"`);
    }

    // Check that at least one component is present
    const hasComponents = match.slice(2).some((component) => component !== undefined);
    if (!hasComponents) {
        throw new Error(`Invalid duration format: "${value}"`);
    }

    const isNegative = !!match[1];
    const sign = isNegative ? -1 : 1;

    return {
        negative: isNegative,
        years: sign * (parseInt(match[2]) || 0),
        months: sign * (parseInt(match[3]) || 0),
        days: sign * (parseInt(match[4]) || 0),
        hours: sign * (parseInt(match[5]) || 0),
        minutes: sign * (parseInt(match[6]) || 0),
        seconds: sign * (parseFloat(match[7]) || 0),
    };
}

/**
 * Parse ISO 8601 time format
 * Format: HH:MM:SS[.SSS][Z|±HH:MM]
 */
export function parseTime(value: string): {
    hours: number;
    minutes: number;
    seconds: number;
    timezone?: { sign: string; hours: number; minutes: number };
} {
    const match = value.match(/^(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)(?:Z|([+-])(\d{2}):(\d{2}))?$/);

    if (!match) {
        throw new Error(`Invalid time format: "${value}"`);
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3]);

    // Validate ranges
    if (hours < 0 || hours > 23) {
        throw new Error(`Invalid hours value: ${hours}`);
    }
    if (minutes < 0 || minutes > 59) {
        throw new Error(`Invalid minutes value: ${minutes}`);
    }
    if (seconds < 0 || seconds >= 60) {
        throw new Error(`Invalid seconds value: ${seconds}`);
    }

    let timezone: { sign: string; hours: number; minutes: number } | undefined;
    if (match[4]) {
        timezone = {
            sign: match[4],
            hours: parseInt(match[5], 10),
            minutes: parseInt(match[6], 10),
        };
    }

    return { hours, minutes, seconds, timezone };
}

/**
 * xs:duration - duration values
 */
export class DurationTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('duration', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        if (typeof value === 'object' && value !== null && 'years' in value) {
            return true;
        }
        return false;
    }

    cast(value: any): any {
        if (this.validate(value)) return value;
        if (typeof value === 'string') {
            return parseDuration(value);
        }
        throw new Error(`Cannot cast ${typeof value} to xs:duration`);
    }
}

/**
 * xs:dateTime - date and time combined
 */
export class DateTimeTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType) {
        super('dateTime', XS_NAMESPACE, baseType, undefined);
    }

    validate(value: any): boolean {
        return value instanceof Date;
    }

    cast(value: any): Date {
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error(`Invalid dateTime value: "${value}"`);
            }
            return date;
        }
        throw new Error(`Cannot cast ${typeof value} to xs:dateTime`);
    }
}

/**
 * xs:date - date values (year-month-day)
 */
export class DateTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType, primitive: AtomicType) {
        super('date', XS_NAMESPACE, baseType, primitive);
    }

    validate(value: any): boolean {
        return value instanceof Date;
    }

    cast(value: any): Date {
        const dateTime = this.baseType!.cast(value);
        const date = new Date(dateTime);
        date.setHours(0, 0, 0, 0);
        return date;
    }
}

/**
 * xs:time - time values (hours-minutes-seconds)
 */
export class TimeTypeImpl extends AtomicTypeImpl {
    constructor(baseType: AtomicType, primitive: AtomicType) {
        super('time', XS_NAMESPACE, baseType, primitive);
    }

    validate(value: any): boolean {
        if (typeof value === 'object' && value !== null && 'hours' in value) {
            return true;
        }
        return false;
    }

    cast(value: any): any {
        if (this.validate(value)) return value;
        if (typeof value === 'string') {
            return parseTime(value);
        }
        throw new Error(`Cannot cast ${typeof value} to xs:time`);
    }
}
