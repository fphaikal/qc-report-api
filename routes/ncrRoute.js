const express = require('express');
const router = express.Router();
const NCR = require('../lib/report/ncr');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, NCR.get);
router.post('/pic', NCR.getOperator);
router.get('/chartData', authMiddleware, NCR.chartData);
router.post('/', NCR.create);
router.put('/', NCR.update);
router.delete('/:id', NCR.delete);

module.exports = router;