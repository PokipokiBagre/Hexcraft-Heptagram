import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularFicha } from './stats-logic.js';

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

    container.innerHTML = ids.map(id => {
        const d = calcularFicha(id);
        const img = `../img/imgpersonajes/${id.toLowerCase()}icon.png`;
        return `
            <div class="personaje-card" onclick="window.setActivo('${id}')">
                <img src="${img}" class="img-p" onerror="this.src='../img/icon.png'">
                <div style="color:#d4af37; font-weight:bold; margin-bottom:8px;">${id.toUpperCase()}</div>
                <div class="bar-container"><div class="bar-fill bar-red" style="width:${(d.roja/d.rojaMax)*100}%"></div><div class="bar-text">${d.roja}/${d.rojaMax} ❤️</div></div>
                <div class="bar-container"><div class="bar-fill bar-blue" style="width:100%"></div><div class="bar-text">${d.azul} Azules</div></div>
                ${estadoUI.principales.includes(id) ? '<small style="color:#0f0;">PROPIETARIO</small>' : ''}
            </div>`;
    }).join('');
}

function dibujarDetalle(id, container) {
    const d = calcularFicha(id);
    container.innerHTML = `
        <div class="detail-card">
            <button onclick="window.setActivo(null)" style="float:right; background:#444;">CERRAR</button>
            <h2 style="color:#d4af37; margin-top:0;">${id}</h2>
            <div class="resource-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div>
                    <label style="color:#ff4d4d; font-size:0.7em;">VITALIDAD RAD</label>
                    <div class="bar-container"><div class="bar-fill bar-red" style="width:${(d.roja/d.rojaMax)*100}%"></div><div class="bar-text">${d.roja}/${d.rojaMax} ❤️</div></div>
                    <div class="bar-container"><div class="bar-fill bar-blue" style="width:100%"></div><div class="bar-text">${d.azul} Corazones Azules</div></div>
                </div>
                <div>
                    <label style="color:#9932cc; font-size:0.7em;">ENERGÍA MÁGICA</label>
                    <div class="bar-container"><div class="bar-fill bar-purple" style="width:100%"></div><div class="bar-text">${d.hex} HEX</div></div>
                    <div class="bar-container"><div class="bar-fill bar-green" style="width:${(d.vexActual/d.vexMax)*100}%"></div><div class="bar-text">${d.vexActual}/${d.vexMax} VEX</div></div>
                </div>
            </div>
            <div class="afin-grid">${Object.entries(d.afin).map(([k,v])=>`<div class="afin-box"><label>${k.toUpperCase()}</label><span>${v}</span></div>`).join('')}</div>
            <h3 style="color:#d4af37; border-bottom:1px solid #d4af3733;">HECHIZOS (${d.spellList.length})</h3>
            <table class="spell-table">
                <tr><th>AFINIDAD</th><th>NOMBRE</th><th>HEX</th></tr>
                ${d.spellList.map(s => `<tr><td>${s.afin}</td><td>${s.nom}</td><td>${s.hex}</td></tr>`).join('')}
            </table>
        </div>`;
}

export function dibujarAdmin() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="detail-card" style="max-width:800px; margin:auto;">
            <h2>DISEÑADOR DE PERSONAJE (A-S)</h2>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                <input type="text" id="new-id" placeholder="ID (Ej: Linda)" class="op-input">
                <input type="number" id="new-hex" placeholder="HEX Base" class="op-input">
                <input type="number" id="new-vex" placeholder="VEX Base" class="op-input">
                <input type="number" id="new-fis" placeholder="Física" class="op-input">
                <input type="number" id="new-ene" placeholder="Energía" class="op-input">
                <input type="number" id="new-esp" placeholder="Espiritual" class="op-input">
                <input type="number" id="new-man" placeholder="Mando" class="op-input">
                <input type="number" id="new-psi" placeholder="Psíquica" class="op-input">
                <input type="number" id="new-osc" placeholder="Oscura" class="op-input">
                <input type="number" id="new-rAct" placeholder="Roja Act" class="op-input">
                <input type="number" id="new-rMax" placeholder="Roja Max" class="op-input">
                <input type="number" id="new-aAct" placeholder="Azul Act" class="op-input">
                <input type="number" id="new-gold" placeholder="Oro" class="op-input">
            </div>
            <textarea id="new-spells" placeholder="Lista Hechizos (Nombre1, Nombre2...)" style="width:95%; height:60px; margin-top:10px;"></textarea>
            <button onclick="window.generarLineaCSV()" style="width:100%; background:#006400; margin-top:10px;">DESCARGAR LÍNEA CSV</button>
            <button onclick="window.mostrarPagina('publico')" style="width:100%; background:#444; margin-top:10px;">CANCELAR</button>
        </div>`;
}
