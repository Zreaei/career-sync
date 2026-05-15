"use client";

import FilterSelect from "@/components/ui/FilterSelect";
import Icon from "@/components/ui/Icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState } from "react";

/* ── Dummy data: Mata Kuliah → CLOs with grades ── */
const coursesData = [
  {
    id: "MK-01",
    name: "Pemrograman Web",
    semester: 5,
    sks: 3,
    clos: [
      {
        code: "CLO1",
        description:
          "Mampu membuat REST API menggunakan framework modern (Laravel/Express)",
        grade: "A",
        weight: 1.0,
      },
      {
        code: "CLO2",
        description:
          "Mampu membangun antarmuka web responsif dengan HTML, CSS, dan JavaScript/React",
        grade: "A-",
        weight: 0.9,
      },
      {
        code: "CLO3",
        description:
          "Mampu melakukan deployment aplikasi web ke server production",
        grade: "B+",
        weight: 0.8,
      },
    ],
  },
  {
    id: "MK-02",
    name: "Basis Data",
    semester: 4,
    sks: 3,
    clos: [
      {
        code: "CLO1",
        description:
          "Mampu merancang dan mengimplementasikan skema database relasional (SQL)",
        grade: "B+",
        weight: 0.8,
      },
      {
        code: "CLO2",
        description:
          "Mampu menulis query SQL kompleks termasuk JOIN, subquery, dan agregasi",
        grade: "A",
        weight: 1.0,
      },
      {
        code: "CLO3",
        description:
          "Mampu melakukan optimasi query dan indexing untuk performa database",
        grade: "B",
        weight: 0.7,
      },
    ],
  },
  {
    id: "MK-03",
    name: "Pengembangan Aplikasi Mobile",
    semester: 6,
    sks: 3,
    clos: [
      {
        code: "CLO1",
        description:
          "Mampu membuat aplikasi Android menggunakan Kotlin dan Jetpack Compose",
        grade: "C+",
        weight: 0.5,
      },
      {
        code: "CLO2",
        description: "Mampu mengintegrasikan REST API dengan aplikasi mobile",
        grade: "B",
        weight: 0.7,
      },
      {
        code: "CLO3",
        description: "Mampu mempublikasikan aplikasi ke Google Play Store",
        grade: "C",
        weight: 0.4,
      },
    ],
  },
  {
    id: "MK-04",
    name: "Keamanan Informasi",
    semester: 6,
    sks: 3,
    clos: [
      {
        code: "CLO1",
        description: "Memahami konsep kriptografi dasar dan penerapannya",
        grade: "B+",
        weight: 0.8,
      },
      {
        code: "CLO2",
        description:
          "Mampu melakukan vulnerability assessment dan penetration testing dasar",
        grade: "B",
        weight: 0.7,
      },
      {
        code: "CLO3",
        description: "Memahami standar keamanan OWASP Top 10 dan mitigasinya",
        grade: "A-",
        weight: 0.9,
      },
    ],
  },
  {
    id: "MK-05",
    name: "Software Engineering",
    semester: 5,
    sks: 3,
    clos: [
      {
        code: "CLO1",
        description:
          "Mampu menerapkan metodologi Agile/Scrum dalam pengembangan perangkat lunak",
        grade: "A",
        weight: 1.0,
      },
      {
        code: "CLO2",
        description:
          "Mampu menggunakan version control (Git) dan CI/CD pipeline",
        grade: "A",
        weight: 1.0,
      },
      {
        code: "CLO3",
        description: "Mampu menulis unit test dan integration test",
        grade: "B+",
        weight: 0.8,
      },
    ],
  },
  {
    id: "MK-06",
    name: "Kecerdasan Buatan",
    semester: 7,
    sks: 3,
    clos: [
      {
        code: "CLO1",
        description:
          "Memahami konsep dasar machine learning (supervised, unsupervised)",
        grade: "B",
        weight: 0.7,
      },
      {
        code: "CLO2",
        description:
          "Mampu mengimplementasikan model ML menggunakan Python dan scikit-learn",
        grade: "B-",
        weight: 0.6,
      },
      {
        code: "CLO3",
        description:
          "Mampu mengevaluasi performa model dan melakukan tuning hyperparameter",
        grade: "C+",
        weight: 0.5,
      },
    ],
  },
];

function gradeColor(grade: string) {
  if (grade.startsWith("A")) return "text-green-700 bg-green-50";
  if (grade.startsWith("B")) return "text-blue-700 bg-blue-50";
  return "text-tertiary bg-tertiary-fixed";
}

function gradeToNumeric(grade: string): number {
  const map: Record<string, number> = {
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    D: 1.0,
    E: 0,
  };
  return map[grade] ?? 0;
}

