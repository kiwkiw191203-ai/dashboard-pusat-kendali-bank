// Konfigurasi lengkap Hadiah & Diskon semua pasaran Togel
// Model perhitungan:
//  - diskon: modal = jumlah × (1 - discount); menang = jumlah × prize
//  - full:   modal = jumlah (tanpa diskon);    menang = jumlah × prize
//  - bb:     modal = jumlah × (1 - discount);  menang tepat = jumlah × prize; menang terbalik = jumlah × terbalikPrize
//  - multi:  pilih multiplier (resolve ke diskon); modal = jumlah × (1 - discount); menang = jumlah × value
//  - even:   modal = jumlah × (1 - discount);  menang = jumlah × (2 - kei)
//  - dasar:  pilih opsi (resolve ke even);     modal = jumlah × (1 - discount); menang = jumlah × (2 - kei)

export const TOGEL_MARKETS = [
  {
    key: "umum",
    name: "Pasaran Umum",
    note: "Berlaku untuk semua pasaran kecuali Toto Mali, Hoki Draw & King Kong 4D.",
    bets: [
      // 4D / 3D / 2D (Diskon)
      { key: "4d", label: "4D", group: "4D / 3D / 2D", model: "diskon", prize: 3000, discount: 0.665 },
      { key: "3d", label: "3D", group: "4D / 3D / 2D", model: "diskon", prize: 400, discount: 0.595 },
      { key: "2d", label: "2D Belakang", group: "4D / 3D / 2D", model: "diskon", prize: 70, discount: 0.295 },
      { key: "2d_depan", label: "2D Depan", group: "4D / 3D / 2D", model: "diskon", prize: 65, discount: 0.295 },
      { key: "2d_tengah", label: "2D Tengah", group: "4D / 3D / 2D", model: "diskon", prize: 65, discount: 0.295 },
      // Bolak Balik
      { key: "bb_4d", label: "4D BB", group: "Bolak Balik", model: "bb", prize: 4000, terbalikPrize: 200, discount: 0.665 },
      { key: "bb_3d", label: "3D BB", group: "Bolak Balik", model: "bb", prize: 400, terbalikPrize: 100, discount: 0.595 },
      { key: "bb_2d", label: "2D BB", group: "Bolak Balik", model: "bb", prize: 70, terbalikPrize: 20, discount: 0.295 },
      // Full
      { key: "full_4d", label: "4D Full", group: "Full", model: "full", prize: 10000 },
      { key: "full_3d", label: "3D Full", group: "Full", model: "full", prize: 1000 },
      { key: "full_2d", label: "2D Full", group: "Full", model: "full", prize: 100 },
      // Prize 123
      { key: "prize1_4d", label: "Prize 1 • 4D", group: "Prize 123", model: "full", prize: 6500 },
      { key: "prize1_3d", label: "Prize 1 • 3D", group: "Prize 123", model: "full", prize: 650 },
      { key: "prize1_2d", label: "Prize 1 • 2D", group: "Prize 123", model: "full", prize: 70 },
      { key: "prize2_4d", label: "Prize 2 • 4D", group: "Prize 123", model: "full", prize: 2100 },
      { key: "prize2_3d", label: "Prize 2 • 3D", group: "Prize 123", model: "full", prize: 210 },
      { key: "prize2_2d", label: "Prize 2 • 2D", group: "Prize 123", model: "full", prize: 20 },
      { key: "prize3_4d", label: "Prize 3 • 4D", group: "Prize 123", model: "full", prize: 1100 },
      { key: "prize3_3d", label: "Prize 3 • 3D", group: "Prize 123", model: "full", prize: 110 },
      { key: "prize3_2d", label: "Prize 3 • 2D", group: "Prize 123", model: "full", prize: 8 },
      // Colok
      { key: "colok_bebas", label: "Colok Bebas", group: "Colok", model: "multi", discount: 0.06, options: [
        { label: "1 Angka (1,5x)", value: 1.5 }, { label: "2 Angka (3x)", value: 3 }, { label: "3 Angka (4,5x)", value: 4.5 }, { label: "4 Angka (6x)", value: 6 },
      ] },
      { key: "colok_macau", label: "Colok Bebas 2D (Macau)", group: "Colok", model: "multi", discount: 0.10, options: [
        { label: "7x", value: 7 }, { label: "11x", value: 11 }, { label: "18x", value: 18 },
      ] },
      { key: "colok_naga", label: "Colok Naga", group: "Colok", model: "multi", discount: 0.10, options: [
        { label: "3D (23x)", value: 23 }, { label: "4D (35x)", value: 35 },
      ] },
      { key: "colok_jitu", label: "Colok Jitu", group: "Colok", model: "diskon", prize: 8, discount: 0.06 },
      { key: "shio", label: "Shio", group: "Colok", model: "diskon", prize: 9.5, discount: 0.05 },
      { key: "kombinasi", label: "Kombinasi", group: "Colok", model: "diskon", prize: 2.6, discount: 0.08 },
      // Pasan Lain (even money)
      { key: "tengah_tepi", label: "Tengah Tepi", group: "Pasan Lain", model: "even", discount: 0.02, kei: 0.03 },
      { key: "dasar", label: "Dasar", group: "Pasan Lain", model: "dasar", discount: 0.02, options: [
        { label: "Besar", kei: 0.25 }, { label: "Kecil", kei: -0.10 }, { label: "Genap", kei: -0.10 }, { label: "Ganjil", kei: 0.25 },
      ] },
      { key: "5050", label: "50-50", group: "Pasan Lain", model: "even", discount: 0.02, kei: 0.03 },
      { key: "silang_homo", label: "Silang Homo", group: "Pasan Lain", model: "even", discount: 0.02, kei: 0.03 },
      { key: "kembang_kempis", label: "Kembang Kempis", group: "Pasan Lain", model: "even", discount: 0.02, kei: 0.03 },
    ],
  },
  {
    key: "toto_mali",
    name: "Toto Mali",
    note: "Hadiah & diskon khusus pasaran Toto Mali.",
    bets: [
      { key: "4d", label: "4D", group: "Diskon", model: "diskon", prize: 3000, discount: 0.67 },
      { key: "3d", label: "3D", group: "Diskon", model: "diskon", prize: 400, discount: 0.57 },
      { key: "2d", label: "2D Belakang", group: "Diskon", model: "diskon", prize: 70, discount: 0.27 },
      { key: "2d_depan", label: "2D Depan", group: "Diskon", model: "diskon", prize: 70, discount: 0.27 },
      { key: "2d_tengah", label: "2D Tengah", group: "Diskon", model: "diskon", prize: 70, discount: 0.27 },
      { key: "full_4d", label: "4D Full", group: "Full", model: "full", prize: 10000 },
      { key: "full_3d", label: "3D Full", group: "Full", model: "full", prize: 1000 },
      { key: "full_2d", label: "2D Full", group: "Full", model: "full", prize: 100 },
    ],
  },
  {
    key: "king_kong",
    name: "King Kong 4D",
    note: "Hadiah & diskon khusus pasaran King Kong 4D.",
    bets: [
      { key: "4d", label: "4D", group: "Diskon", model: "diskon", prize: 6000, discount: 0.33 },
      { key: "3d", label: "3D", group: "Diskon", model: "diskon", prize: 700, discount: 0.24 },
      { key: "2d", label: "2D", group: "Diskon", model: "diskon", prize: 80, discount: 0.15 },
      { key: "bb_4d", label: "4D BB", group: "Bolak Balik", model: "bb", prize: 4000, terbalikPrize: 200, discount: 0.33 },
      { key: "bb_3d", label: "3D BB", group: "Bolak Balik", model: "bb", prize: 400, terbalikPrize: 100, discount: 0.24 },
      { key: "bb_2d", label: "2D BB", group: "Bolak Balik", model: "bb", prize: 70, terbalikPrize: 20, discount: 0.15 },
      { key: "full_4d", label: "4D Full", group: "Full", model: "full", prize: 10000 },
      { key: "full_3d", label: "3D Full", group: "Full", model: "full", prize: 1000 },
      { key: "full_2d", label: "2D Full", group: "Full", model: "full", prize: 100 },
      { key: "colok_bebas", label: "Colok Bebas", group: "Colok", model: "diskon", prize: 1.5, discount: 0.06 },
      { key: "colok_macau", label: "Colok Bebas 2D (Macau)", group: "Colok", model: "multi", discount: 0.10, options: [
        { label: "7x", value: 7 }, { label: "11x", value: 11 }, { label: "18x", value: 18 },
      ] },
      { key: "colok_naga", label: "Colok Naga", group: "Colok", model: "multi", discount: 0.10, options: [
        { label: "3D (23x)", value: 23 }, { label: "4D (35x)", value: 35 },
      ] },
      { key: "colok_jitu", label: "Colok Jitu", group: "Colok", model: "diskon", prize: 8, discount: 0.06 },
      { key: "shio", label: "Shio", group: "Colok", model: "diskon", prize: 9.5, discount: 0.05 },
      { key: "kombinasi", label: "Kombinasi", group: "Colok", model: "diskon", prize: 2.6, discount: 0.08 },
      { key: "tengah_tepi", label: "Tengah Tepi", group: "Pasan Lain", model: "even", discount: 0, kei: 0.03 },
      { key: "dasar", label: "Dasar", group: "Pasan Lain", model: "dasar", discount: 0, options: [
        { label: "Ganjil / Besar", kei: 0.25 }, { label: "Genap / Kecil", kei: -0.10 },
      ] },
      { key: "5050", label: "50-50", group: "Pasan Lain", model: "even", discount: 0, kei: 0.03 },
      { key: "silang_homo", label: "Silang Homo", group: "Pasan Lain", model: "even", discount: 0, kei: 0.03 },
      { key: "kembang_kempis", label: "Kembang Kempis", group: "Pasan Lain", model: "even", discount: 0, kei: 0.03 },
    ],
  },
  {
    key: "hoki_draw",
    name: "Hoki Draw",
    note: "Hadiah & diskon khusus pasaran Hoki Draw.",
    bets: [
      { key: "5d", label: "5D", group: "Diskon", model: "diskon", prize: 50000, discount: 0.38 },
      { key: "4d", label: "4D", group: "Diskon", model: "diskon", prize: 7000, discount: 0.20 },
      { key: "3d", label: "3D", group: "Diskon", model: "diskon", prize: 750, discount: 0.20 },
      { key: "2d", label: "2D", group: "Diskon", model: "diskon", prize: 75, discount: 0.20 },
      { key: "bb_5d", label: "5D BB", group: "Bolak Balik", model: "bb", prize: 50000, terbalikPrize: 350, discount: 0.38 },
      { key: "bb_4d", label: "4D BB", group: "Bolak Balik", model: "bb", prize: 5000, terbalikPrize: 180, discount: 0.20 },
      { key: "bb_3d", label: "3D BB", group: "Bolak Balik", model: "bb", prize: 500, terbalikPrize: 75, discount: 0.20 },
      { key: "bb_2d", label: "2D BB", group: "Bolak Balik", model: "bb", prize: 80, terbalikPrize: 15, discount: 0.20 },
      { key: "full_5d", label: "5D Full", group: "Full", model: "full", prize: 88000 },
      { key: "full_4d", label: "4D Full", group: "Full", model: "full", prize: 10000 },
      { key: "full_3d", label: "3D Full", group: "Full", model: "full", prize: 1000 },
      { key: "full_2d", label: "2D Full", group: "Full", model: "full", prize: 100 },
      { key: "colok_bebas", label: "Colok Bebas", group: "Colok", model: "diskon", prize: 0.9, discount: 0.06 },
      { key: "colok_macau", label: "Colok Bebas 2D (Macau)", group: "Colok", model: "multi", discount: 0.10, options: [
        { label: "4x", value: 4 }, { label: "6x", value: 6 }, { label: "20x", value: 20 }, { label: "200x", value: 200 },
      ] },
      { key: "colok_macau_4d", label: "Colok Bebas 4D (Macau)", group: "Colok", model: "multi", discount: 0.10, options: [
        { label: "50x", value: 50 }, { label: "200x", value: 200 },
      ] },
      { key: "colok_naga", label: "Colok Naga", group: "Colok", model: "multi", discount: 0.10, options: [
        { label: "12x", value: 12 }, { label: "30x", value: 30 }, { label: "125x", value: 125 },
      ] },
      { key: "colok_jitu", label: "Colok Jitu", group: "Colok", model: "diskon", prize: 8, discount: 0.06 },
      { key: "shio", label: "Shio", group: "Colok", model: "diskon", prize: 9.5, discount: 0.05 },
      { key: "kombinasi", label: "Kombinasi", group: "Colok", model: "diskon", prize: 2.7, discount: 0.08 },
    ],
  },
];