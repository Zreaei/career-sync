"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  ensureSuperadminDataInitialized,
  getSuperadminDataSnapshot,
  subscribeSuperadminData,
  superadminDataMutators,
  type SuperadminDataState,
} from "@/lib/supabase/superadminDataStore";
import type {
  AdminUserWithProdi,
  Prodi,
} from "@/lib/supabase/superadmin-queries";

interface SuperadminDataContextValue extends SuperadminDataState {
  setAdmins: (updater: (prev: AdminUserWithProdi[]) => AdminUserWithProdi[]) => void;
  setProdis: (updater: (prev: Prodi[]) => Prodi[]) => void;
}

// Fire init at module-load so a hard refresh straight onto /superadmin/* also
// kicks off the fetch immediately, before any provider mounts.
if (typeof window !== "undefined") {
  ensureSuperadminDataInitialized().catch(() => {});
}

export function SuperadminDataProvider({ children }: { children: ReactNode }) {
  useSyncExternalStore(
    subscribeSuperadminData,
    getSuperadminDataSnapshot,
    getSuperadminDataSnapshot,
  );
  return <>{children}</>;
}

export function useSuperadminData(): SuperadminDataContextValue {
  const snap = useSyncExternalStore(
    subscribeSuperadminData,
    getSuperadminDataSnapshot,
    getSuperadminDataSnapshot,
  );
  return { ...snap, ...superadminDataMutators };
}
