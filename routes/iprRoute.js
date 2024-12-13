const express = require('express');
const router = express.Router();
const IPR = require('../lib/report/ipr');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /ipr:
 *   get:
 *     tags:
 *       - IPR
 *     summary: Get IPR information
 *     description: Retrieves information related to IPR process
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, IPR.get);
router.post('/pic', IPR.getOperator);
router.get('/chartData', authMiddleware, IPR.chartData);
router.post('/', IPR.create);
router.put('/', IPR.update);
router.delete('/:_id', IPR.delete);
router.get('/exportExcel', authMiddleware, IPR.exportToExcel);

module.exports = router;