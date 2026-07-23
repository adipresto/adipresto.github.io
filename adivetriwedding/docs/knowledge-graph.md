# Knowledge Graph — Undangan Online

Dokumen ini adalah representasi teks dari knowledge graph proyek. Berisi daftar konsep (node) dan relasi antar konsep (edge).

**Versi saat ini: v1.11**

---

## Changelog

### v1.11 — 2026-07-23
- Tambah node impl: `impl-compress-script` — skrip `scripts/compress-image.py` (Python + Pillow) untuk kompres gambar koleksi film-roll: resize ke lebar 667px, JPEG kualitas 82, dukung batch/suffix/output-dir
- Kompresi `photos/6.JPG` (asli 3910×5865, ~10.73MB) ke 667×1000 kualitas JPEG 82 (~76KB) memakai `impl-compress-script`
- Tambah 2 edge baru: `ec-filesize` → `impl-compress-script`, `film-roll` → `impl-compress-script`
- Total: 55 node · 71 edge

### v1.10 — 2026-07-22
- Tambah node impl: `impl-akad-responsive-bg` — background `slide-akad` kini responsive: foto portrait `photos/1.JPG` (667×1000) untuk mobile, foto landscape `photos/1desktop.JPG` (667×451) untuk desktop via `@media (min-width: 701px)`, breakpoint sama dengan yang dipakai `impl-hero-split` dan `impl-couple-cards`
- Update node impl: `impl-couple-cards` — nama mempelai & orang tua sudah diisi data aktual (M. Rizky Adi Prasetyo / Divetri Ayu Rahmawati beserta nama orang tua masing-masing), tidak lagi placeholder
- Update node impl: `slide-hero` — judul `A & A` diganti gambar SVG (`assets/tittle_adidivetri.svg`) via elemen `<img class="title-svg">`, menggantikan teks `<h1>`
- Tambah 1 edge baru: `slide-akad` → `impl-akad-responsive-bg`
- Total: 54 node · 69 edge

### v1.9 — 2026-07-22
- Tambah node impl: `impl-couple-cards` — dua kartu berdampingan di `slide-akad`: kartu mempelai pria (nama + nama orang tua) dan kartu mempelai wanita (nama + nama orang tua), grid 2 kolom, stack vertikal di mobile (<700px). Data masih placeholder, menunggu nama aktual dari user.
- Update node komponen: `slide-akad` — deskripsi diperluas, kini berisi dua kartu mempelai di atas kartu waktu & tempat akad
- Tambah 1 edge baru: `slide-akad` → `impl-couple-cards`
- Total: 53 node · 68 edge
- Hapus `docs/ringkasan.md` dan `docs/requirements.md` sebagai sumber requirements terpisah — `docs/knowledge-graph.md` kini jadi satu-satunya sumber; `ringkasan.md` diregenerasi sebagai ringkasan naratif otomatis dari isi file ini

### v1.8 — 2026-07-22
- Kompresi `photos/1.JPG` (asli 3072×4608, ~8MB) ke 667×1000 kualitas JPEG 82 (~102KB) — menerapkan solusi `ec-filesize`
- Tambah node komponen: `slide-akad` — slide kedua ("Akad Nikah") di `page-filmroll-demo`, background foto full-bleed (`photos/1.JPG`) dengan overlay gelap `rgba(0,0,0,0.4)`, pola sama seperti `slide-hero` tapi tanpa split-screen/mask-image
- Tambah 2 edge baru: `page-filmroll-demo` → `slide-akad`, `slide-akad` → `ec-filesize`
- Total: 52 node · 67 edge

