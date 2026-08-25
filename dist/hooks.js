import { getFullDate, addDays, startOfHour, subHours, startOfMonth, subDays, endOfDay, startOfDay } from './chunk-B7TP7DGE.js';
import { useState, useEffect, useMemo } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';

// src/hooks/search-params.ts
var applyUpdater = (updater, previous) => typeof updater === "function" ? updater(previous) : updater;
function useDelayedLoading(isLoading, delayMs = 150) {
  const [showLoading, setShowLoading] = useState(isLoading && delayMs <= 0);
  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }
    if (delayMs <= 0) {
      setShowLoading(true);
      return;
    }
    setShowLoading(false);
    const timeoutId = globalThis.setTimeout(() => setShowLoading(true), delayMs);
    return () => globalThis.clearTimeout(timeoutId);
  }, [delayMs, isLoading]);
  return showLoading;
}
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
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(void 0);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
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
var toCodename = (permission) => String(permission).replace(/^.*\./, "");
var derivePermissions = (user) => {
  if (!user) return /* @__PURE__ */ new Set();
  const flat = Array.isArray(user.permissions) ? user.permissions : [];
  const grouped = user.groups_detailed ? Object.values(user.groups_detailed).flatMap(
    (group) => Array.isArray(group?.permissions) ? group.permissions : []
  ) : [];
  return new Set([...flat, ...grouped].map(toCodename));
};
var useNoCurrentUser = () => ({ user: null, isLoading: false });
var configuredUseCurrentUser;
function configurePermissions(useCurrentUser) {
  configuredUseCurrentUser = useCurrentUser;
}
function usePermissions(options) {
  const useSource = options?.useCurrentUser ?? configuredUseCurrentUser ?? useNoCurrentUser;
  const { user, isLoading } = useSource();
  const permissions = useMemo(() => derivePermissions(user), [user]);
  const isSuperuser = Boolean(user?.is_superuser);
  const isLoaded = !isLoading && !!user;
  const hasPermission = (code) => {
    if (!isLoaded) return Boolean(options?.failOpen);
    if (isSuperuser) return true;
    return permissions.has(code);
  };
  return { permissions, isSuperuser, isLoaded, hasPermission };
}
function PermissionGate({
  permission,
  children,
  fallback = null,
  ...options
}) {
  const { hasPermission } = usePermissions(options);
  return /* @__PURE__ */ jsx(Fragment, { children: hasPermission(permission) ? children : fallback });
}
function useResizeObserver(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    resizeObserver.observe(ref);
    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);
  return size;
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
var OVERALL_FROM_EPOCH = 1640995200;
var TIME_DURATIONS = {
  LAST_30_DAYS: 720,
  LAST_6_MONTHS: 4320,
  LAST_1_YEAR: 8760,
  SIX_HOURS: 6,
  TWELVE_HOURS: 12,
  TWENTY_FOUR_HOURS: 24,
  SEVEN_DAYS: 168,
  OVERALL: -1
};
var DURATION_OPTIONS = [
  { value: String(TIME_DURATIONS.SIX_HOURS), label: "Last 6 Hours", labelKey: "last_6_hours" },
  { value: String(TIME_DURATIONS.TWELVE_HOURS), label: "Last 12 Hours", labelKey: "last_12_hours" },
  {
    value: String(TIME_DURATIONS.TWENTY_FOUR_HOURS),
    label: "Last 24 Hours",
    labelKey: "last_24_hours"
  },
  { value: String(TIME_DURATIONS.SEVEN_DAYS), label: "Last 7 Days", labelKey: "last_7_days" },
  { value: String(TIME_DURATIONS.LAST_30_DAYS), label: "Last 30 Days", labelKey: "last_30_days" },
  {
    value: String(TIME_DURATIONS.LAST_6_MONTHS),
    label: "Last 6 Months",
    labelKey: "last_6_months"
  },
  { value: String(TIME_DURATIONS.LAST_1_YEAR), label: "Last 1 Year", labelKey: "last_1_year" },
  { value: String(TIME_DURATIONS.OVERALL), label: "Overall", labelKey: "overall" }
];
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
function getCurrentMonthEpochRange(referenceDate = /* @__PURE__ */ new Date()) {
  return {
    from: Math.floor(startOfMonth(referenceDate).getTime() / 1e3),
    to: Math.floor(startOfHour(referenceDate).getTime() / 1e3)
  };
}
function getYesterdayEpochRange(referenceDate = /* @__PURE__ */ new Date()) {
  const yesterday = subDays(referenceDate, 1);
  return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
}
function getLastDaysEpochRange(days, referenceDate = /* @__PURE__ */ new Date()) {
  return {
    from: startOfDay(subDays(referenceDate, days)),
    to: endOfDay(subDays(referenceDate, 1))
  };
}
function getQuickDurationRange(hrs, referenceDate = /* @__PURE__ */ new Date()) {
  switch (hrs) {
    case 24:
      return getYesterdayEpochRange(referenceDate);
    case 168:
      return getLastDaysEpochRange(7, referenceDate);
    default:
      return getEpochfromDuration(hrs, true, referenceDate);
  }
}
function getFullDayRange(range) {
  if (!range?.from) return range;
  return { from: startOfDay(range.from), to: endOfDay(range.to ?? range.from) };
}
function getEpochRange(range) {
  let rangeFrom = range?.from;
  let rangeTo = range?.to;
  if (rangeFrom instanceof Date) rangeFrom = ~~(rangeFrom.getTime() / 1e3);
  if (rangeTo instanceof Date) rangeTo = ~~(rangeTo.getTime() / 1e3);
  return { from: rangeFrom, to: rangeTo };
}
function getDateRange(range) {
  const rangeFrom = range?.from instanceof Date ? range.from : range?.from != null ? new Date(Number(range.from) * 1e3) : /* @__PURE__ */ new Date();
  let rangeTo = range?.to instanceof Date ? range.to : range?.to != null ? new Date(Number(range.to) * 1e3) : /* @__PURE__ */ new Date();
  if (!(range?.to instanceof Date)) {
    const isExclusiveDayBoundaryEnd = rangeTo.getTime() > rangeFrom.getTime() && rangeTo.getHours() === 0 && rangeTo.getMinutes() === 0 && rangeTo.getSeconds() === 0 && rangeTo.getMilliseconds() === 0;
    if (isExclusiveDayBoundaryEnd) {
      rangeTo = subDays(rangeTo, 1);
    }
  }
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

export { DURATION_OPTIONS, MOBILE_BREAKPOINT, OVERALL_FROM_EPOCH, PermissionGate, TIME_DURATIONS, applyUpdater, configurePermissions, derivePermissions, getCurrentMonthEpochRange, getDateRange, getDuration, getEpochRange, getEpochfromDuration, getFullDayRange, getLastDaysEpochRange, getQuickDurationRange, getYesterdayEpochRange, useDelayedLoading, useFilters, useIsMobile, usePagination, usePermissions, useResizeObserver, useTabs, useTimeRange };
