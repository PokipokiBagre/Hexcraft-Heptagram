export let statsGlobal = {}; 
export let estadoUI = {
    personajeActivo: null,
    esAdmin: false,
    paginaActiva: 'publico',
    principales: [] // Personajes que tienen objetos en el sistema paralelo
};

export function guardar() { 
    localStorage.setItem('hex_stats_v2', JSON.stringify(statsGlobal)); 
}
