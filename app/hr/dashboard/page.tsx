"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import StatCard from "@/components/ui/StatCard";

const recentApplicants = [
  { name: "Budi Santoso", position: "Frontend Developer", match: 92, date: "Hari ini", status: "Baru" },
  { name: "Siti Rahayu", position: "Data Analyst", match: 88, date: "Kemarin", status: "Reviewed" },
  { name: "Andi Pratama", position: "Backend Developer", match: 85, date: "2 hari lalu", status: "Baru" },
  { name: "Dewi Lestari", position: "UI/UX Designer", match: 79, date: "3 hari lalu", status: "Interview" },
];

const jobPostings = [
  { title: "Frontend Developer", applicants: 12, status: "active", deadline: "30 Mei 2026" },
  { title: "Data Analyst", applicants: 8, status: "active", deadline: "25 Mei 2026" },
  { title: "Backend Developer", applicants: 15, status: "active", deadline: "1 Jun 2026" },
  { title: "System Administrator", applicants: 5, status: "closing", deadline: "15 Mei 2026" },
];

export default function HRDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold text-on-background">
            HR Dashboard
          </h1>
          <p className="font-body text-on-surface-variant">
            Kelola lowongan dan pantau pelamar terbaru.
          </p>
        </div>
        <Link
          href="/hr/jobs/new"
          className="btn-gradient font-label font-bold rounded-xl px-6 py-3 flex items-center gap-2 w-fit shadow-[0_4px_14px_rgb(9,76,178,0.25)]"
        >
          <Icon name="add" size={20} />
          Buat Lowongan Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="work" label="Total Lowongan" value={12} trend="2 baru" trendUp />
        <StatCard
          icon="group"
          label="Total Pelamar"
          value={156}
          trend="18%"
          trendUp
          iconBgClass="bg-green-50"
          iconTextClass="text-green-700"
        />
        <StatCard
          icon="event"
          label="Interview Minggu Ini"
          value={8}
          iconBgClass="bg-blue-50"
          iconTextClass="text-blue-700"
        />
        <StatCard
          icon="check_circle"
          label="Diterima Bulan Ini"
          value={5}
          iconBgClass="bg-tertiary-fixed"
          iconTextClass="text-tertiary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applicants */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-xl font-bold text-on-background">
              Pelamar Terbaru
            </h2>
            <Link
              href="/hr/applicants"
              className="font-label text-sm text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplicants.map((applicant) => (
              <div
                key={applicant.name}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors"
              >
                <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center">
                  <Icon name="person" className="text-primary" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-on-background truncate">
                    {applicant.name}
                  </p>
                  <p className="font-label text-xs text-on-surface-variant">
                    {applicant.position} · {applicant.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs font-bold text-primary">
                    {applicant.match}%
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label text-xs font-semibold ${
                      applicant.status === "Baru"
                        ? "bg-primary-fixed text-primary"
                        : applicant.status === "Interview"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {applicant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-xl font-bold text-on-background">
              Lowongan Aktif
            </h2>
            <Link
              href="/hr/jobs"
              className="font-label text-sm text-primary hover:underline"
            >
              Kelola
            </Link>
          </div>
          <div className="space-y-3">
            {jobPostings.map((job) => (
              <div
                key={job.title}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-colors"
              >
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-on-background">
                    {job.title}
                  </p>
                  <p className="font-label text-xs text-on-surface-variant">
                    Deadline: {job.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label text-xs text-on-surface-variant">
                    {job.applicants} pelamar
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      job.status === "active" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
