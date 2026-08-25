import { useSearchParams } from 'react-router';
import { useState, useEffect, useMemo } from 'react';

// src/hooks/router.ts

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
var MS_HOUR = 36e5;
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
function addDays(value, amount) {
  const date = toDate(value);
  date.setDate(date.getDate() + amount);
  return date;
}
var startOfHour = (value) => {
  const date = toDate(value);
  date.setMinutes(0, 0, 0);
  return date;
};
var subHours = (value, amount) => new Date(toDate(value).getTime() - amount * MS_HOUR);

// src/utils/date/index.ts
Intl.DateTimeFormat().resolvedOptions().timeZone;
var DATE_FORMAT = "yyyy-MM-dd";
var emptyLabel = () => "NA";
function getFullDate(date) {
  if (!date) return emptyLabel();
  return format(date, DATE_FORMAT);
}
function buildYearOptions(options) {
  const { span = 100, lookAhead = 15, now = /* @__PURE__ */ new Date() } = {};
  return Array.from(Array(span).keys()).map((y) => {
    const year = String(now.getFullYear() - y + lookAhead);
    return { label: year, value: year };
  });
}
buildYearOptions();
Array.from(Array(12).keys()).map((m) => ({
  label: format(new Date(2e3, m, 1), "MMMM"),
  value: String(m)
}));

// src/hooks/search-params.ts
var applyUpdater = (updater, previous) => typeof updater === "function" ? updater(previous) : updater;

