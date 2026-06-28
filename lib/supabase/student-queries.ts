import { supabase } from "./client";
import { USE_MOCKS } from "./mockConfig";
import { mockDb, nextId } from "./mockData";
import type { CLO, Matkul, Student, StudentCLO } from "./admin-queries";

export interface StudentProfile {
  student: Student;
  prodi: { id: string; name: string; fakultas: string | null } | null;
}

export interface CourseRecord {
  matkul: Matkul;
  clos: (CLO & { grade: number | null })[];
}

/**
 * Resolve the current logged-in student's row + their prodi. Throws when the
 * user is authenticated but no `students` row is linked to their auth id.
 */
export async function getCurrentStudentProfile(): Promise<StudentProfile> {
  if (USE_MOCKS) {
    const student = mockDb.students[0];
    if (!student) throw new Error("Akun Anda belum ditautkan ke data mahasiswa.");
    const prodi = mockDb.prodi.find((p) => p.id === student.prodi_id) ?? null;
    return { student, prodi: prodi ? { id: prodi.id, name: prodi.name, fakultas: prodi.fakultas } : null };
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Tidak ada sesi.");

  const { data, error } = await supabase
    .from("students")
    .select(`*, prodi:prodi_id ( id, name, fakultas )`)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error("Akun Anda belum ditautkan ke data mahasiswa.");
  }

  const { prodi, ...student } = data as Student & {
    prodi: { id: string; name: string; fakultas: string | null } | null;
  };
  return { student: student as Student, prodi };
}

/**
 * Returns the matkul + CLO + grade transcript for the student. Only matkul
 * from the student's prodi are included. CLOs without a grade for this
 * student show grade=null.
 */
export async function getStudentTranscript(
  studentId: string,
  prodiId: string | null,
): Promise<CourseRecord[]> {
  if (USE_MOCKS) {
    const matkul = mockDb.matkul
      .filter((m) => (prodiId ? m.prodi_id === prodiId : true))
      .sort((a, b) => (a.semester ?? 0) - (b.semester ?? 0) || a.kode.localeCompare(b.kode));
    if (matkul.length === 0) return [];
    const matkulIds = matkul.map((m) => m.id);
    const clos = mockDb.clos
      .filter((c) => matkulIds.includes(c.matkul_id))
      .sort((a, b) => (a.clo_code ?? "").localeCompare(b.clo_code ?? ""));
    const cloIds = clos.map((c) => c.id);
    const studentClos = mockDb.student_clos.filter(
      (sc) => sc.student_id === studentId && cloIds.includes(sc.clo_id),
    );
    const gradeByClo = new Map(studentClos.map((sc) => [sc.clo_id, sc.grade]));
    const closByMatkul = new Map<string, (CLO & { grade: number | null })[]>();
    clos.forEach((c) => {
      const list = closByMatkul.get(c.matkul_id) ?? [];
      list.push({ ...c, grade: gradeByClo.get(c.id) ?? null });
      closByMatkul.set(c.matkul_id, list);
    });
    return matkul.map((mk) => ({
      matkul: mk,
      clos: closByMatkul.get(mk.id) ?? [],
    }));
  }
  // 1. matkul scoped to student's prodi
  let mq = supabase.from("matkul").select("*").order("semester").order("kode");
  if (prodiId) mq = mq.eq("prodi_id", prodiId);
  const { data: matkulRows, error: matkulErr } = await mq;
  if (matkulErr) throw matkulErr;
  const matkul = (matkulRows ?? []) as Matkul[];
  if (matkul.length === 0) return [];

  const matkulIds = matkul.map((m) => m.id);

  // 2. CLOs for those matkul
  const { data: closRows, error: closErr } = await supabase
    .from("clos")
    .select("id, matkul_id, clo_code, clo_text")
    .in("matkul_id", matkulIds)
    .order("clo_code");
  if (closErr) throw closErr;
  const clos = (closRows ?? []) as CLO[];

  // 3. Grades for this student across those CLOs
  const cloIds = clos.map((c) => c.id);
  let studentClos: StudentCLO[] = [];
  if (cloIds.length > 0) {
    const { data: scRows, error: scErr } = await supabase
      .from("student_clos")
      .select("student_id, clo_id, grade")
      .eq("student_id", studentId)
      .in("clo_id", cloIds);
    if (scErr) throw scErr;
    studentClos = (scRows ?? []) as StudentCLO[];
  }

  // 4. Assemble records — group CLOs by matkul, attach grade
  const gradeByClo = new Map(studentClos.map((sc) => [sc.clo_id, sc.grade]));
  const closByMatkul = new Map<string, (CLO & { grade: number | null })[]>();
  clos.forEach((c) => {
    const list = closByMatkul.get(c.matkul_id) ?? [];
    list.push({ ...c, grade: gradeByClo.get(c.id) ?? null });
    closByMatkul.set(c.matkul_id, list);
  });

  return matkul.map((mk) => ({
    matkul: mk,
    clos: closByMatkul.get(mk.id) ?? [],
  }));
}

