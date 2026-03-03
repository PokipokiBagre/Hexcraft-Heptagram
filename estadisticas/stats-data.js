import { statsGlobal, guardar } from './stats-state.js';

export async function cargarStatsDesdeCSV() {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZD7f7YtuNnIH1P_KWABhRFDos3GnX4dkkUUE0zpRgNiKPvtbX2kOx4N-CGi0Rc4FPKYYZxXbeJFR/pub?output=csv&cachebust=" + Date.now();
    try {
        const res = await fetch(url);
        const text = await res.text();
        
        // Regex para dividir por comas pero ignorar las que están dentro de comillas
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const filas = text.split(/\r?\n/).map(linea => linea.split(regex).map(celda => celda.replace(/^"|"$/g, '').trim()));

        // Limpieza de memoria
        for (let k in statsGlobal) delete statsGlobal[k];

        filas.slice(1).forEach(f => {
            const id = f[0]; if (!id) return;

            // Procesar Hechizos (Q, R, S)
            const afinidadesRaw = f[16] ? f[16].split(',').map(s => s.trim()) : [];
            const nombresRaw = f[17] ? f[17].split(',').map(s => s.trim()) : [];
            const hexRaw = f[18] ? f[18].split(',').map(s => s.trim()) : [];

            const listaHechizos = nombresRaw.map((nom, i) => ({
                nombre: nom,
                afinidad: afinidadesRaw[i] || '?',
                costo: hexRaw[i] || '0'
            })).filter(h => h.nombre !== "");

            statsGlobal[id] = {
                id: id,
                hex: parseInt(f[1]) || 0,
                vex: parseInt(f[2]) || 0,
                afin: { fis: parseInt(f[3])||0, ene: parseInt(f[4])||0, esp: parseInt(f[5])||0, man: parseInt(f[6])||0, psi: parseInt(f[7])||0, osc: parseInt(f[8])||0 },
                vida: { actual: parseInt(f[9])||0, maxBase: parseInt(f[10])||10, azul: parseInt(f[11])||0, oro: parseInt(f[12])||0 },
                rad: { dRoja: f[13]||"0", dAzul: f[14]||"0", eOro: f[15]||"0" },
                hechizos: listaHechizos
            };
        });
        guardar();
    } catch (e) { console.error("Fallo crítico al cargar Linda y los demás:", e); }
}
