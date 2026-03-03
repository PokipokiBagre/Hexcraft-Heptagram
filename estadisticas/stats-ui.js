import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularValores } from './stats-logic.js';

export function refrescarUI() {
    const catalog = document.getElementById('contenedor-catalog');
    const tableDiv = document.getElementById('contenedor-tabla');
    if(!catalog || !tableDiv) return;

    // 1. Dibujar Bloques 4x4
    catalog.innerHTML = Object.keys(statsGlobal).sort().map(id => {
        const d = calcularValores(id);
        const img = `../img/imgpersonajes/${id.toLowerCase()}icon.png`;
        return `
            <div class="personaje-card" onclick="window.verDetalle('${id}')" style="cursor:pointer;">
                <img src="${img}" class="img-p" onerror="this.src='../img/icon.png'">
                <div style="color:#d4af37; font-weight:bold; margin-top:5px;">${id.toUpperCase()}</div>
                <div class="bar-container"><div class="bar-fill bar-purple" style="width:100%"></div><div class="bar-text">${d.hx} HEX</div></div>
                <div class="bar-container"><div class="bar-fill bar-red" style="width:${(d.r/d.rm)*100}%"></div><div class="bar-text">${d.r}/${d.rm} ❤️</div></div>
            </div>`;
    }).join('');

    // 2. Dibujar Tabla de Datos (A-P)
    let htmlT = `<table><tr><th>ID</th><th>HEX</th><th>VEX</th><th>FIS</th><th>ENE</th><th>ESP</th><th>MAN</th><th>PSI</th><th>OSC</th><th>R</th><th>RM</th><th>A</th></tr>`;
    Object.keys(statsGlobal).sort().forEach(id => {
        const s = statsGlobal[id];
        htmlT += `<tr><td>${id}</td><td>${s.hex}</td><td>${s.vex}</td><td>${s.fi}</td><td>${s.en}</td><td>${s.es}</td><td>${s.ma}</td><td>${s.ps}</td><td>${s.os}</td><td>${s.r}</td><td>${s.rm}</td><td>${s.az}</td></tr>`;
    });
    tableDiv.innerHTML = `<div class="table-container" style="margin-top:50px;"><h3>REGISTRO DEL SISTEMA (A-P)</h3>${htmlT}</table></div>`;
}

export function verDetalle(id) {
    const d = calcularValores(id);
    alert(`PERSONAJE: ${id}\nHex: ${d.hx}\nVitalidad: ${d.r} / ${d.rm}\n\n(Detalle extendido desactivado temporalmente para asegurar conexión)`);
}

export function dibujarMenuOP() {
    document.getElementById('panel-op-central').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:20px;">
            <button onclick="window.mostrarPantallaCrear()" style="background:#4a004a;">NUEVO PERSONAJE</button>
            <button onclick="window.descargarEstadoCSV()" style="background:#d4af37; color:#000;">DESCARGAR CSV</button>
            <button onclick="window.mostrarPagina('publico')" style="grid-column: span 2; background:#444; margin-top:10px;">CERRAR</button>
        </div>`;
}

export function dibujarPantallaCrear() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="personaje-card" style="max-width:800px; margin:auto; text-align:left;">
            <h2>DISEÑADOR</h2>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
                <input id="n-id" placeholder="ID (Linda)"> <input id="n-hx" type="number" placeholder="Hex"> <input id="n-vx" type="number" placeholder="Vex">
                <input id="n-fi" type="number" placeholder="Física"> <input id="n-en" type="number" placeholder="Energía"> <input id="n-es" type="number" placeholder="Espiritual">
                <input id="n-ma" type="number" placeholder="Mando"> <input id="n-ps" type="number" placeholder="Psique"> <input id="n-os" type="number" placeholder="Oscura">
                <input id="n-ra" type="number" placeholder="Rojo Act"> <input id="n-rm" type="number" placeholder="Rojo Max" value="10"> <input id="n-aa" type="number" placeholder="Azul">
            </div>
            <button onclick="window.agregarLocal()" style="width:100%; background:#006400; margin-top:20px;">INYECTAR LOCALMENTE</button>
            <button onclick="window.mostrarPagina('admin')" style="width:100%; background:#444; margin-top:10px;">VOLVER</button>
        </div>`;
}
