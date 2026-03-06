import { estadoUI, db } from './inventario-state.js';
import { inicializarDatos, sincronizarColaBD, exportarCSVPersonajes } from './inventario-data.js';
import { dibujarCatalogo, renderHeaders, dibujarGrimorioGrid, dibujarGestionGrid, dibujarAprendizajeGrid, getValInfo } from './inventario-ui.js';

window.onload = async () => {
    const loader = document.getElementById('loader');
    const barra = document.getElementById('carga-progreso');

    const cacheData = localStorage.getItem('hex_hechizos_cache');
    if(cacheData) {
        try {
            const parsed = JSON.parse(cacheData);
            db.personajes = parsed.personajes; db.hechizos = parsed.hechizos; db.csvHeadersPersonajes = parsed.headers;
            if(loader) loader.style.display = 'none'; 
            window.cambiarVista('catalogo'); 
            await inicializarDatos(null);
            localStorage.setItem('hex_hechizos_cache', JSON.stringify({ personajes: db.personajes, hechizos: db.hechizos, headers: db.csvHeadersPersonajes }));
            window.cambiarVista(estadoUI.vistaActual); 
            return; 
        } catch(e) { console.warn("Caché obsoleto, recargando..."); }
    }

    const ok = await inicializarDatos(barra);
    if(!ok) { if(loader) loader.innerHTML = "<span style='color:red'>Fallo Crítico al cargar Servidores.</span>"; return; }
    localStorage.setItem('hex_hechizos_cache', JSON.stringify({ personajes: db.personajes, hechizos: db.hechizos, headers: db.csvHeadersPersonajes }));
    setTimeout(() => { if(loader) loader.style.display = 'none'; window.cambiarVista('catalogo'); }, 400); 
};

window.cambiarVista = (vista) => {
    estadoUI.vistaActual = vista;
    document.querySelectorAll('.vista-seccion').forEach(el => el.classList.add('oculto'));
    const sec = document.getElementById(`c-${vista}`);
    if(sec) sec.classList.remove('oculto');
    
    const btnCat = document.getElementById('btn-nav-catalogo');
    if(btnCat) { if(vista === 'catalogo') btnCat.classList.add('oculto'); else btnCat.classList.remove('oculto'); }

    if (vista === 'catalogo') { dibujarCatalogo(); } 
    else {
        renderHeaders(); 
        if (vista === 'grimorio') dibujarGrimorioGrid();
        if (vista === 'gestion') { actualizarTextoLogOP(); dibujarGestionGrid(); }
        if (vista === 'aprendizaje') dibujarAprendizajeGrid();
        if (vista === 'casteo') window.generarFilasCasteo();
    }
    actualizarBotonSync();
};

