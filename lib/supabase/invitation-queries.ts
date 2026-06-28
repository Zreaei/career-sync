import { supabase } from "./client";
import { USE_MOCKS } from "./mockConfig";
import { mockDb } from "./mockData";

// Talent invitations from the student's point of view. HR creates a row with
// status "invited" (see hr-queries.inviteTalent); the student then accepts
// ("responded") or rejects ("declined"). HR reads the same status vocabulary
// — see InviteStatus in hr-queries.ts.

export type StudentInviteStatus = "invited" | "responded" | "declined";

export interface StudentInvitation {
  id: string;
  hr_id: string | null;
  job_id: string | null;
  status: StudentInviteStatus;
  sent_at: string | null;
  responded_at: string | null;
  // Embedded job + company. Null when the linked job is no longer readable
  // (e.g. it was closed — students can only read active/closing jobs via RLS).
  jobs: {
    title: string;
    location: string | null;
    job_type: string | null;
    company: { name: string; logo_icon: string | null } | null;
  } | null;
}

const INVITATION_SELECT = `id, hr_id, job_id, status, sent_at, responded_at,
  jobs:job_id ( title, location, job_type, company:company_id ( name, logo_icon ) )`;

/** All invitations addressed to a student, newest first. */
export async function getMyInvitations(studentId: string): Promise<StudentInvitation[]> {
  if (USE_MOCKS) {
    return mockDb.talent_invitations
      .filter((inv) => inv.student_id === studentId)
      .map((inv) => {
        const job = mockDb.jobs.find((j) => j.id === inv.job_id) ?? null;
        const company = job ? mockDb.companies.find((c) => c.id === job.company_id) ?? null : null;
        return {
          ...inv,
          sent_at: null,
          jobs: job
            ? {
                title: job.title,
                location: job.location,
                job_type: job.job_type,
                company: company ? { name: company.name, logo_icon: company.logo_icon } : null,
              }
            : null,
        } as StudentInvitation;
      });
  }
  const { data, error } = await supabase
    .from("talent_invitations")
    .select(INVITATION_SELECT)
    .eq("student_id", studentId)
    .order("sent_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as StudentInvitation[];
}

/**
 * Accept or decline an invitation. Accepting maps to the DB status
 * "responded" (what HR's talent pool reads as "Merespon"); declining maps to
 * "declined". Requires the student-update RLS policy on talent_invitations
 * (migration 20260612_student_invitation_response.sql).
 */
export async function respondToInvitation(
  id: string,
  accept: boolean,
): Promise<StudentInvitation> {
  if (USE_MOCKS) {
    const idx = mockDb.talent_invitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error("Undangan tidak ditemukan.");
    mockDb.talent_invitations[idx] = {
      ...mockDb.talent_invitations[idx],
      status: accept ? "responded" : "declined",
      responded_at: new Date().toISOString(),
    };
    const invitations = await getMyInvitations(mockDb.talent_invitations[idx].student_id ?? "");
    const updated = invitations.find((inv) => inv.id === id);
    if (!updated) throw new Error("Undangan tidak ditemukan.");
    return updated;
  }
  const { data, error } = await supabase
    .from("talent_invitations")
    .update({
      status: accept ? "responded" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(INVITATION_SELECT)
    .single();
  if (error) throw error;
  return data as unknown as StudentInvitation;
}
