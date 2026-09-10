// Data statis Pusat Kendali Bank — dipakai panel-panel Overview.

export const SOP_CARDS = [
  {
    icon: "fa-landmark", name: "BCA", time: "⏰ 00.01", footer: "Proses harian Senin–Jumat", footerIcon: "fa-rotate",
    steps: [
      ["1", "Matikan BK [22.50]"],
      ["2", "Pull Web Mutasi, all-kan, panah ke atas"],
      ["3", "[Ctrl+F] saldo garis kuning → ambil mutasi semalam & CROSSCHECK"],
      ["4", "Save to database & Naikkan Total Approve [KLOP]"],
      ["5", "Deposit accept manual (khusus semalam)"],
      ["6", "Ulangi untuk semua akun → Synchronize BK → Nyalakan BK → Bersihkan antrian"],
    ],
  },
  {
    icon: "fa-landmark", name: "BCA (Weekend)", time: "⏰ 00.01", footer: "Sabtu/Minggu & Tanggal Merah", footerIcon: "fa-calendar-week",
    steps: [
      ["1", "Matikan BK [22.50]"],
      ["2", "Pull Web Mutasi, all-kan, panah ke atas"],
      ["3", "[Ctrl+F] saldo garis kuning → ambil mutasi semalam & CROSSCHECK"],
      ["4", "Save DB, lalu ceklis mutasi semalam + set delete dg note tanggal semalam"],
      ["5", "Naikkan Total Approve [KLOP] → ulangi semua akun"],
      ["6", "Sync BK → Nyalakan → Bersihkan antrian"],
    ],
  },
  {
    icon: "fa-building-columns", name: "BNI", time: "⏰ 04.00", footer: "Proses pagi 04.00", footerIcon: "fa-clock",
    steps: [
      ["1", "Matikan BK → Naikkan Pendingan [KLOP]"],
      ["2", "Pull Web Mutasi"],
      ["3", "[Ctrl+F] mutasi keluar semalam → set delete (note semalam) CROSSCHECK"],
      ["4", "[Ctrl+F] mutasi keluar hari ini → set Approve (note done) CROSSCHECK"],
      ["5", "Hapus mutasi hari ini dari doc, turunkan rumus"],
      ["6", "Naikkan Total Approve [KLOP] → Sync → Nyalakan BK → Bersihkan antrian"],
    ],
  },
  {
    icon: "fa-piggy-bank", name: "BRI (via BK)", time: "⏰ 05.00", footer: "Proses melalui sistem BK", footerIcon: "fa-arrows-rotate",
    steps: [
      ["1", "Matikan BK → Naikkan Pendingan [KLOP]"],
      ["2", "Buka akun BK, ganti tanggal ke semalam"],
      ["3", "Pull Web Mutasi, all-kan, panah ke atas"],
      ["4", "[Ctrl+F] saldo garis kuning → ambil mutasi semalam & Letak doc"],
      ["5", "[Ctrl+F] saldo terakhir setelah keluarkan mutasi → CROSSCHECK"],
      ["6", "Close Pull, refresh ke hari ini → Pull & Save DB"],
      ["7", "Naikkan Total Approve [KLOP] → Sync → Nyalakan BK → Bersihkan antrian"],
    ],
  },
  {
    icon: "fa-globe", name: "BRI (Direct)", time: "⏰ 05.00", footer: "Login manual ke internet banking", footerIcon: "fa-laptop",
    steps: [
      ["1", "Matikan BK (pastikan mati) → Naikkan Pendingan [KLOP]"],
      ["2", "Login Bank → Cek Mutasi / Histori"],
      ["3", "[Ctrl+F] saldo bank dari doc di web bank"],
      ["4", "Keluarkan semua mutasi baru ke doc"],
      ["5", "[Ctrl+F] saldo bank → CROSSCHECK"],
      ["6", "Naikkan Total Approve [KLOP] → Accept Deposit manual"],
      ["7", "Sync BK → Nyalakan → Bersihkan antrian (HK 07.00 / RS 06.00 Reject)"],
    ],
  },
  {
    icon: "fa-triangle-exclamation", name: "Mata Merah & Gabungan", time: "Handling", footer: "Handling khusus & troubleshooting", footerIcon: "fa-sync-alt", accent: "var(--gold)",
    steps: [
      ["M", "Mata Merah : buka akun, copy user id, cek jam terakhir dikasih. A. sudah dikasih → Approve. B. belum → Approve + tembak manual"],
      ["G", "Dana Gabungan : buka mutasi, [Ctrl+F] nama rekening, jumlahkan = form, Approve dg note \"dana gabungan id xxxxx\""],
      ["D", "Double BNI : cek saldo bank atas, jika ada 2 saldo sama → copy saldo ke doc, ambil mutasi di atasnya, un-ceklis asli, set delete \"double\""],
      ["!", "Jika selisih minus → mutasi asli terhapus. Jika plus → masih ada double."],
      ["↩", "Balikkan mutasi asli : set Approve dg note \"terset delete\", lalu keluarkan ke doc."],
    ],
  },
  {
    icon: "fa-clipboard-check", name: "Administration", time: "Final", footer: "Finalisasi & pengecekan akhir", footerIcon: "fa-user-tie",
    steps: [
      ["1", "Buka Administration → Accept Deposit CROSSCHECK"],
      ["2", "Delete / Reject tanpa memo Form di BK"],
      ["3", "Setelah semua bank selesai, lakukan Synchronize BK dan Nyalakan BK kembali"],
      ["4", "Bersihkan antrian (pastikan tidak ada pending)"],
      ["5", "Untuk double : setelah wipe deleted mutasi, System Pull Mutasi & set delete mutasi semalam"],
      ["6", "Naikkan total approve setelah KLOP, nyalakan BK"],
    ],
  },
];

