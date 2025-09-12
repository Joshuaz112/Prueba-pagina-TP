
const ADMIN_USER='admin@liceo.cl'; const ADMIN_PASS='tp2025';
const K_STU='tp_students_v8'; const K_SUBJ='tp_subjects_v8';
const uid=()=>crypto.randomUUID();
const get=(k,def)=>JSON.parse(localStorage.getItem(k) || JSON.stringify(def));
const set=(k,v)=>localStorage.setItem(k, JSON.stringify(v));

export function login(email, pass){
  if(email===ADMIN_USER && pass===ADMIN_PASS){ sessionStorage.setItem('tp_admin','1'); return {role:'admin'}; }
  const all=get(K_STU,[]);
  for(const s of all){
    if(s.cuentas?.alumno?.user===email && s.cuentas?.alumno?.pass===pass){ sessionStorage.setItem('tp_student_id', s.id); return {role:'alumno', id:s.id}; }
    if(s.cuentas?.apoderado?.user===email && s.cuentas?.apoderado?.pass===pass){ sessionStorage.setItem('tp_guardian_id', s.id); return {role:'apoderado', id:s.id}; }
  }
  return null;
}
export const isAdmin=()=>sessionStorage.getItem('tp_admin')==='1';
export const currentStudentId=()=>sessionStorage.getItem('tp_student_id')||sessionStorage.getItem('tp_guardian_id');

// Students
export const listStudents=()=>get(K_STU,[]);
export const listPublicStudents=()=>listStudents().map(({id,nombre,run,curso,programa,publico,avatarUrl})=>({id,nombre,run,curso,programa,publico,avatarUrl}));
export const getStudent=id=>listStudents().find(s=>s.id===id)||null;
export function addStudent(data){ const all=listStudents(); const rec={ id:uid(), avatarUrl:'', cuentas:{alumno:{}, apoderado:{}}, notas:{}, ...data }; all.push(rec); set(K_STU,all); return rec; }
export function updateStudent(id, patch){ const a=listStudents(); const i=a.findIndex(s=>s.id===id); if(i>=0){ a[i]={...a[i],...patch}; set(K_STU,a); return a[i]; } return null; }
export function removeStudent(id){ set(K_STU, listStudents().filter(s=>s.id!==id)); }

// Subjects
export const listSubjects=()=>get(K_SUBJ,[]);
export function addSubject({nombre,nCount=5}){ const arr=listSubjects(); arr.push({id:uid(), nombre, nCount}); set(K_SUBJ,arr); return arr.at(-1); }
export function updateSubject(id,patch){ const arr=listSubjects(); const i=arr.findIndex(x=>x.id===id); if(i>=0){ arr[i]={...arr[i],...patch}; set(K_SUBJ,arr); return arr[i]; } return null; }
export function removeSubject(id){ set(K_SUBJ, listSubjects().filter(x=>x.id!==id)); }

// Grades
// record: { n: number[] } length = subject.nCount
export function getGrade(studentId, subjectId){ const s=getStudent(studentId); if(!s) return {n:[]}; return s.notas?.[subjectId] || { n:[] }; }
export function setGrade(studentId, subjectId, record){ const a=listStudents(); const i=a.findIndex(s=>s.id===studentId); if(i<0) return null; a[i].notas=a[i].notas||{}; a[i].notas[subjectId]=record; set(K_STU,a); return record; }
export const promedioN = (arr)=>{ const vals=arr.filter(v=>typeof v==='number' && !isNaN(v)); if(vals.length===0) return 0; return +(vals.reduce((x,y)=>x+y,0)/vals.length).toFixed(1); }

// Función para calcular la nota final de una asignatura
export function finalFor(studentId, subject){
  const grade = getGrade(studentId, subject.id);
  const notas = (grade.n || []).slice(0, subject.nCount);
  const promedio = promedioN(notas);
  return { promedio: promedio > 0 ? promedio : 0 };
}

// CSV import: asignatura,N1,N2,N3,N4,N5
export function importCSV(studentId, csvText){
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(h=>h.trim().toLowerCase());
  const hSubj = headers[0];
  const subjList = listSubjects();
  for(const line of lines){
    if(!line.trim()) continue;
    const parts = line.split(',').map(x=>x.trim());
    const subjName = parts[0];
    const subj = subjList.find(s=>s.nombre.toLowerCase()===subjName.toLowerCase());
    if(!subj) continue;
    const n = parts.slice(1).map(v=>Number(v||0)).slice(0, subj.nCount);
    while(n.length<subj.nCount) n.push(0);
    setGrade(studentId, subj.id, { n });
  }
}

