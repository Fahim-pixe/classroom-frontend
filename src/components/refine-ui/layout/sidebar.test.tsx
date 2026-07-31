import { describe, expect, it } from "vitest";

import { Sidebar } from "./sidebar";

// This PR only touched a trailing-newline/formatting change around the
// `Sidebar.displayName` assignment; this test protects that static
// assignment from regressing (e.g. accidental deletion or renaming).
describe("Sidebar", () => {
  it("has the displayName 'Sidebar'", () => {
    expect((Sidebar as unknown as { displayName?: string }).displayName).toBe(
      "Sidebar"
    );
  });

  it("is exported as a function component", () => {
    expect(typeof Sidebar).toBe("function");
  });
});