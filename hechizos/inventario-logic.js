export function obtenerHechizosAprendibles(nombrePj) {
    const todosNodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];
    const nameToId = {}; 
    
    todosNodos.forEach(n => { 
        if(n.Nombre && n.ID) {
            nameToId[norm(n.Nombre)] = norm(n.ID);
        } 
    });

    const invNombres = getInventarioCombinado(nombrePj).map(i => norm(i.Hechizo));
    const invIDs = new Set(invNombres.map(n => nameToId[n]).filter(Boolean));
    
    const reqs = {};
    db.hechizos.string.forEach(rel => {
        const src = norm(rel.Source); const tgt = norm(rel.Target);
        if(!src || !tgt) return; 
        if(!reqs[tgt]) reqs[tgt] = []; reqs[tgt].push(src);
    });

    const grupos = {};
    const fAf = estadoUI.filtrosAprendizaje.afinidad;
    const fCl = estadoUI.filtrosAprendizaje.clase;
    const fTx = estadoUI.filtrosAprendizaje.busqueda.toLowerCase();
    
    for (const [tgtID, sources] of Object.entries(reqs)) {
        if (invIDs.has(tgtID)) continue; 
        
        // Si posee AL MENOS UNO de los precedentes
        if (sources.some(s => invIDs.has(s))) {
            const info = todosNodos.find(n => norm(n.ID) === tgtID);
            if(info) {
                if(fAf !== 'Todos' && info.Afinidad !== fAf) continue;
                if(fCl !== 'Todos' && (!info.Clase || !info.Clase.includes(fCl))) continue;
                if(fTx && !info.Nombre.toLowerCase().includes(fTx) && !info.ID.toLowerCase().includes(fTx)) continue;

                // Formateo del título: Busca el Nombre Real si está en posesión
                const reqStrArray = sources.map(s => {
                    const isOwned = invIDs.has(s);
                    let displayName = formatearID(s); // "Hechizo X" por defecto
                    
                    if (isOwned) {
                        const nodoReal = todosNodos.find(n => norm(n.ID) === s);
                        if (nodoReal && nodoReal.Nombre) displayName = nodoReal.Nombre;
                    }
                    
                    return isOwned ? `${displayName.toUpperCase()} (EN POSESIÓN)` : displayName.toUpperCase();
                });
                
                const reqStr = reqStrArray.join(" + ");
                if(!grupos[reqStr]) grupos[reqStr] = [];
                grupos[reqStr].push(info);
            }
        }
    }
    return grupos;
}
