Tentu. Berikut PRD yang bisa kita jadikan **dokumen acuan utama pengembangan website portfolio**. Saya buat dengan konsep **GitHub Pages + Firebase Auth + Firestore + Firebase Storage**, serta mendukung link ke GitHub, website Nobar, dashboard monitoring, dan project lainnya.

# PRD — Website Portfolio Aidil Febrian

**Versi:** 1.0
**Tanggal:** 8 Oktober 2026
**Platform:** Web
**Hosting:** GitHub Pages
**Backend:** Firebase
**Frontend:** HTML, CSS, JavaScript

---

## 1. Ringkasan Produk

Website Portfolio Aidil Febrian merupakan website personal yang digunakan untuk menampilkan profil, keahlian, pengalaman, serta berbagai proyek yang telah dikembangkan.

Website memiliki dua sisi:

1. **Public Portfolio** — dapat diakses semua pengunjung tanpa login.
2. **Admin Dashboard** — digunakan oleh pemilik website untuk mengelola konten portfolio dan hanya dapat diakses setelah autentikasi Firebase.

Sistem dirancang agar penambahan proyek baru tidak membutuhkan perubahan kode pada halaman portfolio. Admin cukup login, mengisi data proyek melalui dashboard, kemudian proyek akan ditampilkan secara otomatis pada website.

---

# 2. Tujuan Produk

### Tujuan utama

* Membuat portfolio profesional yang menampilkan kemampuan di bidang teknik elektro, IoT, embedded system, dan software.
* Menampilkan proyek secara terstruktur dan menarik.
* Memudahkan penambahan, pengeditan, dan penghapusan proyek.
* Menyediakan akses langsung ke source code GitHub.
* Menyediakan link ke website/demo/monitoring dari setiap proyek.
* Menyediakan halaman detail untuk menjelaskan proses dan teknologi proyek.
* Memisahkan area publik dan area administrasi.

### Tujuan jangka panjang

Website dapat berkembang menjadi **pusat seluruh proyek digital dan engineering** yang pernah dibuat.

---

# 3. Target Pengguna

### 3.1 Pengunjung umum

Contohnya:

* Recruiter
* HR perusahaan
* Engineer
* Dosen
* Teman/kolaborator
* Pengunjung umum

Mereka dapat melihat:

* Profil
* Skills
* Projects
* Source code
* Demo
* Monitoring
* Website yang dibuat

Tanpa harus login.

### 3.2 Admin / Owner

Admin adalah pemilik portfolio.

Admin dapat:

* Login
* Menambah proyek
* Mengedit proyek
* Menghapus proyek
* Mengunggah gambar
* Menambahkan repository GitHub
* Menambahkan link monitoring
* Menambahkan link website
* Mengatur status project
* Mengelola informasi portfolio

---

# 4. Teknologi

| Komponen        | Teknologi               |
| --------------- | ----------------------- |
| Frontend        | HTML5                   |
| Styling         | CSS3                    |
| Logic           | JavaScript              |
| Hosting         | GitHub Pages            |
| Authentication  | Firebase Authentication |
| Database        | Cloud Firestore         |
| File Storage    | Firebase Storage        |
| Source Code     | GitHub                  |
| Version Control | Git/GitHub              |

---

# 5. Arsitektur Sistem

```text
                         INTERNET
                            │
                            ▼
                  ┌──────────────────┐
                  │   GitHub Pages   │
                  │                  │
                  │ HTML/CSS/JS      │
                  └────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
       Firebase Auth   Firestore      Storage
             │             │             │
             │             │             │
          Login        Project Data    Images
             │             │
             └─────────────┘
                           │
                           ▼
                        GitHub
                           │
                       Source Code
```

---

# 6. Struktur Halaman Public

Seluruh website publik berada di **satu halaman** (`index.html`). Tidak ada
file HTML publik lain. Perpindahan antar bagian memakai anchor, detail project
membuka modal lewat hash.

## 6.1 Halaman Tunggal

URL:

```text
/
```

Urutan section:

| Anchor | Section | Isi |
| --- | --- | --- |
| `#home` | Hero | Navbar, hero, social links, CTA |
| `#about` | About | Profil, kontak, pendidikan, pengalaman, minat |
| `#projects` | Projects | Semua project + filter kategori + sorting |
| `#skills` | Skills | Skills dari database, background engineering, timeline, tools |
| `#certifications` | Sertifikasi | Kartu sertifikat |
| `#interest` | Minat | Technology interest & hobi |
| `#contact` | Contact | CTA email / WhatsApp / GitHub |

Footer berada di luar anchor (selalu di bawah halaman).

