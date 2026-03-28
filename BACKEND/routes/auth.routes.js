const express = require("express");
const {
    registerUser,
    registerAdmin,
    loginUser,
    logoutUser,
    getMe,
} = require("../controllers/auth.controller");
const protect = require("../middleware/protect.middleware");
const authorize = require("../middleware/authorize.middleware");

const authRouter = express.Router();

authRouter.post("/register", registerUser);

authRouter.post(
    "/admin/register",
    protect,
    authorize("admin"),
    registerAdmin
);

authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get("/me", protect, getMe);

module.exports = authRouter;