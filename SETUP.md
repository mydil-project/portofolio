# SETUP â€” Portofolio Aidil Febrian

Dokumen ini berisi **semua data yang perlu kamu isi** dan langkah aktivasi website,
supaya website bisa langsung dipakai (public + admin dashboard).

Ikuti urutan ini:

```text
1. Buat project Firebase        -> 5 menit
2. Salin config ke js/site-config.js
3. Buat akun admin + isi email di 3 file
4. Paste security rules
5. Jalankan website, isi project lewat /admin
6. Upload ke GitHub Pages
```

---

## 1. Struktur File

```text
Portofolio/
â”œâ”€â”€ index.html              Halaman publik (SATU HALAMAN, semua section)
â”œâ”€â”€ admin/
â”‚   â”œâ”€â”€ login.html          Halaman login admin
â”‚   â”œâ”€â”€ index.html          Dashboard (Projects, Skills, Settings)
â”‚   â”œâ”€â”€ login.js
â”‚   â””â”€â”€ admin.js
â”œâ”€â”€ css/
â”‚   â”œâ”€â”€ style.css           Style halaman publik
â”‚   â””â”€â”€ admin.css           Style dashboard
â”œâ”€â”€ js/
â”‚   â”œâ”€â”€ site-config.js      <-- FILE YANG HARUS KAMU ISI
â”‚   â”œâ”€â”€ seed-data.js        Data contoh (dipakai kalau Firebase belum diisi)
â”‚   â”œâ”€â”€ data.js             Oturisasi data ke Firestore/Storage/Auth
â”‚   â”œâ”€â”€ ui.js               Helper tampilan (navbar, lightbox, modal, reveal)
â”‚   â””â”€â”€ site.js             Isi halaman: daftar project, filter, skills, modal detail
â”œâ”€â”€ assets/
â”‚   â””â”€â”€ favicon.svg
â”œâ”€â”€ firestore.rules         Security rules database
â”œâ”€â”€ storage.rules           Security rules gambar
â”œâ”€â”€ firebase.json           Konfigurasi Firebase CLI
â”œâ”€â”€ firestore.indexes.json
â”œâ”€â”€ .nojekyll
â”œâ”€â”€ PRD.md
â””â”€â”€ SETUP.md                (file ini)
```

> Website publik hanya punya **satu** file HTML: `index.html`.
> Navigasi antar bagian memakai anchor (`#about`, `#projects`, `#skills`,
> `#contact`) dan detail project membuka modal lewat `#project/<slug>`.

---

## 2. DAFTAR DATA YANG PERLU KAMU ISI

### A. Config Firebase â€” 6 nilai

**Tempat pengisian:** `js/site-config.js` â†’ `firebase.config`

**Cara mendapatkannya:**

1. Buka <https://console.firebase.google.com>
2. Klik **Add project** â†’ isi nama, misalnya `aidil-portfolio` â†’ **Continue**
3. Matikan Google Analytics (tidak perlu) â†’ **Create project**
4. Di menu **Project settings** (ikon roda gigi) â†’ **General** â†’ **Your apps**
5. Klik ikon `</>` (Web) â†’ daftarkan app dengan nama `portfolio`
6. Salin objek `firebaseConfig`

Isi seperti ini:

| Nilai | Contoh | Wajib |
| --- | --- | --- |
| `apiKey` | `AIzaSy...` | Ya |
| `authDomain` | `aidil-portfolio.firebaseapp.com` | Ya |
| `projectId` | `aidil-portfolio` | Ya |
| `storageBucket` | `aidil-portfolio.firebasestorage.app` | Ya |
| `messagingSenderId` | `123456789012` | Ya |
| `appId` | `1:123456789012:web:abc...` | Ya |

> Keamanan `apiKey` bukan password. Aturan keamanan sebenarnya ada di Security Rules.
>
> **Status: sudah diisi** untuk project `portofolio-c94f9` (lihat `js/site-config.js`).

### A2. Gambar Project â€” 3 pilihan

Cloud Storage for Firebase **wajib plan Blaze** (butuh kartu + billing).
Karena itu website ini mendukung 3 cara menyimpan gambar:

