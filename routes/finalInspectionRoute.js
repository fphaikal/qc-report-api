const express = require('express');
const router = express.Router();
const FinalInspection = require('../lib/report/finalInspection');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve all final inspections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of final inspections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', authMiddleware, FinalInspection.get);

/**
 * @swagger
 * /operator:
 *   post:
 *     summary: Retrieve operator details
 *     responses:
 *       200:
 *         description: Operator details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/operator', FinalInspection.getOperator);

/**
 * @swagger
 * /chartData:
 *   get:
 *     summary: Retrieve chart data for final inspections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/chartData', authMiddleware, FinalInspection.chartData);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new final inspection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Final inspection created successfully
 */
router.post('/', FinalInspection.create);

/**
 * @swagger
 * /:
 *   put:
 *     summary: Update an existing final inspection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Final inspection updated successfully
 */
router.put('/', FinalInspection.update);

/**
 * @swagger
 * /{_id}:
 *   delete:
 *     summary: Delete a final inspection by ID
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Final inspection deleted successfully
 */
router.delete('/:_id', FinalInspection.delete);

module.exports = router;
