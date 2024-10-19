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
      const { info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish, id
      } = req.body;

      const sql = `UPDATE ncr SET 
      info_date = ?, department_section = ?, problem = ?, source = ?, 
      item = ?, customer = ?, description = ?, cause = ?, 
      countermeasure = ?, form_type = ?, pic = ?, start_date = ?, 
      progress = ?, target_due = ?, actual_finish = ?
      WHERE id = ?`;

      db.query(
        sql,
        [info_date, department_section, problem, source, item, customer, description, cause, countermeasure, form_type, pic, start_date, progress, target_due, actual_finish, id
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
      console.log(error);
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

module.exports = Parts;
