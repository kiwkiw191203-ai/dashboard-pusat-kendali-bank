# 🏦 Dashboard Pusat Kendali Bank — Royal Sapphire Edition

Redesign tampilan (isi/konten 100% tetap sama): biru sapphire yang lebih mewah + font monospace (JetBrains Mono) untuk semua angka, jam, dan data.

## File yang diubah (ganti file lama dengan ini, lokasi sama persis)

| File | Perubahan |
|---|---|
| `src/index.css` | Token warna baru (midnight navy + royal sapphire + emas champagne), utility mewah baru (.lux-card, .lux-topline, .gold-text-grad, .micro-label, .mono-num) |
| `src/pages/Overview.jsx` | Header banner royal gradient, judul gradient, badge jam/tanggal monospace emas, tab navigasi pill gradient aktif |
| `src/components/bankCenter/Ui.jsx` | Primitif UI: SectionTitle dengan divider mewah, Panel glass + hover lift, Banner royal gradient, KeyValue mono |
| `src/components/bankCenter/BerandaPanel.jsx` | KPI card dengan angka mono besar + garis emas, menu utama dengan hover & panah emas |
| `src/components/bankCenter/SopPanel.jsx` | Kartu SOP mewah, nomor langkah mono chip, badge waktu emas, tips dengan garis emas |
| `src/components/bankCenter/MutasiPanel.jsx` | Tabel jadwal dengan header mono uppercase emas, nilai jam mono biru, catatan cut-off gold |
| `src/components/bankCenter/MinusPlusPanel.jsx` | Panel minus/plus dengan aksen kiri tebal + glass card |
| `src/components/bankCenter/DepositPanel.jsx` | Kartu bank dengan garis status di atas, ringkasan mono, banner QRIS glowing |

## Cara pasang
1. Salin file sesuai lokasi di tabel atas (timpa file lama di project kamu).
2. Jalankan ulang `npm run dev` / deploy ulang app.
3. Light & dark mode tetap didukung — token keduanya sudah disesuaikan.
