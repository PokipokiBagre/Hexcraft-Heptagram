import { db } from './inventario-state.js';

const API_HECHIZOS = 'https://script.google.com/macros/s/AKfycbwNDwCKT9P25UaDQQXP2yAT1ZnvnZ8uDOFRFiGgp6i9eLwgnpUNYRpY-2MdExFmZqil9g/exec';
const CSV_PERSONAJES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQOl-ENpkVGioSaquRc1pkuNUyk-vCEQGGSAN3MMtzwcP5AjlLTLbjsc4wAdy3fcQgRhzQAZ2CtRWbx/pub?output=csv';

export async function inicializarDatos() {
    try {
        // 1. Obtener Personajes
        const resPj = await fetch(CSV_PERSONAJES + '&cb=' + new Date().getTime());
        const txtPj = await resPj.text();
        parsearCSVPersonajes(txtPj);

        // 2. Obtener Hechizos (Cifrados)
        const resHz = await fetch(API_HECHIZOS);
        const txtCifrado = await resHz.text();
        const jsonStr = decodeURIComponent(escape(window.atob(txtCifrado)));
        db.hechizos = JSON.parse(jsonStr);
        
        return true;
    } catch (e) {
        console.error("Fallo de sincronización:", e);
        return false;
    }
}

function parsearCSVPersonajes(texto) {
    const filas = texto.split(/\r?\n/).map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
    const headers = filas[0];
    
    filas.slice(1).forEach(f => {
        if(!f[0]) return;
        const nombre = f[0];
        const idenStr = f[17] || '0_1'; 
        const idenParts = idenStr.split('_');
        
        db.personajes[nombre] = {
            isPlayer: idenParts[0] === '1',
            isActive: idenParts[1] === '1',
            iconoOverride: f[18] || nombre,
            hex: f[1] ? f[1].split('_')[0] : 0,
            vex: f[2] || 0
        };
    });
}

export async function sincronizarColaBD(cola) {
    // Aquí iría el fetch POST a Google Script. Por ahora lo simulamos.
    console.log("Enviando a BD:", cola);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}
