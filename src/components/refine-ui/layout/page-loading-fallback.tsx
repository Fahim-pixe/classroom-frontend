import { Loader2 } from "lucide-react";
import { UI_TOKENS } from "@/constants";

interface PageLoadingFallbackProps {
  label: string;
}

export function PageLoadingFallback({ label }: PageLoadingFallbackProps) {
  return (
    <section
      className="flex min-h-40 w-full items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Loader2
        className="animate-spin text-primary"
        style={{
          height: UI_TOKENS.icon.button,
          width: UI_TOKENS.icon.button,
        }}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </section>
  );
}

PageLoadingFallback.displayName = "PageLoadingFallback";
