const express = require('express');
const router = express.Router();
const Parts = require('../lib/data/parts');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, Parts.get);
router.post('/', Parts.create);
router.put('/', Parts.update);
router.delete('/:_id', Parts.delete);

module.exports = router;