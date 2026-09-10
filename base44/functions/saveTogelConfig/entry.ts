import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_master') {
      return Response.json({ error: 'Forbidden — Super Master only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { market_key, market_name, config, summary, user_agent } = body || {};
    if (!market_key || !Array.isArray(config)) {
      return Response.json({ error: 'Payload tidak valid' }, { status: 400 });
    }

    const payload = {
      market_key,
      market_name: market_name || market_key,
      config_json: JSON.stringify(config),
      updated_by_email: user.email,
      updated_by_name: user.full_name || user.email,
      updated_at: new Date().toISOString(),
    };

    const existing = await base44.asServiceRole.entities.TogelMarketConfig.filter({ market_key });
    let rec;
    if (existing.length > 0) {
      rec = await base44.asServiceRole.entities.TogelMarketConfig.update(existing[0].id, payload);
    } else {
      rec = await base44.asServiceRole.entities.TogelMarketConfig.create(payload);
    }

    await base44.asServiceRole.entities.ActivityLog.create({
      email: user.email,
      name: user.full_name || user.email,
      action: 'togel_config',
      detail: summary || `Hadiah & Diskon ${market_name || market_key} diperbarui`,
      ip: '',
      user_agent: user_agent || '',
    });

    return Response.json({ success: true, id: rec.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});