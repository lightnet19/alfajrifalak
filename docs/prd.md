# 📋 Product Requirements Document (PRD)
## Modul Jam Istiwa — Al-Fajri v2.5.0
**Lembaga Falakiyah PCNU Kencong**
**Versi:** 1.0.0 | **Tanggal:** 2026-05-19 | **Status:** Draft

---

## 1. Executive Summary

Aplikasi Al-Fajri saat ini hanya menampilkan waktu lokal berbasis UTC (WIB/WITA/WIT)
menggunakan timezone perangkat. Pengembangan ini menambahkan **Modul Jam Istiwa** —
implementasi *Waktu Hakiki* atau *Apparent Solar Time* yang merupakan sistem penanggalan
waktu asli dalam ilmu falak Islam, di mana pukul **12:00 Istiwa** didefinisikan tepat
saat Matahari berada di kulminasi (meridian transit) untuk setiap lokasi.

Modul ini krusial bagi **Ahli Falak** dan **Pengguna Pesantren** yang membutuhkan
referensi waktu hakiki untuk ijtihad fiqih, jadwal sholat tahqiqi, dan kajian
astronomi Islam.

---

## 2. Latar Belakang & Problem Statement

### 2.1 Konteks Falakiyah

Dalam khazanah ilmu falak Islam, dikenal dua sistem waktu:

| Sistem | Nama | Deskripsi |
|---|---|---|
| **Waktu Wasathi** | Waktu Pertengahan | WIB/WITA/WIT — berbasis meridian bujur standar zona |
| **Waktu Istiwa** | Waktu Hakiki | Berbasis posisi nyata Matahari — 12:00 = kulminasi Matahari |

