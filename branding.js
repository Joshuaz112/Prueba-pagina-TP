// branding.js — Gestión de logos para la credencial
const BRANDING_KEY = 'tp_branding';

const DEFAULT_BRANDING = {
  logoLeftUrl: 'logo-liceo.webp',
  logoRightUrl: 'logo-tp.webp'
};

function readBrandingObject() {
  try {
    const raw = localStorage.getItem(BRANDING_KEY) || '{}';
    const data = JSON.parse(raw);
    return (data && typeof data === 'object') ? data : {};
  } catch {
    return {};
  }
}

function writeBrandingObject(obj) {
  localStorage.setItem(BRANDING_KEY, JSON.stringify(obj || {}));
}

export function getBranding() {
  const saved = readBrandingObject();
  const merged = { ...DEFAULT_BRANDING, ...saved };
  // Normalización básica
  if (typeof merged.logoLeftUrl !== 'string') merged.logoLeftUrl = DEFAULT_BRANDING.logoLeftUrl;
  if (typeof merged.logoRightUrl !== 'string') merged.logoRightUrl = DEFAULT_BRANDING.logoRightUrl;
  return merged;
}

export function setBranding(update) {
  const current = getBranding();
  const next = { ...current, ...(update || {}) };
  if (typeof next.logoLeftUrl !== 'string') delete next.logoLeftUrl;
  if (typeof next.logoRightUrl !== 'string') delete next.logoRightUrl;
  writeBrandingObject(next);
  return next;
}

export function resetBranding() {
  writeBrandingObject({});
  return getBranding();
}

