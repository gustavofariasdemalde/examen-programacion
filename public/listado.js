document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.querySelector('#tablaReservas tbody');
    try {
        const res = await fetch('/api/reservas/futuras');
        const reservas = await res.json();
        tbody.innerHTML = reservas.map(r => `
            <tr>
                <td>${r.tipo}</td>
                <td>${r.nombre}</td>
                <td>${r.dni}</td>
                <td>${r.correo}</td>
                <td>${r.laboratorio}</td>
                <td>${r.fecha}</td>
                <td>${r.hora}</td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7">Error cargando reservas</td></tr>';
    }
}); 