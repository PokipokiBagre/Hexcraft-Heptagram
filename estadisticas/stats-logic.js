import { statsGlobal } from './stats-state.js';

export function calcular(id) {
    const s = statsGlobal[id]; if(!s) return null;

    // +1 Afin por cada hechizo de ese tipo
    const bAf = (t) => s.spAf.filter(a => a.toLowerCase().includes(t.toLowerCase())).length;
    const fF = {
        fi: (s.af.fi||0) + bAf('Física'), en: (s.af.en||0) + bAf('Energética'),
        es: (s.af.es||0) + bAf('Espiritual'), ma: (s.af.ma||0) + bAf('Mando'),
        ps: (s.af.ps||0) + bAf('Psíquica'), os: (s.af.os||0) + bAf('Oscura')
    };

    // Bonos: +1 Roja/2 Psi | +1 Azul/4 Magias | Vex redondeado a 50
    const bR = Math.floor(fF.ps / 2);
    const bA = Math.floor((fF.en + fF.es + fF.ps + fF.ma) / 4);
    const bV = Math.round(((fF.os||0) * 75) / 50) * 50;

    // Escala círculos: 2000 = 120px
    const sHX = Math.min(Math.max(((s.hx||0) / 2000) * 120, 50), 200);
    const sVX = Math.min(Math.max((((s.vx||0) + bV) / 2000) * 120, 50), 200);

    return {
        r: s.vi.r, rM: (s.vi.rM||0) + bR, a: (s.vi.a||0) + bA, g: s.vi.g,
        hx: s.hx, vxM: (s.vx||0) + bV, vxA: s.vx,
        af: fF, sHX, sVX, sp: s.spNom
    };
}