### v1.7 — 2026-07-22
- Tambah node komponen: `slide-hero` — slide pertama (cover) di `page-filmroll-demo`, layout split-screen: foto full-bleed di kanan, teks undangan di area hitam kiri
- Tambah node impl: `impl-hero-split` — teknik split-screen dengan CSS `mask-image` linear-gradient untuk transisi halus hitam↔foto (bukan garis tegas); responsive: stack vertikal di mobile (<700px), foto di atas dengan fade ke bawah
- Tambah node tech: `tech-maskimage` — CSS `mask-image`/`-webkit-mask-image` dengan linear-gradient untuk fade transparansi elemen secara halus
- Tambah 3 edge baru: `page-filmroll-demo` → `slide-hero`, `slide-hero` → `impl-hero-split`, `impl-hero-split` → `tech-maskimage`
- Total: 51 node · 65 edge

### v1.6 — 2026-07-22
- Tambah node komponen: `slide-galeri` — slide terakhir di `page-filmroll-demo`, berisi film-roll-loop sebagai konten (bukan lagi background)
- Update node halaman: `page-filmroll-demo` — deskripsi diubah, film roll tidak lagi jadi background fixed di seluruh halaman, dipindah jadi konten slide "Galeri" di urutan paling akhir; slide lain (Undangan, Akad, Resepsi) kini berlatar polos gelap `#0d0d0d`
- Update node impl: `impl-filmroll-bg` — deskripsi diubah dari "menggantikan video sebagai background" menjadi "film roll dipindah dari background fixed menjadi konten slide Galeri tersendiri"
- Hapus edge `page-filmroll-demo` → `impl-gpu` (workaround GPU-layer untuk fixed background sudah tidak dipakai, karena tidak ada lagi background fixed di halaman ini)
- Hapus edge `impl-filmroll-bg` → `video-bg` (film roll tidak lagi berperan menggantikan video sebagai background)
- Tambah 2 edge baru: `page-filmroll-demo` → `slide-galeri`, `slide-galeri` → `film-roll`
- Koreksi hitungan edge: total edge aktual sebelumnya 62 (bukan 63 seperti tertulis di changelog versi lama) — dihitung ulang dari isi tabel edge
- Total: 48 node · 62 edge

### v1.5 — 2026-07-22
- Update node halaman: `page-filmroll-demo` — dipindahkan dari `pages/filmroll-bg-demo.html` menjadi `index.html` di root project (entry point utama), path relatif font & foto disesuaikan (`fonts/...`, `components/...` tanpa prefix `../`)
- Total: 47 node · 63 edge

### v1.4 — 2026-07-22
- Update node impl: `impl-typography` — font Dream Avenue Regular pindah dari CDN pihak ketiga (cdnfonts.com, gagal load) ke file lokal `fonts/dream-avenue-regular.otf` via `@font-face`
- Tambah node tech: `tech-fontface` — `@font-face` lokal untuk custom font, path relatif dari halaman (mis. `../fonts/...`)
- Tambah 1 edge baru: `impl-typography` → `tech-fontface`
- Total: 47 node · 63 edge

### v1.3 — 2026-07-22
- Tambah node impl: `impl-typography` — tipografi & palet warna kartu konten `page-filmroll-demo` (Dream Avenue Regular untuk header, Source Serif Pro untuk teks kecil; palet maroon `#5a1919`/`#6c4440@63%` didokumentasikan sebagai palet resmi, warna aktif sementara putih)
- Tambah 1 edge baru: `page-filmroll-demo` → `impl-typography`
- Total: 46 node · 62 edge

### v1.2 — 2026-07-19
- Tambah node halaman: `page-filter-preview` — `pages/film-filter-preview.html`
- Tambah node impl: `impl-film-filter` — sistem filter kamera film (CSS filter, grain, vignette, light leak)
- Tambah 4 edge baru: relasi root → preview, preview → film-roll, preview → impl-film-filter, film-roll → impl-film-filter
- Total: 45 node · 61 edge

