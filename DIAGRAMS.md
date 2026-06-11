# CareerSync — System Diagrams

> Render dengan VS Code extension **Markdown Preview Mermaid Support** atau paste ke [mermaid.live](https://mermaid.live).

---

## 1. Architecture Diagram

```mermaid
graph TD
    subgraph CLIENT["Frontend (Web Browser)"]
        APP["Aplikasi Web\n(Next.js + React)"]
    end

    subgraph SUPABASE["Platform Backend (Supabase)"]
        AUTH["Autentikasi\n(Email / JWT)"]
        API["REST API\n(Akses Data)"]
        REALTIME["Notifikasi Real-time"]
        EDGE["Logika Bisnis\n(Provisioning Akun)"]
        RLS["Kebijakan Akses\n(Per Peran)"]
    end

    subgraph DB["Basis Data (PostgreSQL)"]
        ACADEMIC["Data Akademik\n(Mahasiswa, Prodi, Nilai, CLO)"]
        RECRUIT["Data Rekrutmen\n(Lowongan, Lamaran, Undangan)"]
        SYSTEM["Data Sistem\n(Pengguna, Peran)"]
    end

    APP --> AUTH
    APP --> API
    APP --> REALTIME
    APP --> EDGE

    AUTH --> SYSTEM
    API --> RLS
    RLS --> ACADEMIC
    RLS --> RECRUIT
    RLS --> SYSTEM
    REALTIME --> ACADEMIC
    REALTIME --> RECRUIT
    EDGE --> DB
```

---

## 2. Flowchart — Autentikasi & Routing Peran

```mermaid
flowchart TD
    START([Pengguna Membuka Aplikasi]) --> LOGIN[Halaman Login]
    LOGIN --> INPUT[Masukkan Email & Password]
    INPUT --> AUTH{Autentikasi\nBerhasil?}

    AUTH -- Gagal --> ERROR[Tampilkan Pesan Error]
    ERROR --> LOGIN

    AUTH -- Berhasil --> ROLE{Peran Pengguna?}
    ROLE -- Mahasiswa --> SDASH[Dashboard Mahasiswa]
    ROLE -- Admin Prodi --> ADASH[Dashboard Admin Prodi]
    ROLE -- HR / Rekruter --> HRDASH[Dashboard HR]
    ROLE -- Superadmin --> SADASH[Dashboard Superadmin]

    SDASH & ADASH & HRDASH & SADASH --> ACCESS{Akses\nDiizinkan?}
    ACCESS -- Tidak --> LOGIN
    ACCESS -- Ya --> CONTENT[Tampilkan Halaman]
```

---

## 3. Flowchart — Job Matching & Lamaran

```mermaid
flowchart TD
    STUDENT([Mahasiswa]) --> JOBMATCH[Buka Halaman Job Matching]
    JOBMATCH --> LOAD[Sistem Memuat Profil Akademik & Daftar Lowongan]
    LOAD --> ALGO[AI Menghitung Skor Kecocokan Mahasiswa ↔ Lowongan]
    ALGO --> DISPLAY[Tampilkan Rekomendasi Lowongan Berurut]

    DISPLAY --> APPLY[Mahasiswa Melamar Pekerjaan]
    APPLY --> HRNOTIF[HR Menerima Notifikasi Lamaran Masuk]

    HRNOTIF --> REVIEW[HR Meninjau Lamaran]
    REVIEW --> DECIDE{Keputusan HR}
    DECIDE -- Diterima --> ACCEPTED[Status: Diterima]
    DECIDE -- Ditolak --> REJECTED[Status: Ditolak]

    ACCEPTED & REJECTED --> STUDENTNOTIF[Mahasiswa Menerima Notifikasi Hasil]
```

---

## 4. ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        string email
    }

    USER_ROLES {
        uuid user_id PK,FK
        string role
        uuid scope_id
    }

    PRODI {
        uuid id PK
        string name
        string fakultas
        string integration_status
    }

    STUDENTS {
        uuid id PK
        uuid user_id FK
        string nim
        string name
        string email
        int angkatan
        uuid prodi_id FK
        string status
    }

    ADMIN_USERS {
        uuid id PK
        uuid user_id FK
        string name
        string email
        uuid prodi_id FK
        timestamp deleted_at
    }

    MATKUL {
        uuid id PK
        string kode
        string nama
        int sks
        int semester
        text deskripsi
        uuid prodi_id FK
    }

    CLOS {
        uuid id PK
        uuid matkul_id FK
        string clo_code
        text clo_text
        vector embedding
    }

    GRADE_SCALE {
        string letter PK
        float weight
    }

    STUDENT_CLOS {
        uuid student_id PK,FK
        uuid clo_id PK,FK
        string grade FK
    }

    COMPANIES {
        uuid id PK
        string name
        string industry
        string location
        string size
        string founded
        string website
        string logo_icon
        boolean verified
        text description
    }

    HR_PROFILES {
        uuid id PK
        uuid user_id FK
        string name
        string position
        uuid company_id FK
    }

    JOBS {
        uuid id PK
        uuid hr_id FK
        uuid company_id FK
        string title
        string location
        string job_type
        text description
        string status
        string salary
        string category
        timestamp posted_at
        timestamp deadline
        timestamp closed_at
    }

    JOB_SKILLS {
        uuid job_id PK,FK
        string skill PK
    }

    REQUIREMENTS {
        uuid id PK
        uuid job_id FK
        text req_text
        vector embedding
        string embedding_status
        int position
    }

    APPLICATIONS {
        uuid id PK
        uuid student_id FK
        uuid job_id FK
        float match_score
        string status
        timestamp applied_at
        timestamp updated_at
    }

    APPLICATION_MATCHES {
        uuid application_id PK,FK
        uuid clo_id PK,FK
        uuid requirement_id FK
        float similarity
        float grade_weight
        float contribution
    }

    TALENT_INVITATIONS {
        uuid id PK
        uuid hr_id FK
        uuid student_id FK
        uuid job_id FK
        string status
        timestamp sent_at
        timestamp responded_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        jsonb payload
        timestamp read_at
        timestamp created_at
    }

    AUTH_USERS ||--o{ USER_ROLES : "has role"
    AUTH_USERS ||--o| STUDENTS : "is"
    AUTH_USERS ||--o| ADMIN_USERS : "is"
    AUTH_USERS ||--o| HR_PROFILES : "is"
    AUTH_USERS ||--o{ NOTIFICATIONS : "receives"

    PRODI ||--o{ STUDENTS : "has"
    PRODI ||--o{ ADMIN_USERS : "managed by"
    PRODI ||--o{ MATKUL : "has"

    MATKUL ||--o{ CLOS : "has"
    CLOS ||--o{ STUDENT_CLOS : "graded in"
    STUDENTS ||--o{ STUDENT_CLOS : "has grades"
    GRADE_SCALE ||--o{ STUDENT_CLOS : "defines weight"

    COMPANIES ||--o{ HR_PROFILES : "employs"
    COMPANIES ||--o{ JOBS : "posts"
    HR_PROFILES ||--o{ JOBS : "creates"
    JOBS ||--o{ JOB_SKILLS : "requires"
    JOBS ||--o{ REQUIREMENTS : "has"
    JOBS ||--o{ APPLICATIONS : "receives"
    JOBS ||--o{ TALENT_INVITATIONS : "for"

    STUDENTS ||--o{ APPLICATIONS : "submits"
    STUDENTS ||--o{ TALENT_INVITATIONS : "receives"
    HR_PROFILES ||--o{ TALENT_INVITATIONS : "sends"

    APPLICATIONS ||--o{ APPLICATION_MATCHES : "detail per CLO"
    CLOS ||--o{ APPLICATION_MATCHES : "matched via"
    REQUIREMENTS ||--o{ APPLICATION_MATCHES : "matched via"
```

---

## 5. Use Case Diagram

```mermaid
flowchart LR
    S(("Mahasiswa"))
    A(("Admin Prodi"))
    HR(("HR / Rekruter"))
    SA(("Superadmin"))

    subgraph SYSTEM["CareerSync System"]
        subgraph AUTH["Autentikasi"]
            UC_LOGIN(["Masuk"])
            UC_LOGOUT(["Keluar"])
            UC_CHANGEPW(["Ganti Password"])
        end

        subgraph STUDENT_MOD["Modul Mahasiswa"]
            UC_S_DASH(["Lihat Dashboard"])
            UC_S_PROFILE(["Lihat Profil & Transkrip"])
            UC_S_BROWSE(["Cari Lowongan Kerja"])
            UC_S_MATCH(["Lihat Rekomendasi AI"])
            UC_S_APPLY(["Lamar Pekerjaan"])
            UC_S_TRACK(["Lacak Status Lamaran"])
            UC_S_INVITE(["Terima Undangan Talent"])
            UC_S_NOTIF(["Lihat Notifikasi"])
        end

        subgraph ADMIN_MOD["Modul Admin Prodi"]
            UC_A_DASH(["Lihat Dashboard Prodi"])
            UC_A_STUDENTS(["Kelola Data Mahasiswa"])
            UC_A_MATKUL(["Kelola Mata Kuliah"])
            UC_A_CLO(["Kelola CLO"])
            UC_A_GRADES(["Input & Edit Nilai"])
        end

        subgraph HR_MOD["Modul HR"]
            UC_HR_DASH(["Lihat Dashboard Rekrutmen"])
            UC_HR_JOBS(["Kelola Lowongan Kerja"])
            UC_HR_APP(["Tinjau Lamaran Masuk"])
            UC_HR_TALENT(["Jelajahi Talent Pool"])
            UC_HR_INVITE(["Kirim Undangan Talent"])
            UC_HR_PROFILE(["Kelola Profil Perusahaan"])
        end

        subgraph SA_MOD["Modul Superadmin"]
            UC_SA_DASH(["Lihat Dashboard Sistem"])
            UC_SA_ADMINS(["Kelola Admin Prodi"])
            UC_SA_PRODI(["Kelola Data Program Studi"])
        end
    end

    S --> UC_LOGIN & UC_LOGOUT & UC_CHANGEPW
    A --> UC_LOGIN & UC_LOGOUT & UC_CHANGEPW
    HR --> UC_LOGIN & UC_LOGOUT & UC_CHANGEPW
    SA --> UC_LOGIN & UC_LOGOUT & UC_CHANGEPW

    S --> UC_S_DASH & UC_S_PROFILE & UC_S_BROWSE & UC_S_MATCH
    S --> UC_S_APPLY & UC_S_TRACK & UC_S_INVITE & UC_S_NOTIF

    A --> UC_A_DASH & UC_A_STUDENTS & UC_A_MATKUL & UC_A_CLO & UC_A_GRADES

    HR --> UC_HR_DASH & UC_HR_JOBS & UC_HR_APP & UC_HR_TALENT & UC_HR_INVITE & UC_HR_PROFILE

    SA --> UC_SA_DASH & UC_SA_ADMINS & UC_SA_PRODI

    UC_S_MATCH -.->|include| UC_S_BROWSE
    UC_S_APPLY -.->|extend| UC_S_MATCH
    UC_HR_INVITE -.->|include| UC_HR_TALENT
    UC_A_CLO -.->|include| UC_A_MATKUL
    UC_A_GRADES -.->|include| UC_A_CLO
```

---

## Cara Render

| Diagram | Tool |
|---------|------|
| Semua diagram | VS Code: install **Markdown Preview Mermaid Support** lalu buka Preview |
| Semua diagram | [mermaid.live](https://mermaid.live) — paste isi blok kode |
| Semua diagram (alternatif) | [draw.io](https://draw.io) — bisa import Mermaid langsung |
