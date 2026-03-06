import { db, estadoUI } from './inventario-state.js';
import { getInventarioCombinado, obtenerHechizosAprendibles } from './inventario-logic.js';
import { exportarCSVPersonajes } from './inventario-data.js';

const normalizar = (str) => str ? str.toString().trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'') : '';

function getColorAfinidad(af) {
    if(af === 'Física') return { b: '#8b4513', t: '#e2a673' };
    if(af === 'Energética') return { b: '#e67e22', t: '#f3b67a' };
    if(af === 'Espiritual') return { b: '#2ecc71', t: '#7df0a7' };
    if(af === 'Mando') return { b: '#3498db', t: '#a4d3f2' };
    if(af === 'Psíquica') return { b: '#9b59b6', t: '#dcb1f0' };
    if(af === 'Oscura') return { b: 'var(--purple-magic)', t: '#c285ff' };
    return { b: '#555', t: '#fff' };
}

export function dibujarCatalogo() {
    const contenedor = document.getElementById('vista-catalogo');
    let html = `<div class="catalogo-grid">`;
    
    Object.keys(db.personajes).sort().forEach(nombre => {
        const p = db.personajes[nombre];
        if (estadoUI.filtroRol === 'Jugador' && !p.isPlayer) return; 
        if (estadoUI.filtroRol === 'NPC' && p.isPlayer) return;
        if (estadoUI.filtroAct === 'Activo' && !p.isActive) return; 
        if (estadoUI.filtroAct === 'Inactivo' && p.isActive) return;

        const img = normalizar(p.iconoOverride);
        const style = p.isPlayer ? 'player-active' : 'border: 1px solid #555; background: rgba(10,10,10,0.8);';
        const opacity = p.isActive ? '' : 'inactive-card';
        const cantHechizos = getInventarioCombinado(nombre).length;

        html += `<div class="char-card ${style} ${opacity}" onclick="window.abrirGrimorio('${nombre}')">
                    <img src="../img/imgpersonajes/${img}icon.png" onerror="this.src='../img/imgobjetos/no_encontrado.png'">
                    <h3>${nombre}</h3>
                    <p class="char-stats"><strong style="color:var(--gold)">HEX:</strong> ${p.hex}</p>
                    <p class="char-stats"><strong>Grimorio:</strong> ${cantHechizos} Hechizos</p>
                    <p class="char-stats"><strong>Af. Primaria:</strong> <span style="color:${getColorAfinidad(p.mayorAfinidad).t}">${p.mayorAfinidad}</span></p>
                 </div>`;
    });
    contenedor.innerHTML = html + `</div>`;
}

