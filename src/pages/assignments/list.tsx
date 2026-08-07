import { useGetIdentity, useList } from "@refinedev/core";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { Badge } from "@/components/ui/badge";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Assignment, ClassDetails, User } from "@/types";

const AssignmentsList = () => {
  const { data: user } = useGetIdentity<User>();
  const canModify = user?.role === "admin" || user?.role === "teacher";

  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    pagination: { mode: "off" }
  });
  const classes = classesQuery?.data?.data || [];

  // Default to the first available class
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const activeClassId = selectedClassId || (classes.length > 0 ? String(classes[0].id) : "");

  const assignmentColumns = useMemo<ColumnDef<Assignment>[]>(() => [
    {
      id: "title",
      accessorKey: "title",
      size: 250,
      header: () => <p className="column-title ml-2">Title</p>,
      cell: ({ getValue }) => <span className="font-medium text-foreground ml-2">{getValue<string>()}</span>,
    },
    {
      id: "dueAt",
      accessorKey: "dueAt",
      size: 200,
      header: () => <p className="column-title">Due Date</p>,
      cell: ({ getValue }) => {
        const date = getValue<string>();
        return date ? <Badge variant="secondary">{new Date(date).toLocaleString()}</Badge> : <span className="text-muted-foreground">No due date</span>;
      },
    },
    {
      id: "maxPoints",
      accessorKey: "maxPoints",
      size: 150,
      header: () => <p className="column-title">Max Points</p>,
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<number>()} pts</span>,
    },
    {
      id: "details",
      size: 140,
      header: () => <p className="column-title">Actions</p>,
      cell: ({ row }) => (
        <ShowButton resource="assignments" recordItemId={row.original.id} variant="outline" size="sm">
          Open
        </ShowButton>
      ),
    },
  ], []);

  const assignmentsTable = useTable<Assignment>({
    columns: assignmentColumns,
    refineCoreProps: {
      resource: "assignments",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: activeClassId ? [{ field: "classId", operator: "eq", value: activeClassId }] : [],
      },
      queryOptions: { enabled: !!activeClassId }
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Assignments</h1>
      <div className="intro-row">
        <p className="text-muted-foreground">Manage and track student assignments across your classes.</p>
        <div className="actions-row">
          <Select value={activeClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-70">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls: ClassDetails) => (
                <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canModify && <CreateButton resource="assignments" />}
        </div>
      </div>

      {activeClassId ? (
        <DataTable table={assignmentsTable} />
      ) : (
        <div className="p-10 border border-dashed border-border rounded-xl text-center">
          <p className="text-muted-foreground">You must be enrolled in or assigned to a class to view assignments.</p>
        </div>
      )}
    </ListView>
  );
};

export default AssignmentsList;
