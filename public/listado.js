// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', async () => {
    // Selecciona el cuerpo de la tabla donde se mostrarán las reservas
    const tbody = document.querySelector('#tablaReservas tbody');
    try {
        // Realiza una petición a la API para obtener las reservas futuras
        const res = await fetch('/api/reservas/futuras');
        const reservas = await res.json();
        // Ordenar reservas por fecha ascendente (más próxima primero)
        reservas.sort((a, b) => {
            // Convierte las fechas de las reservas a objetos Date para compararlas
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            if (fechaA < fechaB) return -1;
            if (fechaA > fechaB) return 1;
            // Si la fecha es igual, ordenar por turno
            // Define el orden de los turnos en un array
            const turnos = [
                "8 a 10", "10 a 12", "12 a 14", "14 a 16", "16 a 18", "18 a 20", "20 a 22"
            ];
            // Compara los índices de los turnos para ordenarlos correctamente
            return turnos.indexOf(a.turno) - turnos.indexOf(b.turno);
        });
        // Genera el HTML de las filas de la tabla con los datos de las reservas y lo inserta en el body
        tbody.innerHTML = reservas.map(r => `
            <tr>
                <td>${r.tipo}</td>
                <td>${r.nombre}</td>
                <td>${r.materia}</td>
                <td>${r.correo}</td>
                <td>${r.laboratorio}</td>
                <td>${r.fecha}</td>
                <td>${r.turno}</td>
            </tr>
        `).join(''); 
    } catch (err) { 
        // Si ocurre un error al cargar las reservas, muestra un mensaje de error en la tabla
        tbody.innerHTML = '<tr><td colspan="7">Error cargando reservas</td></tr>';
    }
}); 