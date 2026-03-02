import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarTodo } from './stats-data.js';
import { refrescarUI, dibujarMenuOP, dibujarDisenador } from './stats-ui.js';

async function iniciar() {
    // 1. Recuperar persistencia (Sin borrar al recargar)
    const cache = localStorage.getItem('hex_stats_vPersistence_Final');
    if (cache) Object.assign(statsGlobal, JSON.parse(cache));

    // 2. Sincronizar con Google Sheets (Aquí entrará Linda con sus stats)
    await cargarTodo();

    // 3. Funciones Globales
    window.setActivo = (id) => { estadoUI.personajeActivo = id; refrescarUI(); };
    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        if(id === 'admin') dibujarMenuOP();
        if(id === 'publico') { estadoUI.personajeActivo = null; refrescarUI(); }
    };

    window.mostrarDiseñador = () => { dibujarDisenador(); };

    window.crearP = () => {
        const id = document.getElementById('n-id').value;
        if(!id) return alert("Falta ID");
        statsGlobal[id] = {
            hx: parseInt(document.getElementById('n-hx').value)||0,
            vx: parseInt(document.getElementById('n-vx').value)||0,
            af: { fi:0, en:0, es:0, ma:0, ps:parseInt(document.getElementById('n-ps').value)||0, os:0 },
            vi: { act:parseInt(document.getElementById('n-ra').value)||0, rM:parseInt(document.getElementById('n-rm').value)||0, a:parseInt(document.getElementById('n-aa').value)||0, g:parseInt(document.getElementById('n-go').value)||0 },
            spNom: [], spAf: []
        };
        guardar(); alert("Personaje Inyectado"); refrescarUI(); window.mostrarPagina('publico');
    };

    window.actualizarTodo = async () => { if(confirm("¿Forzar Sincronización?")) { await cargarTodo(); refrescarUI(); } };
    window.ejecutarSyncLog = () => { if (prompt("Val:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); } };

    refrescarUI();
}
iniciar();

