import { useMemo } from "react";
import { useCustom } from "@refinedev/core";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { API_ENDPOINTS } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WeekEvent = {
  id: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string | null;
  classId: number;
  className: string;
  subjectName: string;
  subjectCode: string;
};

type WeekDay = {
  date: string;
  day: string;
  events: WeekEvent[];
};

type MyWeekPayload = {
  weekStart?: string;
  weekEnd?: string;
  days?: WeekDay[];
};

type CustomQueryResponse<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
};

const formatDate = (dateValue: string) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(`${dateValue}T00:00:00`)
  );

export default function MyWeekPage() {
  const { data: weekResponse, isLoading, isError } = useCustom({
    url: API_ENDPOINTS.MY_WEEK,
    method: "get",
    queryOptions: { retry: 1 },
  }) as unknown as CustomQueryResponse<MyWeekPayload & { data?: MyWeekPayload }>;

  const week = weekResponse?.data ?? weekResponse ?? {};
  const days = useMemo(() => (Array.isArray(week.days) ? week.days : []), [week.days]);
  const eventCount = useMemo(
    () => days.reduce((total, day) => total + day.events.length, 0),
    [days]
  );

  const dateRange = week.weekStart && week.weekEnd
    ? `${formatDate(week.weekStart)} – ${formatDate(week.weekEnd)}`
    : undefined;

  return (
    <main className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <Badge variant="secondary">Academic calendar</Badge>
          <h1 className="text-foreground">My Week</h1>
          <p className="text-muted-foreground">
            {dateRange ? `Your scheduled classes for ${dateRange}.` : "Your upcoming scheduled classes."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays aria-hidden="true" className="h-[var(--icon-size-inline)] w-[var(--icon-size-inline)]" />
          <span>{eventCount} scheduled class{eventCount === 1 ? "" : "es"}</span>
        </div>
      </section>

      {isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Loading your weekly schedule…</CardContent></Card>
      ) : isError ? (
        <Card><CardContent className="p-6 text-destructive">Your weekly schedule could not be loaded. Please refresh and try again.</CardContent></Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {days.map((day) => (
            <Card key={day.date}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{day.day}</CardTitle>
                <Badge variant="outline">{formatDate(day.date)}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.events.length > 0 ? day.events.map((event) => (
                  <article key={event.id} className="border-l-2 border-primary pl-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div className="space-y-1">
                        <p className="text-foreground">{event.subjectCode} · {event.className}</p>
                        <p className="text-muted-foreground">{event.subjectName}</p>
                      </div>
                      <Badge variant="secondary">{event.startTime} – {event.endTime}</Badge>
                    </div>
                    {event.room ? (
                      <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                        <MapPin aria-hidden="true" className="h-[var(--icon-size-inline)] w-[var(--icon-size-inline)]" />
                        {event.room}
                      </p>
                    ) : null}
                  </article>
                )) : (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 aria-hidden="true" className="h-[var(--icon-size-inline)] w-[var(--icon-size-inline)]" />
                    No scheduled classes.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
