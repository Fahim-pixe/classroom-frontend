import { useMemo, useState } from "react";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_ENDPOINTS, CALENDAR_WORKFLOW_CONFIG, USER_ROLES } from "@/constants";
import { useMutationFeedback } from "@/hooks/use-mutation-feedback";
import type {
  CalendarClassOption,
  CalendarEvent,
  CalendarEventType,
  CalendarPayload,
  User,
} from "@/types";

type CalendarEditorDraft = {
  id?: number;
  classId: string;
  title: string;
  description: string;
  type: CalendarEventType;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  recurrence: "none" | "weekly" | "monthly";
};

const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(CALENDAR_WORKFLOW_CONFIG.format.locale, options).format(date);

const startOfWeek = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const offset = (normalized.getDay() - CALENDAR_WORKFLOW_CONFIG.weekStartsOn + CALENDAR_WORKFLOW_CONFIG.daysPerWeek) % CALENDAR_WORKFLOW_CONFIG.daysPerWeek;
  normalized.setDate(normalized.getDate() - offset);
  return normalized;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDateTimeInput = (value: string) => {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
};

const initialDraft = (): CalendarEditorDraft => {
  const currentTime = new Date().toISOString().slice(0, 16);
  return {
    classId: CALENDAR_WORKFLOW_CONFIG.globalClassValue,
    title: "",
    description: "",
    type: CALENDAR_WORKFLOW_CONFIG.defaultEventType,
    startAt: currentTime,
    endAt: currentTime,
    isAllDay: false,
    recurrence: CALENDAR_WORKFLOW_CONFIG.defaultRecurrence,
  };
};

const draftFromEvent = (event: CalendarEvent): CalendarEditorDraft => ({
  id: event.sourceEventId,
  classId: event.classId ? String(event.classId) : CALENDAR_WORKFLOW_CONFIG.globalClassValue,
  title: event.title,
  description: event.description ?? "",
  type: event.type,
  startAt: toDateTimeInput(event.startAt),
  endAt: toDateTimeInput(event.endAt),
  isAllDay: event.isAllDay,
  recurrence: event.recurrence,
});

const eventTime = (event: CalendarEvent) => {
  if (event.isAllDay) return CALENDAR_WORKFLOW_CONFIG.labels.allDay;
  if (event.type === "assignment_due") return `${CALENDAR_WORKFLOW_CONFIG.labels.due} ${format(new Date(event.startAt), CALENDAR_WORKFLOW_CONFIG.format.eventDateTime)}`;
  return `${format(new Date(event.startAt), CALENDAR_WORKFLOW_CONFIG.format.eventTime)} – ${format(new Date(event.endAt), CALENDAR_WORKFLOW_CONFIG.format.eventTime)}`;
};

