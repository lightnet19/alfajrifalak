# 📋 Product Requirements Document (PRD)
## Al-Fajri Falak — Roadmap Pengembangan Komprehensif
**Lembaga Falakiyah PCNU Kencong**
**Versi Dokumen:** 2.0.0 | **Diperbarui:** 2026-05-19 | **Status:** Living Document

---

## 1. Executive Summary

**Al-Fajri Falak** adalah aplikasi hisab astronomi Islam berbasis web yang dikembangkan oleh Lembaga Falakiyah PCNU Kencong. Terinspirasi dari aplikasi **Kanzul Falak** (Android, karya Andi Hasan Ashari), Al-Fajri Falak bertujuan menghadirkan kesetaraan fitur falakiyah premium dalam format web lintas platform — dapat diakses dari browser HP maupun desktop tanpa instalasi.

Dokumen ini memetakan **roadmap pengembangan jangka panjang** Al-Fajri Falak berdasarkan analisis mendalam terhadap Kanzul Falak (v1.0–v3.10.0) dan kebutuhan komunitas falakiyah, dengan mempertahankan identitas **Lembaga Falakiyah PCNU Kencong** sebagai institusi penyelenggara.

---

## 2. Analisis Kanzul Falak — Referensi & Inspirasi

### 2.1 Profil Kanzul Falak

| Aspek | Detail |
|---|---|
| Platform | Android (Kotlin + Jetpack Compose) |
| Versi Terkini | v3.10.0 (Februari 2026) |
| Pengembang | Andi Hasan Ashari (hasanelfalakiy) |
| Lisensi | GPL-3.0 (close source) |
| Algoritma Inti | Jean Meeus + VSOP87D/ELPMPP02 + JPL DE405 + IAARAS EPM2021 |

### 2.2 Peta Fitur Kanzul Falak (Lengkap)

| # | Fitur | Tersedia di Al-Fajri? | Prioritas Adopsi |
|---|---|---|---|
| 1 | Waktu sholat (Irsyadul Murid) | ✅ Ya (Jean Meeus) | — |
| 2 | Waktu sholat (VSOP87D) | ❌ | 🔴 Tinggi |
| 3 | Hisab awal bulan Hijriyah (Jean Meeus) | ✅ Ya | — |
| 4 | Hisab awal bulan (VSOP87D/ELPMPP02) | ❌ | 🟡 Menengah |
| 5 | Hisab awal bulan (Ad-Durrul Aniq) | ❌ | 🟡 Menengah |
| 6 | Grafik visibilitas hilal | ❌ | 🔴 Tinggi |
| 7 | Ephemeris Matahari & Bulan (dasar) | ✅ Ya | — |
| 8 | Ephemeris detail (geosentris & toposentris) | ❌ | 🟡 Menengah |
| 9 | Imsakiyah | ✅ Ya | — |
| 10 | Konversi Tanggal Hijriyah-Masehi | ✅ Ya | — |
| 11 | Konversi Julian Day | ✅ Ya | — |
| 12 | Fase Bulan | ✅ Ya (dasar) | — |
| 13 | Sinkronisasi Kalender (1 tahun) | ❌ | 🟡 Menengah |
| 14 | Gerhana Matahari | ❌ | 🔴 Tinggi |
| 15 | Gerhana Bulan | ❌ | 🔴 Tinggi |
| 16 | **Jam Istiwa (Waktu Hakiki)** | ✅ v2.5.0 | — |
| 17 | Jam Astronomi (realtime GST/LST) | ❌ | 🟡 Menengah |
| 18 | Qodho Sholat | ❌ | 🟢 Rendah |
| 19 | Selamatan/Peringatan orang meninggal | ❌ | 🟢 Rendah |
| 20 | Tasbih Digital | ❌ | 🟢 Rendah |
| 21 | Export file (TXT/PDF) | ✅ Parsial (PDF) | — |
| 22 | Kiblat | ✅ Ya | — |

### 2.3 Keunggulan Al-Fajri vs Kanzul Falak

| Aspek | Kanzul Falak | Al-Fajri Falak |
|---|---|---|
| Platform | Android only | Web (semua platform) |
| Instalasi | Perlu download APK | Tidak perlu instalasi |
| Aksesibilitas | Android 8+ | Semua browser modern |
| Koneksi | Mode offline terbatas | PWA offline (rencana) |
| Distribusi | GitHub Release | URL publik (Vercel) |
| Kustomisasi | Terbatas | Bisa diadaptasi institusi |