export function dibujarGrimorio() {
    const pj = estadoUI.personajeSeleccionado;
    const invData = getInventarioCombinado(pj);
    const todosLosNodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];
    
    // Aplicar Filtros Internos del Grimorio
    const fAfinidad = estadoUI.filtrosGrimorio.afinidad;
    const fTexto = estadoUI.filtrosGrimorio.busqueda.toLowerCase();
    
    const invFiltrado = invData.filter(item => {
        const hNombre = item.Hechizo.toLowerCase();
        const matchAf = fAfinidad === 'Todos' || item["Hechizo Afinidad"] === fAfinidad;
        const matchTx = !fTexto || hNombre.includes(fTexto);
        return matchAf && matchTx;
    });

    let html = `<button onclick="window.cambiarVista('catalogo')" class="btn-nav" style="margin-bottom:20px; display:inline-block;">⬅ Volver al Catálogo</button>
                <div class="player-header">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <img src="../img/imgpersonajes/${normalizar(db.personajes[pj].iconoOverride)}icon.png" class="player-icon" onerror="this.src='../img/imgobjetos/no_encontrado.png'">
                        <div>
                            <h2 style="margin:0;">${pj.toUpperCase()}</h2>
                            <p style="margin:5px 0 0 0; color:var(--gold);">HEX Disponible: <strong>${db.personajes[pj].hex}</strong></p>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                        <button onclick="window.cambiarVista('aprendizaje')" class="btn-nav" style="background:#004a4a; border-color:#00ffff;">✨ Árbol de Aprendizaje</button>
                        ${estadoUI.esAdmin ? `<button onclick="window.cambiarVista('gestion')" class="btn-nav" style="background:#4a004a; border-color:#ff00ff;">⚙️ Asignar/Quitar (OP)</button>` : ''}
                    </div>
                </div>
                
                <div class="filter-group" style="margin-bottom:30px;">
                    <select id="f-grim-afinidad" onchange="window.aplicarFiltrosGrimorio()"><option value="Todos">Todas las Afinidades</option><option>Física</option><option>Energética</option><option>Espiritual</option><option>Mando</option><option>Psíquica</option><option>Oscura</option></select>
                    <input type="text" id="f-grim-texto" class="search-bar" style="margin:0;" placeholder="Buscar en grimorio..." value="${estadoUI.filtrosGrimorio.busqueda}" onkeyup="window.aplicarFiltrosGrimorio()">
                </div>
                
                <div class="grid-inventario">`;

    if(invData.length === 0) html += `<p style="grid-column:1/-1; text-align:center; color:#aaa;">El grimorio está vacío.</p>`;
    else if(invFiltrado.length === 0) html += `<p style="grid-column:1/-1; text-align:center; color:#aaa;">Ningún hechizo coincide con la búsqueda.</p>`;

    invFiltrado.forEach(item => {
        const info = todosLosNodos.find(n => n.Nombre === item.Hechizo) || {};
        const colors = getColorAfinidad(item["Hechizo Afinidad"] || info.Afinidad);
        const esCola = estadoUI.colaCambios.agregar.some(c => c[1] === item.Hechizo) ? '<span style="color:var(--gold); font-size:0.6em;">[PENDIENTE]</span>' : '';
        
        const esValido = (val) => val && val !== '0' && val !== 0 && val !== 'Desconocido' && val !== 'null';
        const ef = esValido(info.efecto) ? `<div class="spell-efecto">✦ Efecto: <span style="color:var(--gold); font-weight:normal;">${info.efecto}</span></div>` : '';
        const tipoHTML = item.Tipo && item.Tipo !== 'Normal' ? ` | <i>Hechizo ${item.Tipo}</i>` : '';

        html += `<div class="spell-card" style="border-top-color: ${colors.b};">
                    <h3 style="color:${colors.t}">${item.Hechizo} ${esCola}</h3>
                    <div class="spell-tags">
                        <span class="spell-tag tag-hex">HEX: ${item["Hechizo Hex"] || info.HEX || 0}</span>
                        <span class="spell-tag" style="color:${colors.t}; border-color:${colors.b};">${item["Hechizo Afinidad"] || info.Afinidad}</span>
                    </div>
                    ${esValido(info.resumen) ? `<div class="spell-desc">${info.resumen}</div>` : ''}
                    ${ef}
                    ${esValido(info['overcast 100%']) ? `<div class="spell-extra"><strong>Overcast:</strong> ${info['overcast 100%']}</div>` : ''}
                    ${esValido(info['undercast 50%']) ? `<div class="spell-extra"><strong>Undercast:</strong> ${info['undercast 50%']}</div>` : ''}
                    
                    <div class="tag-origen">Origen: ${item.Origen || 'Desconocido'}${tipoHTML}</div>
                 </div>`;
    });
    document.getElementById('vista-grimorio').innerHTML = html + `</div>`;
}

export function dibujarAprendizaje() {
    const pj = estadoUI.personajeSeleccionado;
    const aprendibles = obtenerHechizosAprendibles(pj);

    let html = `<button onclick="window.cambiarVista('grimorio')" class="btn-nav" style="margin-bottom:20px; display:inline-block;">⬅ Volver al Grimorio</button>
                <div class="player-header"><h2>Árbol de Aprendizaje: ${pj}</h2></div>
                <p style="text-align:center; color:#aaa; margin-bottom:30px;">Estos hechizos se han desbloqueado porque posees todos sus nodos raíz (Sources).</p>
                <div class="grid-inventario">`;

    if(aprendibles.length === 0) html += `<p style="grid-column:1/-1; text-align:center; color:#ff4444; font-size:1.2em;">No has desbloqueado ninguna rama nueva del árbol.</p>`;

    aprendibles.forEach(h => {
        const colors = getColorAfinidad(h.Afinidad);
        const costoHex = parseInt(h.HEX) || 0;
        const pjHex = db.personajes[pj].hex;
        
        // El botón solo dice "Aprender" en verde si el jugador tiene el Hex, si no, gris
        const btnAprender = (pjHex >= costoHex) 
            ? `<button onclick="window.accionCola('agregar', '${h.Nombre}', '${h.Afinidad}', ${costoHex}, 'Mapa Hex')" class="btn-nav" style="background:#004a00; color:#fff; border-color:#00ff00; width:100%; margin-top:15px;">Aprender Hechizo</button>`
            : `<button disabled class="btn-nav" style="background:#333; color:#777; border-color:#555; width:100%; margin-top:15px; cursor:not-allowed;">No tienes HEX suficiente</button>`;

        html += `<div class="spell-card" style="border: 2px dashed ${colors.b}; background:rgba(10,20,30,0.8);">
                    <h3 style="color:${colors.t};">${h.Nombre}</h3>
                    <div class="spell-tags"><span class="spell-tag tag-hex">Coste HEX: ${costoHex}</span><span class="spell-tag">${h.Afinidad}</span></div>
                    ${h.resumen && h.resumen !== 'Desconocido' ? `<div class="spell-desc">${h.resumen}</div>` : ''}
                    ${btnAprender}
                 </div>`;
    });
    document.getElementById('vista-aprendizaje').innerHTML = html + `</div>`;
}

