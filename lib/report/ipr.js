const IPRModel = require("../../models/IPRModel"); // Import your IPR Mongoose model
const ExcelJS = require("exceljs");

const IPR = {
  get: async (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please input date" });
    }

    try {
      let result;
      if (date === "all") {
        result = await IPRModel.find().sort({ info_date: 1 }); // Sort by info_date ascending
      } else {
        result = await IPRModel.find({ info_date: date }).sort({ info_date: -1 }); // Sort by info_date descending
      }

      res.status(200).json({ code: 200, message: "Success", data: result });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  getOperator: async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please input name" });
    }

    try {
      const result = await IPRModel.find({ pic: name }).sort({ info_date: -1 });
      res.status(200).json({ code: 200, message: "Success", data: result });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  chartData: async (req, res) => {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Please input type" });
    }

    try {
      const result = await IPRModel.find().sort({ inspection_date: 1 });
      const totals = {};

      result.forEach((item) => {
        const date = new Date(item.inspection_date).toISOString().split("T")[0];
        if (!totals[date]) {
          totals[date] = 0;
        }
        totals[date] += item.total;
      });

      const totalData = Object.entries(totals).map(([inspection_date, total]) => ({
        inspection_date,
        total,
      }));

      res.status(200).json({ code: 200, message: "Success", data: totalData });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish } = req.body;

      // Validate required fields
      const requiredFields = [
        { field: info_date, message: "Info date is required" },
        { field: department_section, message: "Dept/Section is required" },
        { field: problem, message: "Problem is required" },
        { field: source, message: "Source is required" },
        { field: item, message: "Item is required" },
        { field: customer, message: "Customer is required" },
        { field: description, message: "Description is required" },
        { field: cause, message: "Cause is required" },
        { field: countermeasure, message: "Countermeasure is required" },
        { field: form_type, message: "Form type is required" },
        { field: pic, message: "PIC is required" },
        { field: start_date, message: "Start Date is required" },
        { field: progress, message: "Progress is required" },
        { field: target_due, message: "Target due is required" },
      ];

      for (const { field, message } of requiredFields) {
        if (!field) {
          return res.status(400).json({ code: 400, message });
        }
      }

      const newIPR = new IPRModel({
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

      await newIPR.save();
      res.status(201).json({ code: 201, message: "Success create ipr" });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  update: async (req, res) => {
    try {
      const { info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish, _id } = req.body;

      const updatedIPR = await IPRModel.findByIdAndUpdate(_id, {
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
      }, { new: true });

      if (!updatedIPR) {
        return res.status(404).json({ message: "IPR not found" });
      }

      res.status(200).json({ code: 200, message: "Success update final inspection" });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  delete: async (req, res) => {
    try {
      const { _id } = req.params;

      const deletedIPR = await IPRModel.findByIdAndDelete(_id);
      if (!deletedIPR) {
        return res.status(404).json({ message: "IPR not found" });
      }

      res.status(200).json({ code: 200, message: "Success delete final inspection" });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  exportToExcel : async (req, res) => {
  
    try {
      const result = await IPRModel.find().sort({ info_date: 1 });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("IPR");

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

      const iprs = await IPRModel.find();
      iprs.forEach(ipr => {
        worksheet.addRow(ipr);
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=" + "ipr.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

};

module.exports = IPR;
