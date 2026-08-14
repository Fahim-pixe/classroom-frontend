import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { OFFLINE_RESILIENCE_CONFIG } from "@/constants";

type StoredDraft<T> = {
  savedAt: number;
  value: T;
};

type UseLocalDraftOptions<T> = {
  key: string;
  initialValue: T;
  enabled: boolean;
  isEmpty: (value: T) => boolean;
};

type UseLocalDraftResult<T> = {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  clear: () => void;
  hasRecoveredDraft: boolean;
};

function isRecentDraft<T>(draft: StoredDraft<T>): boolean {
  return Number.isFinite(draft.savedAt)
    && Date.now() - draft.savedAt <= OFFLINE_RESILIENCE_CONFIG.draftMaximumAgeMilliseconds;
}

export function useLocalDraft<T>({
  key,
  initialValue,
  enabled,
  isEmpty,
}: UseLocalDraftOptions<T>): UseLocalDraftResult<T> {
  const storageKey = useMemo(
    () => `${OFFLINE_RESILIENCE_CONFIG.draftStoragePrefix}:${key}`,
    [key],
  );
  const [value, setValue] = useState<T>(initialValue);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);
  const [hydratedStorageKey, setHydratedStorageKey] = useState("");

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setValue(initialValue);
      setHasRecoveredDraft(false);
      setHydratedStorageKey(storageKey);
      return;
    }

    try {
      const rawDraft = window.localStorage.getItem(storageKey);
      if (!rawDraft) {
        setValue(initialValue);
        setHasRecoveredDraft(false);
      } else {
        const draft = JSON.parse(rawDraft) as StoredDraft<T>;
        if (isRecentDraft(draft)) {
          setValue(draft.value);
          setHasRecoveredDraft(true);
        } else {
          window.localStorage.removeItem(storageKey);
          setValue(initialValue);
          setHasRecoveredDraft(false);
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey);
      setValue(initialValue);
      setHasRecoveredDraft(false);
    }

    setHydratedStorageKey(storageKey);
  }, [enabled, initialValue, storageKey]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || hydratedStorageKey !== storageKey) {
      return;
    }

    try {
      if (isEmpty(value)) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      const draft: StoredDraft<T> = { savedAt: Date.now(), value };
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Draft recovery remains an enhancement; storage limitations must never block form editing.
    }
  }, [enabled, hydratedStorageKey, isEmpty, storageKey, value]);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setValue(initialValue);
    setHasRecoveredDraft(false);
  }, [initialValue, storageKey]);

  return { value, setValue, clear, hasRecoveredDraft };
}
