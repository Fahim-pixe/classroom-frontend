import {
  useRefineOptions,
  useActiveAuthProvider,
  useLogout,
  useGo,
} from "@refinedev/core";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOutIcon, UserCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAVIGATION_CONFIG, ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { isMobile } = useSidebar();

  return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function DesktopHeader() {
  return (
    <header
      className={cn(
        "app-header",
        "sticky",
        "top-0",
        "flex",
        "h-16",
        "shrink-0",
        "items-center",
        "gap-4",
        "border-b",
        "border-border",
        "bg-sidebar/90",
        "pr-3",
        "justify-end",
        "z-40"
      )}
    >
      <ThemeToggle />
      <UserDropdown />
    </header>
  );
}

function MobileHeader() {
  const { title } = useRefineOptions();
  const { open } = useSidebar();

  return (
    <header
      className={cn(
        "app-header",
        "sticky",
        "top-0",
        "flex",
        "h-12",
        "shrink-0",
        "items-center",
        "gap-2",
        "border-b",
        "border-border",
        "bg-sidebar/90",
        "pr-3",
        "justify-between",
        "z-40"
      )}
    >
      <SidebarTrigger className={cn("ml-1", "size-11", "text-muted-foreground", "rotate-180")} />

      <div
        className={cn(
            "min-w-0",
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
          }
        )}
      >
        <div>{title.icon}</div>
        <h2 className={cn("truncate", "text-sm", "font-bold")}>

          {title.text}
        </h2>
      </div>

      <ThemeToggle className={cn("h-11", "w-11")} />
    </header>
  );
}

const UserDropdown = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const go = useGo();

  const authProvider = useActiveAuthProvider();

  if (!authProvider?.getIdentity) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={NAVIGATION_CONFIG.copy.accountMenuLabel}>
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            go({ to: ROUTES.PROFILE });
          }}
        >
          <UserCircleIcon />
          <span>{NAVIGATION_CONFIG.copy.profileLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            logout();
          }}
        >
          <LogOutIcon
            className={cn("text-destructive", "hover:text-destructive")}
          />
          <span className={cn("text-destructive", "hover:text-destructive")}>
            {isLoggingOut ? NAVIGATION_CONFIG.copy.logoutPendingLabel : NAVIGATION_CONFIG.copy.logoutLabel}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Header.displayName = "Header";
MobileHeader.displayName = "MobileHeader";
DesktopHeader.displayName = "DesktopHeader";
