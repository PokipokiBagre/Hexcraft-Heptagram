import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarTodoDesdeCSV, procesarTextoCSV } from './stats-data.js';
import { dibujarCatalogo, dibujarDetalle } from './stats-ui.js';
import { generarCSVExportacion, descargarArchivoCSV } from './stats-logic.js';

async function iniciar() {
    const cache = localStorage.getItem('hex_stats_v1');
    
    // Si no hay caché local, cargamos de Google Sheets
    if (!cache) {
        await cargarTodoDesdeCSV();
    } else {
        const guardado = JSON.parse(cache);
        Object.assign(statsGlobal, guardado.stats);
    }
    
    refrescarVistas();
}

function refrescarVistas() {
    document.getElementById('vista-catalogo').classList.add('oculto');
    document.getElementById('vista-detalle').classList.add('oculto');
    document.getElementById('vista-op').classList.add('oculto');

    if (estadoUI.vistaActual === 'catalogo') {
        document.getElementById('vista-catalogo').classList.remove('oculto');
        dibujarCatalogo();
    } else if (estadoUI.vistaActual === 'detalle') {
        document.getElementById('vista-detalle').classList.remove('oculto');
        dibujarDetalle();
    } else if (estadoUI.vistaActual === 'op') {
        document.getElementById('vista-op').classList.remove('oculto');
    }
}

// Vinculación Global para el HTML
window.mostrarCatalogo = () => { estadoUI.vistaActual = 'catalogo'; refrescarVistas(); };
window.abrirDetalle = (nombre) => { estadoUI.personajeSeleccionado = nombre; estadoUI.vistaActual = 'detalle'; refrescarVistas(); };
window.abrirMenuOP = () => { estadoUI.vistaActual = 'op'; refrescarVistas(); };

window.forzarSincronizacion = async () => {
    if(confirm("¿Seguro? Esto borrará tus cambios locales no descargados y traerá los datos del Sheet maestro.")) {
        await cargarTodoDesdeCSV();
        alert("Sincronización completada.");
        window.mostrarCatalogo();
    }
};

window.descargarAumentada = () => {
    const csv = generarCSVExportacion();
    descargarArchivoCSV(csv, "HEX_ESTADOS_AUMENTADO.csv");
};

window.subirAumentada = (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(e) {
        const texto = e.target.result;
        procesarTextoCSV(texto);
        alert("CSV subido e inyectado a la memoria local con éxito.");
        window.mostrarCatalogo();
    };
    lector.readAsText(archivo);
};

// Arrancar la app
iniciar();

iniciar();

