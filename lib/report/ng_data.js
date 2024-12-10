const ExcelJS = require("exceljs");
const NgData = require("../../models/NGModel"); // Import your Mongoose model
const Production = require("../../models/ProductionModel"); // Import your Production model

const NgDataController = {
  get: async (req, res) => {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ message: "Please input date or type" });
      }

      let result;
      if (date === "all") {
        result = await NgData.find().sort({ ncr_date: -1 });
      } else {
        result = await NgData.find({
          ncr_date: { $gte: new Date(date) },
        }).sort({ ncr_date: -1 });
      }

      console.log("Response:", { code: 200, message: "Success", data: result });
      res.status(200).json({ code: 200, message: "Success", data: result });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getOperator: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Please input name" });
      }

      const result = await NgData.find({ operator: name }).sort({
        ncr_date: -1,
      });

      console.log("Response:", { code: 200, message: "Success", data: result });
      res.status(200).json({ code: 200, message: "Success", data: result });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },

  chartData: async (req, res) => {
    try {
      const { type } = req.query;

      if (!type) {
        return res.status(400).json({ message: "Please input type" });
      }

      if (type === "pcs") {
        const result = await NgData.aggregate([
          {
            $group: {
              _id: { customer: "$customer", month: "$month" },
              ng: { $sum: "$ng_quantity" },
            },
          },
          { $sort: { "_id.month": 1 } },
        ]);

        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const structuredData = result.reduce((acc, item) => {
          const customer = item._id.customer;
          const monthIndex = item._id.month - 1;
          const monthName = months[monthIndex];
          const ng = item.ng;

          let customerData = acc.find((c) => c.customer === customer);
          if (!customerData) {
            customerData = {
              customer,
              Jan: 0,
              Feb: 0,
              Mar: 0,
              Apr: 0,
              May: 0,
              Jun: 0,
              Jul: 0,
              Aug: 0,
              Sep: 0,
              Oct: 0,
              Nov: 0,
              Dec: 0,
            };
            acc.push(customerData);
          }

          customerData[monthName] = ng;
          return acc;
        }, []);

        console.log("Response:", {
          code: 200,
          message: "Success",
          data: structuredData,
        });
        res
          .status(200)
          .json({ code: 200, message: "Success", data: structuredData });
      }

      if (type === "monthly") {
        // Melakukan agregasi menggunakan MongoDB
        NgData.aggregate([
          {
            $group: {
              _id: { customer: "$customer", month: "$month" },
              ng_quantity: { $sum: "$ng_quantity" },
              value: { $sum: "$value" }
            }
          },
          {
            $sort: { "_id.month": 1 } // Mengurutkan berdasarkan bulan
          }
        ])
          .then(result => {
            // Pastikan result valid dan ada data yang dihasilkan
            if (!result || !Array.isArray(result) || result.length === 0) {
              return res.status(404).json({ message: "Data tidak ditemukan" });
            }

            console.log(result); // Untuk memeriksa data hasil agregasi

            // Daftar bulan dalam format yang kita inginkan
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthData = [];
            const customerColors = {}; // Menyimpan warna unik untuk setiap customer

            // Menyiapkan data untuk setiap bulan
            monthNames.forEach(monthName => {
              monthData.push({
                month: monthName,
                data: [] // Menyimpan data untuk bulan tertentu
              });
            });

            result.forEach(item => {
              // Memastikan bahwa item._id memiliki nilai yang valid
              const { customer, month } = item._id;
              const ng_quantity = item.ng_quantity || 0;
              const value = item.value || 0;
              const monthName = monthNames[month - 1]; // Konversi bulan dari angka ke singkatan bulan

              if (!monthName) {
                console.error(`Bulan tidak valid untuk data: ${month}`);
                return; // Jika bulan tidak valid, lewati item ini
              }

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
                    ng_quantity,
                    value,
                    percent,
                    fill: customerColors[customer]
                  });
                }
              }
            });

            // Filter bulan yang tidak memiliki data (data array kosong)
            const filteredMonthData = monthData.filter(month => month.data && month.data.length > 0);

            if (filteredMonthData.length === 0) {
              return res.status(404).json({ message: "Tidak ada data bulan yang valid" });
            }

            // Kirimkan response
            res.status(200).json({ code: 200, message: "Success", data: filteredMonthData });
          })
          .catch(err => {
            console.error(err); // Log error di server untuk debugging
            res.status(500).json({ message: err.message });
          });
      }

      if (type === "persen") {
        try {
          // Melakukan agregasi menggunakan MongoDB dengan async/await
          const result = await NgData.aggregate([
            {
              $group: {
                _id: { customer: "$customer", month: "$month" },
                ng: { $sum: "$ng_quantity" },
                value: { $sum: "$value" }
              }
            },
            {
              $sort: { "_id.month": 1 } // Mengurutkan berdasarkan bulan
            }
          ]);

          console.log(result);

          // Daftar bulan dalam format yang kita inginkan
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

          // Membentuk struktur data sesuai dengan permintaan
          const structuredData = [];

          // Inisialisasi data untuk setiap customer
          result.forEach(item => {
            const { customer, month } = item._id;
            const ng = item.ng || 0;
            const value = item.value || 0;

            // Logika untuk menghitung persen
            let percent = 0; // Default to 0 if no calculation is made
            if (value !== 0) {
              percent = Math.ceil((ng / value) * Math.pow(10, 4)) / Math.pow(10, 4); // Membulatkan ke atas dengan 4 angka desimal
            }

            // Mencari apakah customer sudah ada di structuredData
            let customerData = structuredData.find(c => c.customer === customer);

            if (!customerData) {
              // Jika customer belum ada, tambahkan customer baru dengan semua bulan di-set ke 0
              customerData = {
                customer: customer,
                Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
                Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
              };
              structuredData.push(customerData);
            }

            // Mengonversi bulan yang disimpan dalam format angka (misalnya 1 untuk Jan) ke nama bulan
            const monthIndex = parseInt(month) - 1; // Jika bulan dalam format angka 1-12
            if (monthIndex >= 0 && monthIndex < 12) {
              customerData[months[monthIndex]] = percent;
            }
          });

          // Mengisi bulan yang belum ada datanya dengan 0
          structuredData.forEach(customerData => {
            months.forEach(month => {
              if (customerData[month] === undefined) {
                customerData[month] = 0;
              }
            });
          });

          // Menampilkan hasil
          if (structuredData.length > 0) {
            res.status(200).json({ code: 200, message: "Success", data: structuredData });
          } else {
            res.status(404).json({ code: 404, message: "Data not found" });
          }
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }



    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },

  tableData: async (req, res) => {
    const { type } = req.query;

    try {
      if (type === "ng") {
        // Aggregation for NG data
        const ngData = await NgData.aggregate([
          {
            $group: {
              _id: {
                product_name: "$product_name",
                ng_type: "$ng_type",
                month: "$month",
              },
              total: { $sum: "$ng_quantity" },
            },
          },
          {
            $sort: { "_id.month": 1 },
          },
        ]);

        // Grouping data by product_name and ng_type
        const groupedData = ngData.reduce((acc, item) => {
          const { product_name, ng_type, month } = item._id;
          const ngQuantity = item.total;

          // Find or create product entry
          let product = acc.find(
            (p) => p.part_name === product_name && p.type_ng === ng_type
          );
          if (!product) {
            product = {
              part_name: product_name,
              type_ng: ng_type,
              month: Array(12)
                .fill(0)
                .map((_, index) => ({
                  month: (index + 1).toString(),
                  value: 0,
                })),
            };
            acc.push(product);
          }

          // Fill in the NG quantity for the corresponding month
          const monthIndex = parseInt(month) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            product.month[monthIndex].value = ngQuantity;
          }

          return acc;
        }, []);

        res
          .status(200)
          .json({ code: 200, message: "Success", data: groupedData });
      }

      if (type === "totalQtyNg") {
        // Fetching production data
        const productionData = await Production.find().sort({ customer: 1 });

        // Structuring the data
        const structuredData = productionData.reduce((acc, item) => {
          const { _id, part_name, customer, month, prod, ng } = item;

          // Calculate percentage
          let percent = "";
          if (prod !== 0) {
            percent =
              Math.ceil((ng / prod) * Math.pow(10, 4)) / Math.pow(10, 4);
          }

          // Find or create part entry
          let part = acc.find(
            (p) =>
              p._id == _id && p.part_name === part_name && p.customer === customer
          );
          if (!part) {
            part = {
              _id: _id,
              part_name: part_name,
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

          // Fill in the values for the corresponding month
          const monthIndex = parseInt(month) - 1;
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
      }
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
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
        ng_type,
        ng_quantity,
        operator,
        detection,
        status,
      } = req.body;

      // Validasi input
      if (!ncr_date) {
        return res.status(400).json({ code: 400, message: "NCR Date is required" });
      }
      if (!section) {
        return res.status(400).json({ code: 400, message: "Section is required" });
      }
      if (!product_name) {
        return res.status(400).json({ code: 400, message: "Product Name is required" });
      }
      if (!last_process) {
        return res.status(400).json({ code: 400, message: "Last Process is required" });
      }
      if (!customer) {
        return res.status(400).json({ code: 400, message: "Customer is required" });
      }
      if (!ng_type) {
        return res.status(400).json({ code: 400, message: "NG Type is required" });
      }
      if (!ng_quantity) {
        return res.status(400).json({ code: 400, message: "NG Quantity is required" });
      }
      if (!operator) {
        return res.status(400).json({ code: 400, message: "Operator is required" });
      }
      if (!detection) {
        return res.status(400).json({ code: 400, message: "Detection is required" });
      }
      if (!status) {
        return res.status(400).json({ code: 400, message: "Status is required" });
      }

      // Parse tanggal dengan benar
      const date = new Date(ncr_date);
      const month = date.getMonth() + 1; // Bulan dalam format 1-12
      const year = date.getFullYear();

      // Membuat data NG baru
      const newNgData = new NgData({
        ncr_date: date,
        section,
        product_name,
        last_process,
        customer,
        ng_type,
        ng_quantity,
        operator,
        detection,
        status,
        month,
        year,
      });

      // Membuat record Production baru
      const newProduction = new Production({
        part_name: product_name,
        customer,
        ng: ng_quantity,
        month,
        year,
      });

      // Simpan kedua dokumen secara paralel dan tangani error
      await Promise.all([newNgData.save(), newProduction.save()]);

      return res.status(201).json({ code: 201, message: "Successfully created NG Data" });
    } catch (err) {
      console.error("Error:", err);
      if (err.code === 11000) {
        // Menangani error duplikasi
        return res.status(409).json({
          code: 409,
          message: `Duplicate key error: ${err.message}`,
        });
      }
      return res.status(500).json({ code: 500, message: err.message });
    }
  },


  // Add other methods (update, delete, exportExcel) similarly...
  // Update method in NgDataController
  update: async (req, res) => {
    try {
      const { _id, ...updateData } = req.body; // Get the data to update from the request body

      // Validate the input
      if (!_id) {
        return res
          .status(400)
          .json({ message: "ID are required" });
      }

      // Find the document by ID and update it
      const updatedNgData = await Promise.all([NgData.findByIdAndUpdate(_id, updateData, { new: true, }), Production.findByIdAndUpdate(_id, updateData, { new: true })]);

      if (!updatedNgData) {
        return res.status(404).json({ message: "NG Data not found" });
      }

      console.log("Response:", {
        code: 200,
        message: "Success update NG Data",
        data: updatedNgData,
      });
      res.status(200).json({
        code: 200,
        message: "Success update NG Data",
        data: updatedNgData,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Delete method in NgDataController
  delete: async (req, res) => {
    try {
      const { _id } = req.params; // Get the ID from the request parameters

      // Validate the input
      if (!_id) {
        return res.status(400).json({ message: "ID is required" });
      }

      // Find the document by ID and delete it
      const deletedNgData = await Promise.all([NgData.findByIdAndDelete(_id), Production.findByIdAndDelete(_id )]);

      if (!deletedNgData) {
        return res.status(404).json({ message: "NG Data not found" });
      }

      console.log("Response:", {
        code: 200,
        message: "Success delete NG Data",
      });
      res.status(200).json({ code: 200, message: "Success delete NG Data" });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Export to Excel method in NgDataController
  exportExcel: async (req, res) => {
    try {
      const ngDataRecords = await NgData.find(); // Fetch all records

      // Create a new workbook and a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("NG Data");

      // Define columns
      worksheet.columns = [
        { header: "NCR Date", key: "ncr_date", width: 15 },
        { header: "Section", key: "section", width: 20 },
        { header: "Product Name", key: "product_name", width: 30 },
        { header: "Last Process", key: "last_process", width: 20 },
        { header: "Customer", key: "customer", width: 20 },
        { header: "NG Type", key: "ng_type", width: 20 },
        { header: "NG Quantity", key: "ng_quantity", width: 15 },
        { header: "Operator", key: "operator", width: 20 },
        { header: "Detection", key: "detection", width: 20 },
        { header: "Status", key: "status", width: 15 },
      ];

      // Add rows to the worksheet
      ngDataRecords.forEach((record) => {
        worksheet.addRow({
          ncr_date: record.ncr_date,
          section: record.section,
          product_name: record.product_name,
          last_process: record.last_process,
          customer: record.customer,
          ng_type: record.ng_type,
          ng_quantity: record.ng_quantity,
          operator: record.operator,
          detection: record.detection,
          status: record.status,
        });
      });

      // Set the response headers for downloading the file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=ng_data.xlsx");

      // Write the workbook to the response
      await workbook.xlsx.write(res);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = NgDataController;
