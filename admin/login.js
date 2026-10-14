/* =========================================================
   ADMIN LOGIN
   ========================================================= */

(function () {
  "use strict";

  var form = document.getElementById("loginForm");
  var errorBox = document.getElementById("loginError");
  var button = document.getElementById("loginBtn");
  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.add("show");
  }

  function clearError() {
    errorBox.classList.remove("show");
    errorBox.textContent = "";
  }

  function friendlyError(err) {
    var code = (err && err.code) || "";

    if (code === "auth/invalid-credential" || code === "auth/wrong-password" ||
        code === "auth/user-not-found") {
      return "Email atau password salah.";
    }
    if (code === "auth/invalid-email") {
      return "Format email tidak valid.";
    }
    if (code === "auth/too-many-requests") {
      return "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    }
    if (code === "auth/network-request-failed") {
      return "Koneksi bermasalah. Periksa internet kamu.";
    }
    return (err && err.message) || "Login gagal. Coba lagi.";
  }

  function init() {
    if (!window.SITE_READY) {
      showError(
        "Firebase belum dikonfigurasi. Isi dulu js/site-config.js bagian config Firebase, " +
        "lalu reload halaman ini. Detail lengkap ada di file SETUP.md."
      );
      button.disabled = true;
      return;
    }

    Data.onAuthChange(function (user) {
      if (user) window.location.replace("index.html");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!email || !password) {
      showError("Email dan password wajib diisi.");
      return;
    }

    button.disabled = true;
    button.textContent = "Memproses...";

    Data.signIn(email, password)
      .then(function () {
        window.location.replace("index.html");
      })
      .catch(function (err) {
        showError(friendlyError(err));
        button.disabled = false;
        button.textContent = "Masuk";
      });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();