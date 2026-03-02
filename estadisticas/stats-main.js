import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI, dibujarDisenador } from './stats-ui.js';
import { exportarCSV } from './stats-logic.js';

async function iniciar() {
    await cargarStatsDesdeCSV();

    window.setPersonaje = (id) => { estadoUI.personajeActivo = id; refrescarUI(); };
    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        if(id === 'admin') dibujarDisenador();
        else { estadoUI.personajeActivo = null; refrescarUI(); }
    };

    window.crearPersonaje = () => {
        const id = document.getElementById('new-p-id').value.trim();
        if(!id) return alert("Falta ID");
        statsGlobal[id] = {
            nombreFull: document.getElementById('new-p-nom').value,
            bio: document.getElementById('new-p-bio').value,
            baseHexVex: [0,0,0,0], f_base: [0,0,0,0,0,0], r_base: [0,10,0,0],
            f_modDir:[0,0,0,0,0,0], f_aumPerm:[0,0,0,0,0,0], f_disPerm:[0,0,0,0,0,0],
            f_aumTemp:[0,0,0,0,0,0], f_disTemp:[0,0,0,0,0,0], f_aumHech:[0,0,0,0,0,0],
            r_modDir:[0,0,0,0], r_aumPerm:[0,0,0,0], r_disPerm:[0,0,0,0], r_aumTemp:[0,0,0,0], r_disTemp:[0,0,0,0],
            spells: { nom:[], hex:[] }
        };
        guardar(); exportarCSV(); alert("Personaje creado. Sube el CSV al Sheet.");
        window.mostrarPagina('publico');
    };

    window.actualizarTodo = async () => { await cargarStatsDesdeCSV(); refrescarUI(); };
    window.ejecutarSyncLog = () => {
        const i = prompt("Validation:");
        if (i === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); }
    };

    refrescarUI();
}
iniciar();
