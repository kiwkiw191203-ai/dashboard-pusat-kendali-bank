// Public role/permission API — re-exports the reactive store + capability helpers.
export { ROLES, getRole, useRole, setLocalRole, refreshRole, subscribeRole } from "@/lib/roleStore";

// Super Master has FULL access to everything — always returns true.
export const isSuperMaster = (r) => r?.key === "super_master";
export const canManageSystem = (r) => isSuperMaster(r);
export const canManageUsers = (r) => isSuperMaster(r);
export const canManagePermissions = (r) => isSuperMaster(r);
export const canManageFeatures = (r) => isSuperMaster(r);
export const canEditNotes = (r) => isSuperMaster(r) || r?.level >= 1;
export const canAccessFeature = (r, featurePermissions, featureKey) => {
  // Super Master bypasses ALL permission checks — always has access.
  if (isSuperMaster(r)) return true;
  const perm = featurePermissions?.find((p) => p.feature === featureKey);
  return perm ? perm.enabled : true;
};