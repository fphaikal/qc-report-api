const express = require('express');
const router = express.Router();
const NgData = require('../lib/report/ng_data');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, NgData.get);
router.post('/operator', NgData.getOperator);
router.get('/chartData', authMiddleware, NgData.chartData);
router.get('/tableData', authMiddleware, NgData.tableData);
router.get('/exportExcel', authMiddleware, NgData.exportExcel);
router.post('/', NgData.create);
router.put('/', NgData.update);
router.delete('/:id', NgData.delete);

module.exports = router;