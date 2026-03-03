import { statsGlobal, estadoUI } from './stats-state.js';
import { calcularVidaRojaMax, calcularVexMax } from './stats-logic.js';

const normalizar = (str) => str.toString().trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
const bText = (val) => val > 0 ? `<span style="color:#00ff00; font-size:0.8em"> (+${val})</span>` : (val < 0 ? `<span style="color:red; font-size:0.8em"> (${val})</span>` : '');

// Previene bucles infinitos de 404
const imgError = "this.onerror=null; this.src='../img/imgobjetos/no_encontrado.png'";

export function dibujarCatalogo() {
    const contenedor = document.getElementById('vista-catalogo');
    let html = '';
    Object.keys(statsGlobal).sort().forEach(nombre => {
        const p = statsGlobal[nombre];
        html += `
        <div class="char-card" onclick="window.abrirDetalle('${nombre}')">
            <img src="../img/imgpersonajes/${normalizar(nombre)}icon.png" onerror="${imgError}">
            <h3>${nombre}</h3>
            <p>HEX: <strong>${p.hex}</strong> | VEX: <strong>${calcularVexMax(p)}</strong></p>
        </div>`;
    });
    contenedor.innerHTML = html;
}

export function dibujarDetalle() {
    const nombre = estadoUI.personajeSeleccionado;
    const p = statsGlobal[nombre];
    if(!p) return;
    if(!p.buffs) p.buffs = { fisica:0, energetica:0, espiritual:0, mando:0, psiquica:0, oscura:0, danoRojo:0, danoAzul:0, elimDorada:0, vidaRojaMaxExtra:0 };

    const contenedor = document.getElementById('vista-detalle');
    let vidaRojaVisual = calcularVidaRojaMax(p);
    let vexVisual = calcularVexMax(p);
    let hexPercent = Math.min((p.hex / 2000) * 100, 100);
    let vexPercent = Math.min((vexVisual / 2000) * 100, 100);
    
    let corazonesRojosHTML = ''; for(let i=0; i < vidaRojaVisual; i++) corazonesRojosHTML += `<div class="heart-red ${i >= p.vidaRojaActual ? 'empty' : ''}"></div>`;
    let corazonesAzulesHTML = ''; for(let i=0; i < p.vidaAzul; i++) corazonesAzulesHTML += `<div class="heart-blue"></div>`;
    let guardasHTML = ''; for(let i=0; i < p.guardaDorada; i++) guardasHTML += `<div class="guard-gold"></div>`;

    contenedor.innerHTML = `
    <div style="display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 20px;">
        <img src="../img/imgpersonajes/${normalizar(nombre)}icon.png" style="width: 120px; border-radius: 50%; border: 3px solid #d4af37;" onerror="${imgError}">
        <div>
            <h1 style="margin: 0;">${nombre.toUpperCase()} ${p.isNPC ? '<span style="font-size:0.4em; color:#aaa">[NPC]</span>' : ''}</h1>
        </div>
        ${estadoUI.esAdmin ? `<button onclick="window.mostrarPaginaOP('editar')" style="margin-left:auto; background:#4a004a; border-color:#d4af37;">Editar / Buffs</button>` : ''}
    </div>

    <div class="circle-wrap">
        <div class="stat-circle" style="background: conic-gradient(var(--gold) ${hexPercent}%, #222 0);"><div class="inner"><strong>${p.hex}</strong><span>HEX</span></div></div>
        <div class="stat-circle" style="background: conic-gradient(var(--blue-life) ${vexPercent}%, #222 0);"><div class="inner"><strong>${vexVisual}</strong><span>VEX</span></div></div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div>
            <h3 style="margin-top:0;">Vitalidad</h3>
            <div class="health-box"><label style="color:var(--red-life);">VIDA ROJA (${p.vidaRojaActual}/${vidaRojaVisual}) ${bText(p.buffs.vidaRojaMaxExtra)}</label><div class="health-grid">${corazonesRojosHTML}</div></div>
            <div class="health-box"><label style="color:var(--blue-life);">VIDA AZUL (${p.vidaAzul})</label><div class="health-grid">${corazonesAzulesHTML}</div></div>
            <div class="health-box"><label style="color:var(--gold);">GUARDA DORADA (${p.guardaDorada})</label><div class="health-grid">${guardasHTML}</div></div>
            
            <h3 style="margin-top:20px;">Ofensiva</h3>
            <div class="affinities-grid">
                <div class="affinity-box"><label style="color:var(--red-life)">Daño Rojo</label><span>${p.danoRojo}${bText(p.buffs.danoRojo)}</span></div>
                <div class="affinity-box"><label style="color:var(--blue-life)">Daño Azul</label><span>${p.danoAzul}${bText(p.buffs.danoAzul)}</span></div>
                <div class="affinity-box"><label style="color:var(--gold)">Elim. Dorada</label><span>${p.elimDorada}${bText(p.buffs.elimDorada)}</span></div>
            </div>
        </div>
        <div>
            <h3 style="margin-top:0;">Afinidades</h3>
            <div class="affinities-grid">
                <div class="affinity-box"><label>Física</label><span>${p.afinidades.fisica}${bText(p.buffs.fisica)}</span></div>
                <div class="affinity-box"><label>Energética</label><span>${p.afinidades.energetica}${bText(p.buffs.energetica)}</span></div>
                <div class="affinity-box"><label>Espiritual</label><span>${p.afinidades.espiritual}${bText(p.buffs.espiritual)}</span></div>
                <div class="affinity-box"><label>Mando</label><span>${p.afinidades.mando}${bText(p.buffs.mando)}</span></div>
                <div class="affinity-box"><label>Psíquica</label><span>${p.afinidades.psiquica}${bText(p.buffs.psiquica)}</span></div>
                <div class="affinity-box"><label>Oscura</label><span>${p.afinidades.oscura}${bText(p.buffs.oscura)}</span></div>
            </div>
        </div>
    </div>`;
}

