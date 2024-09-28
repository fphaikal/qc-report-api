const express = require('express');
const router = express.Router();
const FinalInspection = require('../lib/report/finalInspection');

router.get('/', FinalInspection.get);
router.post('/', FinalInspection.create);
router.put('/', FinalInspection.update);
router.delete('/:id', FinalInspection.delete);

module.exports = router;