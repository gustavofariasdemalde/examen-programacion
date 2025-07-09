// server.js - Servidor principal de la aplicación
// Este archivo gestiona las rutas, la lógica de reservas y usuarios, y sirve los archivos estáticos
const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = 'usuarios.json';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Redirección de la raíz a la página principal (index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Servimos la página principal
});

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

app.post('/api/reservas', (req, res) => {
    const nuevaReserva = req.body;
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
                    text: `Hola ${nuevaReserva.nombre},\n\nTu reserva para el ${nuevaReserva.laboratorio} el día ${nuevaReserva.fecha} a las ${nuevaReserva.hora} ha sido confirmada.\n\nGracias.`
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
        fs.writeFile(USERS_FILE, JSON.stringify(usuarios, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error guardando usuario' });
            res.status(201).json(nuevoUsuario);
        });
    });
});

app.get('/api/usuarios/:dni', (req, res) => {
    const dni = req.params.dni;
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo usuarios' });
        const usuarios = JSON.parse(data);
        const usuario = usuarios.find(u => u.dni === dni);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    });
});

app.delete('/api/reservas', (req, res) => {
    const { laboratorio, fecha, hora } = req.body;
    fs.readFile('reservas.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo reservas' });
        let reservas = JSON.parse(data);
        const originalLength = reservas.length;
        reservas = reservas.filter(r => !(r.laboratorio === laboratorio && r.fecha === fecha && r.hora === hora));
        if (reservas.length === originalLength) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        fs.writeFile('reservas.json', JSON.stringify(reservas, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error eliminando reserva' });
            res.json({ ok: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
}); 