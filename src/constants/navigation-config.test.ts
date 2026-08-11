import { describe, expect, it } from "vitest";
import {
  NAVIGATION_CONFIG,
  NavigationItemConfig,
  ROUTES,
  USER_ROLES,
} from "./index";

const visibleGroupsFor = (role: (typeof USER_ROLES)[keyof typeof USER_ROLES]) =>
  NAVIGATION_CONFIG.groups
    .filter((group) => group.roles.includes(role))
    .map((group) => ({
      label: group.label,
      order: group.order,
      items: group.items
        .filter((item) => item.roles.includes(role))
        .map((item) => item.label),
    }))
    .filter((group) => group.items.length > 0)
    .sort((left, right) => left.order - right.order);

describe("NAVIGATION_CONFIG", () => {
  it("shows administrative governance and teaching workflows to administrators", () => {
    const groups = visibleGroupsFor(USER_ROLES.ADMIN);

    expect(groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Academic" }),
        expect.objectContaining({ label: "Teaching" }),
        expect.objectContaining({ label: "Administration" }),
      ]),
    );
  });

  it("keeps the student navigation focused on personal academic work", () => {
    const groups = visibleGroupsFor(USER_ROLES.STUDENT);
    const groupLabels = groups.map((group) => group.label);
    const myAcademics = groups.find((group) => group.label === "My Academics");

    expect(groupLabels).toEqual([
      "My Academics",
      "Learning",
      "Communication",
      "My Account",
    ]);
    expect(groupLabels).not.toContain("Administration");
    expect(myAcademics?.items).toEqual(
      expect.arrayContaining(["My Classes", "Assignments", "Attendance", "Grades"]),
    );
  });

  it("assigns the academic-records route to exactly one administrator sidebar item", () => {
    const academicRecordItems = NAVIGATION_CONFIG.groups.reduce<NavigationItemConfig[]>(
      (items, group) => items.concat(group.items),
      [],
    ).filter((item) => item.roles.includes(USER_ROLES.ADMIN))
      .filter((item) => item.route === ROUTES.ACADEMIC_RECORDS);

    expect(academicRecordItems.map((item) => item.label)).toEqual(["Academic Records"]);
  });

  it("keeps availability out of global navigation", () => {
    const allLabels = NAVIGATION_CONFIG.groups.flatMap((group) =>
      group.items.map((item) => item.label),
    );

    expect(allLabels).not.toContain("Availability");
  });
});
