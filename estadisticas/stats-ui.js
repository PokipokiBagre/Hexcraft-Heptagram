import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularBonos } from './stats-logic.js';

export function dibujarUIStats() {
    dibujarSelector();
    const dashboard = document.getElementById('dashboard-stats');
    if (!estadoUI.jugadorActivo) { 
        dashboard.innerHTML = "<div class='stat-card' style='text-align:center; padding:50px;'><h3>SISTEMA HEX</h3><p>Selecciona un personaje para ver su estado.</p></div>"; 
        return; 
    }

    const j = estadoUI.jugadorActivo;
    const s = statsGlobal[j];
    const bonos = calcularBonos(j);

    const rojaPartes = s.vida.roja.split('/');
    const rojaActual = parseInt(rojaPartes[0]) || 0;
    const rojaTotalMax = (parseInt(rojaPartes[1]) || 10) + bonos.bonoRoja;

    dashboard.innerHTML = `
        <div class="stat-card">
            <div style="display:flex; align-items:center; gap:25px; border-bottom:1px solid #d4af3744; padding-bottom:20px; margin-bottom:25px;">
                <img src="../img/imgpersonajes/${j.toLowerCase()}icon.png" style="width:110px; height:110px; border:2px solid #d4af37; border-radius:50%; object-fit:cover;" onerror="this.src='../img/icon.png'">
                <div style="text-align:left;">
                    <h2 style="margin:0; text-align:left; color:#d4af37;">${s.nombreFull}</h2>
                    <p style="font-size:0.9em; color:#ddd; margin-top:8px;">${s.bio}</p>
                </div>
            </div>
            <div class="resource-grid">
                <div>
                    <label>VITALIDAD ROJA (+${bonos.bonoRoja} por Física)</label>
                    <div class="bar-container"><div class="bar-fill bar-red" style="width:${(rojaActual/rojaTotalMax)*100}%"></div><div class="bar-text">${rojaActual} / ${rojaTotalMax} ❤️</div></div>
                    <label>VITALIDAD AZUL (+${bonos.bonoAzul} por Mágicas)</label>
                    <div class="bar-container"><div class="bar-fill bar-blue" style="width:${(s.vida.azul/20)*100}%"></div><div class="bar-text">${s.vida.azul} Corazones 💙</div></div>
                </div>
                <div>
                    <label>HEX ACTUAL</label>
                    <div class="bar-container"><div class="bar-fill bar-purple" style="width:100%"></div><div class="bar-text">${s.hex} HEX</div></div>
                    <label>VEX (+${bonos.bonoVex} por Oscura)</label>
                    <div class="bar-container"><div class="bar-fill bar-green" style="width:100%"></div><div class="bar-text">${s.vex} / ${2000 + bonos.bonoVex} VEX</div></div>
                </div>
            </div>
            <div class="afin-grid">
                ${Object.entries(s.afin).map(([key, val]) => `<div class="afin-box"><label>${key.toUpperCase()}</label><span>${val}</span></div>`).join('')}
            </div>
            <h3>HECHIZOS APRENDIDOS</h3>
            <div class="table-responsive">
                <table class="spell-table">
                    <tr><th>Afinidad</th><th>Hechizo</th><th>Hex</th></tr>
                    ${s.learnedSpells.map(h => `<tr><td style="color:#d4af37; font-weight:bold;">${h.afinidad}</td><td>${h.nombre}</td><td>${h.costo}</td></tr>`).join('')}
                </table>
            </div>
        </div>
    `;
}

function dibujarSelector() {
    const container = document.getElementById('selector-jugadores');
    // Mantenemos el estilo de botones de personajes justo debajo de la nav
    container.innerHTML = Object.keys(statsGlobal).sort().map(j => `
        <button onclick="window.setJugadorStats('${j}')" class="${estadoUI.jugadorActivo === j ? 'btn-active' : ''}">${j}</button>
    `).join(' ');
}

export function dibujarAdminStats() {
    const dashboard = document.getElementById('panel-op-stats');
    const j = estadoUI.jugadorActivo;
    if (!j) { dashboard.innerHTML = "<h2>EDITOR OP</h2><p>Selecciona un jugador arriba.</p>"; return; }

    dashboard.innerHTML = `
        <h2>EDITOR OP: ${j}</h2>
        <div class="stat-card" style="max-width:650px; margin:0 auto;">
            <div style="background:#1a0033; padding:15px; border:1px dashed #d4af37; margin-bottom:20px;">
                <textarea id="log-stats-op" class="search-bar" readonly style="height:60px; font-size:0.8em;">${estadoUI.logStats || 'Sin cambios recientes...'}</textarea>
                <button onclick="window.copyToClipboard('log-stats-op')" style="width:100%;">COPIAR LOG</button>
            </div>
            <h3>Registrar Hechizo Aprendido</h3>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px; margin-bottom:20px;">
                <input type="text" id="add-spell-name" placeholder="Nombre...">
                <input type="text" id="add-spell-afin" placeholder="Afinidad">
                <input type="number" id="add-spell-hex" placeholder="Hex">
            </div>
            <button onclick="window.addHechizoAdmin()" style="width:100%; background:#4a004a;">AÑADIR AL ESTADO</button>
            <hr style="border-color:#d4af3733; margin:20px 0;">
            <button onclick="window.descargarCSVStats()" style="width:100%; background:#d4af37; color:#000;">DESCARGAR CSV</button>
            <button onclick="window.setPage('publico')" style="width:100%; margin-top:10px; background:#333;">CERRAR</button>
        </div>
    `;
}

export function dibujarCreacionObjeto() {
    let html = `<h2>Creación de Objetos</h2>
    <div class="stat-card" style="max-width:600px; margin:0 auto;">
        <input type="text" id="new-obj-name" class="search-bar" placeholder="Nombre del Objeto...">
        <textarea id="new-obj-eff" class="search-bar" placeholder="Efecto..."></textarea>
        <h3 style="font-size:1em; margin-top:20px;">Asignar Cantidad Inicial</h3>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">`;
    Object.keys(statsGlobal).sort().forEach(j => {
        html += `<div style="text-align:left; font-size:0.8em; border-bottom:1px solid #333; padding:5px;"><label>${j}:</label><input type="number" class="cant-input" data-player="${j}" value="0" min="0" style="width:50px; float:right;"></div>`;
    });
    html += `</div>
        <button onclick="window.ejecutarAgregarObjeto()" style="width:100%; margin-top:20px; background:#006400;">CREAR Y ASIGNAR</button>
        <button onclick="window.setPage('admin')" style="width:100%; margin-top:10px; background:#444;">CANCELAR</button>
    </div>`;
    document.getElementById('panel-op-stats').innerHTML = html;
}
