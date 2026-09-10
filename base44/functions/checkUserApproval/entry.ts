import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Runs as the logged-in user, but all UserApproval reads/writes go through the
// service role so a client can never fabricate its own "approved" status —
// the only trusted source of truth is this function.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const email = String(user.email || '').toLowerCase();
    const nowIso = new Date().toISOString();

    const existing = await base44.asServiceRole.entities.UserApproval.filter({ email });

    if (existing && existing.length > 0) {
      const record = existing[0];
      // The approval record's role (set by Super Admin) is authoritative — sync it
      // down to the real User record so access reflects what was configured here.
      const targetRole = record.role || user.role || 'cs';
      if (targetRole !== user.role) {
        try { await base44.asServiceRole.entities.User.update(user.id, { role: targetRole }); } catch {}
      }
      await base44.asServiceRole.entities.UserApproval.update(record.id, {
        last_login_at: nowIso,
        role: targetRole,
        name: user.full_name || record.name,
      });
      return Response.json({ status: record.status, name: record.name, email: record.email });
    }

    // Grandfather rule: anyone who already has a login-session history (i.e. logged in
    // before this approval system existed), or is currently a Super Master, is auto-approved.
    const priorSessions = await base44.asServiceRole.entities.OnlineSession.filter({ email });
    const isSuperMaster = user.role === 'super_master';
    const grandfathered = isSuperMaster || (priorSessions && priorSessions.length > 0);

    const created = await base44.asServiceRole.entities.UserApproval.create({
      email,
      name: user.full_name || email,
      role: user.role || 'cs',
      status: grandfathered ? 'approved' : 'pending',
      last_login_at: nowIso,
      ...(grandfathered
        ? { approved_at: nowIso, approved_by_name: 'Sistem (Auto-Approved)', approved_by_email: 'system' }
        : {}),
    });

    return Response.json({ status: created.status, name: created.name, email: created.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}