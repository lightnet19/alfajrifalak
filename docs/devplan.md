# 🛠️ Development Plan (DevPlan)
## Modul Jam Istiwa — Al-Fajri v2.5.0
**Versi:** 1.0.0 | **Tanggal:** 2026-05-19 | **Referensi PRD:** docs/prd.md

---

## 1. Ringkasan Teknis

| Item | Detail |
|---|---|
| Versi Target | v2.5.0 |
| File Baru | `public/js/istiwa.js` |
| File Dimodifikasi | `public/index.html`, `public/css/style.css`, `public/js/prayer.js`, `public/js/main.js` |
| Dependency Baru | Tidak ada (zero new libraries) |
| Estimasi LOC | ~200 baris JS + ~80 baris CSS + ~60 baris HTML |

---

## 2. Analisis Formula Matematis

### 2.1 Formula Utama

```
Koreksi_Bujur (jam) = (LNG - TZ * 15) / 15
Selisih_Total (jam)  = Koreksi_Bujur + EqT / 60
Jam_Istiwa           = Jam_Lokal + Selisih_Total
```

**Contoh (Kencong, Jember):**
- LNG = 113.4203°, TZ = 7 (WIB), Bujur Standar = 105°
- Koreksi Bujur = (113.4203 - 105) / 15 = +0.5614 jam = +33 mnt 41 dtk
- Jika EqT = +3.2 menit → Selisih_Total = 33.68 + 3.2/60 = +33 mnt 53 dtk
- Jam Lokal 13:02:14 WIB → Jam Istiwa = 13:35:67 = **13:36:07 Istiwa**

### 2.2 Konversi Waktu Sholat

```
Waktu_Sholat_Istiwa = Waktu_Sholat_Wasathi + Selisih_Total
```

> Nilai `noonRaw` dari `prayerTimes()` sudah mengandung koreksi EqT dan bujur
> (yaitu waktu kulminasi lokal). Nilai ini adalah **12:00 Istiwa** yang dikonversi
> ke waktu lokal. Jadi: `Selisih = noonRaw - 12`.

### 2.3 Implementasi Ringkas di JS

```js
// Ambil dari cache prayer (sudah dihitung)
// noonRaw = kulminasi surya dalam jam lokal
// noonRaw - 12 = total selisih istiwa vs wasathi
function getIstiwaOffset(noonRaw) {
  return noonRaw - 12; // jam (positif = Istiwa lebih lambat dari WIB)
}

function localToIstiwa(localHour, offset) {
  return ((localHour + offset) % 24 + 24) % 24;
}

function istiwaToLocal(istiwaHour, offset) {
  return ((istiwaHour - offset) % 24 + 24) % 24;
}
```

> **Catatan:** Menggunakan `noonRaw - 12` lebih akurat dan konsisten
> daripada menghitung ulang dari EqT + koreksi bujur secara terpisah,
> karena `noonRaw` sudah melalui kalkulasi Jean Meeus penuh.

---

## 3. Arsitektur Solusi

```
index.html
  ├── Tab baru: data-tab="istiwa"
  └── Panel baru: id="panel-istiwa"
        ├── #istiwa-clock      ← Jam Istiwa real-time
        ├── #local-clock       ← Jam Lokal real-time
        ├── #istiwa-params     ← Koreksi bujur, EqT, total selisih, zawal
        ├── #istiwa-sholat     ← Tabel waktu sholat Wasathi vs Istiwa
        └── #istiwa-converter  ← Input konverter dua arah

js/istiwa.js  (BARU)
  ├── getIstiwaOffset(noonRaw)   ← Hitung selisih dari noonRaw
  ├── fmtIstiwa(h)               ← Format jam Istiwa HH:MM:SS
  ├── renderIstiwa()             ← Render panel statis (params + tabel)
  └── tickIstiwa()               ← Update clock setiap detik

js/prayer.js  (MODIFIKASI)
  └── prayerTimes() → tambah return noonRaw (sudah ada), EqT, koreksi bujur

js/main.js  (MODIFIKASI)
  └── setInterval → panggil tickIstiwa() bersamaan tickCountdown()

css/style.css  (MODIFIKASI)
  └── Tambah class: .iw-clock, .iw-params-grid, .iw-diff, .iw-sholat-tbl, .iw-conv
```

---

## 4. Rencana Implementasi Detail

### FASE 1 — Kalkulasi & File Baru `js/istiwa.js`

**Task 1.1 — Fungsi Core**

