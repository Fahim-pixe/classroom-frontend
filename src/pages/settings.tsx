import { useGetIdentity } from "@refinedev/core";
import { Monitor, Moon, Sun } from "lucide-react";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/constants";
import type { User } from "@/types";

const appearanceOptions = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

const SettingsPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const { theme, setTheme } = useTheme();

  if (identity?.role !== "admin") {
    return (
      <ListView>
        <Breadcrumb />
        <section className="space-y-2">
          <h1 className="page-title">Settings</h1>
          <p className="text-muted-foreground">Application settings are available to administrators only.</p>
        </section>
      </ListView>
    );
  }

  return (
    <ListView>
      <Breadcrumb />
      <section className="space-y-2">
        <h1 className="page-title">Settings</h1>
        <p className="text-muted-foreground">Manage shared preferences for {APP_CONFIG.NAME}.</p>
      </section>

      <Card className="mt-1">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <p className="mb-4 text-sm text-muted-foreground">Choose how the application should display its interface.</p>
          <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Appearance preference">
            {appearanceOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                className="w-full justify-start sm:justify-center"
                variant={theme === value ? "default" : "outline"}
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
              >
                <Icon className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </ListView>
  );
};

export default SettingsPage;
