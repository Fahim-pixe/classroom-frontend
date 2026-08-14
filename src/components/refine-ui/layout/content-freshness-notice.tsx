import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { OFFLINE_RESILIENCE_CONFIG } from "@/constants";

type ContentFreshnessNoticeProps = {
  hasCachedContent: boolean;
};

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const markOnline = () => setIsOnline(true);
    const markOffline = () => setIsOnline(false);

    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);

    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);

  return isOnline;
}

export function ContentFreshnessNotice({ hasCachedContent }: ContentFreshnessNoticeProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <p
      className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      {hasCachedContent
        ? OFFLINE_RESILIENCE_CONFIG.copy.stale
        : OFFLINE_RESILIENCE_CONFIG.copy.offline}
    </p>
  );
}
