import { statsGlobal, guardarStats } from './stat-state.js';

export function calcularBonos(jugador) {
    const s = statsGlobal[jugador];
    if (!s) return null;

    // REGLAS DEL ROL:
    // +1 Roja cada 2 Física
    // +1 Azul cada 4 (Energética, Espiritual, Psíquica, Mando)
    // +Vex basado en Oscura (300/4 por punto = 75 Vex)
    
    return {
        bonoRoja: Math.floor(s.afin.fis / 2),
        bonoAzul: Math.floor((s.afin.ene + s.afin.esp + s.afin.psi + s.afin.man) / 4),
        bonoVex: s.afin.osc * 75
    };
}

export function descargarCSVStats() {
    let csv = "\uFEFFPersonaje,Nombre,Bio,Hex,AumHex,Vex,AumVex,Fisica,Energetica,Espiritual,Mando,Psiquica,Oscura,HechizosAfin,HechizosNom,HechizosHex,CorRojos,CorAzules,GuardaOro\n";
    
    Object.keys(statsGlobal).sort().forEach(p => {
        const d = statsGlobal[p];
        const spellsAfin = d.learnedSpells.map(s => s.afinidad).join(',');
        const spellsNom = d.learnedSpells.map(s => s.nombre).join(',');
        const spellsHex = d.learnedSpells.map(s => s.costo).join(',');

        csv += `"${p}","${d.nombreFull}","${d.bio}",${d.hex},0,${d.vex},0,${d.afin.fis},${d.afin.ene},${d.afin.esp},${d.afin.man},${d.afin.psi},${d.afin.osc},"${spellsAfin}","${spellsNom}","${spellsHex}","${d.vida.roja}",${d.vida.azul},${d.vida.oro}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `HEX_ESTADISTICAS_EXPORT.csv`;
    link.click();
}