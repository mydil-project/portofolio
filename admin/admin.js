/* =========================================================
   ADMIN DASHBOARD
   Dashboard / Projects / Skills / Settings
   ========================================================= */

(function () {
  "use strict";

  var LINK_TYPES = [
    ["github", "GitHub"],
    ["demo", "Live Demo"],
    ["monitoring", "Monitoring"],
    ["website", "Website"],
    ["documentation", "Documentation"],
    ["youtube", "YouTube"],
    ["download", "Download"],
    ["custom", "Custom"]
  ];

  var VIEWS = {
    dashboard: "Dashboard",
    projects: "Projects",
    skills: "Skills",
    certifications: "Sertifikasi",
    settings: "Settings"
  };

  var state = {
    user: null,
    projects: [],
    skills: [],
    certifications: [],

    /* gambar: URL / path gambar + file yang menunggu diunggah */
    coverUrl: "",
    coverOriginal: "",
    coverRemoved: false,
    coverFile: null,
    galleryFiles: [],
    filePreviews: [],

    slugTouched: false
  };

  /* ---------------------------------------------------------
     HELPER
     --------------------------------------------------------- */

  function $(sel) { return document.querySelector(sel); }

  function val(sel) {
    var el = $(sel);
    return el ? String(el.value || "").trim() : "";
  }

  function esc(text) { return UI.escapeHtml(text); }

  /* Ikon CRUD memakai karakter Unicode supaya tidak ada aset gambar
     tambahan. Label aslinya tidak hilang: ada di title (tooltip) dan
     .sr-only (dibaca screen reader). Ikon tambah (&#10133;) dan simpan
     (&#128190;) dipakai langsung di admin/index.html. */
  var ICO = {
    edit: '<span class="btn-ico" aria-hidden="true">&#9998;</span>',
    show: '<span class="btn-ico" aria-hidden="true">&#128065;</span>',
    hide: '<span class="btn-ico" aria-hidden="true">&#128683;</span>',
    del: '<span class="btn-ico" aria-hidden="true">&#128465;</span>'
  };

  /* Status proses pada tombol. Tulisan ditulis ke .sr-only, bukan
     textContent — memakai textContent akan menghapus ikon di dalam tombol. */
  function setBtnLabel(btn, label) {
    if (!btn) return;
    var slot = btn.querySelector ? btn.querySelector(".sr-only") : null;
    if (slot) slot.textContent = label;
    else btn.textContent = label;
    btn.title = label;
  }

  function setBtnBusy(btn, label) {
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add("is-busy");
    setBtnLabel(btn, label);
  }

  function setBtnIdle(btn, label) {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove("is-busy");
    setBtnLabel(btn, label);
  }

  function fmtDate(value) {
    var d = value ? new Date(value) : null;
    if (!d || isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  function friendlyError(err) {
    var code = (err && err.code) || "";
    var msg = (err && err.message) || "";

    if (code === "permission-denied") {
      return "Akses ditolak. Pastikan email kamu terdaftar di js/site-config.js dan security rules.";
    }
    if (code === "unauthenticated") {
      return "Sesi kamu habis. Silakan login ulang.";
    }
    if (code === "failed-precondition" || /requires an index/i.test(msg)) {
      return "Firestore butuh index. Buka tab Firestore > Indexes > Create Indexes, " +
        "lalu publish. Detail ada di SETUP.md.";
    }
    if (code === "unavailable" || /offline|network/i.test(msg)) {
      return "Koneksi ke database terputus. Coba beberapa saat lagi.";
    }
    if (code === "storage/unauthorized" || /storage\/unauthorized/i.test(code)) {
      return "Upload ditolak oleh Storage rules.";
    }
    if (/Storage belum aktif/i.test(msg) || /402|403/.test(code)) {
      return "Firebase Storage belum aktif. Pakai kolom URL/path gambar di form.";
    }
    if (code === "invalid-argument" || /invalid data|Unsupported field value/i.test(msg)) {
      var field = /found in field ([\w.]+)/.exec(msg);
      return "Data ditolak Firestore: field " + (field ? field[1] : "?") +
        " berisi nilai yang tidak valid (undefined/NaN). " +
        "Ini bug di form, bukan di datamu — kirim detail di bawah ke developer.";
    }
    return msg || "Terjadi kesalahan.";
  }

  function showStorageStatus() {
    var on = !!(window.Data && Data.hasStorage());
    var pill = $("#storagePill");
    var hint = $("#storageHint");

    if (pill) pill.hidden = on;
    if (hint) hint.hidden = on;
  }

  /* ---------------------------------------------------------
     AUTH
     --------------------------------------------------------- */

  function fatal(text) {
    $("#loader").hidden = true;
    $("#shell").hidden = true;
    $("#fatal").hidden = false;
    $("#fatalText").textContent = text;
  }

  function checkAdminEmail(user) {
    var allowed = (window.SITE.firebase.adminEmails || []).map(function (e) {
      return String(e).trim().toLowerCase();
    });
    var email = String(user.email || "").toLowerCase();

    if (allowed.length && allowed.indexOf(email) === -1) {
      UI.toast("Email ini belum terdaftar sebagai admin.", "error");

      var info = $("#accountInfo");
      if (info) {
        info.innerHTML = "<strong style='color:#f0a3a3'>Email " + esc(user.email) +
          " belum terdaftar di js/site-config.js (firebase.adminEmails) dan security rules. " +
          "Baca dan tulis project akan ditolak.</strong>";
      }
    }
  }

  function showApp(user) {
    $("#loader").hidden = true;
    $("#fatal").hidden = true;
    $("#shell").hidden = false;
    $("#adminEmail").textContent = user.email || "";

    var alertEmail = $("#alertEmail");
    if (alertEmail) alertEmail.textContent = user.email || "-";

    checkAdminEmail(user);
    showStorageStatus();
    route();

    loadProjects();
    loadSkills();
    loadCertifications();
    Data.getProfile().then(fillSettings);
  }

  /* ---------------------------------------------------------
     ROUTER
     --------------------------------------------------------- */

  function route() {
    var parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    var view = VIEWS[parts[0]] ? parts[0] : "dashboard";
    var action = parts[1] || "";
    var arg = parts[2] || "";

    document.querySelectorAll(".view").forEach(function (el) {
      el.classList.toggle("active", el.id === "view-" + view);
    });

    document.querySelectorAll(".side-nav a").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-route") === view);
    });

    $("#viewTitle").textContent =
      view === "projects" && action === "new" ? "Add Project" :
      view === "projects" && action === "edit" ? "Edit Project" :
      view === "certifications" && action === "new" ? "Add Sertifikat" :
      view === "certifications" && action === "edit" ? "Edit Sertifikat" :
      VIEWS[view];

    if (view === "projects" && action === "new") {
      openEditor(null);
    } else if (view === "projects" && action === "edit") {
      openEditor(arg);
    } else {
      closeEditor();
    }

    if (view === "certifications" && action === "new") {
      openCertEditor(null);
    } else if (view === "certifications" && action === "edit") {
      openCertEditor(arg);
    } else {
      closeCertEditor();
    }
  }

  function navigate(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  /* ---------------------------------------------------------
     DASHBOARD
     --------------------------------------------------------- */

  function thumb(project) {
    var inner = project.coverImage
      ? '<img src="' + esc(project.coverImage) + '" alt="">'
      : esc(UI.initials(project.title));
    return '<div class="cell-thumb">' + inner + "</div>";
  }

  function renderStats() {
    var published = state.projects.filter(function (p) { return p.status === "published"; });
    var draft = state.projects.filter(function (p) { return p.status !== "published"; });
    var featured = state.projects.filter(function (p) { return p.featured; });

    $("#statTotal").textContent = state.projects.length;
    $("#statPublished").textContent = published.length;
    $("#statDraft").textContent = draft.length;
    $("#statFeatured").textContent = featured.length;

    /* 5 project paling atas, mengikuti urutan manual. Urutan tidak
       ikut ditampilkan di sini: header tabel dashboard cuma 4 kolom
       (Project, Category, Status, Diperbarui). */
    var recent = state.projects.slice(0, 5);
    $("#recentBody").innerHTML = recent.length
      ? recent.map(function (p) {
          return "<tr>" +
            '<td><div class="cell-title">' + thumb(p) +
              "<div><strong>" + esc(p.title) + "</strong><small>" + esc(p.slug) + "</small></div>" +
            "</div></td>" +
            "<td>" + esc(p.category) + "</td>" +
            "<td>" + UI.statusBadge(p.status) + "</td>" +
            "<td>" + fmtDate(p.updatedAt) + "</td>" +
          "</tr>";
        }).join("")
      : '<tr><td colspan="4" class="hint">' +
        "Belum ada project. Tambahkan lewat tombol &#10133; di menu Projects." +
        "</td></tr>";


  }

  /* ---------------------------------------------------------
     PROJECT LIST
     --------------------------------------------------------- */

  function renderProjects() {
    var body = $("#projectBody");

    if (!state.projects.length) {
      body.innerHTML = '<tr><td colspan="7" class="hint">' +
        "Belum ada project. Klik tombol &#10133; di kanan atas untuk membuat yang pertama." +
        "</td></tr>";
      renderStats();
      return;
    }

    body.innerHTML = state.projects.map(function (p, i) {
      var first = i === 0;
      var last = i === state.projects.length - 1;

      return "<tr>" +
        '<td><div class="cell-title">' + thumb(p) +
          "<div><strong>" + esc(p.title) + "</strong><small>" + esc(p.slug) + "</small></div>" +
        "</div></td>" +
        "<td>" + esc(p.category) + (p.year ? " &middot; " + esc(p.year) : "") + "</td>" +
        "<td>" + UI.statusBadge(p.status) + "</td>" +
        "<td>" + (p.featured ? "&#9733;" : "&mdash;") + "</td>" +
        "<td>" + fmtDate(p.updatedAt) + "</td>" +
        "<td>" +
          '<div class="order-cell">' +
            '<button type="button" class="btn-icon" data-move="up" data-id="' + esc(p.id) + '"' +
              (first ? " disabled" : "") +
              ' title="Naikkan urutan" aria-label="Naikkan urutan ' + esc(p.title) + '">&#9650;</button>' +
            '<span class="order-pos">' + (i + 1) + "</span>" +
            '<button type="button" class="btn-icon" data-move="down" data-id="' + esc(p.id) + '"' +
              (last ? " disabled" : "") +
              ' title="Turunkan urutan" aria-label="Turunkan urutan ' + esc(p.title) + '">&#9660;</button>' +
          "</div>" +
        "</td>" +
        "<td>" +
          '<div class="row-actions">' +
            '<a class="btn-icon" href="#/projects/edit/' + esc(p.id) + '"' +
              ' title="Edit" aria-label="Edit ' + esc(p.title) + '">' + ICO.edit + "</a>" +
            '<button type="button" class="btn-icon" data-toggle="' + esc(p.id) + '"' +
              ' title="' + (p.status === "published" ? "Sembunyikan dari website publik" : "Tampilkan di website publik") + '"' +
              ' aria-label="' + (p.status === "published" ? "Sembunyikan " : "Tampilkan ") + esc(p.title) + '">' +
              (p.status === "published" ? ICO.hide : ICO.show) + "</button>" +
            '<button type="button" class="btn-icon btn-icon-danger" data-delete="' + esc(p.id) + '"' +
              ' title="Hapus" aria-label="Hapus ' + esc(p.title) + '">' + ICO.del + "</button>" +
          "</div>" +
        "</td>" +
      "</tr>";
    }).join("");

    renderStats();
  }

  function loadProjects() {
    return Data.listAllProjects().then(function (list) {
      state.projects = list;
      renderProjects();
      updateRulesAlert();
    });
  }

  function updateRulesAlert() {
    var alert = $("#rulesAlert");
    if (alert) alert.hidden = !(window.Data && Data.isDenied());
  }

  /* ---------------------------------------------------------
     PROJECT FORM
     --------------------------------------------------------- */

  function setStatus(status) {
    var radio = status === "published" ? $("#p-status-published") : $("#p-status-draft");
    if (radio) radio.checked = true;
  }

  function linkRowHtml(link) {
    var options = LINK_TYPES.map(function (t) {
      return '<option value="' + t[0] + '"' +
        (t[0] === (link.type || "custom") ? " selected" : "") + ">" + t[1] + "</option>";
    }).join("");

    return '<div class="link-row">' +
      '<select class="link-type">' + options + "</select>" +
      '<input type="text" class="link-title" placeholder="Label, contoh: GitHub Repository" value="' +
        esc(link.title || "") + '">' +
      '<input type="url" class="link-url" placeholder="https://..." value="' + esc(link.url || "") + '">' +
      '<button type="button" class="remove" title="Hapus link">&times;</button>' +
    "</div>";
  }

  function addLinkRow(link) {
    var row = document.createElement("div");
    row.innerHTML = linkRowHtml(link || {});
    $("#linkRows").appendChild(row.firstChild);
  }

  function readLinks() {
    return Array.prototype.map.call(document.querySelectorAll("#linkRows .link-row"), function (row) {
      return {
        type: row.querySelector(".link-type").value,
        title: row.querySelector(".link-title").value.trim(),
        url: row.querySelector(".link-url").value.trim()
      };
    }).filter(function (l) { return l.url; });
  }

  /* Gambar di halaman admin berada di /admin/, jadi path relatif
     harus ditambah ../ supaya pratinjaunya benar. */
  function previewSrc(url) {
    if (!url) return "";
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    return "../" + String(url).replace(/^\.?\//, "");
  }

  function galleryUrls() {
    return val("#p-gallery-url")
      .split("\n")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  function setGalleryUrls(urls) {
    $("#p-gallery-url").value = (urls || []).join("\n");
  }

  function renderCover() {
    var box = $("#coverThumb");
    var url = state.coverRemoved ? "" : val("#p-cover-url");

    if (url) {
      box.innerHTML = '<img src="' + esc(previewSrc(url)) + '" alt="Cover">';
    } else {
      box.textContent = "Kosong";
    }

    $("#removeCoverBtn").hidden = !url;
  }

  function renderGallery() {
    var html = galleryUrls().map(function (url, i) {
      return '<figure><img src="' + esc(previewSrc(url)) + '" alt="Galeri ' + (i + 1) + '">' +
        '<button type="button" data-gallery-index="' + i + '" title="Hapus foto">&times;</button></figure>';
    }).join("");

    html += state.galleryFiles.map(function (file, i) {
      return '<figure><img src="' + esc(previewSrc(state.filePreviews[i] || "")) + '" alt="Baru diunggah">' +
        '<button type="button" data-gallery-file="' + i + '" title="Batalkan">&times;</button></figure>';
    }).join("");

    $("#galleryList").innerHTML = html;
  }

  function resetImageState(project) {
    state.coverFile = null;
    state.coverRemoved = false;
    state.galleryFiles = [];
    state.filePreviews = [];
    state.coverOriginal = "";
    state.coverUrl = "";

    if (project) {
      state.coverOriginal = project.coverImage || "";
      state.coverUrl = project.coverImage || "";
    }

    $("#p-cover-url").value = state.coverUrl;
    setGalleryUrls(project ? (project.gallery || []) : []);
  }

  function clearForm() {
    $("#projectForm").reset();
    $("#p-id").value = "";
    $("#p-cover-file").value = "";
    $("#p-gallery-file").value = "";
    $("#linkRows").innerHTML = "";
    addLinkRow({ type: "github" });
    addLinkRow({ type: "monitoring" });

    state.slugTouched = false;
    resetImageState(null);

    setStatus("draft");
    renderCover();
    renderGallery();
  }

  function fillForm(project) {
    clearForm();

    $("#p-id").value = project.id;
    $("#p-title").value = project.title;
    $("#p-slug").value = project.slug;
    $("#p-short").value = project.shortDescription;
    $("#p-description").value = project.description;
    $("#p-category").value = project.category;
    $("#p-year").value = project.year;
    $("#p-role").value = project.role;
    $("#p-technologies").value = (project.technologies || []).join(", ");
    $("#p-hardware").value = (project.hardware || []).join(", ");
$("#p-software").value = (project.software || []).join(", ");
    $("#p-features").value = (project.features || []).join("\n");
    $("#p-featured").checked = !!project.featured;

    setStatus(project.status);

    state.slugTouched = true;
    resetImageState(project);

    $("#linkRows").innerHTML = (project.links || []).map(linkRowHtml).join("");
    if (!project.links || !project.links.length) {
      addLinkRow({ type: "github" });
      addLinkRow({ type: "monitoring" });
    }

    renderCover();
    renderGallery();
  }

  function openEditor(id) {
    if (id) {
      var found = state.projects.filter(function (p) { return p.id === id; })[0];
      $("#editorTitle").textContent = "Edit Project";

      if (found) {
        fillForm(found);
      } else {
        Data.getProjectById(id).then(function (p) {
          if (p) fillForm(p);
          else UI.toast("Project tidak ditemukan.", "error");
        });
      }
    } else {
      clearForm();
      $("#editorTitle").textContent = "Add Project";
    }

    $("#editorPanel").hidden = false;
    $("#projectListPanel").hidden = true;
  }

  function closeEditor() {
    $("#editorPanel").hidden = true;
    $("#projectListPanel").hidden = false;
  }

  function readForm() {
    var title = val("#p-title");
    var gallery = galleryUrls();

    return {
      title: title,
      slug: val("#p-slug") || Data.slugify(title),
      shortDescription: val("#p-short"),
      description: val("#p-description"),
      category: val("#p-category"),
      year: val("#p-year"),
      role: val("#p-role"),
      technologies: val("#p-technologies"),
      hardware: val("#p-hardware"),
      software: val("#p-software"),
      features: val("#p-features"),
      coverImage: state.coverRemoved ? "" : val("#p-cover-url"),
      gallery: gallery,
      links: readLinks(),
      status: $("#p-status-published").checked ? "published" : "draft",
      featured: $("#p-featured").checked
    };
  }

  /* File hanya diunggah kalau ada. Kalau Firebase Storage belum aktif,
     user cukup memakai kolom URL / path gambar. */
  function uploadPendingImages(payload) {
    var jobs = [];
    var folder = "projects/" + (payload.slug || "misc");

    if (state.coverFile) {
      jobs.push(Data.uploadImage(state.coverFile, folder).then(function (res) {
        payload.coverImage = res.url;
      }));
    }

    if (state.galleryFiles.length) {
      jobs.push(Promise.all(state.galleryFiles.map(function (file) {
        return Data.uploadImage(file, folder + "/gallery").then(function (res) { return res.url; });
      })).then(function (urls) {
        payload.gallery = payload.gallery.concat(urls);
      }));
    }

    return Promise.all(jobs).then(function () { return payload; });
  }

  function cleanupOldImages(payload) {
    var jobs = [];

    if (state.coverRemoved && state.coverOriginal && /^https?:/.test(state.coverOriginal)) {
      jobs.push(Data.deleteImage(state.coverOriginal));
    }

    return jobs;
  }

  function saveProject(e) {
    e.preventDefault();

    if (!val("#p-title")) {
      UI.toast("Project title wajib diisi.", "error");
      return;
    }
    if (!val("#p-category")) {
      UI.toast("Category wajib diisi.", "error");
      return;
    }

    var id = val("#p-id");
    var payload = readForm();
    var btn = $("#saveBtn");

    setBtnBusy(btn, "Menyimpan...");

    uploadPendingImages(payload)
      .then(function (data) { return Data.saveProject(data, id); })
      .then(function () {
        /* hasil upload langsung disimpan di kolom URL */
        if (payload.coverImage !== val("#p-cover-url")) $("#p-cover-url").value = payload.coverImage;
        if (state.galleryFiles.length) setGalleryUrls(payload.gallery);

        cleanupOldImages(payload);
        state.coverOriginal = payload.coverImage;
        state.galleryFiles = [];
        state.filePreviews = [];
        state.coverRemoved = false;

        setBtnIdle(btn, "Simpan Project");
        UI.toast(id ? "Project diperbarui." : "Project dibuat.", "success");
        navigate("#/projects");
        return loadProjects();
      })
      .catch(function (err) {
        setBtnIdle(btn, "Simpan Project");
        UI.toast(friendlyError(err), "error");
      });
  }

  /* ---------------------------------------------------------
     URUTAN PROJECT (tombol panah)
     ---------------------------------------------------------
     Angka "order" = posisi tampil di halaman publik.
     0 = paling atas. Proyek yang belum pernah digeser tetap
     null dan diurutkan paling akhir di sisi client. */
  function moveProject(id, direction) {
    var i = state.projects.findIndex(function (p) { return p.id === id; });
    if (i < 0) return;

    var target = direction === "up" ? i - 1 : i + 1;
    /* sudah di ujung daftar -> tidak ada yang perlu diubah */
    if (target < 0 || target >= state.projects.length) return;

    /* Tukar tempat di daftar, lalu beri nomor ulang seluruh proyek.
       Memberi nomor ke semua (bukan cuma dua yang ditukar) mencegah
       order null dan order angka bercampur, yang membuat urutan
       tidak stabil setelah beberapa kali ditekan. */
    var a = state.projects[i];
    state.projects.splice(i, 1);
    state.projects.splice(target, 0, a);

    var entries = state.projects.map(function (p, n) {
      p.order = n;
      return { id: p.id, order: n };
    });

    renderProjects();

    Data.saveOrders(entries)
      .then(function () { return loadProjects(); })
      .catch(function (err) {
        UI.toast(friendlyError(err), "error");
        return loadProjects();
      });
  }

  function toggleStatus(id) {
    var project = state.projects.filter(function (p) { return p.id === id; })[0];
    if (!project) return;

    var previous = project.status;
    var next = previous === "published" ? "draft" : "published";

    Data.saveProject(Object.assign({}, project, { status: next }), id)
      .then(function () {
        UI.toast("Status diubah ke " + next + ".", "success");
        return loadProjects();
      })
      .catch(function (err) {
        UI.toast(friendlyError(err), "error");
      });
  }

  function deleteProject(id) {
    var project = state.projects.filter(function (p) { return p.id === id; })[0];
    if (!project) return;

    if (!confirm('Hapus project "' + project.title + '"? Tindakan ini tidak bisa dibatalkan.')) return;

    Data.deleteProject(id)
      .then(function () {
        /* hapus hanya file yang memang diunggah ke Firebase Storage */
        if (/^https?:/.test(project.coverImage || "")) Data.deleteImage(project.coverImage);
        (project.gallery || []).forEach(function (url) {
          if (/^https?:/.test(url)) Data.deleteImage(url);
        });
        UI.toast("Project dihapus.", "success");
        return loadProjects();
      })
      .catch(function (err) { UI.toast(friendlyError(err), "error"); });
  }

  /* ---------------------------------------------------------
     SKILLS
     --------------------------------------------------------- */

  function renderSkills() {
    var host = $("#skillList");

    if (!state.skills.length) {
      host.innerHTML = '<p class="hint">Belum ada skills. Klik + Add Skill untuk menambahkan.</p>';
      return;
    }

    host.innerHTML = state.skills.map(function (s) {
      return '<div class="skill-row" data-skill-id="' + esc(s.id) + '">' +
        '<input type="text" class="icon-input" value="' + esc(s.icon) + '" readonly>' +
        '<input type="text" value="' + esc(s.name) + '" readonly>' +
        '<span class="hint">' + esc(s.description) + "</span>" +
        '<div class="row-actions">' +
          '<button type="button" class="btn-icon" data-skill-edit="' + esc(s.id) + '"' +
            ' title="Edit" aria-label="Edit ' + esc(s.name) + '">' + ICO.edit + "</button>" +
          '<button type="button" class="btn-icon btn-icon-danger" data-skill-delete="' + esc(s.id) + '"' +
            ' title="Hapus" aria-label="Hapus ' + esc(s.name) + '">' + ICO.del + "</button>" +
        "</div>" +
      "</div>";
    }).join("");
  }

  function loadSkills() {
    return Data.listSkills().then(function (list) {
      state.skills = list;
      renderSkills();
      updateRulesAlert();
    });
  }

  /* isi skill awal dari data contoh supaya section Skills tidak kosong */
  function seedSkills() {
    var btn = $("#seedSkillsBtn");
    var seeds = (window.SEED && window.SEED.skills) || [];

    if (!seeds.length) {
      UI.toast("Data contoh skill tidak ditemukan.", "error");
      return;
    }

    setBtnBusy(btn, "Menyimpan...");

    Promise.all(seeds.map(function (s, i) {
      return Data.saveSkill({
        name: s.name,
        icon: s.icon,
        description: s.description,
        order: i
      });
    }))
      .then(function () {
        UI.toast(seeds.length + " skill ditambahkan.", "success");
        return loadSkills();
      })
      .catch(function (err) { UI.toast(friendlyError(err), "error"); })
      .then(function () {
        setBtnIdle(btn, "Isi 4 skill awal");
      });
  }

  function openSkillForm(id) {
    var skill = id ? state.skills.filter(function (s) { return s.id === id; })[0] : null;

    $("#skillForm").reset();
    $("#s-id").value = skill ? skill.id : "";
    $("#s-icon").value = skill ? skill.icon || "" : "";
    $("#s-name").value = skill ? skill.name || "" : "";
    $("#s-description").value = skill ? skill.description || "" : "";

    $("#skillFormTitle").textContent = skill ? "Edit Skill" : "Add Skill";
    $("#skillFormPanel").hidden = false;
    $("#skillFormPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveSkill(e) {
    e.preventDefault();

    var name = val("#s-name");
    if (!name) {
      UI.toast("Nama skill wajib diisi.", "error");
      return;
    }

    var id = val("#s-id");
    var btn = $("#saveSkillBtn");
    btn.disabled = true;

    Data.saveSkill({
      name: name,
      icon: val("#s-icon"),
      description: val("#s-description")
    }, id)
      .then(function () {
        btn.disabled = false;
        UI.toast(id ? "Skill diperbarui." : "Skill ditambahkan.", "success");
        $("#skillFormPanel").hidden = true;
        return loadSkills();
      })
      .catch(function (err) {
        btn.disabled = false;
        UI.toast(friendlyError(err), "error");
      });
  }

  function deleteSkill(id) {
    var skill = state.skills.filter(function (s) { return s.id === id; })[0];
    if (!skill) return;
    if (!confirm('Hapus skill "' + skill.name + '"?')) return;

    Data.deleteSkill(id)
      .then(function () {
        UI.toast("Skill dihapus.", "success");
        return loadSkills();
      })
      .catch(function (err) { UI.toast(friendlyError(err), "error"); });
  }


  /* ---------------------------------------------------------
     SERTIFIKASI
     --------------------------------------------------------- */

  function renderCertifications() {
    var body = $("#certBody");

    if (!state.certifications.length) {
      body.innerHTML = '<tr><td colspan="6" class="hint">' +
        "Belum ada sertifikat. Klik tombol &#10133; di kanan atas untuk menambah yang pertama." +
        "</td></tr>";
      return;
    }

    body.innerHTML = state.certifications.map(function (c, i) {
      var first = i === 0;
      var last = i === state.certifications.length - 1;

      return "<tr>" +
        '<td><div class="cell-title">' +
          "<div><strong>" + esc(c.title) + "</strong>" +
          (c.credentialId ? "<small>" + esc(c.credentialId) + "</small>" : "") +
          "</div></div></td>" +
        "<td>" + esc(c.issuer || "-") + "</td>" +
        "<td>" + esc(c.date || "-") + "</td>" +
        "<td>" +
          /* Badge status di atas, ikon link verifikasi di bawahnya,
             dua-duanya rata tengah dalam satu kolom. */
          '<div class="cert-status">' + UI.statusBadge(c.status) +
            (c.url ? '<a class="icon-link" href="' + esc(c.url) + '" target="_blank" ' +
              'rel="noopener" title="Buka link sertifikat" aria-label="Buka link sertifikat">' +
              "&#8599;</a>" : "") +
          "</div>" +
        "</td>" +
        "<td>" +
          '<div class="order-cell">' +
            '<button type="button" class="btn-icon" data-cert-move="up" data-id="' + esc(c.id) + '"' +
              (first ? " disabled" : "") +
              ' title="Naikkan urutan" aria-label="Naikkan urutan ' + esc(c.title) + '">&#9650;</button>' +
            '<span class="order-pos">' + (i + 1) + "</span>" +
            '<button type="button" class="btn-icon" data-cert-move="down" data-id="' + esc(c.id) + '"' +
              (last ? " disabled" : "") +
              ' title="Turunkan urutan" aria-label="Turunkan urutan ' + esc(c.title) + '">&#9660;</button>' +
          "</div>" +
        "</td>" +
        "<td>" +
          '<div class="row-actions">' +
            '<a class="btn-icon" href="#/certifications/edit/' + esc(c.id) + '"' +
              ' title="Edit" aria-label="Edit ' + esc(c.title) + '">' + ICO.edit + "</a>" +
            '<button type="button" class="btn-icon" data-cert-toggle="' + esc(c.id) + '"' +
              ' title="' + (c.status === "published" ? "Sembunyikan dari website publik" : "Tampilkan di website publik") + '"' +
              ' aria-label="' + (c.status === "published" ? "Sembunyikan " : "Tampilkan ") + esc(c.title) + '">' +
              (c.status === "published" ? ICO.hide : ICO.show) + "</button>" +
            '<button type="button" class="btn-icon btn-icon-danger" data-cert-delete="' + esc(c.id) + '"' +
              ' title="Hapus" aria-label="Hapus ' + esc(c.title) + '">' + ICO.del + "</button>" +
          "</div>" +
        "</td>" +
      "</tr>";
    }).join("");
  }

  function loadCertifications() {
    return Data.listAllCertifications().then(function (list) {
      state.certifications = list;
      renderCertifications();
      updateRulesAlert();
    });
  }

  /* Isi 6 sertifikat awal dari data contoh supaya section
     Sertifikasi tidak kosong sebelum diisi manual. */
  function seedCertifications() {
    var btn = $("#seedCertsBtn");
    var seeds = (window.SEED && window.SEED.certifications) || [];

    if (!seeds.length) {
      UI.toast("Data contoh sertifikat tidak ditemukan.", "error");
      return;
    }

    setBtnBusy(btn, "Menyimpan...");

    Promise.all(seeds.map(function (c, i) {
      return Data.saveCertification({
        title: c.title,
        issuer: c.issuer,
        credentialId: c.credentialId,
        date: c.date,
        url: c.url,
        status: "published",
        order: i
      });
    }))
      .then(function () {
        UI.toast(seeds.length + " sertifikat ditambahkan.", "success");
        return loadCertifications();
      })
      .catch(function (err) { UI.toast(friendlyError(err), "error"); })
      .then(function () {
        setBtnIdle(btn, "Isi 6 sertifikat awal");
      });
  }

  function setCertStatus(status) {
    var radio = status === "published" ? $("#cert-status-published") : $("#cert-status-draft");
    if (radio) radio.checked = true;
  }

  function clearCertForm() {
    $("#certForm").reset();
    $("#c-cert-id").value = "";
    setCertStatus("draft");
  }

  function fillCertForm(cert) {
    clearCertForm();

    $("#c-cert-id").value = cert.id;
    $("#cert-title").value = cert.title;
    $("#cert-issuer").value = cert.issuer;
    $("#cert-date").value = cert.date;
    $("#cert-cred").value = cert.credentialId;
    $("#cert-url").value = cert.url;

    setCertStatus(cert.status);
  }

  function openCertEditor(id) {
    var cert = id
      ? state.certifications.filter(function (c) { return c.id === id; })[0]
      : null;

    clearCertForm();
    $("#certEditorTitle").textContent = cert ? "Edit Sertifikat" : "Add Sertifikat";

    if (cert) fillCertForm(cert);

    $("#certEditorPanel").hidden = false;
    $("#certListPanel").hidden = true;
  }

  function closeCertEditor() {
    $("#certEditorPanel").hidden = true;
    $("#certListPanel").hidden = false;
  }

  function saveCertification(e) {
    e.preventDefault();

    if (!val("#cert-title")) {
      UI.toast("Nama sertifikat wajib diisi.", "error");
      return;
    }

    var id = val("#c-cert-id");
    var btn = $("#saveCertBtn");

    setBtnBusy(btn, "Menyimpan...");

    Data.saveCertification({
      title: val("#cert-title"),
      issuer: val("#cert-issuer"),
      credentialId: val("#cert-cred"),
      date: val("#cert-date"),
      url: val("#cert-url"),
      status: $("#cert-status-published").checked ? "published" : "draft"
    }, id)
      .then(function () {
        setBtnIdle(btn, "Simpan Sertifikat");
        UI.toast(id ? "Sertifikat diperbarui." : "Sertifikat dibuat.", "success");
        navigate("#/certifications");
        return loadCertifications();
      })
      .catch(function (err) {
        setBtnIdle(btn, "Simpan Sertifikat");
        UI.toast(friendlyError(err), "error");
      });
  }

  function deleteCertification(id) {
    var cert = state.certifications.filter(function (c) { return c.id === id; })[0];
    if (!cert) return;
    if (!confirm('Hapus sertifikat "' + cert.title + '"?')) return;

    Data.deleteCertification(id)
      .then(function () {
        UI.toast("Sertifikat dihapus.", "success");
        return loadCertifications();
      })
      .catch(function (err) { UI.toast(friendlyError(err), "error"); });
  }

  function toggleCertStatus(id) {
    var cert = state.certifications.filter(function (c) { return c.id === id; })[0];
    if (!cert) return;

    var next = cert.status === "published" ? "draft" : "published";

    Data.saveCertification(Object.assign({}, cert, { status: next }), id)
      .then(function () {
        UI.toast("Status diubah ke " + next + ".", "success");
        return loadCertifications();
      })
      .catch(function (err) { UI.toast(friendlyError(err), "error"); });
  }

  /* Sama seperti project: semua sertifikat diberi nomor ulang,
     bukan cuma dua yang ditukar. */
  function moveCertification(id, direction) {
    var i = state.certifications.findIndex(function (c) { return c.id === id; });
    if (i < 0) return;

    var target = direction === "up" ? i - 1 : i + 1;
    if (target < 0 || target >= state.certifications.length) return;

    var moved = state.certifications[i];
    state.certifications.splice(i, 1);
    state.certifications.splice(target, 0, moved);

    var entries = state.certifications.map(function (c, n) {
      c.order = n;
      return { id: c.id, order: n };
    });

    renderCertifications();

    Data.saveCertOrders(entries)
      .then(function () { return loadCertifications(); })
      .catch(function (err) {
        UI.toast(friendlyError(err), "error");
        return loadCertifications();
      });
  }


  /* ---------------------------------------------------------
     SETTINGS
     --------------------------------------------------------- */

  var SETTINGS_FIELDS = [
    ["name", "#c-name"],
    ["profileImage", "#c-profileImage"],
    ["tagline", "#c-tagline"],
    ["heroTitle", "#c-heroTitle"],
    ["heroDescription", "#c-heroDescription"],
    ["aboutTitle", "#c-aboutTitle"],
    ["education", "#c-education"],
    ["focus", "#c-focus"],
    ["location", "#c-location"],
    ["email", "#c-email"],
    ["phone", "#c-phone"],
    ["github", "#c-github"],
    ["linkedin", "#c-linkedin"],
    ["instagram", "#c-instagram"],
    ["footerText", "#c-footerText"]
  ];

  function fillSettings(profile) {
    SETTINGS_FIELDS.forEach(function (f) {
      var el = $(f[1]);
      if (el) el.value = profile[f[0]] || "";
    });

    $("#c-about").value = (profile.about || []).join("\n\n");

    var info = $("#accountInfo");
    if (info && state.user) {
      info.textContent = "Login sebagai " + state.user.email + ".";
    }
  }

  function saveSettings(e) {
    e.preventDefault();

    var payload = {};
    SETTINGS_FIELDS.forEach(function (f) {
      payload[f[0]] = val(f[1]);
    });

    payload.about = val("#c-about")
      .split(/\n{2,}/)
      .map(function (t) { return t.trim(); })
      .filter(Boolean);

    Data.saveProfile(payload)
      .then(function () {
        UI.toast("Informasi portfolio disimpan.", "success");
        UI.applyProfile(payload);
      })
      .catch(function (err) { UI.toast(friendlyError(err), "error"); });
  }

  /* ---------------------------------------------------------
     EVENTS
     --------------------------------------------------------- */

  function bind() {
    window.addEventListener("hashchange", route);

    $("#logoutBtn").addEventListener("click", function () {
      Data.signOut().then(function () {
        window.location.replace("login.html");
      });
    });

    /* ---- projects ---- */
    $("#projectForm").addEventListener("submit", saveProject);

    $("#p-title").addEventListener("input", function () {
      if (state.slugTouched) return;
      $("#p-slug").value = Data.slugify(val("#p-title"));
    });

    $("#p-slug").addEventListener("input", function () {
      state.slugTouched = true;
    });

    $("#addLinkBtn").addEventListener("click", function () {
      addLinkRow({ type: "custom" });
    });

    $("#linkRows").addEventListener("click", function (e) {
      if (e.target.classList.contains("remove")) e.target.closest(".link-row").remove();
    });

    $("#p-cover-file").addEventListener("change", function () {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      state.coverFile = file;
      state.coverRemoved = false;
      $("#p-cover-url").value = "";
      $("#p-cover-file").value = "";
      renderCover();
      UI.toast("File siap diunggah saat project disimpan.");
    });

    $("#p-cover-url").addEventListener("input", function () {
      state.coverRemoved = false;
      renderCover();
    });

    $("#removeCoverBtn").addEventListener("click", function () {
      state.coverFile = null;
      state.coverRemoved = true;
      $("#p-cover-url").value = "";
      $("#p-cover-file").value = "";
      renderCover();
    });

    $("#p-gallery-file").addEventListener("change", function () {
      var files = Array.prototype.slice.call(e.target.files || []);
      if (!files.length) return;

      files.forEach(function (file) {
        state.galleryFiles.push(file);
        state.filePreviews.push(URL.createObjectURL(file));
      });
      e.target.value = "";
      renderGallery();
      UI.toast(files.length + " foto siap diunggah saat project disimpan.");
    });

    $("#p-gallery-url").addEventListener("input", renderGallery);

    $("#galleryList").addEventListener("click", function (e) {
      var idx = e.target.closest("[data-gallery-index]");
      var file = e.target.closest("[data-gallery-file]");
      var urls = galleryUrls();

      if (idx) {
        urls.splice(Number(idx.getAttribute("data-gallery-index")), 1);
        setGalleryUrls(urls);
        renderGallery();
      }

      if (file) {
        var i = Number(file.getAttribute("data-gallery-file"));
        state.galleryFiles.splice(i, 1);
        state.filePreviews.splice(i, 1);
        renderGallery();
      }
    });

$("#projectBody").addEventListener("click", function (e) {
    var del = e.target.closest("[data-delete]");
    var tog = e.target.closest("[data-toggle]");
    var mv = e.target.closest("[data-move]");

    if (del) deleteProject(del.getAttribute("data-delete"));
    else if (tog) toggleStatus(tog.getAttribute("data-toggle"));
    else if (mv && !mv.disabled) {
      moveProject(mv.getAttribute("data-id"), mv.getAttribute("data-move"));
    }
  });

    /* ---- skills ---- */
    $("#addSkillBtn").addEventListener("click", function () { openSkillForm(null); });
    $("#seedSkillsBtn").addEventListener("click", seedSkills);

    $("#cancelSkillBtn").addEventListener("click", function () {
      $("#skillFormPanel").hidden = true;
    });

    $("#skillForm").addEventListener("submit", saveSkill);

    $("#skillList").addEventListener("click", function (e) {
      var edit = e.target.closest("[data-skill-edit]");
      var del = e.target.closest("[data-skill-delete]");
      if (edit) openSkillForm(edit.getAttribute("data-skill-edit"));
      else if (del) deleteSkill(del.getAttribute("data-skill-delete"));
    });

    /* ---- sertifikasi ---- */
    $("#certForm").addEventListener("submit", saveCertification);
    $("#seedCertsBtn").addEventListener("click", seedCertifications);

    $("#certBody").addEventListener("click", function (e) {
      var del = e.target.closest("[data-cert-delete]");
      var tog = e.target.closest("[data-cert-toggle]");
      var mv = e.target.closest("[data-cert-move]");

      if (del) deleteCertification(del.getAttribute("data-cert-delete"));
      else if (tog) toggleCertStatus(tog.getAttribute("data-cert-toggle"));
      else if (mv && !mv.disabled) {
        moveCertification(mv.getAttribute("data-id"), mv.getAttribute("data-cert-move"));
      }
    });

    /* ---- settings ---- */
    $("#settingsForm").addEventListener("submit", saveSettings);
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */

  function init() {
    bind();

    if (!window.SITE_READY) {
      fatal("Isi dulu konfigurasi Firebase di js/site-config.js " +
        "(bagian firebase.config dan firebase.adminEmails), lalu ikuti langkah di SETUP.md.");
      return;
    }

    if (!location.hash) location.hash = "#/dashboard";

    Data.onAuthChange(function (user) {
      if (!user) {
        window.location.replace("login.html");
        return;
      }
      state.user = user;
      showApp(user);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