---

## 6.2 Daftar Project

Bagian `#projects` menampilkan seluruh project yang berstatus:

```text
published
```

Fitur:

* Search ( judul, deskripsi, teknologi, hardware, kategori, tahun )
* Filter berdasarkan kategori
* Project card
* Sorting project terbaru / terlama / A-Z

Contoh kategori:

```text
All
IoT
Embedded
Electrical
Web
AI
Automation
```

---

## 6.3 Detail Project (Modal)

Tidak ada halaman terpisah. Detail project dibuka sebagai **modal overlay**
di atas halaman, lewat hash:

```text
/#project/arduino-agv
```

Aturan:

* Modal dibuka dari hash `#project/<slug>` saat halaman dimuat maupun saat
  hash berubah, sehingga URL bisa dibagikan.
* Tombol Back browser / tombol tutup / Escape / klik backdrop menutup modal.
* Scroll body dikunci selama modal terbuka, dan dilepas lagi saat ditutup.
* Badge "Featured" tetap muncul di card project yang ditandai.

Isi modal:

* Judul
* Cover image
* Gallery
* Deskripsi
* Features
* Hardware
* Technologies
* Project status
* GitHub
* Live Demo
* Monitoring
* Website
* Documentation
* Custom links
* Project terkait

---

# 7. Project Card

Setiap project ditampilkan dalam bentuk card.

```text
┌─────────────────────────────┐
│                             │
│       PROJECT IMAGE         │
│                             │
├─────────────────────────────┤
│ Arduino UNO Q AGV           │
│                             │
│ Robot AGV dengan mecanum    │
│ wheel.                      │
│                             │
│ Arduino • C++ • Embedded    │
│                             │
│ [ View Project ]            │
└─────────────────────────────┘
```

---

# 8. Project Links

Setiap project dapat mempunyai beberapa link.

Jenis link standar:

* GitHub
* Live Demo
* Monitoring
* Website
* Documentation
* YouTube
* Download
* Custom

Contoh:

```text
Arduino AGV

[ GitHub ↗ ]
[ Live Demo ↗ ]
[ Documentation ↗ ]
```

Project IoT:

```text
IoT Monitoring PLTA

[ GitHub ↗ ]
[ Monitoring ↗ ]
[ Documentation ↗ ]
```

Project website:

```text
Nobar Website

[ Website ↗ ]
[ GitHub ↗ ]
```

---

# 9. Sistem Source Code

Project dapat mempunyai source code dari GitHub.

Contoh:

```text
Source Code

GitHub Repository
https://github.com/username/project

[ View Repository ↗ ]
```

Pada pengembangan berikutnya dapat ditambahkan:

* Repository
* Branch
* Folder
* File tertentu

Sehingga portfolio dapat mengarahkan pengunjung langsung ke bagian kode yang relevan.

---

# 10. Admin Authentication

URL:

```text
/admin/
```

Jika belum login:

```text
/admin
   │
   ▼
Firebase Authentication
   │
   ▼
Login Page
```

Jika berhasil:

```text
Firebase Authentication
          │
          ▼
      Dashboard
```

Jika gagal:

```text
Login gagal
     │
     ▼
Pesan error
```

---

# 11. Admin Dashboard

Dashboard:

```text
/admin/index.html
```

Layout:

```text
┌───────────────┬─────────────────────────────┐
│ AIDIL ADMIN   │ Dashboard                   │
│               │                             │
│ Dashboard     │ Projects        12          │
│ Projects      │ Published       10          │
│ Skills        │ Draft            2          │
│ Settings      │                             │
│               │ Recent Projects             │
│ Logout        │                             │
└───────────────┴─────────────────────────────┘
```

---

# 12. Admin — Project Management

Menu:

```text
Projects
```

Menampilkan:

| Project     | Category   | Status    | Action      |
| ----------- | ---------- | --------- | ----------- |
| Arduino AGV | Embedded   | Published | Edit/Delete |
| IoT PLTA    | IoT        | Published | Edit/Delete |
| Mini PLTA   | Electrical | Published | Edit/Delete |

Tombol:

```text
+ Add Project
```

---

# 13. Add/Edit Project

Form:

### Basic Information

```text
Project Title
Slug
Short Description
Description
Category
```

### Technologies

```text
Arduino
ESP32
C++
JavaScript
IoT
AI
```

### Hardware

```text
Arduino UNO Q
ESP32
PT100
Motor
Sensor
```

### Images

```text
Cover Image
Gallery
```

### Links

```text
GitHub
Live Demo
Monitoring
Website
Documentation
Custom Link
```

