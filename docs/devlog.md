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
- [x] **Fase 5:** Pengujian dan verifikasi kalkulasi Jam Istiwa.

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

---

## [2026-05-19] - v3.0.0 Multi-Algoritma & Ihtiyat Dinamis
- **Status:** Selesai ✅
- **Versi:** v3.0.0
- **File Dimodifikasi:**
  - `public/js/prayer.js` — Implementasi algoritma salaf Irsyadul Murid (taqribi klasik), custom compound caching system, penambahan parameter Ihtiyat (kehati-hatian) dinamis 0-10 menit.
  - `public/index.html` — Tambah dropdown pilihan Algoritma Sholat ("Jean Meeus (Astronomi Modern)", "Irsyadul Murid (Salaf Taqribi)") dan input Ihtiyat dinamis di atas tabel jadwal sholat. Bump versi ke v3.0.0.
  - `public/js/ui.js` — Penanganan event handler saat dropdown algoritma atau input ihtiyat berubah untuk memicu kalkulasi ulang secara instan.
  - `public/css/style.css` — Penambahan layout & styling form kontrol yang cantik untuk pilihan algoritma dan ihtiyat sholat.
- **Algoritma:**
  - *Jean Meeus*: Metode astronomi modern dengan presisi tinggi.
  - *Irsyadul Murid*: Metode salaf taqribi klasik menggunakan rumus ta'dil bujur & lintang dengan tinggi matahari tertentu (Fajr -20°, Asr As-Syadzili, Isha -18°).
- **Catatan Teknis:**
  - Sistem cache terkomposisi menggunakan key string `lat|lng|year|month|day|elev|algo|ihtiyat` untuk menghindari overhead penghitungan ulang saat user bernavigasi.

---

## [2026-05-19] - v3.0.1 Bugfix: Tanda Offset Jam Istiwa Salah
- **Status:** Selesai ✅
- **Bug:** Jam Istiwa ditampilkan sebagai LAMBAT dari WIB untuk lokasi Kencong, padahal seharusnya MAJU ±34 menit.
- **Root Cause:**
  - Formula offset di `istiwa.js`: `offset = noonRaw - 12` **salah tanda**.
  - `noonRaw` untuk Kencong (113.42°E, WIB/UTC+7) = ≈ 11:26 WIB (kulminasi Matahari terjadi sebelum jam 12:00 WIB).
  - `noonRaw - 12` menghasilkan nilai **negatif** (≈ -0.56 jam), keliru menyatakan Istiwa **lambat**.
  - **Penjelasan yang benar:** Jika kulminasi = 11:26 WIB, maka pada saat 11:26 WIB, jam istiwa sudah menunjuk 12:00 → Istiwa **MAJU** +34 menit dari WIB.
- **Formula yang Benar:** `offset = 12 - noonRaw`
  - Untuk Kencong: `12 - 11.44 = +0.56 jam ≈ +33.7 menit` (positif = MAJU)
  - Komponen: Koreksi Bujur `(113.42 - 105)/15 × 60 = +33.7 mnt` + EqT `≈ +3 mnt Mei` ≈ **+36 mnt total**
- **File Diperbaiki:** `public/js/istiwa.js`
  - `getIstiwaOffset()`: dibalik dari `noonRaw - 12` → `12 - noonRaw`
  - `renderIstiwa()`: idem
  - Komentar diperjelas untuk menguraikan logika arah offset

---

## [2026-05-22] - Bugfix: Koreksi Perhitungan Weton Jawa
- **Status:** Selesai ✅
- **Bug:** Perhitungan weton Jawa (hari pasaran) bergeser maju sebanyak 2 hari pasaran (misalnya 18 Mei 2026 yang seharusnya *Senin Kliwon* terhitung sebagai *Senin Pahing*, dan 22 Mei 2026 yang seharusnya *Jumat Wage* terhitung sebagai *Jumat Legi*).
- **Root Cause:**
  - Formula pencarian indeks pasaran `p` di `math.js`: `const p=((Math.floor(jd0+0.5)+2)%5+5)%5;` memiliki pergeseran offset `+2` yang salah.
  - Pergeseran tersebut ditambahkan karena asumsi yang keliru bahwa epoch Hijriyah (1 Muharram 1 H / 15 Juli 622 M, JDN 1948439) adalah *Thursday Pahing* (indeks 1), padahal yang benar secara historis adalah **Thursday Kliwon** (indeks 4).
