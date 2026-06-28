import { supabase } from "./client";
import { encodeClo } from "@/lib/encoding";
import { USE_MOCKS } from "./mockConfig";
import { mockDb, nextId } from "./mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  nim: string;
  name: string;
  email: string | null;
  angkatan: number | null;
  prodi_id: string | null;
  status: string;
  user_id: string | null;
}

export interface Matkul {
  id: string;
  kode: string;
  nama: string;
  sks: number | null;
  semester: number | null;
  deskripsi: string | null;
  prodi_id: string | null;
}

export interface CLO {
  id: string;
  matkul_id: string;
  clo_code: string | null;
  clo_text: string;
}

export interface StudentCLO {
  student_id: string;
  clo_id: string;
  grade: number | null;
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getStudents(prodiId?: string) {
  if (USE_MOCKS) {
    let list = [...mockDb.students];
    if (prodiId) list = list.filter((s) => s.prodi_id === prodiId);
    list.sort((a, b) => a.nim.localeCompare(b.nim));
    return list as Student[];
  }
  let q = supabase.from("students").select("*").order("nim");
  if (prodiId) q = q.eq("prodi_id", prodiId);
  const { data, error } = await q;
  if (error) throw error;
  return data as Student[];
}

export async function createStudent(input: {
  nim: string;
  name: string;
  email: string;
  password: string;
  angkatan: number | null;
  status: string;
  prodi_id: string;
}): Promise<Student> {
  if (USE_MOCKS) {
    const created: Student = {
      id: nextId("student"),
      nim: input.nim,
      name: input.name,
      email: input.email,
      angkatan: input.angkatan,
      prodi_id: input.prodi_id,
      status: input.status,
      user_id: nextId("user-student"),
    };
    mockDb.students.push(created);
    return created;
  }
  const { data, error } = await supabase.functions.invoke("provision-student", {
    body: input,
  });
  if (error) {
    // supabase-js wraps non-2xx as a generic error; the real reason is in
    // error.context (a Response). Read it so the UI shows a useful message.
    let fnMsg: string | undefined = (data as { error?: string } | null)?.error;
    const ctx = (error as { context?: Response }).context;
    if (!fnMsg && ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.clone().json();
        fnMsg = body?.error ?? body?.message;
      } catch {
        try { fnMsg = await ctx.clone().text(); } catch { /* ignore */ }
      }
    }
    throw new Error(fnMsg ?? error.message);
  }
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }
  return (data as { student: Student }).student;
}

export async function updateStudent(id: string, updates: Partial<Omit<Student, "id" | "user_id">>) {
  if (USE_MOCKS) {
    const idx = mockDb.students.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Mahasiswa tidak ditemukan.");
    const next = { ...mockDb.students[idx], ...updates } as Student;
    mockDb.students[idx] = next;
    return next;
  }
  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string) {
  if (USE_MOCKS) {
    mockDb.students = mockDb.students.filter((s) => s.id !== id);
    mockDb.student_clos = mockDb.student_clos.filter((sc) => sc.student_id !== id);
    return;
  }
  // Calls the SECURITY DEFINER function `admin_delete_student` (see
  // supabase/migrations/20260518_admin_delete_student.sql) which deletes the
  // students row AND the linked auth.users entry atomically.
  const { error } = await supabase.rpc("admin_delete_student", {
    p_student_id: id,
  });
  if (!error) return;

  // Function missing -> migration has not been applied. Refuse to fall back
  // to a plain DELETE: that would silently leave the auth user behind and
  // block re-registering the email. Surface a clear, actionable error.
  if ((error as { code?: string }).code === "PGRST202" || /admin_delete_student/i.test(error.message)) {
    throw new Error(
      "Setup belum lengkap: fungsi admin_delete_student belum ada di database. " +
        "Buka Supabase Dashboard → SQL Editor → jalankan isi file " +
        "supabase/migrations/20260518_admin_delete_student.sql.",
    );
  }
  throw new Error(error.message);
}

// ─── Matkul ───────────────────────────────────────────────────────────────────