export function dibujarGestion() {
    const pj = estadoUI.personajeSeleccionado;
    const invNombres = getInventarioCombinado(pj).map(i => i.Hechizo);
    
    let nodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];
    const fAf = estadoUI.filtrosGestion.afinidad;
    const fTx = estadoUI.filtrosGestion.busqueda.toLowerCase();
    
    if (fAf !== 'Todos') nodos = nodos.filter(n => n.Afinidad === fAf);
    if (fTx) nodos = nodos.filter(n => n.Nombre.toLowerCase().includes(fTx));
    nodos.sort((a, b) => a.Nombre.localeCompare(b.Nombre));

    let html = `<button onclick="window.cambiarVista('grimorio')" class="btn-nav" style="margin-bottom:20px; display:inline-block;">⬅ Volver al Grimorio</button>
                <div class="player-header">
                    <h2>Gestión OP: ${pj}</h2>
                    <button onclick="window.descargarCSVHex()" class="btn-nav" style="background:#8b0000; color:white;">📥 Descargar CSV (Cambios HEX)</button>
                </div>
                
                <label class="toggle-hex">
                    <input type="checkbox" id="check-restar-hex" onchange="window.toggleRestarHex(this.checked)" ${estadoUI.restarHexAsignacion ? 'checked' : ''}>
                    Restar coste de HEX al personaje al asignar hechizo
                </label>

                <div class="filter-group" style="margin-bottom:20px;">
                    <select id="op-f-afinidad" onchange="window.aplicarFiltrosGestion()"><option value="Todos">Todas Afinidades</option><option>Física</option><option>Energética</option><option>Espiritual</option><option>Mando</option><option>Psíquica</option><option>Oscura</option></select>
                    <input type="text" id="op-f-texto" class="search-bar" style="margin:0;" placeholder="Buscar hechizo..." value="${estadoUI.filtrosGestion.busqueda}" onkeyup="window.aplicarFiltrosGestion()">
                </div>
                
                <div class="grid-inventario" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">`;

    nodos.forEach(h => {
        const loTiene = invNombres.includes(h.Nombre);
        const colores = getColorAfinidad(h.Afinidad);
        const costo = parseInt(h.HEX) || 0;
        
        const btnAccion = loTiene 
            ? `<button onclick="window.accionCola('quitar', '${h.Nombre}')" class="btn-nav" style="background:#4a0000; color:white; border-color:#ff0000; width:100%; margin-top:10px;">❌ QUITAR HECHIZO</button>`
            : `<button onclick="window.accionCola('agregar', '${h.Nombre}', '${h.Afinidad}', ${costo}, 'OP Admin')" class="btn-nav" style="background:#004a00; color:white; border-color:#00ff00; width:100%; margin-top:10px;">➕ ASIGNAR</button>`;

        html += `<div class="spell-card" style="border-left:4px solid ${colores.b}; ${loTiene ? 'box-shadow: inset 0 0 15px rgba(0,255,0,0.2);' : ''}">
                    <h3 style="color:${colores.t}; font-size:1.1em;">${h.Nombre}</h3>
                    <div class="spell-tags"><span class="spell-tag tag-hex">HEX: ${costo}</span></div>
                    ${btnAccion}
                 </div>`;
    });
    document.getElementById('vista-gestion').innerHTML = html + `</div>`;
}
