/* =========================================================
   UI HELPERS  (dipakai semua halaman public)
   ========================================================= */

window.UI = (function () {

  /* ---------------------------------------------------------
     DASAR
     --------------------------------------------------------- */

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  

  function isUnset(value) {
    return !value || String(value).indexOf("GANTI_DENGAN") !== -1;
  }

  /* Teks dengan tanda * menjadi highlight biru */
  function highlight(text) {
    return escapeHtml(text || "")
      .split("*")
      .map(function (chunk, i) {
        return i % 2 === 1 ? "<span>" + chunk + "</span>" : chunk;
      })
      .join("");
  }

  function formatDate(value) {
    var d = value ? new Date(value) : null;
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  }

  function initials(text) {
    return String(text || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); })
      .join("");
  }

  /* ---------------------------------------------------------
     ICON (SVG inline, tanpa library)
     --------------------------------------------------------- */

  var ICONS = {
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    demo: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
    monitoring: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/>',
    documentation: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l6 3-6 3z"/>',
    download: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/>',
    custom: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    arrowRight: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5m6 6-6-6 6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    star: '<path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
    monitor: '<rect x="2" y="4" width="20" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'
  };

  function icon(name, size) {
    var d = ICONS[name] || ICONS.custom;
    var s = size || 18;
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  }

  /* ---------------------------------------------------------
     KOMPONEN
     --------------------------------------------------------- */

  function coverHtml(project) {
    if (project.coverImage) {
      return '<img src="' + escapeHtml(project.coverImage) + '" ' +
        'alt="' + escapeHtml(project.title) + '" loading="lazy">';
    }
    return '<div class="image-placeholder"><span>' +
      escapeHtml(initials(project.title)) + "</span></div>";
  }

  function statusBadge(status) {
    var cls = status === "published" ? "badge-published" : "badge-draft";
    var label = status === "published" ? "Published" : "Draft";
    return '<span class="badge ' + cls + '">' + label + "</span>";
  }

  function tagHtml(list, limit) {
    var items = (list || []).slice(0, limit || 3);
    return items.map(function (t) {
      return "<span>" + escapeHtml(t) + "</span>";
    }).join("");
  }

  function projectCard(project) {
    var href = "#project/" + encodeURIComponent(project.slug);
    var meta = [project.category, project.year].filter(Boolean).join(" · ");

    return "" +
      '<article class="project-card">' +
        '<a class="project-image" href="' + href + '" aria-label="' + escapeHtml(project.title) + '">' +
          coverHtml(project) +
          (project.featured ? '<span class="card-flag">Featured</span>' : "") +
        "</a>" +
        '<div class="project-body">' +
          '<div class="project-category">' + escapeHtml(meta) + "</div>" +
          '<h3><a href="' + href + '">' + escapeHtml(project.title) + "</a></h3>" +
          "<p>" + escapeHtml(project.shortDescription) + "</p>" +
          '<div class="tags">' + tagHtml(project.technologies, 3) + "</div>" +
          '<div class="project-foot">' +
            '<a class="project-link" href="' + href + '">View Project ↗</a>' +
            '<div class="card-links">' + linkDots(project.links) + "</div>" +
          "</div>" +
        "</div>" +
      "</article>";
  }

  function linkDots(links) {
    return (links || []).slice(0, 3).map(function (l) {
      return '<a class="icon-link" href="' + escapeHtml(l.url) + '" target="_blank" ' +
        'rel="noopener" title="' + escapeHtml(l.title || l.type) + '">' +
        icon(l.type, 15) + "</a>";
    }).join("");
  }

  function linkButtons(links) {
    return (links || []).map(function (l) {
      return '<a class="btn btn-outline btn-sm" href="' + escapeHtml(l.url) + '" ' +
        'target="_blank" rel="noopener">' + icon(l.type, 16) +
        escapeHtml(l.title || l.type) + " <></></a>";
    }).join("");
  }

  function skeletonGrid(count) {
    var html = "";
    for (var i = 0; i < (count || 3); i++) {
      html += '<div class="project-card skeleton"><div class="project-image"></div>' +
        '<div class="project-body"><div class="sk-line lg"></div><div class="sk-line"></div>' +
        '<div class="sk-line sm"></div></div></div>';
    }
    return html;
  }

  function emptyState(title, message) {
    return '<div class="empty-state">' +
      '<div class="empty-icon">' + icon("layers", 26) + "</div>" +
      "<h3>" + escapeHtml(title) + "</h3>" +
      "<p>" + escapeHtml(message || "") + "</p></div>";
  }

  /* ---------------------------------------------------------
     NAVBAR
     --------------------------------------------------------- */

  function markActive() {
    var raw = (window.location.hash || "").replace("#", "");

    /* Hash detail project (#project/slug) bukan section navbar:
       tidak ada menu yang harus disorot selama modal terbuka. */
    var isProject = raw.indexOf("project/") === 0;
    /* Tanpa hash = sedang di section paling atas */
    var hash = isProject ? "" : (raw || "home");

    qsa(".nav-menu a").forEach(function (a) {
      /* link eksternal dan link yang belum diisi tidak pernah jadi "aktif" */
      if (a.hasAttribute("data-unset") || a.getAttribute("target") === "_blank") {
        a.classList.remove("active");
        return;
      }

      var anchor = (a.getAttribute("href") || "").split("#")[1] || "";

      a.classList.toggle("active", anchor === hash);
    });
  }

  function mountNav() {
    var toggle = qs(".nav-toggle");
    var menu = qs(".nav-menu");

    function closeMenu() {
      if (!menu || !toggle) return;
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });

      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu();
      });

      /* klik di luar menu -> tutup */
      document.addEventListener("click", function (e) {
        if (!menu.classList.contains("open")) return;
        if (menu.contains(e.target) || toggle.contains(e.target)) return;
        closeMenu();
      });

      /* tombol Escape -> tutup */
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });

      /* kembali ke desktop -> tutup */
      window.addEventListener("resize", function () {
        if (window.innerWidth > 850) closeMenu();
      });
    }

    markActive();
    window.addEventListener("hashchange", markActive);

    /* link yang datanya belum diisi: jangan sampai terkirim ke URL palsu */
    document.addEventListener("click", function (e) {
      var link = e.target.closest && e.target.closest("a[data-unset]");
      if (!link) return;
      e.preventDefault();
      toast("Link ini belum diisi. Atur di Admin > Settings.");
    });
  }

  /* ---------------------------------------------------------
     PROFIL (isi otomatis dari Firestore / site-config)

     Atribut yang dipakai di HTML:
       data-profile="namaField"   -> teks elemen diisi dengan nilai
                                     (pakai data-highlight kalau ada tanda *)
       data-label="namaField"     -> teks pertama diganti, elemen anak
                                     (mis. <span><></></span>) tetap utuh
       data-href-field="namaField"-> hanya HREF yang diisi
                                      (github/linkedin/email/phone/instagram)
     --------------------------------------------------------- */

  var LINK_FIELDS = { github: 1, linkedin: 1, email: 1, phone: 1, instagram: 1 };

  /* Nomor telepon -> link WhatsApp.
     "wa.me" hanya menerima digit, jadi "+62-857-6318-4495"
     dirapikan jadi "6285763184495". */
  function phoneHref(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";

    /* 08xx -> 628xx, lalu nomor lokal -> awalan 62 */
    if (digits.slice(0, 1) === "0") digits = "62" + digits.slice(1);
    if (digits.slice(0, 2) !== "62") digits = "62" + digits;

    return "https://wa.me/" + digits;
  }

  /* Instagram diisi tanpa protocol ("instagram.com/...") tetap jadi link valid */
  function instagramHref(value) {
    var url = String(value || "").trim();
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : "https://" + url;
  }

  function linkHref(key, value) {
    if (key === "email") return "mailto:" + value;
    if (key === "phone") return phoneHref(value);
    if (key === "instagram") return instagramHref(value);
    return value;
  }

  /* Teks yang ditampilkan untuk sebuah field link.
     Nilai di Firestore berupa URL penuh ("https://github.com/mydil-project"),
     tapi yang tampil di layar harus label ringkas. Tanpa ini contact-list
     menampilkan "https://instagram.com/mydil_soft_spoken" mentah. */
  function linkLabel(key, value) {
    var text = String(value || "").trim();

    if (key === "github") {
      var gh = text.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/+$/, "");
      return gh ? "@" + gh : text;
    }

    if (key === "instagram") {
      var ig = text.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/+$/, "");
      return ig ? "@" + ig : text;
    }

    if (key === "linkedin") {
      return "LinkedIn";
    }

    return text;
  }

  /* ganti teks langsung tanpa menghapus elemen anak (ikon/panah) */
  function setLabel(el, text) {
    var textNodes = Array.prototype.filter.call(el.childNodes, function (n) {
      return n.nodeType === 3;
    });

    if (!textNodes.length) {
      el.insertBefore(document.createTextNode(text), el.firstChild);
      return;
    }

    textNodes[0].nodeValue = text;
    textNodes.slice(1).forEach(function (n) { n.parentNode.removeChild(n); });
  }

  function applyProfile(profile) {
    /* 1) elemen teks */
    qsa("[data-profile]").forEach(function (el) {
      var key = el.getAttribute("data-profile");
      var value = profile[key];
      if (value == null || value === "") return;

      /* Field link (github/linkedin/...) menampilkan label ringkas,
         bukan URL mentah yang tersimpan di Firestore. */
      if (LINK_FIELDS[key]) value = linkLabel(key, value);

      if (el.hasAttribute("data-highlight")) {
        el.innerHTML = highlight(value);
      } else if (el.hasAttribute("data-label")) {
        setLabel(el, value);
      } else if (!el.children.length) {
        el.textContent = value;
      }
      /* elemen ber-child (mis. tombol "GitHub <span><></></span>")
         labelnya dibiarkan apa adanya, hanya href yang diubah */
    });

    /* 2) elemen link: hanya href yang diisi, label tidak disentuh */
    qsa("[data-href-field]").forEach(function (el) {
      var key = el.getAttribute("data-href-field");
      if (!LINK_FIELDS[key]) return;

      var value = profile[key];
      var unset = value == null || value === "" || isUnset(value);

      if (unset) {
        el.setAttribute("href", "#");
        el.setAttribute("title", "Belum diisi —” atur di Admin > Settings");
        el.setAttribute("data-unset", "1");
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-unset");
      } else {
        el.setAttribute("href", linkHref(key, value));
        el.removeAttribute("title");
        el.removeAttribute("data-unset");
        el.removeAttribute("aria-disabled");
        el.classList.remove("is-unset");
      }
    });

    /* 3) elemen gambar: hanya src yang diisi, teks di dalamnya tidak
       disentuh. Kalau field kosong atau belum diisi, elemen tetap
       tersembunyi dan inisial di dalam frame yang tampil. */
    qsa("[data-profile-img]").forEach(function (el) {
      var key = el.getAttribute("data-profile-img");
      var value = profile[key];

      if (value == null || value === "" || isUnset(value)) {
        el.hidden = true;
        el.removeAttribute("src");
        return;
      }

      el.setAttribute("src", value);
      el.setAttribute("alt", profile.name || "Foto profil");
      el.hidden = false;

      var initials = el.parentNode && el.parentNode.querySelector("[data-portrait-initials]");
      if (initials) initials.hidden = true;
    });

    var about = profile.about || [];
    qsa("[data-profile-about]").forEach(function (el) {
      if (el.children.length === 0 && about.length) {
        el.innerHTML = about.map(function (p) {
          return "<p>" + escapeHtml(p) + "</p>";
        }).join("");
      }
    });

    qsa("[data-current-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function loadProfile() {
    if (!window.Data) return Promise.resolve(window.SITE.profile);
    return Data.getProfile().then(applyProfile);
  }

  /* ---------------------------------------------------------
     BANNER MODE DEMO
     --------------------------------------------------------- */

  function mountSetupBanner() {
    if (window.SITE_READY) return;
    if (sessionStorage.getItem("demoBannerClosed") === "1") return;

    var bar = document.createElement("div");
    bar.className = "demo-banner";
    bar.innerHTML =
      '<span><strong>Mode Demo.</strong> Data contoh masih dipakai. Isi Firebase di ' +
      "<code>js/site-config.js</code> lalu isi project lewat <code>/admin</code>.</span>" +
      '<button type="button" aria-label="Tutup">&times;</button>';

    bar.querySelector("button").addEventListener("click", function () {
      sessionStorage.setItem("demoBannerClosed", "1");
      bar.remove();
    });

    document.body.appendChild(bar);
  }

  /* ---------------------------------------------------------
     TOAST
     --------------------------------------------------------- */

  function toast(message, type) {
    var host = qs(".toast-host");
    if (!host) {
      host = document.createElement("div");
      host.className = "toast-host";
      document.body.appendChild(host);
    }

    var el = document.createElement("div");
    el.className = "toast toast-" + (type || "info");
    el.textContent = message;
    host.appendChild(el);

    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  /* ---------------------------------------------------------
     KUNCI SCROLL
     ---------------------------------------------------------
     Dipakai bersama oleh lightbox dan modal detail project:
     satudin counter supaya layer yang ë‘˜-duanya terbuka tidak
     saling membatalkan scroll lock. */

  var scrollLocks = 0;

  function lockScroll() {
    scrollLocks++;
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (!scrollLocks) document.body.style.overflow = "";
  }

  /* ---------------------------------------------------------
     LIGHTBOX GALERI
     --------------------------------------------------------- */

  function mountLightbox() {
    var overlay = null;
    var items = [];
    var index = 0;

    function render() {
      if (!items.length) return;
      overlay.querySelector("img").src = items[index].src;
      overlay.querySelector(".lightbox-count").textContent =
        (index + 1) + " / " + items.length;
    }

    function open(list, i) {
      items = list;
      index = i || 0;

      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "lightbox";
        overlay.innerHTML =
          '<button class="lightbox-close" aria-label="Tutup">' + icon("close", 22) + "</button>" +
          '<button class="lightbox-nav prev" aria-label="Sebelumnya">' + icon("arrowLeft", 24) + "</button>" +
          '<img alt="">' +
          '<button class="lightbox-nav next" aria-label="Berikutnya">' + icon("arrowRight", 24) + "</button>" +
          '<div class="lightbox-count"></div>';

        document.body.appendChild(overlay);
        overlay.querySelector(".lightbox-close").onclick = close;
        overlay.querySelector(".prev").onclick = function () { index = (index - 1 + items.length) % items.length; render(); };
        overlay.querySelector(".next").onclick = function () { index = (index + 1) % items.length; render(); };
        overlay.addEventListener("click", function (e) {
          if (e.target === overlay) close();
        });
      }

      overlay.classList.add("open");
      lockScroll();
      render();
    }

    function close() {
      overlay.classList.remove("open");
      unlockScroll();
    }

    document.addEventListener("keydown", function (e) {
      if (!overlay || !overlay.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") overlay.querySelector(".next").click();
      if (e.key === "ArrowLeft") overlay.querySelector(".prev").click();
    });

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-lightbox]");
      if (!trigger) return;
      var group = qsa("[data-lightbox='" + trigger.getAttribute("data-lightbox") + "']");
      var list = group.map(function (el) {
        return { src: el.getAttribute("src") || el.getAttribute("data-src") };
      });
      open(list, group.indexOf(trigger));
    });
  }

  /* ---------------------------------------------------------
     REVEAL ON SCROLL
     --------------------------------------------------------- */

  var observer = null;

  function reveal(root) {
    var items = qsa("[data-reveal]", root);
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("revealed"); });
      return;
    }

    if (!observer) {
      /* rootMargin negatif memicu animasi sedikit sebelum elemen menyentuh
         tepi layar. Tanpa ini elemen tinggi (mis. blok about yang 540px)
         baru muncul setelah 12% pertama terlewat di bawah navbar sticky —”
         user sudah menggulir ke bawah tanpa pernah melihat animasinya. */
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px"
      });
    }

    /* Elemen yang sudah lebih tinggi daripada viewport tidak akan pernah
       mencapai threshold. Paksa tampilkan supaya tidak ada konten yang
       terkunci opacity 0. */
    items.forEach(function (el) {
      if (el.getBoundingClientRect().height >= window.innerHeight * 0.92) {
        el.classList.add("revealed");
        return;
      }
      observer.observe(el);
    });
  }

  function mountReveal() {
    reveal(document);
  }

  /* ---------------------------------------------------------
     BOOT
     --------------------------------------------------------- */

  function boot() {
    if (window.UI_NO_BOOT) return;
    mountNav();
    mountLightbox();
    mountSetupBanner();
    loadProfile();
    mountReveal();
  }

  document.addEventListener("DOMContentLoaded", boot);

  return {
    qs: qs, qsa: qsa, escapeHtml: escapeHtml,
    formatDate: formatDate,
    initials: initials, icon: icon,
    statusBadge: statusBadge, tagHtml: tagHtml,
    projectCard: projectCard, linkButtons: linkButtons, linkDots: linkDots,
    skeletonGrid: skeletonGrid, emptyState: emptyState,
    toast: toast, reveal: reveal,
    lockScroll: lockScroll, unlockScroll: unlockScroll,
    applyProfile: applyProfile
  };

})();
