import { invGlobal, objGlobal, historial, estadoUI } from './obj-state.js';
import { cargarTodoDesdeCSV } from './obj-data.js';
import { modificar, descargarLog, importarLog, descargarEstadoCSV, descargarInventariosJPG, agregarObjetoManual } from './obj-logic.js';
import { refrescarUI, dibujarMenuOP, dibujarFormularioObjeto } from './obj-ui.js';

async function iniciar() {
    const cache = localStorage.getItem('hex_obj_v4');
    if (!cache) await cargarTodoDesdeCSV();
    else {
        const p = JSON.parse(cache);
        Object.assign(invGlobal, p.inv); Object.assign(objGlobal, p.obj);
        historial.push(...(p.his || []));
    }
    
    const _session = 'Y2FuZXk=';

    window.ejecutarSyncLog = () => {
        if (estadoUI.esAdmin) {
            dibujarMenuOP();
            window.mostrarPagina('op-menu');
            return;
        }
        const i = prompt("System Validation Code:");
        if (i === atob(_session)) {
            estadoUI.esAdmin = true; 
            dibujarMenuOP(); 
            window.mostrarPagina('op-menu');
        } else { alert("Error de redundancia en el servidor."); }
    };

    window.mostrarAgregarObjeto = () => {
        window.mostrarPagina('control');
        dibujarFormularioObjeto();
    };

    window.ejecutarAgregarObjeto = () => {
        const datos = {
            nombre: document.getElementById('new-obj-name').value.trim(),
            tipo: document.getElementById('new-obj-tipo').value,
            mat: document.getElementById('new-obj-mat').value,
            eff: document.getElementById('new-obj-eff').value.trim(),
            rar: document.getElementById('new-obj-rar').value
        };
        const reparticion = {};
        document.querySelectorAll('.cant-input').forEach(input => {
            reparticion[input.dataset.player] = input.value;
        });
        agregarObjetoManual(datos, reparticion, () => {
            dibujarMenuOP();
            window.mostrarPagina('op-menu');
        });
    };

    window.setBusqueda = (v) => { estadoUI.busquedaOP = v; refrescarUI(); };
    window.setBusquedaCat = (v) => { estadoUI.busquedaCat = v; refrescarUI(); };
    window.setBusquedaInv = (v) => { estadoUI.busquedaInv = v; refrescarUI(); };
    window.actualizarTodo = () => { if(confirm("¿Actualizar sistema?")) { localStorage.clear(); location.reload(); } };
    window.mostrarPagina = (id) => {
        estadoUI.busquedaCat = ""; estadoUI.busquedaInv = "";
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        refrescarUI();
    };
    window.hexMod = (j, o, c) => modificar(j, o, c, refrescarUI);
    window.setInv = (j) => { estadoUI.jugadorInv = j; refrescarUI(); };
    window.setCtrl = (j) => { estadoUI.jugadorControl = j; refrescarUI(); };
    window.setRar = (r) => { estadoUI.filtroRar = r; refrescarUI(); };
    window.setMat = (m) => { estadoUI.filtroMat = m; refrescarUI(); };
    window.descargarEstadoCSV = descargarEstadoCSV;
    window.descargarInventariosJPG = descargarInventariosJPG;
    window.descargarLog = descargarLog;
    window.copyToClipboard = (id) => {
        const area = document.getElementById(id);
        area.select();
        document.execCommand('copy');
        const btnOriginalText = event.target.innerText;
        event.target.innerText = "¡Copiado!";
        setTimeout(() => event.target.innerText = btnOriginalText, 2000);
    };
    window.updateForgeLog = () => {
        const nombre = document.getElementById('new-obj-name').value || "Objeto";
        const efecto = document.getElementById('new-obj-eff').value || "Sin efecto";
        let lineas = [];
        
        document.querySelectorAll('.cant-input').forEach(input => {
            const cant = parseInt(input.value) || 0;
            if (cant > 0) {
                const jugador = input.dataset.player;
                const multiplicador = cant > 1 ? ` x${cant}` : "";
                lineas.push(`<${jugador} | OO: ${nombre}${multiplicador} | ${efecto}`);
            }
        });
        
        document.getElementById('copy-log-forge').value = lineas.join('\n');
    };
    const originalHexMod = window.hexMod;
    window.hexMod = (j, o, c) => {
        const tag = c > 0 ? "OO" : "OP"; // Objeto Obtenido o Perdido
        const efecto = objGlobal[o]?.eff || "Sin efecto";
        estadoUI.logCopy = `<${j} | ${tag}: ${o} | ${efecto}`;
        modificar(j, o, c, refrescarUI);
    };
    window.subirLogManual = () => document.getElementById('input-log').click();
    document.getElementById('input-log')?.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => importarLog(ev.target.result, refrescarUI);
        reader.readAsText(e.target.files[0]);
    });
    refrescarUI();
}
iniciar();

