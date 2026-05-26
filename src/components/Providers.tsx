"use client";

import type { ReactNode } from "react";
import { LayoutProvider } from "@/lib/layout-context";
import { CardEditorProvider } from "./CardEditorProvider";

/**
 * Client-side providers that wrap the whole app. Lives just inside the root
 * <body> so cards (which read layout state) and dialogs (which need a
 * mounted host) share the same provider tree.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <CardEditorProvider>{children}</CardEditorProvider>
    </LayoutProvider>
  );
}
