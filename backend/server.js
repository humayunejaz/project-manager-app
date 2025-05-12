const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Register user
app.post('/register', (req, res) => {
  const { first_name, last_name, email, password, address, phone_number, travel_interests, dob } = req.body;

  const query = `
    INSERT INTO customers (first_name, last_name, email, password, address, phone_number, travel_interests, dob)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [first_name, last_name, email, password, address, phone_number, travel_interests, dob], (err) => {
    if (err) {
      console.error('Error registering customer:', err);
      return res.status(500).json({ error: 'Failed to register user' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM customers WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', customer: results[0] });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// Create a new trip
app.post('/create-trip', (req, res) => {
  const { customer_id, start_date, end_date, trip_name, group_members } = req.body;

  const query = `
    INSERT INTO trips (customer_id, start_date, end_date, trip_name)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [customer_id, start_date, end_date, trip_name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create trip' });

    const trip_id = result.insertId;

    if (group_members.length > 0) {
      const inserts = group_members.map((m) => [trip_id, null, m.name, m.email]);

      db.query('INSERT INTO group_members (trip_id, customer_id, name, email) VALUES ?', [inserts], (err2) => {
        if (err2) return res.status(500).json({ error: 'Group insert failed' });

        res.status(201).json({ message: 'Trip and group created' });
      });
    } else {
      res.status(201).json({ message: 'Trip created' });
    }
  });
});

// Get trips with group members
app.get('/trips-with-members/:customer_id', (req, res) => {
  const { customer_id } = req.params;

  const query = `
    SELECT t.*, gm.name AS gm_name, gm.email AS gm_email
    FROM trips t
    LEFT JOIN group_members gm ON t.trip_id = gm.trip_id
    WHERE t.customer_id = ?
    ORDER BY t.start_date DESC
  `;

  db.query(query, [customer_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch trips' });

    const tripsMap = {};
    results.forEach((row) => {
      if (!tripsMap[row.trip_id]) {
        tripsMap[row.trip_id] = {
          trip_id: row.trip_id,
          trip_name: row.trip_name,
          start_date: row.start_date,
          end_date: row.end_date,
          customer_id: row.customer_id,
          group_members: []
        };
      }
      if (row.gm_name && row.gm_email) {
        tripsMap[row.trip_id].group_members.push({ name: row.gm_name, email: row.gm_email });
      }
    });

    res.status(200).json(Object.values(tripsMap));
  });
});

// Update a trip
app.put('/trips/:trip_id', (req, res) => {
  const { trip_id } = req.params;
  let { trip_name, start_date, end_date, group_members } = req.body;

  start_date = start_date.split('T')[0];
  end_date = end_date.split('T')[0];

  const updateQuery = `
    UPDATE trips SET trip_name = ?, start_date = ?, end_date = ?
    WHERE trip_id = ?
  `;

  db.query(updateQuery, [trip_name, start_date, end_date, trip_id], (err) => {
    if (err) {
      console.error('Failed to update trip:', err);
      return res.status(500).json({ error: 'Trip update failed' });
    }

    db.query('DELETE FROM group_members WHERE trip_id = ?', [trip_id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Group delete failed' });

      if (!group_members || group_members.length === 0) {
        return res.status(200).json({ message: 'Trip updated (no group members)' });
      }

      const inserts = group_members.map(m => [trip_id, null, m.name, m.email]);
      db.query('INSERT INTO group_members (trip_id, customer_id, name, email) VALUES ?', [inserts], (err3) => {
        if (err3) return res.status(500).json({ error: 'Group insert failed' });
        res.status(200).json({ message: 'Trip and group updated' });
      });
    });
  });
});

// Delete a trip
app.delete('/trips/:trip_id', (req, res) => {
  const { trip_id } = req.params;

  db.query('DELETE FROM group_members WHERE trip_id = ?', [trip_id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete group members' });

    db.query('DELETE FROM trips WHERE trip_id = ?', [trip_id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to delete trip' });

      res.status(200).json({ message: 'Trip deleted successfully' });
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
