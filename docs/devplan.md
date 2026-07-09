# 🛠️ Development Plan (DevPlan) — Komprehensif
## Al-Fajri Falak — Roadmap Teknis Jangka Panjang
**Referensi PRD:** docs/prd.md | **Inspiras:** Kanzul Falak v3.10.0
**Versi Dokumen:** 2.0.0 | **Diperbarui:** 2026-05-19

---

## 1. Status Implementasi Saat Ini

| Versi | Fitur | Status |
|---|---|---|
| v2.4.x | Fondasi (Sholat, Hilal, Kiblat, Ephemeris, Imsakiyah) | ✅ Selesai |
| v2.5.0 | Jam Istiwa (Waktu Hakiki) | ✅ Selesai |
| v2.6.0 | Gerhana Matahari & Bulan | ✅ Selesai |
| v2.7.0 | Grafik Visibilitas Hilal | ✅ Selesai |
| v2.8.0 | Jam Astronomi & Sinkronisasi Kalender | ✅ Selesai |
| v2.9.0 | Ephemeris Detail (Geosentris & Toposentris) | ✅ Selesai |
| v3.0.1 | Multi-Algoritma & Bugfix Istiwa | ✅ Selesai |
| v3.0.2 | Bugfix Kritis Perhitungan Hilal & Init Defaults | ✅ Selesai |
| v3.x | PWA, Qodho, Tasbih, dll. | 📋 Direncanakan |

---

## 2. Arsitektur File (Saat Ini & Target)

```
public/
├── index.html          ← SPA entry point [STABIL]
├── css/
│   └── style.css       ← Design system [STABIL]
└── js/
    ├── math.js         ← Layer 1: Util (konversi, format, JD) [STABIL]
    ├── astro.js        ← Layer 2: Jean Meeus core [STABIL]
    ├── prayer.js       ← Layer 3: Waktu sholat + cache [STABIL]
    ├── hilal.js        ← Layer 3: Hisab awal bulan [STABIL]
    ├── eclipse.js      ← Layer 3: Gerhana [STABIL]
    ├── ui.js           ← Layer 4: Render semua panel [STABIL]
    ├── copypdf.js      ← Layer 5: Export [STABIL]
    ├── istiwa.js       ← Layer 5: Jam Istiwa [STABIL]
    ├── hilalchart.js   ← Layer 5: Grafik hilal [STABIL]
    ├── astroclock.js   ← Layer 5: Jam Astronomi [STABIL]
    └── main.js         ← Layer 6: Init (HARUS TERAKHIR) [STABIL]

docs/
├── prd.md              ← Product Requirements [UPDATED ✅]
├── devplan.md          ← Development Plan [UPDATED ✅]
└── devlog.md           ← Development Log [UPDATE per versi]
```

### Urutan Load Script (Target v3.0.0)
```html
<script src="js/math.js"></script>
<script src="js/astro.js"></script>
<script src="js/prayer.js"></script>
<script src="js/hilal.js"></script>
<script src="js/eclipse.js"></script>     <!-- v2.6.0 -->
<script src="js/ui.js"></script>
<script src="js/copypdf.js"></script>
<script src="js/istiwa.js"></script>      <!-- v2.5.0 ✅ -->
<script src="js/hilalchart.js"></script>  <!-- v2.7.0 -->
<script src="js/astroclock.js"></script>  <!-- v2.8.0 -->
<script src="js/main.js"></script>
```

---

## 3. Versi v2.6.0 — Modul Gerhana

### 3.1 Dasar Algoritma

Menggunakan **Jean Meeus, "Astronomical Algorithms"** Chapter 54 (Solar Eclipse) & Chapter 55 (Lunar Eclipse).

**Gerhana Matahari (Metode Meeus):**
```
k = bulan lunasi (terdekat new moon)
JDE_nm = JDE new moon ke-k
T = (JDE_nm - 2451545) / 36525

F = 160.7108 + 390.67050284*k - 0.0016118*T² - 0.00000227*T³ + 0.000000011*T⁴

Gerhana terjadi jika |sin(F)| < 0.36

Magnitude = ...
```

**Gerhana Bulan (Metode Meeus):**
```
k = bulan lunasi (terdekat full moon)
JDE_fm = JDE full moon ke-k

Gerhana terjadi jika:
  u < -0.0010  → Total
  u < 0.1026   → Parsial
  u < 1.0128   → Penumbral
  (di mana u = jarak pusat Bulan dari pusat umbra)
```