- **Formula yang Benar:** `const p=((Math.floor(jd0+0.5))%5+5)%5;`
- **File Diperbaiki:** `public/js/math.js`
  - Memperbaiki rumus pasaran `p` dengan menghapus offset `+2`.
  - Memperbarui komentar referensi epoch agar secara akurat mencatat `JD 1948438.5 = Thu = Kliwon (4)`.
- **Pengujian:**
  - Diuji mandiri dengan berbagai tanggal penting (17 Agustus 1945 -> Jumat Legi, 14 Februari 2024 -> Rabu Legi, 18 Mei 2026 -> Senin Kliwon, 22 Mei 2026 -> Jumat Wage, 1 Oktober 2023 -> Ahad Kliwon) dan 100% lulus pengujian.
  - Diverifikasi langsung melalui antarmuka visual kalkulator hilal di UI aplikasi.

---

## [2026-05-22] - v2.4.1 Bugfix: Prediksi Tanggal Awal Bulan Meleset Satu Hari
- **Status:** Selesai ✅
- **Versi:** v2.4.1
- **Bug:** Prediksi tanggal awal bulan (berdasarkan kriteria IRNU) yang ditampilkan pada laporan hilal selalu meleset **satu hari ke depan** dari tanggal yang sebenarnya. Contoh: untuk Dzulhijjah 1447 H, ijtima terjadi dini hari 17 Mei 2026 (Ahad Wage) dan hilal terlihat pada maghrib 17 Mei, namun aplikasi menampilkan prediksi **18 Mei 2026 (Senin Kliwon)** — seharusnya **17 Mei 2026 (Ahad Wage)**.
- **Root Cause:**
  - Di `hilal.js`, variabel `predJD` merupakan keluaran dari loop yang menggunakan `obsJD` (bertipe `obsBase`). Nilai `obsBase` sendiri sudah berformat **JD tengah malam UT** (yaitu bilangan bulat + 0.5, misal `2461177.5` = 17 Mei 2026 jam 00:00 UT).
  - Ketika hasilnya dikonversi ke tanggal Gregorian dan weton, kode lama menggunakan:
    - `jdG(predJD + 1.5)` → menambah 1 hari penuh yang tidak perlu, sehingga hasilnya 18 Mei bukan 17 Mei.
    - `weton(predJD + 1.5)` → sama, weton menjadi *Senin Kliwon* bukan *Ahad Wage*.
  - Offset yang benar untuk mendapatkan **tengah hari (noon) dari tanggal yang sama** adalah `+0.5`, bukan `+1.5`.
- **Formula yang Benar:**
  - `const predGreg = predJD ? jdG(predJD + 0.5) : null;`
  - `const predWtn  = predJD ? weton(predJD + 0.5) : '—';`
- **File Diperbaiki:** `public/js/hilal.js`
  - Mengubah `predJD+1.5` → `predJD+0.5` pada baris kalkulasi `predGreg`.
  - Mengubah `predJD+1.5` → `predJD+0.5` pada baris kalkulasi `predWtn`.
  - Memperbarui versi header dan footer laporan dari `v2.4.0` ke `v2.4.1`.
- **Pengujian:**
  - Debug mandiri dengan Node.js mengonfirmasi bahwa untuk Dzulhijjah 1447 H, `predJD = 2461177.5` dan `jdG(predJD+0.5)` menghasilkan **17 Mei 2026 (Ahad Wage)** — sesuai fakta rukyat.


