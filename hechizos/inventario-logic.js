import { db, estadoUI } from './inventario-state.js';

const norm = (s) => s ? s.toString().trim().toLowerCase() : '';

export function getInventarioCombinado(nombrePj) {
    const invReal = db.hechizos.inventario.filter(i => i.Personaje === nombrePj);
    const enColaAdd = estadoUI.colaCambios.agregar.filter(c => c[0] === nombrePj).map(c => ({ Personaje: c[0], Hechizo: c[1], "Hechizo Afinidad": c[2], "Hechizo Hex": c[3], Tipo: c[4], Origen: c[5] }));
    const nQuitar = estadoUI.colaCambios.quitar.filter(c => c.Personaje === nombrePj).map(c => c.Hechizo);
    return [...invReal, ...enColaAdd].filter(item => !nQuitar.includes(item.Hechizo));
}

export function obtenerHechizosAprendibles(nombrePj) {
    const todosNodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];
    
    // 1. Mapear Nombre <-> ID
    const nameToId = {};
    todosNodos.forEach(n => { if(n.Nombre && n.ID) nameToId[norm(n.Nombre)] = norm(n.ID); });

    // 2. Traducir Inventario a IDs
    const invNombres = getInventarioCombinado(nombrePj).map(i => norm(i.Hechizo));
    const invIDs = new Set(invNombres.map(n => nameToId[n]).filter(Boolean));
    
    // 3. Mapear Árbol de Strings (TargetID -> [SourceID, SourceID])
    const reqs = {};
    db.hechizos.string.forEach(rel => {
        const src = norm(rel.Source); const tgt = norm(rel.Target);
        if(!src || !tgt) return; 
        if(!reqs[tgt]) reqs[tgt] = []; 
        reqs[tgt].push(src);
    });

    // 4. Evaluar cuáles cumplen TODAS las ramas
    const aprendibles = [];
    for (const [tgtID, sources] of Object.entries(reqs)) {
        if (invIDs.has(tgtID)) continue; 
        if (sources.every(s => invIDs.has(s))) {
            const info = todosNodos.find(n => norm(n.ID) === tgtID);
            if(info) aprendibles.push(info);
        }
    }
    return aprendibles.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
}
