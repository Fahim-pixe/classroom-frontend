import { describe, expect, it } from "vitest";

import { Subject } from "./index";

describe("Subject type", () => {
  it("accepts an object with id, name, code, description, department, and createdAt", () => {
    const subject: Subject = {
      id: 1,
      name: "Introduction to Programming",
      code: "CS101",
      description: "An introductory course covering programming fundamentals.",
      department: "Computer Science",
      createdAt: new Date(2025, 0, 1).toISOString(),
    };

    expect(subject).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        code: expect.any(String),
        description: expect.any(String),
        department: expect.any(String),
        createdAt: expect.any(String),
      })
    );
  });

  it("preserves all fields assigned to it without loss", () => {
    const subject: Subject = {
      id: 42,
      name: "Data Structures",
      code: "CS102",
      description: "A course on data structures.",
      department: "Computer Science",
      createdAt: "2025-01-02T00:00:00.000Z",
    };

    expect(Object.keys(subject).sort()).toEqual(
      ["code", "createdAt", "department", "description", "id", "name"].sort()
    );
  });
});