import { useGetIdentity, useList } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination";
import { ClassesListSkeleton } from "@/components/classes/classes-list-skeleton";
import { ClassesMobileList } from "@/components/classes/classes-mobile-list";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

import { Subject, User } from "@/types";
import { API_ENDPOINTS, ROUTES } from "@/constants";
import { getRoutePrefetchedData } from "@/lib/route-data-preload";

type ClassListItem = {
  id: number;
  name: string;
  status: "active" | "inactive" | "archived";
  bannerUrl?: string;
  subject?: {
    name: string;
  };
  teacher?: {
    name: string;
  };
  capacity: number;
};

const ClassesList = () => {
  const { data: user } = useGetIdentity<User>();
  const queryClient = useQueryClient();
  const prefetchedClasses = getRoutePrefetchedData<{ data: ClassListItem[]; total: number }>(queryClient, ROUTES.CLASSES.LIST);
  const canModify = user?.role === "admin" || user?.role === "teacher";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

  const classColumns = useMemo<ColumnDef<ClassListItem>[]>(
    () => [
      {
        id: "banner",
        accessorKey: "bannerUrl",
        size: 120,
        header: () => <p className="column-title ml-2">Banner</p>,
        cell: ({ getValue }) => {
          const bannerUrl = getValue<string>();

          return bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Class banner"
              className="ml-2 h-10 w-10 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-muted-foreground ml-2">No image</span>
          );
        },
      },
      {
        id: "name",
        accessorKey: "name",
        size: 220,
        header: () => <p className="column-title">Class Name</p>,
        cell: ({ getValue }) => {
          const className = getValue<string>();

          return <span className="text-foreground">{className}</span>;
        },
      },
      {
        id: "status",
        accessorKey: "status",
        size: 140,
        header: () => <p className="column-title">Status</p>,
        cell: ({ getValue }) => {
          const status = getValue<"active" | "inactive" | "archived">();
          const variant = status === "active" ? "default" : "secondary";

          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        id: "subject",
        accessorKey: "subject.name",
        size: 200,
        header: () => <p className="column-title">Subject</p>,
        cell: ({ getValue }) => {
          const subjectName = getValue<string>();

          return subjectName ? (
            <Badge variant="secondary">{subjectName}</Badge>
          ) : (
            <span className="text-muted-foreground">Not set</span>
          );
        },
      },
      {
        id: "teacher",
        accessorKey: "teacher.name",
        size: 200,
        header: () => <p className="column-title">Teacher</p>,
        cell: ({ getValue }) => {
          const teacherName = getValue<string>();

          return teacherName ? (
            <span className="text-foreground">{teacherName}</span>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          );
        },
      },
      {
        id: "capacity",
        accessorKey: "capacity",
        size: 120,
        header: () => <p className="column-title">Capacity</p>,
        cell: ({ getValue }) => {
          const capacity = getValue<number>();

          return <span className="text-foreground">{capacity}</span>;
        },
      },
      {
        id: "details",
        size: 140,
        header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => (
          <ShowButton
            resource={API_ENDPOINTS.CLASSES.LIST}
            recordItemId={row.original.id}
            variant="outline"
            size="sm"
          >
            View
          </ShowButton>
        ),
      },
      {
        id: "actions",
        size: 200,
        header: () => <p className="column-title text-right">Actions</p>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <ShowButton
              resource={API_ENDPOINTS.CLASSES.LIST}
              recordItemId={row.original.id}
              variant="outline"
              size="sm"
            >
              View
            </ShowButton>

            {canModify && (
              <>
                <EditButton
                  resource={API_ENDPOINTS.CLASSES.LIST}
                  recordItemId={row.original.id}
                  variant="outline"
                  size="sm"
                />
                <DeleteButton
                  resource={API_ENDPOINTS.CLASSES.LIST}
                  recordItemId={row.original.id}
                  size="sm"
                />
              </>
            )}
          </div>
        ),
      },
    ],
    [canModify]
  );

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: {
      pageSize: 100,
    },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
    ],
    pagination: {
      pageSize: 100,
    },
  });

  const subjects = subjectsQuery.data?.data || [];
  const teachers = teachersQuery.data?.data || [];

  const subjectFilters =
    selectedSubject === "all"
      ? []
      : [
          {
            field: "subject",
            operator: "eq" as const,
            value: selectedSubject,
          },
        ];

  const teacherFilters =
    selectedTeacher === "all"
      ? []
      : [
          {
            field: "teacher",
            operator: "eq" as const,
            value: selectedTeacher,
          },
        ];

  const searchFilters = searchQuery
    ? [
        {
          field: "name",
          operator: "contains" as const,
          value: searchQuery,
        },
      ]
    : [];

  const classesTable = useTable<ClassListItem>({
    columns: classColumns,
    refineCoreProps: {
      resource: API_ENDPOINTS.CLASSES.LIST,
      queryOptions: {
        initialData: prefetchedClasses,
      },
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: [...subjectFilters, ...teacherFilters, ...searchFilters],
      },
      sorters: {
        initial: [
          {
            field: "id",
            order: "desc",
          },
        ],
      },
    },
  });

  const {
    tableQuery,
    currentPage,
    setCurrentPage,
    pageCount,
    pageSize,
    setPageSize,
  } = classesTable.refineCore;
  const classItems = tableQuery.data?.data ?? [];

  return (
    <ListView className="gap-5">
      <Breadcrumb />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quick access to essential metrics and management tools.</p>
        </div>
        {canModify && <CreateButton resource={API_ENDPOINTS.CLASSES.LIST} className="min-h-11 w-full sm:w-auto" />}
      </div>

      <section className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="search-field w-full">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by name..."
              className="h-11 w-full pl-10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Filter by teacher" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.name}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {tableQuery.isLoading ? (
        <ClassesListSkeleton />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTable table={classesTable} />
          </div>
          <div className="space-y-4 md:hidden">
            <ClassesMobileList classes={classItems} canModify={canModify} />
            {classItems.length > 0 && (
              <DataTablePagination
                currentPage={currentPage}
                pageCount={pageCount}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                total={tableQuery.data?.total}
              />
            )}
          </div>
        </>
      )}
    </ListView>
  );
};

export default ClassesList;