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
    const { ids, clearAll, user_agent } = body || {};
    let deleted = 0;

    if (clearAll) {
      await base44.asServiceRole.entities.ActivityLog.deleteMany({});
      deleted = -1;
    } else if (Array.isArray(ids) && ids.length) {
      for (const id of ids) {
        try { await base44.asServiceRole.entities.ActivityLog.delete(id); deleted++; } catch {}
      }
    } else {
      return Response.json({ error: 'Tidak ada target' }, { status: 400 });
    }

    await base44.asServiceRole.entities.ActivityLog.create({
      email: user.email,
      name: user.full_name || user.email,
      action: 'delete',
      detail: clearAll ? 'Super Master menghapus SEMUA log aktivitas' : `Super Master menghapus ${deleted} log aktivitas`,
      ip: '',
      user_agent: user_agent || '',
    });

    return Response.json({ success: true, deleted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});