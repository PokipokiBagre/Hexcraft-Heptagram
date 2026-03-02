import { statsGlobal, guardar } from './stats-state.js';

export function calcularValores(id) {
    const s = statsGlobal[id]; if(!s) return null;

    // +1 Afin por cada hechizo de ese tipo aprendido
    const bonusAfin = (tipo) => s.learnedSpells.filter(sp => sp.afin.toLowerCase().includes(tipo.toLowerCase())).length;

    const fFin = {
        fis: s.afin.fis + bonusAfin('Física'),
        ene: s.afin.ene + bonusAfin('Energética'),
        esp: s.afin.esp + bonusAfin('Espiritual'),
        man: s.afin.man + bonusAfin('Mando'),
        psi: s.afin.psi + bonusAfin('Psíquica'),
        osc: s.afin.osc + bonusAfin('Oscura')
    };

    // Bonos: +1 Roja/2 Psi | +1 Azul/4 (Magias)
    const bRoja = Math.floor(fFin.psi / 2);
    const bAzul = Math.floor((fFin.ene + fFin.esp + fFin.psi + fFin.man) / 4);
    const bVex = Math.round((fFin.osc * 75) / 50) * 50;

    return {
        r: s.vida.act, rM: s.vida.maxBase + bRoja, a: s.vida.azul + bAzul, o: s.vida.oro,
        hx: s.hex, vxM: s.vex + bVex, vxA: s.vex,
        afin: fFin, spells: s.learnedSpells, nombre: id
    };
}

export function exportarCSVCompleto() {
    let csv = "\uFEFFPersonaje,Hex,Vex,Fisica,Energetica,Espiritual,Mando,Psiquica,Oscura,CorRojos,CorRojosMax,CorAzules,GuardaOro,DanRojo,DanAzul,ElimOro,AfinHech,NomsHech,HexHech\n";
    Object.keys(statsGlobal).forEach(id => {
        const s = statsGlobal[id];
        const spA = s.learnedSpells.map(x => x.afin).join(',');
        const spN = s.learnedSpells.map(x => x.nom).join(',');
        const spH = s.learnedSpells.map(x => x.hex).join(',');
        csv += `"${id}",${s.hex},${s.vex},${s.afin.fis},${s.afin.ene},${s.afin.esp},${s.afin.man},${s.afin.psi},${s.afin.osc},${s.vida.act},${s.vida.maxBase},${s.vida.azul},${s.vida.oro},${s.dan.r},${s.dan.a},${s.dan.e},"${spA}","${spN}","${spH}"\n`;
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
    link.download = "HEX_STATS_COMPLETO.csv"; link.click();
}

