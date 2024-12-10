const express = require('express');
const router = express.Router();
const Production = require('../lib/data/productions');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, Production.get);
router.post('/', Production.create);
router.put('/', Production.update);
router.delete('/:_id', Production.delete);

module.exports = router;