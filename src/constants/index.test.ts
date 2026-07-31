import { describe, expect, it } from "vitest";

import {
  DEAPARTMENT_OPTIONS,
  DEPARTMENT_OPTIONS,
  DEPARTMENTS,
} from "./index";

describe("DEPARTMENTS", () => {
  it("is a non-empty array of strings", () => {
    expect(Array.isArray(DEPARTMENTS)).toBe(true);
    expect(DEPARTMENTS.length).toBeGreaterThan(0);

    DEPARTMENTS.forEach((department) => {
      expect(typeof department).toBe("string");
      expect(department.length).toBeGreaterThan(0);
    });
  });

  it("contains no duplicate entries", () => {
    const uniqueDepartments = new Set(DEPARTMENTS);
    expect(uniqueDepartments.size).toBe(DEPARTMENTS.length);
  });

  it("includes well-known departments", () => {
    expect(DEPARTMENTS).toContain("Computer Science");
    expect(DEPARTMENTS).toContain("Mathematics");
    expect(DEPARTMENTS).toContain("Physics");
  });

  it("is sorted alphabetically", () => {
    const sorted = [...DEPARTMENTS].sort((a, b) => a.localeCompare(b));
    expect(DEPARTMENTS).toEqual(sorted);
  });
});

describe("DEPARTMENT_OPTIONS", () => {
  it("has the same length as DEPARTMENTS", () => {
    expect(DEPARTMENT_OPTIONS).toHaveLength(DEPARTMENTS.length);
  });

  it("maps each department to a { value, label } pair with matching value and label", () => {
    DEPARTMENT_OPTIONS.forEach((option, index) => {
      expect(option).toEqual({
        value: DEPARTMENTS[index],
        label: DEPARTMENTS[index],
      });
    });
  });

  it("preserves the order of DEPARTMENTS", () => {
    expect(DEPARTMENT_OPTIONS.map((option) => option.value)).toEqual(
      DEPARTMENTS
    );
  });
});

describe("DEAPARTMENT_OPTIONS", () => {
  it("is an alias that references the same array as DEPARTMENT_OPTIONS", () => {
    expect(DEAPARTMENT_OPTIONS).toBe(DEPARTMENT_OPTIONS);
  });

  it("has identical contents to DEPARTMENT_OPTIONS", () => {
    expect(DEAPARTMENT_OPTIONS).toEqual(DEPARTMENT_OPTIONS);
  });
});