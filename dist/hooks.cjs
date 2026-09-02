'use strict';

var reactQuery = require('@tanstack/react-query');
var envoyTsAuth = require('envoy-ts-auth');
var react = require('react');

// src/hooks/search-params.ts
var applyUpdater = (updater, previous) => typeof updater === "function" ? updater(previous) : updater;

// src/auth/current-user.ts
var strings = (value) => Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
var asRecord = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : null;
function normalizeGroups(record) {
  const detailed = asRecord(record.groups_detailed) ?? {};
  const names = strings(record.groups);
  const ordered = names.length ? names : Object.keys(detailed);
  return ordered.map((name) => ({
    name,
    permissions: strings(asRecord(detailed[name])?.permissions)
  }));
}
function normalizeCurrentUser(payload) {
  const record = asRecord(payload);
  if (!record) return null;
  const user = asRecord(record.user) ?? record;
  if (typeof user.first_name !== "string" && typeof user.email !== "string") return null;
  return {
    username: typeof user.username === "string" ? user.username : "",
    first_name: typeof user.first_name === "string" ? user.first_name : "",
    last_name: typeof user.last_name === "string" ? user.last_name : "",
    email: typeof user.email === "string" ? user.email : void 0,
    designation: typeof user.designation === "string" ? user.designation : void 0,
    isSuperuser: user.is_superuser === true,
    permissions: strings(user.permissions),
    groups: normalizeGroups(user)
  };
}

// src/auth/permissions.ts
function derivePermissions(user) {
  if (!user) return /* @__PURE__ */ new Set();
  return /* @__PURE__ */ new Set([...user.permissions, ...user.groups.flatMap((group) => group.permissions)]);
}

// src/hooks/use-current-user.ts
function useCurrentUser() {
  const { data, isPending } = reactQuery.useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => normalizeCurrentUser(await envoyTsAuth.Auth.getInstance().getUser()),
    staleTime: Infinity,
    retry: false
  });
  return { user: data ?? null, isLoading: isPending };
}
function usePermissions() {
  const { user, isLoading } = useCurrentUser();
  const permissions = react.useMemo(() => derivePermissions(user), [user]);
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
  const [pagination, setPagination] = react.useState({
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
  react.useEffect(() => {
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
  const [tab, setTab] = react.useState();
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
  react.useEffect(() => {
    setTab(params.get(param) || void 0);
  }, [params, param]);
  return { tab, updateTab };
}

exports.applyUpdater = applyUpdater;
exports.useCurrentUser = useCurrentUser;
exports.usePermissions = usePermissions;
exports.useUrlPagination = useUrlPagination;
exports.useUrlTab = useUrlTab;
