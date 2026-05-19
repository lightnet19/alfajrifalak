# 🌙 Al-Fajri Falak — Sistem Hisab Astronomi Islam Modern & Klasik

> ✨ Aplikasi web *client-side* premium untuk perhitungan hisab astronomi Islam komprehensif, dikembangkan khusus atas arahan dan kebutuhan **Lembaga Falakiyah PCNU Kencong**.  
> **Versi:** `v3.0.1` | **Rilis:** `2026-05-19`

Al-Fajri Falak menggabungkan ketelitian sains modern berbasis algoritma astronomi tingkat tinggi **Jean Meeus (*Astronomical Algorithms*)** dengan metodologi perhitungan salaf klasik **Irsyadul Murid**. Sistem ini sepenuhnya berjalan di sisi klien (*client-side*) tanpa *backend overhead*, menawarkan visualisasi interaktif yang responsif, serta terintegrasi penuh dengan penentuan lokasi berbasis GPS.

---

## 🕌 Fitur Utama & Modul Sistem

| Modul | Deskripsi Teknikal & Keterangan |
|---|---|
| 🕌 **Waktu Sholat & Imsakiyah** | Perhitungan waktu Imsak, Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, dan Isya secara real-time. Dilengkapi countdown dinamis dan tabel bulanan Imsakiyah. |
| 🕰️ **Jam Istiwa (True Solar Time)** | Penentuan Zawal real-time berbasis bujur lokal pengamat secara presisi dengan pendeteksian offset "Maju/Lambat" terhadap WIB (GMT+7) dan konverter waktu Istiwa ↔ WIB. |
| 🌒 **Hisab & Grafik Hilal** | Perhitungan Ijtima' (Astronomis/Lokal), Tinggi Hilal (Hakiki/Terbias), Elongasi, Umur Bulan, serta Kriteria Visibilitas (IRNU, Odeh, Yallop). Dilengkapi **Grafik Visibilitas 12 Bulan** interaktif menggunakan *Chart.js*. |
| 🌗 **Modul Gerhana (Solar & Lunar)** | Deteksi gerhana Matahari & Bulan (semua jenis: Total, Cincin, Sebagian, Penumbral) dalam rentang 2 tahun ke depan lengkap dengan waktu kontak global (C1-C4) dan magnitudo maksimum berbasis Jean Meeus Ch. 54-55. |
| 🪐 **Ephemeris Detail Toposentris** | Tabel parameter data posisi benda langit super detail (geosentris vs toposentris) mencakup deklinasi, *Hour Angle*, jarak observer, semidiameter, horizontal parallax, altitude, azimuth, refraksi Bennett, dan tinggi terbias. |
| 🌌 **Jam Astronomi (Sidereal Time)**| Jam real-time *Greenwich Mean Sidereal Time* (GMST) dan *Local Sidereal Time* (LST) beserta pemantauan koordinat azimut/altitude Matahari & Bulan setiap detik. |
| 🧭 **Arah Kiblat & Geodetik** | Kompas geodetik interaktif untuk menentukan arah Ka'bah dari lokasi pengamat secara real-time lengkap dengan garis arah kiblat dan jarak langsung ke Makkah. |
| 📅 **Kalender & Konversi Tanggal** | Konversi kalender dua arah Masehi ↔ Hijriyah ↔ Julian Day lengkap dengan sistem penanggalan weton pasaran Jawa secara otomatis. |

---

## ⚙️ Keunggulan & Konfigurasi Fleksibel

1. **Multi-Algoritma Waktu Sholat**:
   - 🛰️ **Jean Meeus (Astronomi Modern)**: Tingkat presisi sangat tinggi berbasis kalkulasi orbital matahari matematis modern.
   - 📖 **Irsyadul Murid (Salaf Klasik)**: Perhitungan taqribi tradisional menggunakan kaidah kitab kuning lokal Lembaga Falakiyah NU Kencong.
2. **Ihtiyat (Kehati-hatian) Dinamis**: Parameter waktu pengaman sholat yang dapat dikonfigurasi secara leluasa (0 hingga 10 menit).
3. **Integrasi GPS Terpadu**: Deteksi otomatis koordinat Lintang (`LAT`), Bujur (`LNG`), dan Elevasi (`ELEV`) melalui geolocation API untuk akurasi astronomis terbaik.
4. **Desain Premium & Glassmorphism**: Antarmuka responsif yang memukau dengan transisi halus, tab dinamis, visualisasi grafik interaktif, dan kontrol adaptif untuk semua jenis layar (Desktop & Mobile).
5. **Ekspor & Berbagi Instan**: Kemampuan menyalin teks perhitungan, melakukan pencetakan langsung, atau mengunduh laporan PDF profesional secara instan.

---

## 🔬 Dasar Algoritma & Akurasi

