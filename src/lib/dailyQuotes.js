// Kata-kata semangat harian — berganti otomatis setiap hari.
export const DAILY_QUOTES = [
  { text: "Kerja hari ini adalah tangga menuju cita-cita esok hari.", tag: "Langkah Kecil" },
  { text: "Fokus pada satu tugas sampai selesai — itu rahasia orang hebat.", tag: "Fokus" },
  { text: "Teliti hari ini menyelamatkan banyak masalah besok.", tag: "Teliti" },
  { text: "Setiap crosscheck yang rapi adalah bukti kamu profesional.", tag: "Profesional" },
  { text: "Jangan tunggu semangat datang, mulai dulu maka semangat menyusul.", tag: "Mulai" },
  { text: "Rezeki mengikuti orang yang amanah pada pekerjaannya.", tag: "Amanah" },
  { text: "Sabar sedikit hari ini, bangga banyak nanti.", tag: "Sabar" },
  { text: "Kamu bukan sekadar bekerja, kamu sedang membangun masa depan.", tag: "Masa Depan" },
  { text: "Kesalahan kecil yang diperbaiki cepat adalah tanda tim yang kuat.", tag: "Tim Kuat" },
  { text: "Disiplin hari ini, hasil manis di kemudian hari.", tag: "Disiplin" },
  { text: "Selesaikan shift dengan senyum, catatan bersih, hati tenang.", tag: "Tenang" },
  { text: "Sedikit lebih rapi dari kemarin sudah cukup untuk maju.", tag: "Progres" },
  { text: "Yang membedakan bukan bakat, tapi konsistensi setiap hari.", tag: "Konsisten" },
  { text: "Semua cita-cita besar dimulai dari kerja kecil yang tuntas.", tag: "Cita-cita" },
];

// Indeks stabil per tanggal — semua user melihat kutipan yang sama tiap hari.
export function quoteOfDay(dateKey) {
  const d = dateKey || new Date().toISOString().slice(0, 10);
  const n = d.split("-").reduce((a, p) => a + Number(p), 0);
  return DAILY_QUOTES[n % DAILY_QUOTES.length];
}