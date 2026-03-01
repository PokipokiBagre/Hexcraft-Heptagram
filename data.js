import { invGlobal, objGlobal, guardar } from './state.js';

const normalizar = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

export async function cargarTodoDesdeCSV() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDaZ1Zr9YWmgW05Hzpv4IQzpMaKrgSvVUm_Yrps3DdwwPpIjD4iHrdLyPHGucuTHnwwYdM7bPrcnRO/pub?output=csv&cachebust=" + new Date().getTime();
    
    try {
        const res = await fetch(sheetURL);
        const texto = await res.text();
        const filas = texto.split(/\r?\n/).map(l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
        const mapaNorm = {}; 

        // 1. PROCESAR CATÁLOGO (A-E)
        filas.slice(1).forEach(f => {
            const nombre = f[0]; // COLUMNA A
            if (!nombre) return;
            const id = normalizar(nombre);
            objGlobal[nombre] = { tipo: f[1] || '-', mat: f[2] || '-', eff: f[3] || 'Sin descripción', rar: f[4] || 'Común' };
            mapaNorm[id] = nombre;

            // 2. PROCESAR INVENTARIOS (F-G)
            const jugs = f[5] ? f[5].split(',').map(j => j.trim()) : [];
            const cants = f[6] ? f[6].split(',').map(c => parseInt(c.trim()) || 0) : [];

            jugs.forEach((jRaw, i) => {
                let j = jRaw.includes("Corvin") ? "Corvin Vaelen" : jRaw;
                if (!invGlobal[j]) invGlobal[j] = {};
                invGlobal[j][nombre] = (invGlobal[j][nombre] || 0) + (cants[i] || 0);
            });
        });
        guardar();
    } catch (e) { console.error("ERROR CARGANDO SHEET:", e); }
}
