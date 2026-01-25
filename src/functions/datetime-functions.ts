/**
 * XPath 2.0 Date/Time Functions
 *
 * Reference: https://www.w3.org/TR/xpath-functions/#dates-times
 */

import { XPathContext, XPathResult } from '../context';

// ============================================================================
// Current Date/Time Functions
// ============================================================================

/**
 * fn:current-dateTime() as xs:dateTime
 * Returns the current date and time.
 */
export function currentDateTime(context: XPathContext): string {
    const dt = context.currentDateTime ?? new Date();
    const offset = normalizeTimezone(context.implicitTimezone);
    return formatDateTime(dt, offset);
}

/**
 * fn:current-date() as xs:date
 * Returns the current date.
 */
export function currentDate(context: XPathContext): string {
    const dt = context.currentDateTime ?? new Date();
    const offset = normalizeTimezone(context.implicitTimezone);
    return formatDate(dt, offset);
}

/**
 * fn:current-time() as xs:time
 * Returns the current time.
 */
export function currentTime(context: XPathContext): string {
    const dt = context.currentDateTime ?? new Date();
    const offset = normalizeTimezone(context.implicitTimezone);
    return formatTime(dt, offset);
}

/**
 * fn:implicit-timezone() as xs:dayTimeDuration
 * Returns the value of the implicit timezone property from the dynamic context.
 */
export function implicitTimezone(context: XPathContext): string {
    const offset = normalizeTimezone(context.implicitTimezone, -(new Date().getTimezoneOffset()));
    return formatTimezoneAsDuration(offset);
}

// ============================================================================
// Component Extraction from dateTime
// ============================================================================

/**
 * fn:year-from-dateTime($arg as xs:dateTime?) as xs:integer?
 * Returns the year component from a dateTime value.
 */
export function yearFromDateTime(arg: XPathResult): number | null {
    const dt = parseDateTime(arg);
    return dt ? dt.getFullYear() : null;
}

/**
 * fn:month-from-dateTime($arg as xs:dateTime?) as xs:integer?
 * Returns the month component from a dateTime value.
 */
export function monthFromDateTime(arg: XPathResult): number | null {
    const dt = parseDateTime(arg);
    return dt ? dt.getMonth() + 1 : null;
}

/**
 * fn:day-from-dateTime($arg as xs:dateTime?) as xs:integer?
 * Returns the day component from a dateTime value.
 */
export function dayFromDateTime(arg: XPathResult): number | null {
    const dt = parseDateTime(arg);
    return dt ? dt.getDate() : null;
}

/**
 * fn:hours-from-dateTime($arg as xs:dateTime?) as xs:integer?
 * Returns the hours component from a dateTime value.
 */
export function hoursFromDateTime(arg: XPathResult): number | null {
    const dt = parseDateTime(arg);
    return dt ? dt.getHours() : null;
}

/**
 * fn:minutes-from-dateTime($arg as xs:dateTime?) as xs:integer?
 * Returns the minutes component from a dateTime value.
 */
export function minutesFromDateTime(arg: XPathResult): number | null {
    const dt = parseDateTime(arg);
    return dt ? dt.getMinutes() : null;
}

/**
 * fn:seconds-from-dateTime($arg as xs:dateTime?) as xs:decimal?
 * Returns the seconds component from a dateTime value.
 */
export function secondsFromDateTime(arg: XPathResult): number | null {
    const dt = parseDateTime(arg);
    return dt ? dt.getSeconds() + dt.getMilliseconds() / 1000 : null;
}

/**
 * fn:timezone-from-dateTime($arg as xs:dateTime?) as xs:dayTimeDuration?
 * Returns the timezone component from a dateTime value.
 */
export function timezoneFromDateTime(arg: XPathResult): string | null {
    const str = toString(arg);
    if (!str) return null;

    const tzMatch = str.match(/([+-]\d{2}:\d{2}|Z)$/);
    if (!tzMatch) return null;

    const tz = tzMatch[1];
    if (tz === 'Z') return 'PT0S';

    const [hours, mins] = tz.split(':').map(Number);
    const totalMinutes = Math.abs(hours) * 60 + Math.abs(mins);
    const sign = tz.startsWith('-') ? '-' : '';

    return formatTimezoneAsDuration(sign === '-' ? -totalMinutes : totalMinutes);
}

