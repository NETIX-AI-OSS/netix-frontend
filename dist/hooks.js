import { normalizeCurrentUser, derivePermissions } from './chunk-NHLN2CPH.js';
import { useQuery } from '@tanstack/react-query';
import { Auth } from 'envoy-ts-auth';
import { useMemo, useState, useEffect } from 'react';

// src/hooks/search-params.ts
var applyUpdater = (updater, previous) => typeof updater === "function" ? updater(previous) : updater;
function useCurrentUser() {
  const { data, isPending } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => normalizeCurrentUser(await Auth.getInstance().getUser()),
    staleTime: Infinity,
    retry: false
  });
  return { user: data ?? null, isLoading: isPending };
}
function usePermissions() {
  const { user, isLoading } = useCurrentUser();
  const permissions = useMemo(() => derivePermissions(user), [user]);
  const isLoaded = !isLoading && !!user;
  return {
    user,
    permissions,
    isSuperuser: user?.isSuperuser === true,
    isLoaded,
    hasPermission: (code) => isLoaded && (user?.isSuperuser === true || permissions.has(code))
  };
}
var positiveInteger = (value, fallback) => {
  const parsed = value === null ? NaN : Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};
function useUrlPagination(binding, options = {}) {
  const [params, setParams] = binding;
  const {
    pageIndex: defaultPageIndex = 0,
    pageSize: defaultPageSize = 10,
    pageIndexParam = "pageIndex",
    pageSizeParam = "pageSize"
  } = options;
  const [pagination, setPagination] = useState({
    pageIndex: defaultPageIndex,
    pageSize: defaultPageSize
  });
  const writeParams = (next) => {
    const updated = new URLSearchParams(params);
    updated.set(pageIndexParam, String(next.pageIndex));
    updated.set(pageSizeParam, String(next.pageSize));
    setParams(updated);
  };
  const updatePagination = (updater) => {
    setPagination((previous) => {
      const next = applyUpdater(updater, previous);
      writeParams(next);
      return next;
    });
  };
  useEffect(() => {
    setPagination({
      pageIndex: positiveInteger(params.get(pageIndexParam), defaultPageIndex),
      pageSize: positiveInteger(params.get(pageSizeParam), defaultPageSize) || defaultPageSize
    });
  }, [params, pageIndexParam, pageSizeParam, defaultPageIndex, defaultPageSize]);
  return { pagination, updatePagination };
}
function useUrlTab(binding, options = {}) {
  const [params, setParams] = binding;
  const { param = "tab", clearOnChange = [] } = options;
  const [tab, setTab] = useState();
  const writeTab = (next) => {
    const updated = new URLSearchParams(params);
    if (next) updated.set(param, next);
    else updated.delete(param);
    for (const key of clearOnChange) updated.delete(key);
    setParams(updated);
  };
  const updateTab = (updater) => {
    setTab((previous) => {
      const next = applyUpdater(updater, previous);
      writeTab(next);
      return next;
    });
  };
  useEffect(() => {
    setTab(params.get(param) || void 0);
  }, [params, param]);
  return { tab, updateTab };
}

export { applyUpdater, useCurrentUser, usePermissions, useUrlPagination, useUrlTab };
