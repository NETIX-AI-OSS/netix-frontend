// src/utils/date/kernel.ts
var MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MS_DAY = 864e5;
var MS_HOUR = 36e5;
var MS_MINUTE = 6e4;
var pad = (value, length = 2) => String(value).padStart(length, "0");
var hour12 = (date) => date.getHours() % 12 || 12;
var FORMATTERS = {
  yyyy: (d) => pad(d.getFullYear(), 4),
  yy: (d) => pad(d.getFullYear() % 100),
  MMMM: (d) => MONTH_NAMES[d.getMonth()],
  MMM: (d) => MONTH_NAMES[d.getMonth()].slice(0, 3),
  MM: (d) => pad(d.getMonth() + 1),
  M: (d) => String(d.getMonth() + 1),
  dd: (d) => pad(d.getDate()),
  d: (d) => String(d.getDate()),
  EEEE: (d) => DAY_NAMES[d.getDay()],
  EEE: (d) => DAY_NAMES[d.getDay()].slice(0, 3),
  HH: (d) => pad(d.getHours()),
  H: (d) => String(d.getHours()),
  hh: (d) => pad(hour12(d)),
  h: (d) => String(hour12(d)),
  mm: (d) => pad(d.getMinutes()),
  m: (d) => String(d.getMinutes()),
  ss: (d) => pad(d.getSeconds()),
  s: (d) => String(d.getSeconds()),
  a: (d) => d.getHours() < 12 ? "AM" : "PM"
};
var TOKEN_LENGTHS = [4, 3, 2, 1];
var toDate = (value) => value instanceof Date ? new Date(value) : new Date(value);
var isValidDate = (date) => !Number.isNaN(date.getTime());
function format(value, pattern) {
  const date = toDate(value);
  if (!isValidDate(date)) throw new RangeError("Invalid time value");
  let out = "";
  let index = 0;
  while (index < pattern.length) {
    const char = pattern[index];
    if (char === "'") {
      const end = pattern.indexOf("'", index + 1);
      if (end === -1) {
        out += pattern.slice(index + 1);
        break;
      }
      out += end === index + 1 ? "'" : pattern.slice(index + 1, end);
      index = end + 1;
      continue;
    }
    const length = TOKEN_LENGTHS.find((n) => FORMATTERS[pattern.slice(index, index + n)]);
    if (length) {
      out += FORMATTERS[pattern.slice(index, index + length)](date);
      index += length;
      continue;
    }
    out += char;
    index += 1;
  }
  return out;
}
function parseStandardTime(value, reference) {
  const match = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/.exec(value);
  if (!match) return /* @__PURE__ */ new Date(NaN);
  const [hours, minutes, seconds] = match.slice(1).map(Number);
  if (hours > 23 || minutes > 59 || seconds > 59) return /* @__PURE__ */ new Date(NaN);
  const date = new Date(reference);
  date.setHours(hours, minutes, seconds, 0);
  return date;
}
function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
function addDays(value, amount) {
  const date = toDate(value);
  date.setDate(date.getDate() + amount);
  return date;
}
function addMonths(value, amount) {
  const date = toDate(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  date.setDate(Math.min(day, getDaysInMonth(date)));
  return date;
}
var addYears = (value, amount) => addMonths(value, amount * 12);
function startOfToday() {
  const date = /* @__PURE__ */ new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
var startOfMonth = (value) => {
  const date = toDate(value);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};
var endOfMonth = (value) => {
  const date = toDate(value);
  date.setDate(getDaysInMonth(date));
  date.setHours(23, 59, 59, 999);
  return date;
};
var startOfDay = (value) => {
  const date = toDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
};
var endOfDay = (value) => {
  const date = toDate(value);
  date.setHours(23, 59, 59, 999);
  return date;
};
var startOfHour = (value) => {
  const date = toDate(value);
  date.setMinutes(0, 0, 0);
  return date;
};
var subHours = (value, amount) => new Date(toDate(value).getTime() - amount * MS_HOUR);
var subDays = (value, amount) => addDays(value, -amount);
var differenceInMilliseconds = (a, b) => toDate(a).getTime() - toDate(b).getTime();
var isBefore = (a, b) => toDate(a).getTime() < toDate(b).getTime();
function differenceInMonths(end, start) {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const anchor = addMonths(start, months);
  if (months > 0 && anchor.getTime() > end.getTime()) months -= 1;
  if (months < 0 && anchor.getTime() < end.getTime()) months += 1;
  return months;
}
function intervalToDuration(interval) {
  const start = toDate(interval.start);
  const end = toDate(interval.end);
  const totalMonths = differenceInMonths(end, start);
  const anchor = addMonths(start, totalMonths);
  const trunc = (value) => Math.trunc(value) || 0;
  const years = trunc(totalMonths / 12);
  const months = totalMonths - years * 12;
  let rest = end.getTime() - anchor.getTime();
  const days = trunc(rest / MS_DAY);
  rest -= days * MS_DAY;
  const hours = trunc(rest / MS_HOUR);
  rest -= hours * MS_HOUR;
  const minutes = trunc(rest / MS_MINUTE);
  rest -= minutes * MS_MINUTE;
  return { years, months, days, hours, minutes, seconds: trunc(rest / 1e3) };
}

// src/utils/date/index.ts
var TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
var UTC_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
var FULL_DATE_TIME_FORMAT = "EEE, MMM d, yyyy - h:mm a";
var FULL_DATE_FORMAT = "EEE, MMM d, yyyy";
var FULL_DATE_FORMAT_EXPANDED_MONTH = "EEE, MMMM d, yyyy";
var FULL_DATE_WITHOUT_WEEK_FORMAT = "MMM d, yyyy";
var DATE_FORMAT = "yyyy-MM-dd";
var TIME_FORMAT = "h:mm a";
var GMT_FORMAT = "yyyy-MM-dd HH:mm:ss";
var STANDARD_TIME_FORMAT = "HH:mm:ss";
var STANDARD_TIME_FORMAT_WITHOUT_SECONDS = "HH:mm";
var UPPERCASE_DATE_FORMAT = "dd-MMM-yyyy";
var UPPERCASE_DATE_TIME_FORMAT = "dd-MMM-yyyy, EEE- h:mm a";
var emptyLabel = () => "NA";
function configureDates(config) {
  emptyLabel = config.emptyLabel;
}
function parseLocalDate(dateOnly) {
  return new Date(dateOnly.replace(/-/g, "/"));
}
function getUpperCaseDate(date) {
  if (!date) return emptyLabel();
  return format(date, UPPERCASE_DATE_FORMAT).toUpperCase();
}
function getUpperCaseDateTime(date) {
  if (!date) return emptyLabel();
  return format(date, UPPERCASE_DATE_TIME_FORMAT).toUpperCase();
}
function formatDateAsEndOfDayUpperCase(date) {
  if (!date) return emptyLabel();
  const dateObj = typeof date === "string" ? parseLocalDate(date) : new Date(date);
  dateObj.setHours(23, 59, 0, 0);
  return format(dateObj, UPPERCASE_DATE_TIME_FORMAT).toUpperCase();
}
function getMonthName(month) {
  if (month === void 0 || month === null) return emptyLabel();
  return format(new Date(0, month, 1), "MMMM");
}
function getFullDateTime(date, formatString = FULL_DATE_TIME_FORMAT) {
  if (!date) return emptyLabel();
  return format(date, formatString);
}
function getFullDateWithoutTime(date) {
  if (!date) return emptyLabel();
  return format(date, FULL_DATE_FORMAT);
}
function getTime(date) {
  if (!date) return emptyLabel();
  return format(date, TIME_FORMAT);
}
function getFullDate(date) {
  if (!date) return emptyLabel();
  return format(date, DATE_FORMAT);
}
function getFullGmtTime(date) {
  if (!date) return emptyLabel();
  return format(date, GMT_FORMAT);
}
function getFullDateByYear(date, selectedYear) {
  if (!date) return emptyLabel();
  return selectedYear ? format(addYears(date, selectedYear - new Date(date).getFullYear()), DATE_FORMAT) : format(date, DATE_FORMAT);
}
function getStandardTime(date) {
  if (!date) return emptyLabel();
  return format(date, STANDARD_TIME_FORMAT_WITHOUT_SECONDS);
}
function normalizeClockString(time) {
  if (!time) return emptyLabel();
  return format(parseStandardTime(time, /* @__PURE__ */ new Date()), STANDARD_TIME_FORMAT);
}
function getStandardTimeWithSecond(date) {
  if (!date) return emptyLabel();
  return format(parseStandardTime(String(date), /* @__PURE__ */ new Date()), STANDARD_TIME_FORMAT_WITHOUT_SECONDS);
}
function timeDifference(date1, date2) {
  return differenceInMilliseconds(date1, date2);
}
function getHourDifference(time1, time2) {
  const date1 = parseStandardTime(time1, /* @__PURE__ */ new Date());
  const date2 = parseStandardTime(time2, /* @__PURE__ */ new Date());
  if (date2 < date1) {
    date2.setDate(date2.getDate() + 1);
  }
  return Math.round(differenceInMilliseconds(date2, date1) / (1e3 * 60 * 60));
}
function getFormattedShiftTime(shift) {
  if (shift) {
    const dateTime = parseStandardTime(shift, /* @__PURE__ */ new Date());
    if (!isValidDate(dateTime)) {
      throw new Error("Invalid date-time value");
    }
    return dateTime;
  }
  return /* @__PURE__ */ new Date();
}
function isScheduleDayValid(date, required) {
  if (!date && !required) return true;
  return isBefore(startOfToday(), new Date(date));
}
var isScheduleDayVaild = isScheduleDayValid;
function milliSecondsToDuration(milliSeconds) {
  return intervalToDuration({ start: /* @__PURE__ */ new Date(0), end: new Date(milliSeconds) });
}
function getTimeEstimate(milliseconds, remainingText = "Remaining", delayedText = "Delayed") {
  const text = milliseconds > 0 ? remainingText : delayedText;
  const duration = milliSecondsToDuration(milliseconds);
  const years = Math.abs(duration.years);
  const months = Math.abs(duration.months);
  const days = Math.abs(duration.days);
  const hours = Math.abs(duration.hours);
  const minutes = Math.abs(duration.minutes);
  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ${text}`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ${text}`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ${text}`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""} ${text}`;
  return minutes ? `${minutes} min${minutes > 1 ? "s" : ""} ${text}` : emptyLabel();
}
function getWeekStartDate(week, year) {
  return addDays(new Date(year || (/* @__PURE__ */ new Date()).getFullYear(), 0, 1), (week - 1) * 7);
}
function formatDurationHMS(seconds) {
  const { hours, minutes, secs } = splitSeconds(seconds);
  return `${hours}h ${minutes}m ${secs}s`;
}
function formatTimerClock(seconds) {
  const { hours, minutes, secs } = splitSeconds(seconds);
  return `${hours}:${minutes}:${secs}`;
}
function splitSeconds(seconds) {
  return {
    hours: String(Math.floor(seconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor(seconds % 3600 / 60)).padStart(2, "0"),
    secs: String(Math.floor(seconds % 60)).padStart(2, "0")
  };
}
function getNumberOfDaysInMonth(month, year) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(1);
  if (month !== void 0) date.setMonth(month);
  if (year !== void 0) date.setFullYear(year);
  return getDaysInMonth(date);
}
function buildYearOptions(options) {
  const { span = 100, lookAhead = 15, now = /* @__PURE__ */ new Date() } = options ?? {};
  return Array.from(Array(span).keys()).map((y) => {
    const year = String(now.getFullYear() - y + lookAhead);
    return { label: year, value: year };
  });
}
var YEAR_OPTIONS = buildYearOptions();
var MONTH_OPTIONS = Array.from(Array(12).keys()).map((m) => ({
  label: format(new Date(2e3, m, 1), "MMMM"),
  value: String(m)
}));
function getMonthStartAndEnd(monthYear, dateFormat = DATE_FORMAT) {
  const [month, year] = monthYear.split("/");
  const reference = new Date(Number(year), Number(month) - 1);
  return {
    startOfMonth: format(startOfMonth(reference), dateFormat),
    endOfMonth: format(endOfMonth(reference), dateFormat)
  };
}

export { DATE_FORMAT, FULL_DATE_FORMAT, FULL_DATE_FORMAT_EXPANDED_MONTH, FULL_DATE_TIME_FORMAT, FULL_DATE_WITHOUT_WEEK_FORMAT, GMT_FORMAT, MONTH_OPTIONS, STANDARD_TIME_FORMAT, STANDARD_TIME_FORMAT_WITHOUT_SECONDS, TIMEZONE, TIME_FORMAT, UPPERCASE_DATE_FORMAT, UPPERCASE_DATE_TIME_FORMAT, UTC_TIME_FORMAT, YEAR_OPTIONS, addDays, buildYearOptions, configureDates, endOfDay, format, formatDateAsEndOfDayUpperCase, formatDurationHMS, formatTimerClock, getFormattedShiftTime, getFullDate, getFullDateByYear, getFullDateTime, getFullDateWithoutTime, getFullGmtTime, getHourDifference, getMonthName, getMonthStartAndEnd, getNumberOfDaysInMonth, getStandardTime, getStandardTimeWithSecond, getTime, getTimeEstimate, getUpperCaseDate, getUpperCaseDateTime, getWeekStartDate, intervalToDuration, isScheduleDayVaild, isScheduleDayValid, milliSecondsToDuration, normalizeClockString, parseLocalDate, startOfDay, startOfHour, startOfMonth, subDays, subHours, timeDifference };