```js
/**
 * istiwa.js — Modul Jam Istiwa (Waktu Hakiki)
 * Al-Fajri v2.5.0 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js, prayer.js
 */
'use strict';

/**
 * Ambil offset Istiwa dari noonRaw prayer cache.
 * noonRaw adalah waktu kulminasi Matahari dalam jam lokal.
 * Offset = noonRaw - 12 (jam) → positif = Istiwa lebih lambat.
 * @returns {number} offset dalam jam desimal
 */
function getIstiwaOffset() {
  if (!_pCache.result) return 0;
  return _pCache.result.noonRaw - 12;
}

/** Jam desimal → HH:MM:SS string (looping 0-24h) */
function fmtIstiwaHMS(h) {
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = Math.floor(((h - hh) * 60 - mm) * 60);
  return `${pZ(hh)}:${pZ(mm)}:${pZ(ss)}`;
}

/** Format selisih jam desimal → "+X mnt YY dtk" atau "-X mnt YY dtk" */
function fmtDiff(diffHour) {
  const sign   = diffHour >= 0 ? '+' : '-';
  const total  = Math.abs(diffHour) * 3600; // detik
  const mnt    = Math.floor(total / 60);
  const dtk    = Math.round(total % 60);
  return `${sign}${mnt} mnt ${pZ(dtk)} dtk`;
}

/** Nama zona waktu dari TZ offset */
function tzLabel(tz) {
  if (tz === 7) return 'WIB';
  if (tz === 8) return 'WITA';
  if (tz === 9) return 'WIT';
  return `UTC+${tz}`;
}
```

**Task 1.2 — Fungsi Tick (real-time)**

```js
/**
 * tickIstiwa — dipanggil setiap detik dari main.js
 * Update tampilan Jam Istiwa dan Jam Lokal
 */
function tickIstiwa() {
  const el_iw  = document.getElementById('istiwaClockVal');
  const el_loc = document.getElementById('localClockVal');
  const el_dif = document.getElementById('istiwaClockDiff');
  if (!el_iw) return;

  const now    = new Date();
  const localH = now.getHours() + now.getMinutes()/60 + now.getSeconds()/3600;
  const offset = getIstiwaOffset(); // jam desimal
  const istiwaH = localH + offset;

  el_iw.textContent  = fmtIstiwaHMS(istiwaH);
  el_loc.textContent = fmtIstiwaHMS(localH);

  const sign  = offset >= 0 ? 'MAJU' : 'LAMBAT';
  const color = offset >= 0 ? 'var(--green)' : 'var(--amber)';
  el_dif.textContent  = `Selisih: ${fmtDiff(offset)} (Istiwa ${sign} dari ${tzLabel(TZ)})`;
  el_dif.style.color  = color;
}
```

**Task 1.3 — Fungsi Render Statis**

