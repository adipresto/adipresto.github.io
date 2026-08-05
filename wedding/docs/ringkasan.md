# Ringkasan Docs

Ringkasan ini digenerate dari `docs/knowledge-graph.md` (v2.5) — dokumen itu adalah satu-satunya sumber requirements proyek. Update ringkasan ini setiap kali knowledge graph berubah.

## Permintaan Utama

Halaman undangan (`index.html`, entry point di root project) berisi beberapa slide presentasi yang bergeser saat scroll: Hero/cover, Akad Nikah, Resepsi, dan Galeri. Video kompilasi ringan sempat direncanakan sebagai latar belakang fixed, namun pendekatan itu sudah digantikan oleh film roll loop sebagai konten (bukan lagi background) di slide Galeri.

---

## Video Background — Implementasi (Historis)

Video di-encode ke WebM sebagai format utama dengan fallback MP4. Resolusi dibatasi maksimal 720p dan durasi loop dijaga 5–10 detik agar ukuran file tetap kecil. Audio track dihapus karena tidak dibutuhkan. Atribut `preload="metadata"` dipakai agar browser tidak langsung mengunduh video penuh sebelum ada interaksi. Poster image disertakan sebagai tampilan pertama sebelum video selesai load. Jika koneksi lemah atau `save-data` aktif, video tidak di-load sama sekali — hanya poster yang ditampilkan.

---

## Video Background — Edge Cases Browser & OS

Autoplay di iOS dan Android butuh atribut `muted` dan `playsinline`; tanpa keduanya video akan berhenti di frame pertama. Safari iOS punya bug lama di mana video fixed bisa "lepas" saat scroll momentum — workaround-nya adalah `transform: translateZ(0)` untuk force GPU layer, atau pakai `position: sticky` di parent. Mobile browser me-resize viewport saat address bar collapse, sehingga `100vh` bisa keliru; gunakan `100dvh` dengan fallback `100vh`. Tidak semua browser mendukung WebM, sehingga perlu beberapa `<source>` dengan MP4 sebagai fallback universal. Container video harus punya dimensi tetap dari awal agar tidak terjadi CLS saat video muncul.

---

## Video Background — Edge Cases Performa & Aksesibilitas

Jika user mengaktifkan `prefers-reduced-motion`, video dan transisi harus di-disable atau dikurangi demi aksesibilitas dan efisiensi di perangkat lemah. Video harus di-pause saat tab tidak terlihat (`document.visibilitychange`) atau saat section keluar viewport (`IntersectionObserver`) untuk menghemat baterai. Jika `navigator.connection.saveData` bernilai true, skip load video langsung. Custom JS scroll rawan merusak keyboard navigation (PageDown, Space), screen reader, dan sensitivitas trackpad — halaman harus tetap bisa dinavigasi tanpa mouse. Penggunaan `scroll-snap-type: mandatory` kerap terasa kaku di iOS; `proximity` lebih direkomendasikan. Jika video gagal load, area background tidak boleh kosong — harus ada fallback ke poster image.

---

## Film Roll Loop — Komponen

Komponen ini berada di `components/film-roll-loop/film-roll-loop.html`. Film roll berfungsi sebagai elemen kompilasi gambar portrait dengan dimensi seragam, dipakai sebagai konten slide "Galeri" (`slide-galeri`) — slide terakhir di `index.html`, bukan lagi background fixed di seluruh halaman. Halaman preview terpisah (`page-filter-preview`, di `pages/film-filter-preview.html`) menampilkan 6 preset filter kamera film untuk komponen ini. Trik seamless-loop dilakukan dengan menduplikasi seluruh daftar foto dua kali di DOM.

---

## Film Roll Loop — Implementasi

`loading="lazy"` diganti `loading="eager"` di dalam strip horizontal agar semua foto preload dari awal dan menghindari pop-in telat. Di `index.html`, film roll bisa digeser manual (drag mouse, swipe touch, scroll wheel) via `overflow-x: auto` native — autoplay-nya sendiri diubah dari CSS `@keyframes` menjadi JS `requestAnimationFrame` yang menggerakkan `scrollLeft`, supaya scroll manual user dan autoplay tidak saling menimpa. `touchstart`/`touchend`, drag mouse, dan scroll wheel dipakai untuk pause/resume autoplay sementara — pengganti `:hover` yang tidak berjalan di mobile. Autoplay di `index.html` sengaja tidak lagi di-pause via `document.visibilitychange` (sempat dicoba, tapi bikin animasi terasa berhenti/tidak reliable resume-nya) — jadi tetap jalan terus selama tidak ada interaksi manual aktif. Sistem filter kamera film (`impl-film-filter`) menerapkan CSS filter per-foto, canvas grain overlay (`mix-blend-mode: overlay`), vignette radial-gradient per-frame, dan light leak gradient — preset default Portra 400.

---

## Film Roll Loop — Edge Cases

