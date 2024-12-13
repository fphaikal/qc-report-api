const express = require('express');
const router = express.Router();
const DB = require('../lib/data/db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', DB.get);

module.exports = router;