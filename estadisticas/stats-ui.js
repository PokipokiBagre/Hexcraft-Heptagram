import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularFicha } from './stats-logic.js';

/**
 * cur: valor actual
 * min: cantidad mínima de cuadros vacíos a dibujar (30 para azul/oro)
 * cls: clase de color
 */
function drawBlocks(cur, min, cls) {
    let total = Math.max(cur, min);
    let h = `<div class="block-grid">`;
    for(let i=0; i<total; i++) {
        h += `<div class="blk ${cls} ${i < cur ? 'on' : ''}"></div>`;
    }
    return h + `</div>`;
}

export function refrescarUI() {
    const catalog = document.getElementById('contenedor-catalog');
    const dash = document.getElementById('dashboard-stats');
    if(!catalog || !dash) return;

    if(estadoUI.personajeActivo) {
        catalog.style.display = "none"; dash.style.display = "block";
        const id = estadoUI.personajeActivo;
        const d = calcularFicha(id);
        const img = `../img/imgpersonajes/${id.toLowerCase().replace(/\s+/g,'')}icon.png`;

        dash.innerHTML = `
            <div class="stat-card">
                <img src="${img}" class="img-detail" onerror="this.src='../img/icon.png'">
                <button onclick="window.setActivo(null)" class="btn-close">CERRAR</button>
                <h2 class="gold-t">${id}</h2>

                <div class="energy-row">
                    <div class="circle c-hex" style="width:${d.sHX}px; height:${d.sHX}px;">${d.hx}<br><small>HEX</small></div>
                    <div class="circle c-vex" style="width:${d.sVX}px; height:${d.sVX}px;">${d.vxA}<br><small>VEX</small></div>
                </div>

                <div class="res-sec">
                    <label class="red-t">VITALIDAD ROJA (RAD)</label>${drawBlocks(d.r, d.rM, 'b-red')}
                    <label class="blue-t">VITALIDAD AZUL</label>${drawBlocks(d.a, 30, 'b-blue')}
                    <label class="gold-t">GUARDA DORADA</label>${drawBlocks(d.g, 15, 'b-gold')}
                </div>

                <div class="afin-grid">${Object.entries(d.af).map(([k,v])=>`<div class="af-box"><label>${k.toUpperCase()}</label><span>${v}</span></div>`).join('')}</div>
                
                <h3 class="gold-t">HECHIZOS (${d.sp.length})</h3>
                <div class="spell-box">
                    ${d.sp.map(s => `<div class="spell-tag">${s}</div>`).join('')}
                </div>
            </div>`;
    } else {
        catalog.style.display = "grid"; dash.style.display = "none";
        const ids = Object.keys(statsGlobal).sort((a,b) => {
            const pA = estadoUI.principales.includes(a) ? 0 : 1;
            const pB = estadoUI.principales.includes(b) ? 0 : 1;
            return pA - pB || a.localeCompare(b);
        });
        catalog.innerHTML = ids.map(id => {
            const d = calcularFicha(id);
            const img = `../img/imgpersonajes/${id.toLowerCase().replace(/\s+/g,'')}icon.png`;
            return `
                <div class="personaje-card" onclick="window.setActivo('${id}')">
                    <img src="${img}" class="img-p" onerror="this.src='../img/icon.png'">
                    <span class="gold-t">${id.toUpperCase()}</span>
                    ${drawBlocks(d.r, d.rM, 'b-red')}
                </div>`;
        }).join('');
    }
}

export function dibujarDiseñador() {
    document.getElementById('panel-op-central').innerHTML = `
        <div class="stat-card designer">
            <h2>DISEÑADOR DE PERSONAJE</h2>
            <div class="form-grid">
                <input id="n-id" placeholder="ID (Linda)">
                <input id="n-hx" type="number" placeholder="Hex">
                <input id="n-vx" type="number" placeholder="Vex">
                <input id="n-ps" type="number" placeholder="Psíquica">
                <input id="n-ra" type="number" placeholder="Rojo Act">
                <input id="n-rm" type="number" placeholder="Rojo Max Base">
                <input id="n-aa" type="number" placeholder="Azul">
                <input id="n-go" type="number" placeholder="Guarda">
            </div>
            <button onclick="window.crearP()" class="btn-save">AGREGAR PERSONAJE A LA LISTA</button>
            <button onclick="window.mostrarPagina('publico')" class="btn-cancel">CANCELAR</button>
        </div>`;
}