export const MUTASI_GROUPS = [
  {
    title: "Navigasi & Pengaturan", icon: "fa-arrows-alt",
    items: [
      ["Open", "Buka detail mutasi/akun"],
      ["Saldo", "Cek jumlah saldo akun"],
      ["Mutasi", "Buka data mutasi langsung"],
      ["Edit", "Ubah info akun bank"],
      ["Delete", "Hapus akun/data bank"],
      ["Switch Bank", "Hijau Online / Merah Offline"],
      ["Panah Atas", "Pindah ke atas"],
      ["Panah Bawah", "Pindah ke bawah"],
    ],
  },
  {
    title: "Status & Data Mutasi", icon: "fa-tag",
    items: [
      ["Data Mutasi", "Ditarik sistem"],
      ["Data Manual", "Ditarik manual operator"],
      ["Panah Hijau", "Uang masuk"],
      ["Panah Hitam", "Uang keluar"],
      ["Tambah", "Tambah data baru"],
      ["Hapus", "Hapus data tidak perlu"],
    ],
  },
  {
    title: "Status Proses Mutasi", icon: "fa-clock",
    items: [
      ["Tanda Jam", "Masih dalam proses"],
      ["Centang", "Selesai diproses"],
      ["Sinyal Hijau", "Pull data saat online"],
      ["Sinyal Merah", "Pull data saat offline"],
    ],
  },
  {
    title: "Status Deposit", icon: "fa-box-archive",
    items: [
      ["Deposit Deleted", "Data deposit dihapus"],
      ["Deposit Waiting", "Menunggu proses"],
      ["Deposit Already", "Sudah diproses sebelumnya"],
      ["Restore", "Kembalikan data terhapus"],
    ],
  },
  {
    title: "Action Menu", icon: "fa-screwdriver-wrench",
    items: [
      ["Set Approved", "Ubah status ke Approved"],
      ["Proses Gan", "Proses data terpilih"],
      ["Move", "Cocokkan dengan Deposit ID"],
      ["Hold", "Tahan deposit"],
      ["Delete", "Hapus deposit"],
      ["Reject", "Tolak + memo"],
      ["Reject Tanpa Memo", "Tolak tanpa memo"],
      ["History Deposit", "Riwayat per User ID"],
      ["Status Checked", "Telah diperiksa"],
    ],
  },
  {
    title: "Info Tambahan", icon: "fa-circle-info",
    items: [
      ["Jadwal Pull", "Lihat tabel di bawah"],
      ["Cut-off Weekend", "23:00 – 03:00"],
      ["Auto Pull", "Interval otomatis"],
    ],
  },
];

