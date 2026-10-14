/* =========================================================
   SITE CONFIG
   ------------------------------------------------------------
   File INI adalah satu-satunya file yang wajib kamu isi.
   Semua "GANTI_DENGAN_..." harus diganti dengan data aslimu.

   1) FIREBASE  -> Firebase Console > Project Settings > General
                   > Your apps > Web app > SDK setup and configuration
   2) PROFIL    -> nama, email, link GitHub, link LinkedIn, dll
   ========================================================= */

window.SITE = {

  /* =======================================================
     1. FIREBASE
     --------------------------------------------------------
     Salin 6 nilai ini dari Firebase Console.
     PENTING: jangan pernah memakai nilai GANTI_DENGAN_...
     Kalau masih begitu, website otomatis memakai DATA DEMO
     (jadi website tetap bisa dibuka tanpa Firebase).
     ======================================================= */

  firebase: {

    config: {
      apiKey: "AIzaSyBUPAhvYI7mK7GFEr5TKpq8YYdGizH3uJA",
      authDomain: "portofolio-c94f9.firebaseapp.com",
      projectId: "portofolio-c94f9",
      storageBucket: "portofolio-c94f9.firebasestorage.app",
      messagingSenderId: "75500938934",
      appId: "1:75500938934:web:e5537ae4c7706fde206817"
    },

    /* Email akun admin.
       WAJIB sama persis dengan email yang dibuat di
       Firebase Console > Authentication > Users.
       Email ini juga wajib dipasang di firestore.rules
       dan storage.rules (bagian ganti_dengan_email_admin). */
    adminEmails: ["aidilfebrian01@gmail.com"]
  },


  /* =======================================================
     2. PROFIL
     --------------------------------------------------------
     Dipakai sampai kamu mengisinya lewat
     Admin > Settings (tersimpan di Firestore).
     Nilai di bawah adalah nilai cadangan / fallback.
     ======================================================= */

  profile: {

    name: "Aidil Febrian",

    /* Foto profil (URL penuh, boleh raw.githubusercontent.com). Kalau
       kosong, section Profil & Background menampilkan inisial sebagai
       gantinya. Bisa diubah dari Admin > Settings. */
    profileImage:
      "https://raw.githubusercontent.com/mydil-project/portofolio/main/assets/img/profile.jpeg",

    /* Dipakai di hero + navbar */
    tagline: "Electrical Engineering · IoT · Embedded · Software",

    /* Tanda * membuat teks jadi biru (highlight).
       Contoh: "Building systems with *electronics* and code." */
    heroTitle: "Building systems with *electronics* and code.",

    heroDescription:
      "Saya mengembangkan sistem berbasis mikrokontroler, IoT, " +
      "otomasi, sistem kelistrikan, AI, dan software dari ide " +
      "hingga implementasi.",

    aboutTitle: "Engineering meets *software*.",

    about: [
      "Lulusan D4 Teknik Elektro Industri Universitas Negeri Padang (UNP) dengan ketertarikan pada sistem tenaga listrik dan teknologi Internet of Things (IoT). Memiliki pengalaman magang di bidang ketenagalistrikan serta ketertarikan dalam pengembangan sistem berbasis mikrokontroler. Aktif mengeksplorasi teknologi IoT dan pemrograman berbasis AI (vibe coding) melalui berbagai proyek.",

      "Mampu bekerja secara individu maupun dalam tim, bertanggung jawab, adaptif, serta memiliki semangat untuk terus belajar dan mengembangkan kompetensi di bidang ketenagalistrikan dan teknologi IoT. Portfolio ini menjadi pusat dokumentasi berbagai project yang saya kembangkan, mulai dari sistem kelistrikan, mikrokontroler, IoT, hingga website."
    ],

    education: "D4 Teknik Elektro Industri — UNP",
    focus: "Electrical · IoT · Embedded · Software",
    location: "Lima Puluh Kota, Sumatera Barat",

    /* KONTAK */
    email: "aidilfebrian01@gmail.com",
    /* Hanya angka / tanda plus, spasi, dan tanda hubung.
       Dipakai untuk link WhatsApp (otomatis jadi wa.me). */
    phone: "+62-857-6318-4495",
    github: "https://github.com/mydil-project",
    linkedin: "https://linkedin.com/in/GANTI_DENGAN_LINKEDIN",
    instagram: "https://instagram.com/mydil_soft_spoken",

    footerText: "Electrical Engineering · IoT · Embedded · Software"
  }
};


/* =========================================================
   Helper: apakah config Firebase sudah diisi (belum termasuk
   daftar email admin).
   - SITE_READY      -> website bisa memakai Firestore
   - SITE_ADMIN_READY -> email admin sudah diisi
   ========================================================= */

(function () {
  var c = window.SITE.firebase.config || {};
  var keys = ["apiKey", "authDomain", "projectId", "storageBucket", "appId"];

  window.SITE_READY = keys.every(function (k) {
    return c[k] && String(c[k]).indexOf("GANTI_DENGAN") === -1;
  });

  window.SITE_ADMIN_READY = (window.SITE.firebase.adminEmails || []).some(function (e) {
    return e && String(e).indexOf("GANTI_DENGAN") === -1;
  });
})();