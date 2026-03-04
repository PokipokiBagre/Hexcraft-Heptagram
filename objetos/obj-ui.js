import { invGlobal, objGlobal, estadoUI } from './obj-state.js';

function drawnHEXPreserveFocus(containerId, html) {
    const activeId = document.activeElement ? document.activeElement.id : null;
    const start = document.activeElement ? document.activeElement.selectionStart : null;
    const end = document.activeElement ? document.activeElement.selectionEnd : null;
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = html;
        if (activeId && document.getElementById(activeId)) {
            const el = document.getElementById(activeId);
            el.focus(); if (el.setSelectionRange) el.setSelectionRange(start, end);
        }
    }
}

export function refrescarUI() { 
    if (estadoUI.vistaActual === 'grilla') dibujarGrillaPersonajes();
    else if (estadoUI.vistaActual === 'inventario') dibujarInventarios();
    else if (estadoUI.vistaActual === 'catalogo') dibujarCatalogo(); 
    else if (estadoUI.vistaActual === 'control') dibujarControl();
    else if (estadoUI.vistaActual === 'op-menu') dibujarMenuOP();
}

const raridadValor = { "Legendario": 3, "Raro": 2, "Común": 1, "-": 0 };
const normalizarNombre = (str) => {
    if (!str) return "";
    return str.toString().trim().toLowerCase().replace(/[áàäâ]/g,'a').replace(/[éèëê]/g,'e').replace(/[íìïî]/g,'i').replace(/[óòöô]/g,'o').replace(/[úùüû]/g,'u').replace(/\s+/g,'_').replace(/[^a-z0-9ñ_]/g,''); 
};

// NUEVA FUNCIÓN: Dibuja las tarjetas de todos los personajes (Reemplaza a los botones antiguos)
export function dibujarGrillaPersonajes() {
    let html = `<h2 style="margin-top:0;">Inventarios</h2><div class="catalogo-grid">`;
    Object.keys(invGlobal).sort().forEach(j => {
        let countComun = 0, countRaro = 0, countLeg = 0;
        
        Object.keys(invGlobal[j]).forEach(o => {
            if (invGlobal[j][o] > 0) {
                const rar = objGlobal[o]?.rar;
                if (rar === 'Legendario') countLeg += invGlobal[j][o];
                else if (rar === 'Raro') countRaro += invGlobal[j][o];
                else countComun += invGlobal[j][o];
            }
        });

        html += `
        <div class="char-card player-card" onclick="window.abrirInventario('${j}')">
            <img src="../img/imgpersonajes/${normalizarNombre(j)}icon.png" onerror="this.src='../img/imgobjetos/no_encontrado.png'">
            <h3>${j}</h3>
            <p>Comunes: <b style="color:white">${countComun}</b></p>
            <p>Raros: <b style="color:#8a2be2">${countRaro}</b> | Legendarios: <b style="color:var(--gold)">${countLeg}</b></p>
        </div>`;
    });
    html += `</div>`;
    drawnHEXPreserveFocus('contenedor-grilla', html);
}

export function dibujarInventarios() {
    if (!estadoUI.jugadorInv) return;
    const j = estadoUI.jugadorInv;
    const term = (estadoUI.busquedaInv || "").toLowerCase();
    
    let html = `
    <button onclick="window.volverAGrilla()" style="background:#444; margin-bottom: 20px;">⬅ Volver a Inventarios</button>
    <div class="player-header">
        <img src="../img/imgpersonajes/${normalizarNombre(j)}icon.png" class="player-icon" onerror="this.src='../img/imgobjetos/no_encontrado.png'">
        <div style="text-align:left; flex:1;">
            <h1 style="margin: 0; color:var(--gold);">${j.toUpperCase()}</h1>
        </div>
        ${estadoUI.esAdmin ? `<button onclick="window.mostrarPagina('control')" style="background:#4a004a; border-color:var(--gold);">Editar Stock / OP</button>` : ''}
    </div>
    <input type="text" id="busq-inv" class="search-bar" placeholder="🔍 Filtrar equipo..." value="${estadoUI.busquedaInv}" oninput="window.setBusquedaInv(this.value)">`;

    const destacados = Object.keys(invGlobal[j])
        .filter(o => invGlobal[j][o] > 0 && (!term || o.toLowerCase().includes(term)))
        .sort((a, b) => raridadValor[objGlobal[b]?.rar] - raridadValor[objGlobal[a]?.rar])
        .slice(0, 5);

    if (destacados.length > 0) {
        html += `<div class="top-items-grid">`;
        destacados.forEach(o => {
            const imgFile = normalizarNombre(o);
            const rarClase = objGlobal[o]?.rar === 'Raro' ? 'rarity-raro' : (objGlobal[o]?.rar === 'Legendario' ? 'rarity-legendario' : '');
            html += `
            <div class="top-item-card ${rarClase}">
                <img src="../img/imgobjetos/${imgFile}.png" onclick="window.verImagen(this.src)" onerror="this.src='../img/imgobjetos/no_encontrado.png'">
                <span style="font-size:0.65em; display:block; height:2.4em; overflow:hidden; color:#d4af37; cursor:pointer;" onclick="window.verImagenByName('${o}')">${o}</span>
            </div>`;
        });
        html += `</div><hr style="border:0; border-top:1px solid rgba(212,175,55,0.2); margin:20px 0;">`;
    }

    html += `<div class="table-responsive"><table><tr><th>Imagen</th><th>Objeto</th><th>Efecto</th><th>Cant</th></tr>`;
    Object.keys(invGlobal[j]).sort().forEach(o => {
        if (invGlobal[j][o] > 0 && (!term || o.toLowerCase().includes(term))) {
            html += `<tr>
                <td><img src="../img/imgobjetos/${normalizarNombre(o)}.png" class="cat-img" onclick="window.verImagen(this.src)" onerror="this.src='../img/imgobjetos/no_encontrado.png'"></td>
                <td style="font-weight:bold; color:#d4af37; cursor:pointer;" onclick="window.verImagenByName('${o}')">${o}</td>
                <td style="text-align:left; font-size:0.85em;">${objGlobal[o]?.eff}</td>
                <td><b style="font-size:1.2em">${invGlobal[j][o]}</b></td>
            </tr>`;
        }
    });
    html += "</table></div>";
    drawnHEXPreserveFocus('contenedor-jugadores', html);
}

