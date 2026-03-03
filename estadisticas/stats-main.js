import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI, dibujarDiseñador } from './stats-ui.js';

async function iniciar() {
    await cargarStatsDesdeCSV();

    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        if(id === 'admin') dibujarDiseñador();
        else refrescarUI();
    };

    window.agregarLocal = () => {
        const id = document.getElementById('n-id').value;
        if(!id) return alert("Falta ID");
        statsGlobal[id] = {
            id: id, hex: document.getElementById('n-hx').value, vex: document.getElementById('n-vx').value,
            fis: document.getElementById('n-fi').value, ene: document.getElementById('n-en').value, esp: document.getElementById('n-es').value, 
            man: document.getElementById('n-ma').value, psi: document.getElementById('n-ps').value, osc: document.getElementById('n-os').value,
            roja: document.getElementById('n-ra').value, rojaM: document.getElementById('n-rm').value, azul: document.getElementById('n-aa').value, oro: document.getElementById('n-go').value,
            dR: document.getElementById('n-dr').value, dA: document.getElementById('n-da').value, eO: 0
        };
        guardar(); refrescarUI(); window.mostrarPagina('publico');
    };

    window.descargarFila = () => {
        const id = document.getElementById('n-id').value;
        const csv = `"${id}",${document.getElementById('n-hx').value},${document.getElementById('n-vx').value},${document.getElementById('n-fi').value},${document.getElementById('n-en').value},${document.getElementById('n-es').value},${document.getElementById('n-ma').value},${document.getElementById('n-ps').value},${document.getElementById('n-os').value},${document.getElementById('n-ra').value},${document.getElementById('n-rm').value},${document.getElementById('n-aa').value},${document.getElementById('n-go').value},${document.getElementById('n-dr').value},${document.getElementById('n-da').value},0,"","",""\n`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
        link.download = `ENTRADA_${id}.csv`; link.click();
    };

    window.actualizarTodo = async () => { if(confirm("¿Sincronizar?")) { await cargarStatsDesdeCSV(); refrescarUI(); } };
    window.ejecutarSyncLog = () => { if (prompt("Val:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); } };

    refrescarUI();
}
iniciar();
