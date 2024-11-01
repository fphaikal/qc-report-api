const NCRModel = require("../../models/NCRModel"); // Import your NCR Mongoose model

const NCR = {
  get: async (req, res) => {
    const { date } = req.query;

    try {
      let result;
      if (!date) {
        return res.status(400).json({ message: "Please input date" });
      }

      if (date === "all") {
        result = await NCRModel.find().sort({ info_date: 1 });
      } else {
        result = await NCRModel.find({ info_date: { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) } }).sort({ info_date: -1 });
      }

      res.status(200).json({ code: 200, message: "Success", data: result });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOperator: async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please input name" });
    }

    try {
      const result = await NCRModel.find({ pic: name }).sort({ info_date: -1 });
      res.status(200).json({ code: 200, message: "Success", data: result });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  chartData: async (req, res) => {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Please input type" });
    }

    try {
      const result = await NCRModel.find().sort({ info_date: 1 });
      const totals = {};

      result.forEach((item) => {
        const date = item.info_date.toISOString().split("T")[0];
        if (!totals[date]) {
          totals[date] = 0;
        }
        totals[date] += item.total; // Adjust as necessary based on your schema
      });

      const totalData = Object.entries(totals).map(([info_date, total]) => ({ info_date, total }));
      res.status(200).json({ code: 200, message: "Success", data: totalData });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish } = req.body;

      const requiredFields = [
        { field: info_date, name: "Info date" },
        { field: department_section, name: "Dept/Section" },
        { field: problem, name: "Problem" },
        { field: source, name: "Source" },
        { field: item, name: "Item" },
        { field: customer, name: "Customer" },
        { field: description, name: "Description" },
        { field: cause, name: "Cause" },
        { field: countermeasure, name: "Countermeasure" },
        { field: form_type, name: "Form type" },
        { field: pic, name: "PIC" },
        { field: start_date, name: "Start Date" },
        { field: progress, name: "Progress" },
        { field: target_due, name: "Target due" },
        { field: actual_finish, name: "Actual finish" },
      ];

      for (const { field, name } of requiredFields) {
        if (!field) {
          return res.status(400).json({ code: 400, message: `${name} are required` });
        }
      }

      const ncr = new NCRModel({
        info_date,
        department_section,
        problem,
        source,
        item,
        customer,
        description,
        cause,
        countermeasure,
        form_type,
        pic,
        start_date,
        progress,
        target_due,
        actual_finish,
      });

      await ncr.save();
      res.status(201).json({ code: 201, message: "Success create NCR" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id, ...updateFields } = req.body; // Use spread operator to extract id

      const ncr = await NCRModel.findByIdAndUpdate(id, updateFields, { new: true });
      if (!ncr) {
        return res.status(404).json({ message: "NCR not found" });
      }

      res.status(200).json({ code: 200, message: "Success update final inspection", data: ncr });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await NCRModel.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ message: "NCR not found" });
      }

      res.status(200).json({ code: 200, message: "Success delete final inspection" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};

module.exports = NCR;
