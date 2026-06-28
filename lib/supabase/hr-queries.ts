import { supabase } from "./client";
import { encodeRequirements } from "@/lib/encoding";
import { USE_MOCKS } from "./mockConfig";
import { mockDb, nextId } from "./mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus = "processing" | "active" | "closing" | "closed" | "draft";
export type JobType = "Full-time" | "Part-time" | "Internship" | "Contract";
export type ApplicationStatus = "new" | "reviewed" | "interview" | "accepted" | "rejected";
export type InviteStatus = "invited" | "responded" | "declined";

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  size: string | null;
  founded: string | null;
  website: string | null;
  description: string | null;
  logo_icon: string | null;
  verified: boolean | null;
  created_at: string | null;
}

export interface HRProfile {
  id: string;
  user_id: string | null;
  name: string;
  position: string | null;
  company_id: string | null;
}

export interface HRProfileWithCompany extends HRProfile {
  company: Company | null;
  email: string;
}

export interface Job {
  id: string;
  hr_id: string | null;
  company_id: string | null;
  title: string;
  location: string | null;
  job_type: JobType | null;
  description: string | null;
  status: JobStatus;
  salary: string | null;
  category: string | null;
  posted_at: string | null;
  deadline: string | null;
  closed_at: string | null;
}

export interface JobWithSkills extends Job {
  job_skills: { skill: string }[];
  requirements: { id: string; req_text: string; position: number }[];
}

export interface Application {
  id: string;
  student_id: string | null;
  job_id: string | null;
  match_score: number | null;
  status: ApplicationStatus;
  applied_at: string | null;
  updated_at: string | null;
}

export interface ApplicationWithDetails extends Application {
  students: {
    id: string;
    nim: string;
    name: string;
    email: string | null;
    angkatan: number | null;
    prodi_id: string | null;
  } | null;
  jobs: { id: string; title: string; company_id: string | null } | null;
}

export interface TalentInvitation {
  id: string;
  hr_id: string | null;
  student_id: string | null;
  job_id: string | null;
  status: InviteStatus;
  responded_at: string | null;
}

// ─── Current HR profile ───────────────────────────────────────────────────────