// ============================================================================
// Component Extraction from date
// ============================================================================

/**
 * fn:year-from-date($arg as xs:date?) as xs:integer?
 * Returns the year component from a date value.
 */
export function yearFromDate(arg: XPathResult): number | null {
    return yearFromDateTime(arg);
}

/**
 * fn:month-from-date($arg as xs:date?) as xs:integer?
 * Returns the month component from a date value.
 */
export function monthFromDate(arg: XPathResult): number | null {
    return monthFromDateTime(arg);
}

/**
 * fn:day-from-date($arg as xs:date?) as xs:integer?
 * Returns the day component from a date value.
 */
export function dayFromDate(arg: XPathResult): number | null {
    return dayFromDateTime(arg);
}

/**
 * fn:timezone-from-date($arg as xs:date?) as xs:dayTimeDuration?
 * Returns the timezone component from a date value.
 */
export function timezoneFromDate(arg: XPathResult): string | null {
    return timezoneFromDateTime(arg);
}

// ============================================================================
// Component Extraction from time
// ============================================================================

/**
 * fn:hours-from-time($arg as xs:time?) as xs:integer?
 * Returns the hours component from a time value.
 */
export function hoursFromTime(arg: XPathResult): number | null {
    const str = toString(arg);
    if (!str) return null;

    // Parse time format: HH:MM:SS.sss(timezone)?
    const timeMatch = str.match(/^(\d{2}):/);
    return timeMatch ? parseInt(timeMatch[1], 10) : null;
}

/**
 * fn:minutes-from-time($arg as xs:time?) as xs:integer?
 * Returns the minutes component from a time value.
 */
export function minutesFromTime(arg: XPathResult): number | null {
    const str = toString(arg);
    if (!str) return null;

    const timeMatch = str.match(/^\d{2}:(\d{2}):/);
    return timeMatch ? parseInt(timeMatch[1], 10) : null;
}

/**
 * fn:seconds-from-time($arg as xs:time?) as xs:decimal?
 * Returns the seconds component from a time value.
 */
export function secondsFromTime(arg: XPathResult): number | null {
    const str = toString(arg);
    if (!str) return null;

    const timeMatch = str.match(/^\d{2}:\d{2}:(\d{2}(?:\.\d+)?)/);
    return timeMatch ? parseFloat(timeMatch[1]) : null;
}

/**
 * fn:timezone-from-time($arg as xs:time?) as xs:dayTimeDuration?
 * Returns the timezone component from a time value.
 */
export function timezoneFromTime(arg: XPathResult): string | null {
    return timezoneFromDateTime(arg);
}

// ============================================================================
// Component Extraction from duration
// ============================================================================

/**
 * fn:years-from-duration($arg as xs:duration?) as xs:integer?
 * Returns the years component from a duration value.
 */
export function yearsFromDuration(arg: XPathResult): number | null {
    const duration = parseDuration(arg);
    return duration ? duration.years : null;
}

/**
 * fn:months-from-duration($arg as xs:duration?) as xs:integer?
 * Returns the months component from a duration value.
 */
export function monthsFromDuration(arg: XPathResult): number | null {
    const duration = parseDuration(arg);
    return duration ? duration.months : null;
}

/**
 * fn:days-from-duration($arg as xs:duration?) as xs:integer?
 * Returns the days component from a duration value.
 */
export function daysFromDuration(arg: XPathResult): number | null {
    const duration = parseDuration(arg);
    return duration ? duration.days : null;
}

/**
 * fn:hours-from-duration($arg as xs:duration?) as xs:integer?
 * Returns the hours component from a duration value.
 */
export function hoursFromDuration(arg: XPathResult): number | null {
    const duration = parseDuration(arg);
    return duration ? duration.hours : null;
}

/**
 * fn:minutes-from-duration($arg as xs:duration?) as xs:integer?
 * Returns the minutes component from a duration value.
 */
