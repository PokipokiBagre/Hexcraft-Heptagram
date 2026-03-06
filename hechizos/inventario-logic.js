import { db, estadoUI } from './inventario-state.js';

export function getInventarioCombinado(nombrePj) {
    // Inventario real guardado en BD
    const invReal = db.hechizos.inventario.filter(i => i.Personaje === nombrePj);
    // Añadir los que están en cola para agregar
    const enColaAdd = estadoUI.colaCambios.agregar.filter(c => c.Personaje === nombrePj);
    // Quitar los que están en cola para eliminar
    const nombresAQuitar = estadoUI.colaCambios.quitar.filter(c => c.Personaje === nombrePj).map(c => c.Hechizo);
    
    return [...invReal, ...enColaAdd].filter(item => !nombresAQuitar.includes(item.Hechizo));
}

export function obtenerHechizosAprendibles(nombrePj) {
    const inventarioActual = getInventarioCombinado(nombrePj).map(i => i.Hechizo);
    const setInventario = new Set(inventarioActual);
    
    // Mapeamos los requisitos: { Target: [Source1, Source2] }
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
        // Si ya lo tiene, lo ignoramos
        if (setInventario.has(target)) continue;
        
        // REGLA DE ORO: Debe tener TODOS los 'sources' requeridos para este 'target'
        const puedeAprender = sources.every(s => setInventario.has(s));
        
        if (puedeAprender) {
            const info = todosLosNodos.find(n => n.Nombre === target) || { Nombre: target, Afinidad: 'Desconocida', HEX: 0, Clase: '-' };
            aprendibles.push(info);
        }
    }
    
    return aprendibles.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
}

export function filtrarHechizosGestion() {
    let nodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];
    const f = estadoUI.filtrosGestion;
    
    if (f.afinidad !== 'Todos') nodos = nodos.filter(n => n.Afinidad === f.afinidad);
    if (f.clase !== 'Todos') nodos = nodos.filter(n => n.Clase && n.Clase.includes(f.clase));
    if (f.busqueda) nodos = nodos.filter(n => n.Nombre.toLowerCase().includes(f.busqueda.toLowerCase()));
    
    return nodos.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
}