---

## 3. Target Pengguna

| Segmen | Deskripsi | Kebutuhan Prioritas |
|---|---|---|
| **Ahli Falak** | Ulama & praktisi hisab rukyat | Akurasi tinggi, multi-algoritma, Ephemeris detail |
| **Santri/Pelajar Falak** | Mahasiswa/santri di pesantren falakiyah | Tampilan edukatif, konversi mudah, referensi algoritma |
| **Takmir Masjid** | Pengurus jadwal sholat masjid/musholla | Imsakiyah, PDF export, kemudahan baca |
| **Masyarakat Umum** | Pengguna umum | Waktu sholat, kiblat, fase bulan |
| **Institusi Keagamaan** | Lembaga, ormas Islam | Branding institusi, akurasi terverifikasi |

---

## 4. Visi & Misi

### Visi
Menjadi referensi digital falakiyah berbasis web paling lengkap dan akurat di Indonesia untuk komunitas NU, dengan standar kalkulasi setara Kanzul Falak.

### Misi
1. Menghadirkan semua fitur falakiyah utama Kanzul Falak dalam format web
2. Mempertahankan akurasi kalkulasi ≤ 1 detik vs referensi ephemeris standar
3. Menjaga identitas Lembaga Falakiyah PCNU Kencong sebagai penyelenggara
4. Menyediakan antarmuka yang edukatif, responsif, dan premium

---

## 5. Roadmap Fitur (Per Versi)

### ✅ v2.4.x (SELESAI) — Fondasi
- Waktu sholat (Jean Meeus, metode Kemenag)
- Hisab awal bulan Hijriyah
- Kiblat
- Konversi Tanggal & Julian Day
- Fase Bulan
- Imsakiyah
- Ephemeris Matahari & Bulan
- Export PDF

### ✅ v2.5.0 (SELESAI) — Jam Istiwa
- Jam Istiwa real-time (Waktu Hakiki)
- Tabel Sholat format Istiwa
- Konverter Wasathi ↔ Istiwa
- Parameter koreksi (EqT + Koreksi Bujur)

### 🔴 v2.6.0 — Gerhana (PRIORITAS TINGGI)
- Kalkulasi Gerhana Matahari (Global + Lokal)
- Kalkulasi Gerhana Bulan
- Visualisasi diagram umbra-penumbra
- Data kontak gerhana (C1-C4)

### 🔴 v2.7.0 — Grafik Visibilitas Hilal (PRIORITAS TINGGI)
- Grafik visibilitas hilal berbasis Chart.js
- Data 12 bulan dalam 1 tahun
- Multi-kriteria (IRNU, Odeh, Yallop)
- Peta wilayah visibilitas (opsional)

### 🟡 v2.8.0 — Jam Astronomi & Sinkronisasi Kalender
- Jam Astronomi realtime (UT, GST, LST)
- Sinkronisasi Kalender Hijriyah 1 tahun
- Deklinasi & AR Matahari/Bulan realtime

### 🟡 v2.9.0 — Ephemeris Detail
- Ephemeris detail geosentris & toposentris
- Koordinat rectangular (x,y,z) dalam ICRS
- Data parallax & refraksi toposentris

### ✅ v3.0.1 (SELESAI) — Multi-Algoritma & Bugfix Istiwa
- Opsi algoritma waktu sholat: Jean Meeus (Astronomi Modern) / Irsyadul Murid (Salaf)
- Penambahan input Ihtiyat dinamis (0-10 menit) yang terintegrasi di UI
- Custom compound caching system untuk menghindari UI freeze saat parameter berubah

### ✅ v3.0.2 (SELESAI) — Bugfix Perhitungan Hilal & Init Defaults
- Perbaikan algoritma pencarian lunasi target (`bestK`) untuk hisab awal bulan.
- Inisialisasi default bulan/tahun Hijriyah di form secara dinamis berdasarkan tanggal hari ini.
- Penghapusan kalkulasi hilal otomatis saat load awal untuk mencegah data hasil yang tidak akurat.

