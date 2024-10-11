const db = require("../db");
const { differenceInMinutes } = require("date-fns");

const FinalInspection = {
  get: (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please input date or type" });
    }

    if (date === "all") {
      const sql = `SELECT * FROM ng_data ORDER BY ncr_date DESC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res.status(200).json({ code: 200, message: "Success", data: result });
      });
    }

    if (date !== "all") {
      const sql = `SELECT * FROM ng_data WHERE DATE(ncr_date) = ? ORDER BY ncr_date DESC`;
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

    const sql = `SELECT * FROM ng_data WHERE operator = ? ORDER BY ncr_date DESC`;
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
      const sql = `SELECT * FROM ng_data ORDER BY ncr_date ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        const totals = {};

        result.forEach((item) => {
          const date = new Date(item.ncr_date)
            .toISOString()
            .split("T")[0];
          if (!totals[date]) {
            totals[date] = 0;
          }

          totals[date] += item.total;
        });


        // Mengubah hasil menjadi format yang diinginkan
        const totalData = Object.entries(totals).map(
          ([ncr_date, total]) => ({
            ncr_date,
            total,
          })
        );
        res
          .status(200)
          .json({ code: 200, message: "Success", data: totalData });
      });
    }

    if (type === "operator") {
      const sql = `SELECT * FROM ng_data WHERE DATE(ncr_date) = CURDATE() ORDER BY ncr_date ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
  
        if (result.length === 0) {
          return res.status(200     ).json({ message: "No data for today", data: [] });
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
  
    if (type === "ng") {
      const sql = `SELECT product_name, ng_type, month, SUM(ng_quantity) AS total FROM ng_data GROUP BY product_name, ng_type, month ORDER BY month ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
  
        // Mengelompokkan data berdasarkan product_name dan ng_type
        const groupedData = result.reduce((acc, item) => {
          const partName = item.product_name;
          const ngType = item.ng_type;
          const monthValue = item.month;
          const ngQuantity = item.total;
  
          // Mencari produk dan tipe NG
          let product = acc.find(p => p.part_name === partName && p.type_ng === ngType);
          if (!product) {
            product = {
              part_name: partName,
              type_ng: ngType,
              month: Array(12).fill(0).map((_, index) => ({ month: (index + 1).toString(), value: 0 }))
            };
            acc.push(product);
          }
  
          // Mengisi nilai NG berdasarkan bulan
          const monthIndex = parseInt(monthValue) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            product.month[monthIndex].value = ngQuantity;
          }
  
          return acc;
        }, []);
  
        res.status(200).json({ code: 200, message: "Success", data: groupedData });
      });
    }
  },

  create: async (req, res) => {
    try {
      const {
        ncr_date, section, product_name, last_process, customer, value, ng_type, ng_quantity, operator, detection, status, month, year
      } = req.body;

    //   const startDate = new Date(start);
    //   const endDate = new Date(end);
    //   const menit = differenceInMinutes(endDate, startDate);

    //   const persen = Math.round((total / ((target / 480) * menit)) * 100);

      const sql = `INSERT INTO ng_data (ncr_date, section, product_name, last_process, customer, value, ng_type, ng_quantity, operator, detection, status, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [
          ncr_date, section, product_name, last_process, customer, value, ng_type, ng_quantity, operator, detection, status, month, year
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
        ncr_date, section, product_name, last_process, customer, value, ng_type, ng_quantity, operator, detection, status, month, year
      } = req.body;

      let sql = `UPDATE ng_data SET 
      ncr_date= ?, section= ?, product_name= ?, last_process= ?, customer= ?, value= ?, ng_type= ?, ng_quantity= ?, operator= ?, detection= ?, status= ?, month= ?, year= ? WHERE id= ?`;

      // Tambahkan `ncr_date` ke SQL hanya jika dikirim dalam body
      const values = [
        ncr_date, section, product_name, last_process, customer, value, ng_type, ng_quantity, operator, detection, status, month, year, id
      ];

      db.query(
        sql, values,
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }

          res
            .status(200)
            .json({ code: 200, message: "Success update NG Data" });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  delete: (req, res) => {
    try {
      const { id } = req.params;
      const sql = `DELETE FROM ng_data WHERE id = ?`;

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