*   **Jean Meeus — *Astronomical Algorithms*** (Chapter 12, 22, 25, 47, 48, 54, 55).
*   Suku Koreksi Bulan: **60+ suku lintang/bujur dan 30+ suku radius**.
*   **Koreksi Atmosfer & Toposentrik**: Refraksi atmosfer Bennett (1982), horizontal parallax, semi-diameter dinamis, dan Delta-T dinamis.
*   **Akurasi Tinggi**: Terverifikasi selisih ≤ 2 menit dari catalog gerhana NASA dan jadwal hisab resmi falakiyah nasional.

---

## 🚀 Panduan Deploy Lokal

Aplikasi ini dibangun tanpa pustaka kompilasi berat, sehingga sangat mudah dijalankan di lingkungan lokal Anda:

### 1. Kloning Repositori
```bash
git clone https://github.com/lightnet19/alfajrifalak.git
cd alfajrifalak
```

### 2. Jalankan Dev Server (Vite / Live Server)
Karena aplikasi ini murni client-side, Anda bisa langsung membukanya di browser atau menjalankannya melalui server statis seperti Vite untuk modulasi yang cepat:
```bash
npm run dev
# Atau langsung buka index.html di live server pilihan Anda
```

### 3. Deploy Otomatis (Vercel/Netlify)
Setiap perubahan yang didorong (*push*) ke branch `main` akan langsung di-deploy secara otomatis melalui integrasi CI/CD Vercel.

---

## 🔌 Integrasi & API SDK (Client-Side)

Karena aplikasi ini berjalan 100% di sisi klien (*client-side*), Al-Fajri menyediakan tiga cara modular bagi pengembang aplikasi lain untuk mengintegrasikan atau mengambil data perhitungan falakiyah secara gratis dan instan:

### 1. Deep Link & Query Parameter API
Anda dapat mengarahkan pengguna atau membuka halaman Al-Fajri dengan parameter kustom via URL. Sistem akan otomatis mengisi form, melakukan kalkulasi, dan memicu tab yang diinginkan:
```
https://alfajri-falak.vercel.app/?lat=-8.2664&lng=113.4203&elev=11&tz=7&markaz=Kencong&algo=irsyadulmurid&ihtiyat=3&tab=istiwa
```
*   **Parameter yang didukung**: `lat`, `lng`, `elev`, `tz`, `markaz` (di-encode), `algo` (`jeanmeeus`/`irsyadulmurid`), `ihtiyat` (0-10), dan `tab` (`sholat`/`hilal`/`istiwa`/`gerhana`/`astroclock`/dll).

### 2. JavaScript SDK (`window.AlFajriAPI`)
Jika Anda memuat skrip Al-Fajri secara langsung atau menulis skrip konsol, Anda dapat mengakses fungsi kalkulasi astronomi siap pakai melalui namespace global:
```javascript
// Mengambil jadwal sholat hari ini
const sholat = AlFajriAPI.getPrayerTimes({ lat: -8.2664, lng: 113.4203 });
console.log(sholat.jadwal.subuh); // Output: "04:12"

// Mengambil selisih & data Jam Istiwa
const istiwa = AlFajriAPI.getIstiwa({ lat: -8.2664, lng: 113.4203 });
console.log(istiwa.koreksi.totalSelisihMenit); // Output: 34 (menit)

// Mengambil koordinat astronomi realtime (LST/GST, Sun/Moon Azimuth & Altitude)
const astro = AlFajriAPI.getAstroClock();
console.log(astro.localSiderealTime);
```

### 3. Iframe postMessage Bridge
Jika Anda ingin mengambil data secara dinamis dari website lain tanpa memicu *Cross-Origin (CORS)*, Anda dapat menyematkan Al-Fajri dalam `iframe` tersembunyi dan melakukan query data falak berbasis JSON:
```javascript
const iframe = document.createElement('iframe');
iframe.src = "https://alfajri-falak.vercel.app/";
iframe.style.display = "none";
document.body.appendChild(iframe);

// Kirim request setelah iframe siap
iframe.onload = () => {
  iframe.contentWindow.postMessage({
    source: 'AlFajriAPI_Request',
    requestId: 'req-sholat-01',
    method: 'getPrayerTimes',
    params: { lat: -8.2664, lng: 113.4203, algo: 'irsyadulmurid' }
  }, '*');
};

// Dengar respon JSON balik
window.addEventListener('message', (event) => {
  const res = event.data;
  if (res && res.source === 'AlFajriAPI_Response' && res.requestId === 'req-sholat-01') {
    console.log("Data diterima:", res.data);
  }
});
```

---

## 📄 Hak Cipta & Penggunaan

Dibuat secara profesional atas dedikasi dan permintaan resmi dari **Lembaga Falakiyah PCNU Kencong**. Semua formula hisab dan arsitektur visual dilindungi untuk mendukung dakwah islamiyah bidang ilmu falak di Indonesia.
