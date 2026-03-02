import { statsGlobal, guardar } from './stats-state.js';

const URL_STATS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZD7f7YtuNnIH1P_KWABhRFDos3GnX4dkkUUE0zpRgNiKPvtbX2kOx4N-CGi0Rc4FPKYYZxXbeJFR/pub?output=csv";
const URL_OBJS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDaZ1Zr9YWmgW05Hzpv4IQzpMaKrgSvVUm_Yrps3DdwwPpIjD4iHrdLyPHGucuTHnwwYdM7bPrcnRO/pub?output=csv";

export async function cargarTodo() {
    try {
        // 1. Cargar Estadísticas (Prioridad)
        const resS = await fetch(URL_STATS + "&cache=" + Date.now());
        const textS = await resS.text();
        const filasS = textS.split(/\r?\n/).map(l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));

        filasS.slice(1).forEach(f => {
            const id = f[0]; if(!id) return;
            statsGlobal[id] = {
                hx: parseInt(f[1])||0, vx: parseInt(f[2])||0,
                af: { fi:parseInt(f[3])||0, en:parseInt(f[4])||0, es:parseInt(f[5])||0, ma:parseInt(f[6])||0, ps:parseInt(f[7])||0, os:parseInt(f[8])||0 },
                vi: { r:parseInt(f[9])||0, rM:parseInt(f[10])||0, a:parseInt(f[11])||0, g:parseInt(f[12])||0 },
                sp: f[17] ? f[17].split(',').map(s => s.trim()) : [],
                spAf: f[16] ? f[16].split(',').map(s => s.trim()) : []
            };
        });

        // 2. Escanear Objetos para encontrar personajes faltantes
        const resO = await fetch(URL_OBJS + "&cache=" + Date.now());
        const textO = await resO.text();
        const filasO = textO.split(/\r?\n/).map(l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim()));

        filasO.slice(1).forEach(f => {
            const dueños = f[5] ? f[5].split(',').map(d => d.trim()) : [];
            dueños.forEach(d => {
                if(d && !statsGlobal[d]) {
                    statsGlobal[d] = { hx:0, vx:0, af:{fi:0,en:0,es:0,ma:0,ps:0,os:0}, vi:{r:0,rM:0,a:0,g:0}, sp:[], spAf:[] };
                }
            });
        });

        guardar();
        return true;
    } catch (e) { console.error(e); return false; }
}