| Opsi | Cara | Biaya | Kapan dipakai |
| --- | --- | --- | --- |
| **1. Path gambar di repository** (paling gratis) | Taruh file di `assets/img/projects/`, lalu tulis path-nya di kolom Cover Image / Gallery | Gratis | **Pilihan saat ini** |
| **2. Upload dari dashboard** | Kolom file di form project â†’ diunggah ke Firebase Storage | Gratis (kuota 5 GB) | Kalau nanti sudah upgrade ke plan Blaze |
| **3. URL dari luar** | Tempel URL gambar dari hosting/CDN lain | Tergantung | Gambar besar atau dari sumber lain |

Semua opsi bisa dipakai bersamaan. Kolom **Cover Image** dan **Gallery** menerima:

```text
assets/img/projects/agv.jpg          -> path relatif di repository
https://example.com/foto.jpg          -> URL absolut
```

Galeri diisi **satu URL per baris**, hapus baris untuk menghapus foto.

Contoh pakai opsi 1:

```text
assets/img/projects/arduino-agv.jpg          -> cover
assets/img/projects/arduino-agv-01.jpg       -> galeri baris 1
assets/img/projects/arduino-agv-02.jpg       -> galeri baris 2
```

> Foto tetap perlu di-*push* ke GitHub supaya online. Ini hanya untuk gambar,
> bukan untuk data project (data project tetap diatur dari dashboard).
> Kalau project-nya sudah besar, perkecil gambar dulu (misal lebar 1200px, kualitas 80).

### B. Email Admin â€” 1 nilai, tapi di 3 tempat

Buat dulu akun admin:

1. Firebase Console â†’ menu **Authentication**
2. Klik **Get started**
3. Tab **Sign-in method** â†’ aktifkan **Email/Password** â†’ **Save**
4. Tab **Users** â†’ **Add user** â†’ isi email + password â†’ **Add user**

Lalu salin email tersebut ke **3 file**:

| File | Bagian yang diisi |
| --- | --- |
| `js/site-config.js` | `firebase.adminEmails: ["emailkamu@gmail.com"]` |
| `firestore.rules` | `function isAdmin()` â€” ganti `ganti_dengan_email_admin` |
| `storage.rules` | `function isAdmin()` â€” ganti `ganti_dengan_email_admin` |

Contoh:

```javascript
function isAdmin() {
  return request.auth != null
    && request.auth.token.email in ['emailkamu@gmail.com'];
}
```

> Kalau rules tidak diisi, dashboard akan tampil tapi pembacaan dan penulisan database ditolak
> dengan pesan `permission-denied`.

### C. Data Profil

Ada dua cara:

1. **Disarankan:** login ke `/admin` â†’ menu **Settings** â†’ isi datanya.
   Data langsung tampil di seluruh website.
2. **Cadangan:** isi di `js/site-config.js` â†’ `profile` (dipakai sebagai nilai awal).

| Field | Contoh |
| --- | --- |
| `name` | `Aidil Febrian` |
| `tagline` | `Electrical Engineering Â· IoT Â· Embedded Â· Software` |
| `heroTitle` | `Building systems with *electronics* and code.` |
| `heroDescription` | `Saya mengembangkan sistem berbasis mikrokontroler, IoT, ...` |
| `aboutTitle` | `Engineering meets *software*.` |
| `about` | 2 paragraf (tiap paragraf dipisah baris kosong) |
| `education` | `D4 Teknik Elektro Industri â€” UNP` |
| `focus` | `Electrical Â· IoT Â· Embedded Â· Software` |
| `location` | `Lima Puluh Kota, Sumatera Barat` |
| `email` | `emailkamu@gmail.com` |
| `phone` | `+62-857-6318-4495` |
| `github` | `https://github.com/usernamekamu` |
| `linkedin` | `https://linkedin.com/in/usernamekamu` |
| `instagram` | `https://instagram.com/usernamekamu` |
| `footerText` | `Electrical Engineering Â· IoT Â· Embedded Â· Software` |

