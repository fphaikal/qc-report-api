const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { initializeWhatsAppBot } = require("../waBot");
const jwtSecret = "1601200716122006"; // Gantilah dengan kunci rahasia yang lebih aman
const { format } = require("date-fns");

const Auth = {
  login: async (req, res) => {
    const client = initializeWhatsAppBot();
    const chatId = '6285765909380@c.us'
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
        if (password !== user.password) {
          return res
            .status(400)
            .json({ code: 400, message: "Invalid password" });
        }
        // const match = await bcrypt.compare(password, user.password); // Tunggu hasil bcrypt.compare
        // if (!match) {
        //   return res
        //     .status(400)
        //     .json({ code: 400, message: "Invalid password" });
        // }

        const token = jwt.sign(
          { id: user.id, username: user.username },
          jwtSecret,
          { expiresIn: "1h" }
        );
        const addToken = `UPDATE users SET token = ? WHERE username = ?`;

        db.query(addToken, [token, username], async (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }

          await res.status(200).json({
            code: 200,
            message: "Login success",
            token: token,
            data: user,
          });
        });
        console.log(user)
        const date = new Date()
        await client.sendMessage(chatId, '*QC Report Denapella :* ' + user.fullname + ' berhasil login pada ' + format(date, 'dd/MM/yyyy HH:mm:ss'))
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  logout: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(400)
          .json({ code: 400, message: "Token are required" });
      }

      const sql = `UPDATE users SET token = NULL WHERE token = ?`;

      db.query(sql, [token], (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        res.status(200).json({ code: 200, message: "Logout success" });
        console.log(`Logout success`);
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
          .json({ code: 400, message: "Employee id are required" });
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
      const sql = `INSERT INTO users (employee_id, fullname, username, password) VALUES (?, ?, ?, ?)`;

      db.query(
        sql,
        [idPegawai, fullname, username, hashedPass],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: err });
          }
          res.status(200).json({
            code: 200,
            message: "Register success",
            id: result.insertId,
          });
        }
      );
    } catch (error) {
      return res
        .status(500)
        .json({ code: 500, message: "Server error", error });
    }
  },
};

module.exports = Auth;
