import assert from 'node:assert/strict';

const _localStore = {};
const _sessionStore = {};
globalThis.localStorage = {
  getItem(k){ return _localStore[k] || null; },
  setItem(k,v){ _localStore[k] = String(v); },
  removeItem(k){ delete _localStore[k]; }
};
globalThis.sessionStorage = {
  getItem(k){ return _sessionStore[k] || null; },
  setItem(k,v){ _sessionStore[k] = String(v); },
  removeItem(k){ delete _sessionStore[k]; }
};

const { generateCredentialsFromStudent } = await import('./students.js');

function slugify(s=''){
  return s.normalize('NFD')
    .replace(/[^\w\s.-]/g,'')
    .replace(/[\u0300-\u036f]/g,'')
    .trim()
    .toLowerCase()
    .replace(/\s+/g,'.');
}

const sample = { nombre: 'Valentina Hurtado Ruminao', run: '23.031.375-K' };
const creds = generateCredentialsFromStudent(sample);

const runDigits = sample.run.replace(/[^0-9kK]/g,'');
const runPart = runDigits.slice(-4);
const base = slugify(sample.nombre);

assert.equal(creds.alumno.user, `${base}.${runPart}@alumnos.tp`);
assert.equal(creds.apoderado.user, `${base}.${runPart}@apoderados.tp`);

const passRe = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789]{8}$/;
assert.ok(passRe.test(creds.alumno.pass), 'Alumno pass formato inválido');
assert.ok(passRe.test(creds.apoderado.pass), 'Apoderado pass formato inválido');

console.log('generateCredentialsFromStudent ok');