### 3.2 File Baru: `js/eclipse.js`

**Fungsi yang Diimplementasikan:**

```js
/**
 * eclipse.js — Modul Gerhana Matahari & Bulan
 * Al-Fajri v2.6.0 | Jean Meeus Chapter 54 & 55
 * Depends on: math.js, astro.js
 */

// Gerhana Matahari — cari gerhana terdekat
function nextSolarEclipse(year, month, lat, lng, tz) {...}

// Gerhana Bulan — cari gerhana terdekat
function nextLunarEclipse(year, month) {...}

// Cari semua gerhana dalam rentang tahun tertentu
function eclipsesInYear(year) {...}

// Render panel gerhana
function renderEclipse() {...}
```

### 3.3 UI Panel Gerhana

**Tab baru:** "Gerhana" (setelah Istiwa)

**Layout:**
```
+--------------------------------------------------+
|  JENIS: Gerhana Matahari Total                   |
|  Magnitude: 1.042 | Obscuration: 98.2%           |
+--------------------------------------------------+
|  WAKTU KONTAK (WIB)         |  DATA TEKNIS       |
|  C1: 14:12:34               |  Lat: -8.26°       |
|  C2: 15:18:42               |  Gambar Gerhana    |
|  Puncak: 15:51:15           |  [diagram SVG]     |
|  C3: 16:24:21               |                    |
|  C4: 17:28:19               |                    |
+--------------------------------------------------+
|  GERHANA MENDATANG (2 tahun ke depan)            |
|  [Tabel: Tanggal | Jenis | Wilayah | Magnitude]  |
+--------------------------------------------------+
```

### 3.4 CSS Baru (tambahkan ke style.css)

```css
/* Eclipse panel */
.ec-type-badge { ... }     /* Badge jenis gerhana */
.ec-contact-grid { ... }   /* Grid waktu kontak */
.ec-diagram { ... }        /* SVG diagram umbra */
.ec-upcoming-tbl { ... }   /* Tabel gerhana mendatang */
```

### 3.5 Modifikasi File

| File | Perubahan |
|---|---|
| `index.html` | Tambah tab "Gerhana" + panel `#panel-gerhana` |
| `style.css` | Tambah CSS eclipse |
| `js/eclipse.js` | BARU — semua logika gerhana |
| `js/ui.js` | Tambah `renderEclipse()` ke `renderAll()` |
| `js/main.js` | Load sequence (tidak perlu ubah) |
| `js/copypdf.js` | Tambah `exportEclipsePDF()` |

### 3.6 Estimasi Waktu: ~4 jam

---

## 4. Versi v2.7.0 — Grafik Visibilitas Hilal

### 4.1 Dasar Algoritma

Data yang sudah ada dari `hilal.js` (tinggi hilal, elongasi) digunakan untuk memplot grafik 12 bulan.

**Library Chart.js** akan ditambahkan (satu-satunya external library baru):
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
```

### 4.2 Data yang Diplot

Untuk setiap bulan dalam 1 tahun Hijriyah yang dipilih:
- **Tinggi Hilal Hakiki** (garis biru)
- **Elongasi Geocentric** (garis hijau)
- **Garis referensi IRNU:** Tinggi 3°, Elongasi 6.4° (garis emas horizontal)
- **Garis referensi Odeh:** Elongasi 6.4°, Arc of Light (ARCL) 6.4°

### 4.3 UI Panel

**Ditambahkan ke panel `#panel-hilal` yang sudah ada** (bukan tab baru):

```
+--------------------------------------------------+
|  HISAB AWAL BULAN  [Form Hilal yang sudah ada]   |
+--------------------------------------------------+
|  HASIL HISAB [Sudah ada]                         |
+--------------------------------------------------+
|  GRAFIK VISIBILITAS HILAL (Baru v2.7.0)          |
|  Tahun Hijriyah: [1447] [Generate Grafik]        |
|  [Chart.js Canvas — Bar Chart + Line Chart]      |
|  [Legend: IRNU | Odeh | Yallop]                  |
+--------------------------------------------------+
|  TABEL SINKRONISASI 12 BULAN (Baru v2.7.0)       |
|  Bulan | Awal Bulan M | Tinggi | Elongasi | Ket. |
|  Muharram | 12 Jul 2025 | 3.45° | 7.12° | ✓ IRNU|
|  ...                                             |
+--------------------------------------------------+
```

