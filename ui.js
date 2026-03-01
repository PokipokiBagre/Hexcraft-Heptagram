import { invGlobal, objGlobal, estadoUI } from './state.js';

export function refrescarUI() { dibujarInventarios(); dibujarCatalogo(); dibujarControl(); }

function ordenarItems(j) {
    if (!j || !invGlobal[j]) return Object.keys(objGlobal).sort();
    return Object.keys(objGlobal).sort((a, b) => {
        const sA = invGlobal[j][a] || 0;
        const sB = invGlobal[j][b] || 0;
        if (sB !== sA) return sB - sA;
        return a.localeCompare(b); // A-Z arriba
    });
}

export function dibujarControl() {
    let html = "<h2>Editor de Stock (Acceso OP)</h2><div style='text-align:center'>";
    // 1. Selector de Jugadores
    Object.keys(invGlobal).sort().forEach(j => {
        const active = estadoUI.jugadorControl === j ? 'style="border: 2px solid #d4af37"' : '';
        html += `<button onclick="window.setCtrl('${j}')" ${active}>${j}</button> `;
    });
    html += "</div><br>";

    if (estadoUI.jugadorControl) {
        const j = estadoUI.jugadorControl;
        
        // 2. BUSCADOR DE OBJETOS
        const busqVal = document.getElementById('busq-op')?.value || "";
        html += `<div style="text-align:center; margin-bottom: 20px;">
                    <input type="text" id="busq-op" placeholder="🔍 Buscar objeto en el inventario..." 
                    value="${busqVal}" oninput="window.refrescarUI()" 
                    style="width: 80%; padding: 12px; border-radius: 8px; border: 1px solid #d4af37; background: #1a0033; color: white;">
                 </div>`;

        // 3. GRID DE 5 COLUMNAS
        html += `<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 10px;">`;
        
        const term = busqVal.toLowerCase();
        ordenarItems(j).forEach(o => {
            // Lógica de filtrado
            if (term && !o.toLowerCase().includes(term)) return;

            const c = invGlobal[j][o] || 0;
            const bg = c > 0 ? "background: #2e004f; border: 1px solid #d4af37;" : "background: #120024; opacity: 0.6;";
            
            html += `<div style="${bg} padding: 10px; border-radius: 8px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                <span style="font-size: 0.85em; display: block; margin-bottom: 8px; height: 35px; overflow: hidden;">${o} (<b>${c}</b>)</span>
                <div style="display: flex; gap: 4px; justify-content: center;">
                    <button onclick="window.hexMod('${j}','${o}',1)" style="padding: 5px 8px; font-size: 0.8em;">+1</button>
                    <button class="btn-neg" onclick="window.hexMod('${j}','${o}',-1)" style="padding: 5px 8px; font-size: 0.8em;">-1</button>
                </div>
                <div style="display: flex; gap: 4px; justify-content: center; margin-top: 4px;">
                    <button onclick="window.hexMod('${j}','${o}',5)" style="padding: 4px; font-size: 0.7em; background: #004a4a;">+5</button>
                    <button class="btn-neg" onclick="window.hexMod('${j}','${o}',-5)" style="padding: 4px; font-size: 0.7em; background: #4a0000;">-5</button>
                </div>
            </div>`;
        });
        html += "</div>";
    }
    document.getElementById('panel-interactivo').innerHTML = html;
    
    // Mantener el foco en el buscador después de redibujar
    const input = document.getElementById('busq-op');
    if (input && document.activeElement.id !== 'busq-op') {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
}

export function dibujarMenuOP() {
    document.getElementById('menu-op-central').innerHTML = `
        <h2>Acceso OP</h2>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 650px; margin: 0 auto;">
            <button onclick="window.mostrarPagina('control')">Editor de Stock</button>
            <button onclick="window.descargarInventariosJPG()" style="background:#8b0000">Descargar JPGs</button>
            <button onclick="window.descargarLog()" style="background:#004a4a">Descargar Log</button>
            <button onclick="window.descargarEstadoCSV()" style="background:#d4af37; color:#120024">Descargar CSV</button>
            <button onclick="window.subirLogManual()" style="background:#4a004a">Subir Log</button>
        </div>`;
}

export function dibujarInventarios() {
    let html = "<h2>Inventarios</h2><div style='text-align:center'>";
    Object.keys(invGlobal).sort().forEach(j => html += `<button onclick="window.setInv('${j}')">${j}</button> `);
    html += "</div><br>";
    if (estadoUI.jugadorInv) {
        const j = estadoUI.jugadorInv;
        html += `<div class='container-hex'><h3>${j}</h3><table><tr><th>Objeto</th><th>Efecto</th><th>Cant</th></tr>`;
        ordenarItems(j).forEach(o => {
            if(invGlobal[j][o] > 0) html += `<tr><td>${o}</td><td style="font-size:0.8em">${objGlobal[o]?.eff || '-'}</td><td>${invGlobal[j][o]}</td></tr>`;
        });
        html += "</table></div>";
    }
    document.getElementById('contenedor-jugadores').innerHTML = html;
}

export function dibujarCatalogo() {
    let html = "<h2>Catálogo</h2><div style='text-align:center'>";
    ['Todos', 'Común', 'Raro', 'Legendario'].forEach(r => html += `<button onclick="window.setRar('${r}')">${r}</button> `);
    html += "<br><br>";
    ['Todos', 'Orgánico', 'Cristal', 'Metal', 'Sagrado'].forEach(m => html += `<button onclick="window.setMat('${m}')" style="background:#004a4a">${m}</button> `);
    html += "</div><br><table class='container-hex'><tr><th>Nombre</th><th>Efecto</th><th>Material</th><th>Rareza</th></tr>";
    Object.keys(objGlobal).sort().forEach(o => {
        const item = objGlobal[o];
        if ((estadoUI.filtroRar === 'Todos' || item.rar.includes(estadoUI.filtroRar)) && (estadoUI.filtroMat === 'Todos' || item.mat.includes(estadoUI.filtroMat))) {
            html += `<tr><td>${o}</td><td style="font-size:0.8em">${item.eff}</td><td>${item.mat}</td><td>${item.rar}</td></tr>`;
        }
    });
    document.getElementById('tabla-todos-objetos').innerHTML = html + "</table>";
}
