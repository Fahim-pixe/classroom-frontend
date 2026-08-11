import React, { useMemo } from "react";
import { useGetIdentity, useLink, useRefineOptions } from "@refinedev/core";
import { useLocation } from "react-router";

import {
  SidebarRail as ShadcnSidebarRail,
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarHeader as ShadcnSidebarHeader,
  useSidebar as useShadcnSidebar,
  SidebarTrigger as ShadcnSidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NAVIGATION_CONFIG,
  type NavigationGroupConfig,
  type NavigationItemConfig,
  type NavigationRole,
} from "@/constants";
import type { User } from "@/types";

export function Sidebar() {
  const { open } = useShadcnSidebar();
  const { data: identity } = useGetIdentity<User>();
  const role = (identity?.role ?? NAVIGATION_CONFIG.defaultRole) as NavigationRole;

  const groups = useMemo(
    () =>
      NAVIGATION_CONFIG.groups
        .filter((group) => group.roles.includes(role))
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.roles.includes(role)),
        }))
        .filter((group) => group.items.length > 0),
    [role],
  );

  return (
    <ShadcnSidebar collapsible="icon" className={cn("border-none")}>
      <ShadcnSidebarRail />
      <SidebarHeader />
      <ShadcnSidebarContent
        className={cn(
          "transition-discrete",
          "duration-200",
          "flex",
          "flex-col",
          "gap-2",
          "pt-2",
          "pb-2",
          "border-r",
          "border-border",
          {
            "px-3": open,
            "px-1": !open,
          },
        )}
      >
        <NavigationLink item={NAVIGATION_CONFIG.dashboard} />
        {groups.map((group) => (
          <NavigationGroup key={group.id} group={group} />
        ))}
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

type NavigationGroupProps = {
  group: NavigationGroupConfig;
};

function NavigationGroup({ group }: NavigationGroupProps) {
  const { open } = useShadcnSidebar();

  return (
    <div className={cn("border-t", "border-sidebar-border", "pt-4")}>
      <span
        className={cn(
          "ml-3",
          "block",
          "text-xs",
          "font-semibold",
          "uppercase",
          "text-muted-foreground",
          "transition-all",
          "duration-200",
          {
            "h-8": open,
            "h-0": !open,
            "opacity-0": !open,
            "opacity-100": open,
            "pointer-events-none": !open,
            "pointer-events-auto": open,
          },
        )}
      >
        {group.label}
      </span>
      <div className={cn("flex", "flex-col")}>
        {group.items.map((item) => (
          <NavigationLink key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

type NavigationLinkProps = {
  item: NavigationItemConfig;
};

function NavigationLink({ item }: NavigationLinkProps) {
  const Link = useLink();
  const location = useLocation();
  const { open } = useShadcnSidebar();
  const Icon = item.icon;
  const isSelected = isActiveRoute(location.pathname, item);

  return (
    <Button
      asChild
      variant="ghost"
      size="lg"
      className={cn(
        "flex",
        "w-full",
        "items-center",
        "justify-start",
        "gap-2",
        "py-2",
        "!px-3",
        "text-sm",
        {
          "bg-sidebar-primary": isSelected,
          "hover:!bg-sidebar-primary/90": isSelected,
          "text-sidebar-primary-foreground": isSelected,
          "hover:text-sidebar-primary-foreground": isSelected,
        },
      )}
    >
      <Link
        to={item.route}
        aria-current={isSelected ? "page" : undefined}
        aria-label={!open ? item.label : undefined}
        className={cn("flex", "w-full", "items-center", "gap-2")}
      >
        <Icon
          className={cn("size-4", "shrink-0", {
            "text-sidebar-primary-foreground": isSelected,
            "text-muted-foreground": !isSelected,
          })}
          aria-hidden="true"
        />
        {open ? (
          <span
            className={cn({
              "font-normal": !isSelected,
              "font-semibold": isSelected,
              "text-sidebar-primary-foreground": isSelected,
              "text-foreground": !isSelected,
            })}
          >
            {item.label}
          </span>
        ) : (
          <span className="sr-only">{item.label}</span>
        )}
      </Link>
    </Button>
  );
}

function isActiveRoute(location: string, item: NavigationItemConfig) {
  const routes = item.activeRoutes ?? [item.route];

  return routes.some((route) =>
    route === "/"
      ? location === route
      : location === route || location.startsWith(`${route}/`),
  );
}

function SidebarHeader() {
  const { title } = useRefineOptions();
  const { open, isMobile, setOpen } = useShadcnSidebar();

  return (
    <ShadcnSidebarHeader
      className={cn(
        "p-0",
        "h-16",
        "border-b",
        "border-border",
        "flex-row",
        "items-center",
        "justify-between",
        "overflow-hidden",
      )}
    >
      <div
        onClick={() => {
          if (!isMobile) {
            setOpen(!open);
          }
        }}
        className={cn(
          "whitespace-nowrap",
          "flex",
          "flex-row",
          "h-full",
          "items-center",
          "justify-start",
          "gap-2",
          "transition-discrete",
          "duration-200",
          {
            "pl-3": !open,
            "pl-5": open,
            "cursor-pointer": !isMobile,
          },
        )}
      >
        <div>{title.icon}</div>
        <h2
          className={cn(
            "text-sm",
            "font-bold",
            "transition-opacity",
            "duration-200",
            {
              "opacity-0": !open,
              "opacity-100": open,
            },
          )}
        >
          {title.text}
        </h2>
      </div>

      <ShadcnSidebarTrigger
        className={cn("text-muted-foreground", "mr-1.5", {
          "opacity-0": !open,
          "opacity-100": open || isMobile,
          "pointer-events-auto": open || isMobile,
          "pointer-events-none": !open && !isMobile,
        })}
      />
    </ShadcnSidebarHeader>
  );
}

Sidebar.displayName = "Sidebar";
