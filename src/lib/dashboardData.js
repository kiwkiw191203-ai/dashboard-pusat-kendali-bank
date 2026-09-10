// ====================== NAVIGATION ======================
export const NAV_GROUPS = [
  {
    label: "Utama",
    items: [
      { to: "/files", title: "File Kerja CS", desc: "Dokumen & referensi", icon: "fa-bullhorn", color: "var(--acc)" },
      { to: "/predict", title: "Prediksi Togel", desc: "Analisis & prediksi", icon: "fa-dice", color: "var(--rose)" },
      { to: "/analyzer", title: "Hitung Freespin", desc: "Kalkulator spin", icon: "fa-calculator", color: "var(--violet)" },
    ],
  },
  {
    label: "Pintasan",
    items: [
      { to: "/shortcut", title: "Pintasan B.Qris", desc: "Withdraw cepat", icon: "fa-bolt", color: "var(--purple)" },
      { to: "/ticket", title: "Kode Tiket", desc: "Event aktif", icon: "fa-ticket", color: "var(--cyan)" },
      { to: "/win", title: "Tangkapan Menang", desc: "Bukti kemenangan", icon: "fa-trophy", color: "var(--gold)" },
    ],
  },
  {
    label: "Data & AI",
    items: [
      { to: "/bank", title: "Profil Bank", desc: "Info bank & e-wallet", icon: "fa-building-columns", color: "var(--blue)" },
      { to: "/rrn", title: "RRN Qris", desc: "Lampiran RRN", icon: "fa-receipt", color: "var(--teal)" },
      { to: "/hlxpro", title: "HL Pro Chat", desc: "AI Assistant", icon: "fa-robot", color: "var(--green)", badge: "AI" },
    ],
  },
  {
    label: "Sistem",
    items: [
      { to: "/settings", title: "Pengaturan", desc: "Pengguna & aktivitas", icon: "fa-gear", color: "var(--blue)" },
      { to: "/profile", title: "Profil Saya", desc: "Keamanan & akun", icon: "fa-user-shield", color: "var(--acc)" },
    ],
  },
];

// ====================== TICKET ======================
export const TICKETS = [
  { c: "KODE TIKET PG-Mahjong Ways (1)", u: "https://i.ibb.co/W4TKvDDY/image.png", b: "pg" },
  { c: "KODE TIKET CEK KEMENANGAN AKHIR MAHJONG", u: "https://i.ibb.co/9mbVDpK7/image.png", b: "pg" },
  { c: "KODE TIKET PG-Mahjong Ways (2)", u: "https://i.ibb.co/HpthXJg2/image.png", b: "pg" },
  { c: "KODE TIKET PG-Wild Bandito", u: "https://i.ibb.co/PZDSwyMv/image.png", b: "pg" },
  { c: "KODE TIKET PG-Bakery Bonanza", u: "https://i.ibb.co/cc8LK9kr/image.png", b: "pg" },
  { c: "KODE TIKET PG-Wild Bounty Showdown", u: "https://i.ibb.co/B5L1W79B/image.png", b: "pg" },
  { c: "KODE TIKET Gates of Olympus 1000", u: "https://i.ibb.co/M5nBycjn/image.png", b: "pp" },
  { c: "KODE TIKET PG-Cocktail Nights", u: "https://i.ibb.co/dJDV2Bgw/image.png", b: "pg" },
  { c: "KODE TIKET Starlight Princess 1000", u: "https://i.ibb.co/3bHFm49/image.png", b: "pp" },
  { c: "KODE TIKET PP-Gates of Gatot Kaca Super Scatter", u: "https://i.ibb.co/FL0fySQN/image.png", b: "pp" },
];

// ====================== WINNINGS ======================
export const WINNINGS = [
  { c: "TOTAL KEMENANGAN AKHIR Mahjong Ways", u: "https://i.ibb.co/rKTyWxy1/image.png", b: "pg" },
  { c: "TOTAL KEMENANGAN AKHIR PG-Wild Bandito", u: "https://i.ibb.co/BVBJfrdb/image.png", b: "pg" },
  { c: "TOTAL KEMENANGAN AKHIR PG-Bakery Bonanza", u: "https://i.ibb.co/21V5k97v/image.png", b: "pg" },
  { c: "TOTAL KEMENANGAN AKHIR PG-Wild Bounty", u: "https://i.ibb.co/zhZgJdsb/image.png", b: "pg" },
  { c: "TOTAL KEMENANGAN AKHIR Gates of Olympus 1000", u: "https://i.ibb.co/4g3Ln2TP/image.png", b: "pp" },
  { c: "TOTAL KEMENANGAN AKHIR PG-Cocktail Nights", u: "https://i.ibb.co/rfzvNPb6/image.png", b: "pg" },
  { c: "TOTAL KEMENANGAN AKHIR Starlight Princess 1000", u: "https://i.ibb.co/3bHFm49/image.png", b: "pp" },
  { c: "TOTAL KEMENANGAN AKHIR PP-Gates of Gatot Kaca", u: "https://i.ibb.co/3Yfy6rgT/image.png", b: "pp" },
];

