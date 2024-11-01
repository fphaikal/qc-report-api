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
        // Similar aggregation for monthly data
        // Adjust the aggregation pipeline according to your needs
      }

      if (type === "persen") {
        // Similar aggregation for percentage data
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
          const { id, part_name, customer, month, prod, ng } = item;

          // Calculate percentage
          let percent = "";
          if (prod !== 0) {
            percent =
              Math.ceil((ng / prod) * Math.pow(10, 4)) / Math.pow(10, 4);
          }

          // Find or create part entry
          let part = acc.find(
            (p) =>
              p.id == id && p.part_name === part_name && p.customer === customer
          );
          if (!part) {
            part = {
              id: id,
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

      // Validation
      if (
        !ncr_date ||
        !section ||
        !product_name ||
        !last_process ||
        !customer ||
        !ng_type ||
        !ng_quantity ||
        !operator ||
        !detection ||
        !status
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const date = new Date(ncr_date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // Create new NG Data
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

      // Create new Production record
      const newProduction = new Production({
        part_name: product_name,
        customer,
        ng: ng_quantity,
        month,
        year,
      });

      // Save both documents
      await Promise.all([newNgData.save(), newProduction.save()]);

      console.log("Response:", {
        code: 201,
        message: "Success create NG Data",
      });
      res.status(201).json({ code: 201, message: "Success create NG Data" });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // Add other methods (update, delete, exportExcel) similarly...
  // Update method in NgDataController
  update: async (req, res) => {
    try {
      const { id } = req.params; // Get the ID from the request parameters
      const updateData = req.body; // Get the data to update from the request body

      // Validate the input
      if (!id || !updateData) {
        return res
          .status(400)
          .json({ message: "ID and update data are required" });
      }

      // Find the document by ID and update it
      const updatedNgData = await NgData.findByIdAndUpdate(id, updateData, {
        new: true,
      });

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
      const { id } = req.params; // Get the ID from the request parameters

      // Validate the input
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      // Find the document by ID and delete it
      const deletedNgData = await NgData.findByIdAndDelete(id);

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
