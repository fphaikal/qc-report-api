const db = require("../db");
const { differenceInMinutes } = require("date-fns");

const Parts = {
  get: (req, res) => {
    const sql = `SELECT * FROM parts ORDER BY customer ASC`;

    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      res.status(200).json({ code: 200, message: "Success", data: result });
    });
  },


  create: async (req, res) => {
    try {
      const { part, customer } = req.body

      if (!part) {
        return res
          .status(400)
          .json({ code: 400, message: "Part name are required" });
      }
      if (!customer) {
        return res
          .status(400)
          .json({ code: 400, message: "Customer are required" });
      }

      const sql = `INSERT INTO parts (part, customer) VALUES (?, ?)`;

      db.query(
        sql,
        [part, customer],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }
          console.log(err)

          res
            .status(201)
            .json({ code: 201, message: "Success create part" });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error", error });
    }
  },

  update: (req, res) => {
    try {
      const { part, customer, id
      } = req.body;

      const sql = `UPDATE parts SET part = ?, customer = ? WHERE id = ?`;

      db.query(
        sql,
        [part, customer, id],
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
      console.log(error);
      return res.status(500).json({ message: "Server error", error });
    }
  },

  delete: (req, res) => {
    try {
      const { id } = req.params;
      const sql = `DELETE FROM parts WHERE id = ?`;

      db.query(sql, [id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res
          .status(200)
          .json({ code: 200, message: "Success delete part" });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },
};

module.exports = Parts;
