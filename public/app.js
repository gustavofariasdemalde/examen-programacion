console.log('App de reservas cargada'); 

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const tipo = loginForm.tipo.value;
            const nombre = loginForm.nombre.value;
            const dni = loginForm.dni.value;
            const correo = loginForm.correo.value;
            // Validar usuario en backend
            try {
                const res = await fetch(`/api/usuarios/${dni}`);
                if (!res.ok) {
                    alert('ACCESO NO PERMITIDO. Comunicarse con administración de la universidad.');
                    return;
                }
                localStorage.setItem('usuarioReserva', JSON.stringify({ tipo, nombre, dni, correo }));
                window.location.href = 'reserva.html';
            } catch (err) {
                alert('Error de conexión');
            }
        });
    }
}); 

