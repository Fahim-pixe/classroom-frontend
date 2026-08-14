import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useSearchParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import type { User } from "@/types";
import { UI_TOKENS } from "@/constants";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const getInitials = (name = "") => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

const StudentsPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const debouncedSearchQuery = useDebouncedValue(
    searchQuery,
    UI_TOKENS.input.serverSearchDebounceMilliseconds,
  );
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      size: 220,
      header: () => <p className="column-title">Name</p>,
      cell: ({ row, getValue }) => {
        const name = getValue<string>();
        return <div className="flex items-center gap-3"><Avatar><AvatarImage src={row.original.image} alt={name} /><AvatarFallback>{getInitials(name)}</AvatarFallback></Avatar><span className="text-foreground">{name}</span></div>;
      },
    },
    { id: "email", accessorKey: "email", size: 240, header: () => <p className="column-title">Email</p>, cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span> },
    { id: "department", accessorKey: "department", size: 180, header: () => <p className="column-title">Department</p>, cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>() || "Not assigned"}</span> },
    { id: "role", accessorKey: "role", size: 120, header: () => <p className="column-title">Role</p>, cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge> },
    { id: "details", size: 120, header: () => <p className="column-title">Details</p>, cell: ({ row }) => <ShowButton resource="users" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton> },
  ], []);

  const filters = debouncedSearchQuery
    ? [{ field: "search", operator: "contains" as const, value: debouncedSearchQuery }]
    : [];
  const studentsTable = useTable<User>({
    columns,
    refineCoreProps: {
      resource: "users",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: [{ field: "role", operator: "eq" as const, value: "student" }, ...filters] },
      sorters: { initial: [{ field: "id", order: "desc" }] },
    },
  });

  return <ListView><Breadcrumb /><h1 className="page-title">Student Directory</h1><div className="intro-row"><p>Search student profiles and review their academic context.</p><div className="actions-row"><div className="search-field"><Search className="search-icon" /><Input type="text" placeholder="Search by name or email..." className="pl-10 w-full" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div></div></div><DataTable table={studentsTable} /></ListView>;
};

export default StudentsPage;

