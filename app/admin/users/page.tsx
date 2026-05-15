"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

const users = [
  { id: 1, name: "Budi Santoso", email: "budi@student.ac.id", role: "Mahasiswa", status: "active", lastLogin: "Hari ini" },
  { id: 2, name: "Siti Rahayu", email: "siti@student.ac.id", role: "Mahasiswa", status: "active", lastLogin: "Kemarin" },
  { id: 3, name: "PT TechIndo", email: "hr@techindo.com", role: "HR", status: "active", lastLogin: "3 hari lalu" },
  { id: 4, name: "Andi Pratama", email: "andi@student.ac.id", role: "Mahasiswa", status: "inactive", lastLogin: "1 bulan lalu" },
  { id: 5, name: "DataCorp", email: "recruit@datacorp.id", role: "HR", status: "active", lastLogin: "Hari ini" },
  { id: 6, name: "Admin Utama", email: "admin@careersync.ac.id", role: "Admin", status: "active", lastLogin: "Hari ini" },
];

const roleColors: Record<string, string> = {
  Mahasiswa: "bg-primary-fixed text-primary",
  HR: "bg-tertiary-fixed text-tertiary",
  Admin: "bg-green-50 text-green-700",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (roleFilter === "all" || u.role === roleFilter);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold text-on-background">Manajemen Pengguna</h1>
          <p className="font-body text-on-surface-variant">Kelola semua pengguna sistem CareerSync.</p>
        </div>
        <button className="btn-gradient font-label font-bold rounded-xl px-6 py-3 flex items-center gap-2 w-fit shadow-[0_4px_14px_rgb(9,76,178,0.25)]">
          <Icon name="person_add" size={20} />Tambah Pengguna
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient ghost-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input type="text" placeholder="Cari pengguna..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 font-body text-sm placeholder:text-outline" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-surface-container-low border-none rounded-xl px-4 py-3 font-label text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="all">Semua Role</option>
          <option value="Mahasiswa">Mahasiswa</option>
          <option value="HR">HR</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient ghost-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                {["Nama", "Email", "Role", "Status", "Login Terakhir", "Aksi"].map((h) => (
                  <th key={h} className={`font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4 ${h === "Aksi" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low transition-colors border-t border-surface-variant">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center"><Icon name="person" className="text-primary" size={16} /></div>
                      <span className="font-body text-sm font-medium text-on-background">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">{u.email}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full font-label text-xs font-semibold ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 font-label text-xs ${u.status === "active" ? "text-green-700" : "text-on-surface-variant"}`}>
                      <span className={`w-2 h-2 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-outline"}`} />{u.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-label text-sm text-on-surface-variant">{u.lastLogin}</td>
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