// Seed demo
(function seed(){
  if(listStudents().length===0){
    addStudent({ nombre:'Valentina Hurtado Ruminao', run:'23.031.375-K', curso:'2° Medio', programa:'Enfermería', avatarUrl:'',
      publico:{correo:'valentina.hurtado@colegio.cl'}, privado:{telefono:'+56911112222', direccion:'Calle Ficticia 123', certificadoUrl:'https://drive.google.com/your-certificado-id'},
      cuentas:{ alumno:{user:'valentina@alumnos.cl', pass:'1234'}, apoderado:{user:'apoderado.valentina@correo.cl', pass:'1234'} }
    });
  }
  if(listSubjects().length===0){
    const s1=addSubject({nombre:'CONT.CALI.SAL.PRO.ACRE [TEO 2]', nCount:5});
    const s2=addSubject({nombre:'INTE.CLINIC. II [TEO 2]', nCount:5});
    const stu=listStudents()[0];
    setGrade(stu.id, s1.id, { n:[0,0,0,0,0] });
    setGrade(stu.id, s2.id, { n:[0,0,0,0,0] });
  }
})();


// --- Credenciales ---
function slugify(s=''){
  return (s||'').toString().normalize('NFD').replace(/[^\w\s.-]/g,'').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,'.');
}
function randPass(len=8){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out=''; for(let i=0;i<len;i++){ out += chars[Math.floor(Math.random()*chars.length)]; } return out;
}
export function generateCredentialsFromStudent(stu){
  const base = slugify(stu?.nombre||'alumno');
  const run = (stu?.run||'').replace(/[^0-9kK]/g,'');
  const user = base + (run?('.'+run.slice(-4)):'') + '@alumnos.tp';
  const pass = randPass(8);
  const apUser = base + (run?('.'+run.slice(-4)):'') + '@apoderados.tp';
  const apPass = randPass(8);
  return { alumno:{ user, pass }, apoderado:{ user: apUser, pass: apPass } };
}
export function setStudentAccounts(id, cuentas){
  const arr = listStudents();
  const i = arr.findIndex(s=>s.id===id);
  if(i<0) return null;
  arr[i] = { ...arr[i], cuentas: { ...(arr[i].cuentas||{}), ...cuentas } };
  set(K_STU, arr);
  return arr[i];
}

// Alumni (Exalumnos)
export const listAlumniPublic=()=>{
  // Datos de ejemplo de exalumnos con información del RNPIS
  return [
    {
      id: 'alumni-1',
      nombre: 'María González Pérez',
      run: '12.345.678-9',
      egreso: '2023',
      programa: 'Enfermería',
      avatarUrl: '',
      publico: { correo: 'maria.gonzalez@email.com' },
      rnpi: {
        numero: 'RNPI-2023-001234',
        url: 'https://emisorcertificados.superdesalud.gob.cl/ValidacionCertificados/'
      }
    },
    {
      id: 'alumni-2',
      nombre: 'Carlos Rodríguez Silva',
      run: '11.222.333-4',
      egreso: '2022',
      programa: 'Enfermería',
      avatarUrl: '',
      publico: { correo: 'carlos.rodriguez@email.com' },
      rnpi: {
        numero: 'RNPI-2022-005678',
        url: 'https://emisorcertificados.superdesalud.gob.cl/ValidacionCertificados/'
      }
    },
    {
      id: 'alumni-3',
      nombre: 'Ana Martínez López',
      run: '13.456.789-0',
      egreso: '2023',
      programa: 'Enfermería',
      avatarUrl: '',
      publico: { correo: 'ana.martinez@email.com' },
      rnpi: {
        numero: 'RNPI-2023-009876',
        url: 'https://emisorcertificados.superdesalud.gob.cl/ValidacionCertificados/'
      }
    },
    {
      id: 'alumni-4',
      nombre: 'Pedro Sánchez Torres',
      run: '14.567.890-1',
      egreso: '2021',
      programa: 'Enfermería',
      avatarUrl: '',
      publico: { correo: 'pedro.sanchez@email.com' },
      rnpi: {
        numero: 'RNPI-2021-003456',
        url: 'https://emisorcertificados.superdesalud.gob.cl/ValidacionCertificados/'
      }
    }
  ];
};
