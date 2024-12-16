const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");

const Users = {
  get: async (req, res) => {
    try {
      const users = await UserModel.find().sort({ role: 1, name: 1 });
      res.status(200).json({ code: 200, message: "Success", data: users });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  },

  create: async (req, res) => {
    try {
      const { username, fullname, role, password } = req.body;

      if (!username) {
        return res.status(400).json({ code: 400, message: "username are required" });
      }

      if (!role) {
        return res.status(400).json({ code: 400, message: "Role are required" });
      }

      if (!password) {
        return res.status(400).json({ code: 400, message: "Password are required" });
      }

      const hashedPass = await bcrypt.hash(password, 10); // Hash the password
      const newUser = new UserModel({ username, fullname, role, password: hashedPass });
      await newUser.save();

      res.status(201).json({ code: 201, message: "Success create user" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  update: async (req, res) => {
    try {
      const { _id, password, ...updateFields } = req.body;

      const hashedPass = await bcrypt.hash(password, 10); // Hash the password
      const updatedUser = await UserModel.findByIdAndUpdate(
        _id,
        { password: hashedPass, ...updateFields },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ code: 404, message: "User not found" });
      }



      res.status(200).json({ code: 200, message: "Success update user" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  delete: async (req, res) => {
    try {
      const { _id } = req.params;

      const deletedUser = await UserModel.findByIdAndDelete(_id);

      if (!deletedUser) {
        return res.status(404).json({ code: 404, message: "User not found" });
      }

      res.status(200).json({ code: 200, message: "Success delete user" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  }
}

module.exports = Users;