### Status

```text
Draft
Published
```

---

# 14. Project Status

Dua status utama:

### Draft

Project belum ditampilkan ke publik.

### Published

Project ditampilkan di portfolio.

Contoh workflow:

```text
Create Project
      ↓
     Draft
      ↓
Edit
      ↓
Review
      ↓
Published
      ↓
Public Website
```

---

# 15. Database Firestore

Struktur utama:

```text
projects
│
├── projectId
│   ├── title
│   ├── slug
│   ├── shortDescription
│   ├── description
│   ├── category
│   ├── technologies
│   ├── hardware
│   ├── features
│   ├── coverImage
│   ├── gallery
│   ├── links
│   ├── sourceCode
│   ├── status
│   ├── featured
│   ├── createdAt
│   └── updatedAt
```

---

# 16. Struktur Links

```javascript
links: [
    {
        title: "GitHub Repository",
        type: "github",
        url: "https://github.com/..."
    },
    {
        title: "Monitoring",
        type: "monitoring",
        url: "https://..."
    },
    {
        title: "Live Website",
        type: "website",
        url: "https://..."
    }
]
```

Dengan sistem ini kita tidak perlu menambahkan kolom baru setiap kali ada jenis link baru.

---

# 17. Firebase Storage

Digunakan untuk:

* Cover project
* Project gallery
* Foto hardware
* Screenshot dashboard
* Dokumentasi visual

Struktur:

```text
storage
│
└── projects
    │
    ├── arduino-agv
    │   ├── cover.jpg
    │   ├── 01.jpg
    │   └── 02.jpg
    │
    └── iot-plta
        ├── cover.jpg
        ├── 01.jpg
        └── 02.jpg
```

---

# 18. Keamanan

Admin menggunakan:

**Firebase Authentication**

Database menggunakan:

**Firestore Security Rules**

Storage menggunakan:

**Firebase Storage Rules**

Prinsip:

```text
Public
   │
   ├── READ published projects
   │
   └── WRITE ✗

Admin
   │
   ├── READ ✓
   ├── CREATE ✓
   ├── UPDATE ✓
   └── DELETE ✓
```

Jadi login bukan hanya menyembunyikan dashboard, tetapi database juga harus memvalidasi hak akses.

---

# 19. Landing Page Content

Struktur final (satu halaman, urutan dari atas ke bawah):

```text
INDEX (satu halaman)
│
├── Navbar  (#home #about #projects #skills #contact)
│
├── Hero  #home
│   ├── Name
│   ├── Profession
│   ├── Description
│   └── CTA
│
├── About  #about
│   ├── Portrait
│   ├── Profile
│   ├── Contact list
│
├── Projects  #projects
│   ├── Search
│   ├── Category filter
│   ├── Sort
│   └── Project cards
│
├── Skills  #skills
│   ├── Skills (dari database)
│   ├── What I Build: Electrical / IoT / Embedded / Software
│   ├── Pendidikan & Pengalaman
│   └── Kemampuan & Tools
│
├── Sertifikasi  #certifications
│
├── Minat  #interest
│
├── Contact  #contact
│
├── Modal Detail Project  #project/<slug>
│
└── Footer
```

---

# 20. Gaya Visual

Tema yang direkomendasikan:

**Modern Technical Portfolio**

Karakter:

* Dark theme
* Minimalis
* Profesional
* Modern
* Engineering/technology aesthetic
* Responsive
* Animasi ringan
* Tidak terlalu banyak efek

Inspirasi visual:

```text
Dark Background
      +
Typography besar
      +
Project cards
      +
Subtle grid
      +
Code/engineering aesthetic
```

Website harus tetap terlihat profesional ketika dibuka oleh recruiter melalui laptop maupun smartphone.

---

# 21. Responsive Design

Website wajib mendukung:

```text
Desktop
Laptop
Tablet
Mobile
```

Desktop:

```text
Navbar horizontal
3 project cards
```

Mobile:

```text
☰ Menu

Project
Project
Project
```

---

# 22. Navigasi

Navbar:

```text
Home
About
Projects
Skills
Contact
GitHub
```

Admin tidak ditampilkan pada navbar publik.

Admin mengakses:

```text
/admin
```

---

# 23. Contoh Project dalam Portfolio

Project yang dapat dimasukkan sejak awal:

### 1. Arduino UNO Q Mecanum AGV

Kategori:

```text
Embedded / Robotics
```

Link:

```text
GitHub
Demo
Documentation
```

### 2. IoT Lubricating Oil Monitoring

Kategori:

```text
IoT / Electrical
```

Link:

