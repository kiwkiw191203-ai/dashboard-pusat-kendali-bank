import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = "6a462db7a907dc72c65763f0";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageBase64, filename } = await req.json();
    if (!imageBase64) return Response.json({ error: 'imageBase64 is required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const binary = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const boundary = 'base44screenshotboundary';
    const metadata = { name: filename || `screenshot-${Date.now()}.png`, mimeType: 'image/png' };

    const preamble = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: image/png\r\n\r\n`;
    const closing = `\r\n--${boundary}--`;

    const body = new Blob([preamble, binary, closing]);

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return Response.json({ error: `Drive upload failed: ${errText}` }, { status: 500 });
    }

    const result = await uploadRes.json();
    return Response.json({ fileId: result.id, webViewLink: result.webViewLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});