import { estadoUI, statsGlobal, guardarStats } from './stat-state.js';
import { cargarStatsDesdeCSV } from './stat-data.js';
import { dibujarUIStats, dibujarAdminStats } from './stat-ui.js';
import { descargarCSVStats } from './stat-logic.js';

async function iniciarStats() {
    await cargarStatsDesdeCSV();
    
    window.setJugadorStats = (j) => { estadoUI.jugadorActivo = j; dibujarUIStats(); if(estadoUI.esAdmin) dibujarAdminStats(); };
    window.setPage = (p) => { 
        estadoUI.paginaActiva = p; 
        document.querySelectorAll('.pagina').forEach(div => div.style.display = 'none');
        document.getElementById('pag-' + p).style.display = 'block';
        if(p === 'admin') dibujarAdminStats();
    };

    window.actualizarStats = async () => { if(confirm("¿Sincronizar datos con Sheet?")) { localStorage.clear(); location.reload(); } };
    
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
        if(!nom) return;
        statsGlobal[estadoUI.jugadorActivo].learnedSpells.push({ afinidad: 'Manual', nombre: nom, costo: hex });
        guardarStats();
        alert("Hechizo añadido localmente. Descarga el CSV para guardar cambios permanentes.");
        dibujarAdminStats();
    };

    window.descargarCSVStats = descargarCSVStats;

    dibujarUIStats();
}

iniciarStats();