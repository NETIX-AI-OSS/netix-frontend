import { ClassValue } from 'clsx';

declare function cn(...inputs: ClassValue[]): string;

type IdKind = 'number' | 'string';
declare function commaSeparatedToArray(value?: string | null): number[];
declare function commaSeparatedToArray(value: string | null | undefined, options: {
    as: 'number';
}): number[];
declare function commaSeparatedToArray(value: string | null | undefined, options: {
    as: 'string';
}): string[];
declare function arrayToCommaSeparated(value?: (string | number | boolean)[] | null): string | undefined;
declare function removeDuplicates<T>(array: T[]): T[];
declare function filterIntersection(filter?: string, restriction?: (string | number)[], apply?: boolean, options?: {
    as: IdKind;
}): string | undefined;
declare function removeEmptyAttributes(obj: object): Record<string, unknown>;
declare const DEFAULT_EMAIL_ERROR = "Please enter a valid email address";
/** Apps pass their translated message, e.g. `t('error_email_valid')`. */
declare function emailValidator(value: string, message?: string): {
    result: boolean;
    message?: string;
};
type EnumOption<V> = {
    label: string;
    value: V;
};
declare function getEnumOptions(obj: Record<string, string | number>, getLabel?: (value: number) => string | undefined): EnumOption<number>[];
declare function getEnumOptions(obj: Record<string, string | number>, getLabel: ((value: number) => string | undefined) | undefined, options: {
    as: 'string';
}): EnumOption<string>[];

declare const STATUS_COLORS: {
    readonly PURPLE: "#C26EE9";
    readonly PINK: "#EE5FAB";
    readonly YELLOW: "#E3CC00";
    readonly ORANGE: "#F19100";
    readonly GREEN: "#04CD25";
    readonly DARK_GREEN: "#109121";
    readonly GRAY: "#C6C6C6";
    readonly RED: "#FF3636";
    readonly BLUE: "#6CA6FE";
};
type StatusColor = keyof typeof STATUS_COLORS;

type DateArg = Date | number | string;
type Duration = {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};
/** Formats with the date-fns token subset the fleet's format constants use; `'…'` quotes literals. */
declare function format(value: DateArg, pattern: string): string;
declare function addDays(value: DateArg, amount: number): Date;
/** Calendar breakdown of an interval, sign-preserving, as date-fns `intervalToDuration` returns it. */
declare function intervalToDuration(interval: {
    start: DateArg;
    end: DateArg;
}): Duration;

declare const TIMEZONE: string;
declare const UTC_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
declare const FULL_DATE_TIME_FORMAT = "EEE, MMM d, yyyy - h:mm a";
declare const FULL_DATE_FORMAT = "EEE, MMM d, yyyy";
declare const FULL_DATE_FORMAT_EXPANDED_MONTH = "EEE, MMMM d, yyyy";
declare const FULL_DATE_WITHOUT_WEEK_FORMAT = "MMM d, yyyy";
declare const DATE_FORMAT = "yyyy-MM-dd";
declare const TIME_FORMAT = "h:mm a";
declare const GMT_FORMAT = "yyyy-MM-dd HH:mm:ss";
declare const STANDARD_TIME_FORMAT = "HH:mm:ss";
declare const STANDARD_TIME_FORMAT_WITHOUT_SECONDS = "HH:mm";
declare const UPPERCASE_DATE_FORMAT = "dd-MMM-yyyy";
declare const UPPERCASE_DATE_TIME_FORMAT = "dd-MMM-yyyy, EEE- h:mm a";
/** Apps wire this to `() => t('na')`; the core cannot reach i18n and must stay RN-safe. */
declare function configureDates(config: {
    emptyLabel: () => string;
}): void;
/** `new Date('2026-08-25')` is UTC midnight while `new Date('2026/08/25')` is local midnight. */
declare function parseLocalDate(dateOnly: string): Date;
declare function getUpperCaseDate(date?: string | Date | null): string;
declare function getUpperCaseDateTime(date?: string | Date | null): string;
declare function formatDateAsEndOfDayUpperCase(date?: string | Date | null): string;
declare function getMonthName(month?: number | null): string;
declare function getFullDateTime(date?: string | Date | null, formatString?: string): string;
declare function getFullDateWithoutTime(date?: string | Date | null): string;
declare function getTime(date?: string | Date | null): string;
declare function getFullDate(date?: string | Date | null): string;
declare function getFullGmtTime(date?: string | Date | null): string;
declare function getFullDateByYear(date?: string | Date | null, selectedYear?: number): string;
declare function getStandardTime(date?: string | Date | null): string;
/** Re-emits an `HH:mm:ss` string; unlike getStandardTime it rejects anything that is not a clock string. */
declare function normalizeClockString(time?: string | null): string;
declare function getStandardTimeWithSecond(date?: string | Date | null): string;
declare function timeDifference(date1: string | Date, date2: string | Date): number;
declare function getHourDifference(time1: string, time2: string): number;
declare function getFormattedShiftTime(shift: string): Date;
declare function isScheduleDayValid(date: string | Date, required?: boolean): boolean;
/** @deprecated Typo alias — use isScheduleDayValid instead. */
declare const isScheduleDayVaild: typeof isScheduleDayValid;
declare function milliSecondsToDuration(milliSeconds: number): Duration;
declare function getTimeEstimate(milliseconds: number, remainingText?: string, delayedText?: string): string;
declare function getWeekStartDate(week: number, year?: number): Date;
/** Labelled duration for web tables, e.g. "01h 02m 03s". */
declare function formatDurationHMS(seconds: number): string;
/** Stopwatch clock for mobile, e.g. "01:02:03". */
declare function formatTimerClock(seconds: number): string;
declare function getNumberOfDaysInMonth(month?: number, year?: number): number;
type SelectOption = {
    label: string;
    value: string;
};
declare function buildYearOptions(options?: {
    span?: number;
    lookAhead?: number;
    now?: Date;
}): SelectOption[];
declare const YEAR_OPTIONS: SelectOption[];
declare const MONTH_OPTIONS: SelectOption[];
declare function getMonthStartAndEnd(monthYear: string, dateFormat?: string): {
    startOfMonth: string;
    endOfMonth: string;
};

