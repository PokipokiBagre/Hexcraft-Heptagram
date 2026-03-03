import { statsGlobal, guardar } from './stats-state.js';

export async function cargarStatsDesdeCSV() {
    // URL del sheet con cachebust
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZD7f7YtuNnIH1P_KWABhRFDos3GnX4dkkUUE0zpRgNiKPvtbX2kOx4N-CGi0Rc4FPKYYZxXbeJFR/pub?output=csv&cachebust=" + Date.now();
    try {
        const res = await fetch(url);
        const text = await res.text();
        
        // Dividir por líneas y por comas
        const filas = text.split(/\r?\n/).map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()));

        // Limpiar memoria
        for (let k in statsGlobal) delete statsGlobal[k];

        filas.slice(1).forEach(f => {
            const id = f[0]; 
            if (!id || id === "") return;

            // Mapeo estricto A-P (0-15)
            statsGlobal[id] = {
                id: id,
                hex: f[1] || "0", vex: f[2] || "0",
                fis: f[3] || "0", ene: f[4] || "0", esp: f[5] || "0", 
                man: f[6] || "0", psi: f[7] || "0", osc: f[8] || "0",
                roja: f[9] || "0", rojaM: f[10] || "10", azul: f[11] || "0", oro: f[12] || "0",
                dR: f[13] || "0", dA: f[14] || "0", eO: f[15] || "0"
            };
        });
        guardar();
    } catch (e) { console.error("Error cargando data:", e); }
}
