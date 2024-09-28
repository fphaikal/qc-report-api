const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const db = require("../lib/db");
const Auth = require("../lib/auth");

router.post("/login", Auth.login);
router.post("/register", Auth.register);

module.exports = router;