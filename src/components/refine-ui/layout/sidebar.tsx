import { useCallback, useEffect, useMemo, useState } from "react";
import { useDataProvider, useGetIdentity, useLink, useRefineOptions } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
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
import { preloadRoute } from "@/lib/route-preload";
import { preloadRouteData } from "@/lib/route-data-preload";
import {
  NAVIGATION_CONFIG,
  type NavigationGroupConfig,
  type NavigationItemConfig,
  type NavigationRole,
} from "@/constants";
import type { User } from "@/types";

export function Sidebar() {
  const { open, isMobile, setOpenMobile } = useShadcnSidebar();
  const location = useLocation();
  const dataProvider = useDataProvider()();
  const queryClient = useQueryClient();
  const { data: identity } = useGetIdentity<User>();
  const role = (identity?.role ?? NAVIGATION_CONFIG.defaultRole) as NavigationRole;
  const [pendingRoute, setPendingRoute] = useState<string>();

  useEffect(() => {
    setPendingRoute(undefined);
  }, [location.pathname]);

  const handleRouteIntent = useCallback((route: string) => {
    preloadRoute(route);
    preloadRouteData(route, { dataProvider, queryClient });
  }, [dataProvider, queryClient]);

  const handleNavigation = useCallback((route: string) => {
    handleRouteIntent(route);
    setPendingRoute(route);

    if (isMobile) {
      setOpenMobile(false);
    }
  }, [handleRouteIntent, isMobile, setOpenMobile]);

  const groups = useMemo(
    () =>
      NAVIGATION_CONFIG.groups
        .filter((group) => group.roles.includes(role))
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.roles.includes(role)),
        }))
        .filter((group) => group.items.length > 0)
        .sort((left, right) => left.order - right.order),
    [role],
  );

  return (
    <ShadcnSidebar collapsible="icon" className={cn("border-none", "sidebar-shell")}>
      <ShadcnSidebarRail />
      <SidebarHeader />
      <ShadcnSidebarContent
        className={cn(
          "transition-discrete",
          "duration-(--motion-duration-standard)",
          "flex",
          "flex-col",
          "gap-2",
          "pt-2",
          "pb-2",
          "border-r",
          "border-sidebar-border/70",
          {
            "px-3": open,
            "px-1": !open,
          },
        )}
      >
        <NavigationLink
          item={NAVIGATION_CONFIG.dashboard}
          pendingRoute={pendingRoute}
          onNavigate={handleNavigation}
          onRouteIntent={handleRouteIntent}
        />
        {groups.map((group) => (
          <NavigationGroup
            key={group.id}
            group={group}
            pendingRoute={pendingRoute}
            onNavigate={handleNavigation}
            onRouteIntent={handleRouteIntent}
          />
        ))}
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

type NavigationGroupProps = {
  group: NavigationGroupConfig;
  pendingRoute?: string;
  onNavigate: (route: string) => void;
  onRouteIntent: (route: string) => void;
};

function NavigationGroup({ group, pendingRoute, onNavigate, onRouteIntent }: NavigationGroupProps) {
  const { open } = useShadcnSidebar();

  return (
    <div className={cn("border-t", "border-sidebar-border/70", "pt-3", "first:border-t-0", "first:pt-1")}>
      <span
        className={cn(
          "ml-3",
          "block",
          "text-xs",
          "font-semibold",
          "uppercase",
          "text-muted-foreground",
          "transition-all",
          "duration-(--motion-duration-standard)",
          "ease-[var(--motion-ease-out)]",
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
          <NavigationLink
            key={item.id}
            item={item}
            pendingRoute={pendingRoute}
            onNavigate={onNavigate}
            onRouteIntent={onRouteIntent}
          />
        ))}
      </div>
    </div>
  );
}

type NavigationLinkProps = {
  item: NavigationItemConfig;
  pendingRoute?: string;
  onNavigate: (route: string) => void;
  onRouteIntent: (route: string) => void;
};

function NavigationLink({ item, pendingRoute, onNavigate, onRouteIntent }: NavigationLinkProps) {
  const Link = useLink();
  const location = useLocation();
  const { open } = useShadcnSidebar();
  const Icon = item.icon;
  const isSelected = pendingRoute === item.route || isActiveRoute(location.pathname, item);

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
        "min-h-11",
        "py-2.5",
        "!px-3",
        "md:min-h-10",
        "md:py-2",
        "text-sm",
        "rounded-[var(--radius-control)]",
        "transition-[background-color,color,box-shadow,transform]",
        "duration-(--motion-duration-fast)",
        "ease-[var(--motion-ease-out)]",
        {
          "bg-sidebar-primary": isSelected,
          "hover:!bg-sidebar-primary/90": isSelected,
          "shadow-sm": isSelected,
          "text-sidebar-primary-foreground": isSelected,
          "hover:text-sidebar-primary-foreground": isSelected,
        },
      )}
    >
      <Link
        to={item.route}
        onPointerEnter={() => onRouteIntent(item.route)}
        onPointerDown={() => onRouteIntent(item.route)}
        onFocus={() => onRouteIntent(item.route)}
        onClick={() => onNavigate(item.route)}
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
        role={isMobile ? undefined : "button"}
        tabIndex={isMobile ? undefined : 0}
        aria-expanded={isMobile ? undefined : open}
        aria-label={
          isMobile
            ? undefined
            : open
              ? NAVIGATION_CONFIG.copy.collapseLabel
              : NAVIGATION_CONFIG.copy.expandLabel
        }
        onClick={() => {
          if (!isMobile) {
            setOpen(!open);
          }
        }}
        onKeyDown={(event) => {
          if (!isMobile && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
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
          "duration-(--motion-duration-standard)",
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
            "duration-(--motion-duration-standard)",
            "ease-[var(--motion-ease-out)]",
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
