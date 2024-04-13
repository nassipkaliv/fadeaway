const mysql = require('mysql');
const connection = require('../db/connection');

// Create Account
exports.createAccount = (req, res) => {
    const { username, email, password } = req.body;
    const sql = 'INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error('Error creating account:', err);
            return res.status(500).json({ error: 'Error creating account' });
        }
        console.log('Account created:', result);
        res.status(201).json({ message: 'Account created successfully', accountId: result.insertId });
    });
};

// Get Account by ID
exports.getAccountById = (req, res) => {
    const accountId = req.params.id;
    const sql = 'SELECT * FROM accounts WHERE id = ?';
    connection.query(sql, [accountId], (err, result) => {
        if (err) {
            console.error('Error fetching account:', err);
            return res.status(500).json({ error: 'Error fetching account' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.status(200).json(result[0]);
    });
};

// Update Account
exports.updateAccount = (req, res) => {
    const accountId = req.params.id;
    const { username, email, password } = req.body;
    const sql = 'UPDATE accounts SET username = ?, email = ?, password = ? WHERE id = ?';
    connection.query(sql, [username, email, password, accountId], (err, result) => {
        if (err) {
            console.error('Error updating account:', err);
            return res.status(500).json({ error: 'Error updating account' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.status(200).json({ message: 'Account updated successfully' });
    });
};

// Delete Account
exports.deleteAccount = (req, res) => {
    const accountId = req.params.id;
    const sql = 'DELETE FROM accounts WHERE id = ?';
    connection.query(sql, [accountId], (err, result) => {
        if (err) {
            console.error('Error deleting account:', err);
            return res.status(500).json({ error: 'Error deleting account' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.status(200).json({ message: 'Account deleted successfully' });
    });
};