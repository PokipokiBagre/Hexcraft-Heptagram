import { statsGlobal, estadoUI } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI, dibujarAdmin } from './stats-ui.js';

async function iniciar() {
    if (performance.getEntriesByType("navigation")[0]?.type === "reload") { localStorage.removeItem('hex_stats_v3'); }
    await cargarStatsDesdeCSV();

    window.setActivo = (id) => { estadoUI.personajeActivo = id; refrescarUI(); };
    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        if(id === 'admin') dibujarAdmin();
        else { estadoUI.personajeActivo = null; refrescarUI(); }
    };

    window.generarLineaCSV = () => {
        const id = document.getElementById('new-id').value;
        const linea = `"${id}",0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,"","",""\n`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([linea], {type:'text/csv'}));
        link.download = `ENTRADA_${id}.csv`; link.click();
    };

    window.actualizarTodo = async () => { if(confirm("¿Sincronizar?")) { await cargarStatsDesdeCSV(); refrescarUI(); } };
    window.ejecutarSyncLog = () => { if (prompt("Validation:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); } };

    refrescarUI();
}
iniciar();
