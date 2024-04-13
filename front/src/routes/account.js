const express = require('express');
const router = express.Router();
const {
    createAccount,
    getAccountById,
    updateAccount,
    deleteAccount
} = require('../controllers/accounts');

// Routes for CRUD operations
router.post('/', createAccount);
router.get('/:id', getAccountById);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
