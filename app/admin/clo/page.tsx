"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

const cloList = [
  { id: "CLO-01", name: "Pemrograman Web", program: "Teknik Informatika", semester: 5, status: "active", courses: 3 },
  { id: "CLO-02", name: "Basis Data", program: "Teknik Informatika", semester: 4, status: "active", courses: 2 },
  { id: "CLO-03", name: "Analisis Data", program: "Sistem Informasi", semester: 5, status: "active", courses: 4 },
  { id: "CLO-04", name: "Jaringan Komputer", program: "Teknik Informatika", semester: 4, status: "active", courses: 2 },
  { id: "CLO-05", name: "Keamanan Informasi", program: "Teknik Informatika", semester: 6, status: "draft", courses: 1 },
  { id: "CLO-06", name: "Software Engineering", program: "Teknik Informatika", semester: 5, status: "active", courses: 3 },
  { id: "CLO-07", name: "Machine Learning", program: "Teknik Informatika", semester: 7, status: "draft", courses: 2 },
];

export default function CLOManagementPage() {
  const [search, setSearch] = useState("");
  const filtered = cloList.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold text-on-background">Manajemen Data CLO</h1>
          <p className="font-body text-on-surface-variant">Kelola Course Learning Outcomes untuk pencocokan kompetensi.</p>
        </div>
        <button className="btn-gradient font-label font-bold rounded-xl px-6 py-3 flex items-center gap-2 w-fit shadow-[0_4px_14px_rgb(9,76,178,0.25)]">
          <Icon name="add" size={20} />Tambah CLO
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient ghost-border">
          <p className="font-label text-sm text-on-surface-variant">Total CLO</p>
          <p className="font-headline text-2xl font-bold text-on-background">{cloList.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient ghost-border">
          <p className="font-label text-sm text-on-surface-variant">CLO Aktif</p>
          <p className="font-headline text-2xl font-bold text-green-700">{cloList.filter((c) => c.status === "active").length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient ghost-border">
          <p className="font-label text-sm text-on-surface-variant">CLO Draft</p>
          <p className="font-headline text-2xl font-bold text-tertiary">{cloList.filter((c) => c.status === "draft").length}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient ghost-border">
        <div className="relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input type="text" placeholder="Cari CLO..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 font-body text-sm placeholder:text-outline" />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient ghost-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                {["Kode", "Nama CLO", "Program Studi", "Semester", "Mata Kuliah", "Status", "Aksi"].map((h) => (
                  <th key={h} className={`font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4 ${h === "Aksi" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low transition-colors border-t border-surface-variant">
                  <td className="px-6 py-4"><span className="font-label text-sm font-bold text-primary">{c.id}</span></td>
                  <td className="px-6 py-4 font-body text-sm font-medium text-on-background">{c.name}</td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">{c.program}</td>
                  <td className="px-6 py-4 font-label text-sm text-on-surface-variant">{c.semester}</td>
                  <td className="px-6 py-4 font-label text-sm text-on-background">{c.courses}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full font-label text-xs font-semibold ${c.status === "active" ? "bg-green-50 text-green-700" : "bg-tertiary-fixed text-on-tertiary-container"}`}>{c.status === "active" ? "Aktif" : "Draft"}</span></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"><Icon name="edit" size={18} /></button>
                      <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"><Icon name="delete" size={18} /></button>
                    </div>
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
