(async function(){
  const h=document.querySelector('[data-include="header"]');
  const f=document.querySelector('[data-include="footer"]');
  try{
    // No inyectar header si la página ya trae uno integrado (.site-header)
    const hasInlineHeader = document.querySelector('.site-header');
    if(h && !hasInlineHeader){
      const rh=await fetch('partials/header.html',{cache:'no-cache'});
      h.innerHTML=await rh.text();
    }
    if(f){
      const rf=await fetch('partials/footer.html',{cache:'no-cache'});
      f.innerHTML=await rf.text();
    }
    // Intentar inicializar el UI de cuenta una vez que el header existe
    try{
      // include.js vive en /assets, por eso probamos rutas relativas
      const mod = await import('../auth.js');
      if(mod && typeof mod.initAuthUI==='function') mod.initAuthUI();
    }catch(e1){
      try{
        const mod2 = await import('/auth.js');
        if(mod2 && typeof mod2.initAuthUI==='function') mod2.initAuthUI();
      }catch(e2){ /* sin auth.js, continuar */ }
    }
  }catch(e){ console.warn('Include failed',e) }
})();

// Cableado robusto del header (hamburguesa + submenús) para todas las páginas
function wireHeader(){
  try{
    const hamb = document.getElementById('hamb');
    const navMenu = document.getElementById('mainMenu');
    const MOBILE_QUERY = '(max-width:800px)';
    const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;
    if(hamb && navMenu){
      hamb.setAttribute('aria-controls','mainMenu');
      hamb.setAttribute('aria-expanded','false');
      if(!hamb.getAttribute('aria-label')) hamb.setAttribute('aria-label','Abrir menú');
      // Evitar múltiples registros
      if(!hamb.__wired){
        hamb.__wired = true;
        hamb.addEventListener('click', function(e){
          e.stopPropagation();
          navMenu.classList.toggle('open');
          hamb.setAttribute('aria-expanded', navMenu.classList.contains('open'));
        });
        hamb.addEventListener('keydown', function(e){
          if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); hamb.click(); }
        });
        // Cerrar al hacer click fuera o con Escape (ignorar clicks dentro del header)
        document.addEventListener('click', function(e){
          const header = document.querySelector('.site-header');
          if(header && header.contains(e.target)) return;
          navMenu.classList.remove('open');
          hamb.setAttribute('aria-expanded','false');
        });
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ navMenu.classList.remove('open'); hamb.setAttribute('aria-expanded','false'); } });
        // Cerrar al navegar por un enlace
        navMenu.addEventListener('click', function(e){ const a = e.target.closest('a'); if(a){ navMenu.classList.remove('open'); hamb.setAttribute('aria-expanded','false'); } });
        // Sincronizar al cambiar tamaño
        const mq = window.matchMedia(MOBILE_QUERY);
        mq.addEventListener ? mq.addEventListener('change', ()=>{ if(!isMobile()){ navMenu.classList.remove('open'); hamb.setAttribute('aria-expanded','false'); } }) : mq.addListener && mq.addListener(()=>{ if(!isMobile()){ navMenu.classList.remove('open'); hamb.setAttribute('aria-expanded','false'); } });
      }
    }

    const dropdowns = document.querySelectorAll('.nav-item.has-sub');
    dropdowns.forEach(function(drop){
      let btn = drop.querySelector(':scope > button');
      if(!btn){ try{ btn = drop.querySelector(':scope > a'); }catch(_e){} }
      if(!btn){ btn = Array.from(drop.children).find(function(el){ return el.tagName==='BUTTON' || el.tagName==='A'; }); }
      if(btn){
        btn.setAttribute('aria-expanded','false');
        // Toggle directo por botón en móvil (un tap abre/cierra)
        btn.addEventListener('click', function(e){
          if(!isMobile()) return; // en desktop manejamos por hover
          e.preventDefault(); e.stopPropagation();
          const wasOpen = drop.classList.contains('open');
          dropdowns.forEach(d=>{ d.classList.remove('open'); const b=d.querySelector('button, a'); if(b) b.setAttribute('aria-expanded','false'); });
          if(!wasOpen){ drop.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
        });
        btn.addEventListener('keydown', function(e){ if((e.key==='Enter'||e.key===' ') && isMobile()){ e.preventDefault(); btn.click(); } });
      }
      // Desktop: hover abre/cierra
      drop.addEventListener('mouseenter',()=>{ if(window.matchMedia('(hover:hover)').matches){ dropdowns.forEach(d=>d.classList.remove('open')); drop.classList.add('open'); const b=drop.querySelector('button, a'); if(b) b.setAttribute('aria-expanded','true'); } });
      drop.addEventListener('mouseleave',()=>{ if(window.matchMedia('(hover:hover)').matches){ drop.classList.remove('open'); const b=drop.querySelector('button, a'); if(b) b.setAttribute('aria-expanded','false'); } });
    });

    // NAV-USER (Cuenta): toggle por click en todas las vistas; cierra con click fuera
    const navUser = document.getElementById('nav-user');
    if(navUser){
      const userBtn = navUser.querySelector('button, a');
      if(userBtn){
        userBtn.setAttribute('aria-expanded','false');
        userBtn.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          const was = navUser.classList.contains('open');
          // cierra otros
          dropdowns.forEach(d=>{ d.classList.remove('open'); const b=d.querySelector('button, a'); if(b) b.setAttribute('aria-expanded','false'); });
          if(!was){ navUser.classList.add('open'); userBtn.setAttribute('aria-expanded','true'); }
          else { navUser.classList.remove('open'); userBtn.setAttribute('aria-expanded','false'); }
        });
      }
    }

    // Cierre global al tocar fuera de header/menú
    document.addEventListener('click', function(e){
      const header = document.querySelector('.site-header');
      if(header && header.contains(e.target)) return; // no cerrar si clic dentro del header
      if(navMenu){ navMenu.classList.remove('open'); hamb && hamb.setAttribute && hamb.setAttribute('aria-expanded','false'); }
      dropdowns.forEach(d=>{ d.classList.remove('open'); const b=d.querySelector('button, a'); if(b) b.setAttribute('aria-expanded','false'); });
      if(navUser){ navUser.classList.remove('open'); const ub = navUser.querySelector('button, a'); if(ub) ub.setAttribute('aria-expanded','false'); }
    });

    // Tecla Escape cierra todo
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        if(navMenu){ navMenu.classList.remove('open'); hamb && hamb.setAttribute && hamb.setAttribute('aria-expanded','false'); }
        dropdowns.forEach(d=>{ d.classList.remove('open'); const b=d.querySelector('button, a'); if(b) b.setAttribute('aria-expanded','false'); });
        if(navUser){ navUser.classList.remove('open'); const ub = navUser.querySelector('button, a'); if(ub) ub.setAttribute('aria-expanded','false'); }
      }
    });

    // Nota: el toggle en móvil se maneja por el click directo en el botón
  }catch(err){ console.warn('wireHeader failed', err); }
}

document.addEventListener('DOMContentLoaded', wireHeader);
document.addEventListener('DOMContentLoaded', async ()=>{
  try{
    const mod = await import('../auth.js');
    if(mod && typeof mod.initAuthUI==='function') mod.initAuthUI();
  }catch(_){ try{ const m2 = await import('/auth.js'); if(m2 && m2.initAuthUI) m2.initAuthUI(); }catch(__){} }
});

// Minimizar header al hacer scroll para ganar espacio visual
function wireHeaderShrink(){
  try{
    const headers = document.querySelectorAll('.site-header');
    if(!headers.length) return;
    let ticking = false;
    const apply = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const shrink = y > 60; // umbral
      headers.forEach(h => h.classList.toggle('shrink', shrink));
      document.documentElement.classList.toggle('header-shrink', shrink);
      ticking = false;
    };
    const onScroll = () => { if(!ticking){ ticking = true; requestAnimationFrame(apply); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', apply);
    apply();
  }catch(err){ console.warn('wireHeaderShrink failed', err); }
}

document.addEventListener('DOMContentLoaded', wireHeaderShrink);