### v1.1 — 2026-07-19
- Tambah tipe node baru: **Halaman** (`page`)
- Tambah node: `page-filmroll-demo` — halaman `pages/filmroll-bg-demo.html`
- Tambah node impl: `impl-filmroll-bg`, `impl-eager`, `impl-touch-pause`, `impl-vis-pause`
- Tambah 15 edge baru: relasi halaman → komponen, film-roll → impl baru, solusi untuk `ec-lazy`, `ec-hovermob`, `ec-battery`
- Total: 43 node · 57 edge

### v1.0 — 2026-07-19
- Versi awal: semua requirements, edge case, implementasi, dan teknologi dari `docs/requirements.md` dan `docs/filmrollloop-requirements.md`
- Total: 38 node · 42 edge

---

## Node

### Root
| ID | Label |
|----|-------|
| root | Undangan Online |

### Komponen / Fitur
| ID | Label | Deskripsi |
|----|-------|-----------|
| video-bg | Video Background | Video kompilasi ringan sebagai latar belakang halaman. Posisi fixed saat halaman di-scroll. |
| film-roll | Film Roll Loop | Strip foto bergerak horizontal secara seamless dan looping. Path: `components/film-roll-loop/film-roll-loop.html` |
| slide-scroll | Konten Slide | Konten isi halaman bergeser seperti slide presentasi saat user melakukan scroll. |
| slide-galeri | Slide Galeri | Slide terakhir di `page-filmroll-demo` yang menampilkan film-roll-loop sebagai konten (bukan lagi background fixed). |
| slide-hero | Slide Hero (Cover) | Slide pertama di `page-filmroll-demo` — layout split-screen: foto full-bleed di kanan, teks undangan di area hitam kiri. Judul pasangan pakai gambar SVG (`assets/tittle_adidivetri.svg`), bukan teks `<h1>`. Responsive: stack vertikal di mobile. |
| slide-akad | Slide Akad Nikah | Slide kedua di `page-filmroll-demo` — background foto full-bleed (`photos/1.JPG`) dengan overlay gelap. Isi: dua kartu mempelai berdampingan (pria & wanita, masing-masing nama + nama orang tua) di atas kartu info waktu & tempat akad. |

### Halaman
| ID | Label | Deskripsi |
|----|-------|-----------|
| page-filmroll-demo | Halaman Film Roll BG | Halaman utama undangan (entry point proyek), path `index.html`. Slide Undangan/Akad/Resepsi berlatar polos gelap; film roll loop kini jadi konten di slide terakhir "Galeri" (`slide-galeri`), bukan lagi background fixed di seluruh halaman. |
| page-filter-preview | Halaman Film Filter Preview | Halaman preview interaktif 6 preset filter kamera film untuk komponen film roll. Path: `pages/film-filter-preview.html` |

