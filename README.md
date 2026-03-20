# 🌙 Falak — Hisab Astronomi Islam

Aplikasi hisab falak berbasis web menggunakan algoritma Jean Meeus (*Astronomical Algorithms*).

## ✨ Fitur

- 🕌 **Waktu Sholat** — Imsak, Subuh, Syuruq, Dzuhur, Ashar, Maghrib, Isya (Metode Kemenag)
- 🌒 **Hisab Hilal** — Perhitungan awal bulan Hijriyah mendetail:
  - Ijtima Geosentrik & Toposentrik
  - Tinggi Hilal (Hakiki, Airless, Apparent, Mar'i) — tepi atas/tengah/bawah
  - Elongasi, Azimuth, Semidiameter, Parallax
  - Kriteria IRNU/NU, Wujudul Hilal, Odeh, Yallop
- 📅 **Kalender Hijriyah** — Konversi otomatis + kalender bulanan
- 🌙 **Fase Bulan** — Visualisasi grafis + fase mendatang
- 🧭 **Arah Kiblat** — Kompas interaktif + jarak ke Makkah
- 🔄 **Konversi Tanggal** — Masehi ↔ Hijriyah ↔ Julian Day
- 📋 **Imsakiyah** — Jadwal sholat 1 bulan penuh
- 🪐 **Ephemeris** — Data posisi Matahari & Bulan

## 🔬 Algoritma

- Jean Meeus *Astronomical Algorithms* (60+30 suku koreksi bulan)
- VSOP87 (posisi Matahari)
- ELP2000 (posisi Bulan)
- Koreksi toposentrik lengkap
- Atmospheric refraction (Bennett formula)
- DeltaT correction

## 🚀 Deploy

Aplikasi ini di-deploy menggunakan [Vercel](https://vercel.com).

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
