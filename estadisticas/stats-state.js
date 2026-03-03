export let statsGlobal = {}; 
export let estadoUI = { esAdmin: false, paginaActiva: 'publico' };
export function guardar() { localStorage.setItem('hex_stats_v5', JSON.stringify(statsGlobal)); }
