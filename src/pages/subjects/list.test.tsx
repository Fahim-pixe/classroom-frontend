import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// `src/pages/subjects/list.tsx` builds its `refineCoreProps.filters.permanent`
// array with `...departmentFilters, ...seartchFilter` — `seartchFilter` is
// never declared anywhere in the file (the intended variable is
// `searchFilters`). Referencing an undeclared identifier throws a
// `ReferenceError` synchronously while the arguments to `useTable` are being
// constructed, which happens on every render, before `useTable` itself is
// ever invoked. As a result, `<SubjectsList />` currently cannot render
// successfully in any state. These tests document that regression.
vi.mock("@refinedev/react-table", () => ({
  useTable: vi.fn(),
}));

import { useTable } from "@refinedev/react-table";
import SubjectsList from "./list";

describe("SubjectsList", () => {
  it("can be imported without throwing (the bug only manifests on render)", async () => {
    await expect(import("./list")).resolves.toBeDefined();
  });

  it("throws a ReferenceError for the undefined `seartchFilter` identifier when rendered", () => {
    expect(() => render(<SubjectsList />)).toThrow(/seartchFilter/);
  });

  it("never reaches the useTable call, since the error occurs while building its arguments", () => {
    expect(useTable).not.toHaveBeenCalled();

    try {
      render(<SubjectsList />);
    } catch {
      // expected: see the "throws a ReferenceError" test above
    }

    expect(useTable).not.toHaveBeenCalled();
  });
});