export function minutesFromDuration(arg: XPathResult): number | null {
    const duration = parseDuration(arg);
    return duration ? duration.minutes : null;
}

/**
 * fn:seconds-from-duration($arg as xs:duration?) as xs:decimal?
 * Returns the seconds component from a duration value.
 */
export function secondsFromDuration(arg: XPathResult): number | null {
    const duration = parseDuration(arg);
    return duration ? duration.seconds : null;
}

// ============================================================================
// Timezone Adjustment Functions
// ============================================================================

/**
 * fn:adjust-dateTime-to-timezone($arg as xs:dateTime?) as xs:dateTime?
 * fn:adjust-dateTime-to-timezone($arg as xs:dateTime?, $timezone as xs:dayTimeDuration?) as xs:dateTime?
 * Adjusts a dateTime value to a specific timezone.
 */
export function adjustDateTimeToTimezone(
    arg: XPathResult,
    timezone?: XPathResult,
    context?: XPathContext
): string | null {
    const str = toString(arg);
    if (!str) return null;

    const dt = parseDateTime(arg);
    if (!dt) return null;

    let targetOffset: number;
    if (timezone === undefined) {
        // Use implicit timezone from context
        const normalized = normalizeTimezone(context?.implicitTimezone, -(new Date().getTimezoneOffset()));
        targetOffset = normalized ?? 0;
    } else if (timezone === null || (Array.isArray(timezone) && timezone.length === 0)) {
        // Remove timezone - return without timezone component
        return formatDateTime(dt, undefined, false);
    } else {
        targetOffset = parseDurationToMinutes(toString(timezone));
    }

    // Adjust the date/time
    const currentOffset = dt.getTimezoneOffset();
    const adjustedDt = new Date(dt.getTime() + (targetOffset + currentOffset) * 60000);

    return formatDateTime(adjustedDt, targetOffset);
}

/**
 * fn:adjust-date-to-timezone($arg as xs:date?) as xs:date?
 * fn:adjust-date-to-timezone($arg as xs:date?, $timezone as xs:dayTimeDuration?) as xs:date?
 * Adjusts a date value to a specific timezone.
 */
export function adjustDateToTimezone(
    arg: XPathResult,
    timezone?: XPathResult,
    context?: XPathContext
): string | null {
    const result = adjustDateTimeToTimezone(arg, timezone, context);
    if (!result) return null;
    // Extract just the date part
    return result.substring(0, 10) + (result.includes('+') || result.includes('Z') ? result.slice(-6) : '');
}

/**
 * fn:adjust-time-to-timezone($arg as xs:time?) as xs:time?
 * fn:adjust-time-to-timezone($arg as xs:time?, $timezone as xs:dayTimeDuration?) as xs:time?
 * Adjusts a time value to a specific timezone.
 */
export function adjustTimeToTimezone(
    arg: XPathResult,
    timezone?: XPathResult,
    context?: XPathContext
): string | null {
    const str = toString(arg);
    if (!str) return null;

    // Prepend a dummy date for parsing
    const fullDateTime = `2000-01-01T${str}`;
    const result = adjustDateTimeToTimezone(fullDateTime, timezone, context);
    if (!result) return null;

    // Extract just the time part
    const timeStart = result.indexOf('T') + 1;
    return result.substring(timeStart);
}

// ============================================================================
// Helper Functions
// ============================================================================

function toString(value: XPathResult): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
        if (value.length === 0) return '';
        value = value[0];
    }
    if (typeof value === 'object' && value !== null && 'textContent' in value) {
        return (value as { textContent?: string }).textContent ?? '';
    }
    return String(value);
}

