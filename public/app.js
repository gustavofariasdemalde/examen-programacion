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

// Lista de usuarios permitidos (puedes editar o ampliar)
const usuariosPermitidos = [
    { tipo: "alumno", nombre: "Juan", dni: "12345678", correo: "juan@mail.com" },
    { tipo: "profesor", nombre: "Ana", dni: "87654321", correo: "ana@mail.com" }
]; 