export async function getMatkul(prodiId?: string) {
  if (USE_MOCKS) {
    let list = [...mockDb.matkul];
    if (prodiId) list = list.filter((m) => m.prodi_id === prodiId);
    list.sort((a, b) => a.kode.localeCompare(b.kode));
    return list as Matkul[];
  }
  let q = supabase.from("matkul").select("*").order("kode");
  if (prodiId) q = q.eq("prodi_id", prodiId);
  const { data, error } = await q;
  if (error) throw error;
  return data as Matkul[];
}

export async function getMatkulByKode(kode: string) {
  if (USE_MOCKS) {
    const row = mockDb.matkul.find((m) => m.kode.toLowerCase() === kode.toLowerCase()) ?? null;
    return row as Matkul | null;
  }
  const { data, error } = await supabase
    .from("matkul")
    .select("*")
    .ilike("kode", kode)
    .maybeSingle();
  if (error) throw error;
  return data as Matkul | null;
}

export async function createMatkul(matkul: Omit<Matkul, "id">) {
  if (USE_MOCKS) {
    const created = { ...matkul, id: nextId("matkul") } as Matkul;
    mockDb.matkul.push(created);
    return created;
  }
  const { data, error } = await supabase
    .from("matkul")
    .insert(matkul)
    .select()
    .single();
  if (error) throw error;
  return data as Matkul;
}

export async function updateMatkul(id: string, updates: Partial<Omit<Matkul, "id">>) {
  if (USE_MOCKS) {
    const idx = mockDb.matkul.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error("Mata kuliah tidak ditemukan.");
    const next = { ...mockDb.matkul[idx], ...updates } as Matkul;
    mockDb.matkul[idx] = next;
    return next;
  }
  const { data, error } = await supabase
    .from("matkul")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Matkul;
}

export async function deleteMatkul(id: string) {
  if (USE_MOCKS) {
    mockDb.matkul = mockDb.matkul.filter((m) => m.id !== id);
    const closToRemove = new Set(mockDb.clos.filter((c) => c.matkul_id === id).map((c) => c.id));
    mockDb.clos = mockDb.clos.filter((c) => c.matkul_id !== id);
    mockDb.student_clos = mockDb.student_clos.filter((sc) => !closToRemove.has(sc.clo_id));
    return;
  }
  const { error } = await supabase.from("matkul").delete().eq("id", id);
  if (error) throw error;
}

// ─── CLOs ─────────────────────────────────────────────────────────────────────

export async function getCLOsByMatkul(matkulId: string) {
  if (USE_MOCKS) {
    const list = mockDb.clos
      .filter((c) => c.matkul_id === matkulId)
      .sort((a, b) => (a.clo_code ?? "").localeCompare(b.clo_code ?? ""));
    return list as CLO[];
  }
  const { data, error } = await supabase
    .from("clos")
    .select("id, matkul_id, clo_code, clo_text")
    .eq("matkul_id", matkulId)
    .order("clo_code");
  if (error) throw error;
  return data as CLO[];
}

export async function getAllCLOs() {
  if (USE_MOCKS) {
    const list = [...mockDb.clos].sort((a, b) => (a.clo_code ?? "").localeCompare(b.clo_code ?? ""));
    return list as CLO[];
  }
  const { data, error } = await supabase
    .from("clos")
    .select("id, matkul_id, clo_code, clo_text")
    .order("clo_code");
  if (error) throw error;
  return data as CLO[];
}

export async function createCLO(clo: Omit<CLO, "id">) {
  if (USE_MOCKS) {
    const created = { ...clo, id: nextId("clo") } as CLO;
    mockDb.clos.push(created);
    return created;
  }
  // Encode the CLO text first (clo → query side); abort before inserting if it
  // fails. Don't .select() the embedding back — it's a 1024-float vector.
  const embedding = await encodeClo(clo.clo_text);
  const { data, error } = await supabase
    .from("clos")
    .insert({ ...clo, embedding })
    .select("id, matkul_id, clo_code, clo_text")
    .single();
  if (error) throw error;
  return data as CLO;
}

