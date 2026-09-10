// Data changelog untuk System Update Hub (Extension Suite).
// Kata-kata dirombak: tidak menyebut merk pribadi.

export const CHANGELOG = [
  {
    date: "APRIL 21, 2026",
    version: "V3.1",
    title: "Apology Duration Tracker & Pengecekan",
    latest: true,
    items: [
      {
        icon: "🙏",
        label: "Apology Duration Tracker",
        text: "Melacak waktu target 2 menit untuk SLA minta maaf (salah respon/kurang sesuai). Menyediakan visual target interaktif dengan notifikasi Aman/Melanggar secara realtime.",
      },
      {
        icon: "🎛️",
        label: "Dynamic Trigger Keywords",
        text: "Kalimat pemicu untuk Timer Pengecekan (4 kalimat) dan Apology (2 kalimat) kini terintegrasi penuh ke dalam Highlighter Pro! Atur sesuka hati langsung dari Settings Dashboard.",
      },
      {
        icon: "🔍",
        label: "Optimasi UI Pop-up",
        text: "Pop-up notifikasi kini diposisikan erat di pojok kanan-bawah. Posisi ini memastikan notifikasi tidak menutupi ruang pengetikan obrolan.",
      },
    ],
  },
  {
    date: "APRIL 20, 2026",
    version: "V3.0",
    title: "Pengecekan Timer & Setup",
    latest: false,
    items: [
      { icon: "⏱️", label: "LiveChat Pengecekan Timer", text: "Melacak durasi pengecekan ke pusat. Memunculkan lencana interaktif (2M/3M/5M)." },
      { icon: "🔄", label: "Auto-Sync Tech", text: "Setelan disimpan aman dan sinkron antar script." },
    ],
  },
  {
    date: "FEBRUARI 03, 2026",
    version: "V2.4",
    title: "Rainbow & Master Logic",
    latest: false,
    items: [
      { icon: "🌈", label: "Rainbow Master Logic", text: "Deteksi member mengetik 100% akurat. Status pelangi otomatis kalah jika chat masuk tahap SLA 2 menit agar Agent tetap fokus." },
      { icon: "⏳", label: "Gentle Yellow Pulse", text: "Indikator kuning (2 menit) kini berdetak tenang (Pulse) untuk peringatan yang elegan." },
      { icon: "🎨", label: "Signature Branding", text: "Redesain total tampilan dengan tema eksklusif Internal Suite." },
    ],
  },
  {
    date: "JANUARI 31, 2026",
    version: "V2.2",
    title: "Security & Utility",
    latest: false,
    items: [
      { icon: "✨", label: "Smart Auto-Scroll", text: "Tambahan tombol roket mini untuk kembali ke atas dashboard." },
      { icon: "🗄️", label: "Data Vault", text: "Fitur Export/Import settingan (.json) untuk backup permanen." },
    ],
  },
];

export const BACKUP_NOTES = [
  { icon: "💡", label: "Cara Pakai Backup", text: "Menuju Settings (icon ⚙️) di Dashboard > Klik EXPORT untuk simpan data ke PC. Klik IMPORT untuk mengembalikan data." },
  { icon: "🛡️", label: "Aman", text: "Sekalipun Anda restart PC atau hapus history, data tetap ada! Selalu lakukan Export setelah menambah banyak kata kunci baru sebagai tindakan jaga-jaga." },
];