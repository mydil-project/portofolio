/* =========================================================
   DATA DEMO
   ------------------------------------------------------------
   Dipakai otomatis selama Firebase BELUM diisi, atau saat
   database belum bisa dibaca (mis. sedang offline).

   Untuk mengganti isi website ini, buka /admin lalu login
   dan tambahkan project aslimu.
   ========================================================= */

window.SEED = {

  projects: [
    {
      id: "seed-agv",
      title: "Arduino UNO Q Mecanum AGV",
      slug: "arduino-agv",
      shortDescription:
        "Robot AGV menggunakan Arduino UNO Q, motor DC, driver L298N, dan mecanum wheel dengan kontrol PID.",
      description:
        "AGV (Automated Guided Vehicle) berukuran mini untuk mengangkut beban pada area datar. " +
        "Arduino UNO Q menjadi otak utama, empat motor DC dengan driver L298N, dan susunan " +
        "mecanum wheel agar vehicle dapat bergerak sideways, diagonal, serta berputar di tempat. " +
        "Sensor ultrasonik dan sensor garis menjadi dasar navigasi sederhana.",
      category: "Embedded",
      year: "2025",
      role: "Firmware Engineer",
      technologies: ["Arduino", "C++", "Motor Control", "PID"],
      hardware: ["Arduino UNO Q", "L298N", "Motor DC", "Mecanum Wheel", "Ultrasonic", "Line Sensor"],
      software: ["Arduino IDE", "Fritzing", "Serial Monitor"],
      features: [
        "Navigasi 4 mode: manual, auto, line follow, dan ultrasonic obstacle avoid",
        "Kontrol kecepatan motor berbasis PID",
        "Kendali gerak sideways, diagonal, dan rotasi",
        "Kalibrasi kecepatan dan sensor lewat Serial Monitor",
        "Daya tahan baterai sekitar 30 menit"
      ],
      coverImage: "",
      gallery: [],
      links: [
        { title: "GitHub Repository", type: "github", url: "https://github.com/mydil-project/arduino-agv" },
        { title: "Video Demo", type: "youtube", url: "" },
        { title: "Documentation", type: "documentation", url: "" }
      ],
      status: "published",
      featured: true,
      createdAt: "2026-01-20T09:00:00.000Z",
      updatedAt: "2026-02-02T09:00:00.000Z"
    },

    {
      id: "seed-plta",
      title: "IoT Lubricating Oil Monitoring",
      slug: "iot-lubricating-oil-monitoring",
      shortDescription:
        "Sistem monitoring temperatur lubricating oil berbasis ESP32 dengan dashboard web dan alarm.",
      description:
        "Pemantauan temperatur oli pelumas pada unit secara real time. Sensor PT100 membaca temperatur " +
        "oli, effector MAX31855 memperkuat sinyalnya, lalu ESP32 membacanya. Data dikirim melalui WiFi " +
        "ke Firebase dan ditampilkan pada dashboard web. Sistem dilengkapi ambang batas alarm serta " +
        "notifikasi ketika temperatur melewati batas aman.",
      category: "IoT",
      year: "2025",
      role: "Hardware & Firmware",
      technologies: ["ESP32", "IoT", "Firebase", "JavaScript"],
      hardware: ["ESP32", "PT100", "MAX31855", "ADS1115", "Relay"],
      software: ["Arduino IDE", "Blynk", "Google Firebase Console", "Google Sheets"],
      features: [
        "Pembacaan temperatur oli dengan akurasi sekitar 0.5 derajat C",
        "Kalibrasi offset sensor",
        "Ambang batas atas dan bawah untuk memicu alarm",
        "Riwayat data tersimpan di Firebase Firestore",
        "Dashboard web responsif untuk desktop dan mobile"
      ],
      coverImage: "",
      gallery: [],
      links: [
        { title: "GitHub Repository", type: "github", url: "https://github.com/mydil-project/iot-lubricating-oil" },
        { title: "Live Monitoring", type: "monitoring", url: "" },
        { title: "Documentation", type: "documentation", url: "" }
      ],
      status: "published",
      featured: true,
      createdAt: "2026-02-10T09:00:00.000Z",
      updatedAt: "2026-03-01T09:00:00.000Z"
    },

    {
      id: "seed-mini-plta",
      title: "Miniature PLTA",
      slug: "miniature-plta",
      shortDescription:
        "Prototype miniatur PLTA dengan kontrol water gate, runner, dan monitoring tegangan serta arus.",
      description:
        "Model miniatur powerhouse hydroelectric (PLTA) dengan turbin Pelton skala kecil. " +
        "Water gate dikendalikan servo berdasarkan besar kecilnya beban. ESP32 mengukur tegangan, " +
        "arus, dan kecepatan runner, lalu mencatat datanya ke micro SD card untuk dianalisis.",
      category: "Electrical",
      year: "2024",
      role: "Electrical Engineer",
      technologies: ["ESP32", "ADS1115", "Servo", "C++", "Data Logging"],
      hardware: ["ESP32", "ADS1115", "Micro Servo", "DC Motor", "Sensor Arus"],
      software: ["Arduino IDE", "PlatformIO", "Microsoft Excel"],
      features: [
        "Turbin Pelton dengan prototype ukuran mini",
        "Kontrol sudut water gate berbasis servo",
        "Pengukuran tegangan, arus, dan kecepatan runner",
        "Data logging ke micro SD card",
        "Grafik monitoring pada halaman web"
      ],
      coverImage: "",
      gallery: [],
      links: [
        { title: "GitHub Repository", type: "github", url: "https://github.com/mydil-project/mini-plta" },
        { title: "Live Demo", type: "demo", url: "" },
        { title: "Documentation", type: "documentation", url: "" }
      ],
      status: "published",
      featured: true,
      createdAt: "2025-11-05T09:00:00.000Z",
      updatedAt: "2025-12-12T09:00:00.000Z"
    },

    {
      id: "seed-nobar",
      title: "Nobar Website",
      slug: "nobar-website",
      shortDescription:
        "Website watch party dengan sinkronisasi playlist, countdown bar, voting, dan chat real time.",
      description:
        "Nobar adalah website nonton bareng yang membuat beberapa orang bisa menonton bersama tanpa " +
        "berada di tempat yang sama. Playlist disinkronkan secara real time sehingga semua peserta " +
        "memillionkan posisi playback yang sama. Tersedia countdown bar, voting film berikutnya, " +
        "dan ruang chat.",
      category: "Web",
      year: "2025",
      role: "Fullstack Developer",
      technologies: ["HTML", "CSS", "JavaScript", "Firebase"],
      hardware: [],
      software: ["Visual Studio Code", "Figma", "Firebase Hosting"],
      features: [
        "Sinkronisasi playlist antar seluruh peserta",
        "Countdown bar dengan kontrol host",
        "Voting film berikutnya",
        "Ruang chat real time",
        "Login Google dan mode tamu"
      ],
      coverImage: "",
      gallery: [],
      links: [
        { title: "Live Website", type: "website", url: "" },
        { title: "GitHub Repository", type: "github", url: "https://github.com/mydil-project/nobar" }
      ],
      status: "published",
      featured: false,
      createdAt: "2025-08-15T09:00:00.000Z",
      updatedAt: "2025-09-20T09:00:00.000Z"
    },

    {
      id: "seed-kipas-iot",
      title: "Kontrol Kipas Angin IoT \"SmartHome\"",
      slug: "kontrol-kipas-angin-iot",
      shortDescription:
        "Alat pengendali kipas angin yang dapat dinyalakan, dimatikan, dan diatur kecepatannya dari HP Android lewat internet.",
      description:
        "Prototipe perangkat rumah pintar untuk:kipas angin. Perangkat ini dapat dinyalakan, " +
        "dimatikan, dan diatur kecepatannya langsung dari HP Android menggunakan jaringan " +
        "internet, tanpa perlu menekan saklar manual di unit kipas.",
      category: "IoT",
      year: "",
      role: "",
      technologies: ["IoT", "Android", "Internet"],
      hardware: [],
      software: ["Blynk IoT", "Google Home", "IFTTT"],
      features: [
        "Menyalakan dan mematikan kipas angin dari HP Android",
        "Pengaturan kecepatan kipas secara remote",
        "Kontrol melalui jaringan internet"
      ],
      coverImage: "",
      gallery: [],
      links: [],
      status: "published",
      featured: false
    },

    {
      id: "seed-robot-arm",
      title: "Kontrol Robot Arm 4-Axis dengan Perintah Suara",
      slug: "robot-arm-4-axis-perintah-suara",
      shortDescription:
        "Program kontrol robot arm 4-axis dengan perintah suara berbasis AI menggunakan Python, lengkap dengan feedback ke pengguna.",
      description:
        "Riset pemrograman kontrol robot arm 4-axis yang dikendalikan dengan perintah suara. " +
        "Perintah suara diproses menjadi gerak robot menggunakan pemrograman berbasis AI " +
        "dengan bahasa Python, dan setiap aksi memberikan feedback kembali kepada pengguna.",
      category: "AI",
      year: "",
      role: "",
      technologies: ["Python", "AI", "Voice Control"],
      hardware: ["Robot Arm 4-Axis"],
      software: ["Python", "Arduino IDE", "Google Speech-to-Text"],
      features: [
        "Kontrol robot arm 4-axis melalui perintah suara",
        "Pemrosesan perintah suara berbasis AI",
        "Implementasi menggunakan bahasa Python",
        "Feedback setiap aksi ke pengguna"
      ],
      coverImage: "",
      gallery: [],
      links: [],
      status: "published",
      featured: false
    },

    {
      id: "seed-pagar-rfid",
      title: "Sistem Buka Tutup Pagar dengan Perintah Suara",
      slug: "sistem-pagar-perintah-suara-rfid",
      shortDescription:
        "Kontrol buka tutup pagar rumah otomatis memakai perintah suara dan kartu RFID yang terintegrasi dengan Ok Google.",
      description:
        "Tugas kuliah untuk membuat sistem kontrol buka tutup pagar rumah secara otomatis. " +
        "Pengendaliannya memakai dua cara: perintah suara dan kartu RFID, yang keduanya " +
        "terintegrasi dengan Ok Google sehingga pagar dapat dibuka dari perintah suara " +
        "maupun setelah kartu dibaca.",
      category: "IoT",
      year: "",
      role: "",
      technologies: ["IoT", "RFID", "Voice Control", "Ok Google"],
      hardware: ["RFID Reader"],
      software: ["Arduino IDE", "ESPHome", "Google Assistant"],
      features: [
        "Buka dan tutup pagar rumah secara otomatis",
        "Akses dengan kartu RFID",
        "Integrasi perintah suara dengan Ok Google",
        "Dua metode akses: suara dan kartu"
      ],
      coverImage: "",
      gallery: [],
      links: [],
      status: "published",
      featured: false
    }
  ],

  certifications: [
    {
      id: "seed-cert-ibm-3825456",
      title: "Unleashing the Power of AI Agents",
      issuer: "IBM SkillsBuild",
      credentialId: "ALM-COURSE_3825456",
      date: "2026-09-01",
      url: "",
      status: "published",
      order: 0
    },
    {
      id: "seed-cert-ibm-4058910",
      title: "Classifying Data Using IBM Granite",
      issuer: "IBM SkillsBuild",
      credentialId: "ALM-COURSE_4058910",
      date: "2026-09-01",
      url: "",
      status: "published",
      order: 1
    },
    {
      id: "seed-cert-ibm-14f2691e3a32",
      title: "Getting Started with Data (Earn a credential!)",
      issuer: "IBM SkillsBuild",
      credentialId: "PLAN-14F2691E3A32",
      date: "2026-08-01",
      url: "",
      status: "published",
      order: 2
    },
    {
      id: "seed-cert-ibm-4058857",
      title: "Introduction to Tableau Desktop",
      issuer: "IBM SkillsBuild",
      credentialId: "ALM-COURSE_4058857",
      date: "2026-08-01",
      url: "",
      status: "published",
      order: 3
    },
    {
      id: "seed-cert-ibm-4058878",
      title: "Data Science Landscape",
      issuer: "IBM SkillsBuild",
      credentialId: "ALM-COURSE_4058878",
      date: "2026-08-01",
      url: "",
      status: "published",
      order: 4
    },
    {
      id: "seed-cert-ibm-4058922",
      title: "Introduction to Data Concepts",
      issuer: "IBM SkillsBuild",
      credentialId: "ALM-COURSE_4058922",
      date: "2026-08-01",
      url: "",
      status: "published",
      order: 5
    }
  ],

  skills: [
    {
      name: "Electrical",
      icon: "⚡",
      description:
        "Instalasi listrik, panel, wiring, control system, dan dasar sistem tenaga listrik."
    },
    {
      name: "IoT",
      icon: "◉",
      description:
        "Sensor, actuator, monitoring real time, dashboard, dan konektivitas perangkat."
    },
    {
      name: "Embedded",
      icon: "⌘",
      description:
        "Arduino, ESP32, motor control, mikrokontroler, dan automation."
    },
    {
      name: "Software",
      icon: "</>",
      description:
        "Web application, JavaScript, Git, GitHub, dan AI-assisted development."
    }
  ]
};