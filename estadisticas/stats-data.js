import { statsGlobal, guardar } from './stats-state.js';

// LECTOR INTELIGENTE: Interpreta "Total_Base_Hechizos_Extra" (ej. "61_40_21_0")
const parseCell = (str) => {
    if (!str) return { total: 0, base: 0, spells: 0, extra: 0 };
    str = str.toString().trim();
    const parts = str.split('_');
    
    // Formato Nuevo: Total_Base_Hechizos_Extra
    if (parts.length === 4) {
        return { total: parseInt(parts[0])||0, base: parseInt(parts[1])||0, spells: parseInt(parts[2])||0, extra: parseInt(parts[3])||0 };
    } 
    // Soporte Legado: Base_Extra
    else if (parts.length === 2) {
        const b = parseInt(parts[0])||0;
        const e = parseInt(parts[1])||0;
        return { total: b + e, base: b, spells: 0, extra: e };
    }
    
    // Valor simple
    const v = parseInt(str)||0;
    return { total: v, base: v, spells: 0, extra: 0 };
};

export async function cargarTodoDesdeCSV() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOl-ENpkVGioSaquRc1pkuNUyk-vCEQGGSAN3MMtzwcP5AjlLTLbjsc4wAdy3fcQgRhzQAZ2CtRWbx/pub?output=csv&cachebust=" + new Date().getTime();
    try {
        const res = await fetch(sheetURL);
        const texto = await res.text();
        procesarTextoCSV(texto);
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

    filas.slice(1).forEach((f, index) => {
        const nombre = f[0]; 
        if (!nombre) return;
        const cols = Array.from({length: 17}, (_, i) => f[i] || '');
        const esJugador = index < 6;
        const est = cols[16].split('-');

        const fFis = parseCell(cols[3]); const fEne = parseCell(cols[4]);
        const fEsp = parseCell(cols[5]); const fMan = parseCell(cols[6]);
        const fPsi = parseCell(cols[7]); const fOsc = parseCell(cols[8]);

        const fVRM = parseCell(cols[10]);
        const fVA = parseCell(cols[11]);
        const fGD = parseCell(cols[12]);

        const fDR = parseCell(cols[13]);
        const fDA = parseCell(cols[14]);
        const fED = parseCell(cols[15]);

        statsGlobal[nombre] = {
            isPlayer: esJugador, isNPC: !esJugador,
            hex: parseInt(cols[1]) || 0, vex: parseInt(cols[2]) || 0,
            
            afinidades: {
                fisica: fFis.base, energetica: fEne.base, espiritual: fEsp.base, 
                mando: fMan.base, psiquica: fPsi.base, oscura: fOsc.base
            },
            hechizos: {
                fisica: fFis.spells, energetica: fEne.spells, espiritual: fEsp.spells, 
                mando: fMan.spells, psiquica: fPsi.spells, oscura: fOsc.spells,
                danoRojo: fDR.spells, danoAzul: fDA.spells, elimDorada: fED.spells,
                vidaRojaMaxExtra: fVRM.spells, vidaAzulExtra: fVA.spells, guardaDoradaExtra: fGD.spells
            },
            buffs: { 
                fisica: fFis.extra, energetica: fEne.extra, espiritual: fEsp.extra, 
                mando: fMan.extra, psiquica: fPsi.extra, oscura: fOsc.extra, 
                danoRojo: fDR.extra, danoAzul: fDA.extra, elimDorada: fED.extra, 
                vidaRojaMaxExtra: fVRM.extra, vidaAzulExtra: fVA.extra, guardaDoradaExtra: fGD.extra 
            },
            
            vidaRojaActual: parseInt(cols[9]) || 0, vidaRojaMax: fVRM.base,
            vidaAzul: fVA.base, baseVidaAzul: fVA.base,
            guardaDorada: fGD.base, baseGuardaDorada: fGD.base,
            danoRojo: fDR.base, danoAzul: fDA.base, elimDorada: fED.base,
            
            estados: { 
                veneno: parseInt(est[0]) || 0, radiacion: parseInt(est[1]) || 0, 
                maldito: est[2] === '1', incapacitado: est[3] === '1', debilitado: est[4] === '1', 
                angustia: est[5] === '1', petrificacion: est[6] === '1', secuestrado: est[7] === '1', 
                huesos: est[8] === '1', comestible: est[9] === '1', cifrado: est[10] === '1', 
                inversion: est[11] === '1', verde: est[12] === '1' 
            }
        };
    });
    guardar();
}
