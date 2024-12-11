const express = require('express');
const router = express.Router();
const Announcement = require('../lib/data/announcement');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, Announcement.get);
router.post('/', Announcement.create);
router.put('/', Announcement.update);
router.delete('/:_id', Announcement.delete);

module.exports = router;