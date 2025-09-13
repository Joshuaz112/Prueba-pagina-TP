
// auth.js — flujo unificado
const KEY = 'tp_session';

function inferRole(email=''){
  const e = (email||'').toLowerCase();
  if (e.includes('admin')) return 'admin';
  return 'alumno'; // ajusta aquí si quieres distinguir apoderado
}


export async function signIn(email, pass){
  if(!email || !pass) return null;
  const e = (email||'').trim().toLowerCase();
  const p = (pass||'').trim();

  // Admin compatibility: cualquier email que contenga "admin" debe usar la contraseña oficial
  if (e.includes('admin') && p==='tp2025'){
    const session = { email, role: 'admin', name: (email.split('@')[0]||'Admin') };
    sessionStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }

  // Try to match Student/Guardian accounts from students.js
  try{
    const mod = await import('./students.js');
    const all = (mod.listStudents && mod.listStudents()) || [];
    const byAlumno = all.find(s => s.cuentas?.alumno?.user?.toLowerCase()===e);
    if (byAlumno && (byAlumno.cuentas?.alumno?.pass || '')===p){
      const session = { email, role:'alumno', name: byAlumno.nombre || e };
      sessionStorage.setItem(KEY, JSON.stringify(session));
      if (byAlumno.id) sessionStorage.setItem('tp_student_id', byAlumno.id);
      return session;
    }
    const byAp = all.find(s => s.cuentas?.apoderado?.user?.toLowerCase()===e);
    if (byAp && (byAp.cuentas?.apoderado?.pass || '')===p){
      const session = { email, role:'apoderado', name: (byAp.nombre ? `Apoderado de ${byAp.nombre}` : e) };
      sessionStorage.setItem(KEY, JSON.stringify(session));
      if (byAp.id) sessionStorage.setItem('tp_guardian_id', byAp.id);
      return session;
    }
  }catch(err){
    console.error('Auth lookup failed', err);
  }

  return null;
}


export function signOut(){
  sessionStorage.removeItem(KEY);
  location.href = 'index.html';
}

export function getSession(){
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
  catch { return null; }
}
export function isLoggedIn(){ return !!getSession(); }

export function requireAuth(loginUrl='login.html'){
  if(!isLoggedIn()){
    const next = encodeURIComponent(location.pathname.replace(/^\//,''));
    location.href = loginUrl + '?next=' + next;
  }
}

// Rellena el dropdown "Cuenta":
// - Sin sesión -> enlace a login.
// - Con sesión -> enlaces a Inicio, Calificaciones, Mi Credencial y Cerrar sesión (más Admin si aplica).
export function initAuthUI(){
  const ses = getSession();

  // Mostrar/ocultar Calificaciones en menú principal (si existe)
  const navCalif = document.querySelector('#nav-calif');
  if (navCalif) navCalif.style.display = ses ? '' : 'none';

  // Submenú de Cuenta
  const userMenu = document.querySelector('#nav-user');
  if(!userMenu) return;

  let box = document.querySelector('#accountMenu');
  if(!box){
    box = document.createElement('div');
    box.className = 'submenu';
    box.id = 'accountMenu';
    userMenu.appendChild(box);
  }

  const nameSpan = document.querySelector('#nav-username');

  if(ses){
    // Base del menú con sesión
    box.innerHTML = `
      <a href="index.html">Inicio</a>
      <a href="calificaciones.html">Calificaciones</a>
      <a href="credencial.html">Mi Credencial</a>
      <a id="btn-logout" href="#">Cerrar sesión</a>
    `;
    if (nameSpan) nameSpan.textContent = ses.name || ses.email || 'Cuenta';

    // Admin link solo para admins (dentro del dropdown)
    if (ses.role === 'admin'){
      let adminLink = document.createElement('a');
      adminLink.id = 'account-admin';
      adminLink.href = 'admin.html';
      adminLink.textContent = 'Admin';
      box.insertBefore(adminLink, box.firstChild);
    }

    const btnLogout = document.querySelector('#btn-logout');
    if (btnLogout) btnLogout.onclick = e => { e.preventDefault(); signOut(); };
  }else{
    // Sin sesión
    box.innerHTML = `<a href="login.html">Iniciar sesión</a>`;
    if (nameSpan) nameSpan.textContent = 'Cuenta';
  }

  // Ocultar cualquier #nav-login suelto
  const lonely = document.querySelector('#nav-login');
  if (lonely) lonely.style.display = 'none';
}

