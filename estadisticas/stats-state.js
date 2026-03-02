export let statsGlobal = {}; 
export let estadoUI = {
    personajeActivo: null,
    esAdmin: false,
    paginaActiva: 'publico',
    principales: [] // Dueños provenientes de Objetos
};

export function guardar() { 
    localStorage.setItem('hex_stats_vPersistence_Final', JSON.stringify(statsGlobal)); 
}
