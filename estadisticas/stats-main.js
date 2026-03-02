import { estadoUI, statsGlobal, guardarStats } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { dibujarUIStats, dibujarAdminStats } from './stats-ui.js';
import { descargarCSVStats } from './stats-logic.js';

async function iniciarStats() {
    await cargarStatsDesdeCSV();
    
    window.setJugadorStats = (j) => { 
        estadoUI.jugadorActivo = j; 
        dibujarUIStats(); 
        if(estadoUI.esAdmin) dibujarAdminStats(); 
    };

    window.setPage = (p) => { 
        estadoUI.paginaActiva = p; 
        document.querySelectorAll('.pagina').forEach(div => div.style.display = 'none');
        document.getElementById('pag-' + p).style.display = 'block';
        if(p === 'admin') dibujarAdminStats();
    };

    window.actualizarStats = async () => { 
        if(confirm("¿Sincronizar datos con Sheet?")) { 
            localStorage.clear(); 
            location.reload(); 
        } 
    };
    
    window.accesoAdmin = () => {
        if(estadoUI.esAdmin) { window.setPage('admin'); return; }
        const pass = prompt("System Code:");
        if(pass === atob('Y2FuZXk=')) { // pass: caney
            estadoUI.esAdmin = true;
            window.setPage('admin');
        }
    };

    window.descargarCSVStats = descargarCSVStats;

    dibujarUIStats();
}

iniciarStats();