```text
GitHub
Monitoring
Documentation
```

### 3. Miniature PLTA

Kategori:

```text
Electrical / IoT
```

Link:

```text
GitHub
Demo
```

### 4. Nobar Website

Kategori:

```text
Web
```

Link:

```text
GitHub
Live Website
```

---

# 24. Alur Menambahkan Project

Contoh kamu selesai membuat project baru.

```text
Project selesai
      ↓
Login /admin
      ↓
Projects
      ↓
+ Add Project
      ↓
Isi informasi
      ↓
Upload gambar
      ↓
Masukkan GitHub
      ↓
Masukkan link monitoring/demo
      ↓
Save as Draft
      ↓
Review
      ↓
Publish
      ↓
Project muncul di website
```

Tidak perlu:

```text
Edit HTML
Edit CSS
Edit JavaScript
Git commit
Git push
```

untuk setiap project baru.

---

# 25. MVP — Versi Pertama

Untuk versi pertama, kita **tidak perlu langsung membuat semuanya**.

### Phase 1 — Public Website

* [ ] Navbar
* [ ] Hero
* [ ] About
* [ ] Skills
* [ ] Projects
* [ ] Project detail
* [ ] Contact
* [ ] Responsive design

### Phase 2 — Firebase

* [ ] Firebase project
* [ ] Firestore
* [ ] Firebase Authentication
* [ ] Firebase Storage
* [ ] Security Rules

### Phase 3 — Admin

* [ ] Login
* [ ] Dashboard
* [ ] Project list
* [ ] Add project
* [ ] Edit project
* [ ] Delete project
* [ ] Draft/Published

### Phase 4 — Advanced Project

* [ ] GitHub link
* [ ] Monitoring link
* [ ] Live website
* [ ] Documentation
* [ ] Custom links
* [ ] Gallery
* [ ] Featured project

### Phase 5 — Deployment

```text
GitHub
   ↓
GitHub Pages
   ↓
Portfolio Online
```

---

# 26. Fitur yang sengaja ditunda

Agar versi pertama tidak terlalu kompleks, fitur berikut bisa ditambahkan kemudian:

* Blog
* Visitor analytics
* Contact form dengan database
* Comments
* Project likes
* Search engine optimization lanjutan
* GitHub API integration
* Automatic GitHub repository synchronization
* Dark/light mode
* Multi-admin
* Rich text editor
* Markdown rendering
* Dashboard analytics

---

# 27. Acceptance Criteria MVP

Website dianggap berhasil apabila:

### Public

* Pengunjung dapat membuka website tanpa login.
* Pengunjung dapat melihat project yang berstatus `Published`.
* Project dapat dibuka ke halaman detail.
* GitHub dapat dibuka.
* Link monitoring dapat dibuka.
* Link website/demo dapat dibuka.
* Website responsive.

### Admin

* Admin dapat login menggunakan Firebase Authentication.
* User yang tidak login tidak dapat mengakses dashboard.
* Admin dapat membuat project.
* Admin dapat mengedit project.
* Admin dapat menghapus project.
* Admin dapat mengatur `Draft/Published`.
* Project published otomatis muncul pada portfolio.
* Gambar dapat disimpan melalui Firebase Storage.

### Security

* Pengunjung tidak dapat melakukan operasi CRUD terhadap project.
* Hanya akun admin yang memiliki izin menulis database.
* Firebase Security Rules diterapkan.

---

## 28. Gambaran Produk Akhir

Pada akhirnya website akan bekerja seperti ini:

```text
                 AIDIL FEBRIAN
              PERSONAL PORTFOLIO
                       │
          ┌────────────┼────────────┐
          │            │            │
        ABOUT       PROJECTS      SKILLS
                       │
              ┌────────┼─────────┐
              │        │         │
             AGV     IoT PLTA   NOBAR
              │        │         │
           GitHub   Monitoring  Website
              │        │         │
              └────────┼─────────┘
                       │
                    FIREBASE
                       │
              ┌────────┴────────┐
              │                 │
          Firestore          Storage
              │                 │
              └───────┬─────────┘
                      │
                ADMIN DASHBOARD
                      │
                 Firebase Auth
                      │
                 Add / Edit /
                 Delete Project
```

**Intinya:** website ini bukan hanya halaman CV, tetapi menjadi **"hub" seluruh karya kamu**. Pengunjung bisa melihat kemampuanmu, membuka source code di GitHub, mencoba website Nobar, membuka dashboard monitoring, dan melihat dokumentasi proyek. Sementara kamu cukup masuk ke satu dashboard untuk mengelola semuanya.
