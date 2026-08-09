import { Monitor, Moon, Sun } from "lucide-react";
import { useGetIdentity } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { APP_CONFIG } from "@/constants";
import type { User } from "@/types";

const SettingsPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const { theme, setTheme } = useTheme();
  if (identity?.role !== "admin") return <ListView><Breadcrumb /><h1 className="page-title">Settings</h1><p className="text-muted-foreground">Application settings are available to administrators only.</p></ListView>;
  const options = [{ value: "light" as const, label: "Light", icon: Sun }, { value: "dark" as const, label: "Dark", icon: Moon }, { value: "system" as const, label: "System", icon: Monitor }];
  return <ListView><Breadcrumb /><div><h1 className="page-title">Settings</h1><p className="text-muted-foreground">Manage shared preferences for {APP_CONFIG.NAME}.</p></div><Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Choose how the application should display its interface.</p><div className="flex flex-wrap gap-2">{options.map(({ value, label, icon: Icon }) => <Button key={value} type="button" variant={theme === value ? "default" : "outline"} onClick={() => setTheme(value)}><Icon className="size-4" />{label}</Button>)}</div></CardContent></Card></ListView>;
};

export default SettingsPage;

