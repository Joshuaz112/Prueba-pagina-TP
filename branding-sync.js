import{onGlobalSettings,saveGlobalSettings,readGlobalSettings}from'./assets/remote-sync.js';import{getBranding,setBranding}from'./branding.js';
export async function syncBrandingOnce(){try{const r=await readGlobalSettings();if(r&&(r.logoLeftUrl||r.logoRightUrl)){setBranding({logoLeftUrl:r.logoLeftUrl,logoRightUrl:r.logoRightUrl})}}catch(e){console.warn('No remoto',e)}}
let unsub=null;
export function startBrandingLiveSync(){if(unsub)return;unsub=onGlobalSettings(cfg=>{if(!cfg)return;const u={};if(cfg.logoLeftUrl)u.logoLeftUrl=cfg.logoLeftUrl;if(cfg.logoRightUrl)u.logoRightUrl=cfg.logoRightUrl;if(Object.keys(u).length)setBranding(u)})}
export async function saveBrandingRemote(update){const cur=getBranding();const next={...cur,...(update||{})};await saveGlobalSettings({logoLeftUrl:next.logoLeftUrl,logoRightUrl:next.logoRightUrl});return next}