### 🟢 v3.x — Fitur Tambahan
- Qodho Sholat (kalkulasi sholat yang perlu diqodho)
- Tasbih Digital
- Selamatan/Peringatan orang meninggal
- PWA (Progressive Web App) + mode offline
- Mode multi-bahasa (Indonesia/Inggris/Arab)

---

## 6. Functional Requirements Detail

### FR-GERHANA-01: Gerhana Matahari
- Kalkulasi jenis gerhana (total, cincin, sebagian, hibrid)
- Waktu kontak: C1 (first contact), C2, C3, C4, mid-eclipse
- Magnitude & obscuration
- Koordinat titik greatest eclipse
- Format output: tabel data + keterangan fiqih

### FR-GERHANA-02: Gerhana Bulan
- Kalkulasi jenis gerhana (total, sebagian, penumbral)
- Waktu kontak dengan umbra & penumbra
- Magnitude gerhana
- Visualisasi diagram posisi Bulan terhadap umbra/penumbra

### FR-HILAL-CHART: Grafik Visibilitas Hilal
- Input: Tahun Hijriyah, multi-bulan
- Output: grafik tinggi hilal vs elongasi per bulan
- Indikator kriteria: garis IRNU (3°, 6.4°), Odeh, Yallop
- Tabel data ringkasan 12 bulan (bulan, tanggal masehi, tinggi hilal, elongasi, verdict)

### FR-ASTRO-CLOCK: Jam Astronomi
- UT (Universal Time) realtime
- GST (Greenwich Sidereal Time)
- LST (Local Sidereal Time) berdasarkan koordinat markaz
- Deklinasi & AR Matahari realtime
- Hour Angle Matahari

### FR-SYNC-CAL: Sinkronisasi Kalender
- Generate tabel awal bulan Hijriyah selama 1 tahun penuh
- Data per bulan: tanggal masehi ijtima, waktu ijtima, tinggi hilal, visibilitas, awal bulan
- Arah matahari & hilal saat garub

### FR-MULTI-ALGO: Multi Algoritma
- Waktu sholat: dropdown pilih algoritma (Jean Meeus / Irsyadul Murid)
- Hilal: dropdown pilih algoritma (Jean Meeus / VSOP87D-ELPMPP02 / Ad-Durrul Aniq)
- Hasil bergerak secara dinamis tanpa reload halaman

---

## 7. Non-Functional Requirements

| NFR | Kategori | Target |
|---|---|---|
| NFR-01 | Akurasi | ≤ 1 detik vs tabel ephemeris standar (Jean Meeus) |
| NFR-02 | Performa | TTI (Time To Interactive) ≤ 3 detik |
| NFR-03 | Responsivitas | Berfungsi di layar 320px – 2560px |
| NFR-04 | Kompatibilitas | Chrome, Firefox, Safari, Edge (2 versi terakhir) |
| NFR-05 | Zero Dependency | Tidak menambah library baru kecuali untuk fitur chart |
| NFR-06 | Maintainability | Setiap modul dalam file .js terpisah + JSDoc |
| NFR-07 | Aksesibilitas | Teks dapat di-zoom, kontras WCAG AA |
| NFR-08 | Offline | Service Worker untuk PWA (v3.x) |

---

## 8. Design System

