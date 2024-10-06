const express = require('express');
const router = express.Router();
const IPR = require('../lib/report/ipr');

router.get('/', IPR.get);
router.post('/pic', IPR.getOperator);
router.get('/chartData', IPR.chartData);
router.post('/', IPR.create);
router.put('/', IPR.update);
router.delete('/:id', IPR.delete);

module.exports = router;