// ─── Job listings (read-only for students) ─────────────────────────────────

export interface JobListing {
  id: string;
  title: string;
  location: string | null;
  job_type: string | null;
  category: string | null;
  salary: string | null;
  description: string | null;
  posted_at: string | null;
  deadline: string | null;
  job_skills: { skill: string }[];
}

export async function getActiveJobs(): Promise<JobListing[]> {
  if (USE_MOCKS) {
    return mockDb.jobs
      .filter((j) => j.status === "active")
      .sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""))
      .map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        job_type: j.job_type,
        category: j.category,
        salary: j.salary,
        description: j.description,
        posted_at: j.posted_at,
        deadline: j.deadline,
        job_skills: mockDb.job_skills.filter((s) => s.job_id === j.id),
      })) as JobListing[];
  }
  const pageSize = 1000;
  const all: JobListing[] = [];
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `id, title, location, job_type, category, salary, description, posted_at, deadline, job_skills ( skill )`,
      )
      .eq("status", "active")
      .order("posted_at", { ascending: false })
      .order("id", { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as JobListing[];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
}

// ─── Job match scores (pgvector, grade-weighted) ───────────────────────────

// Returns { job_id: score 0-100 } for every active job, ranked. Scoring runs
// in Postgres via the `student_job_matches` RPC: for each requirement we use
// its precomputed best-matching CLO (req_best_clo) weighted by the student's
// grade on that CLO. No embeddings are sent over the wire — see
// supabase migration `student_job_match_use_precomputed`.
//
// PostgREST caps any single response at db-max-rows (1000 by default), even for
// RPCs, so we page through with .range() — otherwise jobs ranked below the top
// 1000 would have no score in the UI.
export async function getJobMatchScores(
  studentId: string,
): Promise<Record<string, number>> {
  if (USE_MOCKS) {
    const grades = mockDb.student_clos
      .filter((sc): sc is StudentCLO & { grade: number } => sc.student_id === studentId && typeof sc.grade === "number")
      .map((sc) => sc.grade);
    if (grades.length === 0) return {};
    const base = Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length);
    return Object.fromEntries(
      mockDb.jobs
        .filter((job) => job.status === "active")
        .map((job, index) => [job.id, Math.max(0, Math.min(100, base - index * 6))]),
    );
  }
  const pageSize = 1000;
  const out: Record<string, number> = {};
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .rpc("student_job_matches", { p_student_id: studentId, p_limit: 100000 })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as { job_id: string; score: number }[];
    for (const row of rows) out[row.job_id] = row.score;
    if (rows.length < pageSize) break;
  }
  return out;
}

// Per-requirement match breakdown for one job: which CLO each requirement maps
// to, similarity, the student's grade, and the grade-weighted contribution.
// Powers the "Analisis Kompetensi" tab on /student/jobs/[id].
export interface ReqMatchBreakdown {
  requirement_id: string;
  req_text: string;
  req_position: number;
  similarity: number;
  best_clo_id: string | null;
  clo_code: string | null;
  clo_text: string | null;
  matkul_nama: string | null;
  grade: number | null;
  contribution: number;
}

export async function getJobMatchBreakdown(
  studentId: string,
  jobId: string,
): Promise<ReqMatchBreakdown[]> {
  if (USE_MOCKS) {
    const requirements = mockDb.requirements
      .filter((req) => req.job_id === jobId)
      .sort((a, b) => a.position - b.position);
    return requirements.map((req, index) => {
      const studentClo = mockDb.student_clos.find((sc) => sc.student_id === studentId) ?? null;
      const clo = studentClo ? mockDb.clos.find((c) => c.id === studentClo.clo_id) ?? null : null;
      const matkul = clo ? mockDb.matkul.find((m) => m.id === clo.matkul_id) ?? null : null;
      const similarity = Math.max(0.55, 0.86 - index * 0.08);
      const grade = studentClo?.grade ?? null;
      return {
        requirement_id: req.id,
        req_text: req.req_text,
        req_position: req.position,
        similarity,
        best_clo_id: clo?.id ?? null,
        clo_code: clo?.clo_code ?? null,
        clo_text: clo?.clo_text ?? null,
        matkul_nama: matkul?.nama ?? null,
        grade,
        contribution: Math.round(similarity * (grade ?? 0)),
      };
    });
  }
  const { data, error } = await supabase.rpc("student_job_match_breakdown", {
    p_student_id: studentId,
    p_job_id: jobId,
  });
  if (error) throw error;
  return (data ?? []) as ReqMatchBreakdown[];
}

