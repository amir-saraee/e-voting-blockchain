const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth"); // We’ll create this middleware next

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/profile", verifyToken, authController.getProfile); // New profile endpoint

module.exports = router;
