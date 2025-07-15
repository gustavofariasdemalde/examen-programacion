document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.querySelector('#tablaReservas tbody');
    try {
        const res = await fetch('/api/reservas/futuras');
        const reservas = await res.json();
        // Ordenar reservas por fecha ascendente (más próxima primero)
        reservas.sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            if (fechaA < fechaB) return -1;
            if (fechaA > fechaB) return 1;
            // Si la fecha es igual, ordenar por turno
            const turnos = [
                "8 a 10", "10 a 12", "12 a 14", "14 a 16", "16 a 18", "18 a 20", "20 a 22"
            ];
            return turnos.indexOf(a.turno) - turnos.indexOf(b.turno);
        });
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
        tbody.innerHTML = '<tr><td colspan="7">Error cargando reservas</td></tr>';
    }
}); 