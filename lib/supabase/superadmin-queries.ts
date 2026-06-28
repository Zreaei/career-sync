import { supabase } from "./client";
import { USE_MOCKS } from "./mockConfig";
import { mockDb, nextId } from "./mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Prodi {
  id: string;
  name: string;
  fakultas: string | null;
  integration_status: string | null;
  created_at: string | null;
}

export interface AdminUser {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  prodi_id: string | null;
  deleted_at: string | null;
}

export interface AdminUserWithProdi extends AdminUser {
  prodi: { name: string; integration_status: string | null } | null;
}

// ─── Prodi ────────────────────────────────────────────────────────────────────

export async function getProdi() {
  if (USE_MOCKS) {
    return [...mockDb.prodi].sort((a, b) => a.name.localeCompare(b.name)) as Prodi[];
  }
  const { data, error } = await supabase
    .from("prodi")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as Prodi[];
}

export async function createProdi(prodi: Omit<Prodi, "id" | "created_at">) {
  if (USE_MOCKS) {
    const created = {
      ...prodi,
      id: nextId("prodi"),
      created_at: new Date().toISOString(),
    } as Prodi;
    mockDb.prodi.push(created);
    return created;
  }
  const { data, error } = await supabase
    .from("prodi")
    .insert(prodi)
    .select()
    .single();
  if (error) throw error;
  return data as Prodi;
}

export async function updateProdi(id: string, updates: Partial<Omit<Prodi, "id" | "created_at">>) {
  if (USE_MOCKS) {
    const idx = mockDb.prodi.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Prodi tidak ditemukan.");
    const next = { ...mockDb.prodi[idx], ...updates } as Prodi;
    mockDb.prodi[idx] = next;
    return next;
  }
  const { data, error } = await supabase
    .from("prodi")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Prodi;
}

export async function deleteProdi(id: string) {
  if (USE_MOCKS) {
    mockDb.prodi = mockDb.prodi.filter((p) => p.id !== id);
    return;
  }
  const { error } = await supabase.from("prodi").delete().eq("id", id);
  if (error) throw error;
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export async function getAdminUsers() {
  if (USE_MOCKS) {
    return mockDb.admin_users
      .filter((a) => !a.deleted_at)
      .map((a) => ({
        ...a,
        prodi: a.prodi_id
          ? (() => {
              const p = mockDb.prodi.find((x) => x.id === a.prodi_id);
              return p ? { name: p.name, integration_status: p.integration_status } : null;
            })()
          : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)) as AdminUserWithProdi[];
  }
  const { data, error } = await supabase
    .from("admin_users")
    .select(`*, prodi ( name, integration_status )`)
    .is("deleted_at", null)
    .order("name");
  if (error) throw error;
  return data as AdminUserWithProdi[];
}

export async function createAdminUser(adminUser: {
  name: string;
  email: string;
  password: string;
  prodi_id: string;
}): Promise<AdminUserWithProdi> {
  if (USE_MOCKS) {
    const created = {
      id: nextId("admin"),
      user_id: nextId("user-admin"),
      name: adminUser.name,
      email: adminUser.email,
      prodi_id: adminUser.prodi_id,
      deleted_at: null,
    } as AdminUserWithProdi;
    const prodi = mockDb.prodi.find((p) => p.id === adminUser.prodi_id) ?? null;
    created.prodi = prodi ? { name: prodi.name, integration_status: prodi.integration_status } : null;
    mockDb.admin_users.push({
      id: created.id,
      user_id: created.user_id,
      name: created.name,
      email: created.email,
      prodi_id: created.prodi_id,
      deleted_at: created.deleted_at,
    });
    return created;
  }
  const { data, error } = await supabase.functions.invoke("provision-admin", {
    body: adminUser,
  });
  if (error) {
    const fnMsg = (data as { error?: string } | null)?.error;
    throw new Error(fnMsg ?? error.message);
  }
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }
  return (data as { admin: AdminUserWithProdi }).admin;
}

export async function updateAdminUser(
  id: string,
  updates: { name?: string; prodi_id?: string | null },
) {
  if (USE_MOCKS) {
    const idx = mockDb.admin_users.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Admin tidak ditemukan.");
    const next = { ...mockDb.admin_users[idx], ...updates } as AdminUserWithProdi;
    mockDb.admin_users[idx] = next;
    const prodi = next.prodi_id ? mockDb.prodi.find((p) => p.id === next.prodi_id) ?? null : null;
    return {
      ...next,
      prodi: prodi ? { name: prodi.name, integration_status: prodi.integration_status } : null,
    } as AdminUserWithProdi;
  }
  const { data, error } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", id)
    .select(`*, prodi ( name, integration_status )`)
    .single();
  if (error) throw error;
  return data as AdminUserWithProdi;
}

export async function softDeleteAdminUser(id: string) {
  if (USE_MOCKS) {
    const idx = mockDb.admin_users.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Admin tidak ditemukan.");
    mockDb.admin_users[idx] = { ...mockDb.admin_users[idx], deleted_at: new Date().toISOString() };
    return;
  }
  const { error } = await supabase
    .from("admin_users")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
