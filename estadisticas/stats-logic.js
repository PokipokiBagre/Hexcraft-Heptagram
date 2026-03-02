import { statsGlobal } from './stats-state.js';

export function calcularFicha(id) {
    const s = statsGlobal[id]; if(!s) return null;

    const countSpells = (tipo) => s.learnedSpells.filter(sp => sp.afin.toLowerCase().includes(tipo.toLowerCase())).length;

    const fFin = {
        fis: s.afin.fis + countSpells('Física'),
        ene: s.afin.ene + countSpells('Energética'),
        esp: s.afin.esp + countSpells('Espiritual'),
        man: s.afin.man + countSpells('Mando'),
        psi: s.afin.psi + countSpells('Psíquica'),
        osc: s.afin.osc + countSpells('Oscura')
    };

    // Bonos: +1 Roja/2 Psi | +1 Azul/4 (Ene, Esp, Psi, Man)
    const bRoja = Math.floor(fFin.psi / 2);
    const bAzul = Math.floor((fFin.ene + fFin.esp + fFin.psi + fFin.man) / 4);
    const bVex = Math.round((fFin.osc * 75) / 50) * 50;

    // Escala del círculo (Base 2000 = 100%)
    const escalaHex = (s.hex / 2000) * 100;
    const escalaVex = ((s.vex + bVex) / 2000) * 100;

    return {
        r: s.vida.act, rM: s.vida.maxBase + bRoja, a: s.vida.azul + bAzul, o: s.vida.oro,
        hx: s.hex, vxM: s.vex + bVex, vxA: s.vex,
        afin: fFin, spells: s.learnedSpells,
        sizeHex: Math.min(Math.max(escalaHex, 40), 180), // Limites visuales
        sizeVex: Math.min(Math.max(escalaVex, 40), 180)
    };
}

