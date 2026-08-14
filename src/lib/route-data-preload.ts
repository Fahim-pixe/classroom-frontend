import type { DataProvider } from "@refinedev/core";
import type { QueryClient } from "@tanstack/react-query";

import { API_ENDPOINTS, PERFORMANCE_CONFIG, ROUTES } from "@/constants";

const ROUTE_DATA_QUERY_KEYS = {
  dashboard: ["route-data", ROUTES.HOME, API_ENDPOINTS.DASHBOARD_STATS],
  classes: ["route-data", ROUTES.CLASSES.LIST, API_ENDPOINTS.CLASSES.LIST],
} as const;

type PrefetchableRoute = typeof ROUTES.HOME | typeof ROUTES.CLASSES.LIST;

type RouteDataPrefetchDependencies = {
  dataProvider: DataProvider;
  queryClient: QueryClient;
};

function getRouteQueryKey(route: string) {
  if (route === ROUTES.HOME) return ROUTE_DATA_QUERY_KEYS.dashboard;
  if (route === ROUTES.CLASSES.LIST) return ROUTE_DATA_QUERY_KEYS.classes;

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

  if (route === ROUTES.CLASSES.LIST) {
    const getList = dataProvider.getList;

    if (!getList) {
      return;
    }

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
  }
}

export type { PrefetchableRoute };