// src/hooks/use-filters.ts
var hasValues = (filters) => !!filters && Object.values(filters).filter((v) => v).length > 0;
function useFilters(binding, options) {
  const [params, setParams] = binding;
  const key = options?.filterKey || "filters";
  const inclusiveEndDate = options?.inclusiveEndDate ?? false;
  const [filters, setFilters] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const writeParams = (next) => {
    const updated = new URLSearchParams(params);
    if (hasValues(next)) {
      updated.set(key, JSON.stringify(next));
    } else {
      updated.delete(key);
    }
    if (!options?.filterKey) updated.set("pageIndex", "0");
    setParams(updated);
  };
  const updateFilters = (updater) => {
    if (typeof updater !== "function") {
      writeParams(updater);
      setFilters(updater);
      return;
    }
    setFilters((previous) => {
      const next = applyUpdater(updater, previous);
      writeParams(next);
      return next;
    });
  };
  useEffect(() => {
    setIsLoading(true);
    const raw = params.get(key);
    if (raw) {
      try {
        setFilters(JSON.parse(raw));
      } catch {
      }
    } else {
      setFilters(void 0);
    }
    setIsLoading(false);
  }, [params, key]);
  const transformedFilters = useMemo(() => {
    const end = filters?.created_on__lte;
    const created_on__lte = end ? getFullDate(inclusiveEndDate ? addDays(end, 1) : end) : void 0;
    return { ...filters, created_on__lte };
  }, [filters, inclusiveEndDate]);
  return { raw: filters, filters: transformedFilters, updateFilters, isLoading };
}
function usePagination(binding, { pageIndex = 0, pageSize = 50 } = {}) {
  const [params, setParams] = binding;
  const [pagination, setPagination] = useState({ pageIndex, pageSize });
  const writeParams = (next) => {
    const updated = new URLSearchParams(params);
    updated.set("pageIndex", String(next.pageIndex));
    updated.set("pageSize", String(next.pageSize));
    setParams(updated);
  };
  const updatePagination = (updater) => {
    if (typeof updater !== "function") {
      writeParams(updater);
      setPagination(updater);
      return;
    }
    setPagination((previous) => {
      const next = applyUpdater(updater, previous);
      writeParams(next);
      return next;
    });
  };
  useEffect(() => {
    const pageIndexParam = params.get("pageIndex");
    const pageSizeParam = params.get("pageSize");
    setPagination({
      pageIndex: pageIndexParam ? Number(pageIndexParam) : pageIndex,
      pageSize: pageSizeParam ? Number(pageSizeParam) : pageSize
    });
  }, [params, pageIndex, pageSize]);
  return { pagination, updatePagination };
}
function useTabs(binding, options) {
  const [params, setParams] = binding;
  const [tab, setTab] = useState();
  const writeParams = (next) => {
    const updated = new URLSearchParams(params);
    if (next) {
      updated.set("tab", next);
    } else {
      updated.delete("tab");
    }
    options?.clearOnChange?.forEach((key) => updated.delete(key));
    setParams(updated);
  };
  const updateTab = (updater) => {
    if (typeof updater !== "function") {
      writeParams(updater);
      setTab(updater);
      return;
    }
    setTab((previous) => {
      const next = applyUpdater(updater, previous);
      writeParams(next);
      return next;
    });
  };
  useEffect(() => {
    setTab(params.get("tab") || void 0);
  }, [params]);
  return { tab, updateTab };
}
function getDuration(from, to) {
  if (from == null || from === "" || to == null || to === "") return 0;
  const start = Number(from);
  const end = Number(to);
  if (isNaN(start) || isNaN(end)) return 0;
  return Math.round(Math.abs(end - start) / 3600);
}
function getEpochfromDuration(hrs, anchor = false, referenceDate = /* @__PURE__ */ new Date()) {
  const to = anchor ? startOfHour(referenceDate) : referenceDate;
  return { from: subHours(to, hrs), to };
}
function getEpochRange(range) {
  let rangeFrom = range?.from;
  let rangeTo = range?.to;
  if (rangeFrom instanceof Date) rangeFrom = ~~(rangeFrom.getTime() / 1e3);
  if (rangeTo instanceof Date) rangeTo = ~~(rangeTo.getTime() / 1e3);
  return { from: rangeFrom, to: rangeTo };
}
function useTimeRange(binding, defaultRange, options) {
  const [params, setParams] = binding;
  const enabled = options?.enabled ?? true;
  const hasDateFrom = params.has("from");
  const hasDateTo = params.has("to");
  const from = params.get("from");
  const to = params.get("to");
  useEffect(() => {
    if (!enabled || hasDateFrom && hasDateTo) return;
    const defaultEpoch = getEpochRange(getEpochfromDuration(12, true));
    const next = new URLSearchParams(params);
    next.set("from", defaultRange?.from?.toString() ?? String(defaultEpoch.from));
    next.set("to", defaultRange?.to?.toString() ?? String(defaultEpoch.to));
    setParams(next, { replace: true });
  }, [defaultRange?.from, defaultRange?.to, enabled, hasDateFrom, hasDateTo]);
  function updateTimeRange(range) {
    const epochRange = getEpochRange(range);
    const next = new URLSearchParams(params);
    if (epochRange.from) next.set("from", String(epochRange.from));
    if (epochRange.to) next.set("to", String(epochRange.to));
    setParams(next, { replace: true });
  }
  function updateTimeDuration(hrs) {
    updateTimeRange(getEpochfromDuration(hrs));
  }
  return {
    epoch: { from: Number(from) || void 0, to: Number(to) || void 0 },
    duration: getDuration(from, to),
    updateTimeRange,
    updateTimeDuration
  };
}

// src/hooks/router.ts
function useSearchParamsBinding() {
  const [params, setParams] = useSearchParams();
  return [params, setParams];
}
var useRouterPagination = (options) => usePagination(useSearchParamsBinding(), options);
var useRouterTabs = (options) => useTabs(useSearchParamsBinding(), options);
var useRouterFilters = (options) => useFilters(useSearchParamsBinding(), options);
var useRouterTimeRange = (defaultRange, options) => useTimeRange(useSearchParamsBinding(), defaultRange, options);

export { useRouterFilters, useRouterPagination, useRouterTabs, useRouterTimeRange, useSearchParamsBinding };
