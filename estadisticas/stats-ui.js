import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularBonos } from './stats-logic.js';

export function refrescarUI() {
    dibujarBotonesJugadores();
    dibujarFichaActiva();
}

function dibujarBotonesJugadores() {
    const container = document.getElementById('contenedor-jugadores');
    if (!container) return;

    let html = `<div class="filter-group" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:20px;">`;
    
    // Generar botones para Linda, Corvin, etc.
    Object.keys(statsGlobal).sort().forEach(j => {
        const active = estadoUI.jugadorActivo === j ? 'class="btn-active"' : '';
        html += `<button onclick="window.setJugadorStats('${j}')" ${active}>${j.toUpperCase()}</button>`;
    });

    container.innerHTML = html + `</div>`;
}

function dibujarFichaActiva() {
    const dashboard = document.getElementById('dashboard-stats');
    if (!estadoUI.jugadorActivo) {
        dashboard.innerHTML = `<div class="stat-card" style="text-align:center; opacity:0.5; padding:40px;"><h3>SISTEMA HEX</h3><p>SELECCIONA UN JUGADOR ARRIBA.</p></div>`;
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
            <div class="player-header" style="display:flex; align-items:center; gap:20px;">
                <img src="../img/imgpersonajes/${j.toLowerCase()}icon.png" class="player-icon" style="width:80px; height:80px; border-radius:50%; border:2px solid #d4af37;" onerror="this.src='../img/icon.png'">
                <div style="text-align:left;">
                    <h2 style="margin:0; color:#d4af37;">${s.nombreFull}</h2>
                    <p style="font-size:0.85em; color:#aaa;">${s.bio}</p>
                </div>
            </div>
            
            <div class="resource-grid" style="margin-top:20px;">
                <label style="color:#ff4d4d; font-size:0.7em;">VIDA ROJA (+${bonos.bonoRoja})</label>
                <div class="bar-container"><div class="bar-fill bar-red" style="width:${(rojaActual/rojaTotalMax)*100}%"></div><div class="bar-text">${rojaActual} / ${rojaTotalMax} ❤️</div></div>
                
                <label style="color:#00bfff; font-size:0.7em;">VIDA AZUL (+${bonos.bonoAzul})</label>
                <div class="bar-container"><div class="bar-fill bar-blue" style="width:${(s.vida.azul/15)*100}%"></div><div class="bar-text">${s.vida.azul} 💙</div></div>
            </div>
        </div>`;
}
