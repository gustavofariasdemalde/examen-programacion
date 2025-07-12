// reserva.js - Lógica de la página de reservas
// Este archivo gestiona el envío del formulario de reserva y la interacción con el backend
document.addEventListener('DOMContentLoaded', () => {//espera que esté cargada la pagina
    const reservaForm = document.getElementById('reservaForm');
    const mensaje = document.getElementById('mensaje');
    const fechaInput = document.getElementById('fecha');
    const usuario = JSON.parse(localStorage.getItem('usuarioReserva'));// obtine el usuario previamente guardado en el localstorage
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
    
    // Establecer límites de fecha (hoy hasta 30 días en el futuro)
    const hoy = new Date();
    const fechaMaxima = new Date();
    fechaMaxima.setDate(hoy.getDate() + 30);
    
    const fechaHoy = hoy.toISOString().split('T')[0];
    const fechaMax = fechaMaxima.toISOString().split('T')[0];
    
    fechaInput.min = fechaHoy;
    fechaInput.max = fechaMax;
    
    reservaForm.addEventListener('submit', async function(e) { // escucha le vento del formulario
        e.preventDefault();
        const laboratorio = reservaForm.laboratorio.value;
        const fecha = reservaForm.fecha.value;
        const hora = reservaForm.hora.value;
        
        // Validar que la fecha no sea superior a 30 días en el futuro
        const fechaSeleccionada = new Date(fecha);
        const hoy = new Date();
        const diffDias = (fechaSeleccionada - hoy) / (1000 * 60 * 60 * 24);
        
        if (diffDias < 0) {
            mensaje.innerHTML = '<span style="color:red">No se pueden hacer reservas en fechas pasadas.</span>';
            return;
        }
        
        if (diffDias > 30) {
            mensaje.innerHTML = '<span style="color:red">No se pueden hacer reservas con más de 30 días de anticipación.</span>';
            return;
        }
        
        // Verificar disponibilidad antes de enviar
        try {
            const res = await fetch('/api/reservas');// hace la peticion a la api
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
                // Si la reserva es exitosa, redirige a la página principal con un mensaje de éxito
                window.location.href = '/?reserva=ok';
            } else {
                mensaje.innerHTML = '<span style="color:red">' + (data.error || 'Error al reservar') + '</span>';
            }
        } catch (err) { // captura el error
            mensaje.innerHTML = '<span style="color:red">Error de conexión</span>';
        }
    });
}); 