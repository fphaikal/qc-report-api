const jwt = require("jsonwebtoken");
const db = require("../lib/db");

const jwtSecret = '1601200716122006'; // Gantilah dengan kunci rahasia yang lebih aman

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log(token);
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  db.query("SELECT * FROM users WHERE token = ?", [token], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err });
    }

    console.log(result);

    if (result.length === 0) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next()
  })
};

module.exports = authMiddleware;
