import { statsGlobal, estadoUI } from './stat-state.js';
import { calcularBonos } from './stat-logic.js';

export function dibujarUIStats() {
    dibujarSelector();
    const dashboard = document.getElementById('dashboard-stats');
    if (!estadoUI.jugadorActivo) { dashboard.innerHTML = "<p style='text-align:center; opacity:0.5;'>Selecciona un personaje para ver su progresión.</p>"; return; }

    const j = estadoUI.jugadorActivo;
    const s = statsGlobal[j];
    const bonos = calcularBonos(j);

    // Parseo de vida roja (ej: "5/12")
    const rojaPartes = s.vida.roja.split('/');
    const rojaActual = parseInt(rojaPartes[0]) || 0;
    const rojaMaxBase = parseInt(rojaPartes[1]) || 10;
    const rojaTotalMax = rojaMaxBase + bonos.bonoRoja;

    dashboard.innerHTML = `
        <div class="stat-card">
            <div style="display:flex; align-items:center; gap:20px; border-bottom:1px solid #d4af37; padding-bottom:15px; margin-bottom:20px;">
                <img src="../img/imgpersonajes/${j.toLowerCase()}icon.png" style="width:100px; height:100px; border:2px solid #d4af37; border-radius:50%;" onerror="this.src='../img/icon.png'">
                <div style="text-align:left;">
                    <h2 style="margin:0; text-align:left;">${s.nombreFull}</h2>
                    <p style="font-size:0.85em; color:#aaa; margin:5px 0;">${s.bio}</p>
                </div>
            </div>

            <div class="resource-grid">
                <div>
                    <label style="font-size:0.7em; color:#ff4d4d;">VITALIDAD ROJA (+${bonos.bonoRoja} por Física)</label>
                    <div class="bar-container"><div class="bar-fill bar-red" style="width:${(rojaActual/rojaTotalMax)*100}%"></div><div class="bar-text">${rojaActual} / ${rojaTotalMax} ❤️</div></div>
                    
                    <label style="font-size:0.7em; color:#00bfff;">VITALIDAD AZUL (+${bonos.bonoAzul} por Mágicas)</label>
                    <div class="bar-container"><div class="bar-fill bar-blue" style="width:${(s.vida.azul/20)*100}%"></div><div class="bar-text">${s.vida.azul} Corazones 💙</div></div>
                </div>
                <div>
                    <label style="font-size:0.7em; color:#9932cc;">HEX (ESENCIA MÁGICA)</label>
                    <div class="bar-container"><div class="bar-fill bar-hex" style="width:100%"></div><div class="bar-text">${s.hex} HEX</div></div>

                    <label style="font-size:0.7em; color:#32cd32;">VEX (CAPACIDAD +${bonos.bonoVex} por Oscura)</label>
                    <div class="bar-container"><div class="bar-fill bar-vex" style="width:100%"></div><div class="bar-text">${s.vex} / ${2000 + bonos.bonoVex} VEX</div></div>
                </div>
            </div>

            <h3>AFINIDADES ELEMENTALES</h3>
            <div class="afin-grid">
                <div class="afin-box"><label>FÍSICA</label><span>${s.afin.fis}</span></div>
                <div class="afin-box"><label>ENERGÉTICA</label><span>${s.afin.ene}</span></div>
                <div class="afin-box"><label>ESPIRITUAL</label><span>${s.afin.esp}</span></div>
                <div class="afin-box"><label>MANDO</label><span>${s.afin.man}</span></div>
                <div class="afin-box"><label>PSÍQUICA</label><span>${s.afin.psi}</span></div>
                <div class="afin-box"><label>OSCURA</label><span>${s.afin.osc}</span></div>
            </div>

            <h3>HECHIZOS APRENDIDOS (${s.learnedSpells.length})</h3>
            <div class="table-responsive">
                <table class="spell-table">
                    <tr><th>Afinidad</th><th>Nombre del Hechizo</th><th>Costo Hex</th></tr>
                    ${s.learnedSpells.map(h => `<tr><td style="color:#d4af37">${h.afinidad}</td><td>${h.nombre}</td><td>${h.costo}</td></tr>`).join('')}
                </table>
            </div>
        </div>
    `;
}

function dibujarSelector() {
    const container = document.getElementById('selector-jugadores');
    container.innerHTML = Object.keys(statsGlobal).sort().map(j => `
        <button onclick="window.setJugadorStats('${j}')" class="${estadoUI.jugadorActivo === j ? 'btn-active' : ''}">${j}</button>
    `).join(' ');
}

export function dibujarAdminStats() {
    const dashboard = document.getElementById('panel-op-stats');
    const j = estadoUI.jugadorActivo;
    if (!j) { dashboard.innerHTML = "<h2>Editor OP</h2><p>Selecciona un jugador en Vista Pública primero.</p>"; return; }

    dashboard.innerHTML = `
        <h2>Editor OP: ${j}</h2>
        <div class="stat-card" style="max-width:600px; margin:0 auto;">
            <h3>Añadir Hechizo learned</h3>
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <input type="text" id="add-spell-name" placeholder="Nombre Hechizo..." style="flex:2; padding:10px; background:#120024; color:white; border:1px solid #d4af37;">
                <input type="number" id="add-spell-hex" placeholder="Hex..." style="flex:1; padding:10px; background:#120024; color:white; border:1px solid #d4af37;">
                <button onclick="window.addHechizoAdmin()">AÑADIR</button>
            </div>
            <hr style="border-color:#d4af3733;">
            <h3>Acciones Globales</h3>
            <button onclick="window.descargarCSVStats()" style="width:100%; margin-bottom:10px; background:#d4af37; color:#000;">DESCARGAR CSV ACTUALIZADO</button>
            <button onclick="window.setPage('publico')" style="width:100%; background:#444;">CERRAR EDITOR</button>
        </div>
    `;
}