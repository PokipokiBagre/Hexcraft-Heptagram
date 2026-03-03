import { statsGlobal, guardar } from './stats-state.js';

const parseCell = (str) => {
    if (!str) return { total: 0, base: 0, spells: 0, extra: 0 };
    str = str.toString().trim();
    const parts = str.split('_');
    if (parts.length === 4) return { total: parseInt(parts[0])||0, base: parseInt(parts[1])||0, spells: parseInt(parts[2])||0, extra: parseInt(parts[3])||0 };
    if (parts.length === 2) return { total: (parseInt(parts[0])||0)+(parseInt(parts[1])||0), base: parseInt(parts[0])||0, spells: 0, extra: parseInt(parts[1])||0 };
    const v = parseInt(str)||0; return { total: v, base: v, spells: 0, extra: 0 };
};

export async function cargarTodoDesdeCSV() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOl-ENpkVGioSaquRc1pkuNUyk-vCEQGGSAN3MMtzwcP5AjlLTLbjsc4wAdy3fcQgRhzQAZ2CtRWbx/pub?output=csv&cachebust=" + new Date().getTime();
    try { const res = await fetch(sheetURL); procesarTextoCSV(await res.text()); return true; } 
    catch (e) { console.error("Error cargando CSV:", e); return false; }
}

export function procesarTextoCSV(texto) {
    const filas = texto.split(/\r?\n/).map(l => {
        let matches = l.match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g);
        if(!matches) return []; return matches.map(m => m.replace(/^,/, '').replace(/^"|"$/g, '').trim());
    });

    for (let k in statsGlobal) delete statsGlobal[k];

    filas.slice(1).forEach((f, index) => {
        const nombre = f[0]; if (!nombre) return;
        const cols = Array.from({length: 17}, (_, i) => f[i] || '');
        const esJugador = index < 6;
        const est = cols[16].split('-');

        const fFis = parseCell(cols[3]); const fEne = parseCell(cols[4]);
        const fEsp = parseCell(cols[5]); const fMan = parseCell(cols[6]);
        const fPsi = parseCell(cols[7]); const fOsc = parseCell(cols[8]);

        const fVRM = parseCell(cols[10]); const fVA = parseCell(cols[11]); const fGD = parseCell(cols[12]);
        const fDR = parseCell(cols[13]); const fDA = parseCell(cols[14]); const fED = parseCell(cols[15]);

        // EXTRACCIÓN PURA: Si el CSV es antiguo (no tiene guiones), le restamos la afinidad para hallar la Base Real
        let baseVRM = fVRM.base;
        if (!cols[10].includes('_')) baseVRM = Math.max(10, fVRM.base - Math.floor(fFis.base / 2));
        
        let baseVA = fVA.base;
        if (!cols[11].includes('_')) baseVA = Math.max(0, fVA.base - Math.floor((fEsp.base + fEne.base + fPsi.base + fMan.base) / 4));

        statsGlobal[nombre] = {
            isPlayer: esJugador, isNPC: !esJugador,
            hex: parseInt(cols[1]) || 0, vex: parseInt(cols[2]) || 0,
            
            afinidades: { fisica: fFis.base, energetica: fEne.base, espiritual: fEsp.base, mando: fMan.base, psiquica: fPsi.base, oscura: fOsc.base },
            hechizos: { fisica: fFis.spells, energetica: fEne.spells, espiritual: fEsp.spells, mando: fMan.spells, psiquica: fPsi.spells, oscura: fOsc.spells, danoRojo: fDR.spells, danoAzul: fDA.spells, elimDorada: fED.spells, vidaRojaMaxExtra: fVRM.spells, vidaAzulExtra: fVA.spells, guardaDoradaExtra: fGD.spells },
            buffs: { fisica: fFis.extra, energetica: fEne.extra, espiritual: fEsp.extra, mando: fMan.extra, psiquica: fPsi.extra, oscura: fOsc.extra, danoRojo: fDR.extra, danoAzul: fDA.extra, elimDorada: fED.extra, vidaRojaMaxExtra: fVRM.extra, vidaAzulExtra: fVA.extra, guardaDoradaExtra: fGD.extra },
            
            vidaRojaActual: parseInt(cols[9]) || 0, 
            vidaRojaMax: baseVRM, // Base pura (10)
            vidaAzul: fVA.total, baseVidaAzul: baseVA, // Base pura de azules
            guardaDorada: fGD.total, baseGuardaDorada: fGD.base,
            danoRojo: fDR.base, danoAzul: fDA.base, elimDorada: fED.base,
            
            estados: { veneno: parseInt(est[0])||0, radiacion: parseInt(est[1])||0, maldito: est[2]==='1', incapacitado: est[3]==='1', debilitado: est[4]==='1', angustia: est[5]==='1', petrificacion: est[6]==='1', secuestrado: est[7]==='1', huesos: est[8]==='1', comestible: est[9]==='1', cifrado: est[10]==='1', inversion: est[11]==='1', verde: est[12]==='1' }
        };
    });
    guardar();
}
