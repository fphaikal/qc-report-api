const db = require("../db");
const { differenceInMinutes } = require("date-fns");

const FinalInspection = {
  get: (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please input date" });
    }

    if (date === "all") {
      const sql = `SELECT * FROM final_inspection ORDER BY inspection_date DESC`;
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
      const sql = `SELECT * FROM final_inspection WHERE DATE(inspection_date) = ? ORDER BY inspection_date DESC`;
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

    const sql = `SELECT * FROM final_inspection WHERE operator = ? ORDER BY inspection_date DESC`;
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
      const sql = `SELECT * FROM final_inspection WHERE DATE(inspection_date) = CURDATE() ORDER BY inspection_date ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ message: "No data for today" });
        }
  
        // Kelompokkan data berdasarkan operator
        const operatorGroups = result.reduce((acc, item) => {
          if (!acc[item.operator]) {
            acc[item.operator] = [];
          }
          acc[item.operator].push(item);
          return acc;
        }, {});
  
        // Menghitung rata-rata persen per operator
        const operatorAverages = Object.entries(operatorGroups).map(([operator, records]) => {
          const totalPersen = records.reduce((sum, record) => sum + record.persen, 0);
          const averagePersen = totalPersen / records.length;
          return {
            operator: operator,                // Ubah menjadi "name"
            value: Number(averagePersen.toFixed(2)) // Ubah menjadi "value"
          };
        });
  
        res.status(200).json({ code: 200, message: "Success", data: operatorAverages });
      });
    }
  

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
        keterangan
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

      const sql = `INSERT INTO final_inspection (name_part, process, operator, target, start, end, total, persen, ok, ng, type_ng, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
          keterangan
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }
          console.log(err)

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
        inspection_date
      } = req.body;

      const startDate = new Date(start);
      const endDate = new Date(end);
      const menit = differenceInMinutes(endDate, startDate);

      const persen = Math.round((total / ((target / 480) * menit)) * 100);

      let sql = `UPDATE final_inspection SET name_part = ?, process = ?, operator = ?, target = ?, start = ?, end = ?, total = ?, persen = ?, ok = ?, ng = ?, type_ng = ?`;

      // Tambahkan `inspection_date` ke SQL hanya jika dikirim dalam body
      const values = [
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
        jenis_ng
      ];

      if (inspection_date) {
        sql += `, inspection_date = ?`;
        values.push(inspection_date);
      }

      sql += ` WHERE id = ?`;
      values.push(id);

      db.query(sql, values, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res.status(200).json({ code: 200, message: "Success update final inspection" });
      });
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
