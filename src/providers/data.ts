import {
  createDataProvider,
  CreateDataProviderOptions,
} from "@refinedev/rest";

import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import { API_RESPONSE_POLICY, BACKEND_BASE_URL, RESOURCE_LIST_CONFIG } from "@/constants";

type ApiErrorBody = {
  error?: unknown;
  message?: unknown;
};

type DataProviderError = {
  message: string;
  statusCode: number;
  response: Response;
};

const readJsonResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const responseText = await response.text();

  if (!responseText) {
    return {} as T;
  }

  if (!contentType.includes(API_RESPONSE_POLICY.jsonContentType)) {
    throw {
      message: API_RESPONSE_POLICY.unexpectedResponseMessage,
      statusCode: response.status,
      response,
    } satisfies DataProviderError;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw {
      message: API_RESPONSE_POLICY.unexpectedResponseMessage,
      statusCode: response.status,
      response,
    } satisfies DataProviderError;
  }
};

const getErrorMessage = (payload: ApiErrorBody): string => {
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return API_RESPONSE_POLICY.fallbackErrorMessage;
};

const toDataProviderError = async (response: Response): Promise<DataProviderError> => {
  try {
    const payload = await readJsonResponse<ApiErrorBody>(response);

    return {
      message: getErrorMessage(payload),
      statusCode: response.status,
      response,
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      return error as DataProviderError;
    }

    return {
      message: API_RESPONSE_POLICY.fallbackErrorMessage,
      statusCode: response.status,
      response,
    };
  }
};

const readSuccessfulJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw await toDataProviderError(response);
  }

  return readJsonResponse<T>(response);
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const params: Record<string, string | number> = {};

      if (pagination?.mode !== "off") {
        const page = pagination?.currentPage ?? 1;
        const pageSize = pagination?.pageSize ?? 10;

        params.page = page;
        params.limit = pageSize;
      }

      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";
        const value = String(filter.value);

        if (field === "role") {
          params.role = value;
        }

        if (resource === "departments") {
          if (field === "name" || field === "code") {
            params.search = value;
          }
        }

        if (resource === "users") {
          if (
            field === "search" ||
            field === "name" ||
            field === "email"
          ) {
            params.search = value;
          }
        }

        if (resource === "subjects") {
          if (field === "department") {
            params.department = value;
          }

          if (field === "name" || field === "code") {
            params.search = value;
          }
        }

        if (resource === "resources") {
          if (field === "search") params.search = value;
          if (field === "category") params.category = value;
          if (field === "classId") params.classId = value;
          if (field === RESOURCE_LIST_CONFIG.queryParams.favoritesOnly) {
            params[RESOURCE_LIST_CONFIG.queryParams.favoritesOnly] = value;
          }
        }

        if (resource === "classes") {
          if (field === "name") {
            params.search = value;
          }

          if (field === "subject") {
            params.subject = value;
          }

          if (field === "teacher") {
            params.teacher = value;
          }

          if (field === "teacherId") {
            params.teacherId = value;
          }
        }
      });

      return params;
    },

    mapResponse: async (response) => {
      const payload = await readSuccessfulJsonResponse<ListResponse>(response);
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      const payload = await readSuccessfulJsonResponse<ListResponse>(response);
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },

  create: {
    getEndpoint: ({ resource }) => resource,

    buildBodyParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      const json = await readSuccessfulJsonResponse<CreateResponse>(response);
      return json.data ?? {};
    },

    transformError: toDataProviderError,
  },

  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      const json = await readSuccessfulJsonResponse<GetOneResponse>(response);
      return json.data ?? {};
    },

  },

  custom: {
    buildBodyParams: async ({ payload }) => payload ?? {},
    mapResponse: async (response: Response) => readSuccessfulJsonResponse(response),
    transformError: toDataProviderError,
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options, {
  credentials: API_RESPONSE_POLICY.credentials,
});

export { dataProvider };
