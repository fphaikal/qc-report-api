const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // Import your User model

const jwtSecret = '1601200716122006'; // Gantilah dengan kunci rahasia yang lebih aman

const authMiddleware = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Find the user by the ID in the token
    const user = await User.findById(decoded.id);

    if (!user || user.token !== token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach the user to the request object
    req.user = user;

    // Call the next middleware
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
