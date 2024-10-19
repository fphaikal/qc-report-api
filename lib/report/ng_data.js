const db = require("../db");
const ExcelJS = require("exceljs");

const NgData = {
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

    if (type === "monthly") {
      const sql = `SELECT customer, value, ng_quantity, month FROM ng_data ORDER BY month ASC`;
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthData = [];
        const customerColors = {}; // Menyimpan warna unik untuk setiap customer

        // Menyiapkan data untuk setiap bulan
        monthNames.forEach(monthName => {
          monthData.push({
            month: monthName,
            data: []
          });
        });

        result.forEach((item) => {
          const { customer, value, ng_quantity, month } = item;
          const monthName = monthNames[month - 1]; // Konversi bulan dari angka ke singkatan bulan

          // Generate warna HSL stabil berdasarkan nama customer
          if (!customerColors[customer]) {
            const hash = Array.from(customer)
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue = hash % 360; // Hasilkan hue antara 0-359
            const fill = `hsl(${hue}, 70%, 50%)`;
            customerColors[customer] = fill;
          }

          // Hitung persentase jika data value dan ng valid
          const percent = value && ng_quantity !== null ? Math.round((ng_quantity / value) * 10000) / 100 : 0;

          // Cari bulan yang sesuai dan tambahkan data customer ke bulan tersebut
          const monthObj = monthData.find(month => month.month === monthName);
          if (monthObj) {
            // Jika customer sudah ada, akumulasikan nilai ng dan value
            const existingCustomer = monthObj.data.find(item => item.customer === customer);
            if (existingCustomer) {
              existingCustomer.ng_quantity += ng_quantity;
              existingCustomer.value += value;
              existingCustomer.percent = existingCustomer.value ? Math.round((existingCustomer.ng_quantity / existingCustomer.value) * 10000) / 100 : 0;
            } else {
              // Jika customer belum ada, tambahkan data baru
              monthObj.data.push({
                customer,
                ng_quantity: ng_quantity,
                value,
                percent,
                fill: customerColors[customer]
              });
            }
          }
        });

        // Filter bulan yang tidak memiliki data (data array kosong)
        const filteredMonthData = monthData.filter(month => month.data.length > 0);

        res.status(200).json({ code: 200, message: "Success", data: filteredMonthData });
      });
    }

    if (type === 'persen') {
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

      console.log(req.body);

      // if (!ncr_date) {
      //   return res.status(400).json({ message: "Field 'ncr_date' is required" });
      // }

      if (!section) {
        return res.status(400).json({ message: "Field 'section' is required" });
      }

      if (!product_name) {
        return res.status(400).json({ message: "Field 'product_name' is required" });
      }

      if (!last_process) {
        return res.status(400).json({ message: "Field 'last_process' is required" });
      }

      if (!customer) {
        return res.status(400).json({ message: "Field 'customer' is required" });
      }

      if (!value) {
        return res.status(400).json({ message: "Field 'value' is required" });
      }

      if (!ng_type) {
        return res.status(400).json({ message: "Field 'ng_type' is required" });
      }

      if (!ng_quantity) {
        return res.status(400).json({ message: "Field 'ng_quantity' is required" });
      }

      if (!operator) {
        return res.status(400).json({ message: "Field 'operator' is required" });
      }

      if (!detection) {
        return res.status(400).json({ message: "Field 'detection' is required" });
      }

      if (!status) {
        return res.status(400).json({ message: "Field 'status' is required" });
      }

      if (!month) {
        return res.status(400).json({ message: "Field 'month' is required" });
      }

      if (!year) {
        return res.status(400).json({ message: "Field 'year' is required" });
      }

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

  exportExcel: (req, res) => {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Please input type" });
    }
 
    if (type === "all") {
      const sql = `SELECT * FROM ng_data ORDER BY ncr_date DESC`;
      db.query(sql, async (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        // Membuat workbook baru
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('NG Data');

        // Menambahkan header
        worksheet.columns = [
          { header: 'NCR Date', key: 'ncr_date', width: 15 },
          { header: 'Section', key: 'section', width: 15 },
          { header: 'Product Name', key: 'product_name', width: 20 },
          { header: 'Customer', key: 'customer', width: 15 },
          { header: 'Last Process', key: 'last_process', width: 20 },
          { header: 'Value', key: 'value', width: 10 },
          { header: 'NG Type', key: 'ng_type', width: 15 },
          { header: 'NG Quantity', key: 'ng_quantity', width: 15 },
          { header: 'Operator', key: 'operator', width: 15 },
          { header: 'Detection', key: 'detection', width: 20 },
          { header: 'Status', key: 'status', width: 10 },
          { header: 'Month', key: 'month', width: 10 },
          { header: 'Year', key: 'year', width: 10 },
        ];

        // Menambahkan data dari result
        result.forEach((item) => {
          worksheet.addRow({
            ncr_date: item.ncr_date,
            section: item.section,
            product_name: item.product_name,
            customer: item.customer,
            last_process: item.last_process,
            value: item.value,
            ng_type: item.ng_type,
            ng_quantity: item.ng_quantity,
            operator: item.operator,
            detection: item.detection,
            status: item.status,
            month: item.month,
            year: item.year
          });
        });

        // Menambahkan styling (opsional)
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Mengatur background merah untuk kolom "Status" jika status adalah "reject"
        result.forEach((item, index) => {
          const rowIndex = index + 2; // Mulai dari baris kedua karena baris pertama adalah header
          const statusCell = worksheet.getCell(`K${rowIndex}`); // Kolom K adalah "Status"
          if (item.status === 'reject') {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF0000' } // Merah
            };
            statusCell.font = { color: { argb: 'FFFFFFFF' } }; // Warna teks putih
          }
        });

        // Mengatur response header untuk mengunduh file Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=ng-data.xlsx');

        // Menulis workbook ke response stream
        await workbook.xlsx.write(res);
        res.end();
      });
    }


    if (type === 'ng') {
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

        // Membuat workbook dan worksheet baru untuk Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Data NG berdasarkan Jenis");

        // Menambahkan judul
        worksheet.mergeCells('C1:N1');
        worksheet.getCell('C1').value = 'DATA NG BERDASARKAN JENIS';
        worksheet.getCell('C1').font = { bold: true, size: 14 };
        worksheet.getCell('C1').alignment = { horizontal: 'center' };

        // Membuat header sesuai dengan gambar
        worksheet.getRow(2).values = [
          "Part Name",
          "Jenis NG",
          ...Array(12).fill(0).map((_, index) => (index + 1).toString())
        ];

        // Mengatur lebar kolom
        worksheet.columns = [
          { key: 'part_name', width: 30 },
          { key: 'type_ng', width: 20 },
          ...Array(12).fill(0).map((_, index) => ({ key: `month_${index + 1}`, width: 10 }))
        ];

        // Mengisi data ke worksheet
        groupedData.forEach((item) => {
          const row = {
            part_name: item.part_name,
            type_ng: item.type_ng,
            ...item.month.reduce((acc, cur) => {
              acc[`month_${cur.month}`] = cur.value;
              return acc;
            }, {}),
          };
          worksheet.addRow(row);
        });

        // Mengatur styling
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(2).font = { bold: true };
        worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center' };

        // Menambahkan border ke semua sel
        worksheet.eachRow((row, rowNumber) => {
          row.eachCell((cell, colNumber) => {
            if (rowNumber > 1) { // Skip baris judul
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
          });
        });

        // Menyimpan workbook ke dalam file Excel
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=data-ng.xlsx");

        workbook.xlsx.write(res).then(() => {
          res.end();
        });
      });
    }

    if (type === "pcs") {
      const sql = `SELECT customer, month, SUM(ng_quantity) AS ng FROM ng_data GROUP BY customer, month ORDER BY month ASC`;
      db.query(sql, async (err, result) => {
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

        // Membuat workbook baru
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('NG Data');

        // Menambahkan header ke worksheet
        worksheet.columns = [
          { header: 'Customer', key: 'customer', width: 20 },
          { header: 'Jan', key: 'Jan', width: 10 },
          { header: 'Feb', key: 'Feb', width: 10 },
          { header: 'Mar', key: 'Mar', width: 10 },
          { header: 'Apr', key: 'Apr', width: 10 },
          { header: 'May', key: 'May', width: 10 },
          { header: 'Jun', key: 'Jun', width: 10 },
          { header: 'Jul', key: 'Jul', width: 10 },
          { header: 'Aug', key: 'Aug', width: 10 },
          { header: 'Sep', key: 'Sep', width: 10 },
          { header: 'Oct', key: 'Oct', width: 10 },
          { header: 'Nov', key: 'Nov', width: 10 },
          { header: 'Dec', key: 'Dec', width: 10 },
        ];

        // Menambahkan data ke worksheet
        structuredData.forEach(data => {
          worksheet.addRow(data);
        });

        // Mengatur response header untuk mengunduh file Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=ng-data.xlsx');

        // Menulis workbook ke response stream
        await workbook.xlsx.write(res);

        res.end();
      });
    }

    if (type === "monthly") {
      const sql = `SELECT customer, value, ng_quantity, month FROM ng_data ORDER BY month ASC`;
      db.query(sql, async (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const customersSet = new Set(); // Untuk menyimpan semua customer unik
        const dataMap = {}; // Menyimpan data dalam format { bulan: { customer: percent } }

        // Menyiapkan data per bulan dan customer
        result.forEach((item) => {
          const { customer, value, ng_quantity, month } = item;
          const monthName = monthNames[month - 1]; // Konversi bulan dari angka ke singkatan bulan

          if (!dataMap[monthName]) {
            dataMap[monthName] = {};
          }

          // Hitung persentase
          const percent = value && ng_quantity !== null ? Math.round((ng_quantity / value) * 10000) / 100 : 0;
          dataMap[monthName][customer] = `${percent}%`;

          // Tambahkan customer ke dalam Set
          customersSet.add(customer);
        });

        // Ubah Set ke dalam array dan urutkan customer secara alfabetis
        const customers = Array.from(customersSet).sort();

        // Membuat workbook baru
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Monthly NG Data');

        // Menambahkan header (baris 1) dengan nama customer
        const headerRow = ['Month', ...customers];
        worksheet.addRow(headerRow);

        // Menambahkan data per bulan
        monthNames.forEach(monthName => {
          const rowData = [monthName];

          // Untuk setiap customer, tambahkan data percent atau kosong jika tidak ada data
          customers.forEach(customer => {
            const percent = dataMap[monthName]?.[customer] || '';
            rowData.push(percent);
          });

          worksheet.addRow(rowData);
        });

        // Mengatur response header untuk mengunduh file Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=monthly-ng-data.xlsx');

        // Menulis workbook ke response stream
        await workbook.xlsx.write(res);

        res.end();
      });
    }

  }
};

module.exports = NgData;