export function dibujarCatalogo() {
    let html = "<h2>Catálogo Completo</h2><div class='filter-group'>";
    ['Todos', 'Común', 'Raro', 'Legendario'].forEach(r => {
        const active = estadoUI.filtroRar === r ? 'class="btn-active"' : '';
        html += `<button onclick="window.setRar('${r}')" ${active}>${r}</button> `;
    });
    html += "</div><div class='filter-group'>";
    ['Todos', 'Orgánico', 'Cristal', 'Metal', 'Sagrado'].forEach(m => {
        const active = estadoUI.filtroMat === m ? 'class="btn-active-mat"' : '';
        html += `<button onclick="window.setMat('${m}')" ${active}>${m}</button> `;
    });
    // Se añadió la columna TIPO a la tabla
    html += `</div><br><input type="text" id="busq-cat" class="search-bar" placeholder="🔍 Buscar objeto..." value="${estadoUI.busquedaCat}" oninput="window.setBusquedaCat(this.value)">
    <div class="table-responsive"><table><tr><th>Imagen</th><th>Nombre</th><th>Tipo</th><th>Efecto</th><th>Rareza</th></tr>`;
    
    const term = (estadoUI.busquedaCat || "").toLowerCase();
    Object.keys(objGlobal).sort().forEach(o => {
        const item = objGlobal[o];
        const matchR = estadoUI.filtroRar === 'Todos' || item.rar.trim() === estadoUI.filtroRar;
        const matchM = estadoUI.filtroMat === 'Todos' || item.mat.trim() === estadoUI.filtroMat;
        
        if (matchR && matchM && (!term || o.toLowerCase().includes(term))) {
            html += `<tr>
                <td><img src="../img/imgobjetos/${normalizarNombre(o)}.png" class="cat-img" onclick="window.verImagen(this.src)" onerror="this.src='../img/imgobjetos/no_encontrado.png'"></td>
                <td style="font-weight:bold; color:#d4af37; cursor:pointer;" onclick="window.verImagenByName('${o}')">${o}</td>
                <td style="font-size:0.85em; color:#aaa;">${item.tipo}</td>
                <td style="text-align:left; font-size:0.85em;">${item.eff}</td>
                <td style="font-size:0.85em;">${item.rar}</td>
            </tr>`;
        }
    });
    drawnHEXPreserveFocus('tabla-todos-objetos', html + "</table></div>");
}

