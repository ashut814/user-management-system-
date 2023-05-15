const express = require("express");
const { homeRoutes, add_user, update_user } = require("../services/render");
const route = express.Router();
const controller = require("../controller/controller");
const adminController = require("../controller/adminController");
const auth = require("../../middleware/auth");
const Userdb = require("../model/model");
// route.get("/",homeRoutes);
route.get("/add-user", add_user);
route.get("/update-user", update_user);

//api
route.post("/api/users", controller.create);
route.get("/api/users", controller.find);
route.get("/api/users/:id", controller.find);
route.put("/api/users/:id", controller.update);
route.delete("/api/users/:id", controller.delete);

//
route.get("/verify", controller.verifyMail);

//login
// route.get("/", auth.isLogout ,controller.loginLoad);
route.get("/login", auth.isLogout, controller.loginLoad);
route.post("/login", controller.verifyLogin);
route.get("/", auth.isLogin, controller.loadHome);

// logout

route.get("/logout", auth.isLogin, controller.userLogout);

// forget password

route.get("/forget", auth.isLogout, controller.forgetLoad);
route.post("/forget", controller.forgetPassword);
route.get("/forget-password", auth.isLogout, controller.forgetPasswordLoad);
route.post("/forget-password", auth.isLogout, controller.resetPasswordLoad);


module.exports = route;
