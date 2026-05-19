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
