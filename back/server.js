// server.js

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fadeaway'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

app.post('/api/accounts', (req, res) => {
  const { username, email, password } = req.body;
  const sql = 'INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [username, email, password], (err, result) => {
    if (err) throw err;
    console.log('Account created:', result);
    res.send('Account created successfully');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
