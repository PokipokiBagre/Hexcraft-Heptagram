import { statsGlobal } from './stats-state.js';

export function calcularTodo(id) {
    const s = statsGlobal[id]; if(!s) return null;
    const conv = (arr) => arr.map(v => parseInt(v) || 0);

    // 1. Afinidades Finales FEEMPO
    const f_b = conv(s.f_base);
    const f_fin = f_b.map((b, i) => {
        return b + conv(s.f_modDir)[i] + conv(s.f_aumPerm)[i] - conv(s.f_disPerm)[i] + 
               conv(s.f_aumTemp)[i] - conv(s.f_disTemp)[i] + conv(s.f_aumHech)[i];
    });

    // 2. Bonos RAD por Afinidades
    const bonoRoja = Math.floor(f_fin[0] / 2); // Física / 2
    const bonoAzul = Math.floor((f_fin[1] + f_fin[2] + f_fin[3] + f_fin[4]) / 4); // E-E-M-P promedio

    // 3. Vitalidad RAD Final (Roja, RojaMax, Azul, Oro)
    const r_b = conv(s.r_base);
    const r_fin = r_b.map((b, i) => {
        // Aumento Permanente afecta a Base y Max simultáneamente
        const perm = conv(s.r_aumPerm)[i];
        const total = b + conv(s.r_modDir)[i] + perm - conv(s.r_disPerm)[i] + 
                      conv(s.r_aumTemp)[i] - conv(s.r_disTemp)[i];
        
        if(i === 1) return total + bonoRoja; // Roja Max con bono
        if(i === 2) return total + bonoAzul; // Azul con bono
        return total;
    });

    // 4. Hex y Vex
    const hexFinal = (parseInt(s.baseHV[0])||0) + (parseInt(s.baseHV[1])||0);
    const vexMax = (parseInt(s.baseHV[2])||0) + (f_fin[5] * 75); // Vex Base + (Oscura * 75)

    return {
        nombre: s.nombreFull, bio: s.bio,
        roja: r_fin[0], rojaMax: r_fin[1],
        azul: r_fin[2], oro: r_fin[3],
        hex: hexFinal, vex: vexMax, vexActual: parseInt(s.baseHV[2])||0,
        afin: f_fin,
        spells: s.spells.nom.map((n, i) => ({ nom: n, afin: s.spells.afin[i], hex: s.spells.hex[i] })).filter(x => x.nom)
    };
}

export function generarLineaCSV(id, n, b) {
    // Genera una línea vacía con los 26 campos para el Diseñador
    return `"${id},${n},${b}","0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","0,0,0,0,0,0","","","","0,11,7,0","0,0,0,0,0,0,0,0,0,0,0,0,0"\n`;
}
