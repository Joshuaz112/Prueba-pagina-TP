/* global firebase */
export const firebaseConfig={apiKey:"TU_API_KEY",authDomain:"TU_AUTH_DOMAIN",projectId:"TU_PROJECT_ID",storageBucket:"TU_STORAGE_BUCKET",messagingSenderId:"TU_SENDER_ID",appId:"TU_APP_ID"};
let app,db;
export function initFirebase(){if(app)return{app,db};if(!window.firebase){console.error("Firebase SDK no presente");return{}};app=firebase.initializeApp(firebaseConfig);db=firebase.firestore();return{app,db}}
export async function saveGlobalSettings(patch){initFirebase();const ref=db.collection('config').doc('datosGenerales');await ref.set(patch,{merge:true})}
export function onGlobalSettings(cb){initFirebase();const ref=db.collection('config').doc('datosGenerales');return ref.onSnapshot(s=>cb({id:s.id,...(s.data()||{})}))}
export async function readGlobalSettings(){initFirebase();const ref=db.collection('config').doc('datosGenerales');const s=await ref.get();return s.exists?s.data():{}}
