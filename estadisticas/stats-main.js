import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarTodo } from './stats-data.js';
import { refrescarUI, dibujarDiseñador } from './stats-ui.js';

async function iniciar() {
    if (performance.getEntriesByType("navigation")[0]?.type === "reload") { localStorage.removeItem('hex_stats_vFinal_v3'); }
    
    // Forzamos la carga del CSV. Linda DEBE aparecer ahora.
await cargarTodo();
    window.setActivo = (id) => { estadoUI.personajeActivo = id; refrescarUI(); };
    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        if(id === 'admin') dibujarMenuOP();
        if(id === 'publico') { estadoUI.personajeActivo = null; refrescarUI(); }
    };
    window.actualizarTodo = async () => { if(confirm("¿Fusión de Sheets?")) { await cargarTodo(); refrescarUI(); } };
    window.ejecutarSyncLog = () => { if(prompt("Pass:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); }};

    window.addP = () => {
        const id = document.getElementById('n-id').value;
        if(!id) return;
        statsGlobal[id] = { hx:0, vx:0, af:{fi:0,en:0,es:0,ma:0,ps:0,os:0}, vi:{r:0,rM:0,a:0,g:0}, sp:[], spAf:[] };
        guardar(); refrescarUI(); window.mostrarPagina('publico');
    };
    refrescarUI();

    window.agregarYRefrescar = () => {
        const id = document.getElementById('n-id').value;
        if(!id) return alert("Falta ID");
        statsGlobal[id] = {
            hex: parseInt(document.getElementById('n-hx').value)||0,
            vex: parseInt(document.getElementById('n-vx').value)||0,
            afin: { fis:parseInt(document.getElementById('n-fi').value)||0, ene:parseInt(document.getElementById('n-en').value)||0, esp:parseInt(document.getElementById('n-es').value)||0, man:parseInt(document.getElementById('n-ma').value)||0, psi:parseInt(document.getElementById('n-ps').value)||0, osc:parseInt(document.getElementById('n-os').value)||0 },
            vida: { act:parseInt(document.getElementById('n-ra').value)||0, maxBase:parseInt(document.getElementById('n-rm').value)||0, azul:parseInt(document.getElementById('n-aa').value)||0, oro:0 },
            dan: { r:0, a:0, e:0 }, learnedSpells: []
        };
        guardar(); alert("Personaje Inyectado"); refrescarUI(); window.mostrarPagina('publico');
    };

    window.actualizarTodo = async () => { await cargarStatsDesdeCSV(); refrescarUI(); alert("Sincronizado"); };
    window.ejecutarSyncLog = () => { if (prompt("Val:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); } };

    refrescarUI();
    
}
iniciar();

