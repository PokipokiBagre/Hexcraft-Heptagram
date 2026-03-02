import { estadoUI, statsGlobal } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI } from './stats-ui.js';

async function iniciarStats() {
    // 1. Carga prioritaria
    await cargarStatsDesdeCSV();

    // 2. Funciones de ventana (onclick)
    window.setJugadorStats = (j) => { estadoUI.jugadorActivo = j; refrescarUI(); };
    
    window.actualizarTodo = async () => { 
        if(confirm("¿Sincronizar datos?")) { 
            localStorage.removeItem('hex_stats_v1'); 
            location.reload(); 
        } 
    };

    const _access = 'Y2FuZXk='; 
    window.ejecutarSyncLog = () => {
        if (estadoUI.esAdmin) { window.mostrarPagina('admin'); return; }
        const i = prompt("Validation:");
        if (i === atob(_access)) { 
            estadoUI.esAdmin = true; 
            window.mostrarPagina('admin'); 
        }
    };

    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        const target = document.getElementById('pag-' + id);
        if(target) target.style.display = 'block';
        refrescarUI();
    };

    // 3. Inicio visual
    refrescarUI();
}
iniciarStats();
