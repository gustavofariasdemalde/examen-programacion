console.log('App de reservas cargada'); // muestra el mensaje en la consola del navegador sirve de diagnostico

document.addEventListener('DOMContentLoaded', () => {// espera que esté completamente cargada antes de ejecutar el codigo
    const loginForm = document.getElementById('loginForm');// busca el formulario con ID loginForm
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) { //escuha el evento del formulario
            e.preventDefault();
            const tipo = loginForm.tipo.value;// obtiene el valor del campo tipo
            const nombre = loginForm.nombre.value;
            const dni = loginForm.dni.value;
            const correo = loginForm.correo.value;
            // Validar usuario en backend
            try {
                const res = await fetch(`/api/usuarios/${dni}`);// hace uan petición  a la api
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