import { adminProfile, initialMahasiswa, initialMataKuliah } from "@/lib/admin-mock";
import type { CLO, Matkul, Student, StudentCLO } from "./admin-queries";
import type { Application, Company, HRProfile, Job, TalentInvitation } from "./hr-queries";
import type { AdminUser, Prodi } from "./superadmin-queries";

const dayMs = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * dayMs).toISOString();
const daysFromNow = (days: number) => new Date(Date.now() + days * dayMs).toISOString();

let idSeq = 1000;
export function nextId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

const prodiSi: Prodi = {
  id: "prodi-si",
  name: "Sistem Informasi",
  fakultas: "Fakultas Ilmu Komputer",
  integration_status: "active",
  created_at: daysAgo(320),
};

const prodiTi: Prodi = {
  id: "prodi-ti",
  name: "Teknik Informatika",
  fakultas: "Fakultas Ilmu Komputer",
  integration_status: "pending",
  created_at: daysAgo(280),
};

const prodiSk: Prodi = {
  id: "prodi-sk",
  name: "Sistem Komputer",
  fakultas: "Fakultas Ilmu Komputer",
  integration_status: "planned",
  created_at: daysAgo(220),
};

const students: Student[] = initialMahasiswa.map((m, idx) => ({
  id: `student-${idx + 1}`,
  nim: m.nim,
  name: m.name,
  email: m.email,
  angkatan: Number.parseInt(m.angkatan, 10),
  prodi_id: prodiSi.id,
  status: m.status,
  user_id: `user-student-${idx + 1}`,
}));

const matkul: Matkul[] = initialMataKuliah.map((m, idx) => ({
  id: `matkul-${idx + 1}`,
  kode: m.kode,
  nama: m.nama,
  sks: m.sks,
  semester: m.semester,
  deskripsi: m.deskripsi,
  prodi_id: prodiSi.id,
}));

const cloTexts = [
  "Mampu membangun UI web menggunakan React dan TypeScript.",
  "Mampu merancang database relasional dan menulis query SQL.",
  "Mampu mengolah data menggunakan Python dan membuat visualisasi.",
  "Mampu menyiapkan CI/CD dengan Docker dan GitHub Actions.",
  "Mampu memahami keamanan aplikasi dan jaringan dasar.",
  "Mampu menyusun dokumentasi dan requirement produk secara jelas.",
];

const clos: CLO[] = matkul.flatMap((mk, idx) => {
  const base = idx * 2;
  return [
    {
      id: `clo-${mk.id}-1`,
      matkul_id: mk.id,
      clo_code: `${mk.kode}-CLO-01`,
      clo_text: cloTexts[base % cloTexts.length],
    },
    {
      id: `clo-${mk.id}-2`,
      matkul_id: mk.id,
      clo_code: `${mk.kode}-CLO-02`,
      clo_text: cloTexts[(base + 1) % cloTexts.length],
    },
  ];
});

const studentClos: StudentCLO[] = [
  { student_id: students[0].id, clo_id: clos[0].id, grade: 95 },
  { student_id: students[0].id, clo_id: clos[1].id, grade: 85 },
  { student_id: students[1].id, clo_id: clos[2].id, grade: 92 },
  { student_id: students[1].id, clo_id: clos[3].id, grade: 78 },
  { student_id: students[2].id, clo_id: clos[4].id, grade: 76 },
  { student_id: students[2].id, clo_id: clos[5].id, grade: 68 },
  { student_id: students[3].id, clo_id: clos[6].id, grade: 86 },
  { student_id: students[4].id, clo_id: clos[7].id, grade: 80 },
];

const companies: Company[] = [
  {
    id: "company-1",
    name: "Nusantara Labs",
    industry: "Konsultan IT",
    location: "Jakarta",
    size: "201-500 karyawan",
    founded: "2014",
    website: "https://nusantaralabs.example",
    description: "Konsultan digital untuk perusahaan skala menengah dan besar.",
    logo_icon: "domain",
    verified: true,
    created_at: daysAgo(900),
  },
];

const hrProfiles: HRProfile[] = [
  {
    id: "hr-1",
    user_id: "user-hr-1",
    name: "Dimas Prakoso",
    position: "Talent Acquisition",
    company_id: companies[0].id,
  },
];

