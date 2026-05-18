"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getAdminUsers,
  getProdi,
  type AdminUserWithProdi,
  type Prodi,
} from "@/lib/supabase/superadmin-queries";

interface SuperadminDataContextValue {
  admins: AdminUserWithProdi[];
  prodis: Prodi[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SuperadminDataContext = createContext<SuperadminDataContextValue | null>(null);

const sortByName = <T extends { name: string }>(list: T[]) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name));

export function SuperadminDataProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState<AdminUserWithProdi[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [a, p] = await Promise.all([getAdminUsers(), getProdi()]);
      setAdmins(a);
      setProdis(p);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel("superadmin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_users" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string }).id;
            if (!id) return;
            setAdmins((list) => list.filter((a) => a.id !== id));
            return;
          }
          // INSERT/UPDATE: realtime payload omits joined prodi — refetch the row.
          const id = (payload.new as { id?: string }).id;
          if (!id) return;
          const { data } = await supabase
            .from("admin_users")
            .select(`*, prodi ( name, integration_status )`)
            .eq("id", id)
            .single();
          if (!data) return;
          const row = data as AdminUserWithProdi;
          if (row.deleted_at) {
            setAdmins((list) => list.filter((a) => a.id !== row.id));
            return;
          }
          setAdmins((list) => {
            const idx = list.findIndex((a) => a.id === row.id);
            if (idx === -1) return sortByName([...list, row]);
            const next = [...list];
            next[idx] = row;
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prodi" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string }).id;
            if (!id) return;
            setProdis((list) => list.filter((p) => p.id !== id));
            return;
          }
          const row = payload.new as Prodi;
          setProdis((list) => {
            const idx = list.findIndex((p) => p.id === row.id);
            if (idx === -1) return sortByName([...list, row]);
            const next = [...list];
            next[idx] = row;
            return next;
          });
          // Keep joined prodi snapshot on admin rows in sync.
          setAdmins((list) =>
            list.map((a) =>
              a.prodi_id === row.id
                ? { ...a, prodi: { name: row.name, integration_status: row.integration_status } }
                : a,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value = useMemo(
    () => ({ admins, prodis, loading, error, refresh }),
    [admins, prodis, loading, error, refresh],
  );

  return (
    <SuperadminDataContext.Provider value={value}>
      {children}
    </SuperadminDataContext.Provider>
  );
}

export function useSuperadminData() {
  const ctx = useContext(SuperadminDataContext);
  if (!ctx) {
    throw new Error(
      "useSuperadminData must be used within SuperadminDataProvider",
    );
  }
  return ctx;
}
