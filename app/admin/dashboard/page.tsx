"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import StatCard from "@/components/ui/StatCard";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold text-on-background">Admin Dashboard</h1>
        <p className="font-body text-on-surface-variant">Overview sistem CareerSync dan manajemen data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="group" label="Total Pengguna" value={1248} trend="5%" trendUp />
        <StatCard icon="school" label="Total CLO" value={156} iconBgClass="bg-green-50" iconTextClass="text-green-700" />
        <StatCard icon="work" label="Lowongan Aktif" value={42} trend="8 baru" trendUp iconBgClass="bg-blue-50" iconTextClass="text-blue-700" />
        <StatCard icon="analytics" label="Match Rate" value="78%" iconBgClass="bg-tertiary-fixed" iconTextClass="text-tertiary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
          <h2 className="font-headline text-xl font-bold text-on-background mb-6">Distribusi Pengguna</h2>
          <div className="space-y-4">
            {[
              { role: "Mahasiswa", count: 980, pct: 78, color: "bg-primary" },
              { role: "HR / Recruiter", count: 215, pct: 17, color: "bg-tertiary" },
              { role: "Administrator", count: 53, pct: 5, color: "bg-secondary" },
            ].map((r) => (
              <div key={r.role}>
                <div className="flex justify-between mb-2">
                  <span className="font-label text-sm text-on-surface-variant">{r.role}</span>
                  <span className="font-label text-sm font-bold text-on-background">{r.count} ({r.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
          <h2 className="font-headline text-xl font-bold text-on-background mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Kelola Pengguna", icon: "group", href: "/admin/users" },
              { label: "Kelola CLO", icon: "school", href: "/admin/clo" },
              { label: "Kelola Nilai", icon: "grade", href: "/admin/grades" },
              { label: "Notifikasi", icon: "notifications", href: "/notifications" },
            ].map((a) => (
              <Link key={a.label} href={a.href} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-surface-container-high transition-colors group">
                <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center group-hover:bg-primary-container transition-colors">
                  <Icon name={a.icon} className="text-primary group-hover:text-on-primary-container" />
                </div>
                <span className="font-label text-sm text-on-surface-variant text-center">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
        <h2 className="font-headline text-xl font-bold text-on-background mb-6">Aktivitas Terbaru</h2>
        <div className="space-y-4">
          {[
            { text: "Pengguna baru terdaftar: Rina Kusuma (Mahasiswa)", time: "5 menit lalu", icon: "person_add" },
            { text: "CLO baru ditambahkan: CLO-07 Machine Learning", time: "1 jam lalu", icon: "school" },
            { text: "Lowongan baru: Data Scientist di AI Labs", time: "3 jam lalu", icon: "work" },
            { text: "Nilai diperbarui: Basis Data Semester 6", time: "Kemarin", icon: "grade" },
          ].map((act, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors">
              <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center"><Icon name={act.icon} className="text-on-surface-variant" size={20} /></div>
              <div className="flex-1">
                <p className="font-body text-sm text-on-background">{act.text}</p>
                <p className="font-label text-xs text-on-surface-variant">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