window.abrirGrimorio = (pj) => { estadoUI.personajeSeleccionado = pj; estadoUI.filtrosGrimorio = { afinidad: 'Todos', busqueda: '' }; window.cambiarVista('grimorio'); window.scrollTo(0,0); };
window.abrirMenuOP = () => {
    if(estadoUI.esAdmin) { estadoUI.esAdmin = false; alert("Modo OP Desactivado."); window.cambiarVista('catalogo'); return; }
    if (prompt("Contraseña:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.cambiarVista(estadoUI.vistaActual); }
};

window.setFiltro = (tipo, valor) => {
    if(tipo === 'rol') { estadoUI.filtroRol = valor; ['Todos','Jugador','NPC'].forEach(k => document.getElementById('btn-rol-'+k)?.classList.remove('btn-active')); document.getElementById('btn-rol-'+valor)?.classList.add('btn-active'); }
    if(tipo === 'act') { estadoUI.filtroAct = valor; ['Todos','Activo','Inactivo'].forEach(k => document.getElementById('btn-act-'+k)?.classList.remove('btn-active')); document.getElementById('btn-act-'+valor)?.classList.add('btn-active'); }
    dibujarCatalogo();
};

window.aplicarFiltrosGrimorio = () => { estadoUI.filtrosGrimorio.afinidad = document.getElementById('f-grim-afinidad').value; estadoUI.filtrosGrimorio.busqueda = document.getElementById('f-grim-texto').value; dibujarGrimorioGrid(); };
window.aplicarFiltrosGestion = () => { estadoUI.filtrosGestion.afinidad = document.getElementById('op-f-afinidad').value; estadoUI.filtrosGestion.clase = document.getElementById('op-f-clase').value; estadoUI.filtrosGestion.busqueda = document.getElementById('op-f-texto').value; dibujarGestionGrid(); };
window.aplicarFiltrosAprendizaje = () => { estadoUI.filtrosAprendizaje.afinidad = document.getElementById('f-apr-afinidad').value; estadoUI.filtrosAprendizaje.clase = document.getElementById('f-apr-clase').value; estadoUI.filtrosAprendizaje.busqueda = document.getElementById('f-apr-texto').value; dibujarAprendizajeGrid(); };

window.toggleRestarHex = (c) => { estadoUI.restarHexAsignacion = c; };
window.descargarCSVHex = () => { exportarCSVPersonajes(); };

function aplicarCambiosPersonaje(pj, hex, afinidad) {
    const charObj = db.personajes[pj];
    charObj.hex = Math.max(0, charObj.hex - hex); 
    const colMap = { 'Física': 3, 'Energética': 4, 'Espiritual': 5, 'Mando': 6, 'Psíquica': 7, 'Oscura': 8 };
    if (colMap[afinidad]) {
        const idx = colMap[afinidad];
        let cell = charObj.rawRow[idx];
        if (!cell || !cell.includes('_')) cell = `${cell || 0}_0_0_0_0`;
        let parts = cell.split('_');
        parts[0] = (parseInt(parts[0]) + 1).toString(); 
        if(parts.length > 2) parts[2] = (parseInt(parts[2]) + 1).toString(); 
        charObj.rawRow[idx] = parts.join('_');
    }
    const hexParts = charObj.rawRow[1].split('_'); hexParts[0] = charObj.hex.toString(); charObj.rawRow[1] = hexParts.join('_');
}

function actualizarTextoLogOP() {
    const textarea = document.getElementById('op-log-textarea'); if(!textarea) return;
    const pj = estadoUI.personajeSeleccionado; const char = db.personajes[pj];
    let out = "";
    estadoUI.logOP.descubiertos.forEach(d => { out += `Hechizo descubierto: ${d}\n`; });
    if(estadoUI.logOP.aprendidos.length > 0) {
        const list = estadoUI.logOP.aprendidos.join(", ");
        out += `Hechizo aprendido: ${list} -${estadoUI.logOP.hexGastado} Hex (${char ? char.hex : 0})\n`;
    }
    textarea.value = out; textarea.scrollTop = textarea.scrollHeight;
}

window.copiarLogOP = () => { const t = document.getElementById('op-log-textarea'); if(t) { t.select(); document.execCommand('copy'); alert("Log copiado."); } };
window.limpiarLogOP = () => { estadoUI.logOP = { descubiertos: [], aprendidos: [], hexGastado: 0 }; actualizarTextoLogOP(); };

window.accionCola = (accion, nombreHechizo, afinidad = '', hex = 0, targetVisibility = null) => {
    const pj = estadoUI.personajeSeleccionado;
    const todosNodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];
    const info = todosNodos.find(n => n.Nombre === nombreHechizo);
    
    if(accion === 'agregar') {
        const origen = document.getElementById('slicer-origen')?.value || 'OP Admin';
        estadoUI.colaCambios.agregar.push([pj, nombreHechizo, afinidad, hex, "Normal", origen]);
        if(estadoUI.restarHexAsignacion) {
            aplicarCambiosPersonaje(pj, hex, afinidad);
            estadoUI.logOP.aprendidos.push(nombreHechizo); estadoUI.logOP.hexGastado += hex;
            if(info && (!info.Conocido || info.Conocido.toString().trim().toLowerCase() !== 'si')) {
                estadoUI.colaCambios.toggleConocido.push({ Hechizo: nombreHechizo, Estado: 'si' });
                estadoUI.logOP.descubiertos.push(`${info.ID} - ${info.Nombre}`);
            }
        }
    } else if (accion === 'quitar') estadoUI.colaCambios.quitar.push({ Personaje: pj, Hechizo: nombreHechizo });
    else if (accion === 'toggle_conocido') estadoUI.colaCambios.toggleConocido.push({ Hechizo: nombreHechizo, Estado: targetVisibility });
    
    if(estadoUI.vistaActual === 'gestion') { renderHeaders(); dibujarGestionGrid(); actualizarTextoLogOP(); }
    else if(estadoUI.vistaActual === 'grimorio') { dibujarGrimorioGrid(); }
    actualizarBotonSync();
};

function actualizarBotonSync() {
    const btn = document.getElementById('btn-sync-global'); if(!btn) return;
    const h = estadoUI.colaCambios.agregar.length + estadoUI.colaCambios.quitar.length + estadoUI.colaCambios.toggleConocido.length;
    if (h > 0) { btn.classList.remove('oculto'); btn.innerText = `🔥 GUARDAR CAMBIOS AL SERVIDOR (${h}) 🔥`; } else btn.classList.add('oculto');
}

window.ejecutarSincronizacion = async () => {
    const btn = document.getElementById('btn-sync-global'); btn.innerText = "Sincronizando..."; btn.disabled = true;
    if(await sincronizarColaBD(estadoUI.colaCambios)) {
        alert("¡Base de datos actualizada con éxito!"); estadoUI.colaCambios = { agregar: [], quitar: [], toggleConocido: [] };
        if(estadoUI.restarHexAsignacion && estadoUI.esAdmin && estadoUI.logOP.aprendidos.length > 0) {
            if(confirm("El personaje ha modificado su HEX y Afinidad. ¿Descargar el nuevo CSV de estadísticas?")) exportarCSVPersonajes();
        }
        localStorage.removeItem('hex_hechizos_cache'); window.location.reload(); 
    } else alert("Error de conexión. Reintenta.");
    btn.disabled = false;
};

// =========================================================================
// MOTOR DE CASTEO DE HECHIZOS
// =========================================================================
window.generarFilasCasteo = () => {
    const contenedor = document.getElementById('casteo-filas');
    if (!contenedor) return;
    const num = parseInt(document.getElementById('cast-num').value) || 3;
    const pj = estadoUI.personajeSeleccionado;
    const charData = db.personajes[pj];
    
    // Obtenemos los hechizos que el jugador TIENE en el Grimorio
    const invReal = db.hechizos.inventario.filter(i => i.Personaje === pj).map(i => i.Hechizo);
    if(invReal.length === 0) {
        contenedor.innerHTML = `<p style="color:#ff4444; text-align:center; padding:20px;">El personaje no tiene hechizos para lanzar.</p>`;
        return;
    }

    // Ordenar alfabéticamente
    invReal.sort((a, b) => a.localeCompare(b));
    let optionsHtml = invReal.map(h => `<option value="${h}">${h}</option>`).join('');

    let html = '';
    for(let i=0; i<num; i++) {
        html += `
        <div class="casteo-row" id="row-${i}">
            <div class="casteo-input-group" style="flex: 0.5;">
                <label style="color:var(--gold); font-size:0.8em;">DADO (1-100)</label>
                <div style="display:flex; gap:5px;">
                    <button onclick="window.lanzarDado(${i})" class="dice-btn" title="Lanzar Dado">🎲</button>
                    <input type="number" id="dado-${i}" class="input-casteo" placeholder="0" min="1" max="100">
                </div>
            </div>
            <div class="casteo-input-group" style="flex: 2;">
                <label style="color:var(--gold); font-size:0.8em;">HECHIZO</label>
                <select id="spell-${i}" class="input-casteo" onchange="window.actualizarAfinidadCasteo(${i})">
                    ${optionsHtml}
                </select>
            </div>
            <div class="casteo-input-group" style="flex: 0.8;">
                <label style="color:var(--gold); font-size:0.8em;" id="afinidad-label-${i}">AFINIDAD</label>
                <input type="number" id="afinidad-${i}" class="input-casteo" value="0">
            </div>
            <div class="casteo-result" id="result-${i}">
                <span style="color:#888; text-align:center; font-style:italic;">Esperando conjuro...</span>
            </div>
        </div>`;
    }
    contenedor.innerHTML = html;
    for(let i=0; i<num; i++) window.actualizarAfinidadCasteo(i);
};

window.lanzarDado = (idx) => {
    const input = document.getElementById(`dado-${idx}`);
    if (input) input.value = Math.floor(Math.random() * 100) + 1;
};

window.actualizarAfinidadCasteo = (idx) => {
    const pj = estadoUI.personajeSeleccionado;
    const charData = db.personajes[pj];
    const spellName = document.getElementById(`spell-${idx}`).value;
    
    const todosNodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];
    const info = todosNodos.find(n => n.Nombre.trim().toLowerCase() === spellName.trim().toLowerCase());
    
    const label = document.getElementById(`afinidad-label-${idx}`);
    const input = document.getElementById(`afinidad-${idx}`);
    
    if (info && info.Afinidad) {
        label.innerText = info.Afinidad.toUpperCase();
        // Carga automática del stat de Excel
        input.value = charData.afinidades[info.Afinidad] || 0;
    } else {
        label.innerText = "AFINIDAD";
        input.value = 0;
    }
};

