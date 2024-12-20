const AnnouncementModel = require("../../models/AnnouncementModel");

const Announcement = {
  get: async (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please input date" });
    }

    if(date === "latest") {
      const result = await AnnouncementModel.find().sort({ created_at: -1 }).limit(1);
      return res.status(200).json({ code: 200, message: "Success", data: result });
    } 

    const result = await AnnouncementModel.find().sort({ created_at: -1 });
    res.status(200).json({ code: 200, message: "Success", data: result });
  },
  create: async (req, res) => {
    try {
      const { title, content, preview, author } = req.body;

      if(!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      if(!content) {
        return res.status(400).json({ message: "content is required" });
      }

      if(!author) {
        return res.status(400).json({ message: "Author is required" });
      }

      const announcement = new AnnouncementModel({ title, content, preview, author });
      await announcement.save();
      res.status(201).json(announcement);
    } catch (err) {
      res.status(500).json({ error: err });
      console.log(err);
    }
  },
  update: async (req, res) => {
    try {
      const { _id, title, content, preview, date } = req.body;

      if(!_id) {
        return res.status(400).json({ message: "id is required" });
      }

      const updateData = {
        title,
        content, 
        preview,
        date
      };

      const updatedPart = await AnnouncementModel.findByIdAndUpdate(
        _id,
        updateData,
        { new: true } // Mengembalikan dokumen yang telah diperbarui
      );

      if (!updatedPart) {
        return res.status(404).json({ code: 404, message: "Data not found" });
      }
      res.status(200).json({ message: "Success update announcement" })
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });

    }
  },

  delete: async (req, res) => {
    try {
      const { _id } = req.params;

      if(!_id) {
        return res.status(400).json({ message: "id is required" });
      }

      await AnnouncementModel.findByIdAndDelete(_id);
      res.status(200).json({ message: "Success delete announcement" });
    } catch (err) {
      res.status(500).json({ error: err });
    } 
  }
};

module.exports = Announcement;