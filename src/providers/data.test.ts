import { describe, expect, it } from "vitest";

import { dataProvider } from "./data";
import { mockSubjects } from "./mock-subjects";

describe("dataProvider.getList", () => {
  it("returns an empty result for resources other than 'subjects'", async () => {
    const result = await dataProvider.getList({
      resource: "departments",
    } as any);

    expect(result).toEqual({ data: [], total: 0 });
  });

  it("returns all mock subjects when no pagination, filters, or sorters are provided", async () => {
    const result = await dataProvider.getList({
      resource: "subjects",
    } as any);

    expect(result.total).toBe(mockSubjects.length);
    expect(result.data).toHaveLength(mockSubjects.length);
  });

  describe("pagination", () => {
    it("paginates results using the given current page and pageSize", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        pagination: { current: 2, pageSize: 5, mode: "server" },
      } as any);

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(mockSubjects.length);
      expect(result.data).toEqual(mockSubjects.slice(5, 10));
    });

    it("defaults to page 1 when pagination.current is not provided", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        pagination: { pageSize: 3, mode: "server" },
      } as any);

      expect(result.data).toEqual(mockSubjects.slice(0, 3));
    });

    it("returns an empty page when current is beyond the available data", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        pagination: {
          current: 1000,
          pageSize: 10,
          mode: "server",
        },
      } as any);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(mockSubjects.length);
    });
  });

  describe("filtering", () => {
    it("filters by an 'eq' operator on a specific field", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        filters: [{ field: "department", operator: "eq", value: "Mathematics" }],
      } as any);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((subject: any) => {
        expect(subject.department).toBe("Mathematics");
      });
      expect(result.total).toBe(result.data.length);
    });

    it("filters by a 'contains' operator, case-insensitively", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        filters: [{ field: "name", operator: "contains", value: "calculus" }],
      } as any);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((subject: any) => {
        expect(subject.name.toLowerCase()).toContain("calculus");
      });
    });

    it("combines multiple filters with an implicit AND", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        filters: [
          { field: "department", operator: "eq", value: "Computer Science" },
          { field: "name", operator: "contains", value: "Data" },
        ],
      } as any);

      result.data.forEach((subject: any) => {
        expect(subject.department).toBe("Computer Science");
        expect(subject.name.toLowerCase()).toContain("data");
      });
      expect(result.data.map((s: any) => s.code)).toContain("CS102");
    });

    it("supports explicit 'or' grouping of nested filters", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        filters: [
          {
            operator: "or",
            value: [
              { field: "department", operator: "eq", value: "Physics" },
              { field: "department", operator: "eq", value: "Chemistry" },
            ],
          },
        ],
      } as any);

      result.data.forEach((subject: any) => {
        expect(["Physics", "Chemistry"]).toContain(subject.department);
      });
      const departmentsPresent = new Set(result.data.map((s: any) => s.department));
      expect(departmentsPresent.size).toBe(2);
    });

    it("returns no results when the filter matches nothing", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        filters: [{ field: "department", operator: "eq", value: "Nonexistent Department" }],
      } as any);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("treats unknown operators as always matching", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        filters: [{ field: "name", operator: "gte", value: "Z" }],
      } as any);

      expect(result.total).toBe(mockSubjects.length);
    });

    it("ignores filter entries without a string field", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        filters: [{ operator: "eq", value: "Mathematics" } as any],
      } as any);

      expect(result.total).toBe(mockSubjects.length);
    });
  });

  describe("sorting", () => {
    it("sorts ascending by a string field", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        sorters: [{ field: "name", order: "asc" }],
        pagination: { pageSize: mockSubjects.length, mode: "server" },
      } as any);

      const names = result.data.map((subject: any) => subject.name.toLowerCase());
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sortedNames);
    });

    it("sorts descending by a numeric field", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        sorters: [{ field: "id", order: "desc" }],
        pagination: { pageSize: mockSubjects.length, mode: "server" },
      } as any);

      const ids = result.data.map((subject: any) => subject.id);
      expect(ids).toEqual([...ids].sort((a, b) => b - a));
    });

    it("does not mutate the original mockSubjects array when sorting", async () => {
      const originalOrder = mockSubjects.map((subject) => subject.id);

      await dataProvider.getList({
        resource: "subjects",
        sorters: [{ field: "id", order: "desc" }],
      } as any);

      expect(mockSubjects.map((subject) => subject.id)).toEqual(originalOrder);
    });

    it("leaves order unchanged when no sorters are provided", async () => {
      const result = await dataProvider.getList({
        resource: "subjects",
        pagination: { pageSize: mockSubjects.length, mode: "server" },
      } as any);

      expect(result.data.map((subject: any) => subject.id)).toEqual(
        mockSubjects.map((subject) => subject.id)
      );
    });
  });
});

describe("dataProvider unimplemented methods", () => {
  it("getOne throws", async () => {
    await expect(dataProvider.getOne!({} as any)).rejects.toThrow("Not implemented");
  });

  it("create throws", async () => {
    await expect(dataProvider.create!({} as any)).rejects.toThrow("Not implemented");
  });

  it("update throws", async () => {
    await expect(dataProvider.update!({} as any)).rejects.toThrow("Not implemented");
  });

  it("deleteOne throws", async () => {
    await expect(dataProvider.deleteOne!({} as any)).rejects.toThrow("Not implemented");
  });

  it("getApiUrl returns an empty string", () => {
    expect(dataProvider.getApiUrl()).toBe("");
  });
});