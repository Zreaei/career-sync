import { supabase } from "./client";

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
  grade: string | null;
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getStudents(prodiId?: string) {
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
  let q = supabase.from("matkul").select("*").order("kode");
  if (prodiId) q = q.eq("prodi_id", prodiId);
  const { data, error } = await q;
  if (error) throw error;
  return data as Matkul[];
}

export async function getMatkulByKode(kode: string) {
  const { data, error } = await supabase
    .from("matkul")
    .select("*")
    .ilike("kode", kode)
    .maybeSingle();
  if (error) throw error;
  return data as Matkul | null;
}

export async function createMatkul(matkul: Omit<Matkul, "id">) {
  const { data, error } = await supabase
    .from("matkul")
    .insert(matkul)
    .select()
    .single();
  if (error) throw error;
  return data as Matkul;
}

export async function updateMatkul(id: string, updates: Partial<Omit<Matkul, "id">>) {
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
  const { error } = await supabase.from("matkul").delete().eq("id", id);
  if (error) throw error;
}

// ─── CLOs ─────────────────────────────────────────────────────────────────────

export async function getCLOsByMatkul(matkulId: string) {
  const { data, error } = await supabase
    .from("clos")
    .select("id, matkul_id, clo_code, clo_text")
    .eq("matkul_id", matkulId)
    .order("clo_code");
  if (error) throw error;
  return data as CLO[];
}

export async function getAllCLOs() {
  const { data, error } = await supabase
    .from("clos")
    .select("id, matkul_id, clo_code, clo_text")
    .order("clo_code");
  if (error) throw error;
  return data as CLO[];
}

export async function createCLO(clo: Omit<CLO, "id">) {
  const { data, error } = await supabase
    .from("clos")
    .insert(clo)
    .select()
    .single();
  if (error) throw error;
  return data as CLO;
}

export async function updateCLO(id: string, updates: Partial<Omit<CLO, "id">>) {
  const { data, error } = await supabase
    .from("clos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CLO;
}

export async function deleteCLO(id: string) {
  const { error } = await supabase.from("clos").delete().eq("id", id);
  if (error) throw error;
}

// ─── Student CLOs (Grades) ────────────────────────────────────────────────────

export interface StudentCLOWithDetails extends StudentCLO {
  students: { nim: string; name: string; angkatan: number | null };
  clos: { clo_code: string | null; clo_text: string; matkul_id: string };
}

export async function getStudentCLOsByMatkul(matkulId: string) {
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

export async function upsertStudentCLO(studentId: string, cloId: string, grade: string) {
  const { error } = await supabase
    .from("student_clos")
    .upsert({ student_id: studentId, clo_id: cloId, grade }, { onConflict: "student_id,clo_id" });
  if (error) throw error;
}

export async function deleteStudentCLO(studentId: string, cloId: string) {
  const { error } = await supabase
    .from("student_clos")
    .delete()
    .eq("student_id", studentId)
    .eq("clo_id", cloId);
  if (error) throw error;
}
