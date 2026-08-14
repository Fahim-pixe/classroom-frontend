import { useEffect, useMemo, useState } from "react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { Mail, Monitor, Moon, Sun } from "lucide-react";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  API_ENDPOINTS,
  CALENDAR_WORKFLOW_CONFIG,
  NOTIFICATION_PREFERENCE_CONFIG,
  SETTINGS_CONFIG,
} from "@/constants";
import { useMutationFeedback } from "@/hooks/use-mutation-feedback";
import type { CalendarEventType, NotificationPreferences } from "@/types";

const appearanceOptions = [
  { value: "light" as const, label: SETTINGS_CONFIG.appearanceOptions.light, icon: Sun },
  { value: "dark" as const, label: SETTINGS_CONFIG.appearanceOptions.dark, icon: Moon },
  { value: "system" as const, label: SETTINGS_CONFIG.appearanceOptions.system, icon: Monitor },
];

const eventTypes = Object.keys(CALENDAR_WORKFLOW_CONFIG.eventTypes) as CalendarEventType[];

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { execute } = useMutationFeedback();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const { query: preferenceQuery } = useCustom<NotificationPreferences>({
    url: API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
    method: "get",
    queryOptions: { retry: 1 },
  });
  const { mutateAsync: savePreferences, mutation } = useCustomMutation();
  const loadedPreferences = useMemo(
    () => preferenceQuery.data?.data,
    [preferenceQuery.data],
  );
  const isLoading = preferenceQuery.isLoading;
  const isError = preferenceQuery.isError;
  const refetch = preferenceQuery.refetch;

  useEffect(() => {
    if (loadedPreferences?.inAppPreferences && loadedPreferences.emailPreferences) {
      setPreferences(loadedPreferences);
    }
  }, [loadedPreferences]);

  const updatePreference = (
    channel: keyof NotificationPreferences,
    eventType: CalendarEventType,
    checked: boolean,
  ) => {
    setPreferences((current) => current ? {
      ...current,
      [channel]: { ...current[channel], [eventType]: checked },
    } : current);
  };

  const submitPreferences = async () => {
    if (!preferences) return;
    await execute({
      action: () => savePreferences({
        url: API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
        method: "put",
        values: preferences,
      }),
      labels: {
        pending: NOTIFICATION_PREFERENCE_CONFIG.copy.savePending,
        success: NOTIFICATION_PREFERENCE_CONFIG.copy.saveSuccess,
        error: NOTIFICATION_PREFERENCE_CONFIG.copy.saveError,
        errorDescription: NOTIFICATION_PREFERENCE_CONFIG.copy.errorDescription,
      },
      onSuccess: async () => {
        await refetch();
      },
    });
  };

  return (
    <ListView>
      <Breadcrumb />
      <section className="space-y-2">
        <h1 className="page-title">{SETTINGS_CONFIG.copy.title}</h1>
        <p className="text-muted-foreground">{SETTINGS_CONFIG.copy.description}</p>
      </section>

      <Card className="mt-1">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{SETTINGS_CONFIG.copy.appearanceTitle}</CardTitle>
          <CardDescription>{SETTINGS_CONFIG.copy.appearanceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label={SETTINGS_CONFIG.copy.appearancePreferenceLabel}>
            {appearanceOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                className="w-full justify-start sm:justify-center"
                variant={theme === value ? "default" : "outline"}
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
              >
                <Icon className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" aria-hidden="true" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{NOTIFICATION_PREFERENCE_CONFIG.copy.title}</CardTitle>
          <CardDescription>{NOTIFICATION_PREFERENCE_CONFIG.copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          {isLoading && !preferences ? <p className="text-muted-foreground">{NOTIFICATION_PREFERENCE_CONFIG.copy.loading}</p> : null}
          {isError ? <p className="text-destructive">{NOTIFICATION_PREFERENCE_CONFIG.copy.loadError}</p> : null}
          {preferences ? <>
            <div className="overflow-x-auto">
              <div className="min-w-[32rem] space-y-2" role="group" aria-label={NOTIFICATION_PREFERENCE_CONFIG.copy.title}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-4 border-b border-border pb-2 text-muted-foreground">
                  <span>{NOTIFICATION_PREFERENCE_CONFIG.copy.title}</span>
                  <span>{NOTIFICATION_PREFERENCE_CONFIG.copy.inApp}</span>
                  <span>{NOTIFICATION_PREFERENCE_CONFIG.copy.email}</span>
                </div>
                {eventTypes.map((eventType) => <div key={eventType} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-border py-2">
                  <span className="text-foreground">{CALENDAR_WORKFLOW_CONFIG.eventTypes[eventType].label}</span>
                  <Checkbox checked={preferences.inAppPreferences[eventType]} onCheckedChange={(checked) => updatePreference(NOTIFICATION_PREFERENCE_CONFIG.channels.inApp, eventType, checked === true)} aria-label={`${NOTIFICATION_PREFERENCE_CONFIG.copy.inApp} ${CALENDAR_WORKFLOW_CONFIG.eventTypes[eventType].label}`} />
                  <Checkbox checked={preferences.emailPreferences[eventType]} onCheckedChange={(checked) => updatePreference(NOTIFICATION_PREFERENCE_CONFIG.channels.email, eventType, checked === true)} aria-label={`${NOTIFICATION_PREFERENCE_CONFIG.copy.email} ${CALENDAR_WORKFLOW_CONFIG.eventTypes[eventType].label}`} />
                </div>)}
              </div>
            </div>
            <Button type="button" disabled={mutation.isPending} onClick={() => void submitPreferences()}><Mail aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)]" />{NOTIFICATION_PREFERENCE_CONFIG.copy.save}</Button>
          </> : null}
        </CardContent>
      </Card>
    </ListView>
  );
};

export default SettingsPage;
