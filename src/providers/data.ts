import { BaseRecord, DataProvider, GetListParams, GetListResponse } from "@refinedev/core";

import { Subject } from "@/types";
import { mockSubjects } from "./mock-subjects";

const normalize = (value: unknown) => String(value ?? "").toLowerCase();

const matchesFilter = (subject: Subject, filter: any): boolean => {
  if (!filter) {
    return true;
  }

  if (Array.isArray(filter)) {
    return filter.every((item) => matchesFilter(subject, item));
  }

  if (typeof filter !== "object") {
    return true;
  }

  if (Array.isArray(filter.value) && (filter.operator === "or" || filter.operator === "and")) {
    return filter.operator === "or"
      ? filter.value.some((item: unknown) => matchesFilter(subject, item))
      : filter.value.every((item: unknown) => matchesFilter(subject, item));
  }

  if (typeof filter.field !== "string") {
    return true;
  }

  const subjectValue = subject[filter.field as keyof Subject];

  switch (filter.operator) {
    case "eq":
      return subjectValue === filter.value;
    case "contains":
      return normalize(subjectValue).includes(normalize(filter.value));
    default:
      return true;
  }
};

const applyFilters = (subjects: Subject[], filters?: GetListParams["filters"]) => {
  if (!filters) {
    return subjects;
  }

  return subjects.filter((subject) => matchesFilter(subject, filters));
};

const applySorters = (subjects: Subject[], sorters?: GetListParams["sorters"]) => {
  if (!sorters?.length) {
    return [...subjects];
  }

  const [{ field, order }] = sorters;
  const direction = order === "desc" ? -1 : 1;

  return [...subjects].sort((leftSubject, rightSubject) => {
    const leftValue = leftSubject[field as keyof Subject];
    const rightValue = rightSubject[field as keyof Subject];

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return normalize(leftValue).localeCompare(normalize(rightValue)) * direction;
  });
};

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
    filters,
    sorters,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    if (resource !== "subjects") {
      return { data: [] as TData[], total: 0 };
    }

    const filteredSubjects = applyFilters(mockSubjects, filters);
    const sortedSubjects = applySorters(filteredSubjects, sorters);
    const current = pagination?.current ?? 1;
    const pageSize = pagination?.pageSize ?? sortedSubjects.length;
    const start = Math.max(0, (current - 1) * pageSize);

    return {
      data: sortedSubjects.slice(start, start + pageSize) as unknown as TData[],
      total: filteredSubjects.length,
    };
  },
  // Refine requires these minimal stubs on DataProvider, or TypeScript will throw a type error:
  getOne: async () => {
    throw new Error("Not implemented");
  },
  create: async () => {
    throw new Error("Not implemented");
  },
  update: async () => {
    throw new Error("Not implemented");
  },
  deleteOne: async () => {
    throw new Error("Not implemented");
  },
  getApiUrl: () => "",
};