export const JADWAL_MUTASI = [
  ["BNI Sheet", "00:00:45 - 23:50:00", "30 detik"],
  ["BNI Web", "03:00:00 - 23:50:00", "3 menit"],
  ["BRI", "00:00:30 - 23:50:00", "40 detik"],
  ["Bank BSI", "00:05:00 - 23:50:00", "2 menit"],
  ["CIMB Niaga", "00:00:15 - 23:50:00", "5 menit"],
  ["Crypto Blockchain", "00:05:00 - 23:50:00", "30 detik"],
  ["Dana", "00:00:30 - 23:50:00", "30 detik"],
  ["Danamon", "00:00:15 - 23:50:00", "2 menit"],
  ["Gojek GoPay", "00:00:10 - 23:50:00", "30 detik"],
  ["Klik BCA", "00:05:00 - 23:50:00", "5 menit"],
  ["LinkAja", "00:00:10 - 23:50:00", "30 detik"],
  ["Mandiri Livin", "00:00:45 - 23:50:00", "30 detik"],
  ["MayBank", "00:05:00 - 23:50:00", "5 menit"],
  ["My BCA", "00:00:30 - 23:50:00", "30 detik"],
  ["OVO", "00:00:10 - 23:50:00", "30 detik"],
];

export const MINUS_UMUM = [
  "Kelebihan pendingan dari bagian depo (tidak berpengaruh jika data di doc & di atas hari ini)",
  "Kekurangan catat pindah dana dari sisi WD / kelebihan catat dari DEPO",
  "EDC membal yang sudah lewat belum masuk ke kolom keterangan KAS1",
  "Rumus salah → saldo bank kurang dari seharusnya (cek SHORTCUT)",
  "Dana Cancel tercatat lebih banyak dari total yg harus di-cancel",
  "Kekurangan catat biaya pada Biaya Lain-lain",
];

export const MINUS_KHUSUS = [
  "Tanggal semalam belum dicatat",
  "Ada Mata Merah atau Already",
  "BK Lengket atau DB Sorong",
  "Salah accept manual deposit (PL 15.000 → form 25.000 → minus 10.000)",
  "Manual deposit sudah dikasih koin tapi belum dikasih jam",
];

export const MINUS_SECTIONS = [
  {
    title: "Minus pada Pendingan Kanan", icon: "fa-clock",
    items: [
      "Dana sudah diproses Admin tapi belum approve di BK/docs",
      "Approve di BK/docs 1x, tapi di admin diproses >1x",
      "Dana semalam harus dicatat di Pendingan Kanan agar tidak selisih",
      "Selisih minus bisa dari tanda koma pada nominal",
      "Rumus terproses tidak diubah sesuai kolom terproses deposit",
    ],
  },
  {
    title: "Minus pada KAS1", icon: "fa-calculator",
    items: [
      "Kelebihan dana pendingan (waiting, tapi sudah diproses)",
      "Salah deposit / withdraw → masukkan ke Status",
      "Dana membal / kemenangan tidak terbayar → masuk ke Kerugian PT",
      "Rekening WD tidak valid masih tercatat di status (lupa hapus)",
      "WD manual → KAS ditambah Withdraw out (WD out + WD in) × 2",
      "Kekurangan saldo deposit / withdraw (naik ke kas kurang)",
      "Biaya (pulsa, adm bank, antar bank) → catat di Biaya Lain-lain",
    ],
  },
  {
    title: "Minus pada Crosscheck Withdraw", icon: "fa-right-left",
    items: [
      "WD di-approve admin tapi belum dicatat di Docs",
      "Double accept WD (contoh: Rp 200.000), tapi hanya 1 data tercatat",
      "Transaksi ke-2 harus dicatat di Status — Minus (Rp 200.000)",
    ],
  },
];

