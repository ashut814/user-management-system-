const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../../config");
const bodyparser = require("body-parser");
const adminController = require("../controller/adminController");
const auth = require('../../middleware/adminAuth');

admin_route.use(bodyparser.json());
admin_route.use(bodyparser.urlencoded({ extended: true }));

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.use(session({ secret: config.SESSION_SECRET }));

admin_route.get("/", auth.isLogout , adminController.loadLogin);

admin_route.post("/", adminController.verifyLogin);
admin_route.get("/home", auth.isLogin , adminController.loadDashboard);

// admin_route.get("/dashboard", auth.isLogin, adminController.adminDashboard);
admin_route.get("/add-user", auth.isLogin, adminController.addUser);
admin_route.post("/add-user",  adminController.addUserLoad);

//
admin_route.get('/edit', auth.isLogin, adminController.updateUser);
admin_route.post("/edit", auth.isLogin, adminController.updateUserLoad);

//
admin_route.get("/delete", auth.isLogin, adminController.deleteUser);


admin_route.get('/logout', auth.isLogin , adminController.logout);

admin_route.get('/forget', auth.isLogout, adminController.forgetLoad);
admin_route.post("/forget",adminController.forgetVerify);
admin_route.get('/forget-password', auth.isLogout, adminController.forgetPasswordLoad);
admin_route.post("/forget-password", adminController.resetPassword);

admin_route.get("*", function (req, res) {
  res.redirect("/admin");
});

module.exports = admin_route;
