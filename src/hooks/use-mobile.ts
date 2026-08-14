import * as React from "react";

import { UI_TOKENS } from "@/constants";

const MOBILE_BREAKPOINT = UI_TOKENS.viewport.mobileBreakpointPx;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function getIsMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(getIsMobileViewport);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQueryList.addEventListener("change", onChange);
    setIsMobile(mediaQueryList.matches);

    return () => mediaQueryList.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