// ====================== BANK ======================
export const BANKS = [
  { c: "PROFIL BANK BNI", u: "https://i.ibb.co/tMRFZsqf/image.png", b: "bank" },
  { c: "PROFIL BANK MAYBCA", u: "https://i.ibb.co/S4jp9DnW/image.png", b: "bank" },
  { c: "PROFIL Mobile BCA", u: "https://i.ibb.co/WvMJjLZf/image.png", b: "bank" },
  { c: "PROFIL Mobile BNI", u: "https://i.ibb.co/6cLVB4gJ/image.png", b: "bank" },
  { c: "PROFIL Mobile BRI", u: "https://i.ibb.co/VYh86wHP/image.png", b: "bank" },
  { c: "PROFIL Mobile BSI", u: "https://i.ibb.co/rRzvLkwb/image.png", b: "bank" },
  { c: "PROFIL Mobile CIMB", u: "https://i.ibb.co/VcQ8yW8S/image.png", b: "bank" },
  { c: "PROFIL Mobile Danamon", u: "https://i.ibb.co/gL3wXXv8/image.png", b: "bank" },
  { c: "PROFIL Livin Mandiri", u: "https://i.ibb.co/0jcb5Hjy/image.png", b: "bank" },
  { c: "PROFIL Mobile Maybank", u: "https://i.ibb.co/tMqLcqSh/image.png", b: "bank" },
  { c: "PROFIL Mobile SeaBank", u: "https://i.ibb.co/4ZcySVJ6/image.png", b: "bank" },
  { c: "PROFIL Mobile OCBC", u: "https://i.ibb.co/BVL3zGxB/image.png", b: "bank" },
  { c: "PROFIL Ewallet DANA", u: "https://i.ibb.co/NnfxYCdS/image.png", b: "ewallet" },
  { c: "PROFIL Ewallet GOPAY", u: "https://i.ibb.co/pj859SwH/image.png", b: "ewallet" },
  { c: "PROFIL Ewallet OVO", u: "https://i.ibb.co/1tQVTwzD/image.png", b: "ewallet" },
  { c: "PROFIL Ewallet LinkAja", u: "https://i.ibb.co/8nFpz4xf/image.png", b: "ewallet" },
];

// ====================== RRN ======================
export const RRNS = [
  { c: "BUKTI RRN Aladin", u: "https://i.ibb.co/ZzmpCHCH/image.png", b: "other" },
  { c: "BUKTI RRN Virtual Acc BCA Blue", u: "https://i.ibb.co/k2k4M0fY/image.png", b: "other" },
  { c: "BUKTI RRN ShopeePay [ 1 ]", u: "https://i.ibb.co/5gGp82Rc/image.png", b: "ewallet" },
  { c: "BUKTI RRN ShopeePay [ 2 ]", u: "https://i.ibb.co/TDPhPhC2/image.png", b: "ewallet" },
  { c: "BUKTI RRN Jenius", u: "https://i.ibb.co/TB45LHbB/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Jatim", u: "https://i.ibb.co/ZRxp6BT2/image.png", b: "bank" },
  { c: "BUKTI RRN DOKU", u: "https://i.ibb.co/B2czvQc8/image.png", b: "other" },
  { c: "BUKTI RRN AlloBank", u: "https://i.ibb.co/F4bNtgs7/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Jateng", u: "https://i.ibb.co/xSfPhp1F/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Mega", u: "https://i.ibb.co/r2HKTt2D/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Jago", u: "https://i.ibb.co/zh32c7CM/image.png", b: "bank" },
  { c: "BUKTI RRN Bank BNI", u: "https://i.ibb.co/C5sbYdMX/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Wonder", u: "https://i.ibb.co/Kxj1Fj74/image.png", b: "bank" },
  { c: "BUKTI RRN Bank BRI", u: "https://i.ibb.co/gZd9Ds4b/image.png", b: "bank" },
  { c: "BUKTI RRN Bank BSI", u: "https://i.ibb.co/X9qcDKh/image.png", b: "bank" },
  { c: "BUKTI RRN Bank BSI BYOND", u: "https://i.ibb.co/HDd0SHbs/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Non BSI BYOND App", u: "https://i.ibb.co/VYCk3T3b/image.png", b: "bank" },
  { c: "BUKTI RRN Bank BTN", u: "https://i.ibb.co/zhfNsbdB/image.png", b: "bank" },
  { c: "BUKTI RRN Bank CIMB", u: "https://i.ibb.co/V0wQbyH4/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Danamon", u: "https://i.ibb.co/sd1Cn3fz/image.png", b: "bank" },
  { c: "BUKTI RRN Bank I.Saku", u: "https://i.ibb.co/1tZJYS0t/image.png", b: "bank" },
  { c: "BUKTI RRN Mandiri / Livin", u: "https://i.ibb.co/Z3NzF8F/image.png", b: "bank" },
  { c: "BUKTI RRN MyBCA", u: "https://i.ibb.co/ZyBpFr8/image.png", b: "bank" },
  { c: "BUKTI RRN OCBC", u: "https://i.ibb.co/BVL3zGxB/image.png", b: "bank" },
  { c: "BUKTI RRN SeaBank", u: "https://i.ibb.co/CKmsJxXw/image.png", b: "bank" },
  { c: "BUKTI RRN Bank Sinarmas", u: "https://i.ibb.co/JjB8PYkC/image.png", b: "bank" },
  { c: "BUKTI RRN DANA", u: "https://i.ibb.co/1GFYZx68/image.png", b: "ewallet" },
  { c: "BUKTI RRN OVO", u: "https://i.ibb.co/JwtFnkMt/image.png", b: "ewallet" },
  { c: "BUKTI RRN LinkAja", u: "https://i.ibb.co/8LRB6VPL/image.png", b: "ewallet" },
  { c: "BUKTI RRN GOPAY", u: "https://i.ibb.co/MkG4PmtL/image.png", b: "ewallet" },
];

