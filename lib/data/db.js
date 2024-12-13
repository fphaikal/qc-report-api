const mongoose = require('mongoose');

const DBInfo = {
  get: async (req, res) => {
    const { type, doc } = req.query;

    if (type === 'all') {
      try {
        const dbInfo = await mongoose.connection.db.stats();
        res.status(200).json(dbInfo);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }

    if (type === 'collections') {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        res.status(200).json(collections);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }

  }
}

module.exports = DBInfo;