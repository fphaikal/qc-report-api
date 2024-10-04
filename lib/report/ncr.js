const db = require("../db");
const { differenceInMinutes } = require("date-fns");

const NCR = {
  get: (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please input date" });
    }

    if (date === "all") {
      const sql = `SELECT * FROM ncr ORDER BY info_date ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        // const groupedData = result.reduce((acc, item) => {
        //   const date = new Date(item.inspection_date).toISOString().split("T")[0];

        //   if (!acc[date]) {
        //     acc[date] = [];
        //   }
        //   acc[date].push(item);
        //   return acc;
        // }, {});

        res.status(200).json({ code: 200, message: "Success", data: result });
      });
    }

    if (date !== "all") {
      const sql = `SELECT * FROM ncr WHERE DATE(info_date) = ? ORDER BY info_date DESC`;
      db.query(sql, [date], (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res.status(200).json({ code: 200, message: "Success", data: result });
      });
    }
  },

  getOperator: (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please input name" });
    }

    const sql = `SELECT * FROM ncr WHERE pic = ? ORDER BY info_date DESC`;
    db.query(sql, [name], (err, result) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      res.status(200).json({ code: 200, message: "Success", data: result });
    });
  },

  chartData: (req, res) => {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Please input type" });
    }

    if (type === "daily") {
      const sql = `SELECT * FROM final_inspection ORDER BY inspection_date ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        const totals = {};

        result.forEach((item) => {
          const date = new Date(item.inspection_date)
            .toISOString()
            .split("T")[0];
          if (!totals[date]) {
            totals[date] = 0;
          }

          totals[date] += item.total;
        });

        // Mengubah hasil menjadi format yang diinginkan
        const totalData = Object.entries(totals).map(
          ([inspection_date, total]) => ({
            inspection_date,
            total,
          })
        );
        res
          .status(200)
          .json({ code: 200, message: "Success", data: totalData });
      });
    }
    
    if (type === "operator") {
      const sql = `SELECT * FROM final_inspection ORDER BY inspection_date ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        const totals = {};

        result.forEach((item) => {
          const date = new Date(item.inspection_date)
            .toISOString()
            .split("T")[0];
          if (!totals[date]) {
            totals[date] = 0;
          }

          totals[date] += item.total;
        });

        // Mengubah hasil menjadi format yang diinginkan
        const totalData = Object.entries(totals).map(
          ([inspection_date, total]) => ({
            inspection_date,
            total,
          })
        );
        res
          .status(200)
          .json({ code: 200, message: "Success", data: totalData });
      });
    }
  },

  create: async (req, res) => {
    try {
      const { info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish } = req.body

      if (!info_date) {
        return res
          .status(400)
          .json({ code: 400, message: "Info date are required" });
      }
      if (!department_section) {
        return res
          .status(400)
          .json({ code: 400, message: "Dept/Section are required" });
      }
      if (!problem) {
        return res
          .status(400)
          .json({ code: 400, message: "Problem are required" });
      }
      if (!source) {
        return res
          .status(400)
          .json({ code: 400, message: "Source are required" });
      }
      if (!item) {
        return res
          .status(400)
          .json({ code: 400, message: "Item are required" });
      }
      if (!customer) {
        return res
          .status(400)
          .json({ code: 400, message: "Customer are required" });
      }
      if (!description) {
        return res
          .status(400)
          .json({ code: 400, message: "Description are required" });
      }
      if (!cause) {
        return res
          .status(400)
          .json({ code: 400, message: "Cause are required" });
      }
      if (!countermeasure) {
        return res
          .status(400)
          .json({ code: 400, message: "countermeasure are required" });
      }
      if (!form_type) {
        return res
          .status(400)
          .json({ code: 400, message: "Form type are required" });
      }
      if (!pic) {
        return res
          .status(400)
          .json({ code: 400, message: "PIC are required" });
      }
      if (!start_date) {
        return res
          .status(400)
          .json({ code: 400, message: "Start Date are required" });
      }
      if (!progress) {
        return res
          .status(400)
          .json({ code: 400, message: "Progress are required" });
      }
      if (!target_due) {
        return res
          .status(400)
          .json({ code: 400, message: "Target due are required" });
      }
      if (!actual_finish) {
        return res
          .status(400)
          .json({ code: 400, message: "Actual finish are required" });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      const menit = differenceInMinutes(endDate, startDate);

      const persen = Math.round((total / ((target / 480) * menit)) * 100);

      const sql = `INSERT INTO ncr (info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }
          console.log(err)

          res
            .status(201)
            .json({ code: 201, message: "Success create NCR" });
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
      const sql = `DELETE FROM ncr WHERE id = ?`;

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

module.exports = NCR;
