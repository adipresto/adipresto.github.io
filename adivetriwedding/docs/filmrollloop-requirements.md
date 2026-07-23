# Location
components/film-roll-loop/film-roll-loop.html

# Requirement
Sebagai elemen kompilasi gambar potrait dengan dimensi yang sama, nanti akan dijadikan konten background sebuah halaman, posisinya ditengah tidak mengisi tinggi halaman, hanya sekitar 3/4 tinggi halaman. 

# Masalah implementasi
Karena film roll bisa di klik untuk melihat foto, kelihatannya akan bentrok dengan interaksi konten presentasi

# Edge Cases
1. Jumlah foto sedikit, kelihatan animasinya ngulang cepet
2. Kecepatan animasi enggak terlalu proporsional
3. alt text dna kontent terduplikasi, karena trik seamlesnya duplikasi ke seluruh list foto 2x di DOM
4. `prefers-reduced-motion` sekarang animasinya cuma di disable, tapi track tetap render foto dobel
5. rasio gambar yang enggak seragam, `object-fit: cover` bakal potong bagian gambar secara enggak konsisten
6. gambar lambat load / broken link `loading="lazy"` didalam track yang terus bergerak horizontal itu agak riskan, foto yang baru masuk viewport bisa pop-in telat karena belum sempat di load duluan. Untuk foto <20 mending lepaslazy, agak semua di preload dari awal
7. hover to pause enggak jalan di handphone
8. sumber gambar dari domain lain (cors), kalau foto di host di layanan yang block hotlinking, gambar bisa gagal muncul di prod meski aman di local. Aman aja kalau host sendiri
9. ukuran file gambar besar

# Capaian

## Komponen standalone
`components/film-roll-loop/film-roll-loop.html` — selesai. Termasuk:
- Seamless loop dengan duplikasi DOM + `translateX(-50%)`
- Durasi animasi proporsional terhadap jumlah foto (`SECS_PER_FRAME × n`)
- `buildPhotoList()` otomatis perbanyak foto jika < 8 (edge case #1 sebagian ditangani)
- `prefers-reduced-motion`: animasi dimatikan, set duplikasi disembunyikan via `aria-hidden` (edge case #4 ditangani)
- Touch pause/resume via `touchstart`/`touchend` (edge case #7 ditangani)

## Integrasi sebagai background halaman
`pages/filmroll-bg-demo.html` — selesai. Film roll dipakai sebagai pengganti video background:
- Posisi fixed via `.bg-layer { position: fixed }` + `transform: translateZ(0)` untuk GPU layer
- Tinggi strip `75vh` / `75dvh` sesuai requirement ~3/4 halaman
- Overlay `rgba(0,0,0,0.45)` agar konten terbaca
- `loading="eager"` menggantikan `loading="lazy"` (edge case #6 ditangani)
- Pause saat tab tidak aktif via `visibilitychange` (hemat baterai)
- Film roll ditempatkan di `aria-hidden` layer — konflik klik dengan slide konten dihindari (masalah implementasi di-bypass, bukan diselesaikan secara formal)

## Edge cases yang masih terbuka
- #2: kecepatan animasi belum dikalibrasi berdasarkan lebar frame aktual (hanya per-foto, bukan per-pixel)
- #3: alt text set duplikasi masih di DOM (sudah `aria-hidden`, tapi tetap ada di source)
- #5: rasio gambar tidak seragam — belum ada normalisasi
- #8: CORS / hotlink blocking — bergantung pada hosting foto, belum ada fallback broken-image
- #9: ukuran file gambar — belum ada kompresi atau size guideline untuk foto input
