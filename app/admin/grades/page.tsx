"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

const gradeData = [
  { id: 1, nim: "21001", name: "Budi Santoso", course: "Pemrograman Web", clo: "CLO-01", grade: "A", score: 90, semester: "2025/2026 Genap" },
  { id: 2, nim: "21002", name: "Siti Rahayu", course: "Pemrograman Web", clo: "CLO-01", grade: "A-", score: 85, semester: "2025/2026 Genap" },
  { id: 3, nim: "21001", name: "Budi Santoso", course: "Basis Data", clo: "CLO-02", grade: "A-", score: 85, semester: "2025/2026 Genap" },
  { id: 4, nim: "21003", name: "Andi Pratama", course: "Analisis Data", clo: "CLO-03", grade: "B+", score: 78, semester: "2025/2026 Genap" },
  { id: 5, nim: "21002", name: "Siti Rahayu", course: "Basis Data", clo: "CLO-02", grade: "B", score: 72, semester: "2025/2026 Genap" },
  { id: 6, nim: "21004", name: "Dewi Lestari", course: "Software Engineering", clo: "CLO-06", grade: "A", score: 92, semester: "2025/2026 Genap" },
];

function getGradeColor(grade: string) {
  if (grade.startsWith("A")) return "bg-green-50 text-green-700";
  if (grade.startsWith("B")) return "bg-blue-50 text-blue-700";
  return "bg-tertiary-fixed text-on-tertiary-container";
}

export default function GradesPage() {
  const [search, setSearch] = useState("");
  const filtered = gradeData.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.nim.includes(search) ||
    g.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold text-on-background">Manajemen Nilai Mahasiswa</h1>
          <p className="font-body text-on-surface-variant">Kelola nilai mahasiswa berdasarkan CLO.</p>
        </div>
        <button className="btn-gradient font-label font-bold rounded-xl px-6 py-3 flex items-center gap-2 w-fit shadow-[0_4px_14px_rgb(9,76,178,0.25)]">
          <Icon name="upload" size={20} />Import Nilai
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient ghost-border">
        <div className="relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input type="text" placeholder="Cari berdasarkan NIM, nama, atau mata kuliah..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 font-body text-sm placeholder:text-outline" />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient ghost-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                {["NIM", "Nama", "Mata Kuliah", "CLO", "Grade", "Skor", "Semester", "Aksi"].map((h) => (
                  <th key={h} className={`font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4 ${h === "Aksi" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-surface-container-low transition-colors border-t border-surface-variant">
                  <td className="px-6 py-4 font-label text-sm font-bold text-primary">{g.nim}</td>
                  <td className="px-6 py-4 font-body text-sm font-medium text-on-background">{g.name}</td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">{g.course}</td>
                  <td className="px-6 py-4 font-label text-sm text-on-surface-variant">{g.clo}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full font-label text-xs font-bold ${getGradeColor(g.grade)}`}>{g.grade}</span></td>
                  <td className="px-6 py-4 font-label text-sm font-bold text-on-background">{g.score}</td>
                  <td className="px-6 py-4 font-label text-sm text-on-surface-variant">{g.semester}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"><Icon name="edit" size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