const jobs: Job[] = [
  {
    id: "job-1",
    hr_id: hrProfiles[0].id,
    company_id: companies[0].id,
    title: "Frontend Engineer",
    location: "Jakarta",
    job_type: "Full-time",
    description: "Bangun pengalaman UI yang modern dan responsif untuk produk karier.",
    status: "active",
    salary: "Rp 9-12 jt",
    category: "Web",
    posted_at: daysAgo(6),
    deadline: daysFromNow(20),
    closed_at: null,
  },
  {
    id: "job-2",
    hr_id: hrProfiles[0].id,
    company_id: companies[0].id,
    title: "Data Analyst",
    location: "Bandung",
    job_type: "Full-time",
    description: "Analisis data rekrutmen dan deliver insight untuk tim HR.",
    status: "closing",
    salary: "Rp 8-11 jt",
    category: "Data",
    posted_at: daysAgo(12),
    deadline: daysFromNow(7),
    closed_at: null,
  },
  {
    id: "job-3",
    hr_id: hrProfiles[0].id,
    company_id: companies[0].id,
    title: "DevOps Intern",
    location: "Remote",
    job_type: "Internship",
    description: "Bantu tim infra menyiapkan pipeline deployment dan monitoring.",
    status: "draft",
    salary: "Rp 3-4 jt",
    category: "DevOps",
    posted_at: daysAgo(2),
    deadline: daysFromNow(30),
    closed_at: null,
  },
];

const jobSkills = [
  { job_id: "job-1", skill: "React" },
  { job_id: "job-1", skill: "TypeScript" },
  { job_id: "job-1", skill: "CSS" },
  { job_id: "job-2", skill: "Python" },
  { job_id: "job-2", skill: "SQL" },
  { job_id: "job-2", skill: "Tableau" },
  { job_id: "job-3", skill: "Docker" },
  { job_id: "job-3", skill: "GitHub Actions" },
  { job_id: "job-3", skill: "AWS" },
];

const requirements = [
  { id: "req-1", job_id: "job-1", req_text: "Mahir React dan TypeScript", position: 0 },
  { id: "req-2", job_id: "job-1", req_text: "Paham desain UI dan aksesibilitas", position: 1 },
  { id: "req-3", job_id: "job-2", req_text: "Menguasai SQL untuk analisis data", position: 0 },
  { id: "req-4", job_id: "job-2", req_text: "Pengalaman dashboard di Tableau", position: 1 },
  { id: "req-5", job_id: "job-3", req_text: "Mengenal Docker dan CI/CD", position: 0 },
];

const applications: Application[] = [
  {
    id: "app-1",
    student_id: students[0].id,
    job_id: jobs[0].id,
    match_score: 0.86,
    status: "reviewed",
    applied_at: daysAgo(2),
    updated_at: daysAgo(1),
  },
  {
    id: "app-2",
    student_id: students[1].id,
    job_id: jobs[1].id,
    match_score: 0.74,
    status: "new",
    applied_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: "app-3",
    student_id: students[2].id,
    job_id: jobs[0].id,
    match_score: 0.63,
    status: "interview",
    applied_at: daysAgo(4),
    updated_at: daysAgo(1),
  },
];

const talentInvitations: TalentInvitation[] = [
  {
    id: "inv-1",
    hr_id: hrProfiles[0].id,
    student_id: students[3].id,
    job_id: jobs[0].id,
    status: "invited",
    responded_at: null,
  },
];

const adminUsers: AdminUser[] = [
  {
    id: "admin-1",
    user_id: "user-admin-1",
    name: adminProfile.name,
    email: adminProfile.email,
    prodi_id: prodiSi.id,
    deleted_at: null,
  },
  {
    id: "admin-2",
    user_id: "user-admin-2",
    name: "Fajar Wibowo",
    email: "fajar.wibowo@univnusantara.ac.id",
    prodi_id: prodiTi.id,
    deleted_at: null,
  },
];

export const mockDb = {
  prodi: [prodiSi, prodiTi, prodiSk],
  admin_users: adminUsers,
  students,
  matkul,
  clos,
  student_clos: studentClos,
  companies,
  hr_profiles: hrProfiles,
  jobs,
  job_skills: jobSkills,
  requirements,
  applications,
  talent_invitations: talentInvitations,
};
