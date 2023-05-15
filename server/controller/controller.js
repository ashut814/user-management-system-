let Userdb = require("../model/model");
const bycrpt = require("bcryptjs");
const nodemailer = require("nodemailer");
const session = require("express-session");
const randomstring = require("randomstring");
const config = require("../../config");
const axios = require("axios");

/*--------------------------- securing password ------------------------------------------*/

exports.securePassword = async (password) => {
  try {
    const passwordHash = await bycrpt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
  }
};

/*-------------------------------for sending mail -----------------------------------*/
exports.sendVerifyMail = async (name, email, user_id) => {
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
      subject: "For verification mail",
      html:
        "<p> hii " +
        name +
        ', please click here to <a href="http://127.0.0.1:3000/verify/?id=' +
        user_id +
        '">verify your email</a>.</p>',
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

/*----------------------------login user method -----------------------------------*/
exports.loginLoad = async (req, res) => {
  try {
    res.render("login.ejs");
  } catch (error) {
    console.log(error.message);
  }
};

/*--------------------------- verify login ------------------------------------------*/

exports.verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await Userdb.findOne({ email: email });
    if (userData) {
      const passMatch = await bycrpt.compare(password, userData.password);
      if (passMatch) {
        if (userData.is_verified === 0) {
          res.render("login", {
            message: "verify your mail",
          });
        } else {
          // console.log("userdb contains :", userData.id);
          req.session.user_id = userData.id;
          // console.log(req.session);
          console.log("response is:", req.session);
          res.redirect("/");
        }
      } else {
        res.render("login", {
          message: "email and password are incorrect",
        });
      }
    } else {
      res.render("login", { message: "email and password are incorrect" });
    }
  } catch (error) {
    console.log(error);
  }
};

/*------------------------------ Loading home -------------------------------------------*/

// exports.loadHome = (req, res) => {
//   axios
//     .get("http://localhost:3000/api/users")
//     .then(function (response) {
//       res.render("index", { users: response.data });
//     })
//     .catch((err) => {
//       res.send(err);
//     });
// };

exports.loadHome = (req, res) => {
  Userdb.find({})
    .then((users) => {
      const isAdmin = req.user && req.user.is_admin;
      res.render("index", {
        users: users,
        isAdmin: isAdmin,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};
/*----------------------------- Logout ----------------------------------------------------*/

exports.userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

/*-------------------------- forget load ----------------------------------------------*/

exports.forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

/*----------------------------- sending reset mail -----------------------------------------*/
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
        ', please click here to <a href="http://127.0.0.1:3000/forget-password?token=' +
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

/*----------------------------- Forget password function ---------------------------------*/

exports.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    console.log("Email is:", email);

    const userData = await Userdb.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      if (userData.is_verified === 0) {
        res.render("forget", { message: "Please verify your email" });
      } else {
        const updatedData = await Userdb.updateOne(
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
      res.render("forget", { message: "Incorrect email" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

/*------------------------------ forget password load function ------------------------*/

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

/*---------------------------- reset password --------------------------------------------*/

exports.resetPasswordLoad = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.query.user_id;
    const secure_password = await this.securePassword(password);
    const updatedData = await Userdb.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: "" } }
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

/*------------------------------ create and save new user ----------------------------------*/
exports.create = async (req, res) => {
  try {
    // validate request
    if (!req.body) {
      res.status(400).send({ message: "Content can not be emtpy!" });
      return;
    }
    const sPassword = await exports.securePassword(req.body.password);

    // new user
    const user = new Userdb({
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      status: req.body.status,
      password: sPassword,
      is_admin: false,
    });

    // save user in the database
    const userData = await user.save(user);
    if (userData) {
      exports.sendVerifyMail(req.body.name, req.body.email, userData.id);
      res.redirect("/add-user");
    } else {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating a create operation",
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

/*--------------------------------- sending verification email ------------------------------------------*/

exports.verifyMail = async (req, res) => {
  try {
    const updatedInfo = await Userdb.updateOne(
      { _id: req.query.id },
      {
        $set: {
          is_verified: 1,
        },
      }
    );
    console.log(updatedInfo);
    res.render("email-verified");
  } catch (error) {
    console.log(error);
  }
};

/*------------ retrieve and return all users/ retrive and return a single user --------------*/

exports.find = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    Userdb.findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Not found user with id " + id });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: "Erro retrieving user with id " + id });
      });
  } else {
    Userdb.find()
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error Occurred while retriving user information",
        });
      });
  }
};

/*------------ Update a new idetified user by user id --------------------------*/

exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  }

  // Validate name input
  const nameRegex = /^[a-zA-Z\s]*$/; // Regular expression to match alphabets and spaces only
  if (!nameRegex.test(req.body.name)) {
    return res
      .status(400)
      .send({ message: "Name must contain only alphabets and spaces" });
  }

  // Validate email input
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to match valid email format
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).send({ message: "Invalid email format" });
  }
  const id = req.params.id;
  try {
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).send({
        message: `Cannot Update user with ${id}. Maybe user not found!`,
      });
    }
    const updatedUser = await Userdb.findByIdAndUpdate(id, req.body, {
      useFindAndModify: false,
    });
    res.send(updatedUser);
  } catch (err) {
    res.status(500).send({ message: "Error Update user information" });
  }
};

/*------------------------ deletimg user ---------------------------------------*/

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await Userdb.findById(id);
    if (!user) {
      return res.status(404).send({ message: `User with id ${id} not found` });
    }
    await Userdb.findByIdAndDelete(id);
    res.send({ message: `User with id ${id} was deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Could not delete user with id ${id}` });
  }
};
