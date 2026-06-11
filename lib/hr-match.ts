// Match scoring + display helpers for HR pages.
//
// Grades are stored as integers 0-100 (per-CLO). Match between a student and a
// job is the weighted average of the student's grades on CLOs whose
// `clo_text` overlaps any of the job's skill/requirement keywords.

import type { JobWithSkills, TalentCLOGrade } from "@/lib/supabase/hr-queries";

// Average score across all graded CLOs, on a 0-100 scale.
export function studentBaseScore(grades: TalentCLOGrade[]): number {
  const nums = grades
    .map((g) => g.grade)
    .filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return 0;
  const avg = nums.reduce((s, n) => s + n, 0) / nums.length;
  return Math.round(avg);
}

function keywordsFromJob(job: JobWithSkills): string[] {
  const out = new Set<string>();
  job.job_skills.forEach((s) => out.add(s.skill.toLowerCase()));
  job.requirements.forEach((r) => {
    r.req_text
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter((w) => w.length >= 3)
      .forEach((w) => out.add(w));
  });
  return [...out];
}

// Score for a single (student, job) pair, 0-100. Heuristic: weighted grade
// avg on CLOs whose text mentions any job keyword, falling back to the
// student's overall base score when no CLO overlaps.
export function matchScore(grades: TalentCLOGrade[], job: JobWithSkills): number {
  const kws = keywordsFromJob(job);
  if (kws.length === 0) return studentBaseScore(grades);

  const relevant: number[] = [];
  for (const g of grades) {
    const text = (g.clos?.clo_text ?? "").toLowerCase();
    if (!text) continue;
    if (kws.some((k) => text.includes(k))) {
      if (typeof g.grade === "number") relevant.push(g.grade);
    }
  }
  if (relevant.length === 0) return Math.max(0, studentBaseScore(grades) - 15);
  const avg = relevant.reduce((s, n) => s + n, 0) / relevant.length;
  return Math.round(avg);
}

// Find a student's best-matching job from a list. Returns null if no jobs.
export function bestMatchJob(
  grades: TalentCLOGrade[],
  jobs: JobWithSkills[],
): { job: JobWithSkills; score: number } | null {
  if (jobs.length === 0) return null;
  let best: { job: JobWithSkills; score: number } | null = null;
  for (const j of jobs) {
    const score = matchScore(grades, j);
    if (!best || score > best.score) best = { job: j, score };
  }
  return best;
}

// Distinct skills extracted from CLO text whose grade ≥ 75 (~"B+" range on the
// old 4-scale). Used to give the HR a quick "what is this student strong at" hint.
export function studentSkills(grades: TalentCLOGrade[]): string[] {
  const out = new Set<string>();
  for (const g of grades) {
    if (typeof g.grade !== "number" || g.grade < 75) continue;
    const text = g.clos?.clo_text ?? "";
    text
      .split(/[^A-Za-z0-9+#.]+/)
      .filter((w) => /^[A-Z]/.test(w) || /\.(js|ts|py)$/i.test(w))
      .forEach((w) => out.add(w));
  }
  return [...out].slice(0, 8);
}
