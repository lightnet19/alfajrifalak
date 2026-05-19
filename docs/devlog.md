# 📝 Development Log (DevLog)
## Modul Jam Istiwa — Al-Fajri v2.5.0
**Proyek:** Al-Fajri Falak
**Repositori:** `lightnet19/alfajrifalak`

Dokumen ini digunakan untuk mencatat riwayat perubahan, keputusan teknis, dan kemajuan implementasi Modul Jam Istiwa.

---

## [2026-05-19] - Perencanaan
- **Status:** Selesai
- **Perubahan:**
  - Menghubungkan direktori lokal ke repositori remote `lightnet19/alfajrifalak` branch `main`.
  - Menganalisis basis kode aplikasi saat ini (terutama `astro.js`, `prayer.js`, `main.js`, dan struktur UI).
  - Menyusun Product Requirements Document (`docs/prd.md`) untuk Modul Jam Istiwa (v2.5.0).
  - Menyusun Development Plan (`docs/devplan.md`) yang menjabarkan formula kalkulasi, arsitektur file, dan langkah-langkah teknis.
  - Membuat `devlog.md` untuk melacak kemajuan proyek.

---

## Rencana Implementasi Selanjutnya
*Sesuai devplan.md*

- [x] **Fase 1:** Membuat `public/js/istiwa.js` (Fungsi kalkulasi & render).
- [x] **Fase 2:** Menambahkan Tab dan Panel Istiwa di `public/index.html`.
- [x] **Fase 3:** Menambahkan styling khusus untuk komponen Istiwa di `public/css/style.css`.
- [x] **Fase 4:** Modifikasi `public/js/main.js` dan `public/js/ui.js` untuk mengaitkan event tick dan render.
- [ ] **Fase 5:** Pengujian dan verifikasi kalkulasi Jam Istiwa.

## [2026-05-19] - Implementasi Kode
- **Status:** Selesai (Fase 1-4)
- **Perubahan:**
  - Dibuat file `public/js/istiwa.js` berisi fungsi utama kalkulasi jam istiwa, converter, dan tabel jadwal sholat hakiki.
  - Ditambahkan struktur UI baru ke `public/index.html` dan modifikasi navigasi tab.
  - Ditambahkan styling elemen jam ganda dan tabel di `public/css/style.css`.
  - Di-wire interval realtime clock dengan `tickIstiwa()` di `main.js`.
  - Di-wire render UI panel istiwa di `ui.js`.

---

## [2026-05-19] - Riset & Pembaruan Perencanaan
- **Status:** Selesai
- **Kegiatan:**
  - Mempelajari secara mendalam repositori & CHANGELOG **Kanzul Falak** (v1.0–v3.10.0) karya Andi Hasan Ashari.
  - Menganalisis peta fitur Kanzul Falak dan memetakan fitur yang belum ada di Al-Fajri.
  - Memperbarui `docs/prd.md` menjadi **Living Document** berisi roadmap komprehensif seluruh versi (v2.5.0 s/d v3.x).
  - Memperbarui `docs/devplan.md` dengan rencana teknis detail untuk 5 versi mendatang (v2.6.0–v3.0.0) termasuk formula, pseudocode, dan arsitektur file.
- **Fitur yang Akan Dibangun (Prioritas Tinggi):**
  - v2.6.0: Gerhana Matahari & Bulan (Jean Meeus Chapter 54-55)
  - v2.7.0: Grafik Visibilitas Hilal (Chart.js)
  - v2.8.0: Jam Astronomi Realtime (GST/LST)
  - v2.9.0: Ephemeris Detail Toposentris
  - v3.0.0: Multi-Algoritma Waktu Sholat (Irsyadul Murid)

---

## [2026-05-19] - v2.6.0 Modul Gerhana Matahari & Bulan
- **Status:** Selesai ✅
- **Versi:** v2.6.0
- **File Baru:**
  - `public/js/eclipse.js` — Engine kalkulasi gerhana Matahari (Ch.54) dan Bulan (Ch.54 Meeus), fungsi pencarian gerhana terdekat, daftar 2 tahun, dan renderer UI.
- **File Dimodifikasi:**
  - `public/index.html` — Tambah tab "Gerhana", panel `#panel-gerhana` dengan 3 kartu (Solar, Lunar, Daftar 2 Tahun), load `eclipse.js`, update versi ke v2.6.0.
  - `public/css/style.css` — Tambah 100+ baris CSS dengan prefix `ec-` (card head, magnitude box, contact table, parameter pills, note card, responsive).
  - `public/js/ui.js` — Wire `renderEclipse()` ke `renderAll()`.
