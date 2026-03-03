export let statsGlobal = {};
export let estadoUI = {
    vistaActual: 'catalogo',
    personajeSeleccionado: null,
    esAdmin: false
};

export function guardar() {
    localStorage.setItem('hex_stats_v2', JSON.stringify({ stats: statsGlobal }));
}
