const db = require("../db");
const bcrypt = require("bcrypt");

const Auth = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username) {
        return res
          .status(400)
          .json({ code: 400, message: "Username are required" });
      }

      if (!password) {
        return res
          .status(400)
          .json({ code: 400, message: "Password are required" });
      }

      const sql = `SELECT * FROM users WHERE username = ?`;

      db.query(sql, [username], async (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
        if (result.length === 0) {
          return res
            .status(400)
            .json({ code: 400, message: "Invalid username or password" });
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password); // Tunggu hasil bcrypt.compare
        if (!match) {
          return res
            .status(400)
            .json({ code: 400, message: "Invalid username or password" });
        }

        res
          .status(200)
          .json({ code: 200, message: "Login success", id: user });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  register: async (req, res) => {
    try {
      const { idPegawai, fullname, username, password } = req.body;

      if (!idPegawai) {
        return res
          .status(400)
          .json({ code: 400, message: "ID Pegawai are required" });
      }

      if (!fullname) {
        return res
          .status(400)
          .json({ code: 400, message: "Fullname are required" });
      }

      if (!username) {
        return res
          .status(400)
          .json({ code: 400, message: "Username are required" });
      }

      if (!password) {
        return res
          .status(400)
          .json({ code: 400, message: "Password are required" });
      }

      const hashedPass = await bcrypt.hash(password, 10); // Tunggu hasil bcrypt.hash
      const sql = `INSERT INTO users (id_employee, fullname, username, password) VALUES (?, ?, ?, ?)`;

      db.query(sql, [idPegawai, fullname, username, hashedPass], (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
        res
          .status(200)
          .json({
            code: 200,
            message: "Register success",
            id: result.insertId,
          });
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: "Server error", error });
    }
  }
}

module.exports = Auth; 