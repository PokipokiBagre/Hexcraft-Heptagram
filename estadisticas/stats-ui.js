import { statsGlobal, estadoUI } from './stats-state.js';

export function refrescarUI() {
    const catalog = document.getElementById('contenedor-catalog');
    const tableDiv = document.getElementById('contenedor-tabla');
    const dashboard = document.getElementById('dashboard-stats');
    if(!catalog || !tableDiv) return;

    // 1. BLOQUES DE PERSONAJE (Grid 4x4)
    catalog.innerHTML = Object.keys(statsGlobal).sort().map(id => {
        const p = statsGlobal[id];
        const img = `../img/imgpersonajes/${id.toLowerCase()}icon.png`;
        return `
            <div class="personaje-card" style="cursor:pointer;" onclick="window.verDetalle('${id}')">
                <img src="${img}" class="img-p" onerror="this.src='../img/icon.png'">
                <div style="font-weight:bold; color:#d4af37; margin-top:5px;">${id.toUpperCase()}</div>
                <div class="bar-container"><div class="bar-fill bar-purple" style="width:100%"></div><div class="bar-text">${p.hex} HEX</div></div>
            </div>`;
    }).join('');

    // 2. TABLA CRUDA (A-P)
    let htmlTable = `<table><tr><th>ID</th><th>HEX</th><th>VEX</th><th>FIS</th><th>ENE</th><th>ESP</th><th>MAN</th><th>PSI</th><th>OSC</th><th>R</th><th>RM</th><th>A</th></tr>`;
    Object.keys(statsGlobal).sort().forEach(id => {
        const p = statsGlobal[id];
        htmlTable += `<tr><td>${p.id}</td><td>${p.hex}</td><td>${p.vex}</td><td>${p.fi}</td><td>${p.en}</td><td>${p.es}</td><td>${p.ma}</td><td>${p.ps}</td><td>${p.os}</td><td>${p.r}</td><td>${p.rm}</td><td>${p.az}</td></tr>`;
    });
    tableDiv.innerHTML = `<div class="table-container" style="margin-top:50px;"><h3>DATOS DEL SISTEMA (A-P)</h3>${htmlTable}</table></div>`;
}

export function verDetalle(id) {
    const p = statsGlobal[id];
    const dashboard = document.getElementById('dashboard-stats');
    const percR = (parseInt(p.r) / parseInt(p.rm)) * 100;
    
    dashboard.innerHTML = `
        <div class="stat-card" style="margin-top:20px; text-align:left; border: 1px solid #d4af37; padding:20px; background:rgba(30,0,60,0.9);">
            <button onclick="document.getElementById('dashboard-stats').innerHTML=''" style="float:right;">X</button>
            <h2 style="color:#d4af37; margin:0;">${id.toUpperCase()}</h2>
            <p style="font-size:0.8em; color:#aaa;">ESTADÍSTICAS DETALLADAS</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:15px;">
                <div>
                    <label>VITALIDAD ROJA</label>
                    <div class="bar-container"><div class="bar-fill bar-red" style="width:${percR}%"></div><div class="bar-text">${p.r} / ${p.rm}</div></div>
                    <label>VITALIDAD AZUL</label>
                    <div class="bar-container"><div class="bar-fill bar-blue" style="width:100%"></div><div class="bar-text">${p.az} Corazones</div></div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; font-size:0.7em;">
                    <span>FIS: ${p.fi}</span> <span>ENE: ${p.en}</span>
                    <span>ESP: ${p.es}</span> <span>MAN: ${p.ma}</span>
                    <span>PSI: ${p.ps}</span> <span>OSC: ${p.os}</span>
                </div>
            </div>
        </div>`;
    window.scrollTo({ top: dashboard.offsetTop - 50, behavior: 'smooth' });
}

export function dibujarMenuOP() {
    document.getElementById('panel-op-central').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:20px;">
            <button onclick="window.dibujarDiseñador()" style="background:#4a004a;">AGREGAR PERSONAJE</button>
            <button onclick="window.descargarEstadoCSV()" style="background:#d4af37; color:#000;">DESCARGAR CSV</button>
            <button onclick="window.mostrarPagina('publico')" style="grid-column: span 2; background:#444; margin-top:10px;">CERRAR ACCESO OP</button>
        </div>`;
}

export function dibujarDiseñador() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="personaje-card" style="max-width:800px; margin:auto; text-align:left;">
            <h2>NUEVO PERSONAJE</h2>
            <div class="designer-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
                <input id="n-id" placeholder="ID"> <input id="n-hx" type="number" placeholder="Hex"> <input id="n-vx" type="number" placeholder="Vex">
                <input id="n-fi" type="number" placeholder="Física"> <input id="n-en" type="number" placeholder="Energía"> <input id="n-es" type="number" placeholder="Espíritu">
                <input id="n-ma" type="number" placeholder="Mando"> <input id="n-ps" type="number" placeholder="Psique"> <input id="n-os" type="number" placeholder="Oscura">
                <input id="n-ra" type="number" placeholder="Rojo Act"> <input id="n-rm" type="number" placeholder="Rojo Max" value="10"> <input id="n-aa" type="number" placeholder="Azul">
            </div>
            <button onclick="window.agregarLocal()" style="width:100%; background:#006400; margin-top:15px; color:white;">INYECTAR A PERSONAJES</button>
            <button onclick="window.mostrarPagina('admin')" style="width:100%; background:#444; margin-top:5px;">VOLVER</button>
        </div>`;
}