### Edge Case
| ID | Label | Deskripsi |
|----|-------|-----------|
| ec-autoplay | Autoplay Restriction | iOS/Android butuh `muted` + `playsinline` agar autoplay berjalan tanpa interaksi user. Tanpa itu video stuck di frame pertama. |
| ec-ios-fixed | iOS Fixed Bug | Bug Safari lama: video fixed "lepas" saat scroll momentum (rubber-band). Fix: `transform: translateZ(0)` atau `position: sticky` pada parent. |
| ec-viewport | Viewport Height | Mobile browser me-resize viewport saat scroll (address bar collapse/expand). `100vh` bisa keliru — gunakan `100dvh` dengan fallback `100vh`. |
| ec-reduced | Reduced Motion | `prefers-reduced-motion`: video dan transisi harus di-tone down atau disabled demi aksesibilitas dan hemat resource. |
| ec-scrolljack | Scroll Jacking | Custom JS scroll merusak keyboard navigation (PageDown, Space), screen reader, dan trackpad sensitivity. |
| ec-videofail | Video Load Gagal | Jaringan putus di tengah load — area background jadi blank/broken. Harus ada fallback ke poster/gambar. |
| ec-battery | Battery & Performa | Video loop boros baterai dan bisa membuat device low-end lag. Pause jika tab tidak visible atau section tidak kelihatan. |
| ec-datasaver | Data Saver Mode | Cek `navigator.connection.saveData` — jika true, skip load video sama sekali dan tampilkan poster image saja. |
| ec-codec | Codec Compatibility | Tidak semua browser support WebM/AVI. Butuh multiple `<source>` dengan fallback MP4 yang universal. |
| ec-cls | Layout Shift (CLS) | Container video harus punya dimensi fixed dari awal agar tidak ada CLS (Cumulative Layout Shift) saat video muncul. |
| ec-snap | Scroll Snap Conflict | `scroll-snap-type: mandatory` terasa kasar dan jump di iOS. Pakai `proximity` ketimbang `mandatory` agar lebih smooth. |
| ec-fewphoto | Foto Terlalu Sedikit | Jika jumlah foto sedikit, animasi loop terlihat ngulang terlalu cepat dan tidak natural. |
| ec-speed | Kecepatan Animasi | Kecepatan animasi strip tidak proporsional dengan jumlah foto yang ada. |
| ec-altdup | Alt Text Duplikasi | Trik seamless menduplikasi seluruh list foto 2× di DOM — alt text dan konten ikut terduplikasi. |
| ec-ratio | Rasio Gambar Beda | Rasio gambar tidak seragam — `object-fit: cover` akan memotong gambar secara tidak konsisten di tiap foto. |
| ec-lazy | Lazy Load Riskan | `loading="lazy"` di dalam track bergerak horizontal riskan — foto bisa pop-in telat. Untuk <20 foto, lepas lazy agar semua preload dari awal. |
| ec-hovermob | Hover Pause Mobile | Fitur hover-to-pause animasi tidak berjalan di perangkat touchscreen/handphone. |
| ec-cors | CORS Gambar | Foto dari domain lain bisa gagal muncul di production jika layanan memblok hotlinking. Aman jika host sendiri. |
| ec-filesize | Ukuran File Gambar | File gambar berukuran besar memperlambat load seluruh strip foto. |

