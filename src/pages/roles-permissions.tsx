import { ShieldCheck } from "lucide-react";
import { useGetIdentity } from "@refinedev/core";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ROLE_PERMISSION_GROUPS, ROLE_PERMISSION_MATRIX } from "@/constants";
import type { User } from "@/types";

const RolesPermissionsPage = () => {
  const { data: identity } = useGetIdentity<User>();
  if (identity?.role !== "admin") return <ListView><Breadcrumb /><h1 className="page-title">Roles & Permissions</h1><p className="text-muted-foreground">Role and permission management is available to administrators only.</p></ListView>;
  return <ListView><Breadcrumb /><div><h1 className="page-title">Roles & Permissions</h1><p className="text-muted-foreground">Review the access boundaries applied to each classroom role.</p></div><div className="grid gap-4 lg:grid-cols-3">{Object.entries(ROLE_PERMISSION_MATRIX).map(([role, definition]) => <Card key={role}><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" />{definition.label}</CardTitle></CardHeader><CardContent className="space-y-4">{ROLE_PERMISSION_GROUPS.map((group) => <div key={group.label} className="space-y-2"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{group.label}</span>{definition.grantedGroups.includes(group.label as never) && <Badge variant="secondary">Granted</Badge>}</div>{definition.grantedGroups.includes(group.label as never) && <p className="text-xs text-muted-foreground">{group.permissions.join(" • ")}</p>}</div>)}</CardContent></Card>)}</div></ListView>;
};

export default RolesPermissionsPage;

