const mongoose = require("mongoose");
const validator = require("validator");

// const schema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     unique: true,
//     required: true,
//     validate: {
//       validator: validator.isEmail, // validate email using isEmail method from validator package
//       message: "Email is not valid",
//     },
//   },
//   is_admin: {
//     type: Boolean,
//     default: false,
//   },
//   password: {
//     type: String,
//     required: true,
//     trim: true,
//     minLength:8
//   },
//   is_verified: {
//     type: Number,
//     default: 0,
//   },
//   token: {
//     type: String,
//     default: "",
//   },
//   gender: String,
//   status: String,
// });

// const Userdb = mongoose.model("user", schema);
// module.exports = Userdb;

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: validator.isEmail,
      message: "Email is not valid",
    },
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
    default: "",
  },
  gender: String,
  status: String,
});

const Userdb = mongoose.model("user", schema);

module.exports = Userdb;