export const PLUS_UMUM = [
  "Kekurangan pendingan / pendingan hilang (tidak berpengaruh jika data di doc & di atas hari ini)",
  "WD rekening tidak valid tidak masuk ke status KAS1",
  "Kelebihan catat pindah dana dari WD / kekurangan catat dari DEPO",
  "Rumus salah → saldo bank lebih banyak dari seharusnya (cek SHORTCUT)",
  "Dana Cancel tercatat kurang dari total yg harus di-cancel",
  "Kelebihan catat biaya pada Biaya Lain-lain",
];

export const PLUS_KHUSUS = [
  "Dana membal",
  "Salah accept manual deposit (PL 25.000 → form 10.000 → plus 15.000)",
  "Salah set dana gabungan (kelebihan set approve)",
  "Rumus bawah depo kemungkinan salah",
  "Kelebihan catat tanggal semalam",
  "Manual deposit belum dikasih koin tapi sudah dikasih jam",
];

export const PLUS_KAS1 = [
  "Cari Rek Tidak Valid / WD Gantung",
  "Cek pendingan di Docs deposit, apakah total sudah sesuai",
  "Cek mutasi tidak cetak di kanan-kiri (naik kas wajib hapus kanan)",
  "Cek WD tidak valid tanggal semalam, sudah diproses atau belum",
  "Kurang pendingan / rumus pendingan di doc depo terganti",
];

export const RINGKASAN = [
  {
    title: "Minus (−)", color: "var(--coral)", icon: "fa-circle-minus",
    items: ["Tanggal semalam belum dicatat", "Mata Merah / Already", "BK Lengket / DB Sorong", "Salah accept (PL lebih besar dari form)", "Manual deposit: koin sudah, jam belum"],
  },
  {
    title: "Plus (+)", color: "var(--green)", icon: "fa-circle-plus",
    items: ["Dana membal", "Salah accept (PL lebih kecil dari form)", "Salah set dana gabungan (kelebihan approve)", "Rumus bawah depo salah", "Kelebihan catat tanggal semalam", "Manual deposit: jam sudah, koin belum"],
  },
  {
    title: "Langkah Awal", color: "var(--acc)", icon: "fa-screwdriver-wrench",
    items: ["Cek pendingan kanan & KAS1", "Cek rek tidak valid / WD gantung", "Cek rumus di SHORTCUT", "Cek total approve & accept manual", "Cek biaya lain-lain & dana cancel"],
  },
];

export const BANKS = [
  { name: "BCA", icon: "fa-landmark", status: "Online", hours: "00.20 - 22.00 WIB" },
  { name: "Mandiri", icon: "fa-building-columns", status: "Online", hours: "03.00 - 23.00 WIB" },
  { name: "Bank BRI", icon: "fa-piggy-bank", status: "Online", hours: "Online: 24 Jam" },
  { name: "BNI", icon: "fa-building-columns", status: "Online", hours: "Online: 24 Jam" },
  { name: "Bank Syariah", icon: "fa-landmark", status: "Online", hours: "01.00 - 22.00 WIB" },
  { name: "CIMB Niaga", icon: "fa-university", status: "Online", hours: "Online: 24 Jam" },
  { name: "Danamon", icon: "fa-building-columns", status: "Online", hours: "Online: 24 Jam" },
  { name: "SeaBank", icon: "fa-water", status: "Online", hours: "Online: 24 Jam" },
  { name: "Maybank", icon: "fa-university", status: "Online", hours: "Online: 24 Jam" },
  { name: "Jago", icon: "fa-bolt", status: "Online", hours: "Online: 24 Jam" },
  { name: "DANA", icon: "fa-wallet", status: "Online", hours: "Online: 24 Jam" },
  { name: "OVO", icon: "fa-mobile-screen", status: "Online", hours: "Online: 24 Jam" },
  { name: "GoPay", icon: "fa-mobile-screen", status: "Online", hours: "Online: 24 Jam" },
  { name: "LinkAja", icon: "fa-link", status: "Online", hours: "Online: 24 Jam" },
];

export const STATUS_MAP = {
  Online: { color: "var(--green)", label: "Online" },
  Gangguan: { color: "var(--gold)", label: "Gangguan" },
  Offline: { color: "var(--coral)", label: "Offline" },
};