export async function getCurrentHrProfile(): Promise<HRProfileWithCompany> {
  if (USE_MOCKS) {
    const hrRow = mockDb.hr_profiles[0];
    if (!hrRow) throw new Error("hr_profile_missing: akun HR belum disiapkan.");
    const company = mockDb.companies.find((c) => c.id === hrRow.company_id) ?? null;
    return {
      ...(hrRow as HRProfile),
      company,
      email: "hr@nusantaralabs.example",
    };
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Tidak ada sesi.");

  // 1. Fetch the HR profile row separately so a missing/forbidden companies
  //    row never masks a perfectly-fine hr_profiles row.
  const { data: initialHrRow, error: hrErr } = await supabase
    .from("hr_profiles")
    .select("id, user_id, name, position, company_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (hrErr) throw hrErr;
  let hrRow = initialHrRow;

  // Self-heal: an authenticated user with role=hr but no profile row gets one
  // auto-provisioned. Name is taken from auth metadata; company_id stays NULL
  // (user will pick / register their company from the profile page).
  if (!hrRow) {
    const meta = session.user.user_metadata ?? {};
    const fallbackName =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      (typeof meta.name === "string" && meta.name.trim()) ||
      session.user.email?.split("@")[0] ||
      "HR";
    const { data: created, error: createErr } = await supabase
      .from("hr_profiles")
      .insert({ user_id: session.user.id, name: fallbackName, company_id: null })
      .select("id, user_id, name, position, company_id")
      .single();
    if (createErr) {
      throw new Error(
        "hr_profile_missing: akun HR ini belum ditautkan ke profil di tabel hr_profiles.",
      );
    }
    hrRow = created;
  }

  // 2. Fetch company independently (may be null if not yet linked).
  let company: Company | null = null;
  if (hrRow.company_id) {
    const { data: companyRow, error: companyErr } = await supabase
      .from("companies")
      .select("*")
      .eq("id", hrRow.company_id)
      .maybeSingle();
    if (companyErr) {
      // Surface as soft warning — the dashboard can still load without it.
      console.warn("[HR] Gagal memuat data companies:", companyErr);
    } else {
      company = (companyRow ?? null) as Company | null;
    }
  }

  return {
    ...(hrRow as HRProfile),
    company,
    email: session.user.email ?? "",
  };
}

export async function updateHrProfile(
  id: string,
  updates: { name?: string; position?: string | null },
): Promise<HRProfile> {
  if (USE_MOCKS) {
    const idx = mockDb.hr_profiles.findIndex((h) => h.id === id);
    if (idx === -1) throw new Error("Profil HR tidak ditemukan.");
    const next = { ...mockDb.hr_profiles[idx], ...updates } as HRProfile;
    mockDb.hr_profiles[idx] = next;
    return next;
  }
  const { data, error } = await supabase
    .from("hr_profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HRProfile;
}

export async function updateCompany(
  id: string,
  updates: Partial<Omit<Company, "id" | "created_at" | "verified">>,
): Promise<Company> {
  if (USE_MOCKS) {
    const idx = mockDb.companies.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Perusahaan tidak ditemukan.");
    const next = { ...mockDb.companies[idx], ...updates } as Company;
    mockDb.companies[idx] = next;
    return next;
  }
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Company;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

interface JobsQueryOpts {
  hrId?: string;
  companyId?: string;
}

export async function getJobs(opts: JobsQueryOpts | string = {}) {
  if (USE_MOCKS) {
    const filter: JobsQueryOpts = typeof opts === "string" ? { hrId: opts } : opts;
    let list = [...mockDb.jobs];
    if (filter.hrId) list = list.filter((j) => j.hr_id === filter.hrId);
    if (filter.companyId) list = list.filter((j) => j.company_id === filter.companyId);
    list.sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""));
    return list.map((j) => ({
      ...j,
      job_skills: mockDb.job_skills.filter((s) => s.job_id === j.id),
      requirements: mockDb.requirements
        .filter((r) => r.job_id === j.id)
        .sort((a, b) => a.position - b.position),
    })) as JobWithSkills[];
  }
  // Accept legacy string-only arg (hrId) for callers that still pass it.
  const filter: JobsQueryOpts =
    typeof opts === "string" ? { hrId: opts } : opts;

  let q = supabase
    .from("jobs")
    .select(`*, job_skills ( skill ), requirements ( id, req_text, position )`)
    .order("posted_at", { ascending: false });
  if (filter.hrId) q = q.eq("hr_id", filter.hrId);
  if (filter.companyId) q = q.eq("company_id", filter.companyId);
  const { data, error } = await q;
  if (error) throw error;
  return data as JobWithSkills[];
}

export async function createJob(
  job: Omit<Job, "id" | "posted_at" | "closed_at">,
  skills: string[],
  qualifications: string[],
) {
  if (USE_MOCKS) {
    const created: Job = {
      ...job,
      id: nextId("job"),
      posted_at: new Date().toISOString(),
      closed_at: null,
    };
    mockDb.jobs.push(created);
    skills.forEach((skill) => mockDb.job_skills.push({ job_id: created.id, skill }));
    qualifications.forEach((req_text, i) => {
      mockDb.requirements.push({ id: nextId("req"), job_id: created.id, req_text, position: i });
    });
    return created as Job;
  }
  // Encode requirement embeddings up front: a failure here aborts before any
  // DB write, so we never leave a half-created job with no requirements.
  const reqEmbeddings = await encodeRequirements(qualifications);

  const { data: newJob, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      hr_id: job.hr_id,
      company_id: job.company_id,
      title: job.title,
      location: job.location,
      job_type: job.job_type,
      description: job.description,
      status: job.status,
      salary: job.salary,
      category: job.category,
      deadline: job.deadline,
    })
    .select()
    .single();
  if (jobErr) throw jobErr;

  if (skills.length) {
    const { error: skillErr } = await supabase
      .from("job_skills")
      .insert(skills.map((skill) => ({ job_id: newJob.id, skill })));
    if (skillErr) throw skillErr;
  }

  if (qualifications.length) {
    const { error: reqErr } = await supabase
      .from("requirements")
      .insert(
        qualifications.map((req_text, i) => ({
          job_id: newJob.id,
          req_text,
          position: i,
          embedding: reqEmbeddings[i],
        })),
      );
    if (reqErr) throw reqErr;
  }

  return newJob as Job;
}

export async function updateJob(
  id: string,
  job: Partial<Omit<Job, "id" | "posted_at" | "closed_at">>,
  skills?: string[],
  qualifications?: string[],
) {
  if (USE_MOCKS) {
    const idx = mockDb.jobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error("Lowongan tidak ditemukan.");
    const next = { ...mockDb.jobs[idx], ...job } as Job;
    mockDb.jobs[idx] = next;
    if (skills !== undefined) {
      mockDb.job_skills = mockDb.job_skills.filter((s) => s.job_id !== id);
      skills.forEach((skill) => mockDb.job_skills.push({ job_id: id, skill }));
    }
    if (qualifications !== undefined) {
      mockDb.requirements = mockDb.requirements.filter((r) => r.job_id !== id);
      qualifications.forEach((req_text, i) => {
        mockDb.requirements.push({ id: nextId("req"), job_id: id, req_text, position: i });
      });
    }
    return next;
  }
  // Re-encode replaced requirements before touching the DB, so an encoding
  // failure aborts the whole update rather than wiping requirements first.
  const reqEmbeddings =
    qualifications !== undefined ? await encodeRequirements(qualifications) : [];

  const { data, error } = await supabase
    .from("jobs")
    .update(job)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  if (skills !== undefined) {
    await supabase.from("job_skills").delete().eq("job_id", id);
    if (skills.length) {
      const { error: skillErr } = await supabase
        .from("job_skills")
        .insert(skills.map((skill) => ({ job_id: id, skill })));
      if (skillErr) throw skillErr;
    }
  }

  if (qualifications !== undefined) {
    await supabase.from("requirements").delete().eq("job_id", id);
    if (qualifications.length) {
      const { error: reqErr } = await supabase
        .from("requirements")
        .insert(
          qualifications.map((req_text, i) => ({
            job_id: id,
            req_text,
            position: i,
            embedding: reqEmbeddings[i],
          })),
        );
      if (reqErr) throw reqErr;
    }
  }

  return data as Job;
}

export async function deleteJob(id: string) {
  if (USE_MOCKS) {
    mockDb.job_skills = mockDb.job_skills.filter((s) => s.job_id !== id);
    mockDb.requirements = mockDb.requirements.filter((r) => r.job_id !== id);
    mockDb.applications = mockDb.applications.filter((a) => a.job_id !== id);
    mockDb.jobs = mockDb.jobs.filter((j) => j.id !== id);
    return;
  }
  await supabase.from("job_skills").delete().eq("job_id", id);
  await supabase.from("requirements").delete().eq("job_id", id);
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}

// ─── Applications ─────────────────────────────────────────────────────────────

interface ApplicationsQueryOpts {
  jobId?: string;
  jobIds?: string[];
}

export async function getApplications(opts: ApplicationsQueryOpts | string = {}) {
  if (USE_MOCKS) {
    const filter: ApplicationsQueryOpts = typeof opts === "string" ? { jobId: opts } : opts;
    let list = [...mockDb.applications];
    if (filter.jobId) list = list.filter((a) => a.job_id === filter.jobId);
    if (filter.jobIds && filter.jobIds.length) {
      const ids = new Set(filter.jobIds);
      list = list.filter((a) => a.job_id && ids.has(a.job_id));
    }
    list.sort((a, b) => (b.applied_at ?? "").localeCompare(a.applied_at ?? ""));
    return list.map((a) => {
      const student = mockDb.students.find((s) => s.id === a.student_id) ?? null;
      const job = mockDb.jobs.find((j) => j.id === a.job_id) ?? null;
      return {
        ...a,
        students: student
          ? {
              id: student.id,
              nim: student.nim,
              name: student.name,
              email: student.email,
              angkatan: student.angkatan,
              prodi_id: student.prodi_id,
            }
          : null,
        jobs: job ? { id: job.id, title: job.title, company_id: job.company_id } : null,
      } as ApplicationWithDetails;
    });
  }
  const filter: ApplicationsQueryOpts =
    typeof opts === "string" ? { jobId: opts } : opts;

  let q = supabase
    .from("applications")
    .select(
      `*, students ( id, nim, name, email, angkatan, prodi_id ), jobs ( id, title, company_id )`,
    )
    .order("applied_at", { ascending: false });
  if (filter.jobId) q = q.eq("job_id", filter.jobId);
  if (filter.jobIds && filter.jobIds.length) q = q.in("job_id", filter.jobIds);
  const { data, error } = await q;
  if (error) throw error;
  return data as ApplicationWithDetails[];
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  if (USE_MOCKS) {
    const idx = mockDb.applications.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Lamaran tidak ditemukan.");
    mockDb.applications[idx] = {
      ...mockDb.applications[idx],
      status,
      updated_at: new Date().toISOString(),
    };
    return;
  }
  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ─── Talent invitations ───────────────────────────────────────────────────────

export async function getTalentInvitations(hrId: string): Promise<TalentInvitation[]> {
  if (USE_MOCKS) {
    return mockDb.talent_invitations.filter((i) => i.hr_id === hrId) as TalentInvitation[];
  }
  const { data, error } = await supabase
    .from("talent_invitations")
    .select("id, hr_id, student_id, job_id, status, responded_at")
    .eq("hr_id", hrId);
  if (error) throw error;
  return (data ?? []) as TalentInvitation[];
}

export async function inviteTalent(hrId: string, studentId: string, jobId: string) {
  if (USE_MOCKS) {
    const created = {
      id: nextId("inv"),
      hr_id: hrId,
      student_id: studentId,
      job_id: jobId,
      status: "invited",
      responded_at: null,
    } as TalentInvitation;
    mockDb.talent_invitations.push(created);
    return created;
  }
  const { data, error } = await supabase
    .from("talent_invitations")
    .insert({ hr_id: hrId, student_id: studentId, job_id: jobId, status: "invited" })
    .select()
    .single();
  if (error) throw error;
  return data as TalentInvitation;
}

export async function cancelInvitation(id: string) {
  if (USE_MOCKS) {
    mockDb.talent_invitations = mockDb.talent_invitations.filter((i) => i.id !== id);
    return;
  }
  const { error } = await supabase
    .from("talent_invitations")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── Talent pool ──────────────────────────────────────────────────────────────
//
// "Talent pool" = active students with their CLO-grade aggregate, joined with
// any existing invitations from this HR. Match score is computed client-side
// from CLO grades (see lib/hr-match.ts).

export interface TalentStudent {
  id: string;
  nim: string;
  name: string;
  email: string | null;
  angkatan: number | null;
  prodi_id: string | null;
  status: string;
}

export interface TalentCLOGrade {
  student_id: string;
  clo_id: string;
  grade: number | null;
  clos: { clo_code: string | null; clo_text: string; matkul_id: string } | null;
}

// One row of the req_best_clo table: a job requirement mapped to its nearest
// CLO + cosine similarity. These are the exact inputs the student-side score RPC
// (`student_job_matches`) uses, so the HR pages can reproduce the identical
// score client-side (see lib/hr-match.ts) instead of a divergent heuristic.
export interface ReqBestCloRow {
  requirement_id: string;
  job_id: string;
  best_clo_id: string | null;
  sim: number;
}

export async function getTalentStudents(): Promise<TalentStudent[]> {
  if (USE_MOCKS) {
    return mockDb.students
      .filter((s) => s.status === "active")
      .sort((a, b) => a.name.localeCompare(b.name)) as TalentStudent[];
  }
  const { data, error } = await supabase
    .from("students")
    .select("id, nim, name, email, angkatan, prodi_id, status")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as TalentStudent[];
}

export async function getTalentGrades(studentIds: string[]): Promise<TalentCLOGrade[]> {
  if (USE_MOCKS) {
    if (studentIds.length === 0) return [];
    const ids = new Set(studentIds);
    return mockDb.student_clos
      .filter((sc) => ids.has(sc.student_id))
      .map((sc) => {
        const clo = mockDb.clos.find((c) => c.id === sc.clo_id) ?? null;
        return {
          ...sc,
          clos: clo
            ? { clo_code: clo.clo_code, clo_text: clo.clo_text, matkul_id: clo.matkul_id }
            : null,
        } as TalentCLOGrade;
      });
  }
  if (studentIds.length === 0) return [];
  const { data, error } = await supabase
    .from("student_clos")
    .select("student_id, clo_id, grade, clos ( clo_code, clo_text, matkul_id )")
    .in("student_id", studentIds);
  if (error) throw error;
  return (data ?? []) as unknown as TalentCLOGrade[];
}

// req_best_clo rows for the given jobs. `sim` is stored as numeric, which
// PostgREST may serialize as a string — coerce to number so the scorer can do
// arithmetic on it. Returns [] for an empty job list.
export async function getReqBestClos(jobIds: string[]): Promise<ReqBestCloRow[]> {
  if (jobIds.length === 0) return [];
  const { data, error } = await supabase
    .from("req_best_clo")
    .select("requirement_id, job_id, best_clo_id, sim")
    .in("job_id", jobIds);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    requirement_id: r.requirement_id as string,
    job_id: r.job_id as string,
    best_clo_id: (r.best_clo_id ?? null) as string | null,
    sim: typeof r.sim === "number" ? r.sim : Number(r.sim),
  }));
}

export async function getProdiNames(): Promise<Record<string, string>> {
  if (USE_MOCKS) {
    return Object.fromEntries(mockDb.prodi.map((p) => [p.id, p.name]));
  }
  const { data, error } = await supabase
    .from("prodi")
    .select("id, name");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.name as string]));
}
