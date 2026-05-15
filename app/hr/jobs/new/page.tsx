"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function CreateJobPage() {
  const [skills, setSkills] = useState(["React", "TypeScript"]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/hr/jobs" className="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant">
          <Icon name="arrow_back" />
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold text-on-background">Tambah Lowongan Baru</h1>
          <p className="font-body text-on-surface-variant">Isi detail lowongan pekerjaan untuk dipublikasikan.</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border space-y-5">
          <h2 className="font-headline text-lg font-bold text-on-background">Informasi Dasar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Judul Posisi", placeholder: "contoh: Frontend Developer" },
              { label: "Perusahaan", placeholder: "contoh: TechIndo" },
              { label: "Lokasi", placeholder: "contoh: Jakarta" },
              { label: "Range Gaji", placeholder: "contoh: Rp 8-12 jt" },
            ].map((f) => (
              <div key={f.label} className="space-y-2">
                <label className="block font-label text-sm text-on-background">{f.label}</label>
                <input type="text" placeholder={f.placeholder} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm placeholder:text-outline" />
              </div>
            ))}
            <div className="space-y-2">
              <label className="block font-label text-sm text-on-background">Tipe Pekerjaan</label>
              <select className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-label text-sm text-on-background">Deadline Lamaran</label>
              <input type="date" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border space-y-5">
          <h2 className="font-headline text-lg font-bold text-on-background">Deskripsi Pekerjaan</h2>
          <textarea rows={6} placeholder="Tuliskan deskripsi lengkap pekerjaan..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm placeholder:text-outline resize-none" />
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border space-y-5">
          <h2 className="font-headline text-lg font-bold text-on-background">Skills yang Dibutuhkan</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Tambah skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-sm placeholder:text-outline" />
            <button type="button" onClick={addSkill} className="btn-gradient rounded-lg px-4 py-3 font-label text-sm font-bold">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full font-label text-sm">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-error"><Icon name="close" size={16} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/hr/jobs" className="px-6 py-3 rounded-xl font-label text-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Batal</Link>
          <button type="submit" className="btn-gradient rounded-xl px-8 py-3 font-label text-sm font-bold shadow-[0_4px_14px_rgb(9,76,178,0.25)]">Publikasikan Lowongan</button>
        </div>
      </form>
    </div>
  );
}
