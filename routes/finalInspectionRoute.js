const express = require('express');
const router = express.Router();
const FinalInspection = require('../lib/report/finalInspection');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware,FinalInspection.get);
router.post('/operator', FinalInspection.getOperator);
router.get('/chartData', authMiddleware, FinalInspection.chartData);
router.post('/', FinalInspection.create);
router.put('/', FinalInspection.update);
router.delete('/:id', FinalInspection.delete);

module.exports = router;