window.copiarPrimerHechizo = () => {
    const num = parseInt(document.getElementById('cast-num').value) || 3;
    const baseSpell = document.getElementById(`spell-0`)?.value;
    if (!baseSpell) return;

    for(let i=1; i<num; i++) {
        const select = document.getElementById(`spell-${i}`);
        if(select) { select.value = baseSpell; window.actualizarAfinidadCasteo(i); }
    }
};

window.conjurarHechizos = () => {
    const num = parseInt(document.getElementById('cast-num').value) || 3;
    const todosNodos = [...(db.hechizos.nodos || []), ...(db.hechizos.nodosOcultos || [])];

    for(let i=0; i<num; i++) {
        const dadoVal = parseInt(document.getElementById(`dado-${i}`).value);
        const afinVal = parseInt(document.getElementById(`afinidad-${i}`).value) || 0;
        const spellName = document.getElementById(`spell-${i}`).value;
        const resDiv = document.getElementById(`result-${i}`);
        const rowDiv = document.getElementById(`row-${i}`);

        if(isNaN(dadoVal) || dadoVal <= 0) {
            resDiv.innerHTML = `<span style="color:#ff4444;">Falta valor de Dado.</span>`;
            rowDiv.style.borderColor = "#ff4444";
            continue;
        }

        const info = todosNodos.find(n => n.Nombre.trim().toLowerCase() === spellName.trim().toLowerCase());
        if(!info) { resDiv.innerHTML = "Hechizo no encontrado en la DB."; continue; }

        const hexCost = parseInt(info.HEX) || 0;
        const NC = dadoVal * afinVal;
        
        const effect = getValInfo(info, ['efecto', 'Efecto']) || 'Ningún efecto base.';
        const over = getValInfo(info, ['overcast 100%', 'overcast']);
        const under = getValInfo(info, ['undercast 50%', 'undercast']);
        const esp = getValInfo(info, ['especial', 'especiales']);

        let html = `<div style="margin-bottom:5px;"><strong>Nivel de Casteo (NC): <span style="font-size:1.2em; color:white;">${NC}</span></strong> <span style="color:#aaa; font-size:0.8em;">(Costo HEX: ${hexCost})</span></div>`;

        if (NC >= hexCost * 2 && over) {
            html += `<div style="color:var(--gold); font-weight:bold; font-size:1.1em; margin-bottom:5px;">¡OVERCAST (100%)! ✨</div>
                     <div style="color:var(--cyan-magic); margin-bottom:5px;">${effect}</div>
                     <div style="color:var(--gold);"><strong>Efecto Overcast:</strong> ${over}</div>`;
            if(esp) html += `<div style="color:#dcb1f0; margin-top:5px;"><strong>Especial:</strong> ${esp}</div>`;
            rowDiv.style.borderColor = "var(--gold)";
            
        } else if (NC >= hexCost) {
            html += `<div style="color:var(--cyan-magic); font-weight:bold; font-size:1.1em; margin-bottom:5px;">¡ÉXITO! ${NC >= hexCost*2 ? '🎯' : '✔️'}</div>
                     <div style="color:var(--cyan-magic);">${effect}</div>`;
            if(esp) html += `<div style="color:#dcb1f0; margin-top:5px;"><strong>Especial:</strong> ${esp}</div>`;
            rowDiv.style.borderColor = "var(--cyan-magic)";
            
        } else if (NC >= hexCost * 0.5 && under) {
            html += `<div style="color:#ffaa00; font-weight:bold; font-size:1.1em; margin-bottom:5px;">UNDERCAST (50%) ⚠️</div>
                     <div style="color:#888; text-decoration:line-through; margin-bottom:5px;">${effect}</div>
                     <div style="color:#ffaa00;"><strong>Efecto Parcial:</strong> ${under}</div>`;
            rowDiv.style.borderColor = "#ffaa00";
            
        } else {
            html += `<div style="color:#ff4444; font-weight:bold; font-size:1.1em; margin-bottom:5px;">FALLO ❌</div>
                     <div style="color:#888; text-decoration:line-through;">${effect}</div>`;
            rowDiv.style.borderColor = "#ff4444";
        }

        resDiv.innerHTML = html;
    }
};
