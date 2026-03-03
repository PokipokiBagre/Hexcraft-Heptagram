import { statsGlobal } from './stats-state.js';

export function calcularFichaCompleta(id) {
    const s = statsGlobal[id]; if(!s) return null;

    // 1. BONO: +1 Afinidad por cada hechizo de ese tipo aprendido
    const getBonoPorHechizos = (tipo) => s.hechizos.filter(h => h.afinidad.toLowerCase().includes(tipo.toLowerCase())).length;

    const afinidadesFinales = {
        fisica: s.afin.fis + getBonoPorHechizos('Física'),
        energetica: s.afin.ene + getBonoPorHechizos('Energética'),
        espiritual: s.afin.esp + getBonoPorHechizos('Espiritual'),
        mando: s.afin.man + getBonoPorHechizos('Mando'),
        psiquica: s.afin.psi + getBonoPorHechizos('Psíquica'),
        oscura: s.afin.osc + getBonoPorHechizos('Oscura')
    };

    // 2. VITALIDAD RAD: Base 10 + Bonos
    // Roja: +1 Corazón por cada 2 afinidades Psíquicas
    const bonoRoja = Math.floor(afinidadesFinales.psiquica / 2);
    // Azul: +1 Corazón por cada 4 de (Ene, Esp, Psi, Man)
    const bonoAzul = Math.floor((afinidadesFinales.energetica + afinidadesFinales.espiritual + afinidadesFinales.psiquica + afinidadesFinales.mando) / 4);

    // 3. VEX: +75 por cada punto de Oscura, redondeado a 50
    const rawVexBonus = afinidadesFinales.oscura * 75;
    const bonoVex = Math.round(rawVexBonus / 50) * 50;

    return {
        id: s.id,
        roja: s.vida.actual,
        rojaMax: s.vida.maxBase + bonoRoja,
        azul: s.vida.azul + bonoAzul,
        oro: s.vida.oro,
        hex: s.hex,
        vexMax: s.vex + bonoVex,
        vexActual: s.vex,
        afin: afinidadesFinales,
        hechizos: s.hechizos,
        rad: s.rad
    };
}
