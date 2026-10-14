# Aidil Febrian — Portfolio

Website personal portfolio: **Electrical Engineering · IoT · Embedded System · Software**.

Public site (HTML/CSS/JS murni) + Admin Dashboard berbasis **Firebase**
(Authentication + Firestore + Storage), di-hosting di **GitHub Pages**.

> Semua project, gambar, skills, dan informasi profil dikelola dari dashboard admin.
> Menambah project baru **tidak perlu** edit HTML, CSS, JavaScript, atau `git push`.

## Halaman

Situs publik cuma **satu halaman** (`/`). Semua section ada di dalamnya dan
dibuka lewat menu / tombol yang menuju anchor (`#about`, `#projects`, dst).

| URL | Isi |
| --- | --- |
| `/` | Hero, About, Projects (filter kategori + sorting), Skills, Sertifikasi, Minat, Contact |
| `/#project/<slug>` | Detail project sebagai modal: fitur, hardware, software, teknologi, galeri, links, project terkait |
| `/admin/` | Dashboard admin (butuh login) |

Navigasi detail project memakai hash, jadi URL-nya bisa dibagikan dan tombol
Back browser langsung menutup modal.

## Mulai Cepat

```text
1. Isi data di js/site-config.js   (config Firebase + email admin + profil)
2. Paste firestore.rules dan storage.rules di Firebase Console
3. Jalankan: npx serve .
4. Buka http://localhost:5500  dan  http://localhost:5500/admin/
```

Panduan lengkap (termasuk daftar data yang harus diisi, deploy GitHub Pages,
dan troubleshooting): **[SETUP.md](SETUP.md)**

Dokumen kebutuhan produk: **[PRD.md](PRD.md)**

## Struktur

```text
index.html  -> satu-satunya halaman publik
admin/      -> login.html + dashboard
css/        -> style.css (publik) + admin.css
js/         -> site-config.js (wajib diisi) + seed-data.js + data.js
              + ui.js (helper) + site.js (isi halaman + modal detail)
assets/     -> favicon.svg + img/projects/ (gambar project)
tests/      -> test harness (jsdom, hanya untuk pengembangan)
firestore.rules  storage.rules  firebase.json
```

## Test (opsional, hanya untuk pengembangan)

Website sendiri tidak butuh npm. Test memakai jsdom dengan Firebase tiruan:

```bash
cd tests
npm install
npm test
```

## Catatan Teknis

* Tanpa build step, tanpa npm install untuk runtime.
* Firebase SDK dimuat dari CDN (compat build), sehingga bisa dibuka langsung di browser.
* Selama `js/site-config.js` belum diisi, website otomatis memakai data contoh
  (`js/seed-data.js`) supaya tampilan tidak kosong.
* gambar project maksimal 5 MB, hanya file gambar, diunggah ke Firebase Storage.