### 4.4 File Baru: `js/hilalchart.js`

```js
/**
 * hilalchart.js — Grafik Visibilitas Hilal & Sinkronisasi Kalender
 * Al-Fajri v2.7.0
 * Depends on: math.js, astro.js, hilal.js
 * External: Chart.js v4
 */

// Generate data 12 bulan untuk 1 tahun Hijriyah
function generateHilalYearData(hijriYear) {
  const data = [];
  for (let month = 1; month <= 12; month++) {
    const result = calcHilal(hijriYear, month, LAT, LNG, TZ, ELEV);
    data.push({ month, ...result });
  }
  return data;
}

// Render grafik Chart.js
function renderHilalChart(data) {...}

// Render tabel sinkronisasi
function renderSyncTable(data) {...}

// Handler tombol generate
function doGenerateHilalChart() {...}
```

### 4.5 Estimasi Waktu: ~3 jam

---

## 5. Versi v2.8.0 — Jam Astronomi (SELESAI)

### 5.1 Formula Jam Astronomi

**Greenwich Sidereal Time (GST):**
```
JD0 = JD pada UT=0 hari ini
T = (JD0 - 2451545.0) / 36525
θ₀ = 100.4606184 + 36000.77004*T + 0.000387933*T² - T³/38710000
GST = θ₀ + 360.98564724*(UT_hours/24)
GST = GST mod 360
```

**Local Sidereal Time (LST):**
```
LST = GST + LNG (°)  →  konversi ke jam
LST_hours = LST / 15
```

**Hour Angle Matahari:**
```
HA = LST - AR_Matahari
```

### 5.2 File Baru: `js/astroclock.js`

```js
/**
 * astroclock.js — Jam Astronomi Real-Time
 * Al-Fajri v2.8.0
 * Depends on: math.js, astro.js
 */

function calcGST(jd_ut) {...}       // Hitung GST
function calcLST(gst, lng) {...}    // Hitung LST
function fmtAngleToTime(deg) {...}  // Konversi sudut ke HH:MM:SS

// tick — dipanggil setiap detik
function tickAstroClock() {
  const now = new Date();
  const utH = now.getUTCHours() + now.getUTCMinutes()/60 + now.getUTCSeconds()/3600;
  const jd_ut = jd(now.getUTCFullYear(), now.getUTCMonth()+1, now.getUTCDate(), utH);
  const gst = calcGST(jd_ut);
  const lst = calcLST(gst, LNG);
  // Render ke DOM
  document.getElementById('aclkUT').textContent  = fmtIstiwaHMS(utH);
  document.getElementById('aclkGST').textContent = fmtAngleToTime(gst);
  document.getElementById('aclkLST').textContent = fmtAngleToTime(lst);
}

function renderAstroClock() {...}   // Render panel statis (posisi matahari/bulan saat ini)
```

### 5.3 UI Panel

**Tab baru:** "Jam Astro" (setelah Gerhana)

```
+---------------------------------------------------+
|  JAM ASTRONOMI REAL-TIME                          |
|  UT:  12:47:23  |  GST: 07:12:45  |  LST: 14:43: |
+---------------------------------------------------+
|  POSISI MATAHARI KINI                             |
|  AR: 03h 41m 22s  |  Dec: +22°14'  |  HA: ...    |
|  Az: 215.4°  |  Alt: +62.3°                      |
+---------------------------------------------------+
|  POSISI BULAN KINI                                |
|  AR: 14h 22m 11s  |  Dec: -18°22'  |  Iluminasi: |
|  Az: 185.2°  |  Alt: +45.1°                      |
+---------------------------------------------------+
```

### 5.4 Estimasi Waktu: ~3 jam

---

## 6. Versi v2.9.0 — Ephemeris Detail (SELESAI)

### 6.1 Data yang Ditambahkan ke Panel Ephemeris

Perluasan dari tabel ephemeris yang sudah ada dengan data toposentris:

| Parameter | Geosentris | Toposentris |
|---|---|---|
| Bujur Ekliptika (λ) | ✅ | ✅ (baru) |
| Lintang Ekliptika (β) | ✅ | ✅ (baru) |
| AR & Deklinasi | ✅ | ✅ (baru) |
| Jarak | ✅ | ✅ (baru) |
| Parallax | ✅ | ✅ (baru, toposentris HP) |
| Altitude & Azimuth | ❌ | ✅ (baru) |
| Refraksi Atmosfer | ❌ | ✅ (baru) |

