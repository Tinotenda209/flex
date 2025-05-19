const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database connection
const db = new sqlite3.Database('healthcare_appointment_system.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the healthcare_appointment_system database.');
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('newAppointment', (data) => {
        io.emit('appointmentNotification', {
            message: 'New appointment scheduled',
            data: data
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Analytics endpoints
app.get('/api/analytics/appointments', (req, res) => {
    const sql = `
        SELECT 
            strftime('%Y-%m', date) as month,
            COUNT(*) as count
        FROM appointments
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Group Project', 'index.html'));
});

// PROVIDERS TABLE
const getProviders = (req, res) => {
    const sql = `SELECT * FROM providers`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
};

app.get('/api/providers', getProviders);

const getApprovedAppointments = (req, res) => {
    const email = req.query.email;

    const sql = `SELECT * FROM approved_appointments WHERE email = ?`;

    db.all(sql, [email], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

app.get('/api/approved_appointments/fetch', getApprovedAppointments);

const getAppointments = (req, res) => {
    db.all('SELECT * FROM appointments', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
};

const getAApprovedAppointments = (req, res) => {
    db.all('SELECT * FROM approved_appointments', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
};

const getCancelledAppointments = (req, res) => {
    db.all('SELECT * FROM Cancelled_appointments', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
};

const getPatients = (req, res) => {
    db.all('SELECT * FROM patients', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
};

const getStaff = (req, res) => {
    db.all('SELECT * FROM staff', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
};

const getCancelledAAppointments = (req, res) => {
    db.all('SELECT * FROM Cancelled_appointments', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
};

app.get('/api/appointments', getAppointments);
app.get('/api/approved_appointments', getAApprovedAppointments);
app.get('/api/cancelled-appointments', getCancelledAppointments);
app.get('/api/patients', getPatients);
app.get('/api/staff', getStaff);
app.get('/api/cancelled_appointments', getCancelledAAppointments);

const deleteProvider = (req, res) => {
    const providerId = req.params.id;

    db.run('DELETE FROM providers WHERE id = ?', [providerId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        res.json({ message: 'Provider deleted successfully.' });
    });
};

const patientsProvider = (req, res) => {
    const patientId = req.params.id;

    db.run('DELETE FROM patients WHERE id = ?', [patientsId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Patients not found' });
        }
        res.json({ message: 'Patients deleted successfully.' });
    });
};

const staffProvider = (req, res) => {
    const staffId = req.params.id;

    db.run('DELETE FROM staff WHERE id = ?', [staffId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'staff not found' });
        }
        res.json({ message: 'staff deleted successfully.' });
    });
};

const appointmentProvider = (req, res) => {
    const appointmentsId = req.params.id;

    db.run('DELETE FROM appointments WHERE id = ?', [appointmentsId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'appointments not found' });
        }
        res.json({ message: 'appointments deleted successfully.' });
    });
};

const approvedProvider = (req, res) => {
    const approved_appointmentsId = req.params.id;

    db.run('DELETE FROM approved_appointments WHERE id = ?', [approved_appointmentsId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'approved_appointments not found' });
        }
        res.json({ message: 'approved_appointments deleted successfully.' });
    });
};

app.delete('/api/providers/:id', deleteProvider);
app.delete('/api/patients/:id', patientsProvider);
app.delete('/api/staff/:id', staffProvider);
app.delete('/api/appointments/:id', appointmentProvider);
app.delete('/api/approved_appointments/:id', approvedProvider);

const loginPatient = (req, res) => {
    const { Email, Password } = req.body;
    db.get('SELECT * FROM patients WHERE email = ?', [Email], (err, row) => {
        if (err) return res.status(500).send('Error querying the database.');
        if (!row) return res.status(401).send('User not found. Please register your details.');

        bcrypt.compare(Password, row.password, (err, result) => {
            if (err || !result) return res.status(401).send('Incorrect password.');
            const { name, surname, email, phone } = row;
            res.json({ name, surname, email, phone });
        });
    });
};

const registerPatient = (req, res) => {
    const { Email, Password, Name, Surname, Phone } = req.body;
    db.get('SELECT * FROM patients WHERE email = ?', [Email], (err, row) => {
        if (err) return res.status(500).send('Error querying the database.');
        if (row) return res.status(409).send('Email already taken.');

        bcrypt.hash(Password, 10, (err, hash) => {
            if (err) return res.status(500).send('Error hashing password.');
            db.run('INSERT INTO patients (email, password, name, surname, phone) VALUES (?, ?, ?, ?, ?)', 
                [Email, hash, Name, Surname, Phone], function(err) {
                    if (err) return res.status(500).send('Error adding user to the database.');
                    res.status(201).send('User registered successfully.');
                });
        });
    });
};

const loginstaff = (req, res) => {
    const { Email, Password } = req.body;
    db.get('SELECT * FROM staff WHERE email = ?', [Email], (err, row) => {
        if (err) return res.status(500).send('Error querying the database.');
        if (!row) return res.status(401).send('User not found. Please register your details.');

        bcrypt.compare(Password, row.password, (err, result) => {
            if (err || !result) return res.status(401).send('Incorrect password.');
            res.redirect('/staffupdate.html');
        });
    });
};

const addstaff = (req, res) => {
    const { Email, Password, Name, Surname } = req.body;
    db.get('SELECT * FROM staff WHERE email = ?', [Email], (err, row) => {
        if (err) return res.status(500).send('Error querying the database.');
        if (row) return res.status(409).send('Email already taken.');

        bcrypt.hash(Password, 10, (err, hash) => {
            if (err) return res.status(500).send('Error hashing password.');
            db.run('INSERT INTO staff (email, password, name, surname) VALUES (?, ?, ?, ?)', 
                [Email, hash, Name, Surname], function(err) {
                    if (err) return res.status(500).send('Error adding user to the database.');
                    res.status(201).send('User registered successfully.');
                });
        });
    });
};

const CreateAppointment = (req, res) => {
    const { name, surname, email, date } = req.body;
    const sql = `INSERT INTO appointments (name, surname, email, date) VALUES (?, ?, ?, ?)`;
    const params = [name, surname, email, date];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error saving appointment:', err.message);
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Appointment registered!' });
    });
};

const Doctorlogin = (req, res) => {
    const { Email, Password } = req.body;
    db.get('SELECT * FROM providers WHERE email = ?', [Email], (err, row) => {
        if (err) return res.status(500).send('Error querying the database.');
        if (!row) return res.status(401).send('User not found. Please register your details.');

        bcrypt.compare(Password, row.password, (err, result) => {
            if (err || !result) return res.status(401).send('Incorrect password.');
            res.redirect('/providerstable.html');
        });
    });
};

const addprovider = (req, res) => {
    const { Email, Password, Name, Surname, Availability, Speciality } = req.body;
    db.get('SELECT * FROM providers WHERE email = ?', [Email], (err, row) => {
        if (err) return res.status(500).send('Error querying the database.');
        if (row) return res.status(409).send('Email already taken.');

        bcrypt.hash(Password, 10, (err, hash) => {
            if (err) return res.status(500).send('Error hashing password.');
            db.run('INSERT INTO providers (email, password, name, surname, availability , speciality) VALUES (?, ?, ?, ?, ?, ?)', 
                [Email, hash, Name, Surname, Availability , Speciality], function(err) {
                    if (err) return res.status(500).send('Error adding user to the database.');
                    res.status(201).send('User registered successfully.');
                });
        });
    });
};

const registerAppointment = (req, res) => {
    const { name, surname, email, date, time, doctor, status } = req.body;

    db.get('SELECT * FROM approved_appointments WHERE email = ? AND date = ? AND time = ?', [email, date, time], (err, row) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Error querying the database.');
        }
        if (row) {
            return res.status(409).send('Appointment already exists at this time.');
        }

        db.run('INSERT INTO approved_appointments (first_name, last_name, email, date, time, assigned_doctor, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [name, surname, email, date, time, doctor, status], function(err) {
                if (err) {
                    console.error('Error adding appointment to the database:', err);
                    return res.status(500).send('Error adding appointment to the database.');
                }
                res.status(201).send('Appointment created successfully.');
            });
    });
};

app.post('/api/patients', loginPatient);
app.post('/api/patients/register', registerPatient);
app.post('/api/staff', loginstaff);
app.post('/api/staff/register', addstaff);
app.post('/api/appointments', CreateAppointment);
app.post('/api/providers', Doctorlogin);
app.post('/api/provider/register', addprovider);
app.post('/api/approved_appointments/register', registerAppointment);

const updateProviderAvailability = (req, res) => {
    const providerId = req.params.id;
    const { availability } = req.body;

    if (availability === undefined) {
        return res.status(400).json({ error: 'Availability is required.' });
    }

    db.run('UPDATE providers SET availability = ? WHERE id = ?', [availability, providerId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update availability' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        res.json({ message: 'Availability updated successfully' });
    });
};

const updatePProviderAvailability = (req, res) => {
    const providerId = req.params.id;
    const { availability } = req.body;

    if (availability === undefined) {
        return res.status(400).json({ error: 'Availability is required.' });
    }

    db.run('UPDATE providers SET availability = ? WHERE id = ?', [availability, providerId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update availability' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        res.json({ message: 'Availability updated successfully' });
    });
};

app.put('/api/providers/:id/availability', updatePProviderAvailability);
app.put('/api/providers/:id/availability', updateProviderAvailability);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});