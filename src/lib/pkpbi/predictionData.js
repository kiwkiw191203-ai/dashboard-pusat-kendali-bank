// Fetches and parses the PREDICTION FLAG CSV from Google Sheets
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1bqKrcKJ9mRkHc3E2xVv8TTUnorvNwJtuRN1lLfLAQps/export?format=csv&gid=0";

// Disqualification detail files (3 categories) — updated sources
const DQ_FILES = [
  {
    url: "https://media.base44.com/files/public/6a5f1eaaaf4bdc25d2517758/5bca3ec19_DISKUALIFIKASIMEMBERKPBIBERDASARKANPREDICTIONFLAG.txt",
    category: "Prediction Flag",
    description: "Diskualifikasi berdasarkan Prediction Flag",
  },
  {
    url: "https://media.base44.com/files/public/6a5f1eaaaf4bdc25d2517758/d8971934c_DISKUALIFIKASIMEMBERKPBIKESAMAANIPBERMAINLEBIHDARI1SITUSMITRA.txt",
    category: "Kesamaan IP",
    description: "Kesamaan IP bermain lebih dari 1 situs mitra",
  },
  {
    url: "https://media.base44.com/files/public/6a5f1eaaaf4bdc25d2517758/1eda5fa48_DISKUALIFIKASIMEMBERKPBIBEDANAMAREKENINGTIDAKPREMIUMTIDAKVALID.txt",
    category: "Beda Nama Rekening",
    description: "Beda nama rekening tidak premium tidak valid",
  },
];

// Consolidated disqualified members sheet (Situs, UserID, Keterangan)
const SHEET_DQ_URL =
  "https://docs.google.com/spreadsheets/d/1bqKrcKJ9mRkHc3E2xVv8TTUnorvNwJtuRN1lLfLAQps/export?format=csv&gid=1989822509";

// KPBI National Leaderboard (Top 50) — data from kpbi.org
// Event period: 11 June 2026 – 19 July 2026 (final)
const LEADERBOARD_DATA = [
  { rank: "#1", username: "elma***d", situs: "BOSJOKO", points: "4.770" },
  { rank: "#2", username: "bosl***8", situs: "BANDAR80", points: "4.640" },
  { rank: "#3", username: "Bobo***9", situs: "LIGABANDOT", points: "4.620" },
  { rank: "#4", username: "cro***8", situs: "LIGABANDOT", points: "4.410" },
  { rank: "#5", username: "Haz**7", situs: "PULITOTO", points: "4.360" },
  { rank: "#6", username: "sleb***0", situs: "JUARA88", points: "4.340" },
  { rank: "#7", username: "kunk***2", situs: "JUARA88", points: "4.210" },
  { rank: "#8", username: "Hen***9", situs: "LIGABANDOT", points: "4.200" },
  { rank: "#9", username: "arayary***5", situs: "JUARA88", points: "4.150" },
  { rank: "#10", username: "amin***t", situs: "WDBOS", points: "4.140" },
  { rank: "#11", username: "capc***1", situs: "JONITOGEL", points: "4.100" },
  { rank: "#12", username: "kampre***8", situs: "JUARA88", points: "4.030" },
  { rank: "#13", username: "ima**r", situs: "LIGABANDOT", points: "4.010" },
  { rank: "#14", username: "prince***u", situs: "TOPWD", points: "3.960" },
  { rank: "#15", username: "ase**8", situs: "LIGABANDOT", points: "3.960" },
  { rank: "#16", username: "Kana***0", situs: "BOSJOKO", points: "3.950" },
  { rank: "#17", username: "Pur***8", situs: "LINETOGEL", points: "3.920" },
  { rank: "#18", username: "Kom***e", situs: "JONITOGEL", points: "3.870" },
  { rank: "#19", username: "welw***0", situs: "WDBOS", points: "3.850" },
  { rank: "#20", username: "mob**e", situs: "JUARA88", points: "3.810" },
  { rank: "#21", username: "Hokid***7", situs: "ANGKABET167", points: "3.810" },
  { rank: "#22", username: "Brek***0", situs: "JUARA88", points: "3.780" },
  { rank: "#23", username: "Rafa***1", situs: "LIGABANDOT", points: "3.760" },
  { rank: "#24", username: "Sija***3", situs: "JUARA88", points: "3.760" },
  { rank: "#25", username: "Tmy***0", situs: "WDBOS", points: "3.740" },
  { rank: "#26", username: "san**7", situs: "LIGABANDOT", points: "3.730" },
  { rank: "#27", username: "hiu**0", situs: "JUARA88", points: "3.720" },
  { rank: "#28", username: "mugi***7", situs: "BANDAR80", points: "3.710" },
  { rank: "#29", username: "ngaw***9", situs: "TOPWD", points: "3.710" },
  { rank: "#30", username: "anth***2", situs: "WDBOS", points: "3.700" },
  { rank: "#31", username: "Dzi***k", situs: "JUARA88", points: "3.700" },
  { rank: "#32", username: "xeome***r", situs: "LIGABANDOT", points: "3.700" },
  { rank: "#33", username: "elm***s", situs: "PULITOTO", points: "3.700" },
  { rank: "#34", username: "lee**k", situs: "TVTOTO", points: "3.690" },
  { rank: "#35", username: "loki***t", situs: "LIGABANDOT", points: "3.680" },
  { rank: "#36", username: "Logo***h", situs: "DANATOTO", points: "3.680" },
  { rank: "#37", username: "Khali***0", situs: "LIGABANDOT", points: "3.670" },
  { rank: "#38", username: "Lagi***a", situs: "LIGABANDOT", points: "3.670" },
  { rank: "#39", username: "Prin***9", situs: "HOKIJITU", points: "3.670" },
  { rank: "#40", username: "Jinpan***7", situs: "BANDAR80", points: "3.670" },
  { rank: "#41", username: "Elis***4", situs: "WDBOS", points: "3.660" },
  { rank: "#42", username: "Don**z", situs: "JUTAWANBET", points: "3.640" },
  { rank: "#43", username: "Dem**s", situs: "ANGKABET167", points: "3.630" },
  { rank: "#44", username: "wand***g", situs: "PULITOTO", points: "3.620" },
  { rank: "#45", username: "Maxwin***6", situs: "JUTAWANBET", points: "3.610" },
  { rank: "#46", username: "mam**o", situs: "LIGABANDOT", points: "3.610" },
  { rank: "#47", username: "mada***n", situs: "LAPAK99", points: "3.600" },
  { rank: "#48", username: "nv9**0", situs: "LIGABANDOT", points: "3.590" },
  { rank: "#49", username: "JUMR***I", situs: "BOSJOKO", points: "3.590" },
  { rank: "#50", username: "Luc***0", situs: "LIGABANDOT", points: "3.580" },
];

