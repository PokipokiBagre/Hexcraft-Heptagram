import { statsGlobal } from './stats-state.js';

export function calcular(id) {
    const s = statsGlobal[id]; if(!s) return null;

    const bAfin = (t) => s.spAf.filter(a => a.toLowerCase().includes(t.toLowerCase())).length;
    const fF = {
        fi: s.af.fi + bAfin('Física'), en: s.af.en + bAfin('Energética'),
        es: s.af.es + bAfin('Espiritual'), ma: s.af.ma + bAfin('Mando'),
        ps: s.af.ps + bAfin('Psíquica'), os: s.af.os + bAfin('Oscura')
    };

    const bR = Math.floor(fF.ps / 2);
    const bA = Math.floor((fF.en + fF.es + fF.ps + fF.ma) / 4);
    const bV = Math.round((fF.os * 75) / 50) * 50;

    // Escala círculos: 2000 = 120px
    const sHX = Math.min(Math.max((s.hx / 2000) * 120, 50), 200);
    const sVX = Math.min(Math.max(((s.vx + bV) / 2000) * 120, 50), 200);

    return {
        r: s.vi.r, rM: s.vi.rM + bR, a: s.vi.a + bA, g: s.vi.g,
        hx: s.hx, vxM: s.vx + bV, vxA: s.vx,
        af: fF, sp: s.sp, sHX, sVX
    };
}

