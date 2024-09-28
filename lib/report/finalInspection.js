const db = require("../db");

const FinalInspection = {
  get: (req, res) => {
    const sql = `SELECT * FROM final_inspection`;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      res.status(200).json({ code: 200, message: "Success", data: result });
    });
  },

  create: (req, res) => {
    const { name_part, process, operator, target, total, ok, ng, jenis_ng, inspection_date } = req.body;
    const sql = `INSERT INTO final_inspection (name_part, process, operator, target, total, ok, ng, jenis_ng, inspection_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [name_part, process, operator, target, total, ok, ng, jenis_ng, inspection_date],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res
          .status(201)
          .json({ code: 201, message: "Success create final inspection" });
      }
    );
  },

  update: (req, res) => {
    const { id, name_part, process, operator, target, total, ok, ng, jenis_ng, inspection_date } = req.body;
    const sql = `UPDATE final_inspection SET name_part = ?, process = ?, operator = ?, tagert = ?, total = ?, ok = ?, ng = ?, jenis_ng = ?, inspection_date = ? WHERE id = ?`;

    db.query(
      sql,
      [id, name_part, process, operator, target, total, ok, ng, jenis_ng, inspection_date],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res
          .status(200)
          .json({ code: 200, message: "Success update final inspection" });
      }
    );
  },

  delete: (req, res) => {
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
  },
};

module.exports = FinalInspection;
