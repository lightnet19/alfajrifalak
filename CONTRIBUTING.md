# 🤝 Panduan Kontribusi — Al-Fajri Falak

Terima kasih telah tertarik untuk berkontribusi pada **Al-Fajri Falak**! Proyek ini dikembangkan untuk mendukung dakwah Islamiyah di bidang ilmu falak, khususnya di lingkungan **Lembaga Falakiyah PCNU Kencong**. Kami sangat menyambut kontribusi dari para pengembang, desainer, dan ahli falak untuk membuat aplikasi ini menjadi lebih baik.

Dokumen ini berisi panduan dan standar pengembangan bagi siapa saja yang ingin ikut serta berkontribusi.

---

## 🚀 Alur Kontribusi

1.  **Cari Issue atau Buat Baru:** Sebelum menulis kode, periksa daftar *Issues* yang ada. Jika Anda ingin memperbaiki bug atau menambahkan fitur baru yang belum terdaftar, silakan buat *Issue* baru terlebih dahulu untuk mendiskusikannya.
2.  **Fork Repositori:** Lakukan *Fork* terhadap repositori ini ke akun GitHub Anda.
3.  **Buat Branch Baru:** Buat branch baru dari branch `main` untuk pekerjaan Anda:
    ```bash
    git checkout -b fitur/nama-fitur-anda
    # atau
    git checkout -b bugfix/nama-bug-anda
    ```
4.  **Kembangkan Kode:** Tulis kode Anda dengan mengikuti panduan gaya dan arsitektur proyek di bawah.
5.  **Verifikasi & Uji:** Pastikan kode Anda tidak merusak fitur yang sudah ada dan lolos pengecekan sintaksis.
6.  **Kirim Pull Request (PR):** Ajukan Pull Request ke branch `main` repositori utama dengan menyertakan deskripsi perubahan yang jelas dan mereferensikan nomor *Issue* yang berkaitan.

---

## 💻 Panduan Pengembangan Lokal

Aplikasi ini dibangun tanpa sistem kompilasi berat agar ringan dan mudah dideploy:

1.  **Clone Hasil Fork Anda:**
    ```bash
    git clone https://github.com/username-anda/alfajrifalak.git
    cd alfajrifalak
    ```
2.  **Instalasi & Menjalankan Dev Server:**
    Karena aplikasi berjalan 100% di sisi klien (*client-side*), Anda bisa menggunakan ekstensi *Live Server* pada VS Code, atau menjalankan dev server bawaan (Vite) jika menggunakan npm:
    ```bash
    npm install
    npm run dev
    ```
3.  **Uji Sintaksis:**
    Jalankan perintah ini sebelum melakukan commit untuk memastikan tidak ada kesalahan sintaksis pada file JavaScript:
    ```bash
    node -e "
    const fs = require('fs');
    const path = require('path');
    const dir = 'public/js';
    fs.readdirSync(dir).filter(f => f.endsWith('.js')).forEach(f => {
      new Function(fs.readFileSync(path.join(dir, f), 'utf8'));
    });
    console.log('Semua file JS lolos syntax check!');
    "
    ```

---

## 🎨 Standar Penulisan Kode (Coding Style)

Untuk menjaga keberlanjutan kode (*maintainability*), mohon patuhi standar berikut:

### 1. JavaScript (JS)
*   **Gunakan Mode Ketat:** Selalu gunakan `'use strict';` di bagian paling atas setiap file skrip baru.
*   **Modular & Layered:** Ikuti arsitektur layer yang sudah ada:
    *   `math.js`: Fungsi utilitas murni matematika dan kalender (bebas dari manipulasi DOM).
    *   `astro.js`: Rumus kalkulasi Jean Meeus murni (bebas dari DOM).
    *   `ui.js`: Logika penggambaran antarmuka dan manipulasi DOM (visual rendering).
    *   `main.js`: Setup event listener global, inisialisasi state awal, dan koordinasi antar modul.
*   **Dokumentasi Fungsi:** Berikan komentar JSDoc yang jelas pada fungsi baru untuk memudahkan pengembang lain memahami input, output, dan rumus falakiyah yang digunakan.

### 2. Styling (CSS)
*   **Prefix Komponen:** Untuk menghindari tabrakan gaya, gunakan prefix unik sesuai modul Anda pada kelas CSS:
    *   `qb-` untuk modul Kiblat (*Qibla*).
    *   `ac-` untuk modul Jam Astronomi (*AstroClock*).
    *   `ec-` untuk modul Gerhana (*Eclipse*).
    *   `iw-` untuk modul Istiwa.
    *   `hc-` untuk modul Grafik Hilal.
*   **Gunakan CSS Variables:** Jangan menggunakan warna hardcoded. Selalu gunakan variabel warna bawaan dari `:root` di `style.css` (seperti `--gold`, `--gold2`, `--border`, dll.) agar estetika tema *dark-gold-glassmorphism* tetap terjaga.

### 3. Git Commits
Tulis pesan commit dengan format konvensional yang jelas, contoh:
*   `feat: tambah grafik kompas live menggunakan canvas`
*   `fix: perbaiki perhitungan tahun kabisat pada jdToHijri`
*   `docs: perbarui panduan kontribusi`

---

## 🕋 Kode Etik Falakiyah

Aplikasi ini digunakan sebagai penentu ibadah umat Islam (seperti waktu sholat, arah kiblat, dan awal bulan Hijriyah). Oleh karena itu:
*   **Prioritaskan Akurasi:** Setiap perubahan pada rumus astronomi wajib diverifikasi dan dibandingkan dengan data pembanding tepercaya (seperti data Kemenag, LF-PBNU, atau perhitungan buku Jean Meeus asli).
*   **Dokumentasikan Referensi:** Sebutkan bab/chapter dari buku *Astronomical Algorithms* atau kitab falak klasik yang dijadikan rujukan apabila Anda mengubah atau menambah formula baru.

Ada pertanyaan lebih lanjut? Silakan buka diskusi melalui fitur *Discussions* di repositori GitHub kami!
