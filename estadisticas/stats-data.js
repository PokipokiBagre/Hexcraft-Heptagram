import { statsGlobal, guardar } from './stats-state.js';

export async function cargarStatsDesdeCSV() {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZD7f7YtuNnIH1P_KWABhRFDos3GnX4dkkUUE0zpRgNiKPvtbX2kOx4N-CGi0Rc4FPKYYZxXbeJFR/pub?output=csv&cachebust=" + Date.now();
    try {
        const res = await fetch(url);
        const text = await res.text();
        
        // Separador simple por comas para las 16 columnas actuales (A-P)
        const filas = text.split(/\r?\n/).map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()));

        for (let k in statsGlobal) delete statsGlobal[k];

        filas.slice(1).forEach(f => {
            const id = f[0]; 
            if (!id || id === "" || id.toLowerCase().includes('personaje')) return;

            // Mapeo estricto basado en tu nueva estructura de 16 columnas
            statsGlobal[id] = {
                id: id,
                hex: f[1] || "0", vex: f[2] || "0",
                fi: f[3] || "0", en: f[4] || "0", es: f[5] || "0", 
                ma: f[6] || "0", ps: f[7] || "0", os: f[8] || "0",
                r: f[9] || "0", rm: f[10] || "10", az: f[11] || "0", go: f[12] || "0",
                dr: f[13] || "0", da: f[14] || "0", eo: f[15] || "0"
            };
        });
        guardar();
    } catch (e) { console.error("Error cargando personajes:", e); }
}
