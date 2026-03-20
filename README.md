# Alfajri

Sistem Rukyat Digital berbasis Ilmu Falak.

## Jalankan lokal
```bash
npm install
npm run dev
```

## Deploy ke Vercel
1. Push isi folder ini ke GitHub.
2. Import repository ke Vercel.
3. Framework preset: Other.
4. Build command kosongkan.
5. Output directory: `public`.
6. Deploy.

## Struktur penting
- `public/index.html` = landing page
- `public/dashboard/index.html` = dashboard utama
- `public/map/index.html` = peta visibilitas hilal Indonesia
- `public/timeline/index.html` = timeline 1 bulan
- `public/core/` = engine falak
- `public/js/` = UI, PDF, share, lokasi
