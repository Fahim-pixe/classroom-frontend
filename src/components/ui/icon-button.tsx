import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconButtonProps = Omit<React.ComponentProps<typeof Button>, "size" | "aria-label"> & {
  "aria-label": string;
  tooltip?: string;
};

export function IconButton({ className, tooltip, children, "aria-label": ariaLabel, ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      type={props.type ?? "button"}
      size="icon"
      aria-label={ariaLabel}
      title={tooltip ?? ariaLabel}
      className={cn("shrink-0", className)}
    >
      {children}
    </Button>
  );
}