type FileMetadata = {
    type?: string;
    size?: number;
};
/** HEAD-probes a static URL; null means the probe failed and the caller should fall back. */
declare function getFileMetadata(url: string): Promise<FileMetadata | null>;

type UserNameFields = {
    first_name?: string | null;
    last_name?: string | null;
};
declare const getFullUserName: (user?: UserNameFields | null) => string | undefined;
declare const getUserNameInitials: (user?: UserNameFields | null) => string;
declare function formatFileSize(bytes: number): string;
type FormatCurrencyOptions = {
    currency: string;
    locale?: string;
    maximumFractionDigits?: number;
};
declare function formatCurrency(value: number, options: FormatCurrencyOptions): string;

export { DATE_FORMAT, DEFAULT_EMAIL_ERROR, type DateArg, type Duration, type EnumOption, FULL_DATE_FORMAT, FULL_DATE_FORMAT_EXPANDED_MONTH, FULL_DATE_TIME_FORMAT, FULL_DATE_WITHOUT_WEEK_FORMAT, type FileMetadata, type FormatCurrencyOptions, GMT_FORMAT, type IdKind, MONTH_OPTIONS, STANDARD_TIME_FORMAT, STANDARD_TIME_FORMAT_WITHOUT_SECONDS, STATUS_COLORS, type SelectOption, type StatusColor, TIMEZONE, TIME_FORMAT, UPPERCASE_DATE_FORMAT, UPPERCASE_DATE_TIME_FORMAT, UTC_TIME_FORMAT, type UserNameFields, YEAR_OPTIONS, addDays, arrayToCommaSeparated, buildYearOptions, cn, commaSeparatedToArray, configureDates, emailValidator, filterIntersection, format, formatCurrency, formatDateAsEndOfDayUpperCase, formatDurationHMS, formatFileSize, formatTimerClock, getEnumOptions, getFileMetadata, getFormattedShiftTime, getFullDate, getFullDateByYear, getFullDateTime, getFullDateWithoutTime, getFullGmtTime, getFullUserName, getHourDifference, getMonthName, getMonthStartAndEnd, getNumberOfDaysInMonth, getStandardTime, getStandardTimeWithSecond, getTime, getTimeEstimate, getUpperCaseDate, getUpperCaseDateTime, getUserNameInitials, getWeekStartDate, intervalToDuration, isScheduleDayVaild, isScheduleDayValid, milliSecondsToDuration, normalizeClockString, parseLocalDate, removeDuplicates, removeEmptyAttributes, timeDifference };
