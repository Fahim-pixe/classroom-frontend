import type { DataProvider } from "@refinedev/core";
import type { QueryClient } from "@tanstack/react-query";

import { API_ENDPOINTS, PERFORMANCE_CONFIG, ROUTES } from "@/constants";

const ROUTE_DATA_QUERY_KEYS = {
  dashboard: ["route-data", ROUTES.HOME, API_ENDPOINTS.DASHBOARD_STATS],
  classes: ["route-data", ROUTES.CLASSES.LIST, API_ENDPOINTS.CLASSES.LIST],
  assignments: ["route-data", ROUTES.ASSIGNMENTS.LIST],
  attendance: ["route-data", ROUTES.ATTENDANCE.LIST],
} as const;

type PrefetchableRoute =
  | typeof ROUTES.HOME
  | typeof ROUTES.CLASSES.LIST
  | typeof ROUTES.ASSIGNMENTS.LIST
  | typeof ROUTES.ATTENDANCE.LIST;

type RouteDataPrefetchDependencies = {
  dataProvider: DataProvider;
  queryClient: QueryClient;
};

function getRouteQueryKey(route: string) {
  if (route === ROUTES.HOME) return ROUTE_DATA_QUERY_KEYS.dashboard;
  if (route === ROUTES.CLASSES.LIST) return ROUTE_DATA_QUERY_KEYS.classes;
  if (route === ROUTES.ASSIGNMENTS.LIST) return ROUTE_DATA_QUERY_KEYS.assignments;
  if (route === ROUTES.ATTENDANCE.LIST) return ROUTE_DATA_QUERY_KEYS.attendance;

  return undefined;
}

export function getRoutePrefetchedData<T>(queryClient: QueryClient, route: string) {
  const queryKey = getRouteQueryKey(route);

  return queryKey ? queryClient.getQueryData<T>(queryKey) : undefined;
}

export function preloadRouteData(route: string, { dataProvider, queryClient }: RouteDataPrefetchDependencies) {
  if (!PERFORMANCE_CONFIG.routeDataPrefetch.enabled) {
    return;
  }

  if (route === ROUTES.HOME) {
    const custom = dataProvider.custom;

    if (!custom) {
      return;
    }

    void queryClient.prefetchQuery({
      queryKey: ROUTE_DATA_QUERY_KEYS.dashboard,
      queryFn: () =>
        custom({
          url: API_ENDPOINTS.DASHBOARD_STATS,
          method: "get",
        }),
      staleTime: PERFORMANCE_CONFIG.queryStaleTimeMs,
    });
    return;
  }

  const getList = dataProvider.getList;
  const custom = dataProvider.custom;

  if (!getList) {
    return;
  }

  if (route === ROUTES.CLASSES.LIST) {
    void queryClient.prefetchQuery({
      queryKey: ROUTE_DATA_QUERY_KEYS.classes,
      queryFn: () =>
        getList({
          resource: API_ENDPOINTS.CLASSES.LIST,
          pagination: {
            currentPage: 1,
            pageSize: PERFORMANCE_CONFIG.routeDataPrefetch.classesPageSize,
            mode: "server",
          },
          filters: [],
          sorters: [
            {
              field: "id",
              order: "desc",
            },
          ],
        }),
      staleTime: PERFORMANCE_CONFIG.queryStaleTimeMs,
    });
    return;
  }

  if (route === ROUTES.ASSIGNMENTS.LIST && PERFORMANCE_CONFIG.routeDataPrefetch.assignments) {
    void queryClient.prefetchQuery({
      queryKey: ROUTE_DATA_QUERY_KEYS.assignments,
      queryFn: async () => {
        const classes = await getList({
          resource: API_ENDPOINTS.CLASSES.LIST,
          pagination: { mode: "off" },
          filters: [],
          sorters: [],
        });
        const firstClassId = classes.data[0]?.id;
        const assignments = firstClassId
          ? await getList({
              resource: API_ENDPOINTS.ASSIGNMENTS.LIST,
              pagination: { mode: "off" },
              filters: [{ field: "classId", operator: "eq", value: String(firstClassId) }],
              sorters: [],
            })
          : undefined;

        return { classes, assignments };
      },
      staleTime: PERFORMANCE_CONFIG.queryStaleTimeMs,
    });
    return;
  }

  if (route === ROUTES.ATTENDANCE.LIST && PERFORMANCE_CONFIG.routeDataPrefetch.attendance && custom) {
    void queryClient.prefetchQuery({
      queryKey: ROUTE_DATA_QUERY_KEYS.attendance,
      queryFn: async () => {
        const classes = await custom<{ data?: Array<{ id: string | number }> }>({ url: API_ENDPOINTS.ATTENDANCE.CLASSES, method: "get" });
        const classPayload = classes.data;
        const availableClasses = Array.isArray(classPayload) ? classPayload : classPayload?.data ?? [];
        const firstClassId = availableClasses[0]?.id;
        const [summary, sessions] = firstClassId
          ? await Promise.all([
              custom({ url: API_ENDPOINTS.ATTENDANCE.SUMMARY, method: "get", query: { classId: String(firstClassId) } }),
              custom({ url: API_ENDPOINTS.ATTENDANCE.LIST, method: "get", query: { classId: String(firstClassId) } }),
            ])
          : [undefined, undefined];

        return { classes, summary, sessions };
      },
      staleTime: PERFORMANCE_CONFIG.queryStaleTimeMs,
    });
  }
}

export type { PrefetchableRoute };
