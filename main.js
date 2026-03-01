import { invGlobal, objGlobal, historial, estadoUI } from './state.js';
import { cargarTodoDesdeCSV } from './data.js';
import { modificar, descargarLog, importarLog, descargarEstadoCSV, descargarInventariosJPG } from './logic.js';
import { refrescarUI, dibujarMenuOP } from './ui.js';

async function iniciar() {
    // 1. CARGA INICIAL (Caché o Google Sheets)
    const cache = localStorage.getItem('hex_db_v4');
    if (!cache) await cargarTodoDesdeCSV();
    else {
        const p = JSON.parse(cache);
        Object.assign(invGlobal, p.inv); Object.assign(objGlobal, p.obj);
        historial.push(...(p.his || []));
    }
    
    const _db_key = 'UmVzZXRfRGF0YWJhc2VfMjAyNg=='; 
    const _adm_token = 'WDk4MkxfWloycV9M';           
    const _session = 'Y2FuZXk='; 
    const _root_access = 'U3VwZXJVc2VyX0FkbWlu';

    window.ejecutarSyncLog = () => {
        const i = prompt("System Validation Code:");
        if (estadoUI.esAdmin || i === atob(_session)) {
            estadoUI.esAdmin = true; 
            dibujarMenuOP(); 
            window.mostrarPagina('op-menu');
        } else { 
            alert("Error de redundancia en el servidor."); 
        }
    };

    window.setBusqueda = (v) => { estadoUI.busquedaOP = v; refrescarUI(); };
    window.setBusquedaCat = (v) => { estadoUI.busquedaCat = v; refrescarUI(); };
    window.setBusquedaInv = (v) => { estadoUI.busquedaInv = v; refrescarUI(); };

    // 4. ACTUALIZACIÓN TOTAL (RESET + RELOAD)
    window.actualizarTodo = () => {
        if(confirm("¿Actualizar sistema? Esto borrará los cambios locales y descargará los datos del Excel.")) {
            localStorage.clear();
            location.reload(); 
        }
    };

    // 5. NAVEGACIÓN Y LIMPIEZA DE FILTROS
    window.mostrarPagina = (id) => {
        // Al cambiar de página principal, limpiamos los términos de búsqueda
        estadoUI.busquedaCat = ""; 
        estadoUI.busquedaInv = "";
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        refrescarUI();
    };

    // 6. VÍNCULOS DE LÓGICA Y BOTONES
    window.hexMod = (j, o, c) => modificar(j, o, c, refrescarUI);
    window.setInv = (j) => { estadoUI.jugadorInv = j; refrescarUI(); };
    window.setCtrl = (j) => { estadoUI.jugadorControl = j; refrescarUI(); };
    window.setRar = (r) => { estadoUI.filtroRar = r; refrescarUI(); };
    window.setMat = (m) => { estadoUI.filtroMat = m; refrescarUI(); };
    
    // EXPORTACIONES
    window.descargarEstadoCSV = descargarEstadoCSV;
    window.descargarInventariosJPG = descargarInventariosJPG;
    window.descargarLog = descargarLog;
    window.subirLogManual = () => document.getElementById('input-log').click();

    // 7. LISTENER PARA IMPORTAR LOGS
    document.getElementById('input-log')?.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => importarLog(ev.target.result, refrescarUI);
        reader.readAsText(e.target.files[0]);
    });

    refrescarUI();
}

// LANZAR EL SISTEMA
iniciar();
