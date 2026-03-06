import { db, estadoUI } from './inventario-state.js';

export function getInventarioCombinado(nombrePj) {
    const invReal = db.hechizos.inventario.filter(i => i.Personaje === nombrePj);
    const enColaAdd = estadoUI.colaCambios.agregar.filter(c => c[0] === nombrePj).map(c => ({
        Personaje: c[0], Hechizo: c[1], "Hechizo Afinidad": c[2], "Hechizo Hex": c[3], Tipo: c[4], Origen: c[5]
    }));
    const nombresAQuitar = estadoUI.colaCambios.quitar.filter(c => c.Personaje === nombrePj).map(c => c.Hechizo);
    
    return [...invReal, ...enColaAdd].filter(item => !nombresAQuitar.includes(item.Hechizo));
}

export function obtenerHechizosAprendibles(nombrePj) {
    const inventarioActual = getInventarioCombinado(nombrePj).map(i => i.Hechizo);
    const setInventario = new Set(inventarioActual);
    
    // Mapear el árbol: target -> [sources...]
    const requisitos = {};
    db.hechizos.string.forEach(rel => {
        const src = rel.Source?.trim();
        const tgt = rel.Target?.trim();
        if(!src || !tgt) return;
        if(!requisitos[tgt]) requisitos[tgt] = [];
        requisitos[tgt].push(src);
    });

    const aprendibles = [];
    const todosLosNodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];

    for (const [target, sources] of Object.entries(requisitos)) {
        if (setInventario.has(target)) continue; // Ya lo tiene
        
        // Debe poseer TODAS las ramas (Sources) que apunten a este Target
        const puedeAprender = sources.every(s => setInventario.has(s));
        
        if (puedeAprender) {
            const info = todosLosNodos.find(n => n.Nombre === target) || { Nombre: target, Afinidad: 'Desconocida', HEX: 0, Clase: '-' };
            aprendibles.push(info);
        }
    }
    
    return aprendibles.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
}
