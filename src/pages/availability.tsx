import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { useGetIdentity, useList } from "@refinedev/core";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClassDetails, User } from "@/types";

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AvailabilityPage = () => {
  const { data: user } = useGetIdentity<User>();
  const { query } = useList<ClassDetails>({ resource: "classes", pagination: { mode: "off" } });
  const classes = query.data?.data ?? [];
  const visibleClasses = useMemo(() => classes.filter((item) => user?.role === "admin" || item.teacher?.id === user?.id), [classes, user?.id, user?.role]);
  const slots = useMemo(() => visibleClasses.flatMap((item) => item.schedules.map((schedule) => ({ ...schedule, className: item.name, courseCode: item.courseCode }))).sort((left, right) => dayOrder.indexOf(left.day) - dayOrder.indexOf(right.day) || left.startTime.localeCompare(right.startTime)), [visibleClasses]);
  return <ListView><Breadcrumb /><div><h1 className="page-title">Faculty Availability</h1><p className="text-muted-foreground">Review scheduled teaching commitments and available timetable gaps.</p></div>{slots.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No scheduled classes are available for your account yet.</CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{slots.map((slot, index) => <Card key={`${slot.className}-${slot.day}-${slot.startTime}-${index}`}><CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="size-4 text-primary" />{slot.day}</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex items-center justify-between gap-3"><span className="font-medium">{slot.className}</span><Badge variant="secondary">{slot.courseCode}</Badge></div><p className="text-sm text-muted-foreground">{slot.startTime} – {slot.endTime}</p></CardContent></Card>)}</div>}</ListView>;
};

export default AvailabilityPage;

