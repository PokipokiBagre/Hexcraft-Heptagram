import { statsGlobal, guardar } from './stats-state.js';

export let listaJugadores = new Set();

export async function cargarTodoDesdeCSV() {
    const sheetStats = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOl-ENpkVGioSaquRc1pkuNUyk-vCEQGGSAN3MMtzwcP5AjlLTLbjsc4wAdy3fcQgRhzQAZ2CtRWbx/pub?output=csv&cachebust=" + new Date().getTime();
    const sheetObjs = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDaZ1Zr9YWmgW05Hzpv4IQzpMaKrgSvVUm_Yrps3DdwwPpIjD4iHrdLyPHGucuTHnwwYdM7bPrcnRO/pub?output=csv&cachebust=" + new Date().getTime();

    try {
        // 1. Extraer Jugadores del CSV de Objetos (Columna F = index 5)
        const resObj = await fetch(sheetObjs);
        const txtObj = await resObj.text();
        const filasObj = txtObj.split(/\r?\n/).map(l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));
        listaJugadores.clear();
        filasObj.slice(1).forEach(f => {
            if (f[5]) f[5].split(',').forEach(j => listaJugadores.add(j.trim()));
        });

        // 2. Cargar Estadísticas
        const resStats = await fetch(sheetStats);
        const txtStats = await resStats.text();
        procesarTextoCSV(txtStats);
        return true;
    } catch (e) { 
        console.error("Error cargando CSV:", e);
        return false;
    }
}

export function procesarTextoCSV(texto) {
    const filas = texto.split(/\r?\n/).map(l => {
        let matches = l.match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g);
        if(!matches) return [];
        return matches.map(m => m.replace(/^,/, '').replace(/^"|"$/g, '').trim());
    });

    for (let k in statsGlobal) delete statsGlobal[k];

    filas.slice(1).forEach(f => {
        const nombre = f[0]; 
        if (!nombre) return;
        const cols = Array.from({length: 16}, (_, i) => f[i] || '0');
        
        const esJugador = listaJugadores.has(nombre);

        statsGlobal[nombre] = {
            isPlayer: esJugador,
            isNPC: !esJugador,
            hex: parseInt(cols[1]) || 0,
            vex: parseInt(cols[2]) || 0,
            afinidades: {
                fisica: parseInt(cols[3]) || 0, energetica: parseInt(cols[4]) || 0,
                espiritual: parseInt(cols[5]) || 0, mando: parseInt(cols[6]) || 0,
                psiquica: parseInt(cols[7]) || 0, oscura: parseInt(cols[8]) || 0
            },
            vidaRojaActual: parseInt(cols[9]) || 0, vidaRojaMax: parseInt(cols[10]) || 0,
            vidaAzul: parseInt(cols[11]) || 0, baseVidaAzul: parseInt(cols[11]) || 0,
            guardaDorada: parseInt(cols[12]) || 0, baseGuardaDorada: parseInt(cols[12]) || 0,
            danoRojo: parseInt(cols[13]) || 0, danoAzul: parseInt(cols[14]) || 0, elimDorada: parseInt(cols[15]) || 0,
            
            buffs: { fisica:0, energetica:0, espiritual:0, mando:0, psiquica:0, oscura:0, danoRojo:0, danoAzul:0, elimDorada:0, vidaRojaMaxExtra:0, vidaAzulExtra:0, guardaDoradaExtra:0 },
            // NUEVO: Estados Alterados
            estados: { veneno: 0, radiacion: 0, maldito: false, incapacitado: false, debilitado: false, angustia: false, petrificacion: false, secuestrado: false, huesos: false, comestible: false, cifrado: false, inversion: false, verde: false }
        };
    });
    guardar();
}