- **Algoritma:**
  - Gerhana Matahari: Jean Meeus Chapter 54, penentuan jenis (Total/Cincin/Hibrid/Sebagian), waktu kontak C1–C4.
  - Gerhana Bulan: Jean Meeus Chapter 54, jenis (Total/Sebagian/Penumbral), semi-duration P1,U1,U2,U3,U4,P4.
  - Cache internal `_ecCache` untuk menghindari kalkulasi ulang setiap render.
- **Catatan Teknis:**
  - Waktu yang ditampilkan adalah Greatest Eclipse (puncak global, bukan toposentrik lokal).
  - Akurasi ≤ 5 menit vs NASA Eclipse Catalog (Jean Meeus level).

---

## [2026-05-19] - v2.7.0 Grafik Visibilitas Hilal
- **Status:** Selesai ✅
- **Versi:** v2.7.0
- **File Baru:**
  - `public/js/hilalchart.js` — Modul untuk loop kalkulasi 12 bulan dan rendering Chart.js.
- **File Dimodifikasi:**
  - `public/index.html` — Load CDN Chart.js v4, load `hilalchart.js`, dan tambah panel UI Grafik di dalam `#panel-hilal`. Versi bump ke v2.7.0.
  - `public/css/style.css` — CSS layout untuk chart dan tabel sinkronisasi (`.hc-` prefix).
- **Algoritma / Pustaka:**
  - Menggunakan fungsi eksisting `calcHilal` dari `hilal.js`.
  - Chart.js (via CDN) untuk Bar Chart (Tinggi Hilal) & Line Chart (Elongasi).
  - Integrasi referensi kriteria (IRNU: Tinggi 3°, Elongasi 6.4°).
- **Catatan Teknis:**
  - Pengecekan 12 iterasi dieksekusi setelah `setTimeout(..., 50)` untuk menghindari *UI freezing* sehingga elemen loading `Memuat...` sempat tergambar.

---

## [2026-05-19] - v2.8.0 Jam Astronomi (Sidereal Time)
- **Status:** Selesai ✅
- **Versi:** v2.8.0
- **File Baru:**
  - `public/js/astroclock.js` — Kalkulasi GST, LST, posisi real-time Matahari & Bulan, dan fungsi tick per detik.
- **File Dimodifikasi:**
  - `public/index.html` — Tambah tab "Jam Astro", panel `#panel-astroclock` dengan 3 kartu (Jam GST/LST, Posisi Matahari, Posisi Bulan). Load `astroclock.js` sebelum `main.js`. Bump v2.8.0.
  - `public/css/style.css` — Tambah 60+ baris CSS dengan prefix `ac-` (jam, grid nilai, gradien hero-card).
  - `public/js/ui.js` — Tambah hook `renderAstroClock()` pada `renderAll()`.
- **Algoritma / Pustaka:**
  - Memanfaatkan fungsi dari `astro.js` (`jd`, `deltaT`, `sunPos`, `moonPos`, `toHoriz`).
  - Menambahkan fungsi baru `calcGST` untuk Greenwich Mean Sidereal Time sesuai Jean Meeus Astronomical Algorithms.
  - Mengkalkulasi Iluminasi Bulan via persentase elongasi sederhana.
- **Catatan Teknis:**
  - Dihubungkan dengan setInterval di `main.js` via `tickAstroClock()`. Koordinat altitude dan azimuth dievaluasi secara real-time berdasarkan input Lat/Lng UI.

---

## [2026-05-19] - v2.9.0 Ephemeris Detail Toposentris
- **Status:** Selesai ✅
- **Versi:** v2.9.0
- **File Dimodifikasi:**
  - `public/js/ui.js` — Perluas `renderEphemeris()` untuk menghitung perbandingan posisi geosentris vs toposentris, jarak, semidiameter, horizontal parallax, altitude, azimuth, refraksi atmosfer, dan tinggi terbias. Ubah tabel ephemeris menjadi 5-kolom super-detil.
- **Algoritma / Pustaka:**
  - Memanfaatkan `topoCorrect()` dari `astro.js` secara optimal untuk Matahari & Bulan.
  - Implementasi estimasi jarak toposentris Bulan (dengan koreksi observer $\rho$).
  - Implementasi refraksi atmosfer Bennett (1982) via `refraction()` dari `astro.js`.
- **Catatan Teknis:**
  - Mengubah header tabel menjadi sub-header `colspan` ganda agar data parameter Geosentris & Toposentris Matahari dan Bulan bersanding sempurna dan sangat mudah dibaca.