```js
/**
 * renderIstiwa — dipanggil dari renderAll() di ui.js
 * Render: parameter koreksi, tabel sholat istiwa, konverter
 */
function renderIstiwa() {
  if (!_pCache.result) return;
  const p      = _pCache.result;
  const offset = p.noonRaw - 12; // jam desimal

  // Komponen individual
  const korBujur = (LNG - TZ * 15) / 15;   // jam
  const eqtHour  = p.eqt / 60;             // menit → jam

  _renderIstiwaParams(offset, korBujur, eqtHour, p.noonRaw);
  _renderIstiwaSholat(p, offset);
  _initIstiwaConverter(offset);
}

function _renderIstiwaParams(offset, korBujur, eqtHour, noonRaw) {
  const el = document.getElementById('istiwaParams');
  if (!el) return;
  el.innerHTML = `
    <div class="iw-param-card">
      <div class="iw-param-lbl">Eq. of Time</div>
      <div class="iw-param-ar">تَعْدِيلُ الزَّمَان</div>
      <div class="iw-param-val ${eqtHour >= 0 ? 'pos' : 'neg'}">${fmtDiff(eqtHour)}</div>
    </div>
    <div class="iw-param-card">
      <div class="iw-param-lbl">Koreksi Bujur</div>
      <div class="iw-param-ar">فَضْلُ الْبَيْض</div>
      <div class="iw-param-val ${korBujur >= 0 ? 'pos' : 'neg'}">${fmtDiff(korBujur)}</div>
    </div>
    <div class="iw-param-card">
      <div class="iw-param-lbl">Total Selisih</div>
      <div class="iw-param-ar">Istiwa − Wasathi</div>
      <div class="iw-param-val ${offset >= 0 ? 'pos' : 'neg'}">${fmtDiff(offset)}</div>
    </div>
    <div class="iw-param-card">
      <div class="iw-param-lbl">Kulminasi (Zawal)</div>
      <div class="iw-param-ar">الزَّوَال</div>
      <div class="iw-param-val">${fmtIstiwaHMS(noonRaw)} ${tzLabel(TZ)}</div>
    </div>
  `;
}

function _renderIstiwaSholat(p, offset) {
  const el = document.getElementById('istiwaSholat');
  if (!el) return;
  const rows = [
    { n:'Imsak',   ar:'إمساك',     w: p.imsak   },
    { n:'Subuh',   ar:'الصبح',    w: p.fajr    },
    { n:'Syuruq',  ar:'الشروق',  w: p.syuruq  },
    { n:'Dhuha',   ar:'الضحى',   w: p.dhuha   },
    { n:'Dzuhur',  ar:'الظهر',    w: p.dhuhr   },
    { n:'Ashar',   ar:'العصر',    w: p.ashr    },
    { n:'Maghrib', ar:'المغرب',  w: p.maghrib },
    { n:"Isya'",   ar:'العشاء',   w: p.isya    },
  ];
  let html = `<thead><tr>
    <th>Sholat</th><th>Arab</th>
    <th>${tzLabel(TZ)}</th><th>Istiwa</th>
  </tr></thead><tbody>`;
  rows.forEach(r => {
    let iw = '—';
    if (r.w !== '—') {
      const [h, m] = r.w.split(':').map(Number);
      iw = fmtIstiwaHMS(h + m/60 + offset);
      iw = iw.substring(0, 5); // HH:MM saja
    }
    html += `<tr>
      <td class="kc">${r.n}</td>
      <td style="font-family:var(--arabic);font-size:1.1rem">${r.ar}</td>
      <td>${r.w}</td>
      <td class="iw-col">${iw}</td>
    </tr>`;
  });
  el.innerHTML = html + '</tbody>';
}

function _initIstiwaConverter(offset) {
  // Wasathi -> Istiwa
  const inpLI = document.getElementById('convLtoI');
  const outLI = document.getElementById('convLtoIRes');
  // Istiwa -> Wasathi
  const inpIL = document.getElementById('convItoL');
  const outIL = document.getElementById('convItoLRes');

  function doLtoI() {
    const v = inpLI.value;
    if (!v) { outLI.textContent = '--:--:--'; return; }
    const [h, m, s] = v.split(':').map(Number);
    const localH = h + (m||0)/60 + (s||0)/3600;
    outLI.textContent = fmtIstiwaHMS(localH + offset);
  }
  function doItoL() {
    const v = inpIL.value;
    if (!v) { outIL.textContent = '--:--:--'; return; }
    const [h, m, s] = v.split(':').map(Number);
    const istiwaH = h + (m||0)/60 + (s||0)/3600;
    outIL.textContent = fmtIstiwaHMS(istiwaH - offset);
  }

  inpLI.oninput = doLtoI;
  inpIL.oninput = doItoL;
}
```

---

### FASE 2 — HTML: Tab & Panel Baru (`index.html`)

**Task 2.1 — Tambah Tab Button** (setelah tab ephemeris, baris 46):

```html
<button class="tab" data-tab="istiwa">Istiwa</button>
```

**Task 2.2 — Tambah Panel** (setelah `#panel-ephemeris`, sebelum `<footer>`):

```html
<div class="panel" id="panel-istiwa">

  <!-- 1. Dual Clock -->
  <div class="card iw-dual-clock">
    <div class="iw-clock-wrap">
      <div class="iw-clock-col">
        <div class="iw-clock-lbl">⏰ JAM ISTIWA</div>
        <div class="iw-clock-ar">الوَقْتُ الحَقِيقِي</div>
        <div class="iw-clock-val gold" id="istiwaClockVal">--:--:--</div>
        <div class="iw-clock-sub">Waktu Hakiki / Apparent Solar Time</div>
      </div>
      <div class="iw-clock-sep"></div>
      <div class="iw-clock-col">
        <div class="iw-clock-lbl">🕐 JAM LOKAL</div>
        <div class="iw-clock-ar">الوَقْتُ الوَسَطِي</div>
        <div class="iw-clock-val" id="localClockVal">--:--:--</div>
        <div class="iw-clock-sub" id="localClockTZ">Waktu Pertengahan</div>
      </div>
    </div>
    <div class="iw-diff" id="istiwaClockDiff">Menghitung...</div>
  </div>

  <!-- 2. Parameter Koreksi -->
  <div class="card">
    <div class="card-hd">Komponen Koreksi Waktu</div>
    <div class="iw-params-grid" id="istiwaParams"></div>
  </div>

  <!-- 3. Tabel Sholat Istiwa -->
  <div class="card">
    <div class="card-hd">Waktu Sholat — Wasathi & Istiwa</div>
    <div style="overflow-x:auto">
      <table class="dtbl" id="istiwaSholat"></table>
    </div>
  </div>

  <!-- 4. Konverter -->
  <div class="card">
    <div class="card-hd">Konverter Waktu</div>
    <div class="two-col">
      <div class="conv-box">
        <label>Wasathi (WIB) → Istiwa</label>
        <input type="time" id="convLtoI" step="1">
        <div class="conv-res" id="convLtoIRes">--:--:--</div>
      </div>
      <div class="conv-box">
        <label>Istiwa → Wasathi (WIB)</label>
        <input type="time" id="convItoL" step="1">
        <div class="conv-res" id="convItoLRes">--:--:--</div>
      </div>
    </div>
  </div>

</div>
```