### Implementasi
| ID | Label | Deskripsi |
|----|-------|-----------|
| impl-codec | WebM + MP4 Fallback | Encode video ke WebM sebagai primary source, MP4 sebagai fallback universal yang support semua browser. |
| impl-720p | Max Resolusi 720p | Resolusi video tidak lebih dari 720p untuk menjaga ukuran file tetap ringan dan cepat di-load. |
| impl-loop | Loop Pendek 5–10 detik | Durasi loop video dibuat pendek (5–10 detik) agar file video tetap kecil dan mudah di-buffer. |
| impl-audio | Strip Audio Track | Hapus audio track dari video — tidak dibutuhkan untuk background dan hanya menambah ukuran file. |
| impl-preload | preload="metadata" | Gunakan `preload="metadata"` bukan `"auto"` agar browser tidak langsung download full video sebelum user interaksi. |
| impl-poster | Poster Image Fallback | Gambar terkompresi sebagai fallback visual sebelum video ke-load atau saat video gagal load sama sekali. |
| impl-conn | Deteksi Koneksi | Gunakan `navigator.connection.effectiveType` atau `saveData` — jika koneksi lemah atau save-data aktif, tampilkan poster saja. |
| impl-gpu | GPU Layer Force | `transform: translateZ(0)` untuk memaksa GPU compositing layer — workaround untuk iOS Safari fixed scroll bug. |
| impl-dvh | 100dvh + fallback 100vh | Gunakan `100dvh` (dynamic viewport height) sebagai ukuran viewport yang benar di mobile, dengan fallback `100vh`. |
| impl-filmroll-bg | Film Roll sebagai BG Alternatif | (Historis) Awalnya film roll loop dipakai menggantikan `<video>` sebagai background bergerak — eliminasi codec issue, autoplay restriction, dan file encoding. Kini dipindah dari background fixed menjadi konten slide Galeri tersendiri (lihat `slide-galeri`). |
| impl-eager | loading="eager" di Track Bergerak | Ganti `loading="lazy"` dengan `loading="eager"` di dalam strip horizontal agar semua foto preload dari awal, hindari pop-in telat. |
| impl-touch-pause | Touch Pause/Resume Mobile | `touchstart`/`touchend` untuk pause dan resume animasi di touchscreen — pengganti `:hover` yang tidak berjalan di mobile. |
| impl-vis-pause | Pause via visibilitychange | Pause animasi film roll saat tab tidak aktif via `document.visibilitychange` untuk hemat baterai dan resource. |
| impl-film-filter | Film Filter System | Sistem filter kamera film pada film roll: CSS filter per-foto, canvas grain overlay (mix-blend-mode: overlay), vignette radial-gradient per-frame, light leak gradient. Default preset: Portra 400. |
| impl-typography | Tipografi & Palet Warna Kartu | Header (`h1`/`h2`) pakai Dream Avenue Regular via file lokal `fonts/dream-avenue-regular.otf`, teks kecil pakai Source Serif Pro (Google Fonts). Palet resmi terdokumentasi: header `#5a1919`, teks kecil `#6c4440` opacity 63%; warna aktif saat ini sementara putih menunggu keputusan final. |
| impl-hero-split | Split-Screen Hero | Teknik split-screen di `slide-hero`: foto absolute-position di belakang, teks di kolom kiri (~46% lebar). Transisi hitam↔foto pakai CSS `mask-image` linear-gradient, bukan garis tegas. Responsive: di layar <700px berubah jadi stack vertikal (foto di atas, fade ke bawah, teks di bawahnya). |
| impl-couple-cards | Dua Kartu Mempelai | Dua kartu berdampingan di `slide-akad` (CSS grid 2 kolom): kartu mempelai pria (M. Rizky Adi Prasetyo, putra dari (Alm.) Bapak Suharto & (Almh.) Ibu Lastri) dan kartu mempelai wanita (Divetri Ayu Rahmawati, putri dari Bapak Slamet Riyadi & (Almh.) Ibu Ning). Responsive: stack 1 kolom di layar <700px. |
| impl-akad-responsive-bg | Background Akad Responsive | Background `slide-akad` beda per breakpoint: foto portrait `photos/1.JPG` (667×1000) untuk mobile, foto landscape `photos/1desktop.JPG` (667×451) untuk desktop, di-switch via `@media (min-width: 701px)`. |
| impl-compress-script | Skrip Kompresi Gambar | `scripts/compress-image.py` — skrip Python (Pillow) untuk kompres gambar koleksi film-roll: resize ke lebar target (default 667px) dan re-encode JPEG kualitas 82. Dipakai untuk `photos/6.JPG` (10.73MB → 76KB, 667×1000). |

### Teknologi / API
| ID | Label | Deskripsi |
|----|-------|-----------|
| tech-muted | muted + playsinline | Atribut HTML wajib di elemen `<video>` agar autoplay berjalan di iOS dan Android tanpa interaksi user. |
| tech-vis | visibilitychange | Event `document.visibilitychange` — digunakan untuk pause video saat tab/halaman tidak aktif/visible. |
| tech-observer | IntersectionObserver | Web API untuk mendeteksi apakah section video terlihat di viewport — pause jika tidak terlihat, hemat baterai. |
| tech-savedata | navigator.connection | `navigator.connection.saveData` dan `effectiveType` untuk deteksi mode hemat data dan kecepatan koneksi user. |
| tech-snap | scroll-snap: proximity | CSS `scroll-snap-type: proximity` lebih smooth dan tidak kaku dibanding `mandatory`, terutama di iOS Safari. |
| tech-objfit | object-fit: cover | CSS property untuk mengisi kontainer gambar secara penuh — akan memotong bagian gambar jika rasio tidak sesuai. |
| tech-fontface | @font-face lokal | CSS `@font-face` untuk load file font custom (.otf/.woff) dari folder `fonts/` lokal — alternatif CDN pihak ketiga yang bisa gagal load. |
| tech-maskimage | mask-image gradient | CSS `mask-image`/`-webkit-mask-image` dengan `linear-gradient` untuk fade transparansi elemen secara halus — dipakai untuk blend foto hero ke background hitam tanpa garis tegas. |

