# Undangan Online

Baca dua file ini sebelum melakukan apa pun — jangan scan direktori terlebih dahulu:

1. `docs/ringkasan.md` — ringkasan naratif seluruh requirements dalam paragraf.
2. `docs/knowledge-graph.md` — peta relasi antar konsep: komponen, edge case, implementasi, dan teknologi yang digunakan.

## Font Lokal

File font custom (mis. Dream Avenue, Source Serif Pro) disimpan di `fonts/` (root project) dan di-load lewat `@font-face` lokal — bukan CDN pihak ketiga (cdnfonts.com pernah dicoba tapi gagal load). Halaman yang memakainya mereferensikan path relatif sesuai lokasinya, mis. `fonts/dream-avenue-regular.otf` dari `index.html` (root), atau `../fonts/dream-avenue-regular.otf` dari halaman di `pages/`.

## Entry Point

`index.html` di root project adalah halaman utama, referensi asetnya relatif ke root: `fonts/...` dan `components/...` (tanpa prefix `../`).

## Aturan Update Dokumentasi

Setiap kali ada perubahan pada file `.md` di `docs/` atau ada progress implementasi baru, **wajib update juga**:

1. `docs/knowledge-graph.md` — tambah/ubah node dan edge yang relevan
2. `docs/knowledge-graph.html` — sinkronkan array `nodes` dan `edges` di JS, update counter di `#stats`

### Versioning (Semver)

Setiap update knowledge graph wajib bump versi:
- **Minor** (`v1.0 → v1.1`): tambah node, edge, atau relasi baru
- **Major** (`v1.x → v2.0`): restrukturisasi besar — ubah tipe node, reorganisasi kategori, atau hapus node

Yang harus diupdate saat bump versi:
- `docs/knowledge-graph.md` — baris `**Versi saat ini: vX.Y**` dan tambah entry di `## Changelog`
- `docs/knowledge-graph.html` — atribut `#stats` (counter node/edge) dan teks `<span class="version">`