**Task 2.3 — Tambah script tag** (setelah `copypdf.js`, sebelum `main.js`):

```html
<script src="js/istiwa.js"></script>
```

---

### FASE 3 — CSS: Class Baru (`style.css`)

```css
/* ─── Modul Istiwa ─────────────────────────────── */

.iw-dual-clock { padding: 28px; }

.iw-clock-wrap {
  display: flex; align-items: center; justify-content: center;
  gap: 0; flex-wrap: wrap;
}

.iw-clock-col {
  flex: 1; min-width: 220px; text-align: center; padding: 16px 24px;
}

.iw-clock-sep {
  width: 1px; height: 120px; background: var(--border-s);
  flex-shrink: 0; align-self: center;
}
@media(max-width: 560px) {
  .iw-clock-sep { width: 80%; height: 1px; }
}

.iw-clock-lbl {
  font-size: .7rem; font-weight: 700; letter-spacing: .18em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 4px;
}

.iw-clock-ar {
  font-family: var(--arabic); font-size: 1.05rem;
  color: var(--text3); margin-bottom: 10px;
}

.iw-clock-val {
  font-family: var(--mono); font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 700; color: var(--text2); line-height: 1;
  text-shadow: 0 0 15px rgba(255,255,255,0.15);
  letter-spacing: .05em;
}
.iw-clock-val.gold {
  color: var(--gold2);
  text-shadow: 0 0 20px rgba(252,225,141,0.4);
}

.iw-clock-sub {
  font-size: .7rem; color: var(--text3); margin-top: 8px;
  letter-spacing: .08em; font-weight: 500;
}

.iw-diff {
  text-align: center; margin-top: 20px;
  font-size: .95rem; font-weight: 600;
  letter-spacing: .06em; padding-top: 16px;
  border-top: 1px dashed var(--border);
}

/* Parameter Cards Grid */
.iw-params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 12px;
}

.iw-param-card {
  background: rgba(0,0,0,0.3); border: 1px solid var(--border-s);
  border-radius: 14px; padding: 16px; text-align: center;
  transition: border-color .3s;
}
.iw-param-card:hover { border-color: var(--gold); }

.iw-param-lbl {
  font-size: .68rem; font-weight: 700; letter-spacing: .15em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 4px;
}

.iw-param-ar {
  font-family: var(--arabic); font-size: 1.05rem;
  color: var(--text3); margin-bottom: 10px;
}

.iw-param-val {
  font-family: var(--mono); font-size: 1.25rem;
  font-weight: 700; color: #fff;
}
.iw-param-val.pos { color: var(--green); text-shadow: 0 0 8px rgba(100,217,156,.35); }
.iw-param-val.neg { color: var(--amber); text-shadow: 0 0 8px rgba(252,177,59,.35); }

/* Tabel Istiwa */
.iw-col { color: var(--gold2) !important; font-weight: 600; }
```

---

### FASE 4 — Modifikasi `main.js`

**Task 4.1** — Tambah `tickIstiwa()` di interval yang sama dengan `tickCountdown()`:

```js
// Baris 149-150 saat ini:
tickCountdown();
setInterval(tickCountdown, 1000);

// Menjadi:
tickCountdown();
tickIstiwa();
setInterval(() => { tickCountdown(); tickIstiwa(); }, 1000);
```

**Task 4.2** — Tambah `renderIstiwa()` di dalam `renderAll()` di `ui.js`:

```js
function renderAll() {
  renderPrayer();
  renderHijri();
  renderMoon();
  renderQibla();
  renderKonversi();
  renderImsakiyah();
  renderEphemeris();
  renderIstiwa(); // ← TAMBAH
}
```

