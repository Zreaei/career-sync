"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    location: "Jakarta",
    type: "Full-time",
    applicants: 12,
    deadline: "30 Mei 2026",
    status: "active",
    posted: "10 Mei 2026",
  },
  {
    id: 2,
    title: "Data Analyst",
    location: "Bandung",
    type: "Full-time",
    applicants: 8,
    deadline: "25 Mei 2026",
    status: "active",
    posted: "5 Mei 2026",
  },
  {
    id: 3,
    title: "Backend Developer",
    location: "Jakarta",
    type: "Full-time",
    applicants: 15,
    deadline: "1 Jun 2026",
    status: "active",
    posted: "8 Mei 2026",
  },
  {
    id: 4,
    title: "System Administrator",
    location: "Surabaya",
    type: "Contract",
    applicants: 5,
    deadline: "15 Mei 2026",
    status: "closing",
    posted: "1 Mei 2026",
  },
  {
    id: 5,
    title: "UI/UX Designer",
    location: "Yogyakarta",
    type: "Part-time",
    applicants: 7,
    deadline: "20 Mei 2026",
    status: "closed",
    posted: "25 Apr 2026",
  },
];

const statusLabel: Record<string, string> = {
  active: "Aktif",
  closing: "Segera Tutup",
  closed: "Ditutup",
};
const statusColor: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  closing: "bg-tertiary-fixed text-on-tertiary-container",
  closed: "bg-surface-container text-on-surface-variant",
};

export default function ManageJobsPage() {
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold text-on-background">
            Kelola Lowongan
          </h1>
          <p className="font-body text-on-surface-variant">
            Kelola semua lowongan pekerjaan perusahaan Anda.
          </p>
        </div>
        <Link
          href="/hr/jobs/new"
          className="btn-gradient font-label font-bold rounded-xl px-6 py-3 flex items-center gap-2 w-fit shadow-[0_4px_14px_rgb(9,76,178,0.25)]"
        >
          <Icon name="add" size={20} />
          Tambah Lowongan
        </Link>
      </div>

      {/* Search */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient ghost-border">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Cari lowongan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 font-body text-sm placeholder:text-outline"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient ghost-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4">
                  Posisi
                </th>
                <th className="text-left font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4">
                  Lokasi
                </th>
                <th className="text-left font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4">
                  Tipe
                </th>
                <th className="text-left font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4">
                  Pelamar
                </th>
                <th className="text-left font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4">
                  Deadline
                </th>
                <th className="text-left font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right font-label text-xs text-on-surface-variant uppercase tracking-wider px-6 py-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-surface-container-low transition-colors border-t border-surface-variant"
                >
                  <td className="px-6 py-4">
                    <span className="font-body text-sm font-medium text-on-background">
                      {job.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm text-on-surface-variant">
                      {job.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-label text-sm text-on-surface-variant">
                      {job.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-label text-sm font-bold text-primary">
                      {job.applicants}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-label text-sm text-on-surface-variant">
                      {job.deadline}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full font-label text-xs font-semibold ${statusColor[job.status]}`}
                    >
                      {statusLabel[job.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors">
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors">
                        <Icon name="delete" size={18} />
                      </button>
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