> Teks di antara `*` otomatis menjadi warna biru di website.

> Field `phone` dan `instagram` dipakai lewat atribut `data-href-field`.
> Nomor telepon **tidak** diklik jadi `tel:` â€” ia dibersihkan (hanya digit) lalu
> dijadikan link WhatsApp `https://wa.me/62...`. Nomor lokal `08xx` otomatis
> jadi `628xx`. Instagram boleh ditulis tanpa `https://`.
> Kalau kosong / belum diisi, link-nya dinonaktifkan dan muncul toast
> "Link ini belum diisi. Atur di Admin > Settings." (sama seperti LinkedIn).

### D. Data About (semua isi CV)

Seluruh isi CV sudah dipindahkan ke `index.html` (section `#about`, `#skills`,
`#certifications`, `#interest`). Semuanya ada di HTML, **bukan** di Firestore â€”
jadi mengubahnya butuh `git push`, bukan dashboard.
Test otomatis (`tests/test-header.js` bagian `[J]`) ikut menjaga isi ini.

| Bagian CV | Lokasi di `index.html` | Bisa diubah lewat Settings? |
| --- | --- | --- |
| Data diri & ringkasan | blok PROFILE (`data-profile-*`) | Ya |
| Kontak: email, telepon, Instagram, GitHub, alamat | blok `.contact-list` | Ya untuk email/telepon/IG/GitHub, tidak untuk alamat |
| Pendidikan & pengalaman magang | `#skills` â†’ sub-block **Pendidikan & Pengalaman** | Tidak |
| Skill (soft / hard / software) | `#skills` â†’ sub-block **Kemampuan & Tools** | Tidak |
| Sertifikasi (6 sertifikat IBM SkillsBuild) | section `#certifications` | Tidak |
| Hobi | section `#interest` â†’ blok `HOBI` | Tidak |

Timeline pendidikan/pengalaman:

```html
<div class="timeline-item">
  <div class="timeline-marker"></div>
  <div class="timeline-body">
    <span class="timeline-year">Agustus 2022 &mdash; Agustus 2026</span>
    <h4>Judul-degree / Posisi</h4>
    <p>Institusi / Perusahaan &mdash; Kota &middot; IPK / Nilai</p>
    <p>Deskripsi singkat tanggung jawab atau fokus belajar.</p>
  </div>
</div>
```

Satu sertifikat:

```html
<article class="cert-card" data-reveal>
  <div class="cert-issuer">IBM SkillsBuild</div>
  <h4>Judul sertifikat</h4>
  <div class="cert-meta">
    <span><time datetime="2026-08-01">1 Agu 2026</time></span>
    <code>ALM-COURSE_0000000</code>
  </div>
</article>
```

Skill dan hobby cukup tambah satu baris:

```html
<span class="chip">Nama Skill</span>
```

> Hapus blok `timeline-item` / `cert-card` yang tidak diperlukan.

### E. Data Opsional

| Kebutuhan | Apa yang dilakukan |
| --- | --- |
| Foto profil | Taruh file di `assets/img/profile.jpg`, lalu di `index.html` ganti isi `<div class="portrait-frame">` dengan `<img src="assets/img/profile.jpg" alt="Aidil Febrian">` |
| Favicon | Ganti `assets/favicon.svg` (sudah ada, tinggal ganti huruf "AF") |
| Cover project | Diisi dari dashboard admin (upload ke Firebase Storage) |

### F. Semua Teks "GANTI_DENGAN" di Project Ini

Cari cepat di editor:

```text
GANTI_DENGAN_  ->  di js/site-config.js  (hanya LinkedIn yang tersisa)
```

> `index.html` sudah tidak punya `GANTI_DENGAN_...` (sudah diisi dari CV).
> Kalau kamu cari `GANTI_DENGAN_` di `index.html` atau `js/seed-data.js` dan
> masih menemukan sisa, berarti ada yang belum dibersihkan.

---

## 3. Menjalankan Website Secara Lokal

 Firebase tidak bisa diakses dari file yang dibuka langsung lewat `file://`.
