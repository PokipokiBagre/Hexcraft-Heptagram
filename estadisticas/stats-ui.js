import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularBonos } from './stats-logic.js';

// Función para mantener el foco (tu estándar de objetos)
function drawnHEXPreserveFocus(containerId, html) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = html;
}

export function refrescarUI() {
    dibujarBotonesJugadores();
    dibujarPanelPrincipal();
}

function dibujarBotonesJugadores() {
    let html = "<h2>Personajes</h2><div class='filter-group'>";
    Object.keys(statsGlobal).sort().forEach(j => {
        const active = estadoUI.jugadorActivo === j ? 'class="btn-active"' : '';
        html += `<button onclick="window.setJugadorStats('${j}')" ${active}>${j.toUpperCase()}</button> `;
    });
    drawnHEXPreserveFocus('contenedor-jugadores', html + "</div>");
}

function dibujarPanelPrincipal() {
    const dashboard = document.getElementById('dashboard-stats');
    if (!estadoUI.jugadorActivo) {
        dashboard.innerHTML = "<div class='stat-card' style='text-align:center; opacity:0.5;'><h3>SISTEMA HEX</h3><p>Selecciona un personaje para ver su estado.</p></div>";
        return;
    }

    const j = estadoUI.jugadorActivo;
    const s = statsGlobal[j];
    const bonos = calcularBonos(j);

    // Cálculos de vida
    const rojaPartes = s.vida.roja.split('/');
    const rojaActual = parseInt(rojaPartes[0]) || 0;
    const rojaTotalMax = (parseInt(rojaPartes[1]) || 10) + bonos.bonoRoja;

    dashboard.innerHTML = `
        <div class="stat-card">
            <div class="player-header">
                <img src="../img/imgpersonajes/${j.toLowerCase()}icon.png" class="player-icon" onerror="this.src='../img/icon.png'">
                <div style="text-align:left; flex:1;">
                    <h3 style="color:#d4af37; margin:0;">${s.nombreFull}</h3>
                    <p style="font-size:0.85em; color:#aaa;">${s.bio}</p>
                </div>
            </div>
            
            <div class="resource-grid" style="margin-top:20px;">
                <div class="bar-container"><div class="bar-fill bar-red" style="width:${(rojaActual/rojaTotalMax)*100}%"></div><div class="bar-text">${rojaActual} / ${rojaTotalMax} ❤️</div></div>
                <div class="bar-container"><div class="bar-fill bar-blue" style="width:${(s.vida.azul/15)*100}%"></div><div class="bar-text">${s.vida.azul} 💙</div></div>
            </div>
        </div>
    `;
}

