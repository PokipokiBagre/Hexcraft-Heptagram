import { invGlobal, objGlobal, guardar } from './state.js';

const normalizar = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

export async function cargarTodoDesdeCSV() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDaZ1Zr9YWmgW05Hzpv4IQzpMaKrgSvVUm_Yrps3DdwwPpIjD4iHrdLyPHGucuTHnwwYdM7bPrcnRO/pub?output=csv&cachebust=" + new Date().getTime();
    
    try {
        const res = await fetch(sheetURL);
        const texto = await res.text();
        const filas = texto.split(/\r?\n/).map(l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
        const mapaNorm = {}; 

        filas.slice(1).forEach(f => {
            const nombre = f[1]; // COLUMNA B
            if (!nombre) return;
            
            const id = normalizar(nombre);
            const infoNueva = { 
                tipo: f[2] || '?', 
                mat: f[3] || '?', 
                eff: f[4] || 'Sin descripción', 
                rar: f[5] || 'Común' 
            };

            const infoExistente = objGlobal[mapaNorm[id]];
            const tieneInfo = (d) => d && d.eff && d.eff !== 'Sin descripción' && d.eff !== '-' && d.eff !== '?';

            if (!mapaNorm[id] || (!tieneInfo(infoExistente) && tieneInfo(infoNueva))) {
                if (mapaNorm[id]) delete objGlobal[mapaNorm[id]];
                mapaNorm[id] = nombre;
                objGlobal[nombre] = infoNueva;
            }
        });

        filas.slice(1).forEach(f => {
            const objs = f[6] ? f[6].split(',').map(n => n.trim()) : []; // COLUMNA G
            const cant = parseInt(f[7]) || 0;                            // COLUMNA H
            const jugs = f[8] ? f[8].split(',').map(j => j.trim()) : []; // COLUMNA I

            objs.forEach(o => {
                const nombreOficial = mapaNorm[normalizar(o)] || o;
                
                // SI EL OBJETO NO ESTÁ EN EL CATÁLOGO, CREAR FICHA BÁSICA
                if (!objGlobal[nombreOficial]) {
                    objGlobal[nombreOficial] = { tipo: '?', mat: '?', eff: 'Sin descripción', rar: 'Común' };
                    mapaNorm[normalizar(o)] = nombreOficial;
                }

                jugs.forEach(jRaw => {
                    let j = jRaw.includes("Corvin") ? "Corvin Vaelen" : jRaw;
                    if (!invGlobal[j]) invGlobal[j] = {};
                    invGlobal[j][nombreOficial] = (invGlobal[j][nombreOficial] || 0) + cant;
                });
            });
        });
        guardar();
    } catch (e) { 
        console.error("ERROR CRÍTICO AL CARGAR EL SHEET:", e); 
    }
}
}