Karena itu, jalankan lewat server lokal.

```bash
# buka terminal di folder Portofolio
npx serve .
# atau
python -m http.server 5500
```

Lalu buka:

```text
http://localhost:5500             -> website publik
http://localhost:5500/admin/      -> dashboard admin
```

Sebelum Firebase diisi, website otomatis menampilkan **4 project contoh** dari
`js/seed-data.js` supaya tampilannya tidak kosong.

---

## 4. Deploy Security Rules

### Cara A â€” lewat Firebase Console (paling mudah)

1. Firebase Console â†’ **Firestore Database** â†’ tab **Rules**
2. Buka file `firestore.rules`, salin seluruh isinya, tempel, klik **Publish**
3. Firebase Console â†’ **Storage** â†’ tab **Rules**
4. Buka file `storage.rules`, salin seluruh isinya, tempel, klik **Publish**

### Cara B â€” lewat Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # pilih project Firebase kamu
firebase deploy --only firestore:rules,storage
```

> `storage.rules` hanya perlu di-*publish* kalau kamu memakai upload gambar
> dari dashboard (opsi 2, butuh plan Blaze). Kalau gambar memakai path di
> repository (opsi 1), file `storage.rules` boleh diabaikan.

> **Penting setelah menambah collection baru.** `firestore.rules` di repo ini
> menutup semua collection yang tidak disebut secara eksplisit
> (`match /{document=**} { allow read, write: if false; }`). Jadi begitu
> collection `certifications` ditambahkan, rules **harus di-*publish* ulang**
> di Firebase Console — kalau tidak, section Sertifikasi akan kosong dan
> dashboard menampilkan banner merah "Akses database ditolak".

---

## 5. Upload ke GitHub Pages

```bash
cd Portofolio
git init
git add .
git commit -m "Portfolio v1: public pages + firebase admin"
git branch -M main
git remote add origin https://github.com/USERNAME/USERNAME.github.io.git
git push -u origin main
```

Lalu di GitHub:

1. Buka repository â†’ **Settings** â†’ **Pages**
2. **Source**: `Deploy from a branch` â†’ branch `main`, folder `/ (root)`
3. Tunggu 1â€“2 menit â†’ website online di `https://USERNAME.github.io`

> Yang wajib ikut ter-*commit*: folder `js/`, `css/`, `admin/`, `assets/`, dan file HTML.
> File `.nojekyll` sudah disiapkan supaya GitHub Pages tidak memproses folder khusus.

---

## 6. Alur Menambah Project Baru

```text
Project selesai
      â†“
Buka /admin  -> login
      â†“
Projects -> + Add Project
      â†“
Isi Title, Category, Short Description, Description
      â†“
Isi Technologies, Hardware, Software, Features
      â†“
Upload Cover Image + Gallery
      â†“
Isi Links (GitHub, Demo, Monitoring, Website, Documentation)
      â†“
Simpan sebagai Draft
      â†“
Cek di halaman publik (project belum tampil)
      â†“
Ubah Status -> Published
      â†“
Project langsung muncul di Home / Projects / Featured
```

Tidak perlu edit HTML, CSS, JavaScript, atau `git push` untuk menambah project.

### Menambah Sertifikat

Menu **Sertifikasi** di sidebar dashboard punya alur yang sama:

```text
Sertifikat baru ketemu
      ↓
Buka /admin  -> login
      ↓
Sertifikasi -> + Add Sertifikat
      ↓
Isi Nama Sertifikat, Penerbit, Tanggal Terbit
      ↓
Isi Credential ID (kode sertifikat)
      ↓
Tempel Link Sertifikat (opsional, boleh dikosongkan)
      ↓
Simpan sebagai Draft
      ↓
Ubah Status -> Published
      ↓
Muncul di section Sertifikasi di halaman publik
```

Kalau kolom **Link Sertifikat** diisi, tiap kartu mendapat tombol
**Lihat Sertifikat ↗** yang membuka link verifikasinya di tab baru. Kalau
kosong, kartu tetap tampil tanpa tombol.