Jika foto terlalu sedikit, animasi loop terlihat berulang terlalu cepat. Kecepatan animasi belum proporsional terhadap jumlah foto. Duplikasi DOM menyebabkan alt text dan konten ikut terduplikasi. Saat `prefers-reduced-motion` aktif, animasi dimatikan tapi track masih merender foto ganda — perlu penanganan lebih lanjut. Rasio gambar yang tidak seragam membuat `object-fit: cover` memotong gambar secara tidak konsisten. Atribut `loading="lazy"` di dalam track horizontal bergerak berisiko menyebabkan foto pop-in terlambat; untuk koleksi di bawah 20 foto sebaiknya lazy dilepas agar semua preload dari awal. Fitur hover-to-pause tidak berjalan di perangkat touchscreen. Foto yang di-host di layanan pihak ketiga yang memblokir hotlinking akan gagal muncul di production meski berjalan normal di local. Ukuran file gambar yang besar akan memperlambat keseluruhan strip — solusi diterapkan dengan mengompres foto sampai ukurannya sebanding dengan foto lain di koleksi (mis. `photos/1.JPG` dikompresi dari ~8MB/3072×4608 menjadi ~102KB/667×1000; varian desktop `photos/1desktop.JPG` dibuat terpisah pada 667×451, ~60KB). Kompresi ini sekarang dibantu skrip reusable `scripts/compress-image.py` (Python + Pillow, resize ke lebar 667px + JPEG kualitas 82) — dipakai untuk mengompres `photos/6.JPG` dari ~10.73MB/3910×5865 menjadi ~76KB/667×1000.

---

## Slide Hero (Cover)

Slide pertama di `index.html` — layout split-screen: foto full-bleed di kanan, teks undangan (kartu label, judul pasangan, nama tamu, deskripsi) di area hitam kiri. Judul pasangan memakai gambar SVG (`assets/tittle_adidivetri.svg`) lewat elemen `<img class="title-svg">`, menggantikan teks `<h1>`. Transisi hitam↔foto memakai CSS `mask-image` linear-gradient agar halus, bukan garis tegas. Responsive: di layar <700px berubah jadi stack vertikal (foto di atas dengan fade ke bawah, teks di bawahnya).

---

## Slide Akad Nikah

Slide kedua di `index.html` — background foto full-bleed dengan overlay gelap `rgba(0,0,0,0.4)`, memakai pola yang sama seperti Slide Hero tapi tanpa split-screen/mask-image. Background-nya responsive: foto portrait `photos/1.JPG` (667×1000) untuk mobile, foto landscape `photos/1desktop.JPG` (667×451) untuk desktop, di-switch lewat `@media (min-width: 701px)` — breakpoint yang sama dipakai di seluruh halaman untuk transisi mobile/desktop.

Isinya dua kartu berdampingan (CSS grid 2 kolom, stack 1 kolom di layar <700px):
- Kartu mempelai pria — **M. Rizky Adi Prasetyo**, putra dari (Alm.) Bapak Suharto & (Almh.) Ibu Lastri
- Kartu mempelai wanita — **Divetri Ayu Rahmawati**, putri dari Bapak Slamet Riyadi & (Almh.) Ibu Ning

Di bawah dua kartu itu ada kartu info waktu & tempat akad.

---

## Tipografi & Palet Warna — Kartu Konten

Font header (`h1`, `h2`) memakai **Dream Avenue Regular**, dimuat lewat `@font-face` lokal dari `fonts/dream-avenue-regular.otf` (bukan CDN — cdnfonts.com pernah dicoba tapi gagal load). Font teks kecil (`.label`, `p`, `.date`, `.venue`) memakai **Source Serif Pro** (Google Fonts).

Palet warna resmi yang direncanakan untuk kartu konten: teks header `#5a1919`, teks kecil `#6c4440` dengan opacity 63% (`rgba(108, 68, 64, 0.63)`). Palet ini **belum aktif** di implementasi saat ini — warna aktif untuk sementara diganti putih (`#ffffff` untuk header, `rgba(255, 255, 255, 0.63)` untuk teks kecil) sambil menunggu keputusan final dari user. Font-family tetap sama di kedua varian warna.

---

## Slide Simpan Tanggal

Slide berisi tombol pill "Simpan Tanggal" (`#saveDateBtn`) dengan animasi sparkle berulang saat slide masuk viewport, dideteksi lewat `IntersectionObserver`. Klik tombol membuka tab baru ke `calendar.google.com/calendar/render` dengan parameter `action=TEMPLATE`, `text`, `dates` (dikonversi ke UTC dari jadwal resepsi 29 Agustus 2026, 11.00–14.00 WIB), `location`, dan `details` — event otomatis terisi tanpa perlu backend atau OAuth. Ini menggantikan pendekatan sebelumnya yang men-download file `.ics` via Blob; trade-off-nya, user Apple Calendar/Outlook tidak lagi terlayani otomatis dan harus menambahkan event secara manual.

---

## Loading Screen saat Fetch Firestore

Nama tamu di slide hero diambil dari Firestore secara async berdasarkan parameter URL `?p=<uid>` (`impl-guest-gate`), yang punya delay jaringan sebelum hasilnya diketahui. Untuk mencegah user melihat flash konten mentah (placeholder nama tamu atau gate kosong) saat delay itu, halaman menampilkan layar hitam penuh (`#loadingScreen`) secara default: logo "Adi & Divetri" (`assets/title_adidivetri_2.svg`) di tengah beranimasi pulse (nonaktif saat `prefers-reduced-motion`), diikuti teks kredit statis "Built by Adipresto. Supervised by Dive. Powered by Dreamlabs" di bawah logo.

Begitu hasil fetch diketahui, ada dua jalur animasi slide berbeda: jika nama tamu valid, seluruh loading screen slide ke atas keluar viewport sementara konten halaman (`.content-layer`) slide masuk dari bawah; jika tidak ada data tamu (gate-blocked), logo di loading screen slide turun dan lenyap (teks kredit ikut fade-out), lalu halaman gate ("Mohon doa dan restu atas pernikahan kami") fade-in menggantikannya. Kedua jalur punya fallback tampil instan tanpa animasi saat `prefers-reduced-motion` aktif.
