document.addEventListener('DOMContentLoaded', () => {
    const reservaForm = document.getElementById('reservaForm');
    const mensaje = document.getElementById('mensaje');
    const usuario = JSON.parse(localStorage.getItem('usuarioReserva'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
    reservaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const laboratorio = reservaForm.laboratorio.value;
        const fecha = reservaForm.fecha.value;
        const hora = reservaForm.hora.value;
        // Verificar disponibilidad antes de enviar
        try {
            const res = await fetch('/api/reservas');
            const reservas = await res.json();
            const ocupado = reservas.some(r => r.laboratorio === laboratorio && r.fecha === fecha && r.hora === hora);
            if (ocupado) {
                mensaje.innerHTML = '<span style="color:red">El laboratorio ya está reservado para ese horario.</span>';
                return;
            }
        } catch (err) {
            mensaje.innerHTML = '<span style="color:red">No se pudo verificar la disponibilidad.</span>';
            return;
        }
        const reserva = { ...usuario, laboratorio, fecha, hora };
        try {
            const res = await fetch('/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reserva)
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = 'home.html?reserva=ok';
            } else {
                mensaje.innerHTML = '<span style="color:red">' + (data.error || 'Error al reservar') + '</span>';
            }
        } catch (err) {
            mensaje.innerHTML = '<span style="color:red">Error de conexión</span>';
        }
    });
}); 