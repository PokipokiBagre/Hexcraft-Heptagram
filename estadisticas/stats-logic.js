import { statsGlobal } from './stats-state.js';

export function calcularTodo(id) {
    const s = statsGlobal[id]; if(!s) return null;

    const conv = (arr) => arr.map(v => parseInt(v) || 0);

    // Suma de FEEMPO (Base + Modificadores)
    const f_b = conv(s.f_base);
    const f_fin = f_b.map((b, i) => b + (parseInt(s.f_modDir[i])||0) + (parseInt(s.f_aumPerm[i])||0) - (parseInt(s.f_disPerm[i])||0) + (parseInt(s.f_aumTemp[i])||0) - (parseInt(s.f_disTemp[i])||0) + (parseInt(s.f_aumHech[i])||0));

    // Bonos RAD
    const bRoja = Math.floor(f_fin[0] / 2); // Fisica
    const bAzul = Math.floor((f_fin[1] + f_fin[2] + f_fin[3] + f_fin[4]) / 4); // E-E-M-P

    // Cálculo RAD (Columna M)
    const r_b = conv(s.r_base);
    const r_fin = r_b.map((b, i) => {
        const total = b + (parseInt(s.r_modDir[i])||0) + (parseInt(s.r_aumPerm[i])||0) - (parseInt(s.r_disPerm[i])||0) + (parseInt(s.r_aumTemp[i])||0) - (parseInt(s.r_disTemp[i])||0);
        if(i === 1) return total + bRoja; // Max Roja
        if(i === 2) return total + bAzul; // Azules
        return total;
    });

    return {
        roja: r_fin[0], rojaMax: r_fin[1], azul: r_fin[2], oro: r_fin[3],
        hex: (parseInt(s.baseHV[0])||0) + (parseInt(s.baseHV[1])||0),
        vexMax: (parseInt(s.baseHV[2])||0) + (f_fin[5] * 75), 
        vexCur: (parseInt(s.baseHV[2])||0),
        afin: f_fin, nombre: s.nombreFull, bio: s.bio
    };
}

export function generarLineaCSV(id, n, b) {
    return `"${id},${n},${b}","0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","","","","0,10,0,0","0,0,0,0,0,0,0,0,0,0,0,0,0"\n`;
}
