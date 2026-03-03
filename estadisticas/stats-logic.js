import { statsGlobal } from './stats-state.js';

export function calcularVidaRojaMax(p) {
    if (p.isNPC) return p.vidaRojaMax + (p.buffs?.vidaRojaMaxExtra || 0); 
    const ps = p.afinidades.psiquica + (p.buffs?.psiquica || 0);
    const es = p.afinidades.espiritual + (p.buffs?.espiritual || 0);
    const en = p.afinidades.energetica + (p.buffs?.energetica || 0);
    const ma = p.afinidades.mando + (p.buffs?.mando || 0);
    return 10 + Math.floor((ps + es + en + ma) / 4) + (p.buffs?.vidaRojaMaxExtra || 0);
}

export function calcularVexMax(p) {
    if (p.isNPC) return p.vex; // NPCs mantienen el suyo
    const oscTotal = p.afinidades.oscura + (p.buffs?.oscura || 0);
    return Math.round((oscTotal * 75) / 50) * 50;
}

export function generarCSVExportacion() {
    let csv = "\uFEFFPersonaje,Hex,Vex,Fisica,Energetica,Espiritual,Mando,Psiquica,Oscura,Corazones Rojo,Corazones Rojos Max,Corazones Azules,Guarda Dorada,Daño Rojo,Daño Azul,Eliminacion Dorada,Hechizo1,Hechizo2,Hechizo3\n";
    Object.keys(statsGlobal).sort().forEach(nombre => {
        const p = statsGlobal[nombre];
        const af = p.afinidades;
        const b = p.buffs;
        
        // VEX: 0 para jugadores (se calcula en su sheet), valor para NPCs
        const expVex = p.isPlayer ? 0 : p.vex;
        
        // Se FUSIONA la base con el buff extra para que se guarde como permanente en el CSV
        const expFis = af.fisica + b.fisica; const expEne = af.energetica + b.energetica;
        const expEsp = af.espiritual + b.espiritual; const expMan = af.mando + b.mando;
        const expPsi = af.psiquica + b.psiquica; const expOsc = af.oscura + b.oscura;
        
        const expVRMax = p.vidaRojaMax + b.vidaRojaMaxExtra;
        const expVA = p.baseVidaAzul + b.vidaAzulExtra;
        const expGD = p.baseGuardaDorada + b.guardaDoradaExtra;
        
        const expDR = p.danoRojo + b.danoRojo; const expDA = p.danoAzul + b.danoAzul; const expED = p.elimDorada + b.elimDorada;

        csv += `"${nombre}",${p.hex},${expVex},${expFis},${expEne},${expEsp},${expMan},${expPsi},${expOsc},${p.vidaRojaActual},${expVRMax},${expVA},${expGD},${expDR},${expDA},${expED},,,\n`;
    });
    return csv;
}

export function descargarArchivoCSV(contenido, nombreArchivo) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8;' }));
    link.download = nombreArchivo; link.click();
}

