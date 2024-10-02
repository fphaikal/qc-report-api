const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const authMiddleware = require('../middleware/authMiddleware')
const db = require("../lib/db");
const Auth = require("../lib/auth");
const UserProfile = require("../lib/auth/userProfile");

router.post("/login", Auth.login);
router.post("/register", Auth.register);
router.get("/user", authMiddleware, UserProfile.get);
router.put("/user", UserProfile.update);

module.exports = router;