// ─── Student's own applications ────────────────────────────────────────────

export interface StudentApplication {
  id: string;
  job_id: string | null;
  match_score: number | null;
  status: string;
  applied_at: string | null;
  jobs: { title: string; company_id: string | null } | null;
}

export async function getMyApplications(studentId: string): Promise<StudentApplication[]> {
  if (USE_MOCKS) {
    return mockDb.applications
      .filter((a) => a.student_id === studentId)
      .sort((a, b) => (b.applied_at ?? "").localeCompare(a.applied_at ?? ""))
      .map((a) => {
        const job = mockDb.jobs.find((j) => j.id === a.job_id) ?? null;
        return {
          id: a.id,
          job_id: a.job_id,
          match_score: a.match_score != null ? Math.round(a.match_score * 100) : null,
          status: a.status,
          applied_at: a.applied_at,
          jobs: job ? { title: job.title, company_id: job.company_id } : null,
        } as StudentApplication;
      });
  }
  const { data, error } = await supabase
    .from("applications")
    .select(`id, job_id, match_score, status, applied_at, jobs ( title, company_id )`)
    .eq("student_id", studentId)
    .order("applied_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as StudentApplication[];
}

/**
 * Submit an application for a job. `matchScore` is the same grade-weighted
 * score shown in the UI (from `student_job_matches`); it is stored on the row
 * so HR sees the candidate's fit at apply time.
 *
 * A unique (student_id, job_id) constraint makes re-applying raise a Postgres
 * 23505. We translate that into a friendly Indonesian message so the caller can
 * surface "already applied" without special-casing the error code everywhere.
 */
export async function applyToJob(
  studentId: string,
  jobId: string,
  matchScore: number | null,
): Promise<StudentApplication> {
  if (USE_MOCKS) {
    if (mockDb.applications.some((a) => a.student_id === studentId && a.job_id === jobId)) {
      throw new Error("Anda sudah melamar lowongan ini.");
    }
    const job = mockDb.jobs.find((j) => j.id === jobId) ?? null;
    const created = {
      id: nextId("app"),
      student_id: studentId,
      job_id: jobId,
      match_score: matchScore != null ? matchScore / 100 : null,
      status: "new" as const,
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDb.applications.push(created);
    return {
      id: created.id,
      job_id: created.job_id,
      match_score: matchScore,
      status: created.status,
      applied_at: created.applied_at,
      jobs: job ? { title: job.title, company_id: job.company_id } : null,
    };
  }
  const { data, error } = await supabase
    .from("applications")
    .insert({
      student_id: studentId,
      job_id: jobId,
      match_score: matchScore,
      status: "new",
      applied_at: new Date().toISOString(),
    })
    .select(`id, job_id, match_score, status, applied_at, jobs ( title, company_id )`)
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Anda sudah melamar lowongan ini.");
    }
    throw error;
  }
  return data as unknown as StudentApplication;
}

// ─── Single job detail (for /student/jobs/[id]) ────────────────────────────

export interface JobDetail {
  id: string;
  title: string;
  location: string | null;
  job_type: string | null;
  category: string | null;
  salary: string | null;
  description: string | null;
  posted_at: string | null;
  deadline: string | null;
  status: string;
  company: {
    id: string;
    name: string;
    location: string | null;
    industry: string | null;
    logo_icon: string | null;
  } | null;
  job_skills: { skill: string }[];
  requirements: { id: string; req_text: string; position: number }[];
}

export async function getJobById(jobId: string): Promise<JobDetail | null> {
  if (USE_MOCKS) {
    const job = mockDb.jobs.find((j) => j.id === jobId);
    if (!job) return null;
    const company = mockDb.companies.find((c) => c.id === job.company_id) ?? null;
    const detail: JobDetail = {
      id: job.id,
      title: job.title,
      location: job.location,
      job_type: job.job_type,
      category: job.category,
      salary: job.salary,
      description: job.description,
      posted_at: job.posted_at,
      deadline: job.deadline,
      status: job.status,
      company: company
        ? { id: company.id, name: company.name, location: company.location, industry: company.industry, logo_icon: company.logo_icon }
        : null,
      job_skills: mockDb.job_skills.filter((s) => s.job_id === job.id),
      requirements: mockDb.requirements
        .filter((r) => r.job_id === job.id)
        .sort((a, b) => a.position - b.position),
    };
    return detail;
  }
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `id, title, location, job_type, category, salary, description, posted_at, deadline, status,
       company:company_id ( id, name, location, industry, logo_icon ),
       job_skills ( skill ),
       requirements ( id, req_text, position )`
    )
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const detail = data as unknown as JobDetail;
  detail.requirements = [...(detail.requirements ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  return detail;
}
