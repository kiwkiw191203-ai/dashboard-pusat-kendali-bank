import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const KPBI_URL = 'https://kpbi.org/';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(KPBI_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    if (!res.ok) return Response.json({ error: `Gagal mengambil halaman (${res.status})` }, { status: 502 });

    let html = await res.text();

    // Inject <base> agar resource relatif (gambar/css/js) dimuat dari kpbi.org
    const injection =
      '<base href="' + KPBI_URL + '">' +
      '<meta name="referrer" content="no-referrer-when-downgrade">' +
      '<style>html,body{background:#0b0e14!important}img{max-width:100%;height:auto}</style>';

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => m + injection);
    } else {
      html = injection + html;
    }

    return Response.json({ html, url: KPBI_URL, fetchedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});