export function dibujarControl() {
    if (!estadoUI.jugadorInv) return;
    const j = estadoUI.jugadorInv; // Ya no usa un dropdown, edita al PJ actual
    
    let html = `<h2>Edición In-Situ: ${j}</h2>
                <button onclick="window.mostrarPagina('inventario')" style="background:#444; margin-bottom: 20px;">⬅ Volver al Inventario</button>`;
    
    html += `<div class="container-hex" style="margin-bottom:20px; background:#1a0033; padding:15px; border:1px dashed #d4af37;">
                <textarea id="copy-log-stock" class="search-bar" readonly style="width:95%; height:80px; font-size:0.85em; margin-bottom:10px;">${estadoUI.logCopy || 'Bitácora de sesión...'}</textarea>
                <div style="display:flex; gap:10px;"><button onclick="window.copyToClipboard('copy-log-stock')" style="flex:3; background:#d4af37; color:#120024; font-weight:bold;">COPIAR REGISTRO TOTAL</button><button onclick="window.limpiarLog()" style="flex:1; background:#8b0000; color:white;">X</button></div>
             </div><input type="text" id="busq-op" class="search-bar" placeholder="🔍 Filtrar objeto para sumar/restar..." value="${estadoUI.busquedaOP}" oninput="window.setBusquedaOP(this.value)">
             <div class="grid-control">`;
    
    function ordenarItemsLogico() {
        return Object.keys(objGlobal).sort((a, b) => {
            const sA = invGlobal[j][a] || 0; const sB = invGlobal[j][b] || 0;
            if (sB !== sA) return sB - sA; return a.localeCompare(b);
        });
    }

    ordenarItemsLogico().forEach(o => {
        const term = estadoUI.busquedaOP.toLowerCase();
        if (!term || o.toLowerCase().includes(term)) {
            const c = invGlobal[j][o] || 0;
            html += `<div class="control-card ${c > 0 ? "item-con-stock" : ""}">
                        <span class="item-name">${o} (<b>${c}</b>)</span>
                        <div class="item-btns"><button onclick="window.hexMod('${j}','${o}',1)">+1</button><button class="btn-neg" onclick="window.hexMod('${j}','${o}',-1)">-1</button></div>
                        <div class="item-btns" style="margin-top:5px"><button onclick="window.hexMod('${j}','${o}',5)" style="background:#004a4a">+5</button><button class="btn-neg" onclick="window.hexMod('${j}','${o}',-5)" style="background:#4a0000">-5</button></div>
                     </div>`;
        }
    });
    drawnHEXPreserveFocus('panel-interactivo', html + "</div>");
}

export function dibujarMenuOP() {
    document.getElementById('menu-op-central').innerHTML = `
        <h2 style="margin-top:0;">Panel OP Maestro</h2>
        <div class="op-grid">
            <button onclick="window.mostrarCreacionObjeto()" style="background:#4a004a">Creación Rápida de Objeto</button>
            <button onclick="window.descargarInventariosJPG()" style="background:#8b0000">Descargar todos los JPGs</button>
            <button onclick="window.descargarLog()" style="background:#004a4a">Descargar Log Histórico</button>
            <button onclick="window.descargarEstadoCSV()" style="background:#d4af37; color:#000">Descargar CSV Actual</button>
        </div>`;
}

export function dibujarCreacionObjeto() {
    let html = `<h2>Creación Rápida</h2>
    <div class="container-hex" style="max-width:600px; background:rgba(30,0,60,0.9); padding:20px; border:1px solid #d4af37; border-radius:8px; margin:0 auto;">
        <input type="text" id="new-obj-name" class="search-bar" placeholder="Nombre..." oninput="window.updateCreationLog()" style="width:95%">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
            <select id="new-obj-tipo" class="search-bar" style="width:100%"><option>Consumible</option><option>Herramienta</option><option>Accesorio</option><option>Equipo</option></select>
            <select id="new-obj-mat" class="search-bar" style="width:100%"><option>Cristal</option><option>Metal</option><option>Orgánico</option><option>Sagrado</option></select>
        </div>
        <textarea id="new-obj-eff" class="search-bar" placeholder="Efecto..." oninput="window.updateCreationLog()" style="width:95%; height:60px; margin-top:10px;"></textarea>
        <select id="new-obj-rar" class="search-bar" style="width:95%; margin-top:10px;"><option>Común</option><option>Raro</option><option>Legendario</option></select>
        <h3 style="margin-top:20px; font-size:1em;">Entregar a (Opcional)</h3>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">`;
    Object.keys(invGlobal).sort().forEach(j => {
        html += `<div style="text-align:left; font-size:0.8em; border-bottom:1px solid #333; padding:5px;"><label>${j}:</label><input type="number" class="cant-input" data-player="${j}" value="0" min="0" oninput="window.updateCreationLog()"></div>`;
    });
    html += `</div>
        <div style="margin-top:20px; background:#1a0033; padding:15px; border:1px dashed #d4af37;">
            <textarea id="copy-log-crea" class="search-bar" readonly style="width:95%; height:80px; font-size:0.85em; margin-bottom:10px;"></textarea>
            <button onclick="window.copyToClipboard('copy-log-crea')" style="width:100%; background:#d4af37; color:#120024; font-weight:bold;">COPIAR REGISTRO</button>
        </div>
        <button onclick="window.ejecutarAgregarObjeto()" style="width:100%; margin-top:20px; background:#006400; font-weight:bold;">FORJAR Y REPARTIR</button>
        <button onclick="window.mostrarPagina('op-menu')" style="width:100%; margin-top:10px; background:#444;">CANCELAR</button>
    </div>`;
    drawnHEXPreserveFocus('panel-creacion', html);
    }
        