Tombol **Isi 6 sertifikat awal** memindahkan 6 sertifikat contoh dari
`js/seed-data.js` ke database sekaligus — dipakai supaya section Sertifikasi
tidak kosong sebelum diisi manual.

### Sistem Status

| Status | Arti |
| --- | --- |
| `Draft` | Tidak tampil di website publik. Hanya terlihat di dashboard. |
| `Published` | Tampil di website publik (home, projects, featured bila di centang). |

### Mengatur Urutan Project

Di dashboard **Projects**, setiap baris punya kolom **Urutan** dengan dua
tombol panah:

```text
â–²  1  â–¼
```

* **â–²** memindahkan project satu baris ke atas
* **â–¼** memindahkan project satu baris ke bawah
* Angka di tengah = posisi project sekarang
* Kolom **Urutan** hanya berisi ▲ posisi ▼; kolom **Aksi** berisi ikon ✎ edit, 👁/🚫 publish, 🗑 hapus
* Semua tombol di dua kolom itu sama besar dan sama warnanya, jadi mudah dibedakan
* Panah dinonaktifkan (abu-abu) di baris paling atas dan paling bawah
* Project **Published** tampil di halaman publik sesuai urutan ini
* Project **Draft** ikut bisa digeser, tapi tidak terlihat di publik

Halaman publik memakai urutan ini sebagai **default**. Di dropdown
"Urutkan project" punya **Terbaru**, **Terlama**, dan **A → Z** kalau mau
melihat urutan lain sesaat. Tapi urutan bawaannya tetap urutan dari dashboard,
dan itulah yang tertulis di dropdown saat halaman baru dibuka
(**Urutan bawaan**, tidak bisa dipilih ulang dari daftar — cukup refresh untuk
kembali ke urutan dashboard). Mengubah dropdown hanya berlaku untuk sesi
browser tersebut; urutan di dashboard tetap jadi acuan saat halaman di-refresh.

Urutan disimpan otomatis ke database â€” tidak perlu `git push`.

**Project yang baru dibuat otomatis jadi paling atas.** Jadi begitu kamu
menyimpan project baru, ia langsung jadi baris pertama di dashboard (dan kartu
pertama di halaman publik). Semua project yang sudah punya nomor urut otomatis
geser satu tingkat ke bawah supaya tidak ada nomor kembar. Project yang belum
pernah digeser (kolomnya kosong) dibiarkan tanpa nomor dan tetap urutannya ikut
dari tanggal dibuat, terbaru di atas.

Kalau project baru tidak mau di atas, geser saja dengan tombol panah.

Project yang belum pernah digeser (kolomnya kosong) tetap urutannya ikut
dari tanggal dibuat, terbaru di atas. Begitu salah satu digeser, semua
project diberi nomor urut.

---

## 7. Struktur Data Firestore

```text
projects/{idDoc}
â”œâ”€â”€ title
â”œâ”€â”€ slug                 -> index.html#project/slug
â”œâ”€â”€ shortDescription
â”œâ”€â”€ description
â”œâ”€â”€ category
â”œâ”€â”€ year
â”œâ”€â”€ role
â”œâ”€â”€ technologies[]       -> dipisah koma di form
â”œâ”€â”€ hardware[]           -> dipisah koma di form
â”œâ”€â”€ software[]           -> dipisah koma di form
â”œâ”€â”€ features[]           -> satu fitur per baris di form
â”œâ”€â”€ coverImage           -> URL Firebase Storage
â”œâ”€â”€ gallery[]            -> URL Firebase Storage
â”œâ”€â”€ links[]
â”‚   â”œâ”€â”€ title
â”‚   â”œâ”€â”€ type             -> github | demo | monitoring | website |
â”‚   â”‚                       documentation | youtube | download | custom
â”‚   â””â”€â”€ url
â”œâ”€â”€ status               -> draft | published
â”œâ”€â”€ featured             -> true | false
â”œâ”€â”€ order                -> urutan tampil di halaman publik (angka, 0 = paling atas).
â”‚                           Diisi otomatis dari tombol panah di dashboard > Projects.
â”‚                           Kosong = project ikut diurutkan dari tanggal dibuat.
â”œâ”€â”€ createdAt            -> otomatis (server timestamp)
â””â”€â”€ updatedAt            -> otomatis (server timestamp)

profile/main            -> teks profil (diisi dari admin > Settings)
skills/{idDoc}          -> daftar skills (diisi dari admin > Skills)

certifications/{idDoc}  -> daftar sertifikat (diisi dari admin > Sertifikasi)
├── title              -> nama sertifikat, contoh: Unleashing the Power of AI Agents
├── issuer             -> penerbit, contoh: IBM SkillsBuild
├── credentialId       -> kode sertifikat, contoh: ALM-COURSE_3825456
├── date               -> tanggal terbit, format YYYY-MM-DD
├── url                -> link verifikasi / sertifikat digital (boleh kosong)
├── status             -> draft | published
├── order              -> urutan tampil di halaman publik (angka, 0 = paling atas).
│                        Diisi otomatis dari tombol panah di dashboard > Sertifikasi.
├── createdAt          -> otomatis (server timestamp)
└── updatedAt          -> otomatis (server timestamp)
```

