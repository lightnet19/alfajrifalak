# 📑 Changelog — Al-Fajri Falak

Semua perubahan penting pada proyek **Al-Fajri Falak** akan dicatat dalam dokumen ini.

Format ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mematuhi [Semantic Versioning](https://semver.org/lang/id/).

---

## [3.0.3-patch1] - 2026-07-13
### Added
- Dokumen formal `CHANGELOG.md` dan `version.txt` pada direktori root untuk standarisasi versi rilis.
- Laporan audit sistem komprehensif (`audit_report.md`) berisi tinjauan detail dan evaluasi akurasi perhitungan.

### Fixed
- **Iluminasi Bulan Terbalik (Jam Astronomi):** Memperbaiki formula di `astroclock.js` dari `(1 + cos(elong)) / 2 * 100` menjadi `(1 - cos(elong)) / 2 * 100`. Kini menampilkan 0% pada saat New Moon (Bulan Baru) dan 100% pada saat Full Moon (Purnama).
- **Integrasi API SDK (`api.js`):**
  - Memperbaiki urutan parameter pemanggilan `calcHilal` (sebelumnya `hMonth, hYear` terbalik menjadi `hYear, hMonth`).
  - Memperbaiki pemanggilan `toHoriz()` menggunakan properti case-sensitive yang salah (`.ra`/`.dec` menjadi `.RA`/`.Dec`) dan urutan parameter (`jD, lat, lng` menjadi `lat, lng, jd0`).
  - Memperbaiki method `getEclipse` yang memanggil fungsi fiktif `searchEclipseNear` menjadi pemanggilan method modular `nextSolarEclipse` dan `nextLunarEclipse`.
  - Memperbaiki properti kulminasi dari `p.dzuhurRaw` menjadi `p.noonRaw`.
  - Merefaktor pemetaan jadwal sholat yang sebelumnya menggunakan key `*Raw` yang tidak eksis menjadi pembacaan langsung dari string waktu terformat.
- **Dead Code Modul Gerhana:** Pembersihan variabel sisa pengembangan (`absGam`, `u2`, `gamma`, dan `gammaAbs`) pada file `eclipse.js`.
- **Konsistensi Teks UI:** Sinkronisasi string versi rilis pada footer `index.html` dan header laporan hilal `hilal.js` ke `v3.0.3`.

---

## [3.0.3] - 2026-07-09
### Added
- Fungsi inisialisasi default bulan/tahun Hijriyah di form hilal secara dinamis berdasarkan tanggal hari ini (`_initHilalDefaults()`).

### Fixed
- **Bug Kritis Hisab Awal Bulan:** Memperbaiki penentuan target konjungsi (`bestK`) di `hilal.js` dari perbandingan bulan numerik `|.month-(hMonth-1)|` menjadi selisih absolut Julian Day `|jde-hijriToJD(hYear,hMonth,1)|`. Memperbaiki bug di mana hitung hilal bulan Shafar selalu menampilkan data Muharram.
- Memperlebar jangkauan loop lunasi `dk` dari `-1..2` ke `-2..2` untuk kestabilan kalkulasi.
- Menghapus pemanggilan kalkulasi hilal otomatis saat load pertama untuk performa rendering awal yang lebih bersih.

---

## [3.0.1] - 2026-05-19
### Fixed
- **Arah Offset Jam Istiwa:** Memperbaiki rumus selisih waktu di `istiwa.js` dari `noonRaw - 12` menjadi `12 - noonRaw`. Mengoreksi arah tanda offset "Maju/Lambat" Istiwa terhadap waktu sipil agar sesuai secara astronomis.

---

## [3.0.0] - 2026-05-19
### Added
- **Multi-Algoritma Waktu Sholat:** Pilihan algoritma baru di form jadwal sholat.
  - *Jean Meeus (Astronomi Modern)*.
  - *Irsyadul Murid (Salaf Taqribi Klasik)* sesuai kaidah pondok pesantren salaf.
- **Ihtiyat Dinamis:** Menambahkan konfigurasi menit pengaman (ihtiyat) yang dapat diatur dinamis dari 0 hingga 10 menit.
- **Sistem Caching Terkomposisi:** Penggunaan composite cache key berbasis parameter kalkulasi sholat untuk optimasi rendering dan mencegah freezing pada UI.

---

## [2.9.0] - 2026-05-19
### Added
- **Ephemeris Toposentris Detail:** Penambahan perbandingan data toposentris terhadap geosentris pada tabel Ephemeris detail, mencakup jarak observer, horizontal parallax (HP), altitude/azimuth toposentris, refraksi atmosfer Bennett, dan tinggi terbias.

---

## [2.8.0] - 2026-05-19
### Added
- **Modul Jam Astronomi (Sidereal Time):** Tab panel baru yang menampilkan Universal Time (UT), Greenwich Mean Sidereal Time (GMST), dan Local Sidereal Time (LST) realtime.
- Koordinat azimut dan altitude realtime untuk Matahari & Bulan (update setiap detik).

---

## [2.7.0] - 2026-05-19
### Added
- **Grafik Visibilitas Hilal 12 Bulan:** Integrasi library *Chart.js* untuk memplot tinggi hilal dan elongasi selama 1 tahun Hijriyah lengkap dengan garis batas kriteria IRNU/Odeh.
- Tabel sinkronisasi awal bulan Hijriyah (IRNU vs Odeh) dalam satu tahun.

---

## [2.6.0] - 2026-05-19
### Added
- **Modul Gerhana (Solar & Lunar):** Deteksi gerhana Matahari & Bulan dalam rentang 2 tahun mendatang, lengkap dengan tipe gerhana, magnitudo, parameter gamma, dan waktu kontak kontak fase global (C1-C4 / P1-P4).

---

## [2.5.0] - 2026-05-19
### Added
- **Modul Jam Istiwa:**
  - Jam Istiwa realtime (Waktu Hakiki / Apparent Solar Time).
  - Tampilan selisih waktu Istiwa vs Wasathi (Lokal).
  - Tabel waktu sholat format Istiwa.
  - Konverter dua arah Wasathi ↔ Istiwa.

---

## [2.4.1] - 2026-05-22
### Fixed
- **Koreksi Weton Jawa:** Menghapus pergeseran offset pasaran `+2` yang tidak akurat pada `math.js`. Menyetel referensi epoch baru: `JD 1948438.5 = Thursday Kliwon (4)`.

---

## [2.4.0] - 2026-05-22
### Added
- **Koreksi Tanggal Hijriyah (Hijri Offset):** Menambahkan input dinamis "Koreksi H" untuk sinkronisasi hasil kalkulasi kalender aritmatika dengan rukyatul hilal riil.
- **Konvensi Transisi Maghrib:** Penanggalan Hijriyah kini mendeteksi waktu terbenam matahari (Maghrib) setempat. Jika waktu saat ini telah melewati Maghrib, penanggalan Hijriyah otomatis maju satu hari ke malam berikutnya (disertai indikator malam aktif).
- Lokalisasi pencarian GPS menggunakan nominatim reverse geocoding API.

## [3.0.3] - 2026-07-13
### Fixed
- Fix `jdToHijri` leap year synchronization bug that caused Hijri calendar dates to display one month behind.

## [3.1.0] - 2026-07-13
### Added
- **Kompas Kiblat Live**: Kompas menggunakan Web DeviceOrientation API, jarum berputar real-time mengikuti arah perangkat.
- **Canvas Compass**: Kompas digambar ulang menggunakan Canvas 2D API dengan 10 layer (background, tick marks, cardinal labels, jarum, Ka'bah icon, center dot, live ring).
- **Animasi Smooth**: Low-pass exponential filter + requestAnimationFrame untuk pergerakan mulus tanpa jitter.
- **Status Live Badge**: Indikator ● LIVE (hijau berkedip) / ○ Statis (abu) / ✕ Ditolak.
- **iOS Support**: Tombol "Aktifkan Kompas Live" untuk handle izin iOS 13+ (DeviceOrientationEvent.requestPermission).
- **Azimuth dari Selatan**: Metode pesantren salaf untuk membaca arah kiblat dari Selatan.
- **Rashdul Qiblah**: Kalkulasi waktu bayangan searah kiblat harian (otomatis setiap hari) dan tahunan (27-28 Mei & 15-16 Juli).
- **Data Kompas**: Azimuth dari Utara, arah 16 mata angin, jarak ke Makkah, koordinat selisih lintang/bujur.
- **Info Ka'bah**: Koordinat Ka'bah presisi, koordinat markaz, beda lintang dan bujur.