### 8.1 Identitas Visual
- **Tema:** Glassmorphism + Dark Mode + Aksen Emas (tidak berubah)
- **Tipografi:** Plus Jakarta Sans (body) + JetBrains Mono (angka) + Noto Naskh Arabic (Arab)
- **Warna Kunci:** `--gold` (#c8a44a), `--gold2` (#fce18d), `--bg` (#050c1a)

### 8.2 Prinsip Desain
1. **Konsistensi:** Semua modul baru wajib menggunakan CSS variables dari `style.css`
2. **Hierarki:** Header → Lokasi → Tab → Panel → Footer (tidak berubah)
3. **Informasi:** Data teknis → bahasa Indonesia baku + istilah Arab falakiyah
4. **Responsive-first:** Mobile portrait sebagai viewport utama

### 8.3 Pola Komponen yang Sudah Ada (Gunakan Ulang)
- `.card` — container glassmorphism
- `.card-hd` — judul section dalam card
- `.dtbl` — tabel data (thead gold, zebra striping)
- `.two-col` — layout dua kolom responsif
- `.conv-box` — kotak input konversi
- `.act-row` + `.act-btn` — tombol aksi (salin/PDF)
- `.tabs` + `.tab` — navigasi tab
- `.panel` — konten tab

---

## 9. Batasan & Asumsi

### Out of Scope (Selamanya)
- Azan otomatis berbasis audio
- Integrasi kalender Google/iOS
- Backend server (aplikasi sepenuhnya client-side)
- Algoritma VSOP87D (membutuhkan data koefisien yang sangat besar, tidak praktis di web)
- JPL DE405 (file biner >100MB, tidak cocok untuk web)

### Asumsi Teknis
- Algoritma Jean Meeus cukup akurat untuk semua fitur yang direncanakan (error ≤ 1 menit untuk ratusan tahun)
- Browser yang digunakan mendukung ES6+, `const`/`let`, template literals
- Koordinat pengguna selalu tersedia (manual input atau GPS)

---

## 10. Glossary Falakiyah

| Term | Arab | Definisi |
|---|---|---|
| Jam Istiwa | الوقت الحقيقي | Waktu Hakiki; 12:00 = kulminasi Matahari lokal |
| Waktu Wasathi | الوقت الوسطي | WIB/WITA/WIT berbasis meridian standar |
| Equation of Time (EqT) | تعديل الزمان | Selisih waktu hakiki vs pertengahan; kisaran -16 s/d +14 menit |
| Koreksi Bujur | فضل البيض | `(LNG - TZ*15) / 15` jam |
| Kulminasi | الكلمينة | Matahari tepat di meridian = 12:00 Istiwa |
| Zawal | الزوال | Waktu kulminasi; awal syarat waktu Dzuhur |
| Ijtima | الاجتماع | Konjungsi Bulan-Matahari; penentu awal bulan Hijriyah |
| Hilal | الهلال | Bulan sabit pertama setelah ijtima |
| Ghurub | الغروب | Waktu terbenamnya Matahari |
| Ephemeris | الزيج | Tabel posisi benda langit |
| Gerhana | الكسوف/الخسوف | Gerhana Matahari (كسوف) / Gerhana Bulan (خسوف) |
| GST | — | Greenwich Sidereal Time — waktu sidereal Greenwich |
| LST | — | Local Sidereal Time — waktu sidereal lokal |
| VSOP87D | — | Planetary theory (Bretagnon & Francou, 1987) |
| Jean Meeus | — | Algoritma dari buku "Astronomical Algorithms" (1998) |
| IRNU | — | Kriteria Imkanur Rukyat Nahdlatul Ulama (3°, 6.4°) |

---

## 11. Acceptance Criteria Roadmap

| Versi | Fitur | Kriteria Selesai |
|---|---|---|
| v2.5.0 | Jam Istiwa | Jam berdetak, data EqT tepat, konverter berfungsi ✅ |
| v2.6.0 | Gerhana | Data gerhana ≤ 1 menit vs tabel NASA/USNO |
| v2.7.0 | Grafik Hilal | Grafik tampil, data tinggi hilal ≤ 0.01° vs Jean Meeus |
| v2.8.0 | Jam Astronomi | GST/LST ≤ 1 detik vs referensi IERS |
| v2.9.0 | Ephemeris Detail | Data geosentris & toposentris lengkap & akurat |
| v3.0.1 | Multi-Algoritma & Bugfix Istiwa | Semua algoritma bisa dipilih, hasil berbeda dinamis, Ihtiyat dinamis berfungsi, perbaikan tanda offset Istiwa ✅ |
| v3.0.2 | Bugfix Kritis Perhitungan Hilal | Pemilihan lunasi target akurat untuk semua bulan (termasuk Shafar), form diinisialisasi dinamis, tidak ada pemanggilan kalkulasi otomatis saat init ✅ |

---

*Dokumen ini adalah living document — diperbarui seiring pengembangan*
*Referensi Utama: Kanzul Falak (hasanelfalakiy), Jean Meeus "Astronomical Algorithms", SK LF-PBNU No. 001/SK/LF-PBNU/III/2022*
*Disusun: Antigravity AI | Untuk: Lembaga Falakiyah PCNU Kencong*
