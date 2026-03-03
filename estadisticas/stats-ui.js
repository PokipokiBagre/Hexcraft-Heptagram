import { statsGlobal, estadoUI } from './stats-state.js';

export function refrescarUI() {
    const catalog = document.getElementById('contenedor-catalog');
    const tableDiv = document.getElementById('contenedor-tabla');
    if(!catalog || !tableDiv) return;

    // 1. DIBUJAR BLOQUES DE PERSONAJE (Tarjetas)
    catalog.innerHTML = Object.keys(statsGlobal).sort().map(id => {
        const p = statsGlobal[id];
        const img = `../img/imgpersonajes/${id.toLowerCase()}icon.png`;
        return `
            <div class="personaje-card">
                <img src="${img}" class="img-p" onerror="this.src='../img/icon.png'">
                <div style="font-weight:bold; color:#d4af37; margin-top:5px;">${id.toUpperCase()}</div>
                <div class="bar-container"><div class="bar-fill bar-purple" style="width:100%"></div><div class="bar-text">${p.hex} HEX</div></div>
                <div class="bar-container">
                    <div class="bar-fill bar-red" style="width:${(parseInt(p.roja)/parseInt(p.rojaM))*100}%"></div>
                    <div class="bar-text">${p.roja}/${p.rojaM} ❤️</div>
                </div>
            </div>`;
    }).join('');

    // 2. DIBUJAR TABLA DIRECTA (A-P)
    let htmlTable = `<table><tr><th>ID</th><th>HEX</th><th>VEX</th><th>FIS</th><th>ENE</th><th>ESP</th><th>MAN</th><th>PSI</th><th>OSC</th><th>R</th><th>RM</th><th>A</th><th>O</th></tr>`;
    Object.keys(statsGlobal).sort().forEach(id => {
        const p = statsGlobal[id];
        htmlTable += `<tr>
            <td style="color:#d4af37; font-weight:bold;">${p.id}</td>
            <td>${p.hex}</td><td>${p.vex}</td><td>${p.fis}</td><td>${p.ene}</td><td>${p.esp}</td>
            <td>${p.man}</td><td>${p.psi}</td><td>${p.osc}</td><td>${p.roja}</td><td>${p.rojaM}</td>
            <td>${p.azul}</td><td>${p.oro}</td>
        </tr>`;
    });
    tableDiv.innerHTML = htmlTable + `</table>`;
}

export function dibujarDiseñador() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="personaje-card" style="max-width:900px; margin:auto; text-align:left;">
            <h2>NUEVO PERSONAJE (A-P)</h2>
            <div class="designer-grid">
                <div><label>ID</label><input id="n-id" placeholder="Linda"></div>
                <div><label>Hex Base</label><input id="n-hx" type="number" value="0"></div>
                <div><label>Vex Base</label><input id="n-vx" type="number" value="0"></div>
                <div><label>Física</label><input id="n-fi" type="number" value="0"></div>
                <div><label>Energía</label><input id="n-en" type="number" value="0"></div>
                <div><label>Espiritual</label><input id="n-es" type="number" value="0"></div>
                <div><label>Mando</label><input id="n-ma" type="number" value="0"></div>
                <div><label>Psíquica</label><input id="n-ps" type="number" value="0"></div>
                <div><label>Oscura</label><input id="n-os" type="number" value="0"></div>
                <div><label>Rojo Act</label><input id="n-ra" type="number" value="0"></div>
                <div><label>Rojo MaxBase</label><input id="n-rm" type="number" value="10"></div>
                <div><label>Azul Act</label><input id="n-aa" type="number" value="0"></div>
                <div><label>Oro</label><input id="n-go" type="number" value="0"></div>
                <div><label>D-Rojo</label><input id="n-dr" type="number" value="0"></div>
                <div><label>D-Azul</label><input id="n-da" type="number" value="0"></div>
            </div>
            <button onclick="window.agregarLocal()" style="width:100%; background:#006400; margin-top:15px; color:white;">AGREGAR PERSONAJE</button>
            <button onclick="window.descargarFila()" style="width:100%; background:#d4af37; margin-top:5px; color:black;">DESCARGAR CSV</button>
            <button onclick="window.mostrarPagina('publico')" style="width:100%; background:#444; margin-top:5px;">CANCELAR</button>
        </div>`;
}
