import { describe, expect, it } from "vitest";

import { mockSubjects } from "./mock-subjects";

describe("mockSubjects", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(mockSubjects)).toBe(true);
    expect(mockSubjects.length).toBeGreaterThan(0);
  });

  it("contains subjects with the expected shape", () => {
    mockSubjects.forEach((subject) => {
      expect(subject).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          code: expect.any(String),
          name: expect.any(String),
          department: expect.any(String),
          description: expect.any(String),
          createdAt: expect.any(String),
        })
      );
    });
  });

  it("has unique, sequential numeric ids starting at 1", () => {
    const ids = mockSubjects.map((subject) => subject.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(mockSubjects.length);
    expect(Math.min(...ids)).toBe(1);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it("has unique subject codes", () => {
    const codes = mockSubjects.map((subject) => subject.code);
    const uniqueCodes = new Set(codes);

    expect(uniqueCodes.size).toBe(codes.length);
  });

  it("builds a description that references the subject name and department", () => {
    const subject = mockSubjects.find((item) => item.code === "CS101");

    expect(subject).toBeDefined();
    expect(subject?.description).toBe(
      "A concise overview of introduction to programming in the computer science curriculum."
    );
  });

  it("produces a valid ISO 8601 createdAt timestamp for every subject", () => {
    mockSubjects.forEach((subject) => {
      expect(subject.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(Number.isNaN(new Date(subject.createdAt!).getTime())).toBe(false);
    });
  });

  it("derives createdAt day-of-month from the subject id, wrapping every 28 days", () => {
    const firstSubject = mockSubjects.find((subject) => subject.id === 1);
    const twentyNinthSubject = mockSubjects.find((subject) => subject.id === 29);

    expect(firstSubject?.createdAt).toBe(
      new Date(Date.UTC(2025, 0, 1)).toISOString()
    );
    // id 29 -> ((29 - 1) % 28) + 1 === 1, so it should wrap back to day 1.
    expect(twentyNinthSubject?.createdAt).toBe(
      new Date(Date.UTC(2025, 0, 1)).toISOString()
    );
  });

  it("includes subjects across multiple distinct departments", () => {
    const departments = new Set(mockSubjects.map((subject) => subject.department));

    expect(departments.size).toBeGreaterThan(1);
    expect(departments).toContain("Computer Science");
    expect(departments).toContain("Mathematics");
  });
});