"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface BreadcrumbContextValue {
  dynamicLabel: string | null;
  setDynamicLabel: (label: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [dynamicLabel, setDynamicLabelState] = useState<string | null>(null);

  const setDynamicLabel = useCallback((label: string | null) => {
    setDynamicLabelState(label);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ dynamicLabel, setDynamicLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbContext() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumbContext must be used within BreadcrumbProvider");
  return ctx;
}

// Convenience hook for detail pages: call with the real entity name once loaded
export function useDynamicBreadcrumb(label: string | null | undefined) {
  const { setDynamicLabel } = useBreadcrumbContext();

  React.useEffect(() => {
    setDynamicLabel(label ?? null);
    return () => setDynamicLabel(null);
  }, [label, setDynamicLabel]);
}

import * as React from "react";