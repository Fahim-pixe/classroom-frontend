import type { DataProvider } from "@refinedev/core";
import type { QueryClient } from "@tanstack/react-query";

import { API_ENDPOINTS, PERFORMANCE_CONFIG, ROUTES } from "@/constants";

const ROUTE_DATA_QUERY_KEYS = {
  dashboard: ["route-data", ROUTES.HOME, API_ENDPOINTS.DASHBOARD_STATS],
  classes: ["route-data", ROUTES.CLASSES.LIST, API_ENDPOINTS.CLASSES.LIST],
  assignments: ["route-data", ROUTES.ASSIGNMENTS.LIST],
  attendance: ["route-data", ROUTES.ATTENDANCE.LIST],
  gradeAssessments: ["route-data", ROUTES.GRADE_ASSESSMENTS],
  academicRecords: ["route-data", ROUTES.ACADEMIC_RECORDS],
} as const;

type PrefetchableRoute =
  | typeof ROUTES.HOME
  | typeof ROUTES.CLASSES.LIST
  | typeof ROUTES.ASSIGNMENTS.LIST
  | typeof ROUTES.ATTENDANCE.LIST
  | typeof ROUTES.GRADE_ASSESSMENTS
  | typeof ROUTES.ACADEMIC_RECORDS;

type RouteDataPrefetchDependencies = {
  dataProvider: DataProvider;
  queryClient: QueryClient;
};

function getRouteQueryKey(route: string) {
  if (route === ROUTES.HOME) return ROUTE_DATA_QUERY_KEYS.dashboard;
  if (route === ROUTES.CLASSES.LIST) return ROUTE_DATA_QUERY_KEYS.classes;
  if (route === ROUTES.ASSIGNMENTS.LIST) return ROUTE_DATA_QUERY_KEYS.assignments;
  if (route === ROUTES.ATTENDANCE.LIST) return ROUTE_DATA_QUERY_KEYS.attendance;
  if (route === ROUTES.GRADE_ASSESSMENTS) return ROUTE_DATA_QUERY_KEYS.gradeAssessments;
  if (route === ROUTES.ACADEMIC_RECORDS) return ROUTE_DATA_QUERY_KEYS.academicRecords;

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

  if (route === ROUTES.ACADEMIC_RECORDS && PERFORMANCE_CONFIG.routeDataPrefetch.academicRecords && custom) {
    void queryClient.prefetchQuery({
      queryKey: ROUTE_DATA_QUERY_KEYS.academicRecords,
      queryFn: async () => {
        const classes = await custom<{ data?: Array<{ id: string | number }> }>({
          url: API_ENDPOINTS.ACADEMIC_RECORDS.CLASSES,
          method: "get",
        });
        const classPayload = classes.data;
        const availableClasses = Array.isArray(classPayload) ? classPayload : classPayload?.data ?? [];
        const firstClassId = availableClasses[0]?.id;
        const summary = firstClassId
          ? await custom({
              url: API_ENDPOINTS.ACADEMIC_RECORDS.SUMMARY,
              method: "get",
              query: { classId: String(firstClassId) },
            })
          : undefined;

        return { classes, summary };
      },
      staleTime: PERFORMANCE_CONFIG.queryStaleTimeMs,
    });
    return;
  }

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

  if (route === ROUTES.GRADE_ASSESSMENTS && PERFORMANCE_CONFIG.routeDataPrefetch.gradeAssessments && custom) {
    void queryClient.prefetchQuery({
      queryKey: ROUTE_DATA_QUERY_KEYS.gradeAssessments,
      queryFn: async () => {
        const classes = await custom<{ data?: Array<{ id: string | number }> }>({
          url: API_ENDPOINTS.ACADEMIC_RECORDS.CLASSES,
          method: "get",
        });
        const classPayload = classes.data;
        const availableClasses = Array.isArray(classPayload) ? classPayload : classPayload?.data ?? [];
        const firstClassId = availableClasses[0]?.id;
        const students = firstClassId
          ? await getList({
              resource: API_ENDPOINTS.ACADEMIC_RECORDS.CLASS_USERS(firstClassId),
              pagination: {
                currentPage: 1,
                pageSize: PERFORMANCE_CONFIG.routeDataPrefetch.classesPageSize,
                mode: "server",
              },
              filters: [{ field: "role", operator: "eq", value: "student" }],
              sorters: [],
            })
          : undefined;

        return { classes, students };
      },
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
          pagination: {
            currentPage: 1,
            pageSize: PERFORMANCE_CONFIG.routeDataPrefetch.classesPageSize,
            mode: "server",
          },
          filters: [],
          sorters: [],
        });
        const firstClassId = classes.data[0]?.id;
        const assignments = firstClassId
          ? await getList({
              resource: API_ENDPOINTS.ASSIGNMENTS.LIST,
              pagination: {
                currentPage: 1,
                pageSize: PERFORMANCE_CONFIG.routeDataPrefetch.assignmentsPageSize,
                mode: "server",
              },
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
