const db = require("../db");
const { differenceInMinutes } = require("date-fns");

const FinalInspection = {
  get: (req, res) => {
    const sql = `SELECT * FROM final_inspection ORDER BY inspection_date DESC`;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      const groupedData = result.reduce((acc, item) => {
        const date = new Date(item.inspection_date).toISOString().split("T")[0];

        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      res.status(200).json({ code: 200, message: "Success", data: groupedData });
    });
  },

  create: async (req, res) => {
    try {
      const {
        name_part,
        process,
        operator,
        target,
        start,
        end,
        total,
        ok,
        ng,
        type_ng,
      } = req.body;

      if (!name_part) {
        return res
          .status(400)
          .json({ code: 400, message: "Name part are required" });
      }

      if (!process) {
        return res
          .status(400)
          .json({ code: 400, message: "Process are required" });
      }

      if (!operator) {
        return res
          .status(400)
          .json({ code: 400, message: "Operator are required" });
      }

      if (!target) {
        return res
          .status(400)
          .json({ code: 400, message: "Target are required" });
      }

      if (!start) {
        return res
          .status(400)
          .json({ code: 400, message: "Start are required" });
      }

      if (!end) {
        return res.status(400).json({ code: 400, message: "End are required" });
      }

      if (!total) {
        return res
          .status(400)
          .json({ code: 400, message: "Total are required" });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      const menit = differenceInMinutes(endDate, startDate);

      const persen = Math.round((total / ((target / 480) * menit)) * 100);

      const sql = `INSERT INTO final_inspection (name_part, process, operator, target, start, end, total, persen, ok, ng, type_ng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [
          name_part,
          process,
          operator,
          target,
          start,
          end,
          total,
          persen,
          ok,
          ng,
          type_ng,
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }

          res
            .status(201)
            .json({ code: 201, message: "Success create final inspection" });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error", error });
    }
  },

  update: (req, res) => {
    try {
      const {
        id,
        name_part,
        process,
        operator,
        target,
        start,
        end,
        total,
        ok,
        ng,
        jenis_ng,
      } = req.body;

      const startDate = new Date(start);
      const endDate = new Date(end);
      const menit = differenceInMinutes(endDate, startDate);

      const persen = Math.round((total / ((target / 480) * menit)) * 100);

      const sql = `UPDATE final_inspection SET name_part = ?, process = ?, operator = ?, tagert = ?, start = ?, end = ?, total = ?, ok = ?, ng = ?, jenis_ng = ?, inspection_date = ? WHERE id = ?`;

      db.query(
        sql,
        [
          id,
          name_part,
          process,
          operator,
          target,
          start,
          end,
          total,
          persen,
          ok,
          ng,
          jenis_ng,
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }

          res
            .status(200)
            .json({ code: 200, message: "Success update final inspection" });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  delete: (req, res) => {
    try {
      const { id } = req.params;
      const sql = `DELETE FROM final_inspection WHERE id = ?`;

      db.query(sql, [id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res
          .status(200)
          .json({ code: 200, message: "Success delete final inspection" });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },
};

module.exports = FinalInspection;
