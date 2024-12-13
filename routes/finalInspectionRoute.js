const express = require('express');
const router = express.Router();
const FinalInspection = require('../lib/report/finalInspection');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Final Inspection
 *     summary: Retrieve final inspection records by date
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Date in ISO format or 'all' to retrieve all records
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Missing or invalid date
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, FinalInspection.get);

/**
 * @swagger
 * /operator:
 *   post:
 *     tags:
 *       - Final Inspection
 *     summary: Retrieve final inspection records by operator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the operator
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Missing operator name
 *       500:
 *         description: Server error
 */
router.post('/operator', FinalInspection.getOperator);

/**
 * @swagger
 * /chartData:
 *   get:
 *     tags:
 *       - Final Inspection
 *     summary: Retrieve chart data for final inspections
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of data ('daily', 'operator', 'namePart')
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Missing data type
 *       500:
 *         description: Server error
 */
router.get('/chartData', authMiddleware, FinalInspection.chartData);

/**
 * @swagger
 * /:
 *   post:
 *     tags:
 *       - Final Inspection
 *     summary: Create a new final inspection record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name_part:
 *                 type: string
 *               process:
 *                 type: string
 *               operator:
 *                 type: string
 *               target:
 *                 type: number
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               total:
 *                 type: number
 *               ok:
 *                 type: number
 *               ng:
 *                 type: number
 *               type_ng:
 *                 type: string
 *               keterangan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', FinalInspection.create);

/**
 * @swagger
 * /:
 *   put:
 *     tags:
 *       - Final Inspection
 *     summary: Update a final inspection record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name_part:
 *                 type: string
 *               process:
 *                 type: string
 *               operator:
 *                 type: string
 *               target:
 *                 type: number
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               total:
 *                 type: number
 *               ok:
 *                 type: number
 *               ng:
 *                 type: number
 *               type_ng:
 *                 type: string
 *               keterangan:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       500:
 *         description: Server error
 */
router.put('/', FinalInspection.update);

/**
 * @swagger
 * /{_id}:
 *   delete:
 *     tags:
 *       - Final Inspection
 *     summary: Delete a final inspection by ID
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/:_id', FinalInspection.delete);

/**
 * @swagger
 * /exportToExcel:
 *   get:
 *     tags:
 *       - Final Inspection
 *     summary: Export final inspection data to Excel
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Excel file generated successfully
 *       404:
 *         description: No data found for export
 *       500:
 *         description: Server error
 */
router.get('/exportExcel', authMiddleware, FinalInspection.exportToExcel);

module.exports = router;