Perbedaan keduanya disebabkan oleh dua faktor koreksi:
1. **Selisih Bujur (Fadhlu al-Baidh):** Perbedaan bujur lokasi dengan meridian standar zona waktu
2. **Equation of Time (Ta`dil al-Waqt):** Koreksi karena orbit Bumi tidak lingkaran + kemiringan ekliptika

### 2.2 Problem

- Aplikasi Al-Fajri **belum memiliki** tampilan Jam Istiwa real-time
- Ahli falak **tidak dapat** secara langsung mengetahui waktu istiwa tanpa kalkulasi manual
- Tidak ada **alat konversi** yang cepat antara Waktu Lokal dan Waktu Istiwa
- Jadwal sholat **tidak menyertakan** format istiwa sebagai referensi pembanding

### 2.3 Peluang

Dengan `EqT` yang **sudah dihitung** di `sunPos()` dalam `astro.js`, implementasi Jam
Istiwa hanya membutuhkan kalkulasi tambahan ringan tanpa refactor besar.

---

## 3. Target Pengguna

| Segmen | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Ahli Falak** | Ulama/praktisi hisab rukyat | Akurasi tinggi, data teknis lengkap |
| **Santri/Pelajar Falak** | Mahasiswa/santri yang belajar ilmu falak | Tampilan edukatif |
| **Takmir Masjid** | Pengurus masjid yang mengelola jadwal | Kemudahan baca, dapat dicetak |
| **Masyarakat Umum** | Pengguna umum yang penasaran | Tampilan sederhana & intuitif |

---

## 4. Goals & Objectives

### 4.1 Goals

1. **Menyediakan Jam Istiwa real-time** yang akurat secara astronomi untuk semua lokasi
2. **Mengedukasi pengguna** tentang konsep Waktu Hakiki dalam ilmu falak Islam
3. **Mempermudah konversi** antara Waktu Lokal dan Waktu Istiwa

### 4.2 Objectives (Terukur)

| Objective | Metrik | Target |
|---|---|---|
| Akurasi kalkulasi | Selisih vs referensi Kanzul Falak | <= 1 detik |
| Responsivitas | Update jam Istiwa | Setiap 1 detik (real-time) |
| Konsistensi UI | Mengikuti design system yang ada | 100% sesuai style.css |
| Kelengkapan data | Parameter yang ditampilkan | EqT, koreksi bujur, jam istiwa |

---

## 5. Functional Requirements

### FR-01: Jam Istiwa Real-Time
- **[WAJIB]** Menampilkan jam Istiwa yang berdetak setiap detik
- **[WAJIB]** Formula: `Jam_Istiwa = Jam_Lokal + (LNG - TZ*15) / 15 + EqT / 60`
- **[WAJIB]** Format: `HH:MM:SS`
- **[WAJIB]** Di-update bersamaan countdown sholat via `tickCountdown()`

### FR-02: Jam Lokal (Wasathi) Paralel
- **[WAJIB]** Tampilkan Jam Lokal (WIB/WITA/WIT) berdampingan
- **[WAJIB]** Label zona waktu dinamis sesuai TZ

### FR-03: Parameter Koreksi Waktu
- **[WAJIB]** Equation of Time (EqT) dalam menit & detik
- **[WAJIB]** Koreksi Bujur dalam menit & detik
- **[WAJIB]** Total Selisih Istiwa vs Wasathi (maju/lambat)
- **[WAJIB]** Waktu Kulminasi (zawal) dalam HH:MM:SS

### FR-04: Konverter Waktu
- **[WAJIB]** Input Waktu Lokal → Output Waktu Istiwa
- **[WAJIB]** Input Waktu Istiwa → Output Waktu Lokal
- **[WAJIB]** Real-time update (oninput event)

### FR-05: Jadwal Sholat Format Istiwa
- **[WAJIB]** Tabel waktu sholat dengan kolom Wasathi + Istiwa berdampingan

### FR-06: Penjelasan Edukatif
- **[OPTIONAL]** Section "Apa itu Jam Istiwa?" dengan penjelasan singkat
- **[OPTIONAL]** Infografis konsep EqT dan koreksi bujur

---

## 6. Non-Functional Requirements

| NFR | Kategori | Spesifikasi |
|---|---|---|
| NFR-01 | Performa | Kalkulasi < 1ms; tidak lag countdown |
| NFR-02 | Akurasi | <= 1 detik vs tabel ephemeris standar |
| NFR-03 | Desain | 100% gunakan CSS variables dari style.css |
| NFR-04 | Kompatibilitas | Chrome, Firefox, Safari, Edge; mobile + desktop |
| NFR-05 | Maintainability | File terpisah js/istiwa.js; 'use strict'; JSDoc |

---

## 7. UI/UX Requirements

### 7.1 Navigasi

Tab baru "Istiwa" ditambahkan di posisi terakhir setelah "Ephemeris".

### 7.2 Layout Panel (Wireframe)

```
+-------------------------------------------------------------------+
|  DUAL CLOCK                                                       |
|  +-----------------------------+  +-----------------------------+ |
|  |  JAM ISTIWA (Hakiki)        |  |  JAM LOKAL (WIB)            | |
|  |     12 : 34 : 56            |  |     13 : 02 : 14            | |
|  |  Apparent Solar Time        |  |  Waktu Pertengahan          | |
|  +-----------------------------+  +-----------------------------+ |
|           Selisih: -27 menit 18 detik (LAMBAT)                   |
+-------------------------------------------------------------------+
|  KOMPONEN KOREKSI WAKTU                                           |
|  +-----------------+  +-----------------+  +------------------+  |
|  | Eq. of Time     |  | Koreksi Bujur   |  | Total Selisih    |  |
|  | Ta`dil az-Zaman |  | Fadhlu al-Baidh |  | Istiwa - Wasathi |  |
|  | -12 m 18 s      |  | +14 m 52 s      |  | -27 m 18 s       |  |
|  +-----------------+  +-----------------+  +------------------+  |
|  Kulminasi (Zawal): 11:27:42 WIB                                  |
+-------------------------------------------------------------------+
|  WAKTU SHOLAT — PERBANDINGAN WASATHI & ISTIWA                     |
|  Sholat    | Wasathi (WIB) | Istiwa       |                       |
|  Imsak     | 04:17         | 03:49 I      |                       |
|  Subuh     | 04:27         | 03:59 I      |                       |
|  ...       | ...           | ...          |                       |
+-------------------------------------------------------------------+
|  KONVERTER WAKTU                                                   |
|  +----------------------------+  +----------------------------+  |
|  | Wasathi → Istiwa           |  | Istiwa → Wasathi           |  |
|  | Input: [HH:MM:SS]          |  | Input: [HH:MM:SS]          |  |
|  | Hasil: --:--:--            |  | Hasil: --:--:--            |  |
|  +----------------------------+  +----------------------------+  |
+-------------------------------------------------------------------+
```

### 7.3 Design Tokens

| Elemen | CSS Variable |
|---|---|
| Background card | `var(--card)` + `backdrop-filter: blur(12px)` |
| Jam Istiwa | `var(--gold2)` — emas premium, font-size: 2.5rem |
| Jam Lokal | `var(--text2)` — abu kontras sedang |
| Font jam | `var(--mono)` (JetBrains Mono) |
| Label Arab | `var(--arabic)` (Noto Naskh Arabic) |
| Nilai positif | `var(--green)` |
| Nilai negatif | `var(--amber)` |

---

## 8. Batasan & Asumsi

### Out of Scope (v2.5.0)
- Animasi jam analog bergaya sundial
- Grafik analemma (EqT sepanjang tahun)
- Export PDF modul Istiwa

### Asumsi
- `sunPos().EqT` akurat (Jean Meeus, <= 1 detik error)
- Bujur standar = `TZ x 15`
- Pengguna mengisi TZ dengan benar

---

## 9. Glossary

| Term | Definisi |
|---|---|
| **Jam Istiwa** | Waktu Hakiki; 12:00 = kulminasi Matahari lokal |
| **Waktu Wasathi** | WIB/WITA/WIT berbasis meridian standar |
| **Equation of Time (EqT)** | Selisih waktu hakiki vs pertengahan; kisaran -16 s/d +14 menit |
| **Ta`dil az-Zaman** | Istilah Arab untuk Equation of Time |
| **Koreksi Bujur** | `(LNG - TZ*15) / 15` jam |
| **Fadhlu al-Baidh** | Istilah Arab untuk Koreksi Bujur |
| **Kulminasi** | Matahari tepat di meridian = 12:00 Istiwa |
| **Zawal** | Waktu kulminasi; awal waktu Dzuhur |

---

## 10. Acceptance Criteria

| ID | Kriteria | Status |
|---|---|---|
| AC-01 | Jam Istiwa berdetak setiap detik, akurat +-1 detik | [ ] |
| AC-02 | Jam Lokal ditampilkan berdampingan dengan label zona waktu | [ ] |
| AC-03 | EqT, Koreksi Bujur, dan Total Selisih ditampilkan dengan benar | [ ] |
| AC-04 | Waktu Kulminasi (Zawal) ditampilkan dalam format HH:MM:SS | [ ] |
| AC-05 | Konverter Lokal->Istiwa berfungsi real-time | [ ] |
| AC-06 | Konverter Istiwa->Lokal berfungsi real-time | [ ] |
| AC-07 | Tabel waktu sholat format Istiwa tersedia dan akurat | [ ] |
| AC-08 | UI konsisten dengan design system (glassmorphism + gold theme) | [ ] |
| AC-09 | Tidak ada regresi pada fitur yang sudah ada | [ ] |
| AC-10 | Responsif di mobile (320px) dan desktop (1100px) | [ ] |

---

*Dokumen ini disiapkan oleh: Antigravity AI Assistant*
*Untuk: Lembaga Falakiyah PCNU Kencong — Proyek Al-Fajri v2.5.0*
*Referensi: Jean Meeus, "Astronomical Algorithms", 2nd ed.*
