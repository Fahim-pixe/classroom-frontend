"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PERFORMANCE_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import { Suspense, type PropsWithChildren } from "react";
import { PageLoadingFallback } from "./page-loading-fallback";
import { Sidebar } from "./sidebar";

export function Layout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <Header />
          <main
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
            <Suspense fallback={<PageLoadingFallback label={PERFORMANCE_CONFIG.routeLoadingLabel} />}>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}

Layout.displayName = "Layout";
