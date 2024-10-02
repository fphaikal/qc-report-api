const jwt = require("jsonwebtoken");

const jwtSecret = '1601200716122006'; // Gantilah dengan kunci rahasia yang lebih aman

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Periksa waktu saat ini
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    if (currentHour === 3 && currentMinutes === 0) {
      return res.status(403).json({ message: "Token has expired" });
    }

    req.user = decoded; // Menyimpan data user di request
    next();
  });
};

module.exports = authMiddleware;
