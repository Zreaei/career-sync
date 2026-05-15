"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TopBar from "@/components/layout/TopBar";

/* ── Student CLO Data (from their academic profile) ── */
const studentCLOs = [
  { code: "CLO1", description: "Mampu membuat REST API menggunakan framework modern", grade: "A", weight: 1.0 },
  { code: "CLO2", description: "Mampu merancang dan mengimplementasikan database SQL", grade: "B", weight: 0.7 },
  { code: "CLO3", description: "Mampu membuat aplikasi Android menggunakan Kotlin", grade: "C", weight: 0.4 },
];

/* ── Job Data with requirements & CLO similarity scores ── */
const jobDetail = {
  title: "Frontend Developer",
  company: "Tokopedia",
  location: "Jakarta, Indonesia",
  type: "Full-time",
  salary: "Rp 10-18 jt/bulan",
  deadline: "30 Mei 2026",
  posted: "10 Mei 2026",
  description:
    "Kami mencari Frontend Developer untuk membangun dan memelihara aplikasi web berskala besar. Kandidat akan bekerja dalam tim cross-functional menggunakan teknologi modern.",
  responsibilities: [
    "Mengembangkan fitur frontend menggunakan React dan TypeScript",
    "Berkolaborasi dengan tim backend untuk integrasi REST API",
    "Menulis kode yang bersih, terstruktur, dan terdokumentasi",
    "Melakukan code review dan mentoring junior developer",
    "Optimasi performa dan aksesibilitas aplikasi web",
  ],
  /* Each requirement has pre-computed similarity with each student CLO */
  requirements: [
    {
      code: "Req A",
      description: "Menguasai REST API dan Laravel",
      similarities: [
        { clo: "CLO1", sim: 0.91, weightedScore: 0.91 * 1.0 },
        { clo: "CLO2", sim: 0.35, weightedScore: 0.35 * 0.7 },
        { clo: "CLO3", sim: 0.15, weightedScore: 0.15 * 0.4 },
      ],
    },
    {
      code: "Req B",
      description: "Menguasai MySQL dan PostgreSQL",
      similarities: [
        { clo: "CLO1", sim: 0.38, weightedScore: 0.38 * 1.0 },
        { clo: "CLO2", sim: 0.89, weightedScore: 0.89 * 0.7 },
        { clo: "CLO3", sim: 0.12, weightedScore: 0.12 * 0.4 },
      ],
    },
    {
      code: "Req C",
      description: "Pengalaman React.js frontend",
      similarities: [
        { clo: "CLO1", sim: 0.31, weightedScore: 0.31 * 1.0 },
        { clo: "CLO2", sim: 0.28, weightedScore: 0.28 * 0.7 },
        { clo: "CLO3", sim: 0.22, weightedScore: 0.22 * 0.4 },
      ],
    },
    {
      code: "Req D",
      description: "Memahami Docker dan Kubernetes",
      similarities: [
        { clo: "CLO1", sim: 0.18, weightedScore: 0.18 * 1.0 },
        { clo: "CLO2", sim: 0.14, weightedScore: 0.14 * 0.7 },
        { clo: "CLO3", sim: 0.11, weightedScore: 0.11 * 0.4 },
      ],
    },
  ],
};

/* ── Helper Functions ── */
function getReqScore(req: (typeof jobDetail.requirements)[0]) {
  return Math.max(...req.similarities.map((s) => s.weightedScore));
}

function getBestCLO(req: (typeof jobDetail.requirements)[0]) {
  let best = req.similarities[0];
  for (const s of req.similarities) {
    if (s.weightedScore > best.weightedScore) best = s;
  }
  return best;
}

function getStatusIcon(score: number) {
  if (score >= 0.7) return { icon: "check_circle", color: "text-green-700", label: "Terpenuhi", bg: "bg-green-50" };
  if (score >= 0.4) return { icon: "warning", color: "text-tertiary", label: "Parsial", bg: "bg-tertiary-fixed" };
  return { icon: "cancel", color: "text-error", label: "Gap", bg: "bg-red-50" };
}

