import { statsGlobal, estadoUI } from './stats-state.js';
import { calcular } from './stats-logic.js';

function bloques(cur, min, cls) {
    let total = Math.max(cur, min);
    let h = `<div class="block-grid">`;
    for(let i=0; i<total; i++) h += `<div class="blk ${cls} ${i < cur ? 'on' : ''}"></div>`;
    return h + `</div>`;
}

export function refrescarUI() {
    const catalog = document.getElementById('contenedor-catalog');
    const dash = document.getElementById('dashboard-stats');
    if(!catalog || !dash) return;

    if(estadoUI.personajeActivo) {
        catalog.style.display = "none"; dash.style.display = "block";
        dibujarDetalle(estadoUI.personajeActivo, dash);
    } else {
        catalog.style.display = "grid"; dash.style.display = "none";
        dibujarCatalogo(catalog);
    }
}

function dibujarCatalogo(container) {
    const ids = Object.keys(statsGlobal).sort((a,b) => {
        const pA = estadoUI.principales.includes(a) ? 0 : 1;
        const pB = estadoUI.principales.includes(b) ? 0 : 1;
        return pA - pB || a.localeCompare(b);
    });
    container.innerHTML = ids.map(id => {
        const d = calcular(id);
        const img = `../img/imgpersonajes/${id.toLowerCase().replace(/\s+/g,'')}icon.png`;
        return `
            <div class="personaje-card" onclick="window.setActivo('${id}')">
                <img src="${img}" class="img-p" onerror="this.src='../img/icon.png'">
                <div class="name-tag">${id.toUpperCase()}</div>
                ${bloques(d.r, d.rM, 'b-red')}
                ${estadoUI.principales.includes(id) ? '<small class="owner-tag">PRINCIPAL</small>' : ''}
            </div>`;
    }).join('');
}

function dibujarDetalle(id, container) {
    const d = calcular(id);
    const img = `../img/imgpersonajes/${id.toLowerCase().replace(/\s+/g,'')}icon.png`;
    container.innerHTML = `
        <div class="stat-card detail-view">
            <img src="${img}" class="img-detail" onerror="this.src='../img/icon.png'">
            <button onclick="window.setActivo(null)" class="btn-close">⬅ VOLVER</button>
            <h2 class="gold-t">${id}</h2>
            
            <div class="energy-row">
                <div class="circle c-hex" style="width:${d.sHX}px; height:${d.sHX}px;">${d.hx}<br><small>HEX</small></div>
                <div class="circle c-vex" style="width:${d.sVX}px; height:${d.sVX}px;">${d.vxA}<br><small>VEX</small></div>
            </div>

            <div class="res-sec">
                <label class="red-t">VITALIDAD ROJA (RAD)</label>${bloques(d.r, d.rM, 'b-red')}
                <label class="blue-t">VITALIDAD AZUL</label>${bloques(d.a, 30, 'b-blue')}
                <label class="gold-t">GUARDA DORADA</label>${bloques(d.g, 15, 'b-gold')}
            </div>

            <div class="afin-row">${Object.entries(d.af).map(([k,v])=>`<div class="af-box"><label>${k.toUpperCase()}</label><span>${v}</span></div>`).join('')}</div>
            
            <h3 class="gold-t">HECHIZOS (${d.sp.length})</h3>
            <div class="spell-container">
                ${d.sp.map(s => `<div class="spell-tag">${s}</div>`).join('')}
            </div>
        </div>`;
}

export function dibujarMenuOP() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="stat-card op-menu">
            <h2 class="gold-t">ACCESO OP</h2>
            <div class="op-grid">
                <button onclick="window.dibujarDiseñador()" style="background:#4a004a;">CREAR PERSONAJE</button>
                <button onclick="window.actualizarTodo()" style="background:#006400;">SINCRONIZAR CSV</button>
                <button onclick="window.mostrarPagina('publico')" style="background:#333;">CERRAR</button>
            </div>
        </div>`;
}

export function dibujarDiseñador() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="stat-card designer-form">
            <h2 class="gold-t">NUEVO PERSONAJE (A-S)</h2>
            <div class="form-grid">
                <div class="input-group"><label>ID</label><input id="n-id"></div>
                <div class="input-group"><label>Hex</label><input id="n-hx" type="number" value="0"></div>
                <div class="input-group"><label>Vex</label><input id="n-vx" type="number" value="0"></div>
                <div class="input-group"><label>Psi</label><input id="n-ps" type="number" value="0"></div>
                <div class="input-group"><label>Rojo Act</label><input id="n-ra" type="number" value="0"></div>
                <div class="input-group"><label>Rojo Max</label><input id="n-rm" type="number" value="0"></div>
                <div class="input-group"><label>Azul Act</label><input id="n-aa" type="number" value="0"></div>
                <div class="input-group"><label>Guarda</label><input id="n-go" type="number" value="0"></div>
            </div>
            <textarea id="n-sp" placeholder="Hechizos (Nombre1, Nombre2...)" style="width:100%; margin-top:10px; height:50px;"></textarea>
            <button onclick="window.agregarManual()" class="btn-save">AGREGAR PERSONAJE A LA LISTA</button>
            <button onclick="window.mostrarPagina('admin')" class="btn-cancel" style="width:100%; margin-top:5px;">VOLVER</button>
        </div>`;
}
