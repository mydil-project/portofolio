/* =========================================================
   DATA LAYER
   ------------------------------------------------------------
   Semua pembacaan / penulisan database melewati file ini.

   - Kalau Firebase sudah dikonfigurasi -> memakai Firestore
   - Kalau belum / error / offline    -> memakai DATA DEMO
     sehingga website tidak pernah tampil kosong.

   Struktur document "projects" (Firestore):
   {
     title, slug, shortDescription, description, category,
      year, role, technologies[], hardware[], software[], features[],
     coverImage, gallery[], links[], status, featured,
     createdAt, updatedAt
   }
   ========================================================= */

window.Data = (function () {

  var cfg = window.SITE.firebase;
  var ready = false;
  var denied = false;
  var active = false;
  var app = null;
  var auth = null;
  var db = null;
  var storage = null;

  /* Nama app sendiri supaya tidak bentrok dengan app '[DEFAULT]'
     yang biasanya dibuat otomatis oleh Firebase SDK compat. */
  var APP_NAME = "portfolio";

  /* ---------------------------------------------------------
     INIT FIREBASE
     --------------------------------------------------------- */

  function init() {
    if (ready) return active;
    ready = true;

    if (!window.SITE_READY) return false;
    if (typeof firebase === "undefined") {
      console.warn("[portfolio] Firebase SDK tidak termuat. Memakai data demo.");
      return false;
    }

    /* 1) Firebase Auth + Firestore (wajib) */
    try {
      var existing = null;
      (firebase.apps || []).forEach(function (item) {
        if (item.options && item.options.apiKey === cfg.config.apiKey) existing = item;
      });

      app = existing || firebase.initializeApp(cfg.config, APP_NAME);
      auth = firebase.auth(app);
      db = firebase.firestore(app);
      active = true;
    } catch (err) {
      console.error("[portfolio] Gagal inisialisasi Firebase:", err);
      return false;
    }

    /* 2) Firebase Storage (opsional)
       Storage butuh plan Blaze. Kalau belum aktif, website tetap jalan,
       hanya upload gambar dari dashboard yang tidak tersedia. */
    try {
      storage = firebase.storage(app);
    } catch (err) {
      storage = null;
      console.warn("[portfolio] Firebase Storage tidak aktif (butuh plan Blaze):", err && err.message);
    }

    return true;
  }

  function hasStorage() {
    return !!(init() && storage);
  }

  /* ---------------------------------------------------------
     HELPER
     --------------------------------------------------------- */

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    var d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return String(value)
      .split(/[\n,]/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  function toIso(value) {
    var d = toDate(value);
    return d ? d.toISOString() : new Date().toISOString();
  }

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /* Server timestamp.
     Namespace static (firebase.firestore.FieldValue) dipakai lebih dulu,
     lalu fallback ke properti instance, lalu ke waktu lokal. */
  function serverTimestamp() {
    var ns = firebase.firestore;
    var FF = (ns && ns.FieldValue) || (db && db.FieldValue);

    if (FF && FF.serverTimestamp) return FF.serverTimestamp();
    return new Date().toISOString();
  }

  /* Field dengan nilai undefined TIDAK bisa ditulis ke Firestore
     (SDK melempar "Unsupported field value: undefined"). Jadi buccang
     field undefined, dan NaN ditulis sebagai null supaya set() tidak
     ditolak. Field yang dibuang dianggap tidak ada — untuk set() tanpa
     merge itu sama saja: dokumen lama tetap tergantikan. */
  function cleanForWrite(obj) {
    var out = {};

    Object.keys(obj || {}).forEach(function (key) {
      var value = obj[key];

      if (value === undefined) return;
      if (typeof value === "number" && isNaN(value)) {
        out[key] = null;
        return;
      }

      out[key] = value;
    });

    return out;
  }

  function logFallback(err, context) {
    console.warn("[portfolio] " + context + " -> memakai data demo. Detail:", err);
  }

  /* Data demo hanya ditampilkan kalau masalahnya teknis (belum ada
     database, offline, SDK gagal). Kalau akses DITOLAK oleh security
     rules, jangan tampilkan data demo —” tampilkan kosong + pesan,
     supaya tidak mengecoh DEVELOPER yang mengira datanya sudah ada. */
  function handleReadError(err, context, fallback, deniedValue) {
    var code = (err && err.code) || "";

    if (code === "permission-denied" || code === "unauthenticated" || code === "unauthorized") {
      denied = true;
      console.error("[portfolio] Akses database ditolak (" + context + "). " +
        "Publish security rules dari file firestore.rules di Firebase Console.");
      return deniedValue === undefined ? fallback : deniedValue;
    }

    logFallback(err, context);
    return fallback;
  }

  /* Normalisasi data project supaya semua halaman aman dipakai */

  function normalizeProject(raw) {
    var p = raw || {};
    return {
      id: p.id || "",
      title: p.title || "Untitled Project",
      slug: p.slug || slugify(p.title),
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      category: p.category || "Other",
      year: p.year || "",
      role: p.role || "",
      technologies: toArray(p.technologies),
      hardware: toArray(p.hardware),
      software: toArray(p.software),
      features: toArray(p.features),
      coverImage: p.coverImage || "",
      gallery: toArray(p.gallery).filter(Boolean),
      links: (Array.isArray(p.links) ? p.links : [])
        .filter(function (l) { return l && l.url; })
        .map(function (l) {
          return {
            title: l.title || l.type || "Link",
            type: l.type || "custom",
            url: l.url
          };
        }),
      status: p.status === "published" ? "published" : "draft",
      featured: p.featured === true || p.featured === "true",
      /* urutan manual dari dashboard admin (tombol panah).
         null = belum pernah digeser, jadi diurutkan sebagai yang
         paling akhir lalu diurutkan berdasar tanggal. */
      order: typeof p.order === "number" && !isNaN(p.order) ? p.order : null,
      createdAt: toIso(p.createdAt),
      updatedAt: toIso(p.updatedAt || p.createdAt)
    };
  }

  /* Urutan yang dikehendaki admin (tombol panah di dashboard).
     Project yang belum punya field "order" dianggap paling akhir,
     lalu diurutkan berdasar tanggal. Angka kecil = tampil lebih dulu.

     Diurutkan di sisi client, bukan lewat orderBy di query —”
     itu supaya tidak butuh composite index. */
  var TANPA_ORDER = 1e9;

  function sortByOrder(list) {
    return list.sort(function (a, b) {
      var oa = a.order === null ? TANPA_ORDER : a.order;
      var ob = b.order === null ? TANPA_ORDER : b.order;
      if (oa !== ob) return oa - ob;

      var t = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return t;
    });
  }

  /* ---------------------------------------------------------
     PUBLIC: PROFILE & SKILLS
     --------------------------------------------------------- */

  function getProfile() {
    var base = clone(window.SITE.profile);

    if (!init()) return Promise.resolve(base);

    return db.collection("profile").doc("main").get()
      .then(function (doc) {
        return doc.exists ? Object.assign(base, doc.data()) : base;
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca profile", base, base);
      });
  }

  /* Catatan penting:
   Data demo HANYA dipakai kalau Firebase belum aktif atau database
   tidak bisa dibaca (error / offline). Kalau database berhasil dibaca
   tapi kosong, hasilnya tetap kosong supaya pengunjung tidak melihat
   project contoh milik developer. */
/* Catatan: query sengaja TANPA orderBy supaya tidak butuh composite index.
   Pengurutan dilakukan di sisi client. */
function listSkills() {
    var fallback = clone(window.SEED.skills);

    if (!init()) return Promise.resolve(fallback);

    return db.collection("skills").get()
      .then(function (snap) {
        return snap.docs.map(function (doc, i) {
          var s = doc.data() || {};
          return {
            id: doc.id,
            name: s.name || "Skill",
            icon: s.icon || "♦†",
            description: s.description || "",
            order: typeof s.order === "number" ? s.order : i
          };
        }).sort(function (a, b) { return a.order - b.order; });
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca skills", fallback, []);
      });
  }

  /* ---------------------------------------------------------
     PUBLIC: PROJECTS
     --------------------------------------------------------- */

  function listProjects(status) {
    var wanted = status || "published";
    var fallback = sortByOrder(
      clone(window.SEED.projects)
        .filter(function (p) { return p.status === wanted; })
        .map(normalizeProject)
    );

    if (!init()) return Promise.resolve(fallback);

    return db.collection("projects")
      .where("status", "==", wanted)
      .get()
      .then(function (snap) {
        return sortByOrder(snap.docs.map(function (doc) {
          return normalizeProject(Object.assign({ id: doc.id }, doc.data()));
        }));
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca projects", fallback, []);
      });
  }

  function getProjectBySlug(slug) {
    var found = null;

    window.SEED.projects.forEach(function (p) {
      if (!found && p.slug === slug) found = clone(p);
    });

    if (!init()) {
      return Promise.resolve(found ? normalizeProject(found) : null);
    }

    /* Filter status WAJIB ikut di query.
       firestore.rules mengizinkan publik hanya kalau
       resource.data.status == 'published'. Kalau query cuma
       .where("slug", ...) tanpa menyebut status, Firestore tidak
       bisa membuktikan setiap dokumen yang dikembalikan berstatus
       published, jadi request DITOLAK permission-denied —” meskipun
       dokumennya memang published. Query ini tidak butuh index
       komposit karena kedua filter itu kesamaan (=), bukan rentang. */
    return db.collection("projects")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get()
      .then(function (snap) {
        if (!snap.empty) {
          found = Object.assign({ id: snap.docs[0].id }, snap.docs[0].data());
        }
        return found ? normalizeProject(found) : null;
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca detail project", null, null);
      });
  }

  function getProjectById(id) {
    if (!init()) return Promise.resolve(null);

    return db.collection("projects").doc(id).get()
      .then(function (doc) {
        if (!doc.exists) return null;
        return normalizeProject(Object.assign({ id: doc.id }, doc.data()));
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca project by id", null, null);
      });
  }

  /* Semua project (admin saja): published + draft */
  function listAllProjects() {
    if (!init()) return Promise.resolve([]);

    return db.collection("projects").get()
      .then(function (snap) {
        return sortByOrder(snap.docs.map(function (doc) {
          return normalizeProject(Object.assign({ id: doc.id }, doc.data()));
        }));
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca semua project", [], []);
      });
  }

  /* Simpan urutan manual untuk beberapa project sekaligus.
     Dipakai dashboard saat tombol panah ditekan. Field lain
     tidak disentuh —” hanya "order" yang ditulis. */
  function saveOrders(entries) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));

    var batch = db.batch ? db.batch() : null;

    /* Tanpa batch(): tulis satu per satu (kurang optimal tapi jalan). */
    if (!batch) {
      return entries.reduce(function (chain, e) {
        return chain.then(function () {
          return db.collection("projects").doc(e.id).update(cleanForWrite({ order: e.order }));
        });
      }, Promise.resolve());
    }

    entries.forEach(function (e) {
      batch.update(db.collection("projects").doc(e.id), cleanForWrite({ order: e.order }));
    });

    return batch.commit();
  }

  /* ---------------------------------------------------------
     ADMIN: PROJECTS
     --------------------------------------------------------- */

  /* Project yang baru dibuat harus otomatis jadi paling atas:
     dapat order 0, lalu semua project yang sudah punya angka
     dinaikkan 1 supaya tidak ada nomor kembar. Project tanpa "order"
     (null) dibiarkan apa adanya supaya tetap diurutkan paling akhir. */
  function shiftOrdersDown() {
    return db.collection("projects").get().then(function (snap) {
      var entries = [];

      snap.docs.forEach(function (doc) {
        var o = (doc.data() || {}).order;
        if (typeof o === "number" && !isNaN(o)) {
          entries.push({ id: doc.id, order: o + 1 });
        }
      });

      return entries;
    });
  }

  /* Terapkan pergeseran urutan (dipakai sebelum menulis project baru).
     Tanpa batch(): tulis satu per satu (kurang optimal tapi jalan). */
  function applyShift(entries) {
    if (!entries.length) return Promise.resolve();

    var batch = db.batch ? db.batch() : null;

    if (!batch) {
      return entries.reduce(function (chain, e) {
        return chain.then(function () {
          return db.collection("projects").doc(e.id).update(cleanForWrite({ order: e.order }));
        });
      }, Promise.resolve());
    }

    entries.forEach(function (e) {
      batch.update(db.collection("projects").doc(e.id), cleanForWrite({ order: e.order }));
    });

    return batch.commit();
  }

  function saveProject(payload, id) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));

    var ref = id
      ? db.collection("projects").doc(id)
      : db.collection("projects").doc();

    var slug = payload.slug || slugify(payload.title);
    /* Edit project yang sudah ada tidak boleh mengubah urutan sama sekali. */
    var geser = id ? Promise.resolve([]) : shiftOrdersDown();

    return geser.then(function (geseran) {
      return ref.get().then(function (doc) {
        var lama = doc.exists ? doc.data() : {};
        var baru = !doc.exists;

        /* Urutan:
           1) angka dari payload (dipakai dashboard saat menulis ulang),
           2) project BARU -> 0 (paling atas),
           3) project lama -> bawa nilai lamanya supaya edit tidak
              diam-diam mengubah urutan manual. Kalau tidak punya
              nilai lama -> null, bukan undefined, karena Firestore
              menolak undefined dan order null diurutkan paling akhir. */
        var order = lama.order === undefined ? null : lama.order;

        if (typeof payload.order === "number" && !isNaN(payload.order)) {
          order = payload.order;
        } else if (baru) {
          order = 0;
        }

        var data = Object.assign({}, payload, {
          slug: slug,
          technologies: toArray(payload.technologies),
          hardware: toArray(payload.hardware),
          software: toArray(payload.software),
          features: toArray(payload.features),
          gallery: toArray(payload.gallery).filter(Boolean),
          links: (payload.links || []).filter(function (l) { return l && l.url; }),
          status: payload.status === "published" ? "published" : "draft",
          featured: payload.featured === true,
          order: order,
          createdAt: lama.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        delete data.id;

        /* Geser project yang sudah ada dulu, baru tulis project baru,
           supaya kalau pergeseran gagal tidak ada dua project dengan
           order yang sama. */
        return applyShift(geseran).then(function () {
          return ref.set(cleanForWrite(data));
        });
      });
    });
  }

  function deleteProject(id) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));
    return db.collection("projects").doc(id).delete();
  }

  /* ---------------------------------------------------------
     SERTIFIKASI
     --------------------------------------------------------- */

  function normalizeCertification(raw) {
    var c = raw || {};
    return {
      id: c.id || "",
      title: c.title || "Sertifikat",
      issuer: c.issuer || "",
      credentialId: c.credentialId || "",
      date: toIso(c.date || c.issuedAt || c.createdAt).slice(0, 10),
      url: c.url || "",
      status: c.status === "published" ? "published" : "draft",
      order: typeof c.order === "number" && !isNaN(c.order) ? c.order : null,
      createdAt: toIso(c.createdAt),
      updatedAt: toIso(c.updatedAt || c.createdAt)
    };
  }

  /* Angka order kecil tampil lebih dulu; yang order-nya null
     (belum pernah digeser di dashboard) paling akhir. */
  function sortByCertOrder(list) {
    var NO_ORDER = 1e9;
    return list.sort(function (a, b) {
      var oa = a.order === null ? NO_ORDER : a.order;
      var ob = b.order === null ? NO_ORDER : b.order;
      if (oa !== ob) return oa - ob;

      var da = new Date(b.date || b.createdAt).getTime();
      var dbb = new Date(a.date || a.createdAt).getTime();
      return dbb - da;
    });
  }

  /* Publik: hanya sertifikat "published". */
  function listCertifications(status) {
    var wanted = status || "published";
    var fallback = sortByCertOrder(
      (window.SEED.certifications || [])
        .filter(function (c) { return c.status === wanted; })
        .map(normalizeCertification)
    );

    if (!init()) return Promise.resolve(fallback);

    /* Tanpa orderBy supaya tidak butuh composite index. */
    return db.collection("certifications")
      .where("status", "==", wanted)
      .get()
      .then(function (snap) {
        return sortByCertOrder(snap.docs.map(function (doc) {
          return normalizeCertification(Object.assign({ id: doc.id }, doc.data()));
        }));
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca sertifikasi", fallback, []);
      });
  }

  /* Admin: semua sertifikat (published + draft). */
  function listAllCertifications() {
    if (!init()) return Promise.resolve([]);

    return db.collection("certifications").get()
      .then(function (snap) {
        return sortByCertOrder(snap.docs.map(function (doc) {
          return normalizeCertification(Object.assign({ id: doc.id }, doc.data()));
        }));
      })
      .catch(function (err) {
        return handleReadError(err, "Gagal membaca semua sertifikasi", [], []);
      });
  }

  function saveCertification(payload, id) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));

    var ref = id
      ? db.collection("certifications").doc(id)
      : db.collection("certifications").doc();

    return ref.get().then(function (doc) {
      var lama = doc.exists ? doc.data() : {};

      var data = Object.assign({}, payload, {
        title: payload.title || "Sertifikat",
        issuer: payload.issuer || "",
        credentialId: payload.credentialId || "",
        date: payload.date || "",
        url: payload.url || "",
        status: payload.status === "published" ? "published" : "draft",
        /* bawa "order" lama supaya edit tidak mengubah posisi.
           Sertifikat baru -> null, bukan undefined (Firestore
           menolak undefined). */
        order: typeof payload.order === "number" && !isNaN(payload.order)
          ? payload.order
          : (lama.order === undefined ? null : lama.order),
        createdAt: lama.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      delete data.id;

      return ref.set(cleanForWrite(data));
    });
  }

  function deleteCertification(id) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));
    return db.collection("certifications").doc(id).delete();
  }

  /* Simpan urutan manual beberapa sertifikat sekaligus
     (dipakai dashboard saat tombol panah ditekan). */
  function saveCertOrders(entries) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));

    var batch = db.batch ? db.batch() : null;

    if (!batch) {
      return entries.reduce(function (chain, e) {
        return chain.then(function () {
          return db.collection("certifications").doc(e.id).update(cleanForWrite({ order: e.order }));
        });
      }, Promise.resolve());
    }

    entries.forEach(function (e) {
      batch.update(db.collection("certifications").doc(e.id), cleanForWrite({ order: e.order }));
    });

    return batch.commit();
  }

  /* ---------------------------------------------------------
     ADMIN: SKILLS & PROFILE
     --------------------------------------------------------- */

  function saveSkill(data, id) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));
    var ref = id ? db.collection("skills").doc(id) : db.collection("skills").doc();
    return ref.set(cleanForWrite({
      name: data.name || "Skill",
      icon: data.icon || "♦†",
      description: data.description || "",
      order: Number(data.order) || Date.now()
    }));
  }

  function deleteSkill(id) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));
    return db.collection("skills").doc(id).delete();
  }

  function saveProfile(data) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));
    return db.collection("profile").doc("main").set(cleanForWrite(data), { merge: true });
  }

  /* ---------------------------------------------------------
     ADMIN: STORAGE
     --------------------------------------------------------- */

  function uploadImage(file, folder) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));
    if (!storage) {
      return Promise.reject(new Error(
        "Firebase Storage belum aktif (butuh plan Blaze). Pakai kolom URL/path gambar."
      ));
    }
    if (!file) return Promise.reject(new Error("File tidak dipilih."));

    if (file.size > 5 * 1024 * 1024) {
      return Promise.reject(new Error("Ukuran file maksimal 5 MB."));
    }
    if (file.type.indexOf("image/") !== 0) {
      return Promise.reject(new Error("Hanya file gambar yang diizinkan."));
    }

    var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    var path = (folder || "misc") + "/" + Date.now() + "-" + safeName;
    var ref = storage.ref(path);

    return ref.put(file).then(function () {
      return ref.getDownloadURL().then(function (url) {
        return { url: url, path: path };
      });
    });
  }

  function deleteImage(url) {
    if (!init() || !storage || !url) return Promise.resolve();
    return storage.refFromURL(url).delete().catch(function (err) {
      console.warn("[portfolio] Gagal hapus gambar:", err.message);
    });
  }

  /* ---------------------------------------------------------
     AUTH
     --------------------------------------------------------- */

  function signIn(email, password) {
    if (!init()) return Promise.reject(new Error("Firebase belum dikonfigurasi."));
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signOut() {
    if (!init()) return Promise.resolve();
    return auth.signOut();
  }

  function onAuthChange(callback) {
    if (!init()) {
      callback(null);
      return;
    }
    auth.onAuthStateChanged(callback);
  }

  /* ---------------------------------------------------------
     EXPORT
     --------------------------------------------------------- */

  return {
    hasStorage: hasStorage,
    isDenied: function () { return denied; },
    slugify: slugify,

    getProfile: getProfile,
    listSkills: listSkills,
    listProjects: listProjects,
    listAllProjects: listAllProjects,
    getProjectBySlug: getProjectBySlug,
    getProjectById: getProjectById,
    listCertifications: listCertifications,
    listAllCertifications: listAllCertifications,

    saveProject: saveProject,
    deleteProject: deleteProject,
    saveOrders: saveOrders,
    saveCertification: saveCertification,
    deleteCertification: deleteCertification,
    saveCertOrders: saveCertOrders,
    saveSkill: saveSkill,
    deleteSkill: deleteSkill,
    saveProfile: saveProfile,

    uploadImage: uploadImage,
    deleteImage: deleteImage,

    signIn: signIn,
    signOut: signOut,
    onAuthChange: onAuthChange
  };

})();