export default function JobDetailPage() {
  const reqScores = jobDetail.requirements.map((r) => getReqScore(r));
  const overallScore = reqScores.reduce((a, b) => a + b, 0) / reqScores.length;

  const metCount = reqScores.filter((s) => s >= 0.7).length;
  const partialCount = reqScores.filter((s) => s >= 0.4 && s < 0.7).length;
  const gapCount = reqScores.filter((s) => s < 0.4).length;

  return (
    <>
      <TopBar />
      <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Back */}
        <Link
          href="/student/job-matching"
          className="inline-flex items-center gap-2 font-label text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <Icon name="arrow_back" size={18} /> Kembali ke Job Matching
        </Link>

        {/* Job Header */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient ghost-border">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center">
                  <Icon name="code" className="text-primary" size={28} />
                </div>
                <div>
                  <h1 className="font-headline text-2xl font-bold text-on-background">
                    {jobDetail.title}
                  </h1>
                  <p className="font-body text-on-surface-variant">
                    {jobDetail.company}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { icon: "location_on", text: jobDetail.location },
                  { icon: "work", text: jobDetail.type },
                  { icon: "payments", text: jobDetail.salary },
                  { icon: "event", text: `Deadline: ${jobDetail.deadline}` },
                ].map((info) => (
                  <span
                    key={info.icon}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full font-label text-xs text-on-surface-variant"
                  >
                    <Icon name={info.icon} size={14} /> {info.text}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-center">
                <p className="font-label text-xs text-on-surface-variant mb-1">
                  Match Score
                </p>
                <p className="font-headline text-4xl font-bold text-primary">
                  {(overallScore * 100).toFixed(1)}%
                </p>
                <p className="font-label text-[10px] text-on-surface-variant mt-0.5">
                  avg({reqScores.map((s) => s.toFixed(3)).join(" + ")}) / {reqScores.length}
                </p>
              </div>
              <button className="btn-gradient rounded-xl px-8 py-3 font-label font-bold shadow-[0_4px_14px_rgb(9,76,178,0.25)] flex items-center gap-2">
                <Icon name="send" size={18} /> Lamar Sekarang
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
              <h2 className="font-headline text-xl font-bold text-on-background mb-4">
                Deskripsi
              </h2>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {jobDetail.description}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
              <h2 className="font-headline text-xl font-bold text-on-background mb-4">
                Tanggung Jawab
              </h2>
              <ul className="space-y-3">
                {jobDetail.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary mt-0.5" size={18} />
                    <span className="font-body text-sm text-on-surface-variant">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CLO-based Requirement Analysis (detailed) */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
              <h2 className="font-headline text-xl font-bold text-on-background mb-2">
                Analisis Per-Requirement
              </h2>
              <p className="font-body text-xs text-on-surface-variant mb-6">
                Setiap requirement dihitung: max(sim(CLO, Req) × bobot_nilai) dari semua CLO mahasiswa
              </p>
              <div className="space-y-6">
                {jobDetail.requirements.map((req) => {
                  const score = getReqScore(req);
                  const best = getBestCLO(req);
                  const status = getStatusIcon(score);
                  return (
                    <div key={req.code} className="p-4 rounded-xl bg-surface-container-low">
                      {/* Req header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-label text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">
                              {req.code}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-label text-xs font-bold ${status.bg} ${status.color}`}>
                              <Icon name={status.icon} size={12} />
                              {status.label}
                            </span>
                          </div>
                          <p className="font-body text-sm text-on-background font-medium">
                            {req.description}
                          </p>
                        </div>
                        <span className="font-headline text-xl font-bold text-primary ml-4">
                          {(score * 100).toFixed(1)}%
                        </span>
                      </div>

                      {/* CLO similarity breakdown */}
                      <div className="space-y-2">
                        {req.similarities.map((s) => {
                          const isBest = s === best;
                          const cloInfo = studentCLOs.find((c) => c.code === s.clo);
                          return (
                            <div
                              key={s.clo}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                                isBest ? "bg-primary-fixed/40" : "bg-surface-container"
                              }`}
                            >
                              <span className="font-label text-xs font-bold text-on-surface-variant w-10">
                                {s.clo}
                              </span>
                              <span className="font-label text-[11px] text-on-surface-variant">
                                sim={s.sim.toFixed(2)} × {cloInfo?.weight.toFixed(1)} ({cloInfo?.grade})
                              </span>
                              <span className="font-label text-xs ml-auto">
                                = <span className={`font-bold ${isBest ? "text-primary" : "text-on-surface-variant"}`}>
                                  {s.weightedScore.toFixed(3)}
                                </span>
                              </span>
                              {isBest && (
                                <span className="font-label text-[10px] text-primary font-bold">
                                  ← max
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Summary Sidebar */}
          <div className="space-y-6">
            {/* Student CLO Profile */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
              <h2 className="font-headline text-lg font-bold text-on-background mb-4">
                CLO Mahasiswa
              </h2>
              <div className="space-y-3">
                {studentCLOs.map((clo) => (
                  <div key={clo.code} className="p-3 rounded-xl bg-surface-container-low">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label text-sm font-bold text-primary">{clo.code}</span>
                      <span className={`px-2 py-0.5 rounded font-label text-xs font-bold ${
                        clo.grade.startsWith("A") ? "bg-green-50 text-green-700" :
                        clo.grade.startsWith("B") ? "bg-blue-50 text-blue-700" :
                        "bg-tertiary-fixed text-on-tertiary-container"
                      }`}>
                        {clo.grade} (bobot: {clo.weight.toFixed(1)})
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant">{clo.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Summary */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
              <h2 className="font-headline text-lg font-bold text-on-background mb-4">
                Ringkasan Match
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-label text-sm text-on-surface-variant">Total Requirements</span>
                  <span className="font-label text-sm font-bold text-on-background">{jobDetail.requirements.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 font-label text-sm text-green-700">
                    <Icon name="check_circle" size={16} /> Terpenuhi
                  </span>
                  <span className="font-label text-sm font-bold text-green-700">{metCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 font-label text-sm text-tertiary">
                    <Icon name="warning" size={16} /> Parsial
                  </span>
                  <span className="font-label text-sm font-bold text-tertiary">{partialCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 font-label text-sm text-error">
                    <Icon name="cancel" size={16} /> Gap
                  </span>
                  <span className="font-label text-sm font-bold text-error">{gapCount}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-surface-variant">
                  <div className="flex justify-between items-center">
                    <span className="font-label text-sm font-bold text-on-background">Overall Score</span>
                    <span className="font-headline text-2xl font-bold text-primary">
                      {(overallScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="font-body text-[10px] text-on-surface-variant mt-1">
                    ({reqScores.map((s) => s.toFixed(3)).join(" + ")}) / {reqScores.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
              <h2 className="font-headline text-lg font-bold text-on-background mb-3">
                Rekomendasi Peningkatan
              </h2>
              <div className="space-y-3">
                {jobDetail.requirements
                  .filter((r) => getReqScore(r) < 0.7)
                  .map((r) => {
                    const score = getReqScore(r);
                    const status = getStatusIcon(score);
                    return (
                      <div key={r.code} className={`p-3 rounded-xl ${score < 0.4 ? "bg-error-container/30" : "bg-tertiary-fixed/30"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-label text-xs font-bold ${status.color}`}>{r.code}</span>
                          <span className="font-label text-xs text-on-surface-variant">
                            Skor: {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="font-body text-xs text-on-surface-variant">
                          Tingkatkan kompetensi terkait <strong>&quot;{r.description}&quot;</strong> melalui
                          kursus atau proyek untuk meningkatkan match score.
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
