import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Admin-only: approve or reject a pending user. Role is re-checked here from the
// server-side user record — never trusted from the request body.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_master') {
      return Response.json({ error: 'Forbidden — hanya Super Admin yang dapat melakukan aksi ini' }, { status: 403 });
    }

    const body = await req.json();
    const { approvalId, action, role } = body || {};
    if (!approvalId || !['approve', 'reject', 'set_role'].includes(action)) {
      return Response.json({ error: 'Permintaan tidak valid' }, { status: 400 });
    }
    const VALID_ROLES = ['super_master', 'kapten', 'kasir', 'cs'];
    if (action === 'set_role' && !VALID_ROLES.includes(role)) {
      return Response.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    const updates =
      action === 'set_role'
        ? { role }
        : {
            status: action === 'approve' ? 'approved' : 'rejected',
            approved_at: new Date().toISOString(),
            approved_by_email: user.email,
            approved_by_name: user.full_name || user.email,
            ...(role && VALID_ROLES.includes(role) ? { role } : {}),
          };

    const updated = await base44.asServiceRole.entities.UserApproval.update(approvalId, updates);

    // Push the role down to the real User record so it takes effect immediately,
    // instead of waiting for the user's next login sync.
    if (updated?.email && updated?.role) {
      try {
        const matches = await base44.asServiceRole.entities.User.filter({ email: updated.email });
        if (matches?.[0]) {
          await base44.asServiceRole.entities.User.update(matches[0].id, { role: updated.role });
        }
      } catch { /* user hasn't signed up yet — role will sync on their first login */ }
    }

    return Response.json({ success: true, record: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}