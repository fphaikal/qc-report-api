const FinalInspection = require("../../models/FinalInspectionModel");
const { differenceInMinutes } = require("date-fns");
const ExcelJS = require("exceljs");

const FinalInspectionController = {
  get: async (req, res) => {
    const { date } = req.query;

    try {
      if (!date) {
        return res.status(400).json({ message: "Please input date" });
      }

      let query = {};
      if (date !== "all") {
        query.created_at = { $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1) };
      }

      const results = await FinalInspection.find(query).sort({ created_at: -1 });
      res.status(200).json({ code: 200, message: "Success", data: results });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOperator: async (req, res) => {
    const { name } = req.body;

    try {
      if (!name) {
        return res.status(400).json({ message: "Please input name" });
      }

      const results = await FinalInspection.find({ operator: name }).sort({ created_at: -1 });
      res.status(200).json({ code: 200, message: "Success", data: results });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  chartData: async (req, res) => {
    const { type } = req.query;

    try {
      if (!type) {
        return res.status(400).json({ message: "Please input type" });
      }

      if (type === "daily") {
        const results = await FinalInspection.find().sort({ created_at: 1 });

        const totals = results.reduce((acc, item) => {
          const date = item.created_at.toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + item.total;
          return acc;
        }, {});

        const totalData = Object.entries(totals).map(([created_at, total]) => ({ created_at, total }));
        res.status(200).json({ code: 200, message: "Success", data: totalData });
      }

      if (type === "operator") {
        const results = await FinalInspection.find().sort({ created_at: 1 });


        const operatorGroups = results.reduce((acc, item) => {
          acc[item.operator] = acc[item.operator] || [];
          acc[item.operator].push(item);
          return acc;
        }, {});

        const operatorAverages = Object.entries(operatorGroups).map(([operator, records]) => {
          const totalPersen = records.reduce((sum, record) => sum + record.persen, 0);
          return { operator, value: Number((totalPersen / records.length).toFixed(2)) };
        });

        res.status(200).json({ code: 200, message: "Success", data: operatorAverages });
      }

      if (type === "namePart") {
        const results = await FinalInspection.find().sort({ created_at: 1 });

        const namePartTotals = results.reduce((acc, item) => {
          if (!acc[item.name_part]) {
            acc[item.name_part] = { name_part: item.name_part, target: 0, actual: 0 };
          }
          acc[item.name_part].target += item.target;
          acc[item.name_part].actual += item.total;
          return acc;
        }, {});

        res.status(200).json({ code: 200, message: "Success", data: Object.values(namePartTotals) });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    const { name_part, process, operator, target, start, end, total, ok, ng, type_ng, keterangan } = req.body;

    try {
      if (!name_part || !process || !operator || !target || !start || !end || !total) {
        return res.status(400).json({ message: "All required fields must be filled" });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      const menit = differenceInMinutes(endDate, startDate);
      const persen = Math.round((total / ((target / 480) * menit)) * 100);
      const totalInspection = Number(total) + Number(ng || 0);

      const newInspection = new FinalInspection({
        name_part,
        process,
        operator,
        target,
        start,
        end,
        total: totalInspection,
        persen,
        ok,
        ng,
        type_ng,
        keterangan,
      });

      await newInspection.save();
      res.status(201).json({ code: 201, message: "Success create final inspection" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { _id, name_part, process, operator, target, start, end, total, ok, ng, type_ng, keterangan, created_at } = req.body;

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const menit = differenceInMinutes(endDate, startDate);
      const persen = Math.round((total / ((target / 480) * menit)) * 100);
      const totalInspection = Number(total) + Number(ng || 0);

      const updateData = {
        name_part,
        process,
        operator,
        target,
        start,
        end,
        total: totalInspection,
        persen,
        ok,
        ng,
        keterangan,
        type_ng,
      };

      if (created_at) updateData.created_at = created_at;

      await FinalInspection.findByIdAndUpdate(_id, updateData);
      res.status(200).json({ code: 200, message: "Success update final inspection" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { _id } = req.params;
      await FinalInspection.findByIdAndDelete(_id);
      res.status(200).json({ code: 200, message: "Success delete final inspection" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  exportToExcel: async (req, res) => {
    const { date } = req.query;
  
    try {
      let query = {};
      if (date && date !== "all") {
        query.created_at = { 
          $gte: new Date(date), 
          $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) 
        };
      }
  
      // Ambil data dari database
      const results = await FinalInspection.find(query).sort({ created_at: 1 });
  
      if (!results.length) {
        return res.status(404).json({ code: 404, message: "No data found for export" });
      }
  
      // Siapkan data untuk Excel
      const data = results.map((item) => ({
        Name_Part: item.name_part,
        Process: item.process,
        Operator: item.operator,
        Target: item.target,
        Start: item.start,
        End: item.end,
        Total: item.total,
        OK: item.ok,
        NG: item.ng,
        Type_NG: item.type_ng,
        Keterangan: item.keterangan,
        Created_At: item.created_at,
      }));
  
      // Membuat workbook dan worksheet dengan ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Final Inspection Data');
  
      // Menambahkan header (nama kolom) ke worksheet
      worksheet.columns = [
        { header: 'Name Part', key: 'Name_Part', width: 30 },
        { header: 'Process', key: 'Process', width: 20 },
        { header: 'Operator', key: 'Operator', width: 20 },
        { header: 'Target', key: 'Target', width: 15 },
        { header: 'Start', key: 'Start', width: 20 },
        { header: 'End', key: 'End', width: 20 },
        { header: 'Total', key: 'Total', width: 10 },
        { header: 'OK', key: 'OK', width: 10 },
        { header: 'NG', key: 'NG', width: 10 },
        { header: 'Type NG', key: 'Type_NG', width: 20 },
        { header: 'Keterangan', key: 'Keterangan', width: 30 },
        { header: 'Created At', key: 'Created_At', width: 20 },
      ];
  
      // Menambahkan data ke worksheet
      worksheet.addRows(data);
  
      // Generate buffer dari workbook Excel
      const excelBuffer = await workbook.xlsx.writeBuffer();
  
      // Set headers untuk response file Excel
      res.setHeader("Content-Disposition", "attachment; filename=FinalInspectionData.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
      // Kirim buffer Excel ke client
      res.send(excelBuffer);
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = FinalInspectionController;
