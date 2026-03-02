import { statsGlobal } from './stats-state.js';

export function calcularFicha(id) {
    const s = statsGlobal[id]; if(!s) return null;

    // +1 Afin por cada hechizo
    const bAf = (t) => s.spAf.filter(a => a.toLowerCase().includes(t.toLowerCase())).length;
    const fF = {
        fi: s.af.fi + bAf('Física'), en: s.af.en + bAf('Energética'),
        es: s.af.es + bAf('Espiritual'), ma: s.af.ma + bAf('Mando'),
        ps: s.af.ps + bAf('Psíquica'), os: s.af.os + bAf('Oscura')
    };

    // Bonos RAD
    const bR = Math.floor(fF.ps / 2);
    const bA = Math.floor((fF.en + fF.es + fF.ps + fF.ma) / 4);
    const bV = Math.round((fF.os * 75) / 50) * 50;

    // Círculos: Base 2000 Hex = 110px
    const sHX = Math.min(Math.max((s.hx / 2000) * 110, 50), 200);
    const sVX = Math.min(Math.max(((s.vx + bV) / 2000) * 110, 50), 200);

    return {
        r: s.vi.r, rM: s.vi.rM + bR, a: s.vi.a + bA, g: s.vi.g,
        hx: s.hx, vxA: s.vx, vxM: s.vx + bV,
        af: fF, sHX, sVX, sp: s.spNom
    };
}
