import { statsGlobal, estadoUI } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI, dibujarDisenador } from './stats-ui.js';

async function iniciar() {
    if (performance.getEntriesByType("navigation")[0]?.type === "reload") { localStorage.removeItem('hex_stats_v5'); }
    await cargarStatsDesdeCSV();

    window.setActivo = (id) => { estadoUI.personajeActivo = id; refrescarUI(); };
    
    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        const t = document.getElementById('pag-' + id);
        if(t) t.style.display = 'block';
        if(id === 'admin') dibujarDisenador();
        else { estadoUI.personajeActivo = null; refrescarUI(); }
    };

    window.generarNuevoPersonaje = () => {
        const id = document.getElementById('new-id').value;
        const h = document.getElementById('new-hex').value || 0;
        const v = document.getElementById('new-vex').value || 0;
        const f = document.getElementById('new-fis').value || 0;
        const e = document.getElementById('new-ene').value || 0;
        const s = document.getElementById('new-esp').value || 0;
        const m = document.getElementById('new-man').value || 0;
        const p = document.getElementById('new-psi').value || 0;
        const o = document.getElementById('new-osc').value || 0;
        const rA = document.getElementById('new-rA').value || 0;
        const rM = document.getElementById('new-rM').value || 10;
        const aA = document.getElementById('new-aA').value || 0;
        const go = document.getElementById('new-go').value || 0;
        const spl = document.getElementById('new-spells').value || "";

        // Genera línea exacta A-S
        const csv = `"${id}",${h},${v},${f},${e},${s},${m},${p},${o},${rA},${rM},${aA},${go},0,0,0,"","${spl}",""\n`;
        const blob = new Blob([csv], {type:'text/csv'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ENTRADA_${id}.csv`; a.click();
    };

    window.actualizarTodo = async () => { if(confirm("¿Sincronizar?")) { await cargarStatsDesdeCSV(); refrescarUI(); } };
    window.ejecutarSyncLog = () => { if (prompt("Validation:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); } };

    refrescarUI();
}
iniciar();