// ====================== SHORTCUT ======================
export const SHORTCUTS = [
  { t: "BUKTI QRIS LENGKAP", u: "https://help.xendit.co/hc/id/articles/10622653205657-Bukti-Pembayaran-QRIS-yang-Dapat-Diterima", img: "https://i.ibb.co/LdL6Jc9n/image.png" },
  { t: "WITHDRAW MANUAL (PAKAI KODE)", u: "https://script.google.com/macros/s/AKfycbz8O4U3s_Ub-JDLrSiHo_WINy6hHxUFdvpE6W4GbDvMHxaNf0jmFNZToDkvUMwNURqgUw/exec", img: "https://i.ibb.co/vC7J1zWK/image.png" },
  { t: "FILTER KODE TIKET", u: "https://filtertiket-rpm.netlify.app", img: "https://i.ibb.co/Qv0kFtd3/image.png" },
];

// ====================== LOTTERY MARKETS ======================
export const MARKETS = [
  { name: "Bangkok", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/BKK01/icon/icon.png" },
  { name: "Brunei", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/BRU14/icon/icon.png" },
  { name: "Bullseye", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/BLE/icon/icon.png" },
  { name: "California", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/CLF/icon/icon.png" },
  { name: "Carolina Evening", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/NCD2/icon/icon.png" },
  { name: "Chelsea", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/CHS11/icon/icon.png" },
  { name: "Florida", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/FLM/icon/icon.png" },
  { name: "New York", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/NYM/icon/icon.png" },
  { name: "Hoki Draw", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/HKDW/icon/icon.png" },
  { name: "Hongkong Lotto", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/HKGLT/icon/icon.png" },
  { name: "Huahin", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/HUA02/icon/icon.png" },
  { name: "Kentucky", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/KTE/icon/icon.png" },
  { name: "King Kong4D", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/KK1/icon/icon.png" },
  { name: "Magnum4D", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/MAG/icon/icon.png" },
  { name: "Nevada", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/NVD/icon/icon.png" },
  { name: "North Carolina Day", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/NCD/icon/icon.png" },
  { name: "Oregon", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/ORG12/icon/icon.png" },
  { name: "PCSO", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/PCO/icon/icon.png" },
  { name: "Poipet", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/PPT12/icon/icon.png" },
  { name: "Singapore", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/SGD/icon/icon.png" },
  { name: "Sydney Lotto", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/SYDLT/icon/icon.png" },
  { name: "Toto Cambodia Live", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/TTC/icon/icon.png" },
  { name: "Toto Macau", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/TTM1/icon/icon.png" },
  { name: "Toto Mali", img: "https://png-res.png999.com/assets/LOTTERY-Web/cardList/MALI15/icon/icon.png" },
];

export const SHIO = [
  { n: "Kuda" }, { n: "Ular" }, { n: "Naga" }, { n: "Kelinci" }, { n: "Harimau" }, { n: "Kerbau" },
  { n: "Tikus" }, { n: "Babi" }, { n: "Anjing" }, { n: "Ayam" }, { n: "Monyet" }, { n: "Kambing" },
];