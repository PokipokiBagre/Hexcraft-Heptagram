import { estadoUI, statsGlobal, guardarStats } from './stat-state.js';
import { cargarStatsDesdeCSV } from './stat-data.js';
import { dibujarUIStats, dibujarAdminStats } from './stat-ui.js';
import { descargarCSVStats } from './stat-logic.js';

async function iniciarStats() {
    await cargarStatsDesdeCSV();
    
    // Vinculación Global
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
        dibujarUIStats(); // Refresca para asegurar que el selector se vea bien
    };

    window.actualizarStats = () => { 
        if(confirm("¿Sincronizar datos con el Sheet?")) { 
            localStorage.removeItem('hex_stats_v1'); 
            location.reload(); 
        } 
    };
    
    window.accesoAdmin = () => {
        if(estadoUI.esAdmin) { window.setPage('admin'); return; }
        const pass = prompt("System Code:");
        if(pass === atob('Y2FuZXk=')) { // caney
            estadoUI.esAdmin = true;
            window.setPage('admin');
        }
    };

    window.addHechizoAdmin = () => {
        const nom = document.getElementById('add-spell-name').value;
        const hex = document.getElementById('add-spell-hex').value;
        const afin = document.getElementById('add-spell-afin').value;
        if(!nom || !estadoUI.jugadorActivo) return;
        
        statsGlobal[estadoUI.jugadorActivo].learnedSpells.push({ afinidad: afin, nombre: nom, costo: hex });
        guardarStats();
        alert("Añadido localmente. Descarga el CSV para guardar.");
        dibujarAdminStats();
    };

    window.descargarCSVStats = descargarCSVStats;

    dibujarUIStats();
}

iniciarStats();
