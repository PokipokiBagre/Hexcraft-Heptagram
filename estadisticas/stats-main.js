import { estadoUI, statsGlobal, guardarStats } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { dibujarUIStats, dibujarAdminStats } from './stats-ui.js';
import { descargarCSVStats } from './stats-logic.js';

async function iniciarStats() {
    // Vinculación de funciones globales
    window.setJugadorStats = (j) => { 
        estadoUI.jugadorActivo = j; 
        dibujarUIStats(); 
        if(estadoUI.esAdmin) dibujarAdminStats(); 
    };

    window.setPage = (p) => { 
        estadoUI.paginaActiva = p; 
        document.querySelectorAll('.pagina').forEach(div => div.style.display = 'none');
        const target = document.getElementById('pag-' + p);
        if(target) target.style.display = 'block';
        dibujarUIStats();
    };

    // Mensaje corregido sin mención a "Sheet"
    window.actualizarStats = () => { 
        if(confirm("¿Sincronizar datos?")) { 
            localStorage.removeItem('hex_stats_v1'); 
            location.reload(); 
        } 
    };
    
    const _SYS_OP_CODE = atob('Y2FuZXk='); 
    window.accesoAdmin = () => {
        if(estadoUI.esAdmin) { window.setPage('admin'); return; }
        const pass = prompt("System Code:");
        if(pass === _SYS_OP_CODE) { 
            estadoUI.esAdmin = true;
            window.setPage('admin');
        }
    };

    window.descargarCSVStats = descargarCSVStats;

    try {
        await cargarStatsDesdeCSV();
        // Forzamos el dibujo de la UI para que aparezcan los personajes cargados
        dibujarUIStats(); 
    } catch (e) {
        console.error("Error al cargar personajes:", e);
    }
}

iniciarStats();
