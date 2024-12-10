const ProductionModel = require("../../models/ProductionModel"); // pastikan model sesuai dengan nama file dan struktur Anda

const Parts = {
  get: async (req, res) => {
    try {
      const parts = await ProductionModel.find().sort({ customer: 1 }); // 1 untuk ASC, -1 untuk DESC
      res.status(200).json({ code: 200, message: "Success", data: parts });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  create: async (req, res) => {
    try {
      const { part, customer } = req.body;

      if (!part || !customer) {
        return res.status(400).json({ code: 400, message: "Part name and customer are required" });
      }

      const newPart = new ProductionModel({ part, customer });
      await newPart.save();

      res.status(201).json({ code: 201, message: "Success create part" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  update: async (req, res) => {
    try {
      const { part, customer, _id } = req.body;

      const updatedPart = await ProductionModel.findByIdAndUpdate(
        _id,
        { part, customer },
        { new: true } // Mengembalikan dokumen yang telah diperbarui
      );

      if (!updatedPart) {
        return res.status(404).json({ code: 404, message: "Part not found" });
      }

      res.status(200).json({ code: 200, message: "Success update part" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  delete: async (req, res) => {
    try {
      const { _id } = req.params;

      const deletedPart = await ProductionModel.findByIdAndDelete(_id);

      if (!deletedPart) {
        return res.status(404).json({ code: 404, message: "Part not found" });
      }

      res.status(200).json({ code: 200, message: "Success delete part" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

module.exports = Parts;