---

## 8. Struktur Link (Tipe Link)

Setiap project bebas punya banyak link, dan tipe baru tidak perlu menambah kolom baru:

```javascript
links: [
  { title: "GitHub Repository", type: "github", url: "https://github.com/..." },
  { title: "Live Monitoring",   type: "monitoring", url: "https://..." },
  { title: "Live Website",      type: "website", url: "https://..." }
]
```

Tipe yang tersedia di form: `github`, `demo`, `monitoring`, `website`,
`documentation`, `youtube`, `download`, `custom`.

Link tanpa URL akan diabaikan otomatis, jadi aman kalau ada baris yang belum diisi.

### Tips: Firestore tidak butuh composite index

Website **sengaja tidak memakai `orderBy` di query**, dan pengurutan dilakukan di
sisi client. Artinya project ini **tidak butuh composite index** sama sekali â€”
cukup login ke Firebase, tidak perlu membuat index manual.

Kalau nanti kamu menambah `orderBy` sendiri dan muncul error
`failed-precondition / query requires an index`, buat index lewat
**Firestore Database â†’ Indexes â†’ Create Indexes**.

---

## 8b. Perilaku Data (penting untuk dibaca)

| Situasi | Yang tampil di website |
| --- | --- |
| `js/site-config.js` belum diisi | Banner "Mode Demo" + 4 project contoh |
| Database belum dibuat / sedang offline | 4 project contoh (supaya halaman tidak kosong) |
| Rules **belum** di-publish | Halaman project **kosong** + banner merah di dashboard |
| Rules sudah benar, tapi belum ada project | Halaman kosong dengan pesan "Belum ada project" |
| Semua project masih `Draft` | Halaman kosong untuk pengunjung (admin tetap bisa lihat di dashboard) |

Aturan mainnya: **data contoh hanya muncul karena masalah teknis, bukan karena
database kosong.** Kalau rules ditolak, dashboard menampilkan banner merah yang
mengaratkan ke Firebase Console.

Kalau section Skills masih kosong setelah database aktif, klik
**Skills â†’ "Isi 4 skill awal"** untuk mengisi Electrical, IoT, Embedded, dan Software.

---

## 9. Troubleshooting

