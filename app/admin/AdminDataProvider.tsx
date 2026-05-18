"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  adminDataMutators,
  ensureAdminDataInitialized,
  getAdminDataSnapshot,
  subscribeAdminData,
  type AdminDataState,
} from "@/lib/supabase/adminDataStore";
import type { CLO, Matkul, Student } from "@/lib/supabase/admin-queries";

interface AdminDataContextValue extends AdminDataState {
  setStudents: (updater: (prev: Student[]) => Student[]) => void;
  setMatkul: (updater: (prev: Matkul[]) => Matkul[]) => void;
  setClos: (updater: (prev: CLO[]) => CLO[]) => void;
}

if (typeof window !== "undefined") {
  ensureAdminDataInitialized().catch(() => {});
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  useSyncExternalStore(subscribeAdminData, getAdminDataSnapshot, getAdminDataSnapshot);
  return <>{children}</>;
}

export function useAdminData(): AdminDataContextValue {
  const snap = useSyncExternalStore(subscribeAdminData, getAdminDataSnapshot, getAdminDataSnapshot);
  return { ...snap, ...adminDataMutators };
}
