import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useGetIdentity } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";

const getInitials = (name = "") => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

const AdminUsersPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const [search, setSearch] = useState("");
  const columns = useMemo<ColumnDef<User>[]>(() => [
    { id: "name", accessorKey: "name", header: () => <p className="column-title">Name</p>, cell: ({ row, getValue }) => { const name = getValue<string>(); return <div className="flex items-center gap-3"><Avatar><AvatarImage src={row.original.image} alt={name} /><AvatarFallback>{getInitials(name)}</AvatarFallback></Avatar><span className="text-foreground">{name}</span></div>; } },
    { id: "email", accessorKey: "email", header: () => <p className="column-title">Email</p>, cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span> },
    { id: "role", accessorKey: "role", header: () => <p className="column-title">Role</p>, cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge> },
    { id: "details", header: () => <p className="column-title">Details</p>, cell: ({ row }) => <ShowButton resource="users" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton> },
  ], []);
  const table = useTable<User>({ columns, refineCoreProps: { resource: "users", pagination: { pageSize: 15, mode: "server" }, filters: { permanent: search ? [{ field: "search", operator: "contains" as const, value: search }] : [] }, sorters: { initial: [{ field: "id", order: "desc" }] } } });
  if (identity?.role !== "admin") return <ListView><Breadcrumb /><h1 className="page-title">Users</h1><p className="text-muted-foreground">User administration is available to administrators only.</p></ListView>;
  return <ListView><Breadcrumb /><h1 className="page-title">Users</h1><div className="intro-row"><p>Review registered users and their access roles.</p><div className="actions-row"><div className="search-field"><Search className="search-icon" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email..." className="pl-10 w-full" /></div></div></div><DataTable table={table} /></ListView>;
};

export default AdminUsersPage;

