"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

const applicants = [
  { id: 1, name: "Budi Santoso", position: "Frontend Developer", match: 92, university: "ITB", gpa: "3.85", date: "10 Mei 2026", status: "new" },
  { id: 2, name: "Siti Rahayu", position: "Data Analyst", match: 88, university: "UI", gpa: "3.72", date: "9 Mei 2026", status: "reviewed" },
  { id: 3, name: "Andi Pratama", position: "Backend Developer", match: 85, university: "UGM", gpa: "3.60", date: "8 Mei 2026", status: "interview" },
  { id: 4, name: "Dewi Lestari", position: "UI/UX Designer", match: 79, university: "ITS", gpa: "3.45", date: "7 Mei 2026", status: "rejected" },
  { id: 5, name: "Rizky Aditya", position: "Frontend Developer", match: 91, university: "BINUS", gpa: "3.78", date: "6 Mei 2026", status: "new" },
  { id: 6, name: "Maya Putri", position: "Data Analyst", match: 83, university: "UNPAD", gpa: "3.55", date: "5 Mei 2026", status: "accepted" },
];

const statusStyles: Record<string, string> = {
  new: "bg-primary-fixed text-primary",
  reviewed: "bg-surface-container text-on-surface-variant",
  interview: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};
const statusLabels: Record<string, string> = {
  new: "Baru", reviewed: "Reviewed", interview: "Interview", accepted: "Diterima", rejected: "Ditolak",
};

export default function ApplicantsPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? applicants : applicants.filter((a) => a.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold text-on-background">Daftar Pelamar</h1>
        <p className="font-body text-on-surface-variant">Review dan kelola semua pelamar yang masuk.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[{ key: "all", label: "Semua" }, { key: "new", label: "Baru" }, { key: "reviewed", label: "Reviewed" }, { key: "interview", label: "Interview" }, { key: "accepted", label: "Diterima" }, { key: "rejected", label: "Ditolak" }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl font-label text-sm whitespace-nowrap transition-colors ${filter === f.key ? "bg-primary text-on-primary font-bold" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high ghost-border"}`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient ghost-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                {["Nama", "Posisi", "Universitas", "IPK", "Match", "Tanggal", "Status", "Aksi"].map((h) => (
                  <th key={h} className={`font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4 ${h === "Aksi" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-surface-container-low transition-colors border-t border-surface-variant">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center"><Icon name="person" className="text-primary" size={16} /></div>
                      <span className="font-body text-sm font-medium text-on-background">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">{a.position}</td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">{a.university}</td>
                  <td className="px-6 py-4 font-label text-sm text-on-background">{a.gpa}</td>
                  <td className="px-6 py-4 font-label text-sm font-bold text-primary">{a.match}%</td>
                  <td className="px-6 py-4 font-label text-sm text-on-surface-variant">{a.date}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full font-label text-xs font-semibold ${statusStyles[a.status]}`}>{statusLabels[a.status]}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"><Icon name="visibility" size={18} /></button>
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
