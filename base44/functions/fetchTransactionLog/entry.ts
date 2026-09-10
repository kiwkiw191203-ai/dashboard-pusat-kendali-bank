import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const SHEET_ID = "1886PQIowiwaR8duhKyoSFr7hKUxP0_nsCUBjEgiyJHU";

// Daftar tab sheet: key -> { label, gid, fallbackColumns }
const SHEETS = {
  deposit: { label: "Cash IN / DEPOSIT", gid: "0", fallbackColumns: ["Tanggal", "Nama TOKO", "Member ID", "Bukti Trf", "Order ID", "RRN / No Ref", "Nominal", "Status", "Keterangan"] },
  new_withdraw: { label: "NEW of Cash Out / WITHDRAW", gid: "196253317", fallbackColumns: ["Tanggal", "Nama TOKO", "Member ID", "Order ID", "Nominal", "Vendor ID", "Status", "Keterangan"] },
  withdraw: { label: "Cash Out / WITHDRAW", gid: "1013808545", fallbackColumns: ["Tanggal", "Nama TOKO", "Member ID", "Order ID", "Nominal", "Vendor ID", "Status", "Keterangan"] },
  sheet3: { label: "Sheet3", gid: "1497813823", fallbackColumns: ["Tanggal", "Nama TOKO", "Member ID", "Order ID", "Nominal", "Vendor ID", "Status", "Keterangan"] },
};

// Minimal CSV parser supporting quoted fields with commas/newlines.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === '\r') { /* skip */ }
      else { field += c; }
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Deteksi baris header: cari baris yang mengandung label kolom umum.
function findHeaderIndex(all, maxScan = 6) {
  const markers = ["toko", "tanggal", "date", "nominal", "status", "member", "rrn", "vendor", "bukti", "order"];
  for (let i = 0; i < Math.min(maxScan, all.length); i++) {
    const joined = all[i].join(" ").toLowerCase();
    let hits = 0;
    for (const m of markers) if (joined.includes(m)) hits++;
    if (hits >= 2) return i;
  }
  return -1;
}

function dedupeColumns(cols) {
  const seen = {};
  return cols.map((c) => {
    const base = (c || "").trim() || "Kolom";
    if (!seen[base]) { seen[base] = 1; return base; }
    seen[base]++;
    return base + "_" + seen[base];
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let payload = {};
    try { payload = await req.json(); } catch { /* GET atau tanpa body */ }
    const sheetKey = payload.sheet || "deposit";
    const sheet = SHEETS[sheetKey] || SHEETS.deposit;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${sheet.gid}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return Response.json({ error: `Gagal mengambil sheet (${res.status})` }, { status: 502 });
    const text = await res.text();
    const all = parseCSV(text);

    // Tentukan kolom & titik mulai data
    let columns;
    let dataStart = 0;
    const headerIdx = findHeaderIndex(all);
    if (headerIdx >= 0) {
      // ambil kolom dari header, potong kolom kosong di belakang
      let rawCols = all[headerIdx].map((c) => c.trim());
      let lastNonEmpty = rawCols.length - 1;
      while (lastNonEmpty >= 0 && !rawCols[lastNonEmpty]) lastNonEmpty--;
      rawCols = rawCols.slice(0, lastNonEmpty + 1);
      columns = dedupeColumns(rawCols);
      dataStart = headerIdx + 1;
    } else {
      // tidak ada header (mis. Sheet3) -> pakai fallback columns
      columns = sheet.fallbackColumns;
      dataStart = 0;
    }

    const colCount = columns.length;
    const rows = [];
    for (let i = dataStart; i < all.length; i++) {
      const r = all[i];
      if (!r || r.every((c) => !c || !c.trim())) continue;
      // samakan panjang ke jumlah kolom
      const aligned = [];
      for (let j = 0; j < colCount; j++) aligned.push((r[j] || "").trim());
      // lewat baris yang isinya cuma 1 cell non-kosakata (note baris)
      const nonEmpty = aligned.filter((c) => c);
      if (nonEmpty.length === 0) continue;
      // objek
      const obj = {};
      for (let j = 0; j < colCount; j++) obj[columns[j]] = aligned[j];
      rows.push({ _cells: aligned, _obj: obj });
    }

    return Response.json({
      sheet: sheetKey,
      label: sheet.label,
      columns,
      count: rows.length,
      rows: rows.map((r) => r._cells),
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});