---

### FASE 5 — Modifikasi `prayer.js`

**Task 5.1** — Pastikan `prayerTimes()` me-return `eqt` dan `noonRaw` (sudah ada):

```js
return {
  // ... waktu sholat ...
  noonRaw: noon,
  dec: sun.Dec,
  eqt: sun.EqT   // ← pastikan ini sudah ada (sudah ada di v2.3.2)
};
```

Tidak perlu modifikasi — nilai ini sudah ada.

---

## 5. Urutan Pengerjaan & Estimasi Waktu

| # | Task | File | Estimasi |
|---|---|---|---|
| 1 | Buat `js/istiwa.js` lengkap | istiwa.js (BARU) | 45 menit |
| 2 | Tambah tab + panel HTML | index.html | 20 menit |
| 3 | Tambah CSS class baru | style.css | 20 menit |
| 4 | Modifikasi main.js (tick + render) | main.js, ui.js | 10 menit |
| 5 | Testing & verifikasi kalkulasi | — | 15 menit |
| **Total** | | | **~110 menit** |

---

## 6. Urutan Script Loading (Final)

```html
<script src="js/math.js"></script>      <!-- Layer 1: Utilities -->
<script src="js/astro.js"></script>     <!-- Layer 2: Astronomical calc -->
<script src="js/prayer.js"></script>    <!-- Layer 3: Prayer times + cache -->
<script src="js/hilal.js"></script>     <!-- Layer 3: Hilal calc -->
<script src="js/ui.js"></script>        <!-- Layer 4: Panel renders -->
<script src="js/copypdf.js"></script>   <!-- Layer 5: Export -->
<script src="js/istiwa.js"></script>    <!-- Layer 5: Istiwa module (BARU) -->
<script src="js/main.js"></script>      <!-- Layer 6: Init (HARUS TERAKHIR) -->
```

---

## 7. Verifikasi & Testing

### 7.1 Verifikasi Manual (Kalkulasi)

Untuk Kencong (LNG=113.4203, TZ=7), pada tanggal tertentu:
1. Buka tab Ephemeris → catat nilai EqT
2. Hitung manual: Koreksi Bujur = (113.4203 - 105) / 15 × 60 = **33.68 menit**
3. Total Selisih = 33.68 + EqT (menit)
4. Bandingkan dengan nilai di panel Istiwa
5. Bandingkan waktu Dzuhur Istiwa dengan nilai `noonRaw - 12` × 60

### 7.2 Verifikasi Konverter

| Input (Lokal) | Expected Istiwa (Kencong, EqT≈+3.2 mnt) |
|---|---|
| 12:00:00 WIB | 12:36:53 Istiwa |
| 13:00:00 WIB | 13:36:53 Istiwa |
| 06:00:00 WIB | 06:36:53 Istiwa |

### 7.3 Cek Regresi

- [ ] Panel Sholat masih berfungsi normal
- [ ] Countdown tidak lag
- [ ] Panel Hilal, Ephemeris, Imsakiyah masih normal
- [ ] GPS detect masih bekerja
- [ ] Responsif di mobile

---

## 8. Checklist Pre-Deploy

- [ ] `istiwa.js` sudah di-load sebelum `main.js`
- [ ] `renderIstiwa()` dipanggil di `renderAll()`
- [ ] `tickIstiwa()` dipanggil di interval 1 detik
- [ ] Semua ID HTML unik (tidak bentrok dengan modul lain)
- [ ] CSS baru tidak override style yang sudah ada
- [ ] Versi footer di-update: `v2.4` → `v2.5`
- [ ] Git commit dengan pesan deskriptif
- [ ] Vercel auto-deploy berhasil

---

## 9. Commit Strategy

```bash
# Commit 1: Core module
git add public/js/istiwa.js
git commit -m "feat(istiwa): add Jam Istiwa core module (istiwa.js)"

# Commit 2: UI integration
git add public/index.html public/css/style.css
git commit -m "feat(istiwa): add Istiwa tab, panel HTML, and CSS"

# Commit 3: Wiring
git add public/js/main.js public/js/ui.js
git commit -m "feat(istiwa): wire renderIstiwa() and tickIstiwa() to main loop"

# Tag versi
git tag -a v2.5.0 -m "Al-Fajri v2.5.0 - Modul Jam Istiwa"
git push origin main --tags
```

---

*DevPlan ini disiapkan oleh: Antigravity AI Assistant*
*Untuk: Lembaga Falakiyah PCNU Kencong — Proyek Al-Fajri v2.5.0*
