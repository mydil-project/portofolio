/* =========================================================
   SITE (satu halaman)
   ------------------------------------------------------------
   Menggantikan home.js + projects.js + project.js.

    Isi halaman:
      - #projectsGrid  : daftar project + filter/sort
      - #skillsGrid    : skills dari Firestore
      - #projectModal  : detail project (dari hash #project/slug)

   Detail project TIDAK punya halaman sendiri. Kartu project
   menunjuk ke hash "#project/<slug>" supaya URL-nya bisa
   dibagikan dan tombol Back browser tetap bekerja.
   ========================================================= */

(function () {
  "use strict";

  var PROJECT_PREFIX = "project/";

  /* ---------------------------------------------------------
     DAFTAR PROJECT: filter + sort
     --------------------------------------------------------- */

  var state = {
    all: [],
    category: "All",
    /* "manual" = urutan yang disetel di dashboard admin (tombol panah).
       Ini mode default supaya halaman publik persis sama urutannya
       dengan daftar project di dashboard. */
    sort: "manual"
  };

  function categories() {
    var set = {};
    state.all.forEach(function (p) { set[p.category] = true; });
    return Object.keys(set).sort();
  }

  function renderChips() {
    var host = UI.qs("#categoryChips");
    if (!host) return;
    var list = ["All"].concat(categories());

    host.innerHTML = list.map(function (c) {
      var count = c === "All"
        ? state.all.length
        : state.all.filter(function (p) { return p.category === c; }).length;

      return '<button type="button" class="chip' +
        (state.category === c ? " active" : "") +
        '" data-category="' + UI.escapeHtml(c) + '" role="tab" aria-selected="' +
        (state.category === c) + '">' + UI.escapeHtml(c) +
        '<span class="chip-count">' + count + "</span></button>";
    }).join("");
  }

  /* Sama dengan Data.sortByOrder: angka order kecil di atas,
     yang order-nya null (belum pernah digeser) paling akhir. */
  var TANPA_ORDER = 1e9;

  function urutManual(a, b) {
    var oa = a.order === null || a.order === undefined ? TANPA_ORDER : a.order;
    var ob = b.order === null || b.order === undefined ? TANPA_ORDER : b.order;
    if (oa !== ob) return oa - ob;

    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  function sortProjects(list) {
    var out = list.slice();

    if (state.sort === "old") {
      out.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
    } else if (state.sort === "az") {
      out.sort(function (a, b) { return a.title.localeCompare(b.title, "id"); });
    } else if (state.sort === "manual") {
      out.sort(urutManual);
    } else {
      out.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    }
    return out;
  }

  function renderList() {
    var grid = UI.qs("#projectsGrid");
    if (!grid) return;

    var result = state.all.filter(function (p) {
      return state.category === "All" || p.category === state.category;
    });

    var sorted = sortProjects(result);

    UI.qs("#resultCount").textContent = sorted.length + " project ditemukan";
    UI.qs("#activeFilter").textContent =
      state.category === "All" ? "" : "Kategori: " + state.category;

    if (!sorted.length) {
      grid.classList.add("full");
      grid.innerHTML = UI.emptyState(
        "Project tidak ditemukan",
        "Belum ada project pada kategori ini. Pilih kategori lain atau tambahkan lewat dashboard."
      );
      return;
    }

    grid.classList.remove("full");
    grid.innerHTML = sorted.map(UI.projectCard).join("");
  }

  function bindFilters() {
    var sort = UI.qs("#sortSelect");
    var chips = UI.qs("#categoryChips");
    if (!sort || !chips) return;

    sort.addEventListener("change", function () {
      state.sort = sort.value;
      renderList();
    });

    chips.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-category]");
      if (!btn) return;
      state.category = btn.getAttribute("data-category");
      renderChips();
      renderList();
    });
  }

  /* ---------------------------------------------------------
     SKILLS
     --------------------------------------------------------- */

  function renderSkills(skills) {
    var grid = UI.qs("#skillsGrid");
    if (!grid) return;

    if (!skills.length) {
      grid.outerHTML = UI.emptyState("Belum ada skills", "Tambahkan skills lewat admin.");
      return;
    }

    grid.innerHTML = skills.map(function (s) {
      return '<article class="skill-card" data-reveal>' +
        '<div class="skill-icon">' + UI.escapeHtml(s.icon || "♦") + "</div>" +
        "<h3>" + UI.escapeHtml(s.name) + "</h3>" +
        "<p>" + UI.escapeHtml(s.description) + "</p>" +
      "</article>";
    }).join("");

    UI.reveal(grid);
  }

  /* ---------------------------------------------------------
     SERTIFIKASI
     --------------------------------------------------------- */

  /* Tanggal "2026-09-01" -> "1 Sep 2026".
     Sengaja memakai UTC supaya tidak bergeser sehari
     kalau Pengunjung berada di zona waktu lain. */
  function certDate(value) {
    var d = value ? new Date(String(value) + "T00:00:00Z") : null;
    if (!d || isNaN(d.getTime())) return "";

    return d.toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
    });
  }

  function renderCertifications(list) {
    var grid = UI.qs("#certGrid");
    if (!grid) return;

    if (!list.length) {
      grid.outerHTML = UI.emptyState(
        "Belum ada sertifikat",
        "Tambahkan sertifikat lewat dashboard admin."
      );
      return;
    }

    grid.innerHTML = list.map(function (c) {
      var meta = [];

      if (c.date) {
        meta.push('<span><time datetime="' + UI.escapeHtml(c.date) + '">' +
          UI.escapeHtml(certDate(c.date)) + "</time></span>");
      }
      if (c.credentialId) {
        meta.push("<code>" + UI.escapeHtml(c.credentialId) + "</code>");
      }

      var link = c.url
        ? '<a class="cert-link" href="' + UI.escapeHtml(c.url) + '" target="_blank" ' +
          'rel="noopener">Lihat Sertifikat &#8599;</a>'
        : "";

      return '<article class="cert-card" data-reveal>' +
        (c.issuer ? '<div class="cert-issuer">' + UI.escapeHtml(c.issuer) + "</div>" : "") +
        "<h3>" + UI.escapeHtml(c.title) + "</h3>" +
        (meta.length ? '<div class="cert-meta">' + meta.join("") + "</div>" : "") +
        link +
        "</article>";
    }).join("");

    UI.reveal(grid);
  }

  /* ---------------------------------------------------------
     MODAL DETAIL PROJECT
     --------------------------------------------------------- */

  var modal = (function () {
    var el = null;
    var root = null;
    var closeBtn = null;
    var current = "";
    var lastFocus = null;
    var baseTitle = "";
    var baseDescription = "";

    function el_() { return el || (el = UI.qs("#projectModal")); }

    function detailRoot() { return root || (root = UI.qs("#projectRoot")); }

    function slugFromHash() {
      var hash = (window.location.hash || "").replace("#", "");
      if (hash.indexOf(PROJECT_PREFIX) !== 0) return "";
      return decodeURIComponent(hash.slice(PROJECT_PREFIX.length));
    }

    function listBlock(title, iconName, items, modifier) {
      if (!items || !items.length) return "";
      return '<section class="detail-block' + (modifier ? " " + modifier : "") + '" data-reveal>' +
        '<h2 class="detail-title">' + UI.icon(iconName, 18) + UI.escapeHtml(title) + "</h2>" +
        '<ul class="feature-list">' + items.map(function (item) {
          return "<li>" + UI.escapeHtml(item) + "</li>";
        }).join("") + "</ul></section>";
    }

    /* Hardware / Software / Technologies ditampilkan mendatar sebagai
       pill, bukan daftar vertikal: isinya bukan kalimat panjang, jadi
       lebih mudah dipindai dan tidak memakan tinggi halaman.
       Fitur Utama tetap daftar vertikal karena isinya kalimat. */
    function chipBlock(title, iconName, items) {
      if (!items || !items.length) return "";
      return '<section class="detail-block" data-reveal>' +
        '<h2 class="detail-title">' + UI.icon(iconName, 18) + UI.escapeHtml(title) + "</h2>" +
        '<div class="tags">' + UI.tagHtml(items, items.length) + "</div>" +
        "</section>";
    }

    function infoRows(project) {
      var rows = [
        ["Category", project.category],
        ["Year", project.year],
        ["Role", project.role],
        ["Published", UI.formatDate(project.createdAt)],
        ["Last update", UI.formatDate(project.updatedAt)]
      ];

      return rows.filter(function (r) { return r[1]; }).map(function (r) {
        return '<div class="info-row"><span>' + UI.escapeHtml(r[0]) +
          "</span><strong>" + UI.escapeHtml(r[1]) + "</strong></div>";
      }).join("");
    }

    function sourceBlock(project) {
      var github = (project.links || []).filter(function (l) { return l.type === "github"; })[0];
      if (!github) return "";

      return '<div class="source-box">' +
        '<span class="eyebrow">SOURCE CODE</span>' +
        "<h3>GitHub Repository</h3>" +
        '<code class="source-url">' + UI.escapeHtml(github.url.replace(/^https?:\/\//, "")) + "</code>" +
        '<a class="btn btn-primary btn-sm" href="' + UI.escapeHtml(github.url) + '" target="_blank" rel="noopener">' +
        "View Repository &#8599;</a></div>";
    }

    function relatedBlock(project, all) {
      var sameCategory = all.filter(function (p) {
        return p.slug !== project.slug && p.category === project.category;
      });
      var others = all.filter(function (p) {
        return p.slug !== project.slug && p.category !== project.category;
      });

      var list = sameCategory.concat(others).slice(0, 4);
      if (!list.length) return "";

      return '<section class="detail-block related-section" data-reveal>' +
        '<h2 class="detail-title">Project lainnya</h2>' +
        '<div class="project-grid">' + list.map(UI.projectCard).join("") + "</div>" +
        "</section>";
    }

    function notFound() {
      detailRoot().innerHTML = UI.emptyState(
        "Project tidak ditemukan",
        "Cek kembali link-nya atau buka daftar semua project."
      );
    }

    function paint(project, all) {
      var target = detailRoot();

      if (!project) {
        notFound();
        return;
      }

      document.title = project.title + " — Aidil Febrian";
      var meta = document.querySelector('meta[name="description"]');
      if (meta && project.shortDescription) meta.setAttribute("content", project.shortDescription);

      var cover = project.coverImage
        ? '<img src="' + UI.escapeHtml(project.coverImage) + '" alt="' + UI.escapeHtml(project.title) + '">'
        : '<div class="image-placeholder big"><span>' + UI.escapeHtml(UI.initials(project.title)) + "</span></div>";

      target.innerHTML = "" +
        '<div class="detail-hero" data-reveal>' +
          '<div class="detail-cover">' + cover + "</div>" +
          '<div class="detail-intro">' +
            '<div class="project-category">' +
              UI.escapeHtml([project.category, project.year].filter(Boolean).join(" · ")) +
            "</div>" +
            "<h1 id=\"modalTitle\">" + UI.escapeHtml(project.title) + "</h1>" +
            '<p class="detail-lead">' + UI.escapeHtml(project.shortDescription) + "</p>" +
            (project.technologies.length
              ? '<div class="tags">' + UI.tagHtml(project.technologies, 6) + "</div>"
              : "") +
            (project.links.length
              ? '<div class="detail-links">' + UI.linkButtons(project.links) + "</div>"
              : "") +
          "</div>" +
        "</div>" +

        '<div class="detail-layout">' +

          '<div class="detail-main">' +
            (project.description
              ? '<section class="detail-block" data-reveal><h2 class="detail-title">Deskripsi</h2>' +
                '<div class="detail-text">' + UI.escapeHtml(project.description)
                  .split(/\n{2,}/).map(function (p) { return "<p>" + p + "</p>"; }).join("") +
                "</div></section>"
              : "") +
            listBlock("Fitur Utama", "star", project.features) +
            chipBlock("Hardware", "chip", project.hardware) +
            chipBlock("Software", "monitor", project.software) +
            chipBlock("Technologies", "layers", project.technologies) +
            (project.gallery.length
              ? '<section class="detail-block" data-reveal>' +
                  '<h2 class="detail-title">Galeri</h2>' +
                  '<div class="gallery-grid">' + project.gallery.map(function (src, i) {
                    return '<img src="' + UI.escapeHtml(src) + '" alt="' +
                      UI.escapeHtml(project.title) + " " + (i + 1) +
                      '" loading="lazy" data-lightbox="galeri">';
                  }).join("") + "</div></section>"
              : "") +
            relatedBlock(project, all) +
          "</div>" +

          '<aside class="detail-side">' +
            '<div class="side-card" data-reveal><h3 class="side-title">Informasi Project</h3>' +
              infoRows(project) + "</div>" +
            sourceBlock(project) +
            '<div class="side-card" data-reveal><h3 class="side-title">Tertarik dengan project ini?</h3>' +
              '<p class="side-text">Punya ide serupa di bidang teknik, IoT, atau embedded? Mari didiskusikan.</p>' +
              /* Pindah ke #contact; hashchange menutup modal */
              '<a href="#contact" class="btn btn-outline btn-sm">Hubungi saya</a>' +
            "</div>" +
          "</aside>" +

        "</div>";

      UI.reveal(target);
    }

    function show(slug) {
      var node = el_();
      if (!node) return;

      if (!closeBtn) {
        closeBtn = node.querySelector(".modal-close");
        if (closeBtn) closeBtn.innerHTML = UI.icon("close", 20);
      }

      current = slug;
      lastFocus = document.activeElement;

      node.hidden = false;
      node.classList.add("open");
      UI.lockScroll();

      if (!baseTitle) baseTitle = document.title;
      var meta = document.querySelector('meta[name="description"]');
      if (meta && !baseDescription) baseDescription = meta.getAttribute("content") || "";

      detailRoot().innerHTML =
        '<div class="detail-skeleton">' +
          '<div class="sk-line lg"></div>' +
          '<div class="sk-line"></div>' +
          '<div class="sk-block"></div>' +
        "</div>";

      Data.getProjectBySlug(slug).then(function (project) {
        /* hash boleh berubah lagi sebelum data sampai -> jangan paint yang basi */
        if (current !== slug) return;
        paint(project, state.all);
        if (closeBtn) closeBtn.focus();
      });
    }

    function hide() {
      var node = el_();
      if (!node || node.hasAttribute("hidden")) return;

      node.classList.remove("open");
      node.hidden = true;
      UI.unlockScroll();
      current = "";

      document.title = baseTitle;
      var meta = document.querySelector('meta[name="description"]');
      if (meta && baseDescription) meta.setAttribute("content", baseDescription);

      detailRoot().innerHTML = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    /* Tutup modal TANPA melompat ke atas halaman.
       `location.hash = ""` membuat browser scroll ke atas, jadi hash
       diganti lewat history.replaceState: tidak ada scroll sama sekali
       dan tidak ada entri history baru (tombol Back tidak membuka lagi
       modal yang baru ditutup).

       Hash tetap jadi sumber kebenaran: diisi "#projects" supaya menu
       Projects tetap tersorot dan URL masih bisa dibagikan. */
    function close() {
      try {
        window.history.replaceState(null, "", "#projects");
        hide();

        /* replaceState tidak memicu hashchange, jadi listener-nya
           dipanggil sendiri supaya menu navbar ikut ter-update. */
        window.dispatchEvent(new Event("hashchange"));
      } catch (err) {
        /* browser lama / konteks tersandbox: geser hash seperti biasa */
        window.location.hash = "#projects";
      }
    }

    function toggle() {
      if (isOpen()) close();
      else window.location.hash = "#projects";
    }

    function syncFromHash() {
      var slug = slugFromHash();
      if (slug) {
        if (slug === current) return;
        show(slug);
      } else {
        hide();
      }
    }

    function mount() {
      var node = el_();
      if (!node) return;

      /* Klik backdrop (area di luar .modal-panel), tombol tutup, atau
         Escape -> close(): hash diganti ke #projects tanpa scroll, jadi
         pengunjung tetap di section Projects, bukan balik ke atas. */
      node.addEventListener("click", function (e) {
        if (e.target === node || e.target.closest("[data-modal-close]")) {
          toggle();
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && isOpen()) toggle();
      });

      window.addEventListener("hashchange", function () {
        closeMenu();
        syncFromHash();
      });
    }

    function closeMenu() {
      var menu = UI.qs(".nav-menu");
      var toggle = UI.qs(".nav-toggle");
      if (menu) menu.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }

    function isOpen() {
      var node = el_();
      return !!(node && !node.hasAttribute("hidden"));
    }

    return { mount: mount, syncFromHash: syncFromHash, isOpen: isOpen };
  })();

  /* ---------------------------------------------------------
     BOOT
     --------------------------------------------------------- */

  function init() {
    var grid = UI.qs("#projectsGrid");
    if (grid) grid.innerHTML = UI.skeletonGrid(3);

    Data.listProjects("published").then(function (list) {
      state.all = list;
      renderChips();
      renderList();
    });

    Data.listSkills().then(renderSkills);

    Data.listCertifications("published").then(renderCertifications);

    bindFilters();
    modal.mount();
    modal.syncFromHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