| Masalah | Penyebab & Solusi |
| --- | --- |
| Muncul banner "Mode Demo" | `js/site-config.js` masih ada `GANTI_DENGAN_` (biasanya di `adminEmails`). |
| Storage tidak bisa diaktifkan di console | Wajib upgrade ke plan **Blaze** (Build â†’ Upgrade). Tagihan hanya muncul kalau pemakaian melewati kuota. Alternatif gratis: pakai path gambar di repository (lihat bagian A2). |
| Upload gambar gagal / error 402-403 | Plan masih Spark, jadi Firebase Storage tidak aktif. Pakai kolom URL/path saja. |
| Login gagal / `auth/operation-not-allowed` | Email/Password belum diaktifkan di Firebase Console > Authentication. |
| Login berhasil tapi data kosong | Security rules belum di-*publish*, atau email di rules berbeda dengan email login. |
| Project tersimpan tapi tidak tampil publik | Status masih `Draft`. Ubah ke `Published`. |
| `permission-denied` saat edit | Email admin belum ditulis sama persis di `js/site-config.js`, `firestore.rules`, dan `storage.rules`. |
| Gambar tidak muncul di dashboard | Path relatif harus ditulis tanpa `./` dan tanpa `/` di depan, contoh `assets/img/projects/agv.jpg`. |
| Banner merah "Akses database ditolak" | `firestore.rules` belum di-*publish*, atau email di rules berbeda dengan email login. |
| Halaman project kosong padahal sudah ada project | Semua project masih berstatus `Draft`. Ubah ke `Published`. |
| Error `failed-precondition / requires an index` | Seharusnya tidak muncul di kode ini (sengaja tanpa `orderBy`). Kalau muncul, buat composite index di Firestore â†’ Indexes. |
| Kolom upload gambar gagal | Firebase Storage belum aktif (butuh Blaze). Pakai kolom URL/path. |
| Halaman kosong saat dibuka langsung dari file | Firebase butuh `http://`. Jalankan lewat server lokal (`npx serve .`). |
| Ingin ganti nama project tapi slug tidak berubah | Slug sengaja hanya terisi otomatis saat field masih kosong. Hapus isi slug dulu agar dibuat ulang. |
| Tombol Edit / Hapus / Tambah di dashboard tidak kelihatan | Tombolnya memang ikon saja (&#9998; &#128465; &#10133; &#128190; &#128065; &#128683;). Arahkan kursor: nama tombol muncul di tooltip. Di HP/layar kecil, tombol tetap bisa ditekan seperti biasa. |
| Error `Unsupported field value: undefined (found in field order)` saat simpan project/sertifikat | Firestore tidak menerima nilai `undefined`. Project/sertifikat baru harus menulis `order: null` (null = belum diberi urutan, tampil paling akhir). Sudah diperbaiki di `js/data.js`; kalau muncul lagi, update `js/data.js` ke versi terbaru. |

### Kalau memilih plan Blaze

```text
1. Firebase Console -> ikon roda gigi (Project settings) -> Usage and billing
   -> atau Build -> Upgrade
2. Hubungkan Google Cloud Billing account (butuh kartu kredit)
3. Set budget alert supaya tidak ada tagihan tak terduga
4. Setelah aktif, jalankan: Build -> Storage -> Get started
5. Publish rules dari storage.rules
```

Kuota gratis Blaze: 5 GB storage, 1 GB download/hari, 20K upload/hari.
Untuk portfolio pribadi ini pemakaiannya jauh di bawah kuota, tapi tetap pasang
budget alert sebagai pengaman.

---

## 10. Fitur yang Belum Ada (Sengaja Ditunda)

Sesuai PRD bagian 26, fitur berikut belum dibuat dan bisa ditambahkan nanti:

* Blog
* Visitor analytics
* Contact form dengan database
* Comments & project likes
* Integrasi GitHub API
* Mode dark/light
* Multi-admin
* Editor rich text

---

## 11. Checklist Siap Online

- [x] Project Firebase dibuat (`portofolio-c94f9`)
- [x] Web app didaftarkan, config disalin ke `js/site-config.js`
- [ ] Authentication Email/Password aktif
- [ ] Akun admin dibuat
- [ ] Email admin ditulis di `js/site-config.js` dan `firestore.rules`
- [ ] Firestore Database dibuat (mode Production)
- [ ] `firestore.rules` sudah di-*publish*
- [ ] Cara gambar dipilih (path repository / Blaze + Storage)
- [ ] Gambar project dimasukkan ke `assets/img/projects/`
- [ ] Section `#skills` di `index.html` sudah diisi pendidikan & pengalaman
- [ ] Login `/admin` berhasil
- [ ] Project asli sudah dibuat (data demo sudah diganti)
- [ ] Repository GitHub dibuat + GitHub Pages aktif
