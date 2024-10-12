const express = require('express');
const router = express.Router();
const NgData = require('../lib/report/ng_data');

router.get('/', NgData.get);
router.post('/operator', NgData.getOperator);
router.get('/chartData', NgData.chartData);
router.get('/tableData', NgData.tableData);
router.post('/', NgData.create);
router.put('/', NgData.update);
router.delete('/:id', NgData.delete);

module.exports = router;