export default function CalendarPage() {
  const { data: identity } = useGetIdentity<User>();
  const { execute } = useMutationFeedback();
  const [view, setView] = useState<"month" | "week">(CALENDAR_WORKFLOW_CONFIG.defaultView);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [editorDraft, setEditorDraft] = useState<CalendarEditorDraft | null>(null);

  const range = useMemo(() => {
    const anchor = new Date(anchorDate);
    let start: Date;
    let end: Date;
    if (view === CALENDAR_WORKFLOW_CONFIG.views.month) {
      const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      start = startOfWeek(firstOfMonth);
      end = new Date(start);
      end.setDate(start.getDate() + CALENDAR_WORKFLOW_CONFIG.monthWeekCount * CALENDAR_WORKFLOW_CONFIG.daysPerWeek - 1);
    } else {
      start = startOfWeek(anchor);
      end = new Date(start);
      end.setDate(start.getDate() + CALENDAR_WORKFLOW_CONFIG.daysPerWeek - 1);
    }
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [anchorDate, view]);

  const calendarUrl = API_ENDPOINTS.CALENDAR.LIST_WITH_RANGE(range.start.toISOString(), range.end.toISOString());
  const { query: calendarQuery } = useCustom<CalendarPayload>({
    url: calendarUrl,
    method: "get",
    queryOptions: { retry: 1 },
  });
  const { query: classQuery } = useCustom<CalendarClassOption[]>({
    url: API_ENDPOINTS.CALENDAR.CLASSES,
    method: "get",
    queryOptions: { retry: 1 },
  });
  const { mutateAsync: mutateCalendar, mutation: calendarMutation } = useCustomMutation();

  const calendar = calendarQuery.data?.data;
  const events: CalendarEvent[] = calendar?.events ?? [];
  const accessibleClasses: CalendarClassOption[] = classQuery.data?.data ?? [];
  const isLoading = calendarQuery.isLoading;
  const isError = calendarQuery.isError;
  const refetch = calendarQuery.refetch;
  const canCreate = identity?.role === USER_ROLES.ADMIN || identity?.role === USER_ROLES.TEACHER;
  const availableEventTypes = useMemo(
    () => identity?.role ? CALENDAR_WORKFLOW_CONFIG.createTypeByRole[identity.role] : [],
    [identity?.role],
  ) as readonly CalendarEventType[];

  const visibleDates = useMemo(() => {
    const cellCount = view === CALENDAR_WORKFLOW_CONFIG.views.month
      ? CALENDAR_WORKFLOW_CONFIG.monthWeekCount * CALENDAR_WORKFLOW_CONFIG.daysPerWeek
      : CALENDAR_WORKFLOW_CONFIG.daysPerWeek;
    return Array.from({ length: cellCount }, (_, index) => {
      const date = new Date(range.start);
      date.setDate(range.start.getDate() + index);
      return date;
    });
  }, [range.start, view]);

  const eventsByDate = useMemo(() => events.reduce<Map<string, CalendarEvent[]>>((eventMap, event) => {
    const dateKey = toDateKey(new Date(event.startAt));
    eventMap.set(dateKey, [...(eventMap.get(dateKey) ?? []), event]);
    return eventMap;
  }, new Map()), [events]);

  const setDraft = <Key extends keyof CalendarEditorDraft>(key: Key, value: CalendarEditorDraft[Key]) => {
    setEditorDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const shiftPeriod = (direction: number) => {
    setAnchorDate((current) => {
      const next = new Date(current);
      if (view === CALENDAR_WORKFLOW_CONFIG.views.month) next.setMonth(next.getMonth() + direction);
      else next.setDate(next.getDate() + direction * CALENDAR_WORKFLOW_CONFIG.daysPerWeek);
      return next;
    });
  };

  const saveEvent = async () => {
    if (!editorDraft) return;
    if (identity?.role === USER_ROLES.TEACHER && editorDraft.classId === CALENDAR_WORKFLOW_CONFIG.globalClassValue) {
      throw new Error(CALENDAR_WORKFLOW_CONFIG.labels.classRequired);
    }

    const values = {
      classId: editorDraft.classId === CALENDAR_WORKFLOW_CONFIG.globalClassValue ? null : Number(editorDraft.classId),
      title: editorDraft.title.trim(),
      description: editorDraft.description.trim(),
      type: editorDraft.type,
      startAt: new Date(editorDraft.startAt).toISOString(),
      endAt: new Date(editorDraft.endAt).toISOString(),
      isAllDay: editorDraft.isAllDay,
      recurrence: editorDraft.recurrence,
    };
    const isUpdate = Boolean(editorDraft.id);
    await execute({
      action: () => mutateCalendar({
        url: isUpdate && editorDraft.id ? API_ENDPOINTS.CALENDAR.EVENT_BY_ID(editorDraft.id) : API_ENDPOINTS.CALENDAR.LIST,
        method: isUpdate ? "put" : "post",
        values,
      }),
      labels: {
        pending: isUpdate ? CALENDAR_WORKFLOW_CONFIG.labels.eventUpdatePending : CALENDAR_WORKFLOW_CONFIG.labels.eventCreatePending,
        success: isUpdate ? CALENDAR_WORKFLOW_CONFIG.labels.eventUpdateSuccess : CALENDAR_WORKFLOW_CONFIG.labels.eventCreateSuccess,
        error: isUpdate ? CALENDAR_WORKFLOW_CONFIG.labels.eventUpdateError : CALENDAR_WORKFLOW_CONFIG.labels.eventCreateError,
        errorDescription: CALENDAR_WORKFLOW_CONFIG.labels.errorDescription,
      },
      onSuccess: async () => {
        setEditorDraft(null);
        await refetch();
      },
    });
  };

  const deleteEvent = async (event: CalendarEvent) => {
    const eventId = event.sourceEventId;
    if (!eventId) return;
    await execute({
      action: () => mutateCalendar({ url: API_ENDPOINTS.CALENDAR.EVENT_BY_ID(eventId), method: "delete", values: {} }),
      labels: {
        pending: CALENDAR_WORKFLOW_CONFIG.labels.eventDeletePending,
        success: CALENDAR_WORKFLOW_CONFIG.labels.eventDeleteSuccess,
        error: CALENDAR_WORKFLOW_CONFIG.labels.eventDeleteError,
        errorDescription: CALENDAR_WORKFLOW_CONFIG.labels.errorDescription,
      },
      onSuccess: async () => {
        setEditorDraft(null);
        await refetch();
      },
    });
  };

  const periodLabel = view === CALENDAR_WORKFLOW_CONFIG.views.month
    ? format(anchorDate, CALENDAR_WORKFLOW_CONFIG.format.month)
    : `${format(range.start, CALENDAR_WORKFLOW_CONFIG.format.eventDateTime)} – ${format(range.end, CALENDAR_WORKFLOW_CONFIG.format.eventDateTime)}`;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CalendarDays aria-hidden="true" className="h-[var(--icon-size-inline)] w-[var(--icon-size-inline)]" />
            <span>{CALENDAR_WORKFLOW_CONFIG.labels.title}</span>
          </div>
          <h1 className="page-title">{CALENDAR_WORKFLOW_CONFIG.labels.title}</h1>
          <p className="text-muted-foreground">{CALENDAR_WORKFLOW_CONFIG.labels.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setAnchorDate(new Date())}>{CALENDAR_WORKFLOW_CONFIG.labels.today}</Button>
          {canCreate ? <Button type="button" onClick={() => setEditorDraft(initialDraft())}><Plus aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" />{CALENDAR_WORKFLOW_CONFIG.labels.createEvent}</Button> : null}
        </div>
      </section>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-2 md:justify-start">
            <Button type="button" variant="outline" size="icon" aria-label={CALENDAR_WORKFLOW_CONFIG.labels.previous} onClick={() => shiftPeriod(-1)}><ChevronLeft aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" /></Button>
            <p className="text-foreground">{periodLabel}</p>
            <Button type="button" variant="outline" size="icon" aria-label={CALENDAR_WORKFLOW_CONFIG.labels.next} onClick={() => shiftPeriod(1)}><ChevronRight aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" /></Button>
          </div>
          <div className="flex gap-2" aria-label={CALENDAR_WORKFLOW_CONFIG.labels.title}>
            <Button type="button" size="sm" variant={view === CALENDAR_WORKFLOW_CONFIG.views.month ? "default" : "outline"} onClick={() => setView(CALENDAR_WORKFLOW_CONFIG.views.month)}>{CALENDAR_WORKFLOW_CONFIG.labels.month}</Button>
            <Button type="button" size="sm" variant={view === CALENDAR_WORKFLOW_CONFIG.views.week ? "default" : "outline"} onClick={() => setView(CALENDAR_WORKFLOW_CONFIG.views.week)}>{CALENDAR_WORKFLOW_CONFIG.labels.week}</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? <Card><CardContent className="py-8 text-muted-foreground">{CALENDAR_WORKFLOW_CONFIG.labels.loading}</CardContent></Card> : null}
      {isError ? <Card><CardContent className="py-8 text-destructive">{CALENDAR_WORKFLOW_CONFIG.labels.loadError}</CardContent></Card> : null}
      {!isLoading && !isError ? <section className="overflow-x-auto" aria-label={CALENDAR_WORKFLOW_CONFIG.labels.title}>
        <div className="min-w-[48rem] overflow-hidden border border-border">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {Array.from({ length: CALENDAR_WORKFLOW_CONFIG.daysPerWeek }, (_, index) => {
              const date = new Date(range.start);
              date.setDate(range.start.getDate() + index);
              return <div key={index} className="p-3 text-center text-muted-foreground">{format(date, CALENDAR_WORKFLOW_CONFIG.format.weekday)}</div>;
            })}
          </div>
          <div className="grid grid-cols-7">
            {visibleDates.map((date) => {
              const dateKey = toDateKey(date);
              const dayEvents = eventsByDate.get(dateKey) ?? [];
              const isCurrentMonth = date.getMonth() === anchorDate.getMonth();
              return <article key={dateKey} className={`min-h-36 border-b border-r border-border p-2 ${isCurrentMonth || view === CALENDAR_WORKFLOW_CONFIG.views.week ? "" : "bg-muted/30"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{format(date, CALENDAR_WORKFLOW_CONFIG.format.date)}</span>
                  {dayEvents.length ? <Badge variant="secondary">{dayEvents.length}</Badge> : null}
                </div>
                <div className="space-y-2">
                  {dayEvents.map((event) => <button type="button" key={event.id} onClick={() => event.canManage ? setEditorDraft(draftFromEvent(event)) : undefined} disabled={!event.canManage} className="block w-full border-l-2 border-primary bg-primary/5 px-2 py-1 text-left text-foreground enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-ring">
                    <span className="block truncate">{event.title}</span>
                    <span className="block truncate text-muted-foreground">{eventTime(event)}</span>
                  </button>)}
                </div>
              </article>;
            })}
          </div>
        </div>
        {!events.length ? <p className="mt-4 flex items-center gap-2 text-muted-foreground"><Clock3 aria-hidden="true" className="h-[var(--icon-size-inline)] w-[var(--icon-size-inline)]" />{CALENDAR_WORKFLOW_CONFIG.labels.empty}</p> : null}
      </section> : null}

      {editorDraft ? <Card>
        <CardHeader>
          <CardTitle>{editorDraft.id ? CALENDAR_WORKFLOW_CONFIG.labels.editEvent : CALENDAR_WORKFLOW_CONFIG.labels.createEvent}</CardTitle>
          <CardDescription>{CALENDAR_WORKFLOW_CONFIG.labels.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-foreground"><span>{CALENDAR_WORKFLOW_CONFIG.labels.eventTitle}</span><Input value={editorDraft.title} maxLength={200} onChange={(event) => setDraft("title", event.target.value)} /></label>
          <label className="grid gap-2 text-foreground"><span>{CALENDAR_WORKFLOW_CONFIG.labels.eventType}</span><Select value={editorDraft.type} onValueChange={(value) => setDraft("type", value as CalendarEventType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{availableEventTypes.map((type) => <SelectItem key={type} value={type}>{CALENDAR_WORKFLOW_CONFIG.eventTypes[type].label}</SelectItem>)}</SelectContent></Select></label>
          <label className="grid gap-2 text-foreground"><span>{CALENDAR_WORKFLOW_CONFIG.labels.eventClass}</span><Select value={editorDraft.classId} onValueChange={(value) => setDraft("classId", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{identity?.role === USER_ROLES.ADMIN ? <SelectItem value={CALENDAR_WORKFLOW_CONFIG.globalClassValue}>{CALENDAR_WORKFLOW_CONFIG.labels.globalEvent}</SelectItem> : null}{accessibleClasses.map((classOption) => <SelectItem key={classOption.id} value={String(classOption.id)}>{classOption.subjectCode} · {classOption.name}</SelectItem>)}</SelectContent></Select></label>
          <label className="grid gap-2 text-foreground"><span>{CALENDAR_WORKFLOW_CONFIG.labels.recurrence}</span><Select value={editorDraft.recurrence} onValueChange={(value) => setDraft("recurrence", value as CalendarEditorDraft["recurrence"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CALENDAR_WORKFLOW_CONFIG.recurrenceValues.map((recurrence) => <SelectItem key={recurrence} value={recurrence}>{CALENDAR_WORKFLOW_CONFIG.labels[`recurrence${recurrence.charAt(0).toUpperCase()}${recurrence.slice(1)}` as "recurrenceNone" | "recurrenceWeekly" | "recurrenceMonthly"]}</SelectItem>)}</SelectContent></Select></label>
          <label className="grid gap-2 text-foreground"><span>{CALENDAR_WORKFLOW_CONFIG.labels.startAt}</span><Input type="datetime-local" value={editorDraft.startAt} onChange={(event) => setDraft("startAt", event.target.value)} /></label>
          <label className="grid gap-2 text-foreground"><span>{CALENDAR_WORKFLOW_CONFIG.labels.endAt}</span><Input type="datetime-local" value={editorDraft.endAt} onChange={(event) => setDraft("endAt", event.target.value)} /></label>
          <label className="grid gap-2 text-foreground md:col-span-2"><span>{CALENDAR_WORKFLOW_CONFIG.labels.eventDescription}</span><Textarea value={editorDraft.description} maxLength={5_000} onChange={(event) => setDraft("description", event.target.value)} /></label>
          <label className="flex items-center gap-2 text-foreground md:col-span-2"><Checkbox checked={editorDraft.isAllDay} onCheckedChange={(checked) => setDraft("isAllDay", checked === true)} />{CALENDAR_WORKFLOW_CONFIG.labels.allDay}</label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="button" disabled={calendarMutation.isPending || !editorDraft.title.trim()} onClick={() => void saveEvent()}>{editorDraft.id ? <Pencil aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" /> : <Plus aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" />}{editorDraft.id ? CALENDAR_WORKFLOW_CONFIG.labels.updateEvent : CALENDAR_WORKFLOW_CONFIG.labels.saveEvent}</Button>
            <Button type="button" variant="outline" disabled={calendarMutation.isPending} onClick={() => setEditorDraft(null)}>{CALENDAR_WORKFLOW_CONFIG.labels.cancel}</Button>
            {editorDraft.id ? <Button type="button" variant="destructive" disabled={calendarMutation.isPending} onClick={() => void deleteEvent({ sourceEventId: editorDraft.id } as CalendarEvent)}><Trash2 aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" />{CALENDAR_WORKFLOW_CONFIG.labels.deleteEvent}</Button> : null}
          </div>
        </CardContent>
      </Card> : null}
    </main>
  );
}
