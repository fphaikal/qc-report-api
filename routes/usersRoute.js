const express = require('express');
const router = express.Router();
const Users = require('../lib/data/users');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, Users.get);
router.post('/', Users.create);
router.put('/', Users.update);
router.delete('/:_id', Users.delete);

module.exports = router;