const userdb = require("../model/model");
const bycrpt = require("bcryptjs");
const randomstring = require("randomstring");
const config = require("../../config");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { verifyMail } = require("./controller");
const { name } = require("ejs");
exports.loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

exports.sendResetPasswordMail = async (name, email, token, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Reset Password",
      html:
        "<p>Hi " +
        name +
        ', please click here to <a href="http://127.0.0.1:3000/admin/forget-password?token=' +
        token +
        "&user_id=" +
        user_id +
        '">reset your password</a>.</p>',
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email has been sent -- ", info.response);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log("email , pass", email, password);
    const userData = await userdb.findOne({ email: email });
    if (userData) {
      const passMatch = await bycrpt.compare(password, userData.password);
      if (passMatch) {
        if (!userData.is_admin) {
          console.log("userData :", userData);
          res.render("login", { message: "invalid email pass" });
        } else {
          console.log("data is:", userData);
          console.log("req session:", req.session);
          req.session.user_id = userData.id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "email password invalid" });
      }
    } else {
      res.render("login", { message: "email pass invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.adduserMail = async (name, email, password, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "admin verify your mail",
      html:
        "<p> hii " +
        name +
        ', please click here to <a href="http://127.0.0.1:3000/verify/?id=' +
        user_id +
        '">verify your email</a>.</p> <br> <b>Email:</b>' +
        email +
        "<br> <b>Password: </b>" +
        password +
        "",
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("email has been sent--", info.response);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
};

// exports.loadDashboard = async (req, res) => {
//   try {
//     const users = await userdb.findById(req.session.user_id);
//     console.log(userData); // add this line to check if userData is retrieved correctly
//     res.render("home", { users: users });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

exports.loadDashboard = async (req, res) => {
  try {
    const userData = await userdb.findById(req.session.user_id);
    res.render("home", { username: userData.name, users: await userdb.find() });
  } catch (error) {
    console.log(error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

exports.forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error);
  }
};

exports.forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await userdb.findOne({ email: email });
    if (userData) {
      if (!userData.is_admin) {
        res.render("forget", { message: "email is incorrect" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await userdb.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        this.sendResetPasswordMail(
          userData.name,
          userData.email,
          randomString,
          userData.id
        );
        res.render("forget", {
          message: "Please check your email to reset your password",
        });
      }
    } else {
      req.render("forget", { message: "email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const user_id = req.query.user_id;
    // console.log("Token:", token);
    console.log("User ID:", user_id);
    const tokenData = await Userdb.findOne({ token: token });
    if (tokenData) {
      res.render("forget-password", { user_id: user_id });
    } else {
      res.render("404", { message: "Invalid token" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.query.user_id;
    const secure_password = await this.securePassword(password);
    const updatedData = await Userdb.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: "" } }
    );
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

exports.adminDashboard = async (req, res) => {
  try {
    res.render("dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

exports.addUser = async (req, res) => {
  try {
    res.render("add_user");
  } catch (err) {
    console.log(err.message);
  }
};

exports.addUserLoad = async (req, res) => {
  try {
    const sPassword = await exports.securePassword(req.body.password);
    const user = new Userdb({
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      status: req.body.status,
      password: sPassword,
      is_admin: false,
    });
    const userData = await userdb.save();
    if (userData) {
      this.adduserMail(
        req.body.name,
        req.body.email,
        req.body.password,
        userData.id
      );
      res.redirect("/admin/dashboad");
    } else {
      res.render("add_user", { message: "something wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// edit

exports.updateUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await userdb.findById({ _id: id });
    if (userData) {
      console.log("userdata is:", userData); // log the user object to the console
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboad");
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const updatedUser = await Userdb.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          gender: req.body.gender,
          status: req.body.status,
        },
      }
    );
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Error updating user information" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await userdb.deleteOne({ _id: id });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error.message);
  }
};