/**
 * Parses a disqualification TXT file into structured records.
 * Each record: { category, situs, userId, bank, namaRekening, noRekening, rank }
 */
function parseDisqualificationTXT(text, category) {
  const records = [];
  const blocks = text.split(/=== DATA \d+ ===/);

  for (const block of blocks) {
    const getField = (label) => {
      const m = block.match(new RegExp(label + "\\s*:([^\\n]*)"));
      return m ? m[1].trim() : "";
    };

    const situs = getField("Nama Situs");
    const userId = getField("UserID");
    if (!situs && !userId) continue;

    records.push({
      category,
      situs,
      userId,
      bank: getField("Bank"),
      namaRekening: getField("Nama Rekening"),
      noRekening: getField("No\\. Rekening"),
      rank: getField("Rank"),
    });
  }

  return records;
}

/**
 * Minimal but correct CSV parser — handles quoted fields with commas and newlines.
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }

    if (ch === "\r") {
      i++;
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // last field
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

let cachedData = null;

export async function fetchPredictionData() {
  if (cachedData) return cachedData;

  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = parseCSV(text);

  // Row 0 = description, Row 1 = headers, Row 2+ = data
  const description = rows[0]?.[0] || "";

  const flagRecords = [];
  const disqualifiedRecords = [];

  for (let r = 2; r < rows.length; r++) {
    const cols = rows[r];
    if (!cols || cols.length < 6) continue;

    const situs = (cols[0] || "").trim();
    const existingUsername = (cols[1] || "").trim();
    const newUsername = (cols[2] || "").trim();
    const ipAddress = (cols[3] || "").trim();
    const fingerprint = (cols[4] || "").trim();
    const deviceId = (cols[5] || "").trim();

    // Only add if we have a site and at least one username
    if (situs && (existingUsername || newUsername)) {
      flagRecords.push({
        situs,
        existingUsername,
        newUsername,
        ipAddress,
        fingerprint,
        deviceId,
      });
    }

    // Disqualified section (columns 7 and 8, 0-indexed)
    const dqSitus = (cols[7] || "").trim();
    const dqUsername = (cols[8] || "").trim();
    if (dqSitus && dqUsername) {
      disqualifiedRecords.push({ situs: dqSitus, username: dqUsername });
    }
  }

  // Fetch disqualification detail TXT files
  const dqDetailRecords = [];
  for (const file of DQ_FILES) {
    try {
      const dqRes = await fetch(file.url);
      const dqText = await dqRes.text();
      const parsed = parseDisqualificationTXT(dqText, file.category);
      dqDetailRecords.push(...parsed);
    } catch {
      // skip file if fetch fails
    }
  }

  // Fetch consolidated disqualified members sheet (gid=1989822509)
  let sheetDqRecords = [];
  try {
    const sheetDqRes = await fetch(SHEET_DQ_URL);
    const sheetDqText = await sheetDqRes.text();
    const sheetDqRows = parseCSV(sheetDqText);
    for (let r = 1; r < sheetDqRows.length; r++) {
      const cols = sheetDqRows[r];
      if (!cols) continue;
      const lSitus = (cols[0] || "").trim();
      const lUser = (cols[1] || "").trim();
      const lKet = (cols[2] || "").trim();
      if (lSitus && lUser) {
        sheetDqRecords.push({ situs: lSitus, username: lUser, keterangan: lKet });
      }
      const rSitus = (cols[4] || "").trim();
      const rUser = (cols[5] || "").trim();
      if (rSitus && rUser) {
        sheetDqRecords.push({ situs: rSitus, username: rUser, keterangan: "ID Didiskualifikasi" });
      }
    }
  } catch {
    // skip sheet if fetch fails
  }

  // Merge sheet disqualified records into disqualifiedRecords (dedup by situs+username)
  const seenDq = new Set(disqualifiedRecords.map((r) => r.situs + "|" + r.username));
  for (const rec of sheetDqRecords) {
    const key = rec.situs + "|" + rec.username;
    if (!seenDq.has(key)) {
      seenDq.add(key);
      disqualifiedRecords.push(rec);
    }
  }

  cachedData = {
    description,
    flagRecords,
    disqualifiedRecords,
    dqDetailRecords,
    leaderboard: LEADERBOARD_DATA,
    totalRecords: flagRecords.length,
    totalDisqualified: disqualifiedRecords.length,
    totalDqDetail: dqDetailRecords.length,
    totalLeaderboard: LEADERBOARD_DATA.length,
    sites: [...new Set(flagRecords.map((r) => r.situs))].sort(),
  };

  return cachedData;
}

/**
 * Search all records by username (existing or new) or any field.
 * Returns matching flag records + disqualified matches.
 */
