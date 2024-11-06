const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = "1601200716122006"; // Gantilah dengan kunci rahasia yang lebih aman
const User = require("../../models/UserModel"); // Import your User model

const Auth = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username) {
        return res.status(400).json({ code: 400, message: "Username are required" });
      }

      if (!password) {
        return res.status(400).json({ code: 400, message: "Password are required" });
      }

      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).json({ code: 400, message: "Invalid username or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ code: 400, message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user._id, username: user.username },
        jwtSecret,
        { expiresIn: "1h" }
      );

      user.token = token; // Store the token in user document
      await user.save(); // Save the updated user with the token

      await res.status(200).json({
        code: 200,
        message: "Login success",
        token: token,
        data: user,
      });

    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  logout: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ code: 400, message: "Token are required" });
      }

      const user = await User.findOne({ token });

      if (!user) {
        return res.status(400).json({ code: 400, message: "Invalid token" });
      }

      user.token = null; // Clear the token
      await user.save(); // Save the updated user

      res.status(200).json({ code: 200, message: "Logout success" });
      console.log(`Logout success`);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  register: async (req, res) => {
    try {
      const { fullname, username, password } = req.body;

      if (!username) {
        return res.status(400).json({ code: 400, message: "Username are required" });
      }

      if (!password) {
        return res.status(400).json({ code: 400, message: "Password are required" });
      }

      const hashedPass = await bcrypt.hash(password, 10); // Hash the password
      const newUser = new User({
        fullname,
        username,
        password: hashedPass,
      });

      await newUser.save(); // Save the new user

      res.status(200).json({
        code: 200,
        message: "Register success",
        id: newUser._id,
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: "Server error", error });
    }
  },

  validation: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ code: 400, message: "Token are required" });
      }

      const user = await User.findOne({ token });

      if (!user) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      res.status(200).json({ code: 200, message: "Authorized" });
    } catch (error) {
      return res.status(500).json({ code: 500, message: "Server error", error });
    }
  },
};

module.exports = Auth;
