const db = require("../db");

const UserProfile = {
  get: (req, res) => {
    const { username } = req.body;
    const sql = `SELECT * FROM users WHERE username = ?`;

    db.query(sql, [username], (err, result) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ code: 404, message: "User not found" });
      }

      res.status(200).json({ code: 200, message: "Success", data: result[0] });
    });
  },

  update: (req, res) => {
    const { fullname, username } = req.body;

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

    const sql = `UPDATE users SET fullname = ?, username = ? WHERE _id = ?`;

    db.query(sql, [fullname, username, req.user._id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      res.status(200).json({ code: 200, message: "Update success" });
    });
  },
};

module.exports = UserProfile;
