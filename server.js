// server.js - Servidor principal de la aplicación
// Este archivo gestiona las rutas, la lógica de reservas y usuarios, y sirve los archivos estáticos
const express = require('express'); // framework web
const fs = require('fs'); // leeer y escribir archivos
const path = require('path'); //ruta
const nodemailer = require('nodemailer');// correo
const cors = require('cors'); // seguridad para la api
const app = express(); //configuración de app express
const PORT = process.env.PORT || 3000;
const USERS_FILE = 'usuarios.json';
// configuraciones del servidor
app.use(express.json()); //para recibirpaticiones en json
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // peticiones de cualquier lugar

// Redirección de la raíz a la página principal (index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // redirecciona a la página principal
});
// obtener reservas
app.get('/api/reservas', (req, res) => {
    fs.readFile('reservas.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo reservas' });
        res.json(JSON.parse(data));
    });
});

app.get('/api/reservas/futuras', (req, res) => {
    fs.readFile('reservas.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo reservas' });
        const reservas = JSON.parse(data);
        const hoy = new Date();
        const reservasFuturas = reservas.filter(r => {
            const fechaReserva = new Date(r.fecha);
            const diff = (fechaReserva - hoy) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 30;
        });
        // Eliminar el campo dni de cada reserva futura
        const reservasSinDni = reservasFuturas.map(({ dni, ...rest }) => rest);
        res.json(reservasSinDni);
    });
});
// guarda nueva reserva, si esta autorizado lo agrega en reservas.json
app.post('/api/reservas', (req, res) => {//recibe una solicitud POST
    const nuevaReserva = req.body;
    
    // Validar que la fecha no sea superior a 30 días en el futuro
    const fechaReserva = new Date(nuevaReserva.fecha);
    const hoy = new Date();
    const diffDias = (fechaReserva - hoy) / (1000 * 60 * 60 * 24);
    
    if (diffDias < 0) {
        return res.status(400).json({ error: 'No se pueden hacer reservas en fechas pasadas.' });
    }
    
    if (diffDias > 30) {
        return res.status(400).json({ error: 'No se pueden hacer reservas con más de 30 días de anticipación.' });
    }
    
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo usuarios' });
        const usuarios = JSON.parse(data);
        const usuario = usuarios.find(u => u.dni === nuevaReserva.dni);
        if (!usuario) {
            return res.status(403).json({ error: 'ACCESO NO PERMITIDO. Comunicarse con administración de la universidad.' });
        }
        fs.readFile('reservas.json', 'utf8', (err, data) => {
            if (err) return res.status(500).json({ error: 'Error leyendo reservas' });
            const reservas = JSON.parse(data);
            // Validar que no exista ya una reserva para ese laboratorio, fecha y turno
            const ocupado = reservas.some(r => r.laboratorio === nuevaReserva.laboratorio && r.fecha === nuevaReserva.fecha && r.turno === nuevaReserva.turno);
            if (ocupado) {
                return res.status(400).json({ error: 'El laboratorio ya está reservado para ese turno.' });
            }
            reservas.push(nuevaReserva);
            fs.writeFile('reservas.json', JSON.stringify(reservas, null, 2), err => {
                if (err) return res.status(500).json({ error: 'Error guardando reserva' });
                // Enviar correo de confirmación
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'fariasdemaldegustavo@gmail.com',
                        pass: 'cles wvmp plar nept'
                    }
                });
                const mailOptions = {
                    from: 'fariasdemaldegustavo@gmail.com',
                    to: nuevaReserva.correo,
                    subject: 'Confirmación de Reserva de Laboratorio',
                    text: `Hola ${nuevaReserva.nombre}, usted ha realizado la reserva para la materia ${nuevaReserva.materia} en el ${nuevaReserva.laboratorio} el día ${nuevaReserva.fecha} en el turno ${nuevaReserva.turno}.\n\nGracias.`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(201).json({ ...nuevaReserva, aviso: 'Reserva guardada, pero error enviando mail.' });
                    }
                    res.status(201).json(nuevaReserva);
                });
            });
        });
    });
});
//  gurdar nuevo usuario
app.post('/api/usuarios', (req, res) => {
    const nuevoUsuario = req.body;
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        let usuarios = [];
        if (!err && data) usuarios = JSON.parse(data);
        // Validar que el DNI sea único
        if (usuarios.some(u => u.dni === nuevoUsuario.dni)) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        usuarios.push(nuevoUsuario);
        fs.writeFile(USERS_FILE, JSON.stringify(usuarios, null, 2), err => { // stringify convierte el array a srting para guardarlo en el archivo
            if (err) return res.status(500).json({ error: 'Error guardando usuario' });
            res.status(201).json(nuevoUsuario);
        });
    });
});
// buscar usuario por DNI si existe lo devuelve sino muetra error
app.get('/api/usuarios/:dni', (req, res) => {
    const dni = req.params.dni;
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo usuarios' });
        const usuarios = JSON.parse(data);//convierte el archivo en un array
        const usuario = usuarios.find(u => u.dni === dni);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);// devuelve el usuario encontrado
    });
});
// eliminar reserva
app.delete('/api/reservas', (req, res) => {
    const { laboratorio, fecha, turno } = req.body;
    fs.readFile('reservas.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo reservas' });
        let reservas = JSON.parse(data);
        const originalLength = reservas.length;// guarda la longitud del array
        reservas = reservas.filter(r => !(r.laboratorio === laboratorio && r.fecha === fecha && r.turno === turno));
        if (reservas.length === originalLength) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        fs.writeFile('reservas.json', JSON.stringify(reservas, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error eliminando reserva' });
            res.json({ ok: true });// devuelve un objeto con ok true
        });
    });
});
// iniciar el sevidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);// muestra el mensaje en el navegador
}); 