export function searchById(data, query) {
  if (!query || !query.trim()) return { flagMatches: [], disqualifiedMatches: [], dqDetailMatches: [], leaderboardMatches: [] };

  const q = query.trim().toLowerCase();

  const flagMatches = data.flagRecords.filter(
    (r) =>
      r.existingUsername.toLowerCase().includes(q) ||
      r.newUsername.toLowerCase().includes(q) ||
      r.situs.toLowerCase().includes(q) ||
      r.ipAddress.toLowerCase().includes(q) ||
      r.fingerprint.toLowerCase().includes(q) ||
      r.deviceId.toLowerCase().includes(q)
  );

  const disqualifiedMatches = data.disqualifiedRecords.filter(
    (r) =>
      r.username.toLowerCase().includes(q) ||
      r.situs.toLowerCase().includes(q) ||
      (r.keterangan || "").toLowerCase().includes(q)
  );

  const dqDetailMatches = (data.dqDetailRecords || []).filter(
    (r) =>
      r.userId.toLowerCase().includes(q) ||
      r.situs.toLowerCase().includes(q) ||
      r.bank.toLowerCase().includes(q) ||
      r.namaRekening.toLowerCase().includes(q) ||
      r.noRekening.toLowerCase().includes(q)
  );

  const leaderboardMatches = (data.leaderboard || []).filter(
    (r) =>
      r.username.toLowerCase().includes(q) ||
      r.situs.toLowerCase().includes(q)
  );

  return { flagMatches, disqualifiedMatches, dqDetailMatches, leaderboardMatches };
}