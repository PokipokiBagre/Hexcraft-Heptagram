import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularFicha } from './stats-logic.js';

// Genera una barra de pequeños bloques segmentados
function generarBloques(actual, max, colorClass) {
    let html = `<div class="segmented-bar">`;
    for(let i=0; i<max; i++) {
        const activo = i < actual ? 'block-filled' : '';
        html += `<div class="block ${colorClass} ${activo}"></div>`;
    }
    return html + `</div>`;
}

export function refrescarUI() {
    const catalog = document.getElementById('contenedor-catalog');
    const dash = document.getElementById('dashboard-stats');
    if(!catalog) return;

    if(estadoUI.personajeActivo) {
        catalog.style.display = "none";
        dibujarDetalle(estadoUI.personajeActivo, dash);
    } else {
        catalog.style.display = "grid";
        dash.innerHTML = "";
        dibujarCatalogo(catalog);
    }
}

function dibujarCatalogo(container) {
    const ids = Object.keys(statsGlobal).sort((a, b) => {
        const pA = estadoUI.principales.includes(a) ? 0 : 1;
        const pB = estadoUI.principales.includes(b) ? 0 : 1;
        return pA - pB || a.localeCompare(b);
    });

    if (ids.length === 0) {
        container.innerHTML = `<p style="grid-column: span 4; padding:50px; opacity:0.5;">Cargando base de datos...</p>`;
        return;
    }

    container.innerHTML = ids.map(id => {
        const d = calcularFicha(id);
        return `
            <div class="personaje-card" onclick="window.setActivo('${id}')">
                <img src="../img/imgpersonajes/${id.toLowerCase()}icon.png" class="img-p" onerror="this.src='../img/icon.png'">
                <div style="color:#d4af37; font-weight:bold; margin-bottom:10px;">${id.toUpperCase()}</div>
                ${generarBloques(d.r, d.rM, 'red-block')}
                ${estadoUI.principales.includes(id) ? '<small style="color:#0f0; display:block; margin-top:5px;">PROPIETARIO</small>' : ''}
            </div>`;
    }).join('');
}

function dibujarDetalle(id, container) {
    const d = calcularFicha(id);
    container.innerHTML = `
        <div class="stat-card">
            <button onclick="window.setActivo(null)" style="float:right; background:#444;">CERRAR</button>
            <h2 style="color:#d4af37;">${id}</h2>
            
            <div class="resource-layout">
                <div class="vitalidad-section">
                    <label>CORAZONES ROJOS</label>
                    ${generarBloques(d.r, d.rM, 'red-block')}
                    <label>CORAZONES AZULES</label>
                    ${generarBloques(d.a, 30, 'blue-block')}
                    <label>GUARDA DORADA</label>
                    ${generarBloques(d.o, 15, 'gold-block')}
                </div>
                
                <div class="energy-section">
                    <div class="energy-circle circle-hex" style="width:${d.sizeHex}px; height:${d.sizeHex}px;">
                        <span>${d.hx}<br><small>HEX</small></span>
                    </div>
                    <div class="energy-circle circle-vex" style="width:${d.sizeVex}px; height:${d.sizeVex}px;">
                        <span>${d.vxA}<br><small>VEX</small></span>
                    </div>
                </div>
            </div>

            <div class="afin-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-top:20px;">
                ${Object.entries(d.afin).map(([k,v])=>`<div class="afin-box" style="background:rgba(0,0,0,0.4); text-align:center; padding:10px; border-radius:5px;"><label style="font-size:0.6em; color:#aaa;">${k.toUpperCase()}</label><span style="color:#d4af37;">${v}</span></div>`).join('')}
            </div>
            
            <h3>HECHIZOS APRENDIDOS</h3>
            <table class="spell-table" style="width:100%;">
                ${d.spells.map(s => `<tr><td>${s.afin}</td><td>${s.nom}</td><td style="color:#d4af37;">${s.hex}</td></tr>`).join('')}
            </table>
        </div>`;
}

export function dibujarMenuOP() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="op-grid-main">
            <button onclick="window.dibujarDiseñador()" style="background:#4a004a;">CREAR PERSONAJE</button>
            <button onclick="window.actualizarTodo()" style="background:#006400;">FORZAR SINCRONIZACIÓN</button>
            <button onclick="window.descargarEstadoCSV()" style="background:#d4af37; color:#000;">DESCARGAR ESTADO</button>
            <button onclick="window.mostrarPagina('publico')" style="background:#333;">CERRAR ACCESO OP</button>
        </div>`;
}

export function dibujarDiseñador() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="stat-card" style="max-width:800px; margin:auto; text-align:left;">
            <h2 style="text-align:center;">DISEÑADOR DE PERSONAJE</h2>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
                <input id="n-id" placeholder="ID (Linda)"> <input id="n-hx" type="number" placeholder="Hex"> <input id="n-vx" type="number" placeholder="Vex">
                <input id="n-fi" type="number" placeholder="Fis"> <input id="n-en" type="number" placeholder="Ene"> <input id="n-es" type="number" placeholder="Esp">
                <input id="n-ma" type="number" placeholder="Man"> <input id="n-ps" type="number" placeholder="Psi"> <input id="n-os" type="number" placeholder="Osc">
                <input id="n-ra" type="number" placeholder="Rojo Actual"> <input id="n-rm" type="number" placeholder="Rojo Max Base"> <input id="n-aa" type="number" placeholder="Azul Actual">
            </div>
            <button onclick="window.agregarManual()" style="width:100%; background:#006400; margin-top:20px; font-weight:bold;">AGREGAR PERSONAJE A LA LISTA</button>
            <button onclick="window.mostrarPagina('admin')" style="width:100%; background:#444; margin-top:10px;">VOLVER</button>
        </div>`;
}
