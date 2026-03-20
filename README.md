# 🌙 Al-Fajri — Hisab Astronomi Islam

> Dibuat atas permintaan **Lembaga Falakiyah PCNU Kencong**

Aplikasi hisab falak berbasis web menggunakan algoritma Jean Meeus (*Astronomical Algorithms*).

---

## ✨ Fitur

| Modul | Keterangan |
|---|---|
| 🕌 **Waktu Sholat** | Imsak s/d Isya, metode Kemenag, countdown real-time |
| 🌒 **Hisab Hilal** | Ijtima Geo/Topo, Tinggi Hilal, Elongasi, kriteria IRNU/Odeh/Yallop |
| 📅 **Kalender Hijriyah** | Konversi otomatis + Weton Jawa |
| 🌙 **Fase Bulan** | Visualisasi grafis + fase mendatang |
| 🧭 **Arah Kiblat** | Kompas interaktif + jarak ke Makkah |
| 🔄 **Konversi Tanggal** | Masehi ↔ Hijriyah ↔ Julian Day |
| 📋 **Imsakiyah** | Jadwal sholat 1 bulan penuh |
| 🪐 **Ephemeris** | Data posisi Matahari & Bulan |

### 📤 Salin & Export PDF

Setiap panel dilengkapi tombol:
- **Salin Teks** — copy hasil ke clipboard
- **Export PDF** — unduh laporan PDF profesional
- **Cetak** — print langsung

## 🔬 Algoritma

- Jean Meeus — *Astronomical Algorithms*
- 60 + 30 suku koreksi bulan
- Koreksi toposentrik, atmospheric refraction, DeltaT

## 🚀 Deploy

```bash
git clone https://github.com/USERNAME/alfajri.git
cd alfajri
git add . && git commit -m "update" && git push
```
Vercel redeploy otomatis setiap push.

## 📄 Lisensi

Dibuat atas permintaan **Lembaga Falakiyah PCNU Kencong**.
