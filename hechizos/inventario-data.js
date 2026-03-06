import { db } from './inventario-state.js';

const API_HECHIZOS = 'https://script.google.com/macros/s/AKfycbyp-hLbZnjh2_r_0X7diffLulJvh38yMr1DjRLu-Kf43NAarRhTfITMeeSAiluM1Nalmg/exec';
const CSV_PERSONAJES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQOl-ENpkVGioSaquRc1pkuNUyk-vCEQGGSAN3MMtzwcP5AjlLTLbjsc4wAdy3fcQgRhzQAZ2CtRWbx/pub?output=csv';

export async function inicializarDatos() {
    try {
        // 1. Obtener Personajes
        const resPj = await fetch(CSV_PERSONAJES + '&cb=' + new Date().getTime());
        const txtPj = await resPj.text();
        parsearCSVPersonajes(txtPj);

        // 2. Obtener Hechizos (Cifrados de la API)
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
    const filas = texto.split(/\r?\n/).map(l => {
        let matches = l.match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g);
        if(!matches) return []; return matches.map(m => m.replace(/^,/, '').replace(/^"|"$/g, '').trim());
    });
    
    db.csvHeadersPersonajes = filas[0];
    
    for (let k in db.personajes) delete db.personajes[k];

    filas.slice(1).forEach(f => {
        if(!f[0]) return;
        const nombre = f[0];
        
        const idenStr = f[17] || '0_1'; 
        const idenParts = idenStr.split('_');
        
        // Parsear celdas compuestas (Afinidades) para sacar la mayor
        const getBase = (idx) => parseInt((f[idx] || '0').split('_')[0]) || 0;
        const afis = {
            'Física': getBase(3), 'Energética': getBase(4), 'Espiritual': getBase(5),
            'Mando': getBase(6), 'Psíquica': getBase(7), 'Oscura': getBase(8)
        };
        
        let mayorAfinidad = 'Ninguna'; let maxVal = -1;
        for (const [key, val] of Object.entries(afis)) {
            if(val > maxVal && val > 0) { maxVal = val; mayorAfinidad = key; }
        }

        db.personajes[nombre] = {
            isPlayer: idenParts[0] === '1',
            isActive: idenParts[1] === '1',
            iconoOverride: f[18] !== '' ? f[18] : nombre,
            hex: f[1] ? parseInt(f[1].split('_')[0]) || 0 : 0,
            mayorAfinidad: mayorAfinidad,
            rawRow: f // Guardamos la fila entera para poder exportar luego
        };
    });
}

export async function sincronizarColaBD(cola) {
    try {
        const response = await fetch(API_HECHIZOS, {
            method: 'POST',
            body: JSON.stringify({ accion: 'sincronizar_inventario', datos: cola.agregar })
        });
        const result = await response.json();
        return result.status === 'success';
    } catch (error) {
        console.error("Error al sincronizar API Hechizos:", error);
        return false;
    }
}

export function exportarCSVPersonajes() {
    let csv = db.csvHeadersPersonajes.join(",") + "\n";
    Object.keys(db.personajes).sort().forEach(nombre => {
        const p = db.personajes[nombre];
        const rowStr = p.rawRow.map((v, i) => {
            if (i === 0 || i === 1 || i === 2 || i === 9) return String(v); 
            return `"${v}"`;
        }).join(",");
        csv += rowStr + "\n";
    });

    const link = document.createElement('a');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    link.href = URL.createObjectURL(blob);
    link.download = "HEX_PERSONAJES_MODIFICADO.csv";
    link.click();
}