export async function updateCLO(id: string, updates: Partial<Omit<CLO, "id">>) {
  if (USE_MOCKS) {
    const idx = mockDb.clos.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("CLO tidak ditemukan.");
    const next = { ...mockDb.clos[idx], ...updates } as CLO;
    mockDb.clos[idx] = next;
    return next;
  }
  // Re-encode only when the text changes — clo_code/matkul_id edits don't
  // affect the embedding.
  const patch: Record<string, unknown> = { ...updates };
  if (updates.clo_text !== undefined) {
    patch.embedding = await encodeClo(updates.clo_text);
  }
  const { data, error } = await supabase
    .from("clos")
    .update(patch)
    .eq("id", id)
    .select("id, matkul_id, clo_code, clo_text")
    .single();
  if (error) throw error;
  return data as CLO;
}

export async function deleteCLO(id: string) {
  if (USE_MOCKS) {
    mockDb.clos = mockDb.clos.filter((c) => c.id !== id);
    mockDb.student_clos = mockDb.student_clos.filter((sc) => sc.clo_id !== id);
    return;
  }
  const { error } = await supabase.from("clos").delete().eq("id", id);
  if (error) throw error;
}

// ─── Student CLOs (Grades) ────────────────────────────────────────────────────

export interface StudentCLOWithDetails extends StudentCLO {
  students: { nim: string; name: string; angkatan: number | null };
  clos: { clo_code: string | null; clo_text: string; matkul_id: string };
}

export async function getStudentCLOsByMatkul(matkulId: string) {
  if (USE_MOCKS) {
    const cloIds = new Set(mockDb.clos.filter((c) => c.matkul_id === matkulId).map((c) => c.id));
    if (cloIds.size === 0) return [] as StudentCLOWithDetails[];
    const rows = mockDb.student_clos.filter((sc) => cloIds.has(sc.clo_id));
    return rows.map((sc) => {
      const student = mockDb.students.find((s) => s.id === sc.student_id);
      const clo = mockDb.clos.find((c) => c.id === sc.clo_id);
      return {
        ...sc,
        students: {
          nim: student?.nim ?? "",
          name: student?.name ?? "",
          angkatan: student?.angkatan ?? null,
        },
        clos: {
          clo_code: clo?.clo_code ?? null,
          clo_text: clo?.clo_text ?? "",
          matkul_id: clo?.matkul_id ?? matkulId,
        },
      } as StudentCLOWithDetails;
    });
  }
  const { data: clos, error: cloErr } = await supabase
    .from("clos")
    .select("id")
    .eq("matkul_id", matkulId);
  if (cloErr) throw cloErr;
  if (!clos?.length) return [] as StudentCLOWithDetails[];

  const cloIds = clos.map((c) => c.id);
  const { data, error } = await supabase
    .from("student_clos")
    .select(`student_id, clo_id, grade, students ( nim, name, angkatan ), clos ( clo_code, clo_text, matkul_id )`)
    .in("clo_id", cloIds);
  if (error) throw error;
  return (data ?? []) as unknown as StudentCLOWithDetails[];
}

export async function upsertStudentCLO(studentId: string, cloId: string, grade: number) {
  if (USE_MOCKS) {
    const idx = mockDb.student_clos.findIndex(
      (sc) => sc.student_id === studentId && sc.clo_id === cloId,
    );
    if (idx === -1) {
      mockDb.student_clos.push({ student_id: studentId, clo_id: cloId, grade });
    } else {
      mockDb.student_clos[idx] = { ...mockDb.student_clos[idx], grade };
    }
    return;
  }
  const { error } = await supabase
    .from("student_clos")
    .upsert({ student_id: studentId, clo_id: cloId, grade }, { onConflict: "student_id,clo_id" });
  if (error) throw error;
}

export async function deleteStudentCLO(studentId: string, cloId: string) {
  if (USE_MOCKS) {
    mockDb.student_clos = mockDb.student_clos.filter(
      (sc) => !(sc.student_id === studentId && sc.clo_id === cloId),
    );
    return;
  }
  const { error } = await supabase
    .from("student_clos")
    .delete()
    .eq("student_id", studentId)
    .eq("clo_id", cloId);
  if (error) throw error;
}
