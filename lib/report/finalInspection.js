const FinalInspection = require("../../models/FinalInspectionModel");
const { differenceInMinutes } = require("date-fns");

const FinalInspectionController = {
  get: async (req, res) => {
    const { date } = req.query;

    try {
      if (!date) {
        return res.status(400).json({ message: "Please input date" });
      }

      let query = {};
      if (date !== "all") {
        query.inspection_date = { $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1) };
      }

      const results = await FinalInspection.find(query).sort({ inspection_date: date === "all" ? 1 : -1 });
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

      const results = await FinalInspection.find({ operator: name }).sort({ inspection_date: -1 });
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
        const results = await FinalInspection.find().sort({ inspection_date: 1 });
        const totals = results.reduce((acc, item) => {
          const date = item.inspection_date.toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + item.total;
          return acc;
        }, {});

        const totalData = Object.entries(totals).map(([inspection_date, total]) => ({ inspection_date, total }));
        res.status(200).json({ code: 200, message: "Success", data: totalData });
      }

      if (type === "operator") {
        const results = await FinalInspection.find({
          inspection_date: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) },
        }).sort({ inspection_date: 1 });

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
        const results = await FinalInspection.find({
          inspection_date: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) },
        }).sort({ inspection_date: 1 });

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
      const totalInspection = total + ng;

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
    const { id, name_part, process, operator, target, start, end, total, ok, ng, type_ng, inspection_date } = req.body;

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const menit = differenceInMinutes(endDate, startDate);
      const persen = Math.round((total / ((target / 480) * menit)) * 100);
      const totalInspection = total + ng;

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
        type_ng,
      };

      if (inspection_date) updateData.inspection_date = inspection_date;

      await FinalInspection.findByIdAndUpdate(id, updateData);
      res.status(200).json({ code: 200, message: "Success update final inspection" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await FinalInspection.findByIdAndDelete(id);
      res.status(200).json({ code: 200, message: "Success delete final inspection" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = FinalInspectionController;
