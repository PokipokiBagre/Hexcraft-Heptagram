export let statsGlobal = {};
export let listaEstados = []; 
export let estadoUI = {
    vistaActual: 'catalogo',
    personajeSeleccionado: null,
    esAdmin: false,
    filtroRol: 'Todos',
    filtroAct: 'Todos',
    party: [null, null, null, null, null, null], // Memoria de los 6 slots
    hexLog: {}, // Memoria del registro unificado agrupado
    selectorIndex: null, // Índice para saber qué slot de party estamos cambiando
    modoSincronizado: true // Sincronización Auto a 10s Activada
};

export function guardar() {
    localStorage.setItem('hex_stats_v2', JSON.stringify({ 
        stats: statsGlobal,
        party: estadoUI.party,
        modoSync: estadoUI.modoSincronizado
    }));
}
