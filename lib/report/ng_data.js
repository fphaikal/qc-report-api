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

    if (type === "pcs") {
      const sql = `SELECT customer, month, SUM(ng_quantity) AS ng FROM ng_data GROUP BY customer, month ORDER BY month ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
  
        // Daftar bulan dalam format yang kita inginkan
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
        // Membentuk struktur data sesuai dengan permintaan
        const structuredData = result.reduce((acc, item) => {
          const customer = item.customer;
          const monthIndex = parseInt(item.month) - 1; // Mengubah bulan menjadi index (0-11)
          const monthName = months[monthIndex]; // Mendapatkan nama bulan
          const ng = item.ng;
  
          // Mencari apakah customer sudah ada di acc
          let customerData = acc.find(c => c.customer === customer);
          if (!customerData) {
            // Jika belum ada, tambahkan customer baru dengan semua bulan di-set ke 0
            customerData = {
              customer: customer,
              Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
              Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
            };
            acc.push(customerData);
          }
  
          // Mengisi nilai NG untuk bulan yang sesuai
          customerData[monthName] = ng;
  
          return acc;
        }, []);
  
        res.status(200).json({ code: 200, message: "Success", data: structuredData });
      });
    }

    if(type === 'persen') {
      const sql = `SELECT customer, month, SUM(ng_quantity) AS ng, SUM(value) AS value FROM ng_data GROUP BY customer, month ORDER BY month ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
        
        console.log(result);
        // Daftar bulan dalam format yang kita inginkan
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
        // Membentuk struktur data sesuai dengan permintaan
        const structuredData = result.reduce((acc, item) => {
          const customer = item.customer;
          const monthIndex = parseInt(item.month) - 1; // Mengubah bulan menjadi index (0-11)
          const monthName = months[monthIndex]; // Mendapatkan nama bulan
          const ng = item.ng;
          const prod = item.value;
  
          // Menghitung persen dengan logika ROUNDUP dan IFERROR
          let percent = "";
          if (prod !== 0) {
            percent = Math.ceil((ng / prod) * Math.pow(10, 4)) / Math.pow(10, 4); // Membulatkan ke atas dengan 4 angka desimal
          }
  
          // Mencari apakah customer sudah ada di acc
          let customerData = acc.find(c => c.customer === customer);
          if (!customerData) {
            // Jika belum ada, tambahkan customer baru dengan semua bulan di-set ke 0
            customerData = {
              customer: customer,
              Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
              Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
            };
            acc.push(customerData);
          }
  
          // Mengisi nilai NG untuk bulan yang sesuai
          customerData[monthName] = percent;
  
          return acc;
        }, []);
  
        res.status(200).json({ code: 200, message: "Success", data: structuredData });
      });
    }
  
  },

  tableData: (req, res) => {
    const { type } = req.query;

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
          let product = acc.find(
            (p) => p.part_name === partName && p.type_ng === ngType
          );
          if (!product) {
            product = {
              part_name: partName,
              type_ng: ngType,
              month: Array(12)
                .fill(0)
                .map((_, index) => ({
                  month: (index + 1).toString(),
                  value: 0,
                })),
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

        res
          .status(200)
          .json({ code: 200, message: "Success", data: groupedData });
      });
    }

    if (type === "totalQtyNg") {
      const sql = `SELECT product_name, customer, month, value AS prod, ng_quantity AS ng FROM ng_data ORDER BY customer ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        // Membentuk struktur data baru
        const structuredData = result.reduce((acc, item) => {
          const partName = item.product_name;
          const customer = item.customer;
          const monthValue = item.month;
          const prod = item.prod;
          const ng = item.ng;

          // Menghitung persen dengan logika ROUNDUP dan IFERROR
          let percent = "";
          if (prod !== 0) {
            percent =
              Math.ceil((ng / prod) * Math.pow(10, 4)) / Math.pow(10, 4); // Membulatkan ke atas dengan 4 angka desimal
          }

          // Mencari apakah part dan customer sudah ada di acc
          let part = acc.find(
            (p) => p.part_name === partName && p.customer === customer
          );
          if (!part) {
            part = {
              part_name: partName,
              customer: customer,
              months: Array(12)
                .fill(0)
                .map((_, index) => ({
                  month: (index + 1).toString(),
                  value: [],
                })),
            };
            acc.push(part);
          }

          // Mengisi nilai untuk bulan terkait
          const monthIndex = parseInt(monthValue) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            part.months[monthIndex].value.push({
              prod: prod,
              ng: ng,
              percent: percent,
            });
          }

          return acc;
        }, []);

        res
          .status(200)
          .json({ code: 200, message: "Success", data: structuredData });
      });
    }
  },

  create: async (req, res) => {
    try {
      const {
        ncr_date,
        section,
        product_name,
        last_process,
        customer,
        value,
        ng_type,
        ng_quantity,
        operator,
        detection,
        status,
        month,
        year,
      } = req.body;

      //   const startDate = new Date(start);
      //   const endDate = new Date(end);
      //   const menit = differenceInMinutes(endDate, startDate);

      //   const persen = Math.round((total / ((target / 480) * menit)) * 100);

      const sql = `INSERT INTO ng_data (ncr_date, section, product_name, last_process, customer, value, ng_type, ng_quantity, operator, detection, status, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [
          ncr_date,
          section,
          product_name,
          last_process,
          customer,
          value,
          ng_type,
          ng_quantity,
          operator,
          detection,
          status,
          month,
          year,
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }
          console.log(err);

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
        ncr_date,
        section,
        product_name,
        last_process,
        customer,
        value,
        ng_type,
        ng_quantity,
        operator,
        detection,
        status,
        month,
        year,
      } = req.body;

      let sql = `UPDATE ng_data SET 
      ncr_date= ?, section= ?, product_name= ?, last_process= ?, customer= ?, value= ?, ng_type= ?, ng_quantity= ?, operator= ?, detection= ?, status= ?, month= ?, year= ? WHERE id= ?`;

      // Tambahkan `ncr_date` ke SQL hanya jika dikirim dalam body
      const values = [
        ncr_date,
        section,
        product_name,
        last_process,
        customer,
        value,
        ng_type,
        ng_quantity,
        operator,
        detection,
        status,
        month,
        year,
        id,
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res.status(200).json({ code: 200, message: "Success update NG Data" });
      });
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