export default function ProfilePage() {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(
    coursesData[0].id,
  );
  const [filterSemester, setFilterSemester] = useState("all");

  const totalCLOs = coursesData.reduce((acc, c) => acc + c.clos.length, 0);
  const allGrades = coursesData.flatMap((c) =>
    c.clos.map((cl) => gradeToNumeric(cl.grade)),
  );
  const avgGPA = (
    allGrades.reduce((a, b) => a + b, 0) / allGrades.length
  ).toFixed(2);

  const semesters = [...new Set(coursesData.map((c) => c.semester))].sort();
  const filteredCourses =
    filterSemester === "all"
      ? coursesData
      : coursesData.filter((c) => c.semester === Number(filterSemester));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold text-on-background">
          Profil Kompetensi
        </h1>
        <p className="font-body text-on-surface-variant">
          Lihat semua mata kuliah dan Course Learning Outcomes (CLO) beserta
          nilai Anda.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient ghost-border">
          <div className="w-10 h-10 bg-primary-fixed rounded-xl flex items-center justify-center mb-3">
            <Icon name="menu_book" className="text-primary" size={20} />
          </div>
          <p className="font-label text-xs text-on-surface-variant">
            Mata Kuliah
          </p>
          <p className="font-headline text-2xl font-bold text-on-background">
            {coursesData.length}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient ghost-border">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <Icon name="school" className="text-green-700" size={20} />
          </div>
          <p className="font-label text-xs text-on-surface-variant">
            Total CLO
          </p>
          <p className="font-headline text-2xl font-bold text-on-background">
            {totalCLOs}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient ghost-border">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <Icon name="trending_up" className="text-blue-700" size={20} />
          </div>
          <p className="font-label text-xs text-on-surface-variant">
            Rata-rata Nilai
          </p>
          <p className="font-headline text-2xl font-bold text-on-background">
            {avgGPA}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient ghost-border">
          <div className="w-10 h-10 bg-tertiary-fixed rounded-xl flex items-center justify-center mb-3">
            <Icon name="emoji_events" className="text-tertiary" size={20} />
          </div>
          <p className="font-label text-xs text-on-surface-variant">
            Total SKS
          </p>
          <p className="font-headline text-2xl font-bold text-on-background">
            {coursesData.reduce((a, c) => a + c.sks, 0)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient ghost-border flex items-center gap-4">
        <FilterSelect
          label="Semester"
          icon="filter_list"
          value={filterSemester}
          onChange={setFilterSemester}
          options={[
            { value: "all", label: "Semua Semester" },
            ...semesters.map((s) => ({
              value: String(s),
              label: `Semester ${s}`,
            })),
          ]}
        />
        <span className="font-label text-xs text-on-surface-variant ml-auto">
          {filteredCourses.length} mata kuliah ·{" "}
          {filteredCourses.reduce((a, c) => a + c.clos.length, 0)} CLO
        </span>
      </div>

      {/* Courses Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient ghost-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
              <TableHead className="w-18">Kode</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead className="w-20 text-center">Semester</TableHead>
              <TableHead className="w-16 text-center">SKS</TableHead>
              <TableHead className="w-16 text-center">CLO</TableHead>
              <TableHead className="w-24 text-center">Nilai</TableHead>
              <TableHead className="w-12 text-right">{/* expand */}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => {
              const isExpanded = expandedCourse === course.id;
              const courseAvg =
                course.clos.reduce(
                  (sum, clo) => sum + gradeToNumeric(clo.grade),
                  0,
                ) / course.clos.length;
              const avgLetter =
                courseAvg >= 3.7
                  ? "A"
                  : courseAvg >= 3.3
                    ? "B+"
                    : courseAvg >= 3.0
                      ? "B"
                      : courseAvg >= 2.7
                        ? "B-"
                        : courseAvg >= 2.3
                          ? "C+"
                          : courseAvg >= 2.0
                            ? "C"
                            : "D";

              return (
                <React.Fragment key={course.id}>
                  {/* Course Row */}
                  <TableRow
                    onClick={() =>
                      setExpandedCourse(isExpanded ? null : course.id)
                    }
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <span className="font-label text-[11px] font-bold text-primary bg-primary-fixed/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {course.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-body text-sm font-medium text-on-background">
                        {course.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-label text-sm text-on-surface-variant">
                        {course.semester}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-label text-sm text-on-surface-variant">
                        {course.sks}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-label text-sm font-bold text-on-background">
                        {course.clos.length}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label text-xs font-bold ${gradeColor(avgLetter)}`}
                      >
                        {avgLetter}
                        <span className="font-normal text-[10px] opacity-70">
                          ({courseAvg.toFixed(1)})
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Icon
                        name={isExpanded ? "expand_less" : "expand_more"}
                        className="text-on-surface-variant"
                        size={20}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Expanded CLO Detail Rows */}
                  {isExpanded && (
                    <>
                      <TableRow className="bg-surface-container-low/50 hover:bg-surface-container-low/50">
                        <TableCell colSpan={7} className="py-2">
                          <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                            Course Learning Outcomes (CLO)
                          </span>
                        </TableCell>
                      </TableRow>
                      {course.clos.map((clo) => (
                        <TableRow
                          key={`${course.id}-${clo.code}`}
                          className="bg-surface-container-low/30 hover:bg-surface-container-low/50"
                        >
                          <TableCell colSpan={2}>
                            <div className="flex items-center gap-2">
                              <span className="font-label text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded whitespace-nowrap">
                                {clo.code}
                              </span>
                              <span className="font-body text-sm text-on-surface-variant">
                                {clo.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell colSpan={2} className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${clo.weight * 100}%` }}
                                />
                              </div>
                              <span className="font-label text-xs text-on-surface-variant">
                                Bobot {(clo.weight * 100).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full font-label text-xs font-bold ${gradeColor(clo.grade)}`}
                            >
                              {clo.grade}
                            </span>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <Icon name="school" className="text-outline mx-auto mb-4" size={48} />
          <p className="font-headline text-lg text-on-surface-variant">
            Tidak ada mata kuliah untuk semester ini
          </p>
        </div>
      )}
    </div>
  );
}
