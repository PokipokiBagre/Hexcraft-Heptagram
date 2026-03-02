import { statsGlobal, estadoUI } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI } from './stats-ui.js';
import { descargarCSVStats } from './stats-logic.js';

async function iniciar() {
    // 1. Carga asíncrona (Espejo de Objetos)
    try {
        await cargarStatsDesdeCSV();
        console.log("Personajes cargados:", Object.keys(statsGlobal));
    } catch (e) { console.error("Fallo de conexión:", e); }

    // 2. Vinculación Global
    window.setJugadorStats = (j) => { estadoUI.jugadorActivo = j; refrescarUI(); };
    window.actualizarTodo = async () => { if(confirm("¿Sincronizar datos?")) { await cargarStatsDesdeCSV(); refrescarUI(); } };
    
    const _access = 'Y2FuZXk='; // Base64 para ocultar 'caney'
    window.ejecutarSyncLog = () => {
        const i = prompt("Validation:");
        if (i === atob(_access)) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); }
    };

    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        const target = document.getElementById('pag-' + id);
        if(target) target.style.display = 'block';
        refrescarUI();
    };

    window.descargarCSVStats = descargarCSVStats;

    // 3. Inicio
    refrescarUI();
}

iniciar();