function parseDateTime(value: XPathResult): Date | null {
    const str = toString(value);
    if (!str) return null;

    // Try parsing as ISO 8601
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) return dt;

    // Try XPath dateTime format: YYYY-MM-DDTHH:MM:SS.sss(+|-)HH:MM
    const match = str.match(/^(-?\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|([+-]\d{2}:\d{2}))?$/);
    if (match) {
        const [, year, month, day, hours, minutes, seconds, ms, tz] = match;
        const date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds),
            ms ? parseInt(ms.padEnd(3, '0').substring(0, 3)) : 0
        );
        return date;
    }

    // Try date format: YYYY-MM-DD
    const dateMatch = str.match(/^(-?\d{4})-(\d{2})-(\d{2})(?:Z|([+-]\d{2}:\d{2}))?$/);
    if (dateMatch) {
        const [, year, month, day] = dateMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    return null;
}

interface DurationComponents {
    negative: boolean;
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function parseDuration(value: XPathResult): DurationComponents | null {
    const str = toString(value);
    if (!str) return null;

    // Duration format: -?P(nY)?(nM)?(nD)?(T(nH)?(nM)?(nS)?)?
    const match = str.match(/^(-)?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
    if (!match) return null;

    return {
        negative: match[1] === '-',
        years: parseInt(match[2]) || 0,
        months: parseInt(match[3]) || 0,
        days: parseInt(match[4]) || 0,
        hours: parseInt(match[5]) || 0,
        minutes: parseInt(match[6]) || 0,
        seconds: parseFloat(match[7]) || 0,
    };
}

function parseDurationToMinutes(duration: string): number {
    const match = duration.match(/^(-)?PT?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);
    if (!match) return 0;

    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2]) || 0;
    const minutes = parseInt(match[3]) || 0;
    const seconds = parseFloat(match[4]) || 0;

    return sign * (hours * 60 + minutes + seconds / 60);
}

function formatDateTime(dt: Date, timezoneOffset?: number, includeTimezone: boolean = true): string {
    const year = dt.getUTCFullYear();
    const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');
    const hours = String(dt.getUTCHours()).padStart(2, '0');
    const minutes = String(dt.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dt.getUTCSeconds()).padStart(2, '0');
    const ms = dt.getUTCMilliseconds();

    let result = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    if (ms > 0) {
        result += `.${String(ms).padStart(3, '0')}`;
    }

    if (includeTimezone && timezoneOffset !== undefined) {
        result += formatTimezoneOffset(timezoneOffset);
    }

    return result;
}

function formatDate(dt: Date, timezoneOffset?: number): string {
    const year = dt.getUTCFullYear();
    const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');

    let result = `${year}-${month}-${day}`;
    if (timezoneOffset !== undefined) {
        result += formatTimezoneOffset(timezoneOffset);
    }

    return result;
}

function formatTime(dt: Date, timezoneOffset?: number): string {
    const hours = String(dt.getUTCHours()).padStart(2, '0');
    const minutes = String(dt.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dt.getUTCSeconds()).padStart(2, '0');
    const ms = dt.getMilliseconds();

    let result = `${hours}:${minutes}:${seconds}`;
    if (ms > 0) {
        result += `.${String(ms).padStart(3, '0')}`;
    }

    if (timezoneOffset !== undefined) {
        result += formatTimezoneOffset(timezoneOffset);
    }

    return result;
}

function formatTimezoneOffset(offsetMinutes: number): string {
    if (offsetMinutes === 0) return 'Z';

    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const mins = String(absOffset % 60).padStart(2, '0');

    return `${sign}${hours}:${mins}`;
}

function formatTimezoneAsDuration(offsetMinutes: number): string {
    if (offsetMinutes === 0) return 'PT0S';

    const sign = offsetMinutes < 0 ? '-' : '';
    const absOffset = Math.abs(offsetMinutes);
    const hours = Math.floor(absOffset / 60);
    const mins = absOffset % 60;

    let result = `${sign}PT`;
    if (hours > 0) result += `${hours}H`;
    if (mins > 0) result += `${mins}M`;
    if (hours === 0 && mins === 0) result += '0S';

    return result;
}

// Normalize implicit timezone value to minutes. Accepts number or ISO offset string.
function normalizeTimezone(value?: string | number, fallback?: number): number | undefined {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'number' && !isNaN(value)) return value;

    const str = String(value).trim();
    if (str === '' || str.toUpperCase() === 'Z') return 0;

    const match = str.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!match) return fallback;

    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
}
