import { invGlobal, objGlobal, historial, estadoUI } from './obj-state.js';
import { cargarTodoDesdeCSV } from './obj-data.js';
import { modificar, descargarLog, descargarEstadoCSV, descargarInventariosJPG } from './obj-logic.js';
import { refrescarUI, dibujarMenuOP, dibujarInventarios, dibujarCatalogo, dibujarControl } from './obj-ui.js';

async function iniciar() {
    if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
        localStorage.removeItem('hex_obj_v4');
    }

    const cache = localStorage.getItem('hex_obj_v4');
    if (!cache) await cargarTodoDesdeCSV();
    else { const p = JSON.parse(cache); Object.assign(invGlobal, p.inv); Object.assign(objGlobal, p.obj); historial.push(...(p.his || [])); }
    
    // SISTEMA DE POP-UP GLOBAL MOVIBLE CORREGIDO
    const modal = document.createElement('div');
    modal.id = 'hex-modal-view';
    modal.className = 'hex-modal';
    modal.innerHTML = `<img id="hex-modal-img" src="" draggable="false">`;
    document.body.appendChild(modal);

    const modalImg = document.getElementById('hex-modal-img');
    let isDragging = false, offsetX, offsetY;

    // Lógica para cerrar si haces clic en el fondo borroso
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Lógica de movimiento suave basada en el punto de clic
    modalImg.onmousedown = (e) => {
        isDragging = true;
        // Obtenemos el punto de clic relativo dentro de la propia imagen
        const rect = modalImg.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        modalImg.style.cursor = 'grabbing';
    };

    window.onmousemove = (e) => {
        if (!isDragging) return;
        // Calculamos la nueva posición restando el offset para evitar el salto
        modalImg.style.left = (e.clientX - offsetX) + 'px';
        modalImg.style.top = (e.clientY - offsetY) + 'px';
        modalImg.style.transform = 'none'; // Quita el centrado CSS para que no luche con el movimiento
    };

    window.onmouseup = () => { isDragging = false; modalImg.style.cursor = 'grab'; };

    window.verImagen = (url) => {
        modalImg.src = url;
        modalImg.style.left = '50%'; modalImg.style.top = '50%'; 
        modalImg.style.transform = 'translate(-50%, -50%)'; // Centrado inicial
        modal.style.display = 'flex';
    };

    // Funciones globales vinculadas a window para que los botones funcionen
    const _session = 'Y2FuZXk=';
    window.copyToClipboard = (id) => { const area = document.getElementById(id); area.select(); document.execCommand('copy'); };
    window.limpiarLog = () => { estadoUI.cambiosSesion = {}; estadoUI.logCopy = ""; refrescarUI(); };
    
    window.actualizarBitacoraTexto = () => {
        let lines = [];
        for (const j in estadoUI.cambiosSesion) {
            for (const o in estadoUI.cambiosSesion[j]) {
                const c = estadoUI.cambiosSesion[j][o]; if (c === 0) continue;
                lines.push(`<${j} | ${c > 0 ? "OO" : "OP"}: ${o}${Math.abs(c) > 1 ? ' x' + Math.abs(c) : ''} | ${objGlobal[o]?.eff || "..."}>`);
            }
        }
        estadoUI.logCopy = lines.join('\n'); refrescarUI();
    };

    window.hexMod = (j, o, c) => {
        if (!estadoUI.cambiosSesion[j]) estadoUI.cambiosSesion[j] = {};
        estadoUI.cambiosSesion[j][o] = (estadoUI.cambiosSesion[j][o] || 0) + c;
        if (estadoUI.cambiosSesion[j][o] === 0) delete estadoUI.cambiosSesion[j][o];
        window.actualizarBitacoraTexto(); modificar(j, o, c, refrescarUI);
    };

    window.actualizarTodo = async () => { if(confirm("¿Sincronizar?")) { await cargarTodoDesdeCSV(); refrescarUI(); alert("OK"); } };
    
    window.ejecutarSyncLog = () => {
        if (estadoUI.esAdmin) { dibujarMenuOP(); window.mostrarPagina('op-menu'); return; }
        const i = prompt("System Code:"); if (i === atob(_session)) { estadoUI.esAdmin = true; dibujarMenuOP(); window.mostrarPagina('op-menu'); }
    };

    window.mostrarPagina = (id) => { 
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none'); 
        const target = document.getElementById('pag-' + id);
        if(target) target.style.display = 'block'; 
        refrescarUI(); 
    };

    // Vinculación de los disparadores de UI a window
    window.setInv = (j) => { estadoUI.jugadorInv = j; dibujarInventarios(); };
    window.setCtrl = (j) => { estadoUI.jugadorControl = j; dibujarControl(); };
    window.setRar = (r) => { estadoUI.filtroRar = r; dibujarCatalogo(); };
    window.setMat = (m) => { estadoUI.filtroMat = m; dibujarCatalogo(); };
    window.setBusquedaInv = (v) => { estadoUI.busquedaInv = v; dibujarInventarios(); };
    window.setBusquedaCat = (v) => { estadoUI.busquedaCat = v; dibujarCatalogo(); };
    window.setBusquedaOP = (v) => { estadoUI.busquedaOP = v; dibujarControl(); };
    
    window.descargarEstadoCSV = descargarEstadoCSV; window.descargarInventariosJPG = descargarInventariosJPG; window.descargarLog = descargarLog;
    refrescarUI();
}
iniciar();
