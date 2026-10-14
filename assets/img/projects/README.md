# Folder Gambar Project

Taruh file gambar project di folder ini, lalu tulis **path-nya** di dashboard admin:

```text
assets/img/projects/arduino-agv.jpg        -> Cover Image
assets/img/projects/arduino-agv-01.jpg     -> Gallery baris 1
assets(img)/projects/arduino-agv-02.jpg    -> Gallery baris 2
```

Di form admin (`/admin` → Projects → Add Project):

| Kolom | Isi |
| --- | --- |
| **Cover Image** | `assets/img/projects/arduino-agv.jpg` |
| **Gallery** | Satu path per baris, contoh: `assets/img/projects/arduino-agv-01.jpg` |

Aturan path:

* Jangan pakai `./` di depan, dan jangan pakai `/` di depan.
* Pakai huruf kecil, tanpa spasi: `nama-project-01.jpg`
* Disarankan kompres gambar dulu: lebar sekitar **1200px**, kualitas **80%**.
  Tujuannya supaya halaman tidak berat di HP.

Setelah menambah gambar baru di sini, jalankan:

```bash
git add assets/img/projects
git commit -m "tambah gambar project"
git push
```

Baris `GANTI_DENGAN_...` di bawah ini hanya penanda bahwa folder ini
awalnya kosong (folder kosong tidak ikut ter-*commit* oleh git).