### 6.2 Formula Toposentris

```js
// Parallax in altitude (Moon)
function topoParallax(geoRA, geoDec, HP, lat, h, lst) {
  // Meeus Eq 40.6
  const sinPi = Math.sin(HP * D2R);
  const rhoSinPhi = ... // observer lat correction
  const rhoCosePhi = ...
  const dRA = ...       // parallax in RA
  const dDec = ...      // parallax in Dec
  return { topoRA: geoRA + dRA, topoDec: geoDec + dDec };
}

// Altitude & Azimuth dari AR & Dec
function equatorialToHorizon(ra, dec, lst, lat) {
  const ha = lst - ra;
  const alt = Math.asin(sin(dec)*sin(lat) + cos(dec)*cos(lat)*cos(ha));
  const az = Math.atan2(-cos(dec)*cos(lat)*sin(ha), sin(dec)-sin(lat)*sin(alt));
  return { alt: alt*R2D, az: fix(az*R2D) };
}

// Refraksi atmosfer (Meeus formula)
function atmosphericRefraction(altDeg) {
  if (altDeg > 85) return 0;
  const R = 1.02 / Math.tan((altDeg + 10.3/(altDeg + 5.11)) * D2R) / 60;
  return R; // degrees
}
```

### 6.3 Modifikasi: `js/astro.js`

Tambahkan fungsi `topoParallax()`, `equatorialToHorizon()`, `atmosphericRefraction()`.

### 6.4 Modifikasi: `js/ui.js`

Perluas `renderEphemeris()` dengan baris data toposentris + altitude/azimuth + refraksi.

### 6.5 Estimasi Waktu: ~3 jam

---

## 7. Versi v3.0.0 — Multi-Algoritma Waktu Sholat

### 7.1 Algoritma Target

| Algoritma | Sumber | Tersedia |
|---|---|---|
| Jean Meeus | Buku "Astronomical Algorithms" | ✅ Sudah ada |
| Irsyadul Murid | Kitab Falak klasik (Asy-Syekh Ahmad Ghozali) | 🔴 Perlu implementasi |

### 7.2 Metode Irsyadul Murid (Taqribi)

Algoritma taqribi (pendekatan tabel) yang banyak digunakan di pesantren salaf Indonesia:

```
// Kulminasi
noon = 12 - (LNG - 105) / 15 - EqT/60

// Subuh: saat Matahari -20° (atau -18° tergantung madzhab)
// Menggunakan rumus ta'dil/taqribi:
t_subuh = acos(-sin(-20°) + sin(Dec)*sin(Lat)) / (cos(Dec)*cos(Lat))
t_subuh = t_subuh / 15  // jam
subuh = noon - t_subuh

// dan seterusnya...
```

### 7.3 Implementasi di `js/prayer.js`

Tambahkan parameter `algo` ke `prayerTimes()`:

```js
function prayerTimes(year, month, day, lat, lng, tz, elev, algo='jeanmeeus') {
  if (algo === 'irsyadulmurid') {
    return _prayerTimesIrsyadulMurid(year, month, day, lat, lng, tz, elev);
  }
  // Existing Jean Meeus code...
}
```

### 7.4 UI Perubahan

Tambahkan dropdown di panel `#panel-sholat`:

```html
<select id="algoSelect">
  <option value="jeanmeeus">Jean Meeus (Astronomi Modern)</option>
  <option value="irsyadulmurid">Irsyadul Murid (Taqribi Klasik)</option>
</select>
```

### 7.5 Estimasi Waktu: ~5 jam

---

## 8. Panduan Teknis Umum

### 8.1 Konvensi Kode

```js
// Header wajib setiap file modul baru
/**
 * nama-file.js — Deskripsi modul
 * Al-Fajri vX.X.X | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js [daftar dependencies]
 */
'use strict';
```

### 8.2 Pola Render Standar

Setiap modul baru **WAJIB** mengikuti pola ini:

```js
// Fungsi render statis (dipanggil dari renderAll di ui.js)
function renderNamaModul() {
  if (!dataDependency) return; // Guard clause
  // ... render DOM
}

// Fungsi tick realtime (jika perlu, dipanggil dari interval di main.js)
function tickNamaModul() {
  const el = document.getElementById('id-elemen');
  if (!el) return; // Guard clause
  // ... update DOM
}
```

