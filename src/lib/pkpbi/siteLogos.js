// Site logo mapping for KPBI partner sites
export const SITE_LOGOS = {
  LAPAK99: "https://lapak71.com/resources/images/logo.png",
  JUTAWANBET: "https://jutawanbet91.com/resources/images/logo.png",
  JUARA88: "https://juara88173.com/resources/images/logo.png",
  HOKIJITU: "https://hokijitu90.com/resources/images/logo.png",
  HOKBENTOTO: "https://cdn.areabermain.club/assets/cdn/az6/2026/02/04/20260204/b320864d719e41630e6662f49dee7ebf/logo-mobile.png",
  FATCAI99: "https://cdn.areabermain.club/assets/cdn/az8/2025/12/21/20251221/3efa72027f4b37ceb0e92d3df7bd7144/logo-fatcai99-1.png",
  DEPOBOS: "https://depobos90.com/resources/images/logo.png",
  CITAWIN: "https://cdn.areabermain.club/assets/cdn/az1/2026/01/14/20260114/2ef2245484eaf282e653a0e9771fed33/logo-new-citawin.png",
  BOSJOKO: "https://bosjoko70.com/resources/images/logo.png",
  BANDAR80: "https://bandar71.com/resources/images/logo.png",
  ARENA303: "https://cdn.areabermain.club/assets/cdn/az8/2026/01/07/20260107/a04b8cf808cf2af0d199e4f55b005c5b/arena303-logo-fix-besar.png",
  ANGKABET167: "https://angkabet90.com/resources/images/logo.png",
  PULITOTO: "https://pulitoto90.com/resources/images/logo.png",
  WDMAHJONG: "https://cdn.areabermain.club/assets/cdn/az7/2026/01/08/20260108/4fe5b0a18f377066b020eceb7fe36f58/wd-mahjong-2.png",
  WDBOS: "https://wdbos90.com/resources/images/logo.png",
  WATITOTO: "https://watitoto71.com/resources/images/logo.png",
  TVTOTO: "https://tvtoto90.com/resources/images/logo.png",
  TOPWD: "https://topwd90.com/resources/images/logo.png",
  TOPANBOS88: "https://cdn.areabermain.club/assets/cdn/az3/2025/10/14/20251014/7127b25e0a18569e6965c6ddb6660364/topanbos88.png",
  RUANGWD: "https://ruangwd90.com/resources/images/logo.png",
  PESONA805: "https://cdn.areabermain.club/assets/cdn/az7/2026/06/16/20260616/3493604da9ed4b664649e39c01becf78/new-logo-pesona805.png",
  MARKASWD: "https://cdn.areabermain.club/assets/cdn/az6/2026/02/03/20260203/ef961ffb6336c590760f37cffac2040a/test-logo-markaswd.png",
  MANCINGDUIT: "https://mancingduit90.com/resources/images/logo.png",
  LIGABANTO: "https://ligabandot92.com/resources/images/logo.png",
  LIGABANDOT: "https://ligabandot92.com/resources/images/logo.png",
  LATOTO: "https://latoto91.com/resources/images/logo.png",
};

export const FALLBACK_LOGO = "https://i.ibb.co/0RRT9XCb/d405381c-983c-45f2-b49c-d45dc2e0633c.png";

export function getSiteLogo(situsName) {
  if (!situsName) return FALLBACK_LOGO;
  const key = situsName.trim().toUpperCase();
  if (SITE_LOGOS[key]) return SITE_LOGOS[key];
  for (const [k, v] of Object.entries(SITE_LOGOS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return FALLBACK_LOGO;
}

export function hasSiteLogo(situsName) {
  if (!situsName) return false;
  const key = situsName.trim().toUpperCase();
  if (SITE_LOGOS[key]) return true;
  for (const k of Object.keys(SITE_LOGOS)) {
    if (key.includes(k) || k.includes(key)) return true;
  }
  return false;
}