export function dibujarMenuOP() {
    return `
        <h3>PANEL DE OPERADOR</h3>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
            <button onclick="window.mostrarPaginaOP('crear')" style="background:#004a4a">Crear NPC (Manual)</button>
            <button onclick="window.forzarSincronizacion()" class="btn-green">Sincronizar Sheet</button>
            <button onclick="window.descargarAumentada()">Descargar CSV</button>
            <button onclick="document.getElementById('subir-csv').click()" class="btn-red">Subir CSV</button>
        </div>
        <div id="sub-vista-op"></div>
    `;
}

export function dibujarFormularioCrear() {
    return `
    <div style="text-align:left; max-width:600px; margin:0 auto; background:#150029; padding:20px; border:1px solid var(--gold);">
        <h4 style="margin-top:0">Crear Personaje / NPC</h4>
        <input type="text" id="npc-nombre" placeholder="Nombre" style="width:100%; margin-bottom:10px; padding:5px; background:#000; color:white; border:1px solid #444;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
            <div><label>HEX</label><input type="number" id="npc-hex" value="0" style="width:100%; background:#000; color:white; border:1px solid #444;"></div>
            <div><label>VEX</label><input type="number" id="npc-vex" value="0" style="width:100%; background:#000; color:white; border:1px solid #444;"></div>
            <div><label>Vida Roja Max</label><input type="number" id="npc-vr" value="10" style="width:100%; background:#000; color:white; border:1px solid #444;"></div>
            <div><label>Vida Azul</label><input type="number" id="npc-va" value="0" style="width:100%; background:#000; color:white; border:1px solid #444;"></div>
        </div>
        <button onclick="window.ejecutarCreacionNPC()" style="width:100%; background:var(--gold); color:black;">GUARDAR NPC</button>
    </div>`;
}

export function dibujarFormularioEditar() {
    const p = statsGlobal[estadoUI.personajeSeleccionado];
    if(!p) return `<p>Selecciona un personaje en el catálogo primero.</p>`;

    // Array con todos los stats editables
    const statsAEditar = [
        { id: 'danoRojo', label: 'Daño Rojo Extra' },
        { id: 'danoAzul', label: 'Daño Azul Extra' },
        { id: 'elimDorada', label: 'Elim. Dorada' },
        { id: 'fisica', label: 'Afin. Física' },
        { id: 'energetica', label: 'Afin. Energética' },
        { id: 'espiritual', label: 'Afin. Espiritual' },
        { id: 'mando', label: 'Afin. Mando' },
        { id: 'psiquica', label: 'Afin. Psíquica' },
        { id: 'oscura', label: 'Afin. Oscura' },
        { id: 'vidaRojaMaxExtra', label: 'Corazones (Directo)' }
    ];

    let html = `
    <div style="text-align:center; max-width:900px; margin:0 auto;">
        <h3 style="margin-top:0; color:var(--gold)">Alteración Temporal: ${estadoUI.personajeSeleccionado}</h3>
        <button onclick="window.abrirDetalle('${estadoUI.personajeSeleccionado}')" style="background:#444; margin-bottom: 10px;">⬅ Volver al Perfil</button>
        <div class="edit-grid">`;

    statsAEditar.forEach(s => {
        const val = p.buffs[s.id] || 0;
        const colorVal = val > 0 ? '#00ff00' : (val < 0 ? 'red' : 'var(--gold)');
        const displayVal = val > 0 ? `+${val}` : val;

        html += `
        <div class="edit-card">
            <h4>${s.label}</h4>
            <span style="color: ${colorVal}">${displayVal}</span>
            <div class="btn-row">
                <button class="btn-plus" onclick="window.modificarBuff('${s.id}', 1)">+1</button>
                <button class="btn-minus" onclick="window.modificarBuff('${s.id}', -1)">-1</button>
            </div>
            <div class="btn-row">
                <button class="btn-plus5" onclick="window.modificarBuff('${s.id}', 5)">+5</button>
                <button class="btn-minus5" onclick="window.modificarBuff('${s.id}', -5)">-5</button>
            </div>
        </div>`;
    });

    html += `</div></div>`;
    return html;
}