### 8.3 Pattern Guard Wiring (main.js)

```js
// Pattern yang sudah dipakai dan wajib diikuti:
if (typeof tickIstiwa === 'function') tickIstiwa();
if (typeof tickAstroClock === 'function') tickAstroClock();

setInterval(() => {
  tickCountdown();
  if (typeof tickIstiwa === 'function') tickIstiwa();
  if (typeof tickAstroClock === 'function') tickAstroClock();
}, 1000);
```

### 8.4 Pattern Guard Render (ui.js)

```js
function renderAll() {
  renderPrayer();
  renderHijri();
  renderMoon();
  renderQibla();
  renderKonversi();
  renderImsakiyah();
  renderEphemeris();
  if (typeof renderIstiwa === 'function') renderIstiwa();        // v2.5.0
  if (typeof renderEclipse === 'function') renderEclipse();      // v2.6.0
  if (typeof renderAstroClock === 'function') renderAstroClock(); // v2.8.0
}
```

### 8.5 Aturan Penambahan CSS

- **JANGAN** edit class yang sudah ada — hanya tambah class baru
- Prefix class baru dengan singkatan modul: `iw-` (istiwa), `ec-` (eclipse), `ac-` (astro clock)
- Selalu gunakan CSS variables (`var(--gold)`, `var(--card)`, dll.)
- Tambahkan media query `@media(max-width: 560px)` untuk setiap layout grid/flex

---

## 9. Commit Strategy Per Versi

```bash
# v2.6.0 Gerhana
git add public/js/eclipse.js
git commit -m "feat(eclipse): add solar & lunar eclipse calculation engine"

git add public/index.html public/css/style.css public/js/ui.js
git commit -m "feat(eclipse): add Eclipse UI panel, tab, and styles"

git tag -a v2.6.0 -m "Al-Fajri v2.6.0 - Modul Gerhana Matahari & Bulan"
git push origin main --tags

# v2.7.0 Grafik Hilal
git add public/js/hilalchart.js
git commit -m "feat(hilal): add hilal visibility chart (Chart.js)"

# v2.8.0 Jam Astronomi
git add public/js/astroclock.js
git commit -m "feat(astroclock): add real-time astronomical clock (GST/LST)"

# v3.0.0 Multi-Algo
git commit -m "feat(prayer): add Irsyadul Murid algorithm option"
```

---

## 10. Ringkasan Timeline Estimasi

| Versi | Fitur Utama | Estimasi Jam |
|---|---|---|
| v2.6.0 | Gerhana Matahari & Bulan | ~4 jam |
| v2.7.0 | Grafik Visibilitas Hilal | ~3 jam |
| v2.8.0 | Jam Astronomi + Sinkronisasi Kalender | ~3 jam |
| v2.9.0 | Ephemeris Detail (toposentris) | ~3 jam |
| v3.0.0 | Multi-Algoritma Waktu Sholat | ~5 jam |
| **Total** | | **~18 jam** |

> **Estimasi ini mengasumsikan** tidak ada blocking bug, dan formula Jean Meeus sudah dikuasai. Waktu aktual bisa lebih singkat karena pola kode sudah mapan.

---

## 11. Checklist Pre-Deploy (Setiap Versi)

- [ ] Semua file JS baru di-load sebelum `main.js`
- [ ] Fungsi render baru dipanggil dengan guard `typeof` di `ui.js`
- [ ] Fungsi tick baru dipanggil di interval `main.js`
- [ ] Semua ID HTML unik
- [ ] CSS prefix konsisten, tidak override class lama
- [ ] Versi di footer di-update
- [ ] `docs/devlog.md` di-update
- [ ] Verifikasi kalkulasi manual untuk minimal 1 kasus uji
- [ ] Test regresi: tab lama masih berfungsi
- [ ] Test responsif mobile (320px) dan desktop (1100px)
- [ ] Git commit + tag + push berhasil
- [ ] Vercel auto-deploy berhasil

---

*DevPlan ini adalah living document — diperbarui setiap sesi pengembangan*
*Disusun: Antigravity AI | Referensi: Kanzul Falak CHANGELOG v3.10.0, Jean Meeus "Astronomical Algorithms" 2nd ed.*
