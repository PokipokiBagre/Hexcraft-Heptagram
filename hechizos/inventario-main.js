import { estadoUI } from './inventario-state.js';
import { inicializarDatos, sincronizarColaBD } from './inventario-data.js';
import { dibujarCatalogo, dibujarGrimorio, dibujarGestion, dibujarAprendizaje } from './inventario-ui.js';

async function arrancarApp() {
    const loader = document.getElementById('loader');
    const ok = await inicializarDatos();
    
    if(!ok) {
        loader.innerHTML = "<span style='color:red;'>Fallo al cargar base de datos maestra.</span>";
        return;
    }
    
    loader.style.display = 'none';
    window.cambiarVista('catalogo');
}

window.cambiarVista = (vista) => {
    estadoUI.vistaActual = vista;
    document.querySelectorAll('.vista-seccion').forEach(el => el.classList.add('oculto'));
    
    if (vista === 'catalogo') {
        document.getElementById('c-catalogo').classList.remove('oculto');
        dibujarCatalogo();
    } else if (vista === 'grimorio') {
        document.getElementById('c-grimorio').classList.remove('oculto');
        dibujarGrimorio();
    } else if (vista === 'gestion') {
        document.getElementById('c-gestion').classList.remove('oculto');
        dibujarGestion();
    } else if (vista === 'aprendizaje') {
        document.getElementById('c-aprendizaje').classList.remove('oculto');
        dibujarAprendizaje();
    }
    
    actualizarBotonSync();
    window.scrollTo(0,0);
};

window.abrirGrimorio = (pj) => {
    estadoUI.personajeSeleccionado = pj;
    window.cambiarVista('grimorio');
};

window.abrirMenuOP = () => {
    if(estadoUI.esAdmin) {
        estadoUI.esAdmin = false;
        alert("Modo OP Desactivado.");
        window.cambiarVista('catalogo');
        return;
    }
    const pass = prompt("Contraseña de Operador:");
    if (pass === atob('Y2FuZXk=')) {
        estadoUI.esAdmin = true;
        alert("Modo OP Activado. Controles de gestión desbloqueados.");
        window.cambiarVista(estadoUI.vistaActual); // Redibujar
    } else if (pass !== null) alert("Acceso denegado.");
};

// --- GESTIÓN DE LA COLA ---
window.accionCola = (accion, nombreHechizo, afinidad = '', hex = 0) => {
    const pj = estadoUI.personajeSeleccionado;
    
    if(accion === 'agregar') {
        estadoUI.colaCambios.agregar.push({
            Personaje: pj, Hechizo: nombreHechizo, "Hechizo Afinidad": afinidad, "Hechizo Hex": hex, Tipo: "Normal", Origen: "Panel OP"
        });
    } else if (accion === 'quitar') {
        estadoUI.colaCambios.quitar.push({ Personaje: pj, Hechizo: nombreHechizo });
    }
    
    if(estadoUI.vistaActual === 'gestion') dibujarGestion();
    actualizarBotonSync();
};

window.aplicarFiltroGestion = () => {
    estadoUI.filtrosGestion.afinidad = document.getElementById('filtro-afinidad').value;
    estadoUI.filtrosGestion.clase = document.getElementById('filtro-clase').value;
    estadoUI.filtrosGestion.busqueda = document.getElementById('filtro-texto').value;
    dibujarGestion();
};

function actualizarBotonSync() {
    const btn = document.getElementById('btn-sync-global');
    const hayCambios = estadoUI.colaCambios.agregar.length > 0 || estadoUI.colaCambios.quitar.length > 0;
    
    if (hayCambios && estadoUI.esAdmin) {
        btn.classList.remove('oculto');
        btn.innerText = `🔥 GUARDAR CAMBIOS (${estadoUI.colaCambios.agregar.length} add / ${estadoUI.colaCambios.quitar.length} rem) 🔥`;
    } else {
        btn.classList.add('oculto');
    }
}

window.ejecutarSincronizacion = async () => {
    const btn = document.getElementById('btn-sync-global');
    btn.innerText = "Sincronizando..."; btn.disabled = true;
    
    const exito = await sincronizarColaBD(estadoUI.colaCambios);
    if(exito) {
        alert("Datos guardados (Simulado). \n*Nota: La API actual de Google necesita actualización para procesar eliminaciones.");
        estadoUI.colaCambios = { agregar: [], quitar: [] };
        window.cambiarVista('grimorio');
    }
    btn.disabled = false;
};

// Inicialización de filtros para el Catálogo
window.setFiltro = (tipo, valor) => {
    if(tipo === 'rol') estadoUI.filtroRol = valor;
    if(tipo === 'act') estadoUI.filtroAct = valor;
    dibujarCatalogo();
};

window.onload = arrancarApp;
