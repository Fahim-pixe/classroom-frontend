"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PERFORMANCE_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import { Suspense, type PropsWithChildren } from "react";
import { useLocation } from "react-router";
import { PageLoadingFallback } from "./page-loading-fallback";
import { Sidebar } from "./sidebar";

export function Layout({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <SidebarProvider>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Sidebar />
        <SidebarInset>
          <Header />
          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "@container/main",
              "container",
              "mx-auto",
              "relative",
              "w-full",
              "min-w-0",
              "overflow-x-clip",
              "flex",
              "flex-col",
              "flex-1",
              "px-3",
              "pt-3",
              "sm:px-4",
              "sm:pt-4",
              "md:p-4",
              "lg:px-6",
              "lg:pt-6"
            )}
          >
            <div key={location.pathname} className="app-shell-content">
              <Suspense fallback={<PageLoadingFallback label={PERFORMANCE_CONFIG.routeLoadingLabel} />}>
                {children}
              </Suspense>
            </div>
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}

Layout.displayName = "Layout";
