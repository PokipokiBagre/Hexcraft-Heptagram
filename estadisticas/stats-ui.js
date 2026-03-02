import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularBonos } from './stats-logic.js';

export function refrescarUI() {
    const selector = document.getElementById('contenedor-jugadores');
    if (!selector) return;

    // Dibujar botones de jugadores
    let htmlBtns = `<div class="filter-group" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:20px;">`;
    Object.keys(statsGlobal).sort().forEach(j => {
        const active = estadoUI.jugadorActivo === j ? 'class="btn-active"' : '';
        htmlBtns += `<button onclick="window.setJugadorStats('${j}')" ${active}>${j.toUpperCase()}</button>`;
    });
    selector.innerHTML = htmlBtns + `</div>`;

    // Dibujar Ficha
    const dashboard = document.getElementById('dashboard-stats');
    if (!estadoUI.jugadorActivo) {
        dashboard.innerHTML = `<div class="stat-card" style="text-align:center; opacity:0.5; padding:50px;"><h3>SISTEMA HEX</h3><p>SELECCIONA UN PERSONAJE.</p></div>`;
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
            <div class="player-header" style="display:flex; align-items:center; gap:20px; border-bottom:1px solid #d4af3744; padding-bottom:15px; margin-bottom:20px;">
                <img src="../img/imgpersonajes/${j.toLowerCase()}icon.png" style="width:80px; height:80px; border-radius:50%; border:2px solid #d4af37;" onerror="this.src='../img/icon.png'">
                <div style="text-align:left;">
                    <h2 style="margin:0; color:#d4af37;">${s.nombreFull}</h2>
                    <p style="font-size:0.8em; color:#aaa; margin:5px 0;">${s.bio}</p>
                </div>
            </div>
            <div class="resource-grid">
                <div>
                    <label style="color:#ff4d4d; font-size:0.7em; font-weight:bold;">VITALIDAD ROJA (RAD)</label>
                    <div class="bar-container"><div class="bar-fill bar-red" style="width:${(rojaActual/rojaTotalMax)*100}%"></div><div class="bar-text">${rojaActual} / ${rojaTotalMax} ❤️</div></div>
                    
                    <label style="color:#00bfff; font-size:0.7em; font-weight:bold;">VITALIDAD AZUL</label>
                    <div class="bar-container"><div class="bar-fill bar-blue" style="width:${(s.vida.azul/15)*100}%"></div><div class="bar-text">${s.vida.azul} Corazones 💙</div></div>
                </div>
                <div>
                    <label style="color:#9932cc; font-size:0.7em; font-weight:bold;">HEX ACTUAL</label>
                    <div class="bar-container"><div class="bar-fill bar-purple" style="width:100%"></div><div class="bar-text">${s.hex} HEX</div></div>

                    <label style="color:#32cd32; font-size:0.7em; font-weight:bold;">VEX (Bono +${bonos.bonoVex})</label>
                    <div class="bar-container"><div class="bar-fill bar-green" style="width:${(s.vex/(2000+bonos.bonoVex))*100}%"></div><div class="bar-text">${s.vex} / ${2000+bonos.bonoVex} VEX</div></div>
                </div>
            </div>
        </div>`;
}
