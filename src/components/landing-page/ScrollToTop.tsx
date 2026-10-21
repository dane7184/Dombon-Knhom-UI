"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Prevent the browser from restoring the previous scroll position
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Scroll to top immediately on mount
    window.scrollTo(0, 0);

    return () => {
      // Restore default behavior when leaving the page
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, []);

  return null;
}