---

## Edge (Relasi)

### Root → Komponen / Halaman
- `root` → `page-filter-preview`
- `root` → `video-bg`
- `root` → `film-roll`
- `root` → `slide-scroll`
- `root` → `page-filmroll-demo`

### Video Background → Edge Case
- `video-bg` → `ec-autoplay`
- `video-bg` → `ec-ios-fixed`
- `video-bg` → `ec-viewport`
- `video-bg` → `ec-reduced`
- `video-bg` → `ec-scrolljack`
- `video-bg` → `ec-videofail`
- `video-bg` → `ec-battery`
- `video-bg` → `ec-datasaver`
- `video-bg` → `ec-codec`
- `video-bg` → `ec-cls`
- `video-bg` → `ec-snap`

### Video Background → Implementasi
- `video-bg` → `impl-codec`
- `video-bg` → `impl-720p`
- `video-bg` → `impl-loop`
- `video-bg` → `impl-audio`
- `video-bg` → `impl-preload`
- `video-bg` → `impl-poster`
- `video-bg` → `impl-conn`

### Film Roll Loop → Edge Case
- `film-roll` → `ec-fewphoto`
- `film-roll` → `ec-speed`
- `film-roll` → `ec-altdup`
- `film-roll` → `ec-reduced`
- `film-roll` → `ec-ratio`
- `film-roll` → `ec-lazy`
- `film-roll` → `ec-hovermob`
- `film-roll` → `ec-cors`
- `film-roll` → `ec-filesize`
- `film-roll` → `impl-compress-script`

### Edge Case → Solusi / Teknologi
- `ec-autoplay` → `tech-muted`
- `ec-ios-fixed` → `impl-gpu`
- `ec-viewport` → `impl-dvh`
- `ec-battery` → `tech-vis`
- `ec-battery` → `tech-observer`
- `ec-datasaver` → `tech-savedata`
- `ec-datasaver` → `impl-conn`
- `ec-codec` → `impl-codec`
- `ec-snap` → `tech-snap`
- `ec-ratio` → `tech-objfit`
- `ec-videofail` → `impl-poster`
- `ec-filesize` → `impl-compress-script`
- `impl-conn` → `tech-savedata`

### Halaman → Komponen & Implementasi
- `page-filter-preview` → `film-roll`
- `page-filter-preview` → `impl-film-filter`
- `page-filmroll-demo` → `film-roll`
- `page-filmroll-demo` → `impl-filmroll-bg`
- `page-filmroll-demo` → `impl-dvh`
- `page-filmroll-demo` → `impl-typography`
- `page-filmroll-demo` → `slide-galeri`
- `slide-galeri` → `film-roll`
- `page-filmroll-demo` → `slide-hero`
- `slide-hero` → `impl-hero-split`
- `impl-hero-split` → `tech-maskimage`
- `impl-typography` → `tech-fontface`
- `page-filmroll-demo` → `slide-akad`
- `slide-akad` → `ec-filesize`
- `slide-akad` → `impl-couple-cards`
- `slide-akad` → `impl-akad-responsive-bg`

### Film Roll Loop → Implementasi Baru
- `film-roll` → `impl-film-filter`
- `film-roll` → `impl-filmroll-bg`
- `film-roll` → `impl-eager`
- `film-roll` → `impl-touch-pause`
- `film-roll` → `impl-vis-pause`

### Implementasi Baru → Edge Case & Teknologi
- `ec-lazy` → `impl-eager`
- `ec-hovermob` → `impl-touch-pause`
- `ec-battery` → `impl-vis-pause`
- `impl-vis-pause` → `tech-vis`
