import { statsGlobal, guardarStats } from './stats-state.js';

export async function cargarStatsDesdeCSV() {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZD7f7YtuNnIH1P_KWABhRFDos3GnX4dkkUUE0zpRgNiKPvtbX2kOx4N-CGi0Rc4FPKYYZxXbeJFR/pub?output=csv&cachebust=" + Date.now();
    try {
        const res = await fetch(url);
        const text = await res.text();
        // Separador de filas, ignorando comas dentro de comillas
        const filas = text.split(/\r?\n/).map(l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));

        filas.slice(1).forEach(f => {
            if (!f[0]) return;

            // Columna A: [0] Personaje, [1] Nombre, [2] Descripción
            const datosA = f[0].split(',').map(s => s.trim());
            const idKey = datosA[0]; // "Linda"
            
            // Columna B: [0] Hex, [1] AumHex, [2] Vex, [3] AumVex
            const datosB = f[1] ? f[1].split(',').map(s => s.trim()) : ["0","0","0","0"];
            
            // Columna C: [0] Fis, [1] Ene, [2] Esp, [3] Man, [4] Psi, [5] Osc (FEEMPO)
            const datosC = f[2] ? f[2].split(',').map(s => s.trim()) : ["0","0","0","0","0","0"];
            
            // Columna M: [0] VidaRoja, [1] VidaAzul, [2] Oro (RAD)
            const datosM = f[12] ? f[12].split(',').map(s => s.trim()) : ["0/10","0","0"];

            statsGlobal[idKey] = {
                nombreFull: datosA[1] || idKey,
                bio: datosA[2] || "Sin descripción.",
                hex: parseInt(datosB[0]) || 0,
                vex: parseInt(datosB[2]) || 0,
                afin: {
                    fis: parseInt(datosC[0]) || 0,
                    ene: parseInt(datosC[1]) || 0,
                    esp: parseInt(datosC[2]) || 0,
                    man: parseInt(datosC[3]) || 0,
                    psi: parseInt(datosC[4]) || 0,
                    osc: parseInt(datosC[5]) || 0
                },
                vida: {
                    roja: datosM[0] || "0/10",
                    azul: parseInt(datosM[1]) || 0,
                    oro: parseInt(datosM[2]) || 0
                },
                learnedSpells: [] // Se puede mapear de las columnas N-Z luego
            };
        });
        guardarStats();
    } catch (e) { console.error("Error de conexión:", e); }
}
