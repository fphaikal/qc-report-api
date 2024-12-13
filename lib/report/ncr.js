const NCRModel = require("../../models/NCRModel"); // Import your NCR Mongoose model
const ExcelJS = require("exceljs");
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

    if (type === "customer") {
      try {
        // Mengambil semua dokumen dari koleksi ncr yang diurutkan berdasarkan tanggal info_date
        const result = await NCRModel.find({}).sort({ info_date: 1 });
    
        // Menghitung jumlah keluhan per customer
        const customerComplaints = result.reduce((acc, item) => {
          if (!acc[item.customer]) {
            acc[item.customer] = 0;
          }
          acc[item.customer] += 1; // Tambahkan keluhan per customer
          return acc;
        }, {});
    
        // Ubah hasil ke dalam format yang diinginkan
        const output = Object.entries(customerComplaints).map(([customer, value]) => ({
          customer,
          value
        }));
    
        res.status(200).json({
          code: 200,
          message: "Success",
          data: output
        });
    
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
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
      console.error(error);
    }
  },

  update: async (req, res) => {
    try {
      const { _id, ...updateFields } = req.body; // Use spread operator to extract _id

      const ncr = await NCRModel.findByIdAndUpdate(_id, updateFields, { new: true });
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
      const { _id } = req.params;
      const result = await NCRModel.findByIdAndDelete(_id);
      if (!result) {
        return res.status(404).json({ message: "NCR not found" });
      }

      res.status(200).json({ code: 200, message: "Success delete final inspection" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  exportToExcel: async (req, res) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("NCR");

      worksheet.columns = [
        { header: "Info Date", key: "info_date", width: 20 },
        { header: "Dept/Section", key: "department_section", width: 20 },
        { header: "Problem", key: "problem", width: 20 },
        { header: "Source", key: "source", width: 20 },
        { header: "Item", key: "item", width: 20 },
        { header: "Customer", key: "customer", width: 20 },
        { header: "Description", key: "description", width: 20 },
        { header: "Cause", key: "cause", width: 20 },
        { header: "Countermeasure", key: "countermeasure", width: 20 },
        { header: "Form Type", key: "form_type", width: 20 },
        { header: "PIC", key: "pic", width: 20 },
        { header: "Start Date", key: "start_date", width: 20 },
        { header: "Progress", key: "progress", width: 20 },
        { header: "Target Due", key: "target_due", width: 20 },
        { header: "Actual Finish", key: "actual_finish", width: 20 },
      ];

      const ncrs = await NCRModel.find();
      ncrs.forEach(ncr => {
        worksheet.addRow(ncr);
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=" + "ncr.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

};

module.exports = NCR;
