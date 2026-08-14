import { useCallback } from "react";
import { toast } from "sonner";

import { MUTATION_FEEDBACK_CONFIG } from "@/constants";

type MutationFeedbackLabels = {
  pending: string;
  success: string;
  error: string;
  successDescription?: string;
  errorDescription?: string;
};

type MutationFeedbackOptions<Result> = {
  action: () => Promise<Result>;
  labels: MutationFeedbackLabels;
  onSuccess?: (result: Result) => void | Promise<void>;
};

const getErrorDescription = (error: unknown, fallback?: string) =>
  error instanceof Error && error.message ? error.message : fallback;

export function useMutationFeedback() {
  const execute = useCallback(async <Result>({ action, labels, onSuccess }: MutationFeedbackOptions<Result>) => {
    const toastId = toast.loading(labels.pending);

    try {
      const result = await action();
      await onSuccess?.(result);
      toast.success(labels.success, {
        id: toastId,
        description: labels.successDescription,
      });
      return result;
    } catch (error) {
      toast.error(labels.error, {
        id: toastId,
        description: getErrorDescription(error, labels.errorDescription),
        action: {
          label: MUTATION_FEEDBACK_CONFIG.retryLabel,
          onClick: () => {
            void execute({ action, labels, onSuccess }).catch(() => undefined);
          },
        },
      });
      throw error;
    }
  }, []);

  return { execute };
}
