"use client";

import FilterSelect from "@/components/ui/FilterSelect";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { useMemo, useState } from "react";

const allJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechIndo",
    match: 52.8,
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 8-12 jt",
    requirements: 4,
    posted: "2 hari lalu",
  },
  {
    id: 2,
    title: "Android Developer",
    company: "Google Indonesia",
    match: 54.6,
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 15-25 jt",
    requirements: 5,
    posted: "1 hari lalu",
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "DataCorp",
    match: 43.2,
    location: "Bandung",
    type: "Full-time",
    salary: "Rp 7-10 jt",
    requirements: 4,
    posted: "3 hari lalu",
  },
  {
    id: 4,
    title: "Backend Developer",
    company: "CloudID",
    match: 61.5,
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 10-15 jt",
    requirements: 4,
    posted: "1 hari lalu",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "NetSol",
    match: 35.7,
    location: "Surabaya",
    type: "Contract",
    salary: "Rp 9-14 jt",
    requirements: 5,
    posted: "5 hari lalu",
  },
  {
    id: 6,
    title: "Machine Learning Engineer",
    company: "AI Labs",
    match: 38.4,
    location: "Remote",
    type: "Full-time",
    salary: "Rp 12-18 jt",
    requirements: 5,
    posted: "1 minggu lalu",
  },
  {
    id: 7,
    title: "Full-stack Developer",
    company: "Tokopedia",
    match: 58.1,
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 12-20 jt",
    requirements: 5,
    posted: "2 hari lalu",
  },
  {
    id: 8,
    title: "UI/UX Designer",
    company: "DesignLab",
    match: 29.5,
    location: "Yogyakarta",
    type: "Part-time",
    salary: "Rp 5-8 jt",
    requirements: 3,
    posted: "4 hari lalu",
  },
];

function getMatchColor(match: number) {
  if (match >= 55) return "text-green-700 bg-green-50";
  if (match >= 40) return "text-primary bg-primary-fixed";
  return "text-tertiary bg-tertiary-fixed";
}

function getMatchLabel(match: number) {
  if (match >= 55) return "Tinggi";
  if (match >= 40) return "Sedang";
  return "Rendah";
}

export default function JobMatchingPage() {
  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match_desc");

  const filteredJobs = useMemo(() => {
    let result = allJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchesMatch =
        matchFilter === "all" ||
        (matchFilter === "high" && job.match >= 55) ||
        (matchFilter === "medium" && job.match >= 40 && job.match < 55) ||
        (matchFilter === "low" && job.match < 40);
      const matchesType = typeFilter === "all" || job.type === typeFilter;
      return matchesSearch && matchesMatch && matchesType;
    });

    result.sort((a, b) => {
      if (sortBy === "match_desc") return b.match - a.match;
      if (sortBy === "match_asc") return a.match - b.match;
      return 0;
    });

    return result;
  }, [search, matchFilter, typeFilter, sortBy]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold text-on-background">
          Job Matching
        </h1>
        <p className="font-body text-on-surface-variant">
          Rekomendasi lowongan berdasarkan pencocokan CLO dan kompetensi Anda
          menggunakan Sentence-BERT.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
        {/* Search */}
        <div className="relative mb-4">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Cari lowongan atau perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
              font-body text-sm placeholder:text-outline transition-all"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Match Level"
            icon="bar_chart_4_bars"
            value={matchFilter}
            onChange={setMatchFilter}
            options={[
              { value: "all", label: "Semua Level" },
              { value: "high", label: "Tinggi (≥55%)" },
              { value: "medium", label: "Sedang (40–55%)" },
              { value: "low", label: "Rendah (<40%)" },
            ]}
          />
          <FilterSelect
            label="Tipe Pekerjaan"
            icon="work"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "Semua Tipe" },
              { value: "Full-time", label: "Full-time" },
              { value: "Part-time", label: "Part-time" },
              { value: "Contract", label: "Contract" },
            ]}
          />
          <FilterSelect
            label="Urutkan"
            icon="sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "match_desc", label: "Match Tertinggi" },
              { value: "match_asc", label: "Match Terendah" },
            ]}
          />

          {/* Active filter badges */}
          {(matchFilter !== "all" || typeFilter !== "all" || search) && (
            <button
              onClick={() => {
                setMatchFilter("all");
                setTypeFilter("all");
                setSearch("");
              }}
              className="ml-auto flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-label text-xs text-error 
                hover:bg-error-container transition-colors self-end"
            >
              <Icon name="close" size={14} />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="font-label text-sm text-on-surface-variant">
        Menampilkan {filteredJobs.length} dari {allJobs.length} lowongan
      </p>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border hover:bg-surface-container-high transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-headline text-lg font-bold text-on-background group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="font-label text-sm text-on-surface-variant mt-1">
                  {job.company}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-3 py-1 rounded-full font-label text-sm font-bold ${getMatchColor(job.match)}`}
                >
                  {job.match.toFixed(1)}%
                </span>
                <span className="font-label text-[10px] text-on-surface-variant">
                  {getMatchLabel(job.match)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-3">
              <span className="font-label text-xs text-on-surface-variant">
                {job.requirements} requirements dianalisis
              </span>
            </div>

            <div className="flex items-center gap-4 font-label text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Icon name="location_on" size={16} />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="work" size={16} />
                {job.type}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="payments" size={16} />
                {job.salary}
              </span>
              <span className="ml-auto text-outline">{job.posted}</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16">
          <Icon
            name="search_off"
            className="text-outline mx-auto mb-4"
            size={48}
          />
          <p className="font-headline text-lg text-on-surface-variant">
            Tidak ada lowongan yang ditemukan
          </p>
          <p className="font-body text-sm text-outline mt-2">
            Coba ubah filter atau kata kunci pencarian
          </p>
        </div>
      )}
    </div>
  );
}
