import { statsGlobal, guardar } from './stats-state.js';

export async function cargarTodoDesdeCSV() {
    // Cachebust para asegurar la versión más reciente del sheet publicado
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOl-ENpkVGioSaquRc1pkuNUyk-vCEQGGSAN3MMtzwcP5AjlLTLbjsc4wAdy3fcQgRhzQAZ2CtRWbx/pub?output=csv&cachebust=" + new Date().getTime();
    try {
        const res = await fetch(sheetURL);
        const texto = await res.text();
        procesarTextoCSV(texto);
    } catch (e) { 
        console.error("Error cargando CSV:", e);
        alert("Error de red al intentar descargar el CSV.");
    }
}

export function procesarTextoCSV(texto) {
    // Limpieza extrema: Ignora comas dentro de comillas dobles
    const filas = texto.split(/\r?\n/).map(l => {
        let matches = l.match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g);
        if(!matches) return [];
        return matches.map(m => m.replace(/^,/, '').replace(/^"|"$/g, '').trim());
    });

    // Vaciamos el estado actual para la nueva inyección
    for (let k in statsGlobal) delete statsGlobal[k];

    // Ignoramos la fila 0 (Cabeceras)
    filas.slice(1).forEach(f => {
        const nombre = f[0]; 
        if (!nombre) return;
        
        // Aseguramos que existan 16 índices (0 a 15) llenando con 0s si el CSV vino truncado
        const cols = Array.from({length: 16}, (_, i) => f[i] || '0');

        statsGlobal[nombre] = {
            hex: parseInt(cols[1]) || 0,
            vex: parseInt(cols[2]) || 0,
            afinidades: {
                fisica: parseInt(cols[3]) || 0,
                energetica: parseInt(cols[4]) || 0,
                espiritual: parseInt(cols[5]) || 0,
                mando: parseInt(cols[6]) || 0,
                psiquica: parseInt(cols[7]) || 0,
                oscura: parseInt(cols[8]) || 0
            },
            vidaRojaActual: parseInt(cols[9]) || 0,
            vidaRojaMax: parseInt(cols[10]) || 0,
            vidaAzul: parseInt(cols[11]) || 0,
            guardaDorada: parseInt(cols[12]) || 0,
            danoRojo: parseInt(cols[13]) || 0,
            danoAzul: parseInt(cols[14]) || 0,
            elimDorada: parseInt(cols[15]) || 0